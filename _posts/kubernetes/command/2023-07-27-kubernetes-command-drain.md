---
# layout: post
title: "[Kubernetes] kubectl drain command"
date: 2023-07-27
categories: [Kubernetes, Kubectl]
tags: [Kubernetes, kubectl, Command, drain]
# comments: true
---

## 기본 구조

```bash
kubectl drain [노드 이름]

# my-node 이름을 가진 노드에서 실행 중인 파드를 안전하게 다른 노드로 이동하고, 노드를 비활성화
kubectl drain my-node
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option

- `--ignore-daemonsets`: 데몬셋을 무시하고 파드를 다른 노드로 이동
    ```bash
    # my-node 이름을 가진 노드에서 실행 중인 파드를 안전하게 다른 노드로 이동하면서, 데몬셋을 무시
    kubectl drain my-node --ignore-daemonsets
    ```

- `--delete-local-data`: 파드에서 사용하는 로컬 디스크 데이터를 삭제
    ```bash
    # my-node 이름을 가진 노드에서 실행 중인 파드를 안전하게 다른 노드로 이동하면서, 파드에서 사용하는 로컬 디스크 데이터를 삭제
    kubectl drain my-node --delete-local-data
    ```

- `--force`: 파드가 정상적으로 종료되지 않더라도 파드를 강제로 이동
    ```bash
    # my-node 이름을 가진 노드에서 실행 중인 파드를 안전하게 다른 노드로 이동하면서, 파드가 정상적으로 종료되지 않더라도 강제로 이동
    kubectl drain my-node --force
    ```

- `--grace-period`: 파드가 삭제되기 전 대기하는 시간(초)을 설정
    ```bash
    # my-node 이름을 가진 노드에서 실행 중인 파드를 안전하게 다른 노드로 이동하면서, 파드가 삭제되기 전 30초간 대기
    kubectl drain my-node --grace-period=30
    ```

- `-n`, `--namespace`: 파드가 위치한 네임스페이스를 지정
    ```bash
    # my-node 이름을 가진 노드에서 실행 중인 파드를 안전하게 다른 노드로 이동하면서, my-namespace 네임스페이스에 위치한 파드를 이동
    kubectl drain my-node -n my-namespace
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }