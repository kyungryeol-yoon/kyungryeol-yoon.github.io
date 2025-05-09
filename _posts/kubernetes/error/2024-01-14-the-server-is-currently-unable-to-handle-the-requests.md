---
# layout: post
title: "[Error] kubectl commands error - the server is currently unable to handle the request"
date: 2024-01-14
# excerpt: "The connection to the server localhost:8080 was refused 오류 해결법"
categories: [Kubernetes, Error]
tags: [kubernetes, kubectl]
# comments: true
---

## The server is currently unable to handle the request 오류 해결법

- kubectl 명령어를 입력하면 다음 오류 메시지가 발생하는 경우가 있습니다.
  ```bash
  couldn't get resource list for metrics.k8s.io/v1beta1: the server is currently unable to handle the request

  or

  Error from server (ServiceUnavailable): the server is currently unable to handle the request (get nodes.metrics.k8s.io)
  ```

  ```bash
  E0804 15:08:38.034678    2567 memcache.go:287] couldn't get resource list for metrics.k8s.io/v1beta1: the server is currently unable to handle the request
  E0804 15:08:38.386072    2567 memcache.go:121] couldn't get resource list for metrics.k8s.io/v1beta1: the server is currently unable to handle the request
  E0804 15:08:38.452142    2567 memcache.go:121] couldn't get resource list for metrics.k8s.io/v1beta1: the server is currently unable to handle the request
  E0804 15:08:38.614993    2567 memcache.go:121] couldn't get resource list for metrics.k8s.io/v1beta1: the server is currently unable to handle the request
  ```

### 이 문제는 다음 deploy 수정하면 해결

```bash
kubectl edit deploy -n kube-system metrics-server 

dnsPolicy: ClusterFirst
hostNetwork: true    << 추가
nodeSelector:
  kubernetes.io/os: linux
```