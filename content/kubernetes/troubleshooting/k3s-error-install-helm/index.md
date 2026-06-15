---
title: "[Error] K3S Install Helm"
date: 2024-06-06
tags: [kubernetes, k3s, helm, ubuntu, linux, install, error]
description: "K3s에서 Helm 설치 시 발생하는 에러 해결법. KUBECONFIG를 /etc/rancher/k3s/k3s.yaml로 지정해 권한 문제를 해결하는 방법을 정리합니다."
---

## K3S에서 Helm 설치시 아래와 같이 ERROR 발생

```bash
Error: INSTALLATION FAILED: Kubernetes cluster unreachable: Get "http://localhost:8080/version": dial tcp [::1]:8080: connect: connection refused
```

## 아래와 같이 설정

- 검색을 해보면 KUBECONFIG를 /etc/rancher/k3s/k3s.yaml 파일로 잡으라는 설명이 나온다.
  ```bash
  echo 'export KUBECONFIG=/etc/rancher/k3s/k3s.yaml' >> ~/.bashrc
  source ~/.bashrc
  ```