---
title: "[Kubernetes] Install Grafana(v9.5.21) Using Helm Chart"
date: 2024-06-08
categories: [Observability, Grafana]
tags: [kubernetes, grafana, helm, install]
---

> [Helm 설치 및 설명 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-helm/)
{: .prompt-info }

## Install the Grafana Helm charts

- namespace 생성

  ```bash
  kubectl create namespace [NAMESPACE NAME]
  ```

- Grafana 배포

  ```bash
  helm repo add grafana https://grafana.github.io/helm-charts
  helm repo update
  helm install grafana grafana/grafana --namespace [NAMESPACE NAME] --set adminPassword=<your_password>
  ```

  > Grafana - Helm 설치 참고
  - <https://grafana.com/docs/grafana/latest/setup-grafana/installation/helm>
  {: .prompt-info }

- Password 설정하지 않았을 때, 아래와 같이 찾아보기

  ```bash
  kubectl get secret --namespace [NAMESPACE NAME] grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
  ```

- port-forward로 연결하기

  ```bash
  kubectl --namespace [NAMESPACE NAME] port-forward $POD_NAME 3000
  ```

  ```bash
  k3sctl port-forward svc/grafana 3000:80 -n [NAMESPACE NAME]
  ```

## Customize Default Configuration

- values.yaml 수정

  > 최상위 values.yaml을 수정하면 하위 폴더 values.yaml을 override 한다.
  {: .prompt-info }
  
  - Chart
    - <https://github.com/grafana/helm-charts/tree/main/charts/grafana>
  - Release file (.tgz)
    - <https://github.com/grafana/helm-charts/releases>

### Setting Admin

```yaml
...✂...

# Administrator credentials when not using an existing secret (see below)
adminUser: admin
adminPassword: <your_password>

...✂...
```

### Enable persistent storage (recommended)

```yaml
...✂...

persistence:
  type: pvc
  enabled: true
  # storageClassName: default
  accessModes:
    - ReadWriteOnce
  size: 10Gi
  # annotations: {}
  finalizers:
    - kubernetes.io/pvc-protection
  # selectorLabels: {}
  ## Sub-directory of the PV to mount. Can be templated.
  # subPath: ""
  ## Name of an existing PVC. Can be templated.
  # existingClaim:
  ## Extra labels to apply to a PVC.
  extraPvcLabels: {}

...✂...
```

### 외부 접속을 위한 NodePort 설정

```yaml
...✂...

## Expose the grafana service to be accessed from outside the cluster (LoadBalancer service).
## or access it from within the cluster (ClusterIP service). Set the service type and the port to serve it.
## ref: http://kubernetes.io/docs/user-guide/services/
##
service:
  enabled: true
  type: NodePort
  loadBalancerIP: ""
  loadBalancerClass: ""
  loadBalancerSourceRanges: []
  port: 80
  targetPort: 3000
    # targetPort: 4181 To be used with a proxy extraContainer
  ## Service annotations. Can be templated.
  annotations: {}
  labels: {}
  portName: service
  # Adds the appProtocol field to the service. This allows to work with istio protocol selection. Ex: "http" or "tcp"
  appProtocol: ""

...✂...
```

### Install Customize Default Configuration

```bash
helm install [RELEASE NAME] [Chart.yaml 경로] -f [YAML 파일 또는 URL에 값 지정 (여러 개를 지정가능)] -n [NAMESPACE NAME]
```

```bash
helm install grafana grafana/grafana -f override-values.yaml -n [NAMESPACE NAME]
```

## Uninstall the Chart

```bash
helm uninstall [RELEASE NAME] -n [NAMESPACE NAME]
```