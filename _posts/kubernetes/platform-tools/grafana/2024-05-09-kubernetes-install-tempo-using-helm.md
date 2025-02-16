---
title: "[Kubernetes] Install Tempo Using Helm Chart"
date: 2024-05-09
categories: [Kubernetes, Grafana]
tags: [Kubernetes, Grafana, Tempo, Install]
---

## Tempo

- 트레이스(Trace)는 시스템, 소프트웨어 응용 프로그램 또는 사용자의 이벤트 또는 활동이 시간 순서대로 기록된 정보를 나타낸다.
- Application이 단일 데이터베이스가 있는 모놀리식이든 여러 서비스가 있는 분산 시스템이든 관계없이 Application에서 요청이 취하는 전체 "경로"를 이해하려면 트레이스가 필수적이다.
- 메트릭(Metric)과 로그(Log)은 특정 시스템 내부에서의 동작을 볼 수 있지만, 분산 시스템에서의 문제 해결에는 부족하다.
- 이러한 이유로 트레이스가 필요하며, 이는 디버깅, 성능 분석 및 다양한 시나리오에서의 Application 동작 이해와 같은 다양한 목적으로 사용될 수 있다.
- Tempo는 Grafana Labs에서 개발한 오픈 소스 분산 추적 백엔드(distributed tracing backend)
  - 이는 매우 효율적이고 확장 가능한 방식으로 트레이스 데이터를 저장, 인덱싱 및 검색하기 위해 설계되었다.
  - Tempo는 Grafana 옵저버빌리티(Observability) 스택의 일부이며, Grafana, Prometheus 및 Loki와 긴밀하게 통합된다.
  - 비용 효율적이며 작동하는 데 오브젝트 스토리지만 필요하다.
  - Jaeger, Zipkin 또는 OpenTelemetry를 포함한 오픈 소스 추적 프로토콜과 함께 Tempo를 사용할 수 있다.
  - Tempo는 LogQL과 PromQL에서 영감을 얻은 추적 우선 쿼리 언어인 TraceQL을 구현한다.
    - 이 쿼리 언어를 사용하면 사용자는 매우 정확하고 쉽게 스팬(Span)을 선택하고 지정된 조건을 충족하는 스팬으로 바로 이동할 수 있다.

> [Helm 설치 및 설명 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-helm/)
{: .prompt-info }

## Install the Tempo Helm charts

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
helm install tempo grafana/tempo --namespace [NAMESPACE NAME]
```

> Tempo - Helm 설치 참고
- <https://grafana.com/docs/tempo/latest/setup/helm-chart/>
{: .prompt-info }

## Customize Default Configuration

- values.yaml 수정
  > 최상위 values.yaml을 수정하면 하위 폴더 values.yaml을 override 한다.
  {: .prompt-info }
  - Chart
    - <https://github.com/grafana/helm-charts/tree/main/charts/tempo>
  - Release file (.tgz)
    - <https://github.com/grafana/helm-charts/releases>

### Setting Config

### Install Customize Default Configuration

```bash
helm install [RELEASE NAME] [Chart.yaml 경로] -f [YAML 파일 또는 URL에 값 지정 (여러 개를 지정가능)] -n [NAMESPACE NAME]
```

```bash
helm install tempo grafana/tempo -f override-values.yaml -n [NAMESPACE NAME]
```

## Uninstall the Chart

```bash
helm uninstall [RELEASE NAME] -n [NAMESPACE NAME]
```