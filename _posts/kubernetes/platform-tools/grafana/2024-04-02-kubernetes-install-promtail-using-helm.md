---
title: "[Kubernetes] Install Promtail Using Helm Chart"
date: 2024-04-02
categories: [Kubernetes, Grafana]
tags: [Kubernetes, Grafana, Promtail, Install]
render_with_liquid: false
---

## Promtail

- Loki가 로그를 저장하는 역할을 하면 Promtail은 application에서 로그를 전달하는 agent의 역할을 한다.
- Promtail 이외에도 Bit, Fluentd, LogStash 등을 사용할 수 있다.
- kubernetes는 node 별로 /var/log/pods 아래에 모든 pod의 로그가 기록된다.
- daemonset으로 설정하고 node별로 로그를 수집하도록 처리를 하면 된다.

- 설치 방식은 sidecar, daemonset 방식이 있는데 daemonset 방식을 추천한다고 한다.
    - **daemonset** : 각 노드마다 promtail pod가 실행되어 해당 노드 장비에서 실행 중인 파드의 로그를 추적
    - **sidecar** : 각 파드에 container로 추가되어 실행, 해당 파드 내부에서 로그 파일을 읽어서 Loki로 전송

- pod마다 agent 형태로 설정하는 것보다 daemonset을 하나 띄워 해당 node의 pod들을 찾아 로그를 수집하는 것이 훨씬 편한 것 같다.
- Prometheus가 저장소와 polling 역할을 같이 담당하는 반면 Promtail은 저장소의 역할은 하지 않고 로그를 찾아 저장소로 push 하는 역할을 한다.
- 하지만 설정 방식이나 문법은 크게 차이가 없다.

> [Helm 설치 및 설명 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-helm/)
{: .prompt-info }

## Install the Promtail Helm charts

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
helm install promtail grafana/promtail --namespace [NAMESPACE NAME]
```

> Promtail 설치 참고
- <https://grafana.com/docs/loki/latest/clients/promtail/installation/>
{: .prompt-info }

## Customize Default Configuration

- values.yaml 수정
  > 최상위 values.yaml을 수정하면 하위 폴더 values.yaml을 override 한다.
  {: .prompt-info }
  - Chart
    - <https://github.com/grafana/helm-charts/tree/main/charts/promtail>
  - Release file (.tgz)
    - <https://github.com/grafana/helm-charts/releases>

### Setting Volumes

```yaml
# -- Default volumes that are mounted into pods. In most cases, these should not be changed.
# Use `extraVolumes`/`extraVolumeMounts` for additional custom volumes.
# @default -- See `values.yaml`
defaultVolumes:
  - name: run
    hostPath:
      path: /run/promtail
  - name: containers
    hostPath:
      path: /var/lib/docker/containers
  - name: pods
    hostPath:
      path: /var/log/pods
  - name: syslogs
    hostPath:
      path: /var/log

# -- Default volume mounts. Corresponds to `volumes`.
# @default -- See `values.yaml`
defaultVolumeMounts:
  - name: run
    mountPath: /run/promtail
  - name: containers
    mountPath: /var/lib/docker/containers
    readOnly: true
  - name: pods
    mountPath: /var/log/pods
    readOnly: true
  - name: syslogs
    mountPath: /var/log
    readOnly: true
```

### Setting Config

```yaml
config:
  # -- Enable Promtail config from Helm chart
  # Set `configmap.enabled: true` and this to `false` to manage your own Promtail config
  # See default config in `values.yaml`
  enabled: true
  # -- The log level of the Promtail server
  # Must be reference in `config.file` to configure `server.log_level`
  # See default config in `values.yaml`
  logLevel: info
  # -- The log format of the Promtail server
  # Must be reference in `config.file` to configure `server.log_format`
  # Valid formats: `logfmt, json`
  # See default config in `values.yaml`
  logFormat: logfmt
  # -- The port of the Promtail server
  # Must be reference in `config.file` to configure `server.http_listen_port`
  # See default config in `values.yaml`
  serverPort: 3101
  # -- The config of clients of the Promtail server
  # Must be reference in `config.file` to configure `clients`
  # @default -- See `values.yaml`
  clients:
    - url: http://loki-gateway/loki/api/v1/push
    - basic_auth:
        password: ${LOKI_BASIC_AUTH_PW}
        username: ${LOKI_BASIC_AUTH_USER}
      external_labels:
        cluster: ${CLUSTER}
      url: ${LOKI_URL}
  # -- Configures where Promtail will save it's positions file, to resume reading after restarts.
  # Must be referenced in `config.file` to configure `positions`

...✂...

  snippets:
    pipelineStages:
      - cri: {}
    common:
      - action: replace
        source_labels:
          - __meta_kubernetes_pod_node_name
        target_label: node_name
      - action: replace
        source_labels:
          - __meta_kubernetes_namespace
        target_label: namespace
      - action: replace
        replacement: $1
        separator: /
        source_labels:
          - namespace
          - app
        target_label: job
      - action: replace
        source_labels:
          - __meta_kubernetes_pod_name
        target_label: pod
      - action: replace
        source_labels:
          - __meta_kubernetes_pod_container_name
        target_label: container
      - action: replace
        replacement: /var/log/pods/*$1/*.log
        separator: /
        source_labels:
          - __meta_kubernetes_pod_uid
          - __meta_kubernetes_pod_container_name
        target_label: __path__
      - action: replace
        replacement: /var/log/pods/*$1/*.log
        regex: true/(.*)
        separator: /
        source_labels:
          - __meta_kubernetes_pod_annotationpresent_kubernetes_io_config_hash
          - __meta_kubernetes_pod_annotation_kubernetes_io_config_hash
          - __meta_kubernetes_pod_container_name
        target_label: __path__

...✂...

    scrapeConfigs: |
      - job_name: syslog
        static_configs:
        - targets:
            - localhost
          labels:
            job: syslog
            __path__: /var/log/syslog
        pipeline_stages:
          - regex:
              expression: '^(?P<time>[^ ]* {1,2}[^ ]* [^ ]*) (?P<hostname>[^ ]*) (?P<daemon>[^ :\[]*)(?:\[(?P<pid>[0-9]+)\])?(?:[^\:]*\:)? *(?P<message>.*)$'
          - labels:
              time:
              hostname:
              daemon:
              pid:
              message:
          - match:
              selector: '{daemon=~"kubelet|kernel"}'
              stages:
              - regex:
                  expression: '^(?P<time>[^ ]* {1,2}[^ ]* [^ ]*) (?P<hostname>[^ ]*) (?P<daemon>[^ :\[]*)(?:\[(?P<pid>[0-9]+)\])?(?:[^\:]*\:)? *(?P<message>.*)$'
              - labels:
                  time:
                  hostname:
                  daemon:
                  pid:
                  message:
              - timestamp:
                  source: time
                  format: %b %d %H:%M:%S
      - job_name: custom-log
        static_configs:
        - targets:
            - localhost
          labels:
            job: custom-log
            __path__: /appdata/applog
        pipeline_stages:
          - regex:
              expression: '^(?P<log_type>[^ ]*) '
          - labels:
              log_type:
          - match:
              selector: '{log_type="type1"}'
              stages:
              - regex:
                  expression: '^(?P<log_type>[^ ]*) (?P<log_level>[^ ]*) ~'
              - template:
                  source: log_level
                  template: 'warning'
              - labels:
                  log_type:
          - match:
              selector: '{log_type="type2"}'
              stages:
              - regex:
                  expression: '^(?P<log_type>[^ ]*) (?P<log_level>[^ ]*) (?P<message>.*) ~'
              - template:
                  source: log_type
                  template: 'API'
              - labels:
                  log_type:
                  log_level:
                  message:
              - match:
                  selector: '{log_level="I"}'
                  stages:
                  - regex:
                      expression: '^(?P<log_type>[^ ]*) (?P<log_level>[^ ]*) (?P<message>.*) ~'
                  - template:
                      source: log_level
                      template: 'INFO'
                  - labels:
                      log_type:
                      log_level:
                      message:
              - match:
                  selector: '{log_level=~"W|E"}'
                  stages:
                  - regex:
                      expression: '^(?P<log_type>[^ ]*) (?P<log_level>[^ ]*) (?P<message>.*) ~'
                  - template:
                      source: log_level
                      template: '{{ if eq .Value "W" }}{{ Replace .Value "W" "WARNING" -1 }}{{ else if eq .Value "E" }}{{ Replace .Value "E" "ERROR" -1 }}{{ else }}{{ .Value }}{{ end }}'
                  - labels:
                      log_type:
                      log_level:
                      message:

      # See also https://github.com/grafana/loki/blob/master/production/ksonnet/promtail/scrape_config.libsonnet for reference
      - job_name: kubernetes-pods
        pipeline_stages:
          {{- toYaml .Values.config.snippets.pipelineStages | nindent 4 }}
        kubernetes_sd_configs:
          - role: pod
            namespaces:
              names:
              - kube-system
              - ...✂...
              - ...✂...
        relabel_configs:
          - source_labels:
              - __meta_kubernetes_pod_controller_name
            regex: ([0-9a-z-.]+?)(-[0-9a-f]{8,10})?
            action: replace
            target_label: __tmp_controller_name
          - source_labels:
              - __meta_kubernetes_pod_label_app_kubernetes_io_name
              - __meta_kubernetes_pod_label_app
              - __tmp_controller_name
              - __meta_kubernetes_pod_name
            regex: ^;*([^;]+)(;.*)?$
            action: replace
            target_label: app
          - source_labels:
              - __meta_kubernetes_pod_label_app_kubernetes_io_instance
              - __meta_kubernetes_pod_label_instance
            regex: ^;*([^;]+)(;.*)?$
            action: replace
            target_label: instance
          - source_labels:
              - __meta_kubernetes_pod_label_app_kubernetes_io_component
              - __meta_kubernetes_pod_label_component
            regex: ^;*([^;]+)(;.*)?$
            action: replace
            target_label: component
          {{- if .Values.config.snippets.addScrapeJobLabel }}
          - replacement: kubernetes-pods
            target_label: scrape_job
          {{- end }}
          {{- toYaml .Values.config.snippets.common | nindent 4 }}
          {{- with .Values.config.snippets.extraRelabelConfigs }}
          {{- toYaml . | nindent 4 }}
          {{- end }}

  # -- Config file contents for Promtail.
  # Must be configured as string.
  # It is templated so it can be assembled from reusable snippets in order to avoid redundancy.
  # @default -- See `values.yaml`
  file: |
    server:
      log_level: {{ .Values.config.logLevel }}
      log_format: {{ .Values.config.logFormat }}
      http_listen_port: {{ .Values.config.serverPort }}
      {{- with .Values.httpPathPrefix }}
      http_path_prefix: {{ . }}
      {{- end }}
      {{- tpl .Values.config.snippets.extraServerConfigs . | nindent 2 }}

    clients:
      {{- tpl (toYaml .Values.config.clients) . | nindent 2 }}

    positions:
      {{- tpl (toYaml .Values.config.positions) . | nindent 2 }}

    scrape_configs:
      {{- tpl .Values.config.snippets.scrapeConfigs . | nindent 2 }}
      {{- tpl .Values.config.snippets.extraScrapeConfigs . | nindent 2 }}

    limits_config:
      {{- tpl .Values.config.snippets.extraLimitsConfig . | nindent 2 }}

    tracing:
      enabled: {{ .Values.config.enableTracing }}
```

#### syslog regex

```
^(?P<time>[^ ]* {1,2}[^ ]* [^ ]*) (?P<hostname>[^ ]*) (?P<daemon>[^ :\[]*)(?:\[(?P<pid>[0-9]+)\])?(?:[^\:]*\:)? *(?P<message>.*)$
```

### Install Customize Default Configuration

```bash
helm install [RELEASE NAME] [Chart.yaml 경로] -f [YAML 파일 또는 URL에 값 지정 (여러 개를 지정가능)] -n [NAMESPACE NAME]
```

```bash
helm install promtail grafana/promtail -f override-values.yaml -n [NAMESPACE NAME]
```

## Uninstall the Chart

```bash
helm uninstall [RELEASE NAME] -n [NAMESPACE NAME]
```