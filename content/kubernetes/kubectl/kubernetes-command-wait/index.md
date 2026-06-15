---
title: "[Kubernetes] kubectl wait command"
date: 2023-11-29
tags: [kubernetes, kubectl, command, wait]
description: "kubectl wait 명령어로 리소스가 특정 조건을 충족할 때까지 대기하는 방법. --for, --timeout, --namespace 옵션과 사용 예제를 정리합니다."
---

## 기본 구조

```bash
kubectl wait [리소스 종류] [리소스 이름] --for=[조건] [조건 값]

# my-pod 파드가 Ready 상태가 될 때까지 대기할 수 있다.
kubectl wait pod my-pod --for=condition=Ready
```

> 💡 [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.

### Option

- `--for`: 대기할 조건을 지정
    ```bash
    # Ready 조건이 충족될 때까지 대기
    kubectl wait pod my-pod --for=condition=Ready
    ```

- `--timeout`: 대기 시간을 지정. 이 시간을 초과하면 명령어가 종료
    ```bash
    # Ready 조건이 충족될 때까지 60초 동안 대기
    kubectl wait pod my-pod --for=condition=Ready --timeout=60s
    ```

- `--namespace`: Namespace를 지정
    ```bash
    # my-namespace Namespace에 있는 my-pod Pod가 Ready 상태가 될 때까지 대기
    kubectl wait pod my-pod --for=condition=Ready --namespace=my-namespace
    ```

> 💡 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)