---
title: "[Kubernetes] Loki Distributed"
date: 2024-06-19
categories: [Kubernetes, Grafana]
tags: [Kubernetes, Promtail, Loki, Grafana, Install, Helm]
---

> [Helm 설치 및 설명 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-helm/)
{: .prompt-info }

## Install the Loki Distributed Helm charts
```shell
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
helm install loki-distributed grafana/loki-distributed --namespace [NAMESPACE NAME] --version [VERSION]
```

> **설치 참고**
  - https://grafana.com/docs/loki/latest/setup/install/helm/
{: .prompt-info }

## Customize Default Configuration
- values.yaml 수정
  > 최상위 values.yaml을 수정하면 하위 폴더 values.yaml을 override 한다.
  {: .prompt-info }

- Chart : https://github.com/grafana/helm-charts/tree/main/charts/loki-distributed
- Release file (.tgz) : https://github.com/grafana/helm-charts/releases

### Loki Configurations
우선 Loki 설정값을 어떻게 해야 하는지는 공식문서를 자세히 읽어보면 상당히 많이 나온다.

> **Loki 설정값 공식 문서**
- https://grafana.com/docs/loki/latest/configuration/
{: .prompt-info }

1. Grafana Loki 모범 사례
  - https://grafana.com/docs/loki/latest/best-practices/
  - https://grafana.com/blog/2021/02/16/the-essential-config-settings-you-should-use-so-you-wont-drop-logs-in-loki/
  - 레이블은 Loki에서 Log를 검색할 때 필터링이 되는 기준이 되는데 여기선 정적 레이블을 가급적이면 사용하라고 가이드하고 있다.
    - 레이블은 클라이언트에서 설정한다음에 Loki에게 Push하면 된다.
  - chunk_target_size를 사용하라고 한다.
    - 기본 1.5MB 사이즈로 모든 청크 크기를 채우도록 하는게 좋다고 한다.
  - chunk_encoding은 기본값이 gzip인데 snappy를 권고한다고 한다. 이게 훨씬 더 압축을 푸는데도 빠르고 쿼리 속도도 더 빠르다고 한다.
  - max_chunk_age는 2h을 권고한다고 한다. (아마 30분일 것임)
  - chunk_idle_period은 1h ~ 2h을 권고한다고 한다.
  - RF(Replication factor)를 항상 설정할 것을 권고한다.
    - 데이티의 손실 가능성을 완화하기 위해 Ingester의 복제 요소를 일반적으로 3개로 설정할 것을 권고하고 있다.
    - 그러나 복제 요소가 데이터 손실을 방지하는 유일한 요소는 아니며, 주요 목적은 롤아웃 및 재시작 중에 쓰기가 중단되지 않도록 하는 것이다.

2. Request Validation, Rate-Limit 에러
  - https://grafana.com/docs/loki/latest/operations/request-validation-rate-limits/
  - 기본값으로 설정하면 필히 겪게 될 에러들이다.
  - https://grafana.com/docs/loki/latest/configuration/#limits_config
    - 아래의 값으로 설정하면 필히 쓰로틀링이 걸리게 된다. 하여 적절한 값으로 조정이 필요하다.
    - ingestion_rate_mb는 기본값 4이며 ingestion_burst_size_mb는 기본값 6이다.
      - ingestion_rate_mb: 20
      - ingestion_burst_size_mb: 40

3. Loki Grafana 모니터링
  - 실운영하기 위해서는 Loki의 메트릭들을 Grafana와 같은 대시보드에서 확인할 수 있어야 한다.
  - Loki는 기본적으로 /metrics 엔드포인트로부터 각 Components들의 Metric들을 확인할 수 있다.
  - 모든 컴포넌트들의 Service annotation에 아래의 문구를 추가해준다.
    - 메트릭들을 활용하여 Grafana dashboard를 구성하면 된다.
    - 이렇게 하면 Prometheus가 자동으로 /metrics 엔드포인트로 메트릭들을 scrape 해간다.
      ```yaml
      prometheus.io/scrape: "true"
      prometheus.io/path: "/metrics"
      prometheus.io/port: "3100"
      ```
  - Loki에 대한 모니터링 참고
    - https://grafana.com/docs/loki/latest/operations/observability/

#### Compactor와 Table Manager
- Grafana Loki의 로그 보존(Retention)은 Compactor 혹은 Table Manager에 의해 수행된다.
- 현재 Table Manager를 통한 Retention은 TTL을 통해 달성되며 boltdb-shipper, chunk/index store 모두 작동한다.
- Compactor를 통한 Retention은 boltdb-shipper 저장소에서만 지원된다.
- 만약 Compactor로 Retention을 적용한다면 Table Manager는 필요로 하지 않게 될 수 있다.
- 현재 Grafana Loki에서는 Compactor를 중점적으로 개발중인 것 같다. 

- 다음은 Compactor 설정 예시이다.
  ```config
  compactor:
    shared_store: s3
    retention_delete_delay: 2h
    retention_enabled: true
  ```
- Compactor의 Retention은 limits_config에 설정해주면 된다.
  - https://grafana.com/docs/loki/latest/operations/storage/retention/#configuring-the-retention-period

### Install Customize Default Configuration
```shell
helm install [RELEASE NAME] [Chart.yaml 경로] -f [YAML 파일 또는 URL에 값 지정 (여러 개를 지정가능)] -n [NAMESPACE NAME]
```

```shell
helm install loki-distributed grafana/loki-distributed -f override-values.yaml -n [NAMESPACE NAME]
```

## Uninstall the Chart
```shell
helm uninstall [RELEASE NAME] -n [NAMESPACE NAME]
```