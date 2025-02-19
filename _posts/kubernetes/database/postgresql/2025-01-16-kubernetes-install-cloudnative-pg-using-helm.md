---
title: "[Kubernetes] Install CloudNativePG Using Helm Chart"
date: 2025-01-16
categories: [Kubernetes, Database]
tags: [kubernetes, cloudnativepg, postgresql, operator]
---

> [Helm 설치 및 설명 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-helm/)
{: .prompt-info }

## PostgreSQL Helm Repo 추가

```bash
helm repo add cnpg https://cloudnative-pg.github.io/charts
```

```bash
helm repo update
```

## 자신의 환경에 맞게 values.yaml 파일 수정

```yaml
replicaCount: 1

image:
  repository: ghcr.io/cloudnative-pg/cloudnative-pg
  pullPolicy: IfNotPresent
  # -- Overrides the image tag whose default is the chart appVersion.
  tag: ""

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""
namespaceOverride: ""

hostNetwork: false

...✂...

# -- Nodeselector for the operator to be installed.
nodeSelector: {}

# -- Tolerations for the operator to be installed.
tolerations: []

# -- Affinity for the operator to be installed.
affinity: {}

...✂...

```

> Values 참고
- <https://github.com/cloudnative-pg/charts/blob/main/charts/cloudnative-pg/values.yaml>
{: .prompt-info }

## Helm으로 Operator 설치

```bash
helm install cnpg cnpg/cloudnative-pg --namespace [NAMESPACE NAME] -f values.yaml
```

## postgresql 배포

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: mycluster
spec:
  imageName: postgres:17.3
  instances: 3           # 3대 파드 (Primary 1대, Standby 2대가 기본)
  storage:      
    size: 3Gi         
  postgresql:
    parameters:
      max_worker_processes: "40"
      timezone: "Asia/Seoul"
      ssl_min_protocol_version: TLSv1.2
    pg_hba:
      - host all postgres all trust
  primaryUpdateStrategy: unsupervised
  enableSuperuserAccess: true
  bootstrap:
    initdb:
      database: app
      encoding: UTF8
      localeCType: C
      localeCollate: C
      owner: app
```

> Cluster Sample Yaml 참고
- <https://github.com/cloudnative-pg/cloudnative-pg/blob/main/docs/src/samples/cluster-example-full.yaml>
{: .prompt-info }

> Cluster Sample Init DB Yaml 참고
- <https://github.com/cloudnative-pg/cloudnative-pg/blob/main/docs/src/samples/cluster-example-initdb.yaml>
{: .prompt-info }

> Cluster Sample Init DB SQL Refs Yaml 참고
- <https://github.com/cloudnative-pg/cloudnative-pg/blob/main/docs/src/samples/cluster-example-initdb-sql-refs.yaml>
{: .prompt-info }