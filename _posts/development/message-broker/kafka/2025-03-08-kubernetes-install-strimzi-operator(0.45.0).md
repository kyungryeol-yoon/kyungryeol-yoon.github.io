---
title: "[Kubernetes] Strimzi Operator(0.45.0)"
date: 2025-03-08
categories: [Message Broker, kafka]
tags: [kubernetes, message broker, strimzi, operator]
---

> [Helm 설치 및 설명 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-helm/)
{: .prompt-info }

## 설치 방법

- Operator Yaml (`strimzi-cluster-operator-0.45.0.yaml`)
- Helm (`strimzi-kafka-operator-helm-3-chart-0.45.0.tgz`)
  - <https://github.com/strimzi/strimzi-kafka-operator/tree/main/helm-charts/helm3/strimzi-kafka-operator>
- cluster-operator Yaml 파일 (<https://github.com/strimzi/strimzi-kafka-operator/tree/main/install/cluster-operator>)

> Strimzi Release 참고 - <https://github.com/strimzi/strimzi-kafka-operator/releases>
{: .prompt-info }

## Operator Yaml로 설치

- Namespace kafka에 설치

  ```bash
  kubectl create -f 'https://strimzi.io/install/latest?namespace=kafka' -n kafka
  ```

> watchNamespaces
  - 특정 Namespace에서만 Resource를 감시(watch)하도록 지정하는 기능
watchAnyNamespace
  - Kafka 및 관련 Resource를 관리할 때, 여러 Namespace에서 발생하는 변경 사항을 감시(watch)할 수 있도록 설정하는 옵션
  - 여러 Namespace에서 Kafka 관련 Resource의 생성, 삭제, 업데이트 등을 실시간으로 추적할 수 있다.

```yaml
# If you set `watchNamespaces` to the same value as ``.Release.Namespace` (e.g. `helm ... --namespace $NAMESPACE`),
# the chart will fail because duplicate RoleBindings will be attempted to be created in the same namespace
watchNamespaces: []
watchAnyNamespace: false
```
- <https://github.com/strimzi/strimzi-kafka-operator/blob/main/helm-charts/helm3/strimzi-kafka-operator/values.yaml>
{: .prompt-info }

- 확인

  ```bash
  kubectl get pod -n kafka --watch
  ```

- Log 확인

  ```bash
  kubectl logs deployment/strimzi-cluster-operator -n kafka -f
  ```


### Storage Class 세팅 (Storage Class 및 PersistentVolume 세팅이 되어 있지 않다면)

```yaml
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: local-storage
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
```

#### Patch Storage Class

```bash
kubectl patch storageclass local-storage -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

#### 확인

```bash
kubectl get sc

NAME                      PROVISIONER                    RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
local-storage (default)   kubernetes.io/no-provisioner   Delete          WaitForFirstConsumer   false                  3h16m
```

### PersistentVolume 세팅

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: kafka-pv-volume
  labels:
    type: local
spec:
  storageClassName: local-storage
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/mnt/data"
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: kafka-pv-volume-2
  labels:
    type: local
spec:
  storageClassName: local-storage
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/mnt/data"
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: kafka-pv-volume-3
  labels:
    type: local
spec:
  storageClassName: local-storage
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/mnt/data"
```

## Kafka Single Node - kraft 모드

### Kafka Single Node Yaml 파일 수정 및 참고 - kraft 모드

```yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaNodePool
metadata:
  name: dual-role
  labels:
    strimzi.io/cluster: my-cluster
spec:
  replicas: 1
  roles:
    - controller
    - broker
  storage:
    type: jbod
    volumes:
      - id: 0
        type: persistent-claim
        class: local-storage
        size: 10Gi
        deleteClaim: false
        kraftMetadata: shared
---

apiVersion: kafka.strimzi.io/v1beta2
kind: Kafka
metadata:
  name: my-cluster
  annotations:
    strimzi.io/node-pools: enabled
    strimzi.io/kraft: enabled
spec:
  kafka:
    version: 3.9.0
    metadataVersion: 3.9-IV0
    listeners:
      - name: plain
        port: 9092
        type: internal
        tls: false
      - name: tls
        port: 9093
        type: internal
        tls: true
    template:
      pod:
        securityContext:
          runAsUser: 0
    config:
      offsets.topic.replication.factor: 1
      transaction.state.log.replication.factor: 1
      transaction.state.log.min.isr: 1
      default.replication.factor: 1
      min.insync.replicas: 1
  entityOperator:
    topicOperator: {}
    userOperator: {}
```

> 참고 - <https://github.com/strimzi/strimzi-kafka-operator/tree/main/examples/kafka/kraft>
{: .prompt-info }

### Kafka Single Node 설치 - kraft 모드

```bash
kubectl apply -f https://strimzi.io/examples/latest/kafka/kraft/kafka-single-node.yaml -n kafka 
```

### 준비될 때까지 기다리기

```bash
kubectl wait kafka/my-cluster --for=condition=Ready --timeout=300s -n kafka 
```

## Kafka - kraft 모드

### Kafka Yaml 파일 수정 및 참고 - kraft 모드

```yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaNodePool
metadata:
  name: controller
  labels:
    strimzi.io/cluster: my-cluster
spec:
  replicas: 3
  roles:
    - controller
  storage:
    type: jbod
    volumes:
      - id: 0
        type: persistent-claim
        size: 100Gi
        kraftMetadata: shared
        deleteClaim: false
---

apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaNodePool
metadata:
  name: broker
  labels:
    strimzi.io/cluster: my-cluster
spec:
  replicas: 3
  roles:
    - broker
  storage:
    type: jbod
    volumes:
      - id: 0
        type: persistent-claim
        size: 100Gi
        kraftMetadata: shared
        deleteClaim: false
---

apiVersion: kafka.strimzi.io/v1beta2
kind: Kafka
metadata:
  name: my-cluster
  annotations:
    strimzi.io/node-pools: enabled
    strimzi.io/kraft: enabled
spec:
  kafka:
    version: 3.9.0
    metadataVersion: 3.9-IV0
    listeners:
      - name: plain
        port: 9092
        type: internal
        tls: false
      - name: tls
        port: 9093
        type: internal
        tls: true
    config:
      offsets.topic.replication.factor: 3
      transaction.state.log.replication.factor: 3
      transaction.state.log.min.isr: 2
      default.replication.factor: 3
      min.insync.replicas: 2
  entityOperator:
    topicOperator: {}
    userOperator: {}
```

> 참고 - <https://github.com/strimzi/strimzi-kafka-operator/tree/main/examples/kafka/kraft>
{: .prompt-info }

### Kafka 설치 - kraft 모드

```bash
kubectl apply -f https://strimzi.io/examples/latest/kafka/kraft/kafka.yaml -n kafka 
```

### 준비될 때까지 기다리기

```bash
kubectl wait kafka/my-cluster --for=condition=Ready --timeout=300s -n kafka 
```