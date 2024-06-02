---
# layout: post
title: "[Kubernetes] kubectl exec command"
date: 2023-11-21
categories: [Kubernetes, command]
tags: [Kubernetes, kubectl, command, exec]
# comments: true
pin: true
---

## 기본 구조
```
kubectl exec [옵션] [Pod 이름] -- [Container 이름] [명령어]

# my-pod 이름의 Pod 내부에서 /app Directory를 조회할 수 있다.
kubectl exec my-pod -- ls /app
```

> [명령어] --help를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option
- --namespace: Pod가 포함된 Namespace를 지정
```
# my-namespace Namespace에 속한 my-pod 이름의 Pod 내부에서 /app Directory를 조회할 수 있다.
kubectl exec my-pod --namespace my-namespace -- ls /app
```

- --stdin, -i: 컨테이너의 표준 입력을 연결
```
# my-pod 이름의 Pod 내부에서 /app Directory를 조회하면서 Container의 표준 입력을 연결
kubectl exec my-pod -n [namespace] -i -- ls /app
```

- --tty, -t: TTY 모드를 사용
```
# my-pod 이름의 Pod 내부에서 Bash Shell을 실행하면서 TTY 모드를 사용
kubectl exec my-pod -n [namespace] -t -- bash
```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }