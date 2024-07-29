---
title: "[Kubernetes] Install OTel(OpenTelemetry)"
date: 2024-06-09
categories: [Kubernetes, OpenTelemetry]
tags: [Kubernetes, OpenTelemetry, Cert-manager, Install]
---

## Install Cert-manager

kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml

OTel(OpenTelemetry) 설치 시 Cert-manager가 필요한 이유는 다음과 같습니다:

1. HTTPS 통신 보안:

OTel(OpenTelemetry) Collector는 기본적으로 HTTP를 통해 데이터를 수집하고 전송하지만, HTTPS를 사용하여 보안을 강화하는 것이 좋습니다. Cert-manager는 인증서 발급 및 관리를 자동화하여 OTel(OpenTelemetry) Collector가 안전하게 HTTPS를 사용하도록 설정하는 데 도움을 줍니다.

2. 인증서 자동 갱신:

HTTPS 인증서는 만료 기간이 있으며, 만료되면 OTel(OpenTelemetry) Collector가 작동하지 않게 됩니다. Cert-manager는 인증서가 만료되기 전에 자동으로 갱신하여 서비스 중단을 방지합니다.

3. 사용 편의성 향상:

Cert-manager를 사용하면 수동으로 인증서를 발급하고 관리하는 번거로움 없이 OpenTelemetry Collector를 안전하게 배포하고 운영할 수 있습니다.

주의 사항:

OTel(OpenTelemetry) 설치 시 반드시 Cert-manager가 필요한 것은 아니지만, HTTPS를 사용하여 보안을 강화하려는 경우 필수적입니다.
Cert-manager는 Kubernetes 환경에서만 사용 가능합니다.


## Install OpenTelemetry
### OpenTelemetry Operator
Kubernetes Operator는 K8s API의 기능을 확장하여 K8s 사용자를 대신해 복잡한 애플리케이션의 인스턴스를 생성, 설정 및 관리하는 애플리케이션별 컨트롤러이고 Opentelemetry Operator는 Kubernetes Operator로 이루어졌다.

Opentelemetry Operator가 관리하는 기능은 두가지다:

Opentelemetry Collector
auto-instrumentation of the workloads using OpenTelemetry instrumentation libraries
프로젝트가 다수일 경우 매번 Opentelemetry Collector와 auto-instrumentation agent를 같이 띄울 필요 없이 Operator를 활용하여 , 프로젝트별로 Collector를 설치할 수 있고 각 서버마다 agent를 명세할 필요 없이 annotation을 통하여 Operator가 해당 Pod에 sidecar 형태로 추가해준다.




OTel(OpenTelemetry) Collector 배포하는 방법은 2가지가 있다.
Helm Chart 사용하는 방법과 OpenTelemetry Operator 사용하여 OpenTelemetry Collector 배포 할 수 있다.
```
kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml
```

> 설치 참고 : https://github.com/open-telemetry/opentelemetry-operator



```
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm repo update
```

> Helm 설치 참고 : https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-operator





### OpenTelemetry Collector

collector에 대한 배포판은 3가지가 있고,
opentelemetry-collector : 핵심 기능을 제공
opentelemetry-collector-contrib : Contrib은 opentelemetry-collector 확장하여 다양한 환경에서 사용될 수 있도록 제작
opentelemetry-collector-k8s : opentelemetry-collector와 contrib의 구성요소 중 k8s cluster와 구성요소를 모니터링할 수 있도록 특별히 제작

1. OpenTelemetry Collector 설치 및 구성

```
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otel-collector-log
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
        include:
          - /var/log/pods/*/*/*.log
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
        endpoint: https://LOKI_USERNAME:ACCESS_POLICY_TOKEN@LOKI_URL/loki/api/v1/push
    service:
      pipelines:
        logs:
          receivers: [filelog]
          processors: [resource]
          exporters: [loki]
```

```
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otel-collector-log
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
        endpoint: https://LOKI_USERNAME:ACCESS_POLICY_TOKEN@LOKI_URL/loki/api/v1/push
    service:
      pipelines:
        logs:
          receivers: [filelog]
          processors: [resource]
          exporters: [loki]
```