---
title: "[Kubernetes] Install Loki Stack"
date: 2024-04-19
categories: [Kubernetes, Grafana]
tags: [Kubernetes, Promtail, Loki, Grafana, Install]
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

### Loki
- https://github.com/grafana/loki
Loki에 대한 소개를 보면 다음과 같다.
"Like Prometheus, but for logs"
Prometheus가 metric을 시계열 데이터로 저장하기 위해 사용된다면 Loki는 log 데이터를 저장하기 위해 사용된다.
https://grafana.com/docs/loki/latest/fundamentals/overview/
Loki는 log data를 효율적으로 보관하기 위해 최적화된 데이터 저장소이다.
다른 logging system과 다르게 Loki index는 label에서 작성되며 원래 log message는 색인화되지 않는다.
Prometheus가 저장과 polling을 담당한 것과 달리 Loki는 저장을 담당하고 application에서 push를 해주는 역할을 해주는 agent가 필요하다.
Promtail agent는 Loki를 위해 설계되었지만 그 외에 다른 많은 agent가 Loki와 원활하게 통합된다.
Loki는 stream을 indexing 한다.
각 steam은 고유한 label set과 연결된 log 집합을 식별한다.
label의 quality set은 간결하고 효율적인 query 실행을 허용하는 index 생성의 핵심이다.
LogQL은 Loki의 query language이다.

Loki의 특징은 다음과 같다.

- log indexing을 위한 효율적인 memory 사용
- multi-tenancy
- LogQL - Prometheus의 query language인 PromQL과 유사하며, log data에서 metric을 생성하는 것이 용이함.
- Scalability - 단일 바이너리로 사용할 수도 있으나 component 별 microservice로 실행될 수도 있음
- Flexibility - 많은 agent가 플러그인을 지원
- Grafana 통합

https://grafana.com/docs/loki/latest/operations/storage/
Loki는 chunk와 index라는 두 가지 유형의 데이터를 저장해야 한다.
Loki는 별도의 stream으로 log를 수신하며 각 steam은 tenant ID와 label set으로 고유하게 식별된다.
stream의 log 항목이 도착하면 chunk로 압축되어 chunk 저장소에 저장된다.index는 각 steam의 label set를 저장하고 개별 chunk에 연결한다.

index에 대해 다음 저장소가 지원된다.

- Single Store (boltdb-shipper)
- Amazon DynamoDB
- Google Bigtable
- Apache Cassandra
- BoltDB

chunk에 대해 다음 저장소가 지원된다.

- Amazon DynamoDB
- Google Bigtable
- Apache Cassandra
- Amazon S3
- Google Cloud Storage
- FlieSystem
- Baidu Object Storage

기본 설정은 storage가 filesystem이며 Amazon S3의 경우 로컬에서 개발 시 minio를 사용할 수도 있다.
https://blog.min.io/how-to-grafana-loki-minio/ 
설정 파일에 대한 자세한 내용은 아래 링크에서 확인할 수 있다.
https://grafana.com/docs/loki/latest/configuration/    
common 아래에 설정을 하면 전체가 공통으로 사용할 설정을 하게 된다.
Loki는 component 별 microservice로 구성할 수 있기 때문에 공통 설정에 대한 항목이 있는 듯하다.
https://grafana.com/docs/loki/latest/fundamentals/architecture/components/
   
Loki의 component는 대략 아래와 같이 있다.

- Distributor - client가 수신하는 stream을 처리하는 역할, steam의 유효성을 확인하고 여러 ingester로 병렬로 전송을 적절하게 제어
- Ingester - storage에 log data를 저장하고 write path 및 read path의 memory 내 쿼리에 대한 log data를 반환
- Query frontend - query 발송의 API endpoint를 제공하는 선택적 서비스
- Querier - LogQL을 사용하여 query를 처리하고 ingester와 storage에서 log를 가져옴

### Promtail
Loki가 로그를 저장하는 역할을 하면 Promtail은 application에서 로그를 전달하는 agent의 역할을 한다.
Promtail 이외에도 Bit, Fluentd, LogStash 등을 사용할 수 있다.
kubernetes는 node 별로 /var/log/pods 아래에 모든 pod의 로그가 기록된다.
daemonset으로 설정하고 node별로 로그를 수집하도록 처리를 하면 된다.
promtail의 설치는 아래 가이드 문서를 참고하면 된다.
https://grafana.com/docs/loki/latest/clients/promtail/installation/

설치 방식은 sidecar, daemonset 방식이 있는데 daemonset 방식을 추천한다고 한다.

- daemonset - 각 노드마다 promtail pod가 실행되어 해당 노드 장비에서 실행 중인 파드의 로그를 추적
- sidecar - 각 파드에 container로 추가되어 실행, 해당 파드 내부에서 로그 파일을 읽어서 Loki로 전송

pod마다 agent 형태로 설정하는 것보다 daemonset을 하나 띄워 해당 node의 pod들을 찾아 로그를 수집하는 것이 훨씬 편한 것 같다.
Prometheus가 저장소와 polling 역할을 같이 담당하는 반면 Promtail은 저장소의 역할은 하지 않고 로그를 찾아 저장소로 push 하는 역할을 한다.
하지만 설정 방식이나 문법은 크게 차이가 없다.

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