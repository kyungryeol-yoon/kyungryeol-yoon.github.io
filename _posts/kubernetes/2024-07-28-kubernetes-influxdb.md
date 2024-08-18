---
title: "[Kubernetes] InfluxDB"
date: 2024-07-28
categories: [Kubernetes, InfluxDB]
tags: [Kubernetes, InfluxDB, Install, Helm]
---

> [Helm 설치 및 설명 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-helm/)
{: .prompt-info }

## Install InfluxDB
```shell
helm repo add influxdata https://helm.influxdata.com/
helm repo update
helm install influxdb influxdata/influxdb
```

> [InfluxDB - Helm 설치 참고](https://github.com/influxdata/helm-charts)
{: .prompt-info }

## Customize Default Configuration
- values.yaml 수정
  > 최상위 values.yaml을 수정하면 하위 폴더 values.yaml을 override 한다.
  {: .prompt-info }
  - Chart
    - https://github.com/influxdata/helm-charts/tree/master/charts/influxdb
  - Release file (.tgz)
    - https://github.com/influxdata/helm-charts/releases

> [InfluxDB 설정 및 사용법 참고](https://kyungryeol-yoon.github.io/posts/influxdb/)
{: .prompt-tip }

### Setting config
```
...
config:
  reporting_disabled: false
  rpc:
    bind-address: ":8088"
  meta: {}
  data: {}
  coordinator: {}
  retention: {}
  shard_precreation: {}
  monitor: {}
  http:
    enabled: true
    bind-address: ":8086"
    flux-enabled: true
  logging: {}
  subscriber: {}
  graphite: {}
  collectd: {}
  opentsdb: {}
  udp: {}
  continuous_queries: {}
  tls: {}
...
```

### Setting create database
```
...
initScripts:
  enabled: false
  scripts:
    init.iql: |+
      CREATE DATABASE "telegraf" WITH DURATION 30d REPLICATION 1 NAME "rp_30d"
...
```

> API Create Database
```shell
curl -XPOST 'http://[influxdb-svc].[influxdb-namespace].svc:8086/query' --data-urlencode 'q=CREATE DATABASE mydb'
```
{: .prompt-info }

### Install Customize Default Configuration
```shell
helm install [RELEASE NAME] [Chart.yaml 경로] -f [YAML 파일 또는 URL에 값 지정 (여러 개를 지정가능)] -n [NAMESPACE NAME]
```

```shell
helm install influxdb influxdata/influxdb -f override-values.yaml -n [NAMESPACE NAME]
```