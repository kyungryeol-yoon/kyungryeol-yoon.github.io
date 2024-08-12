---
title: "[Kubernetes] Install InfluxDB"
date: 2024-08-08
categories: [Kubernetes, InfluxDB]
tags: [Kubernetes, InfluxDB, Install]
---

> Helm이 설치되어 있지 않다면, [설치 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-install-helm/)
{: .prompt-info }

## Install InfluxDB
- Helm repo 저장소 추가
```shell
helm repo add influxdata https://helm.influxdata.com
```
> 이전에 repository를 추가한 경우, 아래 명령을 실행하여 최신 버전의 패키지를 가져온다.
{: .prompt-info }

- Helm repo 저장소 업데이트
```shell
helm repo update
```

- Helm install
```shell
helm install influxdb influxdata/influxdb
```

## Customizing Install InfluxDB
```shell
helm install influxdb influxdata/influxdb -f influxdb-values.yaml
```


```shell
curl -XPOST 'http://<LoadBalancer-IP>:8086/query' --data-urlencode 'q=CREATE DATABASE mydb'
```