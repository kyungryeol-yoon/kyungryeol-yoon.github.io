---
# layout: post
title: "Kubernetes delete command"
date: 2023-05-15
categories: [Kubernetes, command]
tags: [Kubernetes, kubectl, command, delete]
# comments: true
pin: true
---

## 기본 구조
```
kubectl delete [리소스 유형] [리소스 이름]

# Pod 삭제하려면 다음과 같이 입
kubectl delete pod [파드 이름]
```

### Option
- --all: 모든 리소스를 삭제
- --force: 강제 삭제
- --grace-period=<초>: 삭제될 때 대기할 시간을 초 단위로 설정
- --timeout=<초>: 명령이 실행될 때 대기할 최대 시간을 초 단위로 설정
```
# 모든 파드를 강제로 삭제
kubectl delete pod --all --force

#모든 종류의 리소스와 파드를 삭제
kubectl delete all --all
```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }