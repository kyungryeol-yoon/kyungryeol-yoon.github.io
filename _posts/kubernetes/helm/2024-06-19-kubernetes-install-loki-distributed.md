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

### values.yaml 수정
```shell
vi values.yaml
```

### 1. loki-stack:
"loki-stack" Helm 차트는 Loki를 단일 노드로 구성하여 배포하는 방법을 제공합니다.
이는 기본적인 Loki 설치를 위해 사용되며, 로그 수집, 저장 및 검색을 단일 노드에서 처리합니다.
이 단일 노드는 다수의 컨테이너로 구성되어 Loki 서버, Prometheus, Grafana 및 Prometheus 메트릭 저장소를 모두 단일 클러스터에 배포합니다.
이 단순한 배포 방식은 개발 및 테스트 용도로 적합할 수 있습니다.

### 2. loki-distributed:
"loki-distributed" Helm 차트는 Loki를 분산 환경에서 배포하기 위해 설계되었습니다.
이 차트는 Loki의 구성 요소들을 다수의 노드로 분산시키고, 데이터를 보다 효율적으로 처리하고 처리 능력을 확장할 수 있도록 도와줍니다.
분산된 Loki를 사용하면 대량의 로그를 처리하는 데 더 적합하며, 고가용성과 확장성을 갖추기 위해 다양한 구성을 가능하게 합니다.

요약하면, loki-stack은 단일 노드로 Loki를 설치하는 데 사용되며, 간단한 테스트 및 개발 환경에서 유용합니다.

반면 loki-distributed는 Loki를 분산 환경으로 배포하여 대규모 로그 처리 및 고가용성이 필요한 경우에 적합합니다.

현재 저희 서비스는 개발 클러스터와 운영 클러스터 두개로 구성되어 있으며, 한 클러스터당 많은 MSA 서버가 가동되는 것을 감안하여, loki-distributed를 사용하는 것으로 결정했습니다.

### Install
```shell
helm install loki-distributed grafana/loki-distributed -f values.yaml -n logging
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