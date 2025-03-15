---
title: "[Kubernetes] Install Alloy(v1.7.1) Using Helm Chart"
date: 2025-03-06
categories: [Observability, Alloy]
tags: [kubernetes, alloy, helm, install]
---

> [Helm 설치 및 설명 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-helm/)
{: .prompt-info }

## Install the Helm charts

- namespace 생성

  ```bash
  kubectl create namespace [NAMESPACE NAME]
  ```

- Alloy 배포

  ```bash
  helm repo add grafana https://grafana.github.io/helm-charts
  helm repo update
  helm install --namespace <NAMESPACE> <RELEASE_NAME> grafana/alloy
  ```

  > Alloy - Helm 설치 참고
  - <https://grafana.com/docs/alloy/latest/set-up/install/kubernetes/>
  {: .prompt-info }

## Customize Default Configuration

- values.yaml 수정

  > 최상위 values.yaml을 수정하면 하위 폴더 values.yaml을 override 한다.
  {: .prompt-info }
  
  - Release file (.tgz)
    - <https://github.com/grafana/helm-charts/releases>

### kafka 연결

```yaml
...✂...

alloy:
  configMap:
    # -- Create a new ConfigMap for the config file.
    create: true
    # -- Content to assign to the new ConfigMap.  This is passed into `tpl` allowing for templating from values.
    content: |
      loki.source.kafka "raw" {
        brokers                = ["kafka:9092"]
        topics                 = ["loki"]
        forward_to             = [loki.write.http.receiver]
        relabel_rules          = loki.relabel.kafka.rules
        version                = "2.0.0"
        labels                = {service_name = "raw_kafka"}
      }

      loki.relabel "kafka" {
        forward_to      = [loki.write.http.receiver]
        rule {
          source_labels = ["__meta_kafka_topic"]
          target_label  = "topic"
        }
      }

      loki.write "http" {
        endpoint {
          url = "http://loki:3100/loki/api/v1/push"
        }
      }

    # -- Name of existing ConfigMap to use. Used when create is false.
    name: null
    # -- Key in ConfigMap to get config from.
    key: null

...✂...
```

> 참고 - <https://grafana.com/docs/loki/latest/send-data/alloy/examples/alloy-kafka-logs/>
{: .prompt-info }

### Kafka를 통해 OpenTelemetry logs 수집

```yaml
...✂...

alloy:
  configMap:
    # -- Create a new ConfigMap for the config file.
    create: true
    # -- Content to assign to the new ConfigMap.  This is passed into `tpl` allowing for templating from values.
    content: |
      loki.source.kafka "raw" {
        brokers                = ["kafka:9092"]
        topics                 = ["loki"]
        forward_to             = [loki.write.http.receiver]
        relabel_rules          = loki.relabel.kafka.rules
        version                = "2.0.0"
        labels                = {service_name = "raw_kafka"}
      }

      loki.relabel "kafka" {
        forward_to      = [loki.write.http.receiver]
        rule {
          source_labels = ["__meta_kafka_topic"]
          target_label  = "topic"
        }
      }

      loki.write "http" {
        endpoint {
          url = "http://loki:3100/loki/api/v1/push"
        }
      }


      otelcol.receiver.kafka "default" {
        brokers          = ["kafka:9092"]
        protocol_version = "2.0.0"
        topic           = "otlp"
        encoding        = "otlp_proto"

        output {
          logs    = [otelcol.processor.batch.default.input]
        }
      }

      otelcol.processor.batch "default" {
          output {
              logs = [otelcol.exporter.otlphttp.default.input]
          }
      }

      otelcol.exporter.otlphttp "default" {
        client {
          endpoint = "http://loki:3100/otlp"
        }
      }

    # -- Name of existing ConfigMap to use. Used when create is false.
    name: null
    # -- Key in ConfigMap to get config from.
    key: null

...✂...
```

> 참고 - <https://grafana.com/docs/loki/latest/send-data/alloy/examples/alloy-kafka-logs/>
{: .prompt-info }

### Kubernetes Pods logs 연결

```yaml
...✂...

alloy:
  configMap:
    # -- Create a new ConfigMap for the config file.
    create: true
    # -- Content to assign to the new ConfigMap.  This is passed into `tpl` allowing for templating from values.
    content: |
      loki.write "http" {
        endpoint {
          url = "http://loki:3100/loki/api/v1/push"
        }
      }

      // discovery.kubernetes allows you to find scrape targets from Kubernetes resources.
      // It watches cluster state and ensures targets are continually synced with what is currently running in your cluster.
      discovery.kubernetes "pod" {
        role = "pod"
      }

      // discovery.relabel rewrites the label set of the input targets by applying one or more relabeling rules.
      // If no rules are defined, then the input targets are exported as-is.
      discovery.relabel "pod_logs" {
        targets = discovery.kubernetes.pod.targets

        // Label creation - "namespace" field from "__meta_kubernetes_namespace"
        rule {
          source_labels = ["__meta_kubernetes_namespace"]
          action = "replace"
          target_label = "namespace"
        }

        // Label creation - "pod" field from "__meta_kubernetes_pod_name"
        rule {
          source_labels = ["__meta_kubernetes_pod_name"]
          action = "replace"
          target_label = "pod"
        }

        // Label creation - "container" field from "__meta_kubernetes_pod_container_name"
        rule {
          source_labels = ["__meta_kubernetes_pod_container_name"]
          action = "replace"
          target_label = "container"
        }

        // Label creation -  "app" field from "__meta_kubernetes_pod_label_app_kubernetes_io_name"
        rule {
          source_labels = ["__meta_kubernetes_pod_label_app_kubernetes_io_name"]
          action = "replace"
          target_label = "app"
        }

        // Label creation -  "job" field from "__meta_kubernetes_namespace" and "__meta_kubernetes_pod_container_name"
        // Concatenate values __meta_kubernetes_namespace/__meta_kubernetes_pod_container_name
        rule {
          source_labels = ["__meta_kubernetes_namespace", "__meta_kubernetes_pod_container_name"]
          action = "replace"
          target_label = "job"
          separator = "/"
          replacement = "$1"
        }

        // Label creation - "container" field from "__meta_kubernetes_pod_uid" and "__meta_kubernetes_pod_container_name"
        // Concatenate values __meta_kubernetes_pod_uid/__meta_kubernetes_pod_container_name.log
        rule {
          source_labels = ["__meta_kubernetes_pod_uid", "__meta_kubernetes_pod_container_name"]
          action = "replace"
          target_label = "__path__"
          separator = "/"
          replacement = "/var/log/pods/*$1/*.log"
        }

        // Label creation -  "container_runtime" field from "__meta_kubernetes_pod_container_id"
        rule {
          source_labels = ["__meta_kubernetes_pod_container_id"]
          action = "replace"
          target_label = "container_runtime"
          regex = "^(\\S+):\\/\\/.+$"
          replacement = "$1"
        }
      }

      // loki.source.kubernetes tails logs from Kubernetes containers using the Kubernetes API.
      loki.source.kubernetes "pod_logs" {
        targets    = discovery.relabel.pod_logs.output
        forward_to = [loki.process.pod_logs.receiver]
      }

      // loki.process receives log entries from other Loki components, applies one or more processing stages,
      // and forwards the results to the list of receivers in the component's arguments.
      loki.process "pod_logs" {
        stage.static_labels {
            values = {
              cluster = "<CLUSTER_NAME>",
            }
        }

        forward_to = [loki.write.<WRITE_COMPONENT_NAME>.receiver]
      }

    # -- Name of existing ConfigMap to use. Used when create is false.
    name: null
    # -- Key in ConfigMap to get config from.
    key: null

...✂...
```

> 참고 - <https://grafana.com/docs/alloy/latest/collect/logs-in-kubernetes/#pods-logs>
{: .prompt-info }

### 외부 접속을 위한 NodePort 설정

```yaml
...✂...

service:
  # -- Creates a Service for the controller's pods.
  enabled: true
  # -- Service type
  type: NodePort
  # -- NodePort port. Only takes effect when `service.type: NodePort`
  nodePort: 31128
  # -- Cluster IP, can be set to None, empty "" or an IP address
  clusterIP: ''
  # -- Value for internal traffic policy. 'Cluster' or 'Local'
  internalTrafficPolicy: Cluster
  annotations: {}
    # cloud.google.com/load-balancer-type: Internal

...✂...
```

### 외부 접속을 위한 Ingress 설정

```yaml
...✂...

ingress:
  # -- Enables ingress for Alloy (Faro port)
  enabled: true
  # For Kubernetes >= 1.18 you should specify the ingress-controller via the field ingressClassName
  # See https://kubernetes.io/blog/2020/04/02/improvements-to-the-ingress-api-in-kubernetes-1.18/#specifying-the-class-of-an-ingress
  # ingressClassName: nginx
  # Values can be templated
  annotations:
    {}
    # kubernetes.io/ingress.class: nginx
    # kubernetes.io/tls-acme: "true"
  labels: {}
  path: /
  faroPort: 12345

  # pathType is only for k8s >= 1.1=
  pathType: Prefix

  hosts:
    - chart-example.local
  ## Extra paths to prepend to every host configuration. This is useful when working with annotation based services.
  extraPaths: []
  # - path: /*
  #   backend:
  #     serviceName: ssl-redirect
  #     servicePort: use-annotation
  ## Or for k8s > 1.19
  # - path: /*
  #   pathType: Prefix
  #   backend:
  #     service:
  #       name: ssl-redirect
  #       port:
  #         name: use-annotation

  tls: []
  #  - secretName: chart-example-tls
  #    hosts:
  #      - chart-example.local

...✂...
```

### Install Customize Default Configuration

```bash
helm install -n <NAMESPACE> [RELEASE NAME] [Chart.yaml 경로] -f [YAML 파일 또는 URL에 값 지정 (여러 개를 지정가능)]
```

```bash
helm install --namespace <NAMESPACE> [RELEASE NAME] grafana/alloy -f override-values.yaml
```

## Uninstall the Chart

```bash
helm uninstall [RELEASE NAME] -n [NAMESPACE NAME]
```