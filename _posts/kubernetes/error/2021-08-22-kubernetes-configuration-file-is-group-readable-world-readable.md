---
title: "[Error] Kubernetes configuration file is group-readable, world-readable"
date: 2021-08-22
categories: [Kubernetes, Error]
tags: [Kubernetes, kubectl]
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