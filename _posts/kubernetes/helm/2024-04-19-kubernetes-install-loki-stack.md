---
title: "[Kubernetes] Install Loki Stack"
date: 2024-04-19
categories: [Kubernetes, Grafana]
tags: [Kubernetes, Grafana, Loki, Promtail, Install]
---

> Helm 설치 및 설명, [참고](https://kyungryeol-yoon.github.io/posts/kubernetes-install-helm/)
{: .prompt-info }

## Install the Loki Stack Helm charts
- Loki Stack 배포
```shell
helm install loki-stack grafana/loki-stack --namespace [NAMESPACE NAME] --version [VERSION]
```

## Customize Default Configuration
1. Chart
  - https://github.com/grafana/helm-charts/tree/main/charts/loki-stack

2. Realase file.tgz 다운로드
  - https://github.com/grafana/helm-charts/releases

### values.yaml 수정
```shell
vi values.yaml
```

### promtail 수정

### Install
```shell
helm install loki-stack grafana/loki-stack -f values.yaml -n logging
```

```shell
helm install [RELEASE NAME] [Chart.yaml 경로] -f [values.yaml 경로] -n [NAMESPACE NAME]
```

## Uninstall the Chart
```shell
helm uninstall [RELEASE NAME] -n [NAMESPACE NAME]
```

> 설치 참고 : https://grafana.com/docs/grafana/latest/setup-grafana/installation/helm
{: .prompt-info }