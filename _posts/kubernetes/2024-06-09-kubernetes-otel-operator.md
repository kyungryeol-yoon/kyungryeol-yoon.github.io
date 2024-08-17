---
title: "[Kubernetes] OTel(OpenTelemetry) Operator"
date: 2024-06-09
categories: [Kubernetes, OpenTelemetry]
tags: [Kubernetes, OpenTelemetry, Operator, Cert-manager, Install, Helm]
---

> Helm 설치 및 설명
  - https://kyungryeol-yoon.github.io/posts/kubernetes-helm/
{: .prompt-info }

## Install Cert-manager
```
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml
```

### OTel(OpenTelemetry) 설치 시 Cert-manager가 필요한 이유
- HTTPS 통신 보안
  OTel(OpenTelemetry) Collector는 기본적으로 HTTP를 통해 데이터를 수집하고 전송하지만,\\
  HTTPS를 사용하여 보안을 강화하는 것이 좋다.\\
  Cert-manager는 인증서 발급 및 관리를 자동화하여 OTel(OpenTelemetry) Collector가 안전하게 HTTPS를 사용하도록 설정하는 데 도움을 준다.

- 인증서 자동 갱신
  HTTPS 인증서는 만료 기간이 있으며, 만료되면 OTel(OpenTelemetry) Collector가 작동하지 않게 된다.\\
  Cert-manager는 인증서가 만료되기 전에 자동으로 갱신하여 서비스 중단을 방지한다.

- 사용 편의성 향상
  Cert-manager를 사용하면 수동으로 인증서를 발급하고 관리하는 번거로움 없이 OpenTelemetry Collector를 안전하게 배포하고 운영할 수 있다.

> OTel(OpenTelemetry) 설치 시 반드시 Cert-manager가 필요한 것은 아니지만, HTTPS를 사용하여 보안을 강화하려는 경우 필수. Cert-manager는 Kubernetes 환경에서만 사용 가능.
{: .prompt-warning }

## Install OpenTelemetry Operator
- 1. Install OpenTelemetry Operator
  ```shell
  kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml
  ```
  > 설치 참고 : https://github.com/open-telemetry/opentelemetry-operator
  {: .prompt-info }

- 2. Install Helm Chart - OpenTelemetry Operator
  ```shell
  helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
  helm repo update
  helm install opentelemetry-operator open-telemetry/opentelemetry-operator --set "manager.collectorImage.repository=otel/opentelemetry-collector-k8s"
  ```
  > **Helm 설치 참고**
    - https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-operator
  {: .prompt-info }

### Opentelemetry Operator가 관리하는 기능 두가지
- Opentelemetry Collector
- auto-instrumentation of the workloads using OpenTelemetry instrumentation libraries

프로젝트가 다수일 경우 매번 Opentelemetry Collector와 auto-instrumentation agent를 같이 띄울 필요 없이 Operator를 활용하여, 프로젝트별로 Collector를 설치할 수 있고 각 서버마다 agent를 명세할 필요 없이 annotation을 통하여 Operator가 해당 Pod에 sidecar 형태로 추가해준다.



## OpenTelemetry Operator 사용하여 OpenTelemetry Collector 배포 할 수 있다.
### OpenTelemetry Collector
- collector에 대한 배포판은 3가지
  - **opentelemetry-collector** : 핵심 기능을 제공
  - **opentelemetry-collector-contrib** : Contrib은 opentelemetry-collector 확장하여 다양한 환경에서 사용될 수 있도록 제작
  - **opentelemetry-collector-k8s** : opentelemetry-collector와 contrib의 구성요소 중 k8s cluster와 구성요소를 모니터링할 수 있도록 특별히 제작


### Node Collector(Daemonset)
- File Logs
- Host metrics
- Kubelet state metrics

- 공식 문서에서 DaemonSet을 권장하는 receiver가 모인 collector이다.

#### Log | Filelog
수집 대상은 stdout/stderr로 생성된 Kubernetes, app log으로,\\
사실상 Fluentbit를 대체한다.\\
이를 위해 log scraping 및 전달 뿐 아니라 Processors 에서 언급한 다양한 processor 사용을 고려해야 한다.

- Receiver: [Filelog Receiver](https://opentelemetry.io/docs/kubernetes/collector/components/#filelog-receiver)
- Exporter: [Loki exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/lokiexporter)

#### Metric | Kubelet Stats
node, pod, container, volume, filesystem network I/O and error metrics 등 CPU, memory 등 infra resource에 관한 metric을 다루어,\\
각 노드의 kubelet이 노출하는 API에서 추출한다. 사실 상 cAdvisor의 대체이다.

- Receiver: [Kubelet Stats Receiver](https://opentelemetry.io/docs/kubernetes/collector/components/#kubeletstats-receiver)
- Exporter: OTLP/HTTP Exporter

#### Metric | Host Metrics
수집 대상은 node (cpu, disk, CPU load, filesystem, memory, network, paging, process..)의 metric으로,\\
사실 상 Prometheus Node Exporter를 대체한다.\\
Kubelet Stats Receiver와 일부 항목이 겹치므로 동시 운용 시 중복 처리가 필요하다.

- Receiver: [Host Metrics Receiver](https://opentelemetry.io/docs/kubernetes/collector/components/#host-metrics-receiver)
- Exporter: OTLP/HTTP Exporter

```yaml
# otel-node-collector service accounts are created automatically
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: otel-node-collector
rules:
  - apiGroups: [""]
    resources: ["nodes/stats", "nodes/proxy"]
    verbs: ["get", "watch", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: otel-node-collector
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: otel-node-collector
subjects:
  - kind: ServiceAccount
    name: otel-node-collector
    namespace: cluster
---
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otel-node
  namespace: cluster
  labels:
    app: otel-node-collector
spec:
  mode: daemonset
  resources:
    # requests:
    #   cpu: 10m
    #   memory: 10Mi
    limits:
      cpu: 500m
      memory: 1000Mi
  podAnnotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "8888"
  env:
    - name: NODE_NAME
      valueFrom:
        fieldRef:
          fieldPath: spec.nodeName
  # volumes:
  #   - name: hostfs
  #     hostPath:
  #       path: /
  # volumeMounts:
  #   - name: hostfs
  #     mountPath: /hostfs
  #     readOnly: true
  #     mountPropagation: HostToContainer
  config:
    extensions:
      health_check: # for k8s liveness and readiness probes
        endpoint: 0.0.0.0:13133 # default

    processors:
      batch: # buffer up to 10000 spans, metric data points, log records for up to 5 seconds
        send_batch_size: 10000
        timeout: 5s
      memory_limiter:
        check_interval: 1s # recommended by official README
        limit_percentage: 80 # in 1Gi memory environment, hard limit is 800Mi
        spike_limit_percentage: 25 # in 1Gi memory environment, soft limit is 500Mi (800 - 250 = 550Mi)

    service:
      extensions:
        - health_check

      telemetry:
        logs:
          level: INFO
        metrics:
          address: 0.0.0.0:8888

      pipelines:
        metrics:
          receivers:
            - kubeletstats
            # - hostmetrics
          processors:
            - memory_limiter
            - batch
          exporters:
            - otlphttp/prometheus

    receivers:
      kubeletstats:
        auth_type: serviceAccount
        endpoint: https://${env:NODE_NAME}:10250
        collection_interval: 10s
        insecure_skip_verify: true
        extra_metadata_labels:
          - k8s.volume.type
        k8s_api_config:
          auth_type: serviceAccount
        metric_groups:
          - node
          - pod
          - container
          - volume

      # hostmetrics:
      #   collection_interval: 10s
      #   root_path: /hostfs
      #   scrapers:
      #     cpu:        # CPU utilization metrics
      #     load:       # CPU load metrics
      #     memory:     # Memory utilization
      #     disk:       # Disk I/O metrics
      #     filesystem: # File System utilization metrics
      #     network:    # Network interface I/O metrics & TCP connection metrics
      #     paging:     # Paging/Swap space utilization and I/O metrics
      #     processes:  # Process count metrics
      #     process:    # Per process CPU, Memory, and Disk I/O metrics
      #       # The following settings can be used to handle the error to work hostmetrics: 2024-05-12T01:06:30.683Z        error   scraperhelper/scrapercontroller.go:197  Error scraping metrics  {"kind": "receiver", "name": "hostmetrics", "data_type": "metrics", "error": "error reading process executable for pid 1: readlink /hostfs/proc/1/exe: permission denied; error reading username for process \"systemd\" (pid 1): open /etc/passwd: no such file or directory;
      #       # refer: https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/28661
      #       mute_process_name_error: true
      #       mute_process_exe_error: true
      #       mute_process_io_error: true
      #       mute_process_user_error: true
      #       mute_process_cgroup_error: true

    exporters:
      debug:
        verbosity: basic # detailed, basic

      otlphttp/prometheus:
        metrics_endpoint: http://prometheus-server.cluster.svc.cluster.local:80/api/v1/otlp/v1/metrics
        tls:
          insecure: true
```

### Cluster Collector(Single Pod)
- k8s events(log)
- k8s objects(metrics)

단일 replica 사용 권장인 receivers 대상으로,\\
이들 receiver는 2개 이상의 instance 사용 시 중복이 발생 가능하기 때문이라고 공식 문서에서 논한다.\\
두 receiver 모두 cluster 관점에서 추출하기 때문이라고. 이에 따라 deployment type에 1개의 replica로 설정한다.

#### Log | Kubernetes Objects
주로 Kubernetes event 수집용으로 Kubernetes API server 출처의 objects(전체 목록은 kubectl api-resources 로 확인) 수집에도 사용한다.

- Receiver: [Kubernetes Objects Receiver](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver)
- Exporter: [Loki exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/lokiexporter)

#### Metric | Kubernetes Cluster
사실 상 Kube State Metrics의 대체로 Kubernetes API server에서 cluster level의 metric과 entity events를 추출한다.

- Receiver: [Kubernetes Cluster Receiver](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-cluster-receiver)
- Exporter: OTLP/HTTP Exporter

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: otel-collector-opentelemetry-collector
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: otel-collector-opentelemetry-collector
rules:
  - apiGroups:
      - ''
    resources:
      - events
      - namespaces
      - namespaces/status
      - nodes
      - nodes/spec
      - pods
      - pods/status
      - replicationcontrollers
      - replicationcontrollers/status
      - resourcequotas
      - services
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - apps
    resources:
      - daemonsets
      - deployments
      - replicasets
      - statefulsets
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - extensions
    resources:
      - daemonsets
      - deployments
      - replicasets
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - batch
    resources:
      - jobs
      - cronjobs
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - autoscaling
    resources:
      - horizontalpodautoscalers
    verbs:
      - get
      - list
      - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: otel-collector-opentelemetry-collector
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: otel-collector-opentelemetry-collector
subjects:
  - kind: ServiceAccount
    name: otel-collector-opentelemetry-collector
    namespace: default
---
# otel-cluster-collector service accounts are created automatically
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otel-cluster
  namespace: cluster
  labels:
    app: otel-cluster-collector
spec:
  mode: deployment
  replicas: 1
  podAnnotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "8888"
  config:
    extensions:
      health_check: # for k8s liveness and readiness probes
        endpoint: 0.0.0.0:13133 # default

    processors:
      batch: # buffer up to 10000 spans, metric data points, log records for up to 5 seconds
        send_batch_size: 10000
        timeout: 5s
      memory_limiter:
        check_interval: 1s # recommended by official README
        limit_percentage: 80 # in 1Gi memory environment, hard limit is 800Mi
        spike_limit_percentage: 25 # in 1Gi memory environment, soft limit is 500Mi (800 - 250 = 550Mi)
      attributes:
        actions:
          key: elasticsearch.index.prefix
          value: otel-k8sobject
          action: insert
    service:
      extensions:
        - health_check

      telemetry:
        logs:
          level: DEBUG
        metrics:
          address: 0.0.0.0:8888

      pipelines:
        logs:
          receivers:
            - k8sobjects
          processors:
            - memory_limiter
            - batch
            - attributes
          exporters:
            - debug
            - elasticsearch

        metrics:
          receivers:
            - k8s_cluster
          processors:
            - memory_limiter
            - batch
          exporters:
            - otlphttp/prometheus

    receivers:
      k8sobjects:
        objects:
          - name: pods
            mode: pull
          - name: events
            mode: watch
      k8s_cluster:
        collection_interval: 10s
        node_conditions_to_report:
          - Ready
          - MemoryPressure
        allocatable_types_to_report:
          - cpu
          - memory
          - ephemeral-storage
          - storage

    exporters:
      debug:
        verbosity: detailed # default is basic

      otlphttp/prometheus:
        metrics_endpoint: http://prometheus-server.cluster.svc.cluster.local:80/api/v1/otlp/v1/metrics
        tls:
          insecure: true

      elasticsearch:
        endpoints:
          - http://elasticsearch-es-http.cluster.svc.cluster.local:9200
        logs_index: ""
        logs_dynamic_index:
          enabled: true
        logstash_format:
          enabled: true
        user: anyflow
        password: mycluster
```

```yaml
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otel-cluster-k8s-events
  namespace: cluster
  labels:
    app: otel-cluster-collector
spec:
  mode: deployment
  replicas: 1
  config:
    receivers:
      k8s_events:
        auth_type: serviceAccount

    processors:
      batch:

    exporters:
      loki:
        endpoint: https://LOKI_USERNAME:ACCESS_POLICY_TOKEN@LOKI_URL/loki/api/v1/push or http://<Loki-svc>.<Loki-Namespace>.svc/loki/api/v1/push
    service:
      pipelines:
        logs:
          receivers: [k8s_events]
          processors: [batch]
          exporters: [loki]
```

### prometheus Collector(statefulset)
- prometheus metrics

### OTLP Collector(Deployment)
- Traces(OTEL)
- Generic OTEL Logs
- Generic OTEL metrics

공용 receiver, exporter 공통적으로 otlp 프로토콜을 사용하고 replica 개수 제약이 없는 signal 대상 collector로서,\\
제약이 없을 경우 가장 운용에 유리한 배포 패턴인 Deployment 를 사용한다. MLT 모두를 대상으로 한다.

#### Trace | Generic OTEL trace
[Jaeger](https://www.jaegertracing.io/docs/next-release/deployment/) 및 [Grafana Tempo](https://grafana.com/docs/grafana-cloud/send-data/otlp/send-data-otlp/)는 OTLP Receiver를 자체적으로 지원한다. 

- Receiver: [OTLP Receiver](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver)
- Exporter: [OTLP Exporter (gRPC)](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/otlpexporter)

#### Metric | Generic OTEL metric
앞서 논한 metric 이외의 app level metrics 등의 여타 metric 수집을 위한 endpoint이다.

- Receiver: [OTLP Receiver](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver)
- Exporter: OTLP/HTTP Exporter

#### Log | Generic OTEL log
Istio의 OTel access log를 포함한 여타 log 수집을 위한 endpoint이다.

- Receiver: [OTLP Receiver](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver)
- Exporter: [Loki exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/lokiexporter)

```yaml
# otel-otlp-collector service accounts are created automatically
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otel-otlp
  namespace: cluster
  labels:
    app: otel-otlp-collector
spec:
  mode: deployment
  # replicas: 1
  autoscaler:
    minReplicas: 1
    maxReplicas: 2
  resources:
    # requests:
    #   cpu: 10m
    #   memory: 10Mi
    limits:
      cpu: 500m
      memory: 1000Mi
  podAnnotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "8888"
  config:
    extensions:
      health_check: # for k8s liveness and readiness probes
        endpoint: 0.0.0.0:13133 # default

    processors:
      batch: # buffer up to 10000 spans, metric data points, log records for up to 5 seconds
        send_batch_size: 10000
        timeout: 5s
      memory_limiter:
        check_interval: 1s # recommended by official README
        limit_percentage: 80 # in 1Gi memory environment, hard limit is 800Mi
        spike_limit_percentage: 25 # in 1Gi memory environment, soft limit is 500Mi (800 - 250 = 550Mi)

    service:
      extensions:
        - health_check

      telemetry:
        logs:
          level: INFO
        metrics:
          address: 0.0.0.0:8888

      pipelines:
        traces:
          receivers:
            - otlp
          processors:
            - memory_limiter
            - batch
          exporters:
            - debug
            - otlp/jaeger

        logs:
          receivers:
            - otlp
          processors:
            - memory_limiter
            - batch
          exporters:
            - debug
            - elasticsearch

        metrics:
          receivers:
            - otlp
          processors:
            - memory_limiter
            - batch
          exporters:
            - debug
            - otlphttp/prometheus

    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318

    exporters:
      debug:
        verbosity: basic # detailed, basic

      otlp/jaeger:
        endpoint: jaeger-collector.istio-system.svc.cluster.local:4317
        tls:
          insecure: true

      otlphttp/prometheus:
        metrics_endpoint: http://prometheus-server.cluster.svc.cluster.local:80/api/v1/otlp/v1/metrics
        tls:
          insecure: true

      elasticsearch:
        endpoints:
          - http://elasticsearch-es-http.cluster.svc.cluster.local:9200
        logs_index: "istio-access-log"
        logs_dynamic_index:
          enabled: true
        logstash_format:
          enabled: true
        user: anyflow
        password: mycluster
```