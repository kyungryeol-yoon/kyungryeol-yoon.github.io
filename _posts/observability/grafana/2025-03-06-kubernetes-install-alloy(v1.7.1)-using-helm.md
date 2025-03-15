---
title: "[Kubernetes] Install Alloy(v1.7.1) Using Helm Chart"
date: 2025-03-06
categories: [Observability, Alloy]
tags: [kubernetes, alloy, helm, install]
---

> [Helm 설치 및 설명 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-helm/)
{: .prompt-info }

## Install the Helm charts

- namespace 생성

  ```bash
  kubectl create namespace [NAMESPACE NAME]
  ```

- Alloy 배포

  ```bash
  helm repo add grafana https://grafana.github.io/helm-charts
  helm repo update
  helm install --namespace <NAMESPACE> <RELEASE_NAME> grafana/alloy
  ```

  > Alloy - Helm 설치 참고
  - <https://grafana.com/docs/alloy/latest/set-up/install/kubernetes/>
  {: .prompt-info }

## Customize Default Configuration

- values.yaml 수정

  > 최상위 values.yaml을 수정하면 하위 폴더 values.yaml을 override 한다.
  {: .prompt-info }
  
  - Release file (.tgz)
    - <https://github.com/grafana/helm-charts/releases>


### 외부 접속을 위한 NodePort 설정

```yaml
...✂...

service:
  # -- Creates a Service for the controller's pods.
  enabled: true
  # -- Service type
  type: NodePort
  # -- NodePort port. Only takes effect when `service.type: NodePort`
  nodePort: 31128
  # -- Cluster IP, can be set to None, empty "" or an IP address
  clusterIP: ''
  # -- Value for internal traffic policy. 'Cluster' or 'Local'
  internalTrafficPolicy: Cluster
  annotations: {}
    # cloud.google.com/load-balancer-type: Internal

...✂...
```

### 외부 접속을 위한 Ingress 설정

```yaml
...✂...

ingress:
  # -- Enables ingress for Alloy (Faro port)
  enabled: true
  # For Kubernetes >= 1.18 you should specify the ingress-controller via the field ingressClassName
  # See https://kubernetes.io/blog/2020/04/02/improvements-to-the-ingress-api-in-kubernetes-1.18/#specifying-the-class-of-an-ingress
  # ingressClassName: nginx
  # Values can be templated
  annotations:
    {}
    # kubernetes.io/ingress.class: nginx
    # kubernetes.io/tls-acme: "true"
  labels: {}
  path: /
  faroPort: 12345

  # pathType is only for k8s >= 1.1=
  pathType: Prefix

  hosts:
    - chart-example.local
  ## Extra paths to prepend to every host configuration. This is useful when working with annotation based services.
  extraPaths: []
  # - path: /*
  #   backend:
  #     serviceName: ssl-redirect
  #     servicePort: use-annotation
  ## Or for k8s > 1.19
  # - path: /*
  #   pathType: Prefix
  #   backend:
  #     service:
  #       name: ssl-redirect
  #       port:
  #         name: use-annotation

  tls: []
  #  - secretName: chart-example-tls
  #    hosts:
  #      - chart-example.local

...✂...
```

### Install Customize Default Configuration

```bash
helm install -n <NAMESPACE> [RELEASE NAME] [Chart.yaml 경로] -f [YAML 파일 또는 URL에 값 지정 (여러 개를 지정가능)]
```

```bash
helm install --namespace <NAMESPACE> [RELEASE NAME] grafana/alloy -f override-values.yaml
```

## Uninstall the Chart

```bash
helm uninstall [RELEASE NAME] -n [NAMESPACE NAME]
```