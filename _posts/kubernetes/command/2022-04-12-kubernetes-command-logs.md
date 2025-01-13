---
# layout: post
title: "[Kubernetes] kubectl logs command"
date: 2022-04-12
categories: [Kubernetes, Command]
tags: [Kubernetes, kubectl, Command, logs]
# comments: true
# pin: true
---

## 기본 구조

```bash
kubectl logs [Pod 이름] [Container 이름]

# my-pod 이름의 Pod 내부에서 my-container 이름의 Container의 로그를 출력할 수 있다.
kubectl logs my-pod my-container
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option

- `--namespace`: Pod가 포함된 Namespace를 지정
    ```bash
    # my-namespace Namespace에 속한 my-pod 이름의 Pod 내부에서 my-container 이름의 Container의 로그를 출력
    kubectl logs my-pod -n my-namespace my-container
    ```

- `--follow`, `-f`: 로그를 실시간으로 출력
    ```bash
    # my-pod 이름의 Pod 내부에서 my-container 이름의 Container의 로그를 실시간으로 출력
    kubectl logs my-pod my-container -f
    ```

- `--tail`: 출력할 로그 라인 수를 지정
    ```bash
    # my-pod 이름의 Pod 내부에서 my-container 이름의 Container의 로그를 최근 50개 라인만 출력
    kubectl logs my-pod my-container --tail=50
    ```

- `--since`: 출력할 로그의 시작 시간을 지정
    ```bash
    # my-pod 이름의 Pod 내부에서 my-container 이름의 Container에서 1시간 이전부터 출력할 로그를 선택
    kubectl logs my-pod my-container --since=1h
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }