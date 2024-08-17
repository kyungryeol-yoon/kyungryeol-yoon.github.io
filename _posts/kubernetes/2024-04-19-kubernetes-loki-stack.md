---
title: "[Kubernetes] Loki Stack"
date: 2024-04-19
categories: [Kubernetes, Grafana]
tags: [Kubernetes, Promtail, Loki, Grafana, Install, Helm]
---

> Helm 설치 및 설명
  - https://kyungryeol-yoon.github.io/posts/kubernetes-helm/
{: .prompt-info }

## Install the Loki Stack Helm charts
- Loki Stack 배포
  ```shell
  helm repo add grafana https://grafana.github.io/helm-charts
  helm repo update
  helm install loki-stack grafana/loki-stack --namespace [NAMESPACE NAME] --version [VERSION]
  ```

> **설치 참고**
  - https://grafana.com/docs/loki/latest/setup/install/helm/
{: .prompt-info }

## Customize Default Configuration
- values.yaml 수정
  > 최상위 values.yaml을 수정하면 하위 폴더 values.yaml을 override 한다.
  {: .prompt-info }

- Chart : https://github.com/grafana/helm-charts/tree/main/charts/loki-stack
- Release file (.tgz) : https://github.com/grafana/helm-charts/releases

### promtail
#### syslog regex
```
^(?<time>[^ ]* {1,2}[^ ]* [^ ]*) (?<hostname>[^ ]*) (?<daemon>[^ :\[]*)(?:\[(?<pid>[0-9]+)\])?(?:[^\:]*\:)? *(?<message>.*)$
```


### Grafana
https://kyungryeol-yoon.github.io/posts/kubernetes-grafana/

### Install Customize Default Configuration
```shell
helm install [RELEASE NAME] [Chart.yaml 경로] -f [YAML 파일 또는 URL에 값 지정 (여러 개를 지정가능)] -n [NAMESPACE NAME]
```

```shell
helm install loki-stack grafana/loki-stack -f override-values.yaml -n [NAMESPACE NAME]
```

## Uninstall the Chart
```shell
helm uninstall [RELEASE NAME] -n [NAMESPACE NAME]
```