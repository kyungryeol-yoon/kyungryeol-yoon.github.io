---
# layout: post
title: "[Kubernetes] kubeadm reset command"
date: 2022-07-03
categories: [Kubeadm, Command]
tags: [kubeadm, command, reset]
# comments: true
# pin: true
---

## 기본 구조

```bash
kubeadm reset
```

- 모든 Kubernetes 구성 요소와 컨테이너를 제거합니다.
- 모든 네트워크 설정을 제거합니다.
- 모든 Kubernetes 설정 파일을 삭제합니다.
- 모든 데이터를 삭제합니다.

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option

- `--cri-socket`: CRI 소켓 경로를 지정. 이 옵션을 사용하여 kubelet이나 kubeadm에 등록된 CRI 구현체의 소켓을 사용
    ```bash
    # dockershim을 사용하여 초기화
    sudo kubeadm reset --cri-socket=/var/run/dockershim.sock
    ```

- `--force`: 초기화 작업을 강제로 수행
    ```bash
    # 강제 초기화를 수행
    sudo kubeadm reset --force
    ```

- `--skip-phases`: 특정 초기화 단계를 건너뛴다.
    ```bash
    # 모든 초기화 단계를 건너뛴다.
    sudo kubeadm reset --skip-phases=all
    ```

- `--dry-run`: 실제로 초기화 작업을 수행하지 않고, 초기화 작업을 출력
    ```bash
    # 초기화 작업을 수행하지 않고, 초기화 작업을 출력
    sudo kubeadm reset --dry-run
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }