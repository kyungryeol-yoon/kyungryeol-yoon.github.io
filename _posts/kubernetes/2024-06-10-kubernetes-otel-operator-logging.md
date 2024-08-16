---
title: "[Kubernetes] OTel(OpenTelemetry) - Logging"
date: 2024-06-10
categories: [Kubernetes, OpenTelemetry]
tags: [Kubernetes, OpenTelemetry, Collector, Logging]
---

## OpenTelemetry Collector 배포 및 구성
- vi /etc/rsyslog.conf에 아래의 Code 추가
  ```conf
  *.* action(type="omfwd" target="0.0.0.0" port="54527" protocol="tcp" action.resumeRetryCount="10" queue.type="linkedList" queue.size="10000")
  ```

- syslog 및 container log
  ```yaml
  apiVersion: opentelemetry.io/v1beta1
  kind: OpenTelemetryCollector
  metadata:
    name: otel-log
  spec:
    mode: daemonset
    hostNetwork: true
    podSecurityContext:
      runAsUser: 0
      runAsGroup: 0
    tolerations:
      - operator: Exists
    volumes:
      # Typically the collector will want access to pod logs and container logs
      - name: varlogpods
        hostPath:
          path: /var/log/pods
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
      - name: applogs
        hostPath:
          path: /appdata/applog
    volumeMounts:
      # Mount the volumes to the collector container
      - name: varlogpods
        mountPath: /var/log/pods
        readOnly: true
      - name: varlibdockercontainers
        mountPath: /var/lib/docker/containers
        readOnly: true
      - name: applogs
        mountPath: /appdata/applog
        readOnly: true
    config:
      # This is a new configuration file - do not merge this with your metrics configuration!
      receivers:
        syslog:
          tcp:
            listen_address: '0.0.0.0:54527'
          protocol: rfc3164
          location: UTC or Asia/Seoul # specify server timezone here
          operators:
            - type: move
              from: attributes.message
              to: body
            - type: move
              from: attributes.hostname
              to: resource["hostname"]
            - type: move
              from: attributes.appname
              to: resource["daemon"]

        filelog/applog:
          include:
            - /appdata/applog/*/*/*.log
          operators:
            # Extract metadata from file path
            - type: regex_parser
              id: extract_metadata_from_filepath
              # Pod UID is not always 36 characters long
              regex: '^.*\/(?P<namespace>\S+)\/(?P<pod_name>\S+)\/(?<log_file_name>\S+)\.log$'
              parse_from: attributes["log.file.path"]
              cache:
                size: 128 # default maximum amount of Pods per Node is 110
            # Rename attributes
            - type: move
              from: attributes["log.file.path"]
              to: resource["filename"]
            - type: move
              from: attributes.namespace
              to: resource["namespace"]
            - type: move
              from: attributes.pod_name
              to: resource["pod"]
            - type: add
              field: resource["cluster"]
              value: 'your-cluster-name'

        filelog:
          include:
            - /var/log/pods/*/*/*.log
          exclude:
            # Exclude logs from all containers named otel-collector
            - /var/log/pods/*/otel-collector/*.log
          start_at: beginning
          include_file_path: true
          include_file_name: false
          operators:
            # Find out which format is used by kubernetes
            - type: router
              id: get-format
              routes:
                - output: parser-docker
                  expr: 'body matches "^\\{"'
                - output: parser-crio
                  expr: 'body matches "^[^ Z]+ "'
                - output: parser-containerd
                  expr: 'body matches "^[^ Z]+Z"'
            # Parse CRI-O format
            - type: regex_parser
              id: parser-crio
              regex: '^(?P<time>[^ Z]+) (?P<stream>stdout|stderr) (?P<logtag>[^ ]*) ?(?P<log>.*)$'
              output: extract_metadata_from_filepath
              timestamp:
                parse_from: attributes.time
                layout_type: gotime
                layout: '2006-01-02T15:04:05.999999999Z07:00'
            # Parse CRI-Containerd format
            - type: regex_parser
              id: parser-containerd
              regex: '^(?P<time>[^ ^Z]+Z) (?P<stream>stdout|stderr) (?P<logtag>[^ ]*) ?(?P<log>.*)$'
              output: extract_metadata_from_filepath
              timestamp:
                parse_from: attributes.time
                layout: '%Y-%m-%dT%H:%M:%S.%LZ'
            # Parse Docker format
            - type: json_parser
              id: parser-docker
              output: extract_metadata_from_filepath
              timestamp:
                parse_from: attributes.time
                layout: '%Y-%m-%dT%H:%M:%S.%LZ'
            # Extract metadata from file path
            - type: regex_parser
              id: extract_metadata_from_filepath
              # Pod UID is not always 36 characters long
              regex: '^.*\/(?P<namespace>[^_]+)_(?P<pod_name>[^_]+)_(?P<uid>[a-f0-9\-]{16,36})\/(?P<container_name>[^\._]+)\/(?P<restart_count>\d+)\.log$'
              parse_from: attributes["log.file.path"]
              cache:
                size: 128 # default maximum amount of Pods per Node is 110
            # Rename attributes
            - type: move
              from: attributes["log.file.path"]
              to: resource["filename"]
            - type: move
              from: attributes.container_name
              to: resource["container"]
            - type: move
              from: attributes.namespace
              to: resource["namespace"]
            - type: move
              from: attributes.pod_name
              to: resource["pod"]
            - type: add
              field: resource["cluster"]
              value: 'your-cluster-name' # Set your cluster name here
            - type: move
              from: attributes.log
              to: body

      processors:
        attributes:
          actions:
          - action: insert
            key: loki.resource.labels
            value: hostname, daemon
        resource:
          attributes:
            - action: insert
              key: loki.format
              value: raw
            - action: insert
              key: loki.resource.labels
              value: pod, namespace, container, cluster, filename

      exporters:
        loki:
          endpoint: https://LOKI_USERNAME:ACCESS_POLICY_TOKEN@LOKI_URL/loki/api/v1/push or http://<Loki-svc>.<Loki-Namespace>.svc/loki/api/v1/push

      service:
        pipelines:
          logs:
            receivers: [syslog, filelog/applog, filelog]
            processors: [attributes, resource]
            exporters: [loki]
  ```

- 변경될 Container Log 수집 방법
  ```yaml
  apiVersion: opentelemetry.io/v1beta1
  kind: OpenTelemetryCollector
  metadata:
    name: otel-log
  spec:
    mode: daemonset
    hostNetwork: true
    volumes:
      # Typically the collector will want access to pod logs and container logs
      - name: varlogpods
        hostPath:
          path: /var/log/pods
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
    volumeMounts:
      # Mount the volumes to the collector container
      - name: varlogpods
        mountPath: /var/log/pods
        readOnly: true
      - name: varlibdockercontainers
        mountPath: /var/lib/docker/containers
        readOnly: true
    config:
      # This is a new configuration file - do not merge this with your metrics configuration!
      receivers:
        filelog:
          include_file_path: true
          include:
            - /var/log/pods/*/*/*.log
          operators:
            - id: container-parser
              type: container

      processors:
        resource:
          attributes:
            - action: insert
              key: loki.format
              value: raw
            - action: insert
              key: loki.resource.labels
              value: pod, namespace, container, cluster, filename

      exporters:
        loki:
          endpoint: https://LOKI_USERNAME:ACCESS_POLICY_TOKEN@LOKI_URL/loki/api/v1/push or http://<Loki-svc>.<Loki-Namespace>.svc/loki/api/v1/push

      service:
        pipelines:
          logs:
            receivers: [filelog]
            processors: [resource]
            exporters: [loki]
  ```
  > 참고 : https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/
  {: .prompt-info }

## Node Collector(Daemonset)
- File Logs
- Host metrics
- Kubelet state metrics

- 공식 문서에서 DaemonSet을 권장하는 receiver가 모인 collector이다.

### Log | Filelog
수집 대상은 stdout/stderr로 생성된 Kubernetes, app log으로,\\
사실상 Fluentbit를 대체한다.\\
이를 위해 log scraping 및 전달 뿐 아니라 Processors 에서 언급한 다양한 processor 사용을 고려해야 한다.

- Receiver: [Filelog Receiver](https://opentelemetry.io/docs/kubernetes/collector/components/#filelog-receiver)
- Exporter: [Loki exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/lokiexporter)

### Metric | Kubelet Stats
node, pod, container, volume, filesystem network I/O and error metrics 등 CPU, memory 등 infra resource에 관한 metric을 다루어,\\
각 노드의 kubelet이 노출하는 API에서 추출한다. 사실 상 cAdvisor의 대체이다.

- Receiver: [Kubelet Stats Receiver](https://opentelemetry.io/docs/kubernetes/collector/components/#kubeletstats-receiver)
- Exporter: OTLP/HTTP Exporter

### Metric | Host Metrics
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

## Cluster Collector(Single Pod)
- k8s events(log)
- k8s objects(metrics)

단일 replica 사용 권장인 receivers 대상으로,\\
이들 receiver는 2개 이상의 instance 사용 시 중복이 발생 가능하기 때문이라고 공식 문서에서 논한다.\\
두 receiver 모두 cluster 관점에서 추출하기 때문이라고. 이에 따라 deployment type에 1개의 replica로 설정한다.

### Log | Kubernetes Objects
주로 Kubernetes event 수집용으로 Kubernetes API server 출처의 objects(전체 목록은 kubectl api-resources 로 확인) 수집에도 사용한다.

- Receiver: [Kubernetes Objects Receiver](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver)
- Exporter: [Loki exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/lokiexporter)

### Metric | Kubernetes Cluster
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

## prometheus Collector(statefulset)
- prometheus metrics

## OTLP Collector(Deployment)
- Traces(OTEL)
- Generic OTEL Logs
- Generic OTEL metrics

공용 receiver, exporter 공통적으로 otlp 프로토콜을 사용하고 replica 개수 제약이 없는 signal 대상 collector로서,\\
제약이 없을 경우 가장 운용에 유리한 배포 패턴인 Deployment 를 사용한다. MLT 모두를 대상으로 한다.

### Trace | Generic OTEL trace
[Jaeger](https://www.jaegertracing.io/docs/next-release/deployment/) 및 [Grafana Tempo](https://grafana.com/docs/grafana-cloud/send-data/otlp/send-data-otlp/)는 OTLP Receiver를 자체적으로 지원한다. 

- Receiver: [OTLP Receiver](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver)
- Exporter: [OTLP Exporter (gRPC)](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/otlpexporter)

### Metric | Generic OTEL metric
앞서 논한 metric 이외의 app level metrics 등의 여타 metric 수집을 위한 endpoint이다.

- Receiver: [OTLP Receiver](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver)
- Exporter: OTLP/HTTP Exporter

### Log | Generic OTEL log
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