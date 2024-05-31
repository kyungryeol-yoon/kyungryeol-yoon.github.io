---
# layout: post
title: "Kubeadm list command"
date: 2022-09-22
categories: [Kubeadm, command]
tags: [kubeadm, , command, list]
# comments: true
# pin: true
---

## 기본 구조
```
# component는 확인하려는 구성 요소를 지정. 지정하지 않으면, 모든 구성 요소를 확인
kubeadm list [component]
```

- kube-apiserver 
- kube-controller-manager 
- kube-scheduler 
- etcd 
- kube-proxy 
- kubelet

> [명령어] --help를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

### Option
- --kubeconfig: kubeconfig 파일을 지정
```
sudo kubeadm list --kubeconfig=/path/to/kubeconfig
```

- --output: 출력 형식을 지정
```
# JSON 형식으로 출력
sudo kubeadm list --output=json
```

> 자주 쓰는 명령어는 [kubectl-cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
{: .prompt-info }