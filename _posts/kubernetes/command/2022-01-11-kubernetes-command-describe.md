---
# layout: post
title: "[Kubernetes] kubectl describe command"
date: 2022-01-11
categories: [Kubernetes, Command]
tags: [Kubernetes, kubectl, Command, describe]
# comments: true
# pin: true
---

## 기본 구조

```bash
kubectl describe [리소스 종류] [리소스 이름]

# my-pod 이름의 Pod 리소스에 대한 자세한 정보를 출력할 수 있다.
kubectl describe pod my-pod
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option

- `--namespace`: 리소스가 포함된 Namespace를 지정
    ```bash
    # my-namespace Namespace에 속한 my-pod 이름의 Pod 리소스에 대한 자세한 정보를 출력
    kubectl describe pod my-pod --namespace my-namespace
    ```

- `--show-events`: 리소스의 이벤트를 출력
    ```bash
    # my-pod 이름의 Pod 리소스에 대한 자세한 정보와 해당 리소스의 이벤트를 함께 출력
    kubectl describe pod my-pod --show-events
    ```

- `--export`: YAML 형식으로 출력
    ```bash
    # my-pod 이름의 Pod 리소스에 대한 자세한 정보를 YAML 형식으로 출력
    kubectl describe pod my-pod --export
    ```

- `--recursive`: 서브리소스의 정보도 출력
    ```bash
    # my-deployment 이름의 Deployment 리소스에 대한 자세한 정보와 해당 Deployment 리소스에 포함된 Pod 리소스의 자세한 정보도 함께 출력
    kubectl describe deployment my-deployment --recursive
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }