---
title: "Istioctl 다운로드 및 설치"
date: 2022-10-17
categories: [Kubernetes, Istio]
tags: [Kubernetes, istioctl, Istio]
---

### 다운로드 및 설치
```terminal
curl -sL https://istio.io/downloadIstioctl | sh -
export PATH=$PATH:$HOME/.istioctl/bin
```

https://github.com/istio/istio/releases

### istio 관련 배포 확인
```terminal
kubectl -n istio-system get deploy
```

### 특정 Namespace에 Istio 설정
```terminal
$ kubectl label namespace <네임스페이스이름> istio-injection=enabled
```