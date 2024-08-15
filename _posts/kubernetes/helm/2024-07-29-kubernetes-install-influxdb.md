---
title: "[Kubernetes] Install InfluxDB"
date: 2024-08-08
categories: [Kubernetes, InfluxDB]
tags: [Kubernetes, InfluxDB, Install]
---

> Helm 설치 및 설명, [참고](https://kyungryeol-yoon.github.io/posts/kubernetes-install-helm/)
{: .prompt-info }

## Install InfluxDB
- Helm install
```shell
helm install influxdb influxdata/influxdb
```

## Customize Default Configuration
```shell
helm install influxdb influxdata/influxdb -f influxdb-values.yaml -n [NAMESPACE NAME]
```


```shell
curl -XPOST 'http://<LoadBalancer-IP>:8086/query' --data-urlencode 'q=CREATE DATABASE mydb'
```