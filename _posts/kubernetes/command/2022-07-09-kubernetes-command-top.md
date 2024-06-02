---
# layout: post
title: "[Kubernetes] kubectl top command"
date: 2022-07-09
categories: [Kubernetes, command]
tags: [Kubernetes, kubectl, command, top]
# comments: true
# pin: true
---

## 기본 구조
```
kubectl top [리소스 종류] [리소스 이름]

# Cluster 내 모든 Pod의 리소스 사용량을 확인
kubectl top pods

# Cluster 내 모든 Node의 리소스 사용량을 확인
kubectl top nodes
```

> [명령어] --help를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option
- --containers: Container 단위의 리소스 사용량을 확인
```
# 모든 파드의 Container 단위의 리소스 사용량을 확인
kubectl top pods --containers
```

- --kryoon-namespace: kryoon의 Namespace를 지정
```
# kryoon가 설치된 kube-system Namespace에 대한 Pod의 리소스 사용량을 확인
kubectl top pods --kryoon-namespace=kube-system
```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }