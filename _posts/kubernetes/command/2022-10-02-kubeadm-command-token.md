---
# layout: post
title: "[Kubernetes] kubeadm token command"
date: 2022-10-02
categories: [Kubeadm, command]
tags: [kubeadm, command, token]
# comments: true
# pin: true
---

## 기본 구조
```
# Token 생성 - kubeadm join 명령어를 사용하여 Woker Node를 Cluster에 추가할 때 사용
kubeadm token create

# Token 조회 - 현재 사용 가능한 Token 목록을 조회
kubeadm token list

# Token 삭제 - 특정 Token을 삭제
kubeadm token delete [Token]
```

> [명령어] --help를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option
- create: 새로운 Token을 생성
```
# 24시간 동안 유효한 Token을 생성하고, kubeadm join 명령어를 출력
kubeadm token create --ttl 24h --print-join-command
```

- delete: Token을 삭제
```
# abcdef.1234567890abcdef Token을 삭제
kubeadm token delete abcdef.1234567890abcdef
```

- list: 사용 가능한 Token 목록을 조회
```
# 사용 가능한 Token 목록을 조회
kubeadm token list
```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }