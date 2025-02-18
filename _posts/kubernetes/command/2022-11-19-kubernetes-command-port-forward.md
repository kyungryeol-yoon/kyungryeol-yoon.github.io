---
# layout: post
title: "[Kubernetes] kubectl port-forward command"
date: 2022-11-19
categories: [Kubernetes, Kubectl]
tags: [Kubernetes, kubectl, Command, port-forward]
# comments: true
# pin: true
---

## 기본 구조

```bash
kubectl port-forward [리소스 이름] [로컬 포트]:[원격 포트]

# my-pod 이름의 파드 내부의 80번 포트를 로컬 시스템의 8080번 포트와 연결할 수 있다.
kubectl port-forward my-pod 8080:80

# Pod 연결
kubectl port-forward pods/mongo-75f59d57f4-4nd6q 28015:27017

# Deployment 연결
kubectl port-forward deployment/mongo 28015:27017

# Replicaset 연결
kubectl port-forward replicaset/mongo-75f59d57f4 28015:27017

# Service 연결
kubectl port-forward service/mongo 28015:27017
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option

- `--namespace`: 리소스가 포함된 Namespace를 지정
    ```bash
    # (my-namespace Namespace에 속한 my-service 이름의 서비스 내부의 80번 포트를 로컬 시스템의 8080번 포트와 연결
    kubectl port-forward my-service --namespace my-namespace 8080:80
    ```

- `--address`: 로컬 주소를 지정
    ```bash
    # my-pod 이름의 Pod 내부의 80번 포트를 로컬 시스템의 127.0.0.1 주소의 8080번 포트와 연결
    kubectl port-forward my-pod 127.0.0.1:8080:80
    ```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }