---
title: "[Kubernetes] Install Kong Ingress Controller - Gateway API"
date: 2024-11-30
categories: [Gateway, Kong]
tags: [kubernetes, kong, ingress, controller, gateway, api]
---

> [Helm 설치 및 설명 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-helm/)
{: .prompt-info }

> Kong Ingress Controller 참고
- <https://docs.konghq.com/kubernetes-ingress-controller/latest/>
{: .prompt-info }

## Install the experimental Gateway API CRDs

```bash
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.2.1/experimental-install.yaml
```

### Install GatewayClass

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: kong
  annotations:
    konghq.com/gatewayclass-unmanaged: 'true'

spec:
  controllerName: konghq.com/kic-gateway-controller
```

### Install Gateway

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: kong
spec:
  gatewayClassName: kong
  listeners:
  - name: proxy
    port: 80
    protocol: HTTP
    allowedRoutes:
      namespaces:
         from: All
  - name: proxy-ssl
    port: 443
    protocol: HTTPS
    hostname: kong.example.com
    tls:
      mode: Terminate
      certificateRefs:
        - kind: Secret
          name: kong-example-com-cert
  - name: proxy-tcp-9901
    port: 9901
    protocol: TCP
  - name: proxy-udp-9902
    port: 9902
    protocol: UDP
  - name: proxy-tls-9903
    port: 9903
    protocol: TLS
```

## Add Kong Helm Chart

```bash
helm repo add kong https://charts.konghq.com
helm repo update
```

### Modify Values.yaml

```yaml
...✂...

ingressController:
  enabled: true
  env:
    anonymous_reports: false

...✂...

postgresql:
  enabled: true

...✂...
```

### Install Kong

```bash
helm install kong kong/kong -n kong --create-namespace 
```

### Enable the Gateway API Alpha feature gate

```bash
kubectl set env -n kong deployment/kong-controller CONTROLLER_FEATURE_GATES="GatewayAlpha=true" -c ingress-controller
```

## TCP Service

- 포트 기반 라우팅: Kong Gateway는 특정 포트에서 수신한 모든 트래픽을 Kubernetes 서비스로 단순히 프록시한다. TCP 연결은 서비스의 모든 사용 가능한 Pods에 걸쳐 로드 밸런싱된다.

- SNI 기반 라우팅: Kong Gateway는 지정된 포트에서 TLS 암호화된 스트림을 수락하고, TLS 핸드쉐이크에서 제공되는 SNI를 기준으로 트래픽을 다른 서비스로 라우팅할 수 있다. 또한 Kong Gateway는 TLS 핸드쉐이크를 종료하고 TCP 스트림을 Kubernetes 서비스로 전달한한다.

### Patch Deployment kong-gateway

```bash
kubectl patch deploy -n kong kong-gateway --patch '{
   "spec": {
     "template": {
       "spec": {
         "containers": [
           {
             "name": "proxy",
             "env": [
               {
                 "name": "KONG_STREAM_LISTEN",
                 "value": "0.0.0.0:9000, 0.0.0.0:9443 ssl"
               }
             ],
             "ports": [
               {
                 "containerPort": 9000,
                 "name": "stream9000",
                 "protocol": "TCP"
               },
               {
                 "containerPort": 9443,
                 "name": "stream9443",
                 "protocol": "TCP"
               }
             ]
           }
         ]
       }
     }
   }
 }'
```

### Patch Service kong kong-gateway-proxy

```bash
kubectl patch service -n kong kong-gateway-proxy --patch '{
  "spec": {
    "ports": [
      {
        "name": "stream9000",
        "port": 9000,
        "protocol": "TCP",
        "targetPort": 9000
      },
      {
        "name": "stream9443",
        "port": 9443,
        "protocol": "TCP",
        "targetPort": 9443
      }
    ]
  }
}'
```

## Create TCP Ingress

```yaml
echo "apiVersion: configuration.konghq.com/v1beta1
kind: TCPIngress
metadata:
  name: echo-tls
  annotations:
    kubernetes.io/ingress.class: kong
spec:
  tls:
  - secretName: tls9443.kong.example
    hosts:
      - tls9443.kong.example
  rules:
  - host: tls9443.kong.example
    port: 9443
    backend:
      serviceName: echo
      servicePort: 1025
```