---
title: "[Kubernetes] Istioctl 다운로드 및 설치"
date: 2022-10-17
tags: [kubernetes, istioctl, istio, service-mesh]
description: "Istio CLI istioctl 다운로드·설치 방법. 설치 확인, 네임스페이스에 Istio 사이드카 주입 설정 과정을 정리합니다."
---

## 다운로드 및 설치

```bash
curl -sL https://istio.io/downloadIstioctl | sh -
export PATH=$PATH:$HOME/.istioctl/bin
```

> istioctl 참고
- <https://github.com/istio/istio/releases>

## istio 관련 배포 확인

```bash
kubectl -n istio-system get deploy
```

## 특정 Namespace에 Istio 설정

```bash
kubectl label namespace <namespace> istio-injection=enabled
```