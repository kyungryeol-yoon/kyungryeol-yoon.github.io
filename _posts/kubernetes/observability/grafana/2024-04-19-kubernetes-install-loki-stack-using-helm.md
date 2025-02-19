---
title: "[Kubernetes] Install Loki Stack Using Helm Chart"
date: 2024-04-19
categories: [Kubernetes, Observability]
tags: [kubernetes, promtail, loki, grafana, install, helm]
render_with_liquid: false
---

> [Helm 설치 및 설명 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-helm/)
{: .prompt-info }

## Install the Loki Stack Helm charts

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
helm install loki-stack grafana/loki-stack --namespace [NAMESPACE NAME] --version [VERSION]
```

> Loki Stack - Helm 설치 참고
- <https://grafana.com/docs/loki/latest/setup/install/helm/>
{: .prompt-info }

## Customize Default Configuration

- values.yaml 수정

  > 최상위 values.yaml을 수정하면 하위 폴더 values.yaml을 override 한다.
  {: .prompt-info }
  
  - Chart
    - <https://github.com/grafana/helm-charts/tree/main/charts/loki-stack>
  - Release file (.tgz)
    - <https://github.com/grafana/helm-charts/releases>

### Setting Promtail

```yaml
promtail:
  enabled: true
  config:
    logLevel: info
    serverPort: 3101
    clients:
      - url: http://{{ .Release.Name }}:3100/loki/api/v1/push
```

> [Promtail 설치 및 설정 관련 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-install-promtail-using-helm/)
{: .prompt-info }

### Setting Loki

```yaml
loki:
  enabled: true
  isDefault: true
  url: http://{{(include "loki.serviceName" .)}}:{{ .Values.loki.service.port }}
  readinessProbe:
    httpGet:
      path: /ready
      port: http-metrics
    initialDelaySeconds: 45
  livenessProbe:
    httpGet:
      path: /ready
      port: http-metrics
    initialDelaySeconds: 45
  datasource:
    jsonData: "{}"
    uid: ""
```

> [Loki 관련 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-loki/)
{: .prompt-info }

### Setting Grafana

```yaml
grafana:
  enabled: false
  sidecar:
    datasources:
      label: ""
      labelValue: ""
      enabled: true
      maxLines: 1000
  image:
    tag: 10.3.3
```

> [Grafana 설치 및 설정 관련 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-install-grafana-using-helm/)
{: .prompt-info }

### Install Customize Default Configuration

```bash
helm install [RELEASE NAME] [Chart.yaml 경로] -f [YAML 파일 또는 URL에 값 지정 (여러 개를 지정가능)] -n [NAMESPACE NAME]
```

```bash
helm install loki-stack grafana/loki-stack -f override-values.yaml -n [NAMESPACE NAME]
```

## Uninstall the Chart

```bash
helm uninstall [RELEASE NAME] -n [NAMESPACE NAME]
```