---
title: "[Kubernetes] Istioctl 다운로드 및 설치"
date: 2022-10-17
categories: [Kubernetes, Istio]
tags: [kubernetes, istioctl, istio]
---

## 다운로드 및 설치

```bash
curl -sL https://istio.io/downloadIstioctl | sh -
export PATH=$PATH:$HOME/.istioctl/bin
```

> istioctl 참고
- <https://github.com/istio/istio/releases>
{: .prompt-info }

## istio 관련 배포 확인

```bash
kubectl -n istio-system get deploy
```

## 특정 Namespace에 Istio 설정

```bash
kubectl label namespace <namespace> istio-injection=enabled
```