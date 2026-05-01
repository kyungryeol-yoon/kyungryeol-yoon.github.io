---
title: "[Kubernetes] 🔍 containerd OverlayFS 스냅샷 디스크 점유 컨테이너 추적하기"
date: 2021-05-11
categories: [Platform, Kubernetes, Error]
tags: [kubernetes, containerd, overlayfs, snapshots, disk, crictl, troubleshooting, kubectl, storage]
description: "containerd OverlayFS 스냅샷 디렉토리가 디스크를 과도하게 점유할 때, Snapshot ID에서 Container ID, Pod Name까지 추적하는 방법을 단계별로 정리했습니다."
pin: false
---

이 글에서는 `/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/` 하위의 특정 숫자 폴더가 수십 GB를 차지하는 상황에서, 어떤 Pod가 원인인지 찾아내는 과정을 다룹니다. Snapshot ID → Container ID → Pod Name 순서로 역추적하며, `crictl`과 `kubectl`을 중심으로 실무에서 바로 사용할 수 있는 명령어를 정리했습니다.

---

## 🚨 문제 상황: 디스크 용량 경고

서버에 DiskPressure 경고가 발생했습니다. 원인을 추적하기 위해 `du` 명령어로 용량을 확인합니다.

```bash
# 최상위 디렉토리별 용량 확인
du -sh /var/lib/containerd/*
# 또는 커스텀 데이터 경로라면
du -sh /appdata/cri/*
```

계속 파고들다 보면 아래와 같은 경로에서 특정 숫자 폴더가 수십 GB를 차지하는 것을 발견합니다.

```bash
du -sh /var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/* \
  | sort -rh | head -20
```

```
38G   /var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/11773
2.1G  /var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/11201
...
```

이제 `11773`이라는 스냅샷 폴더가 어느 컨테이너·Pod의 것인지 추적해야 합니다.

---

## 🧩 OverlayFS와 Snapshotter 개념 이해

추적 방법을 이해하려면 containerd의 레이어 구조를 먼저 파악해야 합니다.

| 디렉토리 | 역할 |
|---|---|
| `lowerdir` | 읽기 전용 이미지 레이어 (Image Layer) |
| `upperdir` | 컨테이너의 쓰기 레이어 (Write Layer) |
| `workdir` | OverlayFS 내부 임시 작업 디렉토리 |
| `merged` | lowerdir + upperdir를 합쳐 컨테이너에 보이는 최종 뷰 |

containerd의 **Snapshotter**는 각 컨테이너 레이어를 숫자 ID로 관리합니다. 컨테이너가 실행되면 해당 컨테이너 전용 `upperdir`가 스냅샷 폴더 안에 생성되며, 이 공간에 로그·임시 파일 등이 쌓입니다. 로그가 폭발하거나 임시 파일이 누수되면 스냅샷 폴더가 무한정 커지게 됩니다.

> **Tip**: `snapshots/<ID>/fs`는 컨테이너의 실제 파일시스템(upperdir)입니다. 이 안에 파일이 쌓이면 해당 스냅샷의 크기가 증가합니다.

---

## 🛠️ 1단계: mount로 스냅샷 마운트 정보 확인

가장 먼저 시도할 수 있는 방법은 `mount` 명령어로 해당 스냅샷 ID가 어떤 컨테이너에 마운트되어 있는지 확인하는 것입니다.

```bash
SNAPSHOT_ID=11773
mount | grep "snapshots/${SNAPSHOT_ID}"
```

**결과 예시:**

```
overlay on /run/containerd/io.containerd.runtime.v2.task/k8s.io/a3f2b1c0d4e5.../rootfs
type overlay (rw,relatime,lowerdir=.../11770/fs:.../11769/fs,
upperdir=.../11773/fs,workdir=.../11773/work)
```

`upperdir` 경로 안에 컨테이너의 Task ID(해시값)가 포함되어 있습니다. 이 해시를 메모합니다.

> ⚠️ 컨테이너가 이미 종료된 경우 mount 결과에 나타나지 않을 수 있습니다. 이 경우 2단계로 넘어가세요.

---

## 🔎 2단계: Task ID로 컨테이너 찾기

mount 결과에서 얻은 Task 해시로 컨테이너를 조회합니다.

```bash
TASK_HASH=a3f2b1c0d4e5...
ctr -n k8s.io c ls | grep ${TASK_HASH}
```

또는 `crictl`을 사용합니다.

```bash
crictl ps -a | grep ${TASK_HASH}
```

---

## 🔑 3단계: crictl inspect로 Snapshot ID 역추적

mount 결과 없이 스냅샷 ID만 알고 있을 때, `crictl inspect`의 `snapshotKey` 필드를 이용합니다.

```bash
# 모든 컨테이너를 순회하면서 스냅샷 ID 검색
crictl ps -a -q | while read CONTAINER_ID; do
  RESULT=$(crictl inspect ${CONTAINER_ID} 2>/dev/null | grep -i "11773")
  if [ -n "${RESULT}" ]; then
    echo "Found in container: ${CONTAINER_ID}"
    crictl inspect ${CONTAINER_ID} | grep -E '"name"|"image"|snapshotKey'
  fi
done
```

**또는** `jq`가 설치된 환경에서는 더 정확하게 추출할 수 있습니다.

```bash
SNAPSHOT_ID=11773
crictl ps -a -q | while read CID; do
  SNAP=$(crictl inspect ${CID} 2>/dev/null \
    | jq -r '.info.runtimeSpec.annotations["io.kubernetes.cri.sandbox-id"] // empty' 2>/dev/null)
  ROOTFS=$(crictl inspect ${CID} 2>/dev/null \
    | jq -r '.info.config.image.image // empty' 2>/dev/null)
  if crictl inspect ${CID} 2>/dev/null | grep -q "snapshots/${SNAPSHOT_ID}"; then
    echo "Container ID : ${CID}"
    echo "Image        : ${ROOTFS}"
  fi
done
```

---

## 🗂️ 4단계: Container ID → Pod Name 연결

컨테이너 ID를 찾았다면, 해당 컨테이너가 속한 Pod를 확인합니다.

```bash
CONTAINER_ID=a3f2b1c0d4e5

# Pod ID(샌드박스 ID) 확인
crictl inspect ${CONTAINER_ID} | grep -i sandbox

# Pod 상세 정보 확인
crictl inspectp <POD_SANDBOX_ID>
```

또는 `crictl ps` 출력에서 직접 Pod 이름을 확인할 수 있습니다.

```bash
crictl ps -a --output=table | grep ${CONTAINER_ID}
```

출력 예시:

```
CONTAINER    IMAGE    CREATED    STATE    NAME    ATTEMPT    POD ID    POD
a3f2b1c0d4e5 ...      2h ago     Running  app     0          b4c3d2e1  my-app-7d6f9b-xkpqr
```

Pod 이름을 확인했다면 `kubectl`로 상세 정보를 조회합니다.

```bash
kubectl get pod my-app-7d6f9b-xkpqr -n <namespace> -o wide
kubectl describe pod my-app-7d6f9b-xkpqr -n <namespace>
```

---

## 🔬 5단계: 스냅샷 내부 파일 확인

어떤 파일이 용량을 점유하는지 직접 확인합니다.

```bash
# 스냅샷의 upperdir(실제 컨테이너 쓰기 레이어) 탐색
ls -lh /var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/11773/fs/

# 하위 디렉토리별 용량 확인
du -sh /var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/11773/fs/* \
  | sort -rh | head -20
```

대부분의 경우 다음 경로에서 파일이 폭증합니다.

```
/var/log/               ← 애플리케이션 로그 누수
/tmp/                   ← 임시 파일 누수
/var/cache/             ← 캐시 파일 미정리
```

---

## ✅ 해결 방법

### 범인 Pod 재시작 또는 삭제

```bash
# Pod 재시작 (Deployment 등 상위 오브젝트가 있을 경우)
kubectl rollout restart deployment/<deployment-name> -n <namespace>

# Pod 직접 삭제 (ReplicaSet이 새 Pod를 생성)
kubectl delete pod my-app-7d6f9b-xkpqr -n <namespace>
```

> ⚠️ `rm -rf snapshots/11773` 같은 직접 삭제는 절대 하지 마세요. containerd 런타임 메타데이터와 불일치가 발생해 노드가 불안정해질 수 있습니다.

### 미사용 이미지·컨테이너 정리

```bash
# 종료된 컨테이너 조회 및 삭제
crictl ps -a --state exited
crictl rm $(crictl ps -a --state exited -q)

# 미사용 이미지 정리
crictl rmi --prune

# ctr를 이용한 정리 (24시간 이상 미사용)
ctr -n k8s.io images prune --all-unused --older-than 24h

# 스냅샷 정리
ctr -n k8s.io snapshots prune
```

### 애플리케이션 로그 로테이션 설정

컨테이너 내부에서 로그가 쌓인다면 애플리케이션의 로그 로테이션을 설정합니다.

```yaml
# Deployment에 컨테이너 로그 크기 제한 추가
spec:
  containers:
  - name: app
    # ...
    resources:
      limits:
        ephemeral-storage: "2Gi"   # 임시 스토리지 상한 설정
```

---

## 🛡️ 예방: Kubelet GC 및 containerd GC 설정

### Kubelet 이미지 GC 설정

`/var/lib/kubelet/config.yaml`에 다음 항목을 추가합니다.

```yaml
imageGCHighThresholdPercent: 85   # 85% 초과 시 GC 시작
imageGCLowThresholdPercent: 80    # 80%까지 정리
```

### containerd 주기적 GC 설정

`/etc/containerd/config.toml`에 GC 스케줄러를 설정합니다.

```toml
[plugins."io.containerd.gc.v1.scheduler"]
  pause_threshold = 0.02
  deletion_threshold = 0
  mutation_threshold = 100
  schedule_delay = "0s"
  startup_delay = "100ms"
```

### 디스크 사용량 모니터링

Prometheus를 사용한다면 `node_filesystem_avail_bytes` 메트릭에 알람을 설정하여 DiskPressure 이전에 조치를 취할 수 있습니다.

```yaml
# PrometheusRule 예시
- alert: NodeDiskPressureWarning
  expr: |
    node_filesystem_avail_bytes{mountpoint="/var/lib/containerd"} /
    node_filesystem_size_bytes{mountpoint="/var/lib/containerd"} < 0.15
  for: 5m
  annotations:
    summary: "containerd 디스크 여유 공간 15% 미만"
```

---

## ❓ 자주 묻는 질문

### Q. 스냅샷 폴더를 직접 rm -rf 해도 되나요?
안 됩니다. containerd는 내부 bolt DB(`meta.db`)에 스냅샷 메타데이터를 관리합니다. 파일만 삭제하면 DB와 불일치가 발생해 containerd가 오작동하거나 노드가 NotReady 상태가 될 수 있습니다. 반드시 `crictl rm`, `ctr snapshots rm` 등 런타임 도구를 사용하세요.

### Q. mount | grep 으로 아무것도 안 나올 때는요?
컨테이너가 이미 종료된 경우입니다. `crictl ps -a`로 종료된 컨테이너까지 포함하여 확인하거나, `ctr -n k8s.io snapshots info <snapshot-key>`로 스냅샷 메타데이터를 직접 조회해 보세요.

### Q. ctr와 crictl 중 어떤 것을 써야 하나요?
Kubernetes 환경에서는 **crictl**을 권장합니다. crictl은 CRI(Container Runtime Interface)를 통해 Kubernetes Pod·컨테이너 정보와 연동되므로, Pod 이름 등 상위 정보를 얻기 쉽습니다. ctr는 containerd 네이티브 CLI로, Kubernetes 메타데이터 없이 더 로우레벨 접근이 필요할 때 사용합니다.

### Q. ephemeral-storage 제한을 걸면 Pod가 Evict되지 않나요?
맞습니다. 설정한 상한을 초과하면 kubelet이 해당 Pod를 evict합니다. 이는 단일 Pod의 무제한 디스크 점유로 노드 전체가 DiskPressure에 빠지는 것을 막아주는 안전장치입니다. limits는 넉넉하게, requests는 실제 사용량 기준으로 설정하는 것을 권장합니다.

---

## 📚 참고

- [Find who own overlayfs snapshots/NN - containerd/containerd Discussion #10053](https://github.com/containerd/containerd/discussions/10053)
- [How to Shrink the io.containerd.snapshotter.v1.overlayfs Folder in Kubernetes](https://www.w3tutorials.net/blog/is-it-possible-to-shrink-the-spaces-of-io-containerd-snapshotter-v1-overlayfs-folder-in-kubernetes/)
- [Debugging Kubernetes nodes with crictl - Kubernetes Docs](https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/)
- [containerd Snapshotters Explained: Overlayfs, Native, and More](https://hexshift.medium.com/containerd-snapshotters-explained-overlayfs-native-and-more-a944c503beec)
- [Overlay Filesystem and Its Use in Container Runtime](https://medium.com/@jinha4ever/overlay-filesystem-and-its-use-in-container-runtime-693eba88a2a7)
- [Large containerd Snapshot Directories and Cleanup Assistance - kubespray Issue #10195](https://github.com/kubernetes-sigs/kubespray/issues/10195)
