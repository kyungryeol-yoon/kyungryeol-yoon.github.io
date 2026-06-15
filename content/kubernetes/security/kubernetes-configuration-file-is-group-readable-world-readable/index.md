---
title: "[Error] Kubernetes configuration file is group-readable, world-readable"
date: 2021-08-22
tags: [kubernetes, kubectl]
description: "kubeconfig가 group/world-readable이라는 경고 해결법. chmod 600으로 ~/.kube/config 권한을 제한해 보안 경고를 제거하는 방법을 정리합니다."
---

## 아래와 같이 Error

```bash
WARNING: Kubernetes configuration file is group-readable. This is insecure. Location: /root/.kube/config
WARNING: Kubernetes configuration file is world-readable. This is insecure. Location: /root/.kube/config
```

## 해결 방법

```bash
sudo chmod o-r ~/.kube/config
sudo chmod g-r ~/.kube/config
```