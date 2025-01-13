---
title: "[Kubernetes] Install kubectl"
date: 2021-08-21
categories: [Kubernetes, kubectl]
tags: [Kubernetes, Install, kubectl]
---

> [Reference](https://kubernetes.io/ko/docs/tasks/tools/install-kubectl-linux/)
{: .prompt-info }


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