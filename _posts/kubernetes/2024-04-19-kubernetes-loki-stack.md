---
title: "[Kubernetes] Loki Stack"
date: 2024-04-19
categories: [Kubernetes, Grafana]
tags: [Kubernetes, Promtail, Loki, Grafana, Install, Helm]
---

> Helm 설치 및 설명, [참고](https://kyungryeol-yoon.github.io/posts/kubernetes-helm/)
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

3. values.yaml 수정
  - 최상위 values.yaml을 수정하면 하위 폴더 values.yaml을 override 한다.

### Install
```shell
helm install loki-stack grafana/loki-stack -f values.yaml -n logging
```

```shell
helm install [RELEASE NAME] [Chart.yaml 경로] -f [YAML 파일 또는 URL에 값 지정 (여러 개를 지정가능)] -n [NAMESPACE NAME]
```

## Uninstall the Chart
```shell
helm uninstall [RELEASE NAME] -n [NAMESPACE NAME]
```