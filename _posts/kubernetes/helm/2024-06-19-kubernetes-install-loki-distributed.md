---
title: "[Kubernetes] Install Loki Distributed"
date: 2024-06-19
categories: [Kubernetes, Grafana]
tags: [Kubernetes, Promtail, Loki, Grafana, Install]
---

> Helm 설치 및 설명, [참고](https://kyungryeol-yoon.github.io/posts/kubernetes-install-helm/)
{: .prompt-info }

## Install the Loki Distributed Helm charts
- Loki Distributed 배포
  ```shell
  helm install loki-distributed grafana/loki-distributed --namespace [NAMESPACE NAME] --version [VERSION]
  ```

## Customize Default Configuration
1. Chart
  - https://github.com/grafana/helm-charts/tree/main/charts/loki-distributed

2. Realase file.tgz 다운로드
  - https://github.com/grafana/helm-charts/releases

3. values.yaml 수정

### Install
```shell
helm install loki-distributed grafana/loki-distributed -f values.yaml -n logging
```

```shell
helm install [RELEASE NAME] [Chart.yaml 경로] -f [YAML 파일 또는 URL에 값 지정 (여러 개를 지정가능)] -n [NAMESPACE NAME]
```

## Uninstall the Chart
```shell
helm uninstall [RELEASE NAME] -n [NAMESPACE NAME]
```