---
# layout: post
title: "[Kubernetes] kubectl cordon command"
date: 2023-07-07
categories: [Kubernetes, Command]
tags: [Kubernetes, kubectl, command, cordon]
# comments: true
---

## 기본 구조

```bash
kubectl cordon [노드 이름]

# my-node 이름을 가진 노드를 Scheduling 하지 않도록 설정
kubectl cordon my-node
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option

- `--ignore-daemonsets`: 데몬셋을 무시하고 노드를 cordon 처리
    ```bash
    # my-node 이름을 가진 노드를 Scheduling 하지 않도록 설정하면서, 데몬셋을 무시한다.
    kubectl cordon my-node --ignore-daemonsets
    ```

- `--dry-run`: 노드를 cordon 처리하지 않고 처리 결과만 미리 확인
    ```bash
    # my-node 이름을 가진 노드를 Scheduling 하지 않도록 설정하지 않고, 처리 결과만 미리 확인
    kubectl cordon my-node --dry-run
    ```

- `--selector`: cordon 처리할 노드를 선택한다. label selector를 지정하여 여러 노드를 선택할 수 있다.
    ```bash
    # region이 us-west인 노드를 모두 cordon 처리
    kubectl cordon --selector="region=us-west"
    ```

- `--timeout`: cordon 처리할 때, 타임아웃을 설정
    ```bash
    # my-node 이름을 가진 노드를 Scheduling 하지 않도록 설정하면서, 타임아웃을 60초로 설정
    kubectl cordon my-node --timeout=60s
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }