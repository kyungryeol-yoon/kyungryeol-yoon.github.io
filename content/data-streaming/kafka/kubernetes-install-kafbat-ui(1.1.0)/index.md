---
title: "[Kubernetes] Kafbat - Kafka UI(1.1.0)"
date: 2025-03-08
tags: [kubernetes, message broker, ui, kafbat]
description: "Helm으로 쿠버네티스에 Kafbat(Kafka UI, 1.1.0)을 설치하는 방법. Kafka 연결·NodePort 설정 등 values 구성과 배포를 정리합니다."
---

> 💡 [Helm 설치 및 설명 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-helm/)

## Add Repo the Helm charts

```bash
helm repo add kafbat-ui https://kafbat.github.io/helm-charts
```

### values 수정 - kafka 연결 세팅


```yaml
...✂...

yamlApplicationConfig:
  kafka:
    clusters:
      - name: yaml
        bootstrapServers:  kafka-cluster-broker-endpoints:9092
  auth:
    type: disabled
  management:
    health:
      ldap:
        enabled: false

...✂...
```

### values 수정 - NodePort 설정

```yaml
...✂...

yamlApplicationConfig:
  kafka:
    clusters:
      - name: yaml
        bootstrapServers:  my-cluster-kafka-bootstrap.kafka.svc.cluster.local:9092
  auth:
    type: disabled
  management:
    health:
      ldap:
        enabled: false
service:
  ## @param service.type Kafka-UI service type
  type: NodePort
  ## @param service.port Kafka-UI pod port number
  port: 80
  # In case of service type LoadBalancer, you can specify reserved static IP
  # loadBalancerIP: 10.11.12.13
  # if you want to force a specific nodePort. Must be use with service.type=NodePort
  nodePort: 30092

...✂...
```

### Install kafka UI

```bash
helm install -n [NAMESPACE] kafbat-ui kafbat-ui/kafka-ui -f values.yaml
```

> kafbat helm 참고 - <https://github.com/kafbat/helm-charts>
```bash
helm install -n [NAMESPACE] kafka-ui charts/kafka-ui -f charts/kafka-ui/values.yaml
```