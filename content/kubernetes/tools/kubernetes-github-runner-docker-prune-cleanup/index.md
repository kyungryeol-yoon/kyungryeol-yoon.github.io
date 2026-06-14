---
title: "[Kubernetes] 🧹 GitHub Actions Runner Pod 디스크 정리: kubectl exec + docker prune 일괄 실행"
date: 2026-03-27
tags: [kubernetes, kubectl, github-actions, self-hosted-runner, docker, prune, dind, cleanup, devops]
description: "Kubernetes에 올린 GitHub Actions self-hosted runner Pod에 쌓인 Docker 빌드 찌꺼기를, label selector와 xargs로 여러 Pod에 한 번에 docker system prune 하는 방법을 정리했습니다."
---

Kubernetes에 올린 GitHub Actions self-hosted runner는 CI 빌드를 반복하면서 Docker 이미지·빌드 캐시가 쌓여 노드 디스크를 가득 채우기 쉽습니다. 이 글에서는 `kubectl get pods -l`로 runner Pod를 골라 `xargs`로 묶어, **여러 Pod에 한 번에 `docker system prune`을 실행하는 한 줄 명령어**를 분해하고, 안전한 옵션 선택과 CronJob 자동화까지 실무 관점으로 정리합니다.

## 🎯 핵심 명령어 한 줄

```bash
kubectl get -n github-runner pods -l app=githubrunner-cs -o name \
  | xargs -I {} kubectl exec -n github-runner {} -c githubrunner-cs -- docker system prune -f
```

이 한 줄은 `github-runner` 네임스페이스에서 `app=githubrunner-cs` 라벨이 붙은 모든 runner Pod를 찾아, 각 Pod의 `githubrunner-cs` 컨테이너 안에서 `docker system prune -f`를 실행합니다. 결과적으로 모든 runner의 Docker 찌꺼기를 한 번에 정리합니다.

---

## 🧐 왜 runner Pod에 찌꺼기가 쌓일까?

**self-hosted runner는 CI 빌드마다 Docker 이미지를 받고 빌드 캐시를 남기는데, 이게 정리되지 않고 누적되기 때문입니다.** 특히 runner Pod 안에서 Docker 빌드를 돌리는 **DinD(Docker-in-Docker)** 구조에서는 다음이 쌓입니다.

- 빌드 중간 단계 이미지와 **dangling 이미지**(태그가 떨어진 `<none>` 이미지)
- `docker build` 과정에서 생기는 **빌드 캐시**
- 종료된 컨테이너, 사용하지 않는 네트워크

GitHub Actions의 공식 호스티드 runner는 매번 깨끗한 VM에서 시작하지만, **self-hosted runner는 환경이 유지**되므로 직접 청소하지 않으면 계속 누적됩니다. 결국 노드의 디스크가 가득 차면 `ImagePull` 실패나 Pod `Evicted`로 이어집니다.

> ⚠️ 디스크가 이미 가득 찬 뒤에는 Pod가 `Evicted`되어 정리 명령조차 못 들어갈 수 있습니다. **주기적 정리(자동화)**가 핵심입니다.

---

## 🔬 명령어 한 줄 분해하기

명령어는 세 토막으로 나눠 보면 명확합니다.

### 1️⃣ 대상 Pod 고르기 — `kubectl get -l`

```bash
kubectl get -n github-runner pods -l app=githubrunner-cs -o name
```

`-l app=githubrunner-cs`는 **label selector**로 runner Pod만 선택합니다. `-o name`은 출력을 `pod/이름` 형식으로 단순화해 다음 단계에 넘기기 좋게 만듭니다.

```text
pod/githubrunner-cs-0
pod/githubrunner-cs-1
pod/githubrunner-cs-2
```

### 2️⃣ 각 Pod로 펼치기 — `xargs -I {}`

```bash
| xargs -I {} kubectl exec ... {} ...
```

`xargs -I {}`는 앞 단계에서 받은 줄(Pod 이름)을 하나씩 `{}` 자리에 끼워 넣어 명령을 **Pod 개수만큼 반복**합니다. Pod가 3개면 `kubectl exec`가 3번 실행됩니다.

### 3️⃣ 컨테이너 안에서 실행 — `kubectl exec -c ... -- docker ...`

```bash
kubectl exec -n github-runner pod/githubrunner-cs-0 -c githubrunner-cs -- docker system prune -f
```

- `-c githubrunner-cs`: Pod에 컨테이너가 여러 개(예: runner + DinD 사이드카)일 때 **어느 컨테이너에서 실행할지** 지정합니다. 생략하면 첫 번째 컨테이너에서 실행됩니다.
- `--` 뒤가 컨테이너 안에서 실제로 돌릴 명령(`docker system prune -f`)입니다.

> **Tip**: Docker 데몬이 별도 사이드카(예: `dind`)에 있다면 `-c` 값을 그 컨테이너 이름으로 맞춰야 합니다. `kubectl get pod <name> -o jsonpath='{.spec.containers[*].name}'`로 컨테이너 이름을 확인하세요.

---

## 🗑️ docker system prune은 정확히 무엇을 지우나

**`docker system prune`은 기본적으로 멈춘 컨테이너·미사용 네트워크·dangling 이미지·미사용 빌드 캐시를 삭제하지만, 볼륨과 태그가 붙은 미사용 이미지는 건드리지 않습니다.** 옵션에 따라 삭제 범위가 크게 달라지므로 표로 정리합니다.

| 명령 | 멈춘 컨테이너 | dangling 이미지 | **태그된 미사용 이미지** | 빌드 캐시 | **볼륨** |
|---|---|---|---|---|---|
| `docker system prune` | ✅ | ✅ | ❌ | ✅(미사용) | ❌ |
| `docker system prune -a` | ✅ | ✅ | ✅ | ✅(전체) | ❌ |
| `docker system prune -a --volumes` | ✅ | ✅ | ✅ | ✅(전체) | ✅ |

- `-f` / `--force`: 확인 프롬프트를 건너뜁니다. 스크립트·일괄 실행에는 필수입니다.
- `-a` / `--all`: dangling뿐 아니라 **컨테이너가 참조하지 않는 모든 이미지**를 삭제합니다. 디스크는 더 확보되지만, 다음 빌드에서 베이스 이미지를 다시 받아야 합니다(캐시 손실).
- `--volumes`: 미사용 볼륨까지 삭제합니다. **데이터 유실 위험**이 있으니 runner 캐시 볼륨 구조를 모르면 쓰지 마세요.

> ⚠️ runner에서는 보통 **`docker system prune -f`(기본)**가 안전한 균형점입니다. 디스크를 더 비워야 하면 `-a`까지 고려하되, `--volumes`는 무엇이 지워지는지 확인 후에만 사용하세요.

---

## 🔎 정리 전후 확인하기

정리 효과를 수치로 확인하려면 `docker system df`를 활용합니다.

```bash
# 특정 runner Pod의 디스크 사용 현황
kubectl exec -n github-runner pod/githubrunner-cs-0 -c githubrunner-cs -- docker system df
```

```text
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          42        5         12.3GB    9.8GB (79%)
Containers      8         2         1.2GB     0.9GB (75%)
Local Volumes   15        3         4.1GB     3.0GB (73%)
Build Cache     120       0         6.5GB     6.5GB (100%)
```

`RECLAIMABLE` 값이 prune으로 회수 가능한 용량입니다. 노드 디스크 자체는 다음으로 확인합니다.

```bash
# 노드 파일시스템 사용률
kubectl exec -n github-runner pod/githubrunner-cs-0 -c githubrunner-cs -- df -h /
```

---

## ⏰ CronJob으로 자동화하기

수동 실행은 까먹기 쉬우니, **CronJob으로 주기적 정리**를 거는 것이 실무에서 가장 깔끔합니다. 클러스터 안에서 `kubectl`을 실행하려면 해당 명령에 대한 권한(RBAC)이 필요합니다.

```yaml
# ServiceAccount + RBAC (pods 조회 + exec 권한)
apiVersion: v1
kind: ServiceAccount
metadata:
  name: runner-pruner
  namespace: github-runner
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: runner-pruner
  namespace: github-runner
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list"]
  - apiGroups: [""]
    resources: ["pods/exec"]
    verbs: ["create"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: runner-pruner
  namespace: github-runner
subjects:
  - kind: ServiceAccount
    name: runner-pruner
    namespace: github-runner
roleRef:
  kind: Role
  name: runner-pruner
  apiGroup: rbac.authorization.k8s.io
```

```yaml
# CronJob — 매일 새벽 4시에 모든 runner Pod 정리
apiVersion: batch/v1
kind: CronJob
metadata:
  name: runner-docker-prune
  namespace: github-runner
spec:
  schedule: "0 4 * * *"           # 매일 04:00 (클러스터 타임존 기준)
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          serviceAccountName: runner-pruner
          restartPolicy: Never
          containers:
            - name: pruner
              image: bitnami/kubectl:latest
              command:
                - /bin/sh
                - -c
                - >
                  kubectl get -n github-runner pods -l app=githubrunner-cs -o name
                  | xargs -I {} kubectl exec -n github-runner {} -c githubrunner-cs
                  -- docker system prune -f
```

> **Tip**: `schedule`의 타임존은 기본적으로 kube-controller-manager 기준(UTC인 경우가 많음)입니다. KST 기준으로 돌리려면 `spec.timeZone: "Asia/Seoul"`(Kubernetes 1.27+ 안정화)을 추가하세요.

---

## 📝 한 줄 요약

- self-hosted GitHub Actions runner는 환경이 유지되어 Docker 이미지·빌드 캐시가 누적되므로 주기적 정리가 필요합니다.
- `kubectl get -l ... -o name | xargs -I {} kubectl exec ... -- docker system prune -f`로 **여러 runner Pod를 한 번에** 정리할 수 있습니다.
- 기본 `prune -f`가 안전하며, `-a`(전체 이미지)·`--volumes`(볼륨)는 영향 범위를 이해하고 써야 합니다.
- 운영에서는 RBAC + CronJob으로 **자동화**하는 것이 가장 확실합니다.

---

## ❓ 자주 묻는 질문

### Q. `docker system prune -f`는 실행 중인 컨테이너도 지우나요?

아닙니다. 멈춘(stopped) 컨테이너, dangling 이미지, 미사용 네트워크, 미사용 빌드 캐시만 삭제합니다. 실행 중인 컨테이너와 그것이 사용하는 이미지·볼륨은 보존됩니다.

### Q. `-c` 옵션은 꼭 써야 하나요?

Pod에 컨테이너가 하나면 생략해도 됩니다. runner + DinD 사이드카처럼 여러 컨테이너가 있으면 Docker 데몬이 있는 컨테이너를 `-c`로 지정해야 합니다. 생략 시 첫 번째 컨테이너에서 실행됩니다.

### Q. Pod가 아주 많을 때 한 번에 돌려도 되나요?

`xargs`는 기본적으로 순차 실행이라 안전합니다. 더 빠르게 병렬 실행하려면 `xargs -P 4`처럼 동시 실행 수를 지정할 수 있지만, API 서버·노드 부하를 고려해 적당히 제한하세요.

### Q. 디스크를 더 확보하려면 `-a`를 써야 하나요?

`-a`는 태그가 있어도 컨테이너가 참조하지 않는 모든 이미지를 지웁니다. 디스크는 더 비지만 다음 빌드에서 베이스 이미지를 다시 받아야 해 빌드가 느려집니다. 정기 정리는 기본 `prune`, 디스크 위기 시에만 `-a`를 권장합니다.

### Q. ARC(Actions Runner Controller)를 쓰면 어떻게 하나요?

ARC의 ephemeral runner는 잡마다 Pod가 새로 떠 비교적 깨끗하지만, DinD 캐시를 공유 볼륨에 두는 구성이면 여전히 누적될 수 있습니다. 이 경우 공유 캐시 볼륨에 대한 정리 정책을 별도로 두거나 위 CronJob 방식을 적용하세요.

---

## 📚 참고

- [Docker Docs - docker system prune](https://docs.docker.com/reference/cli/docker/system/prune/)
- [Docker Docs - Prune unused Docker objects](https://docs.docker.com/engine/manage-resources/pruning/)
- [Kubernetes Docs - kubectl exec](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#exec)
- [Kubernetes Docs - CronJob (timeZone)](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)
- [GitHub Docs - About self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners)
- 관련 글: [Docker Dangling Image란?](/docker/docker-dangling-image/) · [kubectl exec command](/kubernetes/kubectl/kubernetes-command-exec/) · [containerd OverlayFS 디스크 점유 추적](/kubernetes/storage/containerd-overlayfs-snapshot-disk-usage-troubleshooting/)
</content>
