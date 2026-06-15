---
title: "[Kubernetes] Install kubectl"
date: 2021-08-21
tags: [kubernetes, install, kubectl]
description: "쿠버네티스 CLI kubectl 설치 방법. 바이너리 설치, .kube 디렉터리 생성, kubeconfig 작성으로 클러스터에 접속하는 과정을 정리합니다."
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