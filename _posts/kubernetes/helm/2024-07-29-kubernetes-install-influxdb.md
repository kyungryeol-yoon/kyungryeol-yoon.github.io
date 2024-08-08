---
title: "[Kubernetes] Install InfluxDB"
date: 2024-08-08
categories: [Kubernetes, InfluxDB]
tags: [Kubernetes, InfluxDB, Install]
---

## Install InfluxDB

```
helm repo add influxdata https://helm.influxdata.com
helm repo update
helm install influxdb influxdata/influxdb
```

```
helm install influxdb influxdata/influxdb -f influxdb-values.yaml
```


```
curl -XPOST 'http://<LoadBalancer-IP>:8086/query' --data-urlencode 'q=CREATE DATABASE mydb'
```