---
title: "[Kubernetes] 노드에 지속 부하 주기 — stress vs stress-ng"
date: 2025-05-19
tags: [kubernetes, stress, stress-ng, load-test, daemonset]
description: "쿠버네티스 노드에 CPU·메모리 부하를 거는 두 가지 방법(stress + DaemonSet 스크립트, stress-ng)을 비교합니다. 목표 사용률을 동적으로 유지하는 법과 간단·정밀 부하 테스트 옵션을 실무 예제로 정리합니다."
---

쿠버네티스 노드에 일부러 부하를 주는 일은 HPA·오토스케일링 검증, 스케줄링·리소스 한계 테스트, 하드웨어 번인(burn-in)에 필요합니다. 이 글에서는 **목표 사용률(%)을 동적으로 유지하는 `stress` + DaemonSet 스크립트 방식**과, **옵션 하나로 간단·정밀하게 거는 `stress-ng` 방식** 두 가지를 비교하고 각각의 구체적인 절차를 정리합니다.

## 🆚 stress vs stress-ng 한눈에 비교

| 항목 | stress | stress-ng |
|---|---|---|
| 성격 | 기본 부하 생성기 | 차세대(next-gen), 상위 호환 |
| 스트레서 종류 | CPU·메모리·I/O·디스크 등 기본 | 60종 이상(CPU 50+, 가상메모리 20+ 등) |
| 부하 조절 | 워커(프로세스) 수로 조절 | 워커 수 + 부하율·메서드까지 정밀 |
| 메트릭 | 없음 | `--metrics-brief`로 처리량 측정 |
| 적합한 상황 | 스크립트로 **목표 사용률 동적 유지** | **빠르고 정밀한 단발 테스트·벤치마크** |

> 💡 `stress-ng`는 `stress`의 옵션을 대부분 호환하면서 기능이 훨씬 많습니다. 단순 부하면 어느 쪽이든 되지만, "CPU를 정확히 50%로 유지" 같은 **목표치 제어**는 별도 로직이 필요합니다.

---

## 1️⃣ 방법 A — stress + DaemonSet으로 목표 사용률 유지

`stress`는 워커 수만 지정할 수 있어, "노드 CPU를 50%로 유지"처럼 **목표 사용률을 맞추려면 현재 사용률을 읽어 필요한 만큼만 부하를 거는 제어 스크립트**가 필요합니다. 아래는 그 스크립트를 ConfigMap으로 넣고, DaemonSet으로 대상 노드마다 띄우는 구성입니다.

### stress 설치

이미지 빌드 시 `stress`와 계산용 `bc`를 함께 설치합니다(Dockerfile 예).

```dockerfile
RUN apt-get update && apt-get install -y stress bc
```

### ConfigMap — 목표 사용률 제어 스크립트

현재 CPU idle과 메모리 사용량을 읽어, **목표치까지 부족한 만큼만** `stress`를 거는 루프입니다.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: stress-script
  namespace: chip-analyzer
data:
  stress-control.sh: |
    #!/bin/bash

    TARGET_CPU_USAGE=$TARGET_CPU
    echo "TARGET_CPU_USAGE = $TARGET_CPU_USAGE"

    TARGET_MEMORY_USAGE=$TARGET_MEM
    echo "TARGET_MEMORY_USAGE = $TARGET_MEMORY_USAGE"

    TIMEOUT=$TIMEOUT
    echo "TIMEOUT = $TIMEOUT"

    while true; do
      echo "##### CPU Check #####"
      TOTAL_CORES=$(nproc)
      echo "TOTAL_CORES = $TOTAL_CORES"

      CURRENT_IDLE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print $1}')
      echo "CURRENT_IDLE = $CURRENT_IDLE"

      CURRENT_CPU_USAGE=$(echo "100 - $CURRENT_IDLE" | bc -l)
      echo "CURRENT_CPU_USAGE = $CURRENT_CPU_USAGE"

      NEEDED_CPU_USAGE=$(echo "$TARGET_CPU_USAGE - $CURRENT_CPU_USAGE" | bc -l)
      echo "NEEDED_CPU_USAGE = $NEEDED_CPU_USAGE"

      TARGET_CPU_CORES=$(echo "$NEEDED_CPU_USAGE * $TOTAL_CORES / 100" | bc -l)
      echo "TARGET_CPU_CORES = $TARGET_CPU_CORES"

      TARGET_CPU_CORES_ROUNDED=$(echo "($TARGET_CPU_CORES+0.5)/1" | bc)
      echo "TARGET_CPU_CORES_ROUNDED = $TARGET_CPU_CORES_ROUNDED"


      echo "##### Memory Check #####"
      TOTAL_MEMORY=$(grep MemTotal /proc/meminfo | awk '{print $2}')
      echo "TOTAL_MEMORY = $TOTAL_MEMORY"

      FREE_MEMORY=$(grep MemFree /proc/meminfo | awk '{print $2}')
      echo "FREE_MEMORY = $FREE_MEMORY"

      BUFFERS=$(grep Buffers /proc/meminfo | awk '{print $2}')
      echo "BUFFERS = $BUFFERS"

      CACHED=$(grep "^Cached" /proc/meminfo | awk '{print $2}')
      echo "CACHED = $CACHED"

      USED_MEMORY=$((TOTAL_MEMORY - FREE_MEMORY - BUFFERS - CACHED))
      echo "USED_MEMORY = $USED_MEMORY"

      TARGET_MEMORY=$(echo "$TOTAL_MEMORY * $TARGET_MEMORY_USAGE / 100" | bc)
      echo "TARGET_MEMORY = $TARGET_MEMORY"

      NEEDED_MEMORY=$((TARGET_MEMORY - USED_MEMORY))
      echo "NEEDED_MEMORY = $NEEDED_MEMORY"

      # MB로 계산하고 싶을 때(반올림 추가)
      NEEDED_MEMORY_ROUNDED=$(echo "($NEEDED_MEMORY + 1023) / 1024" | bc)
      echo "NEEDED_MEMORY_ROUNDED = $NEEDED_MEMORY_ROUNDED"

      if (( $(echo "$TARGET_CPU_CORES_ROUNDED > 0" | bc -l) )) && (( NEEDED_MEMORY > 1023 )); then
        echo "Adding Stress CPU: $TARGET_CPU_CORES_ROUNDED / Memory: $NEEDED_MEMORY KB."
        stress --cpu $TARGET_CPU_CORES_ROUNDED --vm 1 --vm-bytes ${NEEDED_MEMORY}k --vm-hang 0 --verbose --timeout ${TIMEOUT}s
      elif (( $(echo "$TARGET_CPU_CORES_ROUNDED > 0" | bc -l) )) && (( NEEDED_MEMORY <= 1023 )); then
        echo "Adding Stress CPU:  $TARGET_CPU_CORES_ROUNDED."
        stress --cpu $TARGET_CPU_CORES_ROUNDED --vm-hang 0 --verbose --timeout ${TIMEOUT}s
      elif (( $(echo "$TARGET_CPU_CORES_ROUNDED <= 0" | bc -l) )) && (( NEEDED_MEMORY > 1023 )); then
        echo "Adding Stress Memory: $NEEDED_MEMORY KB."
        stress --vm 1 --vm-bytes ${NEEDED_MEMORY}k --vm-hang 0 --verbose --timeout ${TIMEOUT}s
      else
        echo "No Stress Needed."
      fi

      wait

      sleep 1

    done
```

### DaemonSet — 대상 노드마다 배포

환경변수 `TARGET_CPU`/`TARGET_MEM`/`TIMEOUT`로 목표치를 주입합니다. 아래 예시는 `affinity`로 control-plane 노드를 대상으로 하고, 해당 노드의 taint를 `tolerations`로 허용합니다.

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  labels:
    app: chip-analyzer-master
  name: chip-analyzer-master
  namespace: chip-analyzer
spec:
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 5
      maxSurge: 0
  selector:
    matchLabels:
      app: chip-analyzer-master
  template:
    metadata:
      labels:
        app: chip-analyzer-master
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
              - matchExpressions:
                  - key: node-role.kubernetes.io/control-plane
                    operator: Exists
      tolerations:
        - key: node-role.kubernetes.io/control-plane
          operator: Exists
          effect: NoSchedule
        - key: node-role.kubernetes.io/master
          operator: Exists
          effect: NoSchedule
      containers:
        - name: chip-analyzer-master
          image: stress:v1.0
          imagePullPolicy: Always
          command: ["/bin/bash", "/scripts/stress-control.sh"]
          env:
            - name: TARGET_CPU
              value: "50"
            - name: TARGET_MEM
              value: "50"
            - name: TIMEOUT
              value: "300"
          volumeMounts:
            - name: script-volume
              mountPath: /scripts
      restartPolicy: Always
      volumes:
        - name: script-volume
          configMap:
            name: stress-script
            defaultMode: 0775
```

> ⚠️ 원본 매니페스트에 있던 들여쓰기 오류(`operator`/`value`/`mountPath`/`configMap` 한 칸 밀림)를 바로잡았습니다. 위 YAML은 그대로 `kubectl apply` 가능합니다.

---

## 2️⃣ 방법 B — stress-ng로 간단·정밀 부하

`stress-ng`(stress next-generation)는 60종이 넘는 스트레서를 제공하는 상위 호환 도구입니다. 워커 수뿐 아니라 **부하율·연산 방식·처리량 메트릭**까지 다룰 수 있어, 빠른 단발 테스트나 벤치마크에 적합합니다.

### stress-ng 설치

```bash
apt install -y stress-ng
```

### 자주 쓰는 옵션

| 옵션 | 설명 |
|---|---|
| `--cpu N` | CPU 워커 N개 (`0`이면 전체 코어) |
| `--cpu-load P` | CPU 부하율을 P%로 제한 |
| `--cpu-method` | 연산 방식 지정(`matrixprod`, `all` 등) |
| `--vm N` | 메모리 워커 N개 |
| `--vm-bytes` | 워커당 할당 메모리(예: `1G`) |
| `--vm-method` | 메모리 스트레스 패턴 |
| `--io N` | I/O 워커 N개 |
| `--timeout T` | 지속 시간(예: `60s`) |
| `--metrics-brief` | 처리량(bogo-ops) 요약 출력 |

### 실행 예제

```bash
# CPU 4개를 70%로 60초 (메트릭 출력)
stress-ng --cpu 4 --cpu-load 70 --timeout 60s --metrics-brief

# 메모리 워커 2개 × 1GB, 60초
stress-ng --vm 2 --vm-bytes 1G --timeout 60s --metrics-brief

# CPU·메모리·I/O 복합 부하, 5분
stress-ng --cpu 4 --vm 2 --vm-bytes 2G --io 2 --timeout 300s --metrics-brief
```

> 💡 `--timeout`을 반드시 지정하세요. 빼면 무한히 부하가 걸립니다.

### 쿠버네티스에서 일회성으로 실행 (Job)

특정 노드에 한 번만 부하를 주려면 `nodeName`(또는 nodeSelector)을 지정한 Job이 간단합니다.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: stress-ng
  namespace: chip-analyzer
spec:
  backoffLimit: 0
  template:
    spec:
      restartPolicy: Never
      nodeName: <대상-노드-이름>   # 특정 노드 지정
      containers:
        - name: stress-ng
          image: ubuntu:22.04
          command: ["/bin/bash", "-c"]
          args:
            - >-
              apt-get update && apt-get install -y stress-ng &&
              stress-ng --cpu 2 --vm 1 --vm-bytes 512M --timeout 300s --metrics-brief
          resources:
            limits:
              cpu: "2"
              memory: 1Gi
```

---

## 🤔 언제 무엇을 쓰나

- **목표 사용률을 일정하게 유지**해야 한다(예: "노드를 계속 CPU 50%로") → **방법 A**. 현재 사용률을 읽어 부족분만 채우는 제어 루프가 필요합니다.
- **빠르게 한 번 강하게 부하**를 주거나, **CPU 부하율·메트릭을 정밀하게** 보고 싶다 → **방법 B**. `--cpu-load`, `--metrics-brief`로 간단히 해결됩니다.
- 여러 노드에 **상시 배포**가 필요하면 DaemonSet(방법 A), **특정 노드에 단발**이면 Job(방법 B)이 깔끔합니다.

---

## ⚠️ 주의사항

- **control-plane(마스터) 노드 부하는 위험합니다.** API 서버·etcd 응답이 느려져 클러스터 전체가 불안정해질 수 있습니다. 가능하면 워커 노드를 대상으로 하고, 꼭 필요하면 `--timeout`을 짧게 잡으세요.
- 항상 **시간 제한**을 둡니다(`--timeout`, 스크립트의 `TIMEOUT`). 무한 부하는 노드를 NotReady로 만들 수 있습니다.
- 부하 파드에도 `resources.limits`를 설정해 **부하가 의도한 범위를 넘지 않도록** 합니다.
- 테스트 중에는 `kubectl top nodes`나 모니터링으로 실제 사용률을 함께 관찰하세요.

---

## ❓ 자주 묻는 질문

**Q. stress와 stress-ng 중 무엇을 쓰면 되나요?**
간단·정밀 테스트는 `stress-ng`가 낫습니다. 다만 "특정 사용률 유지"처럼 목표치 제어가 필요하면 `stress-ng`만으로는 부족하고, 방법 A 같은 제어 스크립트가 필요합니다.

**Q. CPU를 정확히 50%로 유지하려면?**
방법 A의 제어 루프를 쓰거나, `stress-ng --cpu N --cpu-load 50`으로 워커당 부하율을 50%로 제한할 수 있습니다(노드 전체 평균과는 다를 수 있으니 모니터링 병행).

**Q. control-plane 노드에 부하를 줘도 되나요?**
권장하지 않습니다. 꼭 필요한 테스트라면 짧은 `--timeout`과 리소스 제한을 두고, 클러스터 상태를 관찰하며 진행하세요.

---

## 📚 참고

- [Ubuntu Manpage: stress-ng](https://manpages.ubuntu.com/manpages/focal/man1/stress-ng.1.html)
- [stress-ng — ManKier](https://www.mankier.com/1/stress-ng)
- [How to Perform CPU and Memory Stress Testing with stress-ng on RHEL 9 — OneUptime](https://oneuptime.com/blog/post/2026-03-04-how-to-perform-cpu-and-memory-stress-testing-with-stress-ng-on-rhel-9/view)
- [Attack CPU, Memory of a Linux machine using Stress and Stress-ng — Medium](https://gvasanka.medium.com/attack-cpu-memory-of-a-linux-machine-using-stress-and-stress-ng-commands-9a7aa1ee0a25)
