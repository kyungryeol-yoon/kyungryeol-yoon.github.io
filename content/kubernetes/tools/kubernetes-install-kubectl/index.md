---
title: "[Kubernetes] Install kubectl"
date: 2021-08-21
tags: [kubernetes, install, kubectl]
---

> 참고
- <https://kubernetes.io/ko/docs/tasks/tools/install-kubectl-linux/>


## Install kubectl

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
```

## `.kube` 폴더 만들기

```bash
mkdir ~/.kube
```

## config 파일 작성

```bash
vi ~/.kube/config
```