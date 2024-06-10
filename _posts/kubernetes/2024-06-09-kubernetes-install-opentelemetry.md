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


## opentelemetry-collector sample values.yaml
```
# Default values for opentelemetry-collector.
# This is a YAML-formatted file.
# Declare variables to be passed into your templates.

nameOverride: ""
fullnameOverride: ""

# Valid values are "daemonset", "deployment", and "statefulset".
mode: "daemonset"

# Specify which namespace should be used to deploy the resources into
namespaceOverride: ""

# Handles basic configuration of components that
# also require k8s modifications to work correctly.
# .Values.config can be used to modify/add to a preset
# component configuration, but CANNOT be used to remove
# preset configuration. If you require removal of any
# sections of a preset configuration, you cannot use
# the preset. Instead, configure the component manually in
# .Values.config and use the other fields supplied in the
# values.yaml to configure k8s as necessary.
presets:
  # Configures the collector to collect logs.
  # Adds the filelog receiver to the logs pipeline
  # and adds the necessary volumes and volume mounts.
  # Best used with mode = daemonset.
  # See https://opentelemetry.io/docs/kubernetes/collector/components/#filelog-receiver for details on the receiver.
  logsCollection:
    enabled: true
    includeCollectorLogs: false
    # Enabling this writes checkpoints in /var/lib/otelcol/ host directory.
    # Note this changes collector's user to root, so that it can write to host directory.
    storeCheckpoints: false
    # The maximum bytes size of the recombined field.
    # Once the size exceeds the limit, all received entries of the source will be combined and flushed.
    maxRecombineLogSize: 102400
  # Configures the collector to collect host metrics.
  # Adds the hostmetrics receiver to the metrics pipeline
  # and adds the necessary volumes and volume mounts.
  # Best used with mode = daemonset.
  # See https://opentelemetry.io/docs/kubernetes/collector/components/#host-metrics-receiver for details on the receiver.
  hostMetrics:
    enabled: true
  # Configures the Kubernetes Processor to add Kubernetes metadata.
  # Adds the k8sattributes processor to all the pipelines
  # and adds the necessary rules to ClusteRole.
  # Best used with mode = daemonset.
  # See https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor for details on the receiver.
  kubernetesAttributes:
    enabled: true
    # When enabled the processor will extra all labels for an associated pod and add them as resource attributes.
    # The label's exact name will be the key.
    extractAllPodLabels: false
    # When enabled the processor will extra all annotations for an associated pod and add them as resource attributes.
    # The annotation's exact name will be the key.
    extractAllPodAnnotations: false
  # Configures the collector to collect node, pod, and container metrics from the API server on a kubelet..
  # Adds the kubeletstats receiver to the metrics pipeline
  # and adds the necessary rules to ClusteRole.
  # Best used with mode = daemonset.
  # See https://opentelemetry.io/docs/kubernetes/collector/components/#kubeletstats-receiver for details on the receiver.
  kubeletMetrics:
    enabled: true
  # Configures the collector to collect kubernetes events.
  # Adds the k8sobject receiver to the logs pipeline
  # and collects kubernetes events by default.
  # Best used with mode = deployment or statefulset.
  # See https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver for details on the receiver.
  kubernetesEvents:
    enabled: true
  # Configures the Kubernetes Cluster Receiver to collect cluster-level metrics.
  # Adds the k8s_cluster receiver to the metrics pipeline
  # and adds the necessary rules to ClusteRole.
  # Best used with mode = deployment or statefulset.
  # See https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-cluster-receiver for details on the receiver.
  clusterMetrics:
    enabled: false

configMap:
  # Specifies whether a configMap should be created (true by default)
  create: true
  # Specifies an existing ConfigMap to be mounted to the pod
  # The ConfigMap MUST include the collector configuration via a key named 'relay' or the collector will not start.
  existingName: ""

# Base collector configuration.
# Supports templating. To escape existing instances of {{ }}, use {{` <original content> `}}.
# For example, {{ REDACTED_EMAIL }} becomes {{` {{ REDACTED_EMAIL }} `}}.
config:
  exporters:
    # prometheus:
    #   endpoint: "http://prometheus-server.prometheus.svc.cluster.local:9090/api/v1/write" # Prometheus 엔드포인트 URL
    loki:
      endpoint: "http://loki.monitoring.svc.cluster.local:3100/loki/api/v1/push" # Grafana Loki 엔드포인트 URL
  extensions:
    # The health_check extension is mandatory for this chart.
    # Without the health_check extension the collector will fail the readiness and liveliness probes.
    # The health_check extension can be modified, but should never be removed.
    health_check:
      endpoint: ${env:MY_POD_IP}:13133
    memory_ballast: {}
  processors:
    batch: {}
    # If set to null, will be overridden with values based on k8s resource limits
    memory_limiter: null
  receivers:
    otlp:
      protocols:
        grpc:
          endpoint: ${env:MY_POD_IP}:4317
        http:
          endpoint: ${env:MY_POD_IP}:4318
  service:
    telemetry:
      metrics:
        address: ${env:MY_POD_IP}:8888
    extensions:
      - health_check
      - memory_ballast
    pipelines:
      logs:
        exporters:
          - loki
        processors:
          - memory_limiter
          - batch
        receivers:
          - otlp
      # metrics:
      #   exporters:
      #     - prometheus
      #   processors:
      #     - memory_limiter
      #     - batch
      #   receivers:
      #     - otlp
      # traces:
      #   exporters:
      #     - debug
      #   processors:
      #     - memory_limiter
      #     - batch
      #   receivers:
      #     - otlp
image:
  # If you want to use the core image `otel/opentelemetry-collector`, you also need to change `command.name` value to `otelcol`.
  repository: "otel/opentelemetry-collector-contrib"
  pullPolicy: IfNotPresent
  # Overrides the image tag whose default is the chart appVersion.
  tag: "0.102.1"
  # When digest is set to a non-empty value, images will be pulled by digest (regardless of tag value).
  digest: ""
imagePullSecrets: []

# OpenTelemetry Collector executable
command:
  name: ""
  extraArgs: []

serviceAccount:
  # Specifies whether a service account should be created
  create: true
  # Annotations to add to the service account
  annotations: {}
  # The name of the service account to use.
  # If not set and create is true, a name is generated using the fullname template
  name: ""

clusterRole:
  # Specifies whether a clusterRole should be created
  # Some presets also trigger the creation of a cluster role and cluster role binding.
  # If using one of those presets, this field is no-op.
  create: false
  # Annotations to add to the clusterRole
  # Can be used in combination with presets that create a cluster role.
  annotations: {}
  # The name of the clusterRole to use.
  # If not set a name is generated using the fullname template
  # Can be used in combination with presets that create a cluster role.
  name: ""
  # A set of rules as documented here : https://kubernetes.io/docs/reference/access-authn-authz/rbac/
  # Can be used in combination with presets that create a cluster role to add additional rules.
  rules: []
  # - apiGroups:
  #   - ''
  #   resources:
  #   - 'pods'
  #   - 'nodes'
  #   verbs:
  #   - 'get'
  #   - 'list'
  #   - 'watch'

  clusterRoleBinding:
    # Annotations to add to the clusterRoleBinding
    # Can be used in combination with presets that create a cluster role binding.
    annotations: {}
    # The name of the clusterRoleBinding to use.
    # If not set a name is generated using the fullname template
    # Can be used in combination with presets that create a cluster role binding.
    name: ""

podSecurityContext: {}
securityContext: {}

nodeSelector: {}
tolerations: []
affinity: {}
topologySpreadConstraints: []

# Allows for pod scheduler prioritisation
priorityClassName: ""

extraEnvs: []
extraEnvsFrom: []
extraVolumes: []
extraVolumeMounts: []

# Configuration for ports
# nodePort is also allowed
ports:
  otlp:
    enabled: true
    containerPort: 4317
    servicePort: 4317
    hostPort: 4317
    protocol: TCP
    # nodePort: 30317
    appProtocol: grpc
  otlp-http:
    enabled: true
    containerPort: 4318
    servicePort: 4318
    hostPort: 4318
    protocol: TCP
  jaeger-compact:
    enabled: true
    containerPort: 6831
    servicePort: 6831
    hostPort: 6831
    protocol: UDP
  jaeger-thrift:
    enabled: true
    containerPort: 14268
    servicePort: 14268
    hostPort: 14268
    protocol: TCP
  jaeger-grpc:
    enabled: true
    containerPort: 14250
    servicePort: 14250
    hostPort: 14250
    protocol: TCP
  zipkin:
    enabled: true
    containerPort: 9411
    servicePort: 9411
    hostPort: 9411
    protocol: TCP
  metrics:
    # The metrics port is disabled by default. However you need to enable the port
    # in order to use the ServiceMonitor (serviceMonitor.enabled) or PodMonitor (podMonitor.enabled).
    enabled: false
    containerPort: 8888
    servicePort: 8888
    protocol: TCP

# Resource limits & requests. Update according to your own use case as these values might be too low for a typical deployment.
resources: {}
# resources:
#   limits:
#     cpu: 250m
#     memory: 512Mi

podAnnotations: {}

podLabels: {}

# Common labels to add to all otel-collector resources. Evaluated as a template.
additionalLabels: {}
#  app.kubernetes.io/part-of: my-app

# Host networking requested for this pod. Use the host's network namespace.
hostNetwork: false

# Adding entries to Pod /etc/hosts with HostAliases
# https://kubernetes.io/docs/tasks/network/customize-hosts-file-for-pods/
hostAliases: []
  # - ip: "1.2.3.4"
  #   hostnames:
  #     - "my.host.com"

# Pod DNS policy ClusterFirst, ClusterFirstWithHostNet, None, Default, None
dnsPolicy: ""

# Custom DNS config. Required when DNS policy is None.
dnsConfig: {}

# only used with deployment mode
replicaCount: 1

# only used with deployment mode
revisionHistoryLimit: 10

annotations: {}

# List of extra sidecars to add.
# This also supports template content, which will eventually be converted to yaml.
extraContainers: []
# extraContainers:
#   - name: test
#     command:
#       - cp
#     args:
#       - /bin/sleep
#       - /test/sleep
#     image: busybox:latest
#     volumeMounts:
#       - name: test
#         mountPath: /test

# List of init container specs, e.g. for copying a binary to be executed as a lifecycle hook.
# This also supports template content, which will eventually be converted to yaml.
# Another usage of init containers is e.g. initializing filesystem permissions to the OTLP Collector user `10001` in case you are using persistence and the volume is producing a permission denied error for the OTLP Collector container.
initContainers: []
# initContainers:
#   - name: test
#     image: busybox:latest
#     command:
#       - cp
#     args:
#       - /bin/sleep
#       - /test/sleep
#     volumeMounts:
#       - name: test
#         mountPath: /test
#  - name: init-fs
#    image: busybox:latest
#    command:
#      - sh
#      - '-c'
#      - 'chown -R 10001: /var/lib/storage/otc' # use the path given as per `extensions.file_storage.directory` & `extraVolumeMounts[x].mountPath`
#    volumeMounts:
#      - name: opentelemetry-collector-data # use the name of the volume used for persistence
#        mountPath: /var/lib/storage/otc # use the path given as per `extensions.file_storage.directory` & `extraVolumeMounts[x].mountPath`

# Pod lifecycle policies.
lifecycleHooks: {}
# lifecycleHooks:
#   preStop:
#     exec:
#       command:
#       - /test/sleep
#       - "5"

# liveness probe configuration
# Ref: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
##
livenessProbe:
  # Number of seconds after the container has started before startup, liveness or readiness probes are initiated.
  # initialDelaySeconds: 1
  # How often in seconds to perform the probe.
  # periodSeconds: 10
  # Number of seconds after which the probe times out.
  # timeoutSeconds: 1
  # Minimum consecutive failures for the probe to be considered failed after having succeeded.
  # failureThreshold: 1
  # Duration in seconds the pod needs to terminate gracefully upon probe failure.
  # terminationGracePeriodSeconds: 10
  httpGet:
    port: 13133
    path: /

# readiness probe configuration
# Ref: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
##
readinessProbe:
  # Number of seconds after the container has started before startup, liveness or readiness probes are initiated.
  # initialDelaySeconds: 1
  # How often (in seconds) to perform the probe.
  # periodSeconds: 10
  # Number of seconds after which the probe times out.
  # timeoutSeconds: 1
  # Minimum consecutive successes for the probe to be considered successful after having failed.
  # successThreshold: 1
  # Minimum consecutive failures for the probe to be considered failed after having succeeded.
  # failureThreshold: 1
  httpGet:
    port: 13133
    path: /

service:
  # Enable the creation of a Service.
  # By default, it's enabled on mode != daemonset.
  # However, to enable it on mode = daemonset, its creation must be explicitly enabled
  # enabled: true

  type: ClusterIP
  # type: LoadBalancer
  # loadBalancerIP: 1.2.3.4
  # loadBalancerSourceRanges: []

  # By default, Service of type 'LoadBalancer' will be created setting 'externalTrafficPolicy: Cluster'
  # unless other value is explicitly set.
  # Possible values are Cluster or Local (https://kubernetes.io/docs/tasks/access-application-cluster/create-external-load-balancer/#preserving-the-client-source-ip)
  # externalTrafficPolicy: Cluster

  annotations: {}

  # By default, Service will be created setting 'internalTrafficPolicy: Local' on mode = daemonset
  # unless other value is explicitly set.
  # Setting 'internalTrafficPolicy: Cluster' on a daemonset is not recommended
  # internalTrafficPolicy: Cluster

ingress:
  enabled: false
  # annotations: {}
  # ingressClassName: nginx
  # hosts:
  #   - host: collector.example.com
  #     paths:
  #       - path: /
  #         pathType: Prefix
  #         port: 4318
  # tls:
  #   - secretName: collector-tls
  #     hosts:
  #       - collector.example.com

  # Additional ingresses - only created if ingress.enabled is true
  # Useful for when differently annotated ingress services are required
  # Each additional ingress needs key "name" set to something unique
  additionalIngresses: []
  # - name: cloudwatch
  #   ingressClassName: nginx
  #   annotations: {}
  #   hosts:
  #     - host: collector.example.com
  #       paths:
  #         - path: /
  #           pathType: Prefix
  #           port: 4318
  #   tls:
  #     - secretName: collector-tls
  #       hosts:
  #         - collector.example.com

podMonitor:
  # The pod monitor by default scrapes the metrics port.
  # The metrics port needs to be enabled as well.
  enabled: false
  metricsEndpoints:
    - port: metrics
      # interval: 15s

  # additional labels for the PodMonitor
  extraLabels: {}
  #   release: kube-prometheus-stack

serviceMonitor:
  # The service monitor by default scrapes the metrics port.
  # The metrics port needs to be enabled as well.
  enabled: false
  metricsEndpoints:
    - port: metrics
      # interval: 15s

  # additional labels for the ServiceMonitor
  extraLabels: {}
  #  release: kube-prometheus-stack

# PodDisruptionBudget is used only if deployment enabled
podDisruptionBudget:
  enabled: false
#   minAvailable: 2
#   maxUnavailable: 1

# autoscaling is used only if mode is "deployment" or "statefulset"
autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 10
  behavior: {}
  targetCPUUtilizationPercentage: 80
  # targetMemoryUtilizationPercentage: 80

rollout:
  rollingUpdate: {}
  # When 'mode: daemonset', maxSurge cannot be used when hostPort is set for any of the ports
  # maxSurge: 25%
  # maxUnavailable: 0
  strategy: RollingUpdate

prometheusRule:
  enabled: false
  groups: []
  # Create default rules for monitoring the collector
  defaultRules:
    enabled: false

  # additional labels for the PrometheusRule
  extraLabels: {}

statefulset:
  # volumeClaimTemplates for a statefulset
  volumeClaimTemplates: []
  podManagementPolicy: "Parallel"
  # Controls if and how PVCs created by the StatefulSet are deleted. Available in Kubernetes 1.23+.
  persistentVolumeClaimRetentionPolicy:
    enabled: false
    whenDeleted: Retain
    whenScaled: Retain

networkPolicy:
  enabled: false

  # Annotations to add to the NetworkPolicy
  annotations: {}

  # Configure the 'from' clause of the NetworkPolicy.
  # By default this will restrict traffic to ports enabled for the Collector. If
  # you wish to further restrict traffic to other hosts or specific namespaces,
  # see the standard NetworkPolicy 'spec.ingress.from' definition for more info:
  # https://kubernetes.io/docs/reference/kubernetes-api/policy-resources/network-policy-v1/
  allowIngressFrom: []
  # # Allow traffic from any pod in any namespace, but not external hosts
  # - namespaceSelector: {}
  # # Allow external access from a specific cidr block
  # - ipBlock:
  #     cidr: 192.168.1.64/32
  # # Allow access from pods in specific namespaces
  # - namespaceSelector:
  #     matchExpressions:
  #       - key: kubernetes.io/metadata.name
  #         operator: In
  #         values:
  #           - "cats"
  #           - "dogs"

  # Add additional ingress rules to specific ports
  # Useful to allow external hosts/services to access specific ports
  # An example is allowing an external prometheus server to scrape metrics
  #
  # See the standard NetworkPolicy 'spec.ingress' definition for more info:
  # https://kubernetes.io/docs/reference/kubernetes-api/policy-resources/network-policy-v1/
  extraIngressRules: []
  # - ports:
  #   - port: metrics
  #     protocol: TCP
  #   from:
  #     - ipBlock:
  #         cidr: 192.168.1.64/32

  # Restrict egress traffic from the OpenTelemetry collector pod
  # See the standard NetworkPolicy 'spec.egress' definition for more info:
  # https://kubernetes.io/docs/reference/kubernetes-api/policy-resources/network-policy-v1/
  egressRules: []
  #  - to:
  #      - namespaceSelector: {}
  #      - ipBlock:
  #          cidr: 192.168.10.10/24
  #    ports:
  #      - port: 1234
  #        protocol: TCP

# When enabled, the chart will set the GOMEMLIMIT env var to 80% of the configured
# resources.limits.memory and remove the memory ballast extension.
# If no resources.limits.memory are defined enabling does nothing.
# In a future release this setting will be enabled by default.
# See https://github.com/open-telemetry/opentelemetry-helm-charts/issues/891
# for more details.
useGOMEMLIMIT: true
```







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

1 OpenTelemetry Collector 설치 및 구성

OpenTelemetry Collector를 다운로드하고 설치합니다.
collector.yaml 구성 파일을 편집하여 Grafana로 데이터를 전송하도록 설정합니다.
metric exporter로는 tempo 또는 prometheus를, log exporter로는 loki를 사용합니다.
각 exporter에 Grafana 엔드포인트 URL과 인증 정보를 설정합니다.



helm install otel-collector-cluster open-telemetry/opentelemetry-collector --values <path where you saved the chart>



helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm install my-opentelemetry-collector open-telemetry/opentelemetry-collector \
   --set image.repository="otel/opentelemetry-collector-k8s" \
   --set image.tag=
   --set mode=<daemonset|deployment|statefulset> \











OpenTelemetry에서 수집한 metric과 log 데이터를 Grafana로 전송하는 방법은 크게 두 가지가 있습니다.

1. OpenTelemetry Collector를 사용하는 방법

OpenTelemetry Collector는 다양한 출처로부터 metric과 log 데이터를 수집하고, Grafana와 같은 백엔드 시스템으로 전송하는 데 사용할 수 있는 도구입니다. 다음은 OpenTelemetry Collector를 사용하여 Grafana로 데이터를 전송하는 방법입니다.

1.1 OpenTelemetry Collector 설치 및 구성

OpenTelemetry Collector를 다운로드하고 설치합니다.
collector.yaml 구성 파일을 편집하여 Grafana로 데이터를 전송하도록 설정합니다.
metric exporter로는 tempo 또는 prometheus를, log exporter로는 loki를 사용합니다.
각 exporter에 Grafana 엔드포인트 URL과 인증 정보를 설정합니다.
1.2 예시 구성

YAML
```
receivers:
 metric:
   # OpenTelemetry로부터 metric 데이터 수집
   otlp: {}

processors:
 metric:
   # metric 데이터 변환 및 처리

exporters:
 metric:
   # metric 데이터 전송
   tempo:
     endpoint: "http://localhost:31868" # Grafana Tempo 엔드포인트 URL
   prometheus:
     endpoint: "http://localhost:9090" # Prometheus 엔드포인트 URL (선택 사항)
 log:
   # log 데이터 전송
   loki:
     endpoint: "http://localhost:3100" # Grafana Loki 엔드포인트 URL
```
코드를 사용할 때는 주의가 필요합니다.
content_copy
1.3 OpenTelemetry Collector 실행

collector.yaml 파일을 사용하여 OpenTelemetry Collector를 실행합니다.
OpenTelemetry Collector가 실행되면 OpenTelemetry로부터 수집된 metric과 log 데이터가 Grafana로 전송됩니다.
2. OpenTelemetry SDK를 사용하는 방법

OpenTelemetry SDK는 애플리케이션 코드에 직접 통합하여 metric과 log 데이터를 생성하고 OpenTelemetry Collector 또는 백엔드 시스템으로 직접 전송하는 데 사용할 수 있는 도구입니다. 다음은 OpenTelemetry SDK를 사용하여 Grafana로 데이터를 전송하는 방법입니다.

2.1 OpenTelemetry SDK 설치 및 구성

애플리케이션에 OpenTelemetry SDK를 설치합니다.
SDK를 구성하여 Grafana로 데이터를 전송하도록 설정합니다.
metric exporter로는 tempo 또는 prometheus를, log exporter로는 loki를 사용합니다.
각 exporter에 Grafana 엔드포인트 URL과 인증 정보를 설정합니다.
2.2 예시 코드

Python
```
from opentelemetry import trace
from opentelemetry.exporter.otlp.python import OTLPExporter
from opentelemetry.sdk.resource import Resource
from opentelemetry.sdk.trace import TracerProvider

# Grafana Tempo 엔드포인트 URL 및 리소스 정보 설정
endpoint = "http://localhost:31868"
resource = Resource(name="my-application")

# OTLP exporter 설정
exporter = OTLPExporter(endpoint=endpoint)

# TracerProvider 설정
tracer_provider = TracerProvider(resource=resource)
tracer_provider.add_exporter(exporter)

# Tracer 생성
tracer = tracer_provider.get_tracer("my-application")

# 코드에서 trace 생성 및 사용
with tracer.start_as_current():
    # ... 작업 수행 ...
```
코드를 사용할 때는 주의가 필요합니다.
content_copy
2.3 애플리케이션 실행

OpenTelemetry SDK가 설정된 애플리케이션을 실행합니다.
애플리케이션이 실행되면 OpenTelemetry SDK에서 생성된 metric과 log 데이터가 Grafana로 전송됩니다.
Grafana 설정

Grafana에서 Tempo 또는 Loki 데이터 소스를 추가합니다.
데이터 소스에 OpenTelemetry Collector 또는 OpenTelemetry SDK에서 설정한 엔드포인트 URL을 설정합니다.
Grafana 대시보드를 생성하여 metric과 log 데이터를 시각화합니다.







------------------------------------------------------------------------------
Kubernetes에서 OpenTelemetry로 Metric, Log 수집 및 Grafana 대시보드 구성
다음은 Kubernetes에서 OpenTelemetry를 사용하여 Metric과 Log를 수집하고 Grafana 대시보드를 구성하는 방법에 대한 단계별 안내와 코드 예제입니다.

필수 조건:

Kubernetes 클러스터
Helm
OpenTelemetry Collector
Grafana
Loki (Log 수집용)
Tempo (Trace 수집용 - 선택 사항)
단계:

1. OpenTelemetry Collector 설치 및 구성:

1.1 Helm 차트를 사용하여 OpenTelemetry Collector 배포:

Bash
helm repo add open-telemetry https://charts.opentelemetry.io
helm install opentelemetry open-telemetry/opentelemetry-collector
코드를 사용할 때는 주의가 필요합니다.
content_copy
1.2 values.yaml 파일 편집하여 다음 내용 추가:

YAML
config:
  receivers:
    metric:
      otlp: {}
  processors:
    metric:
      # metric 데이터 변환 및 처리
  exporters:
    metric:
      # metric 데이터 전송
      tempo:
        endpoint: "http://loki:31868" # Grafana Tempo 엔드포인트 URL (Tempo 사용 시)
      prometheus:
        endpoint: "http://prometheus:9090" # Prometheus 엔드포인트 URL (선택 사항)
    log:
      # log 데이터 전송
      loki:
        endpoint: "http://loki:3100" # Grafana Loki 엔드포인트 URL
코드를 사용할 때는 주의가 필요합니다.
content_copy
2. Grafana 설치 및 구성:

2.1 Helm 차트를 사용하여 Grafana 배포:

Bash
helm repo add grafana https://grafana.com/charts
helm install grafana grafana/grafana
코드를 사용할 때는 주의가 필요합니다.
content_copy
2.2 Grafana 대시보드에 Loki 데이터 소스 추가:

Grafana UI에 로그인합니다.
"Data Sources" 메뉴로 이동합니다.
"Add data source"를 클릭하고 "Loki"를 선택합니다.
Loki 엔드포인트 URL (http://loki:3100)을 설정합니다.
"Save & test"를 클릭합니다.
2.3 Grafana 대시보드에 Tempo 데이터 소스 추가 (선택 사항):

"Data Sources" 메뉴에서 "Add data source"를 클릭하고 "Tempo"를 선택합니다.
Tempo 엔드포인트 URL (http://loki:31868)을 설정합니다.
"Save & test"를 클릭합니다.
2.4 Grafana 대시보드 생성:

"Dashboards" 메뉴로 이동합니다.
"New dashboard"를 클릭합니다.
원하는 차트 및 패널을 추가하여 Metric과 Log 데이터를 시각화합니다.
3. 애플리케이션에 OpenTelemetry SDK 통합 (선택 사항):

3.1 애플리케이션에 OpenTelemetry SDK 설치합니다.
3.2 SDK를 구성하여 Grafana로 데이터 전송하도록 설정합니다.
3.3 예시 코드:

Python
from opentelemetry import trace
from opentelemetry.exporter.otlp.python import OTLPExporter
from opentelemetry.sdk.resource import Resource
from opentelemetry.sdk.trace import TracerProvider

# Grafana Tempo 엔드포인트 URL 및 리소스 정보 설정
endpoint = "http://loki:31868"
resource = Resource(name="my-application")

# OTLP exporter 설정
exporter = OTLPExporter(endpoint=endpoint)

# TracerProvider 설정
tracer_provider = TracerProvider(resource=resource)
tracer_provider.add_exporter(exporter)

# Tracer 생성
tracer = tracer_provider.get_tracer("my-application")

# 코드에서 trace 생성 및 사용
with tracer.start_as_current():
    # ... 작업 수행 ...



----------------------------------------
Kubernetes에서 OpenTelemetry로 Metric, Log 수집 및 Grafana 대시보드 구성 (Loki, Prometheus, Tempo 포함)
다음은 Kubernetes에서 OpenTelemetry를 사용하여 Metric, Log를 수집하고 Loki, Prometheus, Tempo를 모두 활용하는 Grafana 대시보드를 구성하는 방법에 대한 단계별 안내와 코드 예제입니다.

필수 조건:

Kubernetes 클러스터
Helm
OpenTelemetry Collector
Grafana
Loki (Log 수집)
Prometheus (Metric 수집)
Tempo (Trace 수집)
단계:

1. OpenTelemetry Collector 설치 및 구성:

1.1 Helm 차트를 사용하여 OpenTelemetry Collector 배포:

Bash
helm repo add open-telemetry https://charts.opentelemetry.io
helm install opentelemetry open-telemetry/opentelemetry-collector
코드를 사용할 때는 주의가 필요합니다.
content_copy
1.2 values.yaml 파일 편집하여 다음 내용 추가:

YAML
config:
  receivers:
    metric:
      otlp: {}
  processors:
    metric:
      # metric 데이터 변환 및 처리
  exporters:
    metric:
      # metric 데이터 전송
      tempo:
        endpoint: "http://loki:31868" # Grafana Tempo 엔드포인트 URL
      prometheus:
        endpoint: "http://prometheus:9090" # Prometheus 엔드포인트 URL
    log:
      # log 데이터 전송
      loki:
        endpoint: "http://loki:3100" # Grafana Loki 엔드포인트 URL
코드를 사용할 때는 주의가 필요합니다.
content_copy
2. Loki, Prometheus, Tempo 배포:

2.1 Helm 차트를 사용하여 Loki 배포:

Bash
helm repo add grafana https://grafana.com/charts
helm install loki grafana/loki
코드를 사용할 때는 주의가 필요합니다.
content_copy
2.2 Helm 차트를 사용하여 Prometheus 배포:

Bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/prometheus
코드를 사용할 때는 주의가 필요합니다.
content_copy
2.3 Helm 차트를 사용하여 Tempo 배포:

Bash
helm repo add grafana https://grafana.com/charts
helm install tempo grafana/tempo
코드를 사용할 때는 주의가 필요합니다.
content_copy
3. Grafana 설치 및 구성:

3.1 Helm 차트를 사용하여 Grafana 배포:

Bash
helm repo add grafana https://grafana.com/charts
helm install grafana grafana/grafana
코드를 사용할 때는 주의가 필요합니다.
content_copy
3.2 Grafana 대시보드에 Loki 데이터 소스 추가:

Grafana UI에 로그인합니다.
"Data Sources" 메뉴로 이동합니다.
"Add data source"를 클릭하고 "Loki"를 선택합니다.
Loki 엔드포인트 URL (http://loki:3100)을 설정합니다.
"Save & test"를 클릭합니다.
3.3 Grafana 대시보드에 Prometheus 데이터 소스 추가:

"Data Sources" 메뉴에서 "Add data source"를 클릭하고 "Prometheus"를 선택합니다.
Prometheus 엔드포인트 URL (http://prometheus:9090)을 설정합니다.
"Save & test"를 클릭합니다.
3.4 Grafana 대시보드에 Tempo 데이터 소스 추가:

"Data Sources" 메뉴에서 "Add data source"를 클릭하고 "Tempo"를 선택합니다.
Tempo 엔드포인트 URL (http://loki:31868)을 설정합니다.
"Save & test"를 클릭합니다.
3.5 Grafana 대시보드 생성:

"Dashboards" 메뉴로 이동합니다.
"New dashboard"를 클릭합니다.
원하는 차트 및 패널을 추가하여 Metric, Log, Trace 데이터를 시각화합니다.
4. 애플리케이션에 OpenTelemetry SDK 통합 (선택 사항):

4.1 애플리케이션에 OpenTelemetry SDK 설치합니다.
4.2 SDK를 구성하여 Loki, Prometheus, Tempo 모두에 데이터 전송하도록 설정합니다.
4.3 예시 코드:

Python
from opentelemetry import trace
from opentelemetry.exporter.otlp.python import OTLPExporter
from opentelemetry.sdk.resource import Resource
from opentelemetry.sdk.trace import TracerProvider

# 각 백엔드 엔드포인트 URL 및 리소스 정보 설정
loki


helm install otel-collector open-telemetry/opentelemetry-collector \
  -f values.yaml \
  --namespace opentelemetry \
  --set config.receiver.loki.endpoint="http://loki.logging.svc.cluster.local:3100/loki/push" \
  --set config.receiver.prometheus.endpoint="http://prometheus-server.prometheus.svc.cluster.local:9090"


loki.logging.svc.cluster.local


