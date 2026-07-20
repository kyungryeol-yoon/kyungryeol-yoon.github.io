---
title: "폐쇄망 K8s에 OpenTelemetry Collector 설치하기: Helm values 완벽 설정 (Agent + Gateway → VictoriaLogs)"
date: 2026-06-14
tags: ["opentelemetry", "otel-collector", "victorialogs", "kubernetes", "helm", "values", "tls", "ingress"]
description: "폐쇄망 환경에서 OpenTelemetry Collector를 Helm으로 설치할 때 필요한 receiver·exporter·pipeline·mode·preset·TLS·Secret·Ingress 설정을 실전 보안 기준으로 상세히 다루고, VictoriaLogs vmui 접속 방법까지 설명합니다."
series: "OTel + VictoriaLogs 로그 스택"
series_order: 2
---

OpenTelemetry Collector를 Helm으로 설치할 때 핵심은 **`mode`(daemonset/deployment)에 따라 receiver·exporter·pipeline을 정확히 나누는 것**이고, 폐쇄망에서는 여기에 **이미지 경로와 TLS·Secret을 사내 기준으로 덮어쓰는 작업**이 더해집니다. Agent는 `filelog`로 노드 로그를 긁어 Gateway로 보내고, Gateway는 `otlp`로 받아 VictoriaLogs의 `/insert/opentelemetry/v1/logs`로 내보냅니다. 설치 후에는 Grafana 없이도 **vmui(`/select/vmui`)로 적재를 즉시 검증**할 수 있습니다. 이 글은 **"OTel + VictoriaLogs 로그 스택" 시리즈 3편(설치편)** 으로, [1편(개념편)](/observability/opentelemetry/collector/otel-collector-agent-gateway-architecture/)의 Agent/Gateway 구조와 [2편(백엔드편)](/observability/victorialogs/kubernetes-victorialogs-cluster-helm-install/)에서 세운 VictoriaLogs 위에 **실전 values.yaml**을 얹습니다.

## 🧭 설치 전 체크리스트

본격적인 설치 전에, 폐쇄망에서 자주 막히는 지점부터 점검합니다.

- [ ] **contrib 이미지**를 사내 레지스트리에 미러했는가? **태그를 `0.x`로 고정**(latest 금지)했는가?
- [ ] VictoriaLogs(또는 vmauth)의 **적재 엔드포인트 주소**를 확보했는가?
- [ ] `logging` **네임스페이스**를 만들었는가? (백엔드 자체 구축은 별도 편)
- [ ] **설치 순서가 Gateway → Agent** 인지 인지하고 있는가?

> 💡 마지막 항목이 가장 흔한 실수입니다. Agent가 Gateway보다 먼저 뜨면 Agent가 보낼 대상(4317)이 없어 `connection refused`가 반복됩니다.

---

## 🎯 왜 contrib 이미지인가

**로그 수집에는 반드시 `opentelemetry-collector-contrib` 이미지를 써야 합니다.** `filelog` receiver와 `k8sattributes` processor가 contrib 배포판에만 포함되기 때문입니다. k8s 배포판(`opentelemetry-collector-k8s`)은 컴포넌트가 제한되어 로그 파일 수집에 부적합합니다.

| 구분 | contrib | k8s(core) |
|---|---|---|
| 바이너리명(`command.name`) | `otelcol-contrib` | `otelcol-k8s` |
| `filelog` receiver | ✅ 포함 | ❌ 제외 |
| `k8sattributes` processor | ✅ 포함 | ✅ 포함 |
| 용도 | 로그 파일 수집 | 메트릭·이벤트 중심 |

- 공식 배포처: `ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib`
- 폐쇄망은 이 이미지를 **사내 레지스트리로 미러**한 뒤 `image.repository`를 덮어씁니다.

---

## 📦 폐쇄망 이미지 준비

**인터넷이 되는 PC에서 contrib 이미지를 받아 사내 레지스트리로 push**하고, values에서 `image.repository`를 사내 경로로 지정합니다.

```bash
# 외부 반입용 (인터넷 가능 PC)
docker pull ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:0.1xx.x

docker tag ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:0.1xx.x \
  <사내레지스트리>/otel-collector-contrib:0.1xx.x

docker push <사내레지스트리>/otel-collector-contrib:0.1xx.x
```

> ⚠️ 태그는 `0.1xx.x`처럼 **명시 버전으로 고정**하세요. `latest`는 차트 버전과 컴포넌트 호환이 깨질 수 있어 폐쇄망에서 특히 위험합니다.

---

## 🧩 Helm 설치 메커니즘: 차트 1개 = 모드 1개

**OTel Collector 차트는 한 번에 하나의 `mode`만 배포합니다.** 즉 Agent(daemonset)와 Gateway(deployment)를 동시에 띄울 수 없어, **같은 차트를 values 2벌로 2회 설치**합니다.

기억할 두 가지 규칙입니다.

1. **설치 순서: Gateway 먼저 → Agent 나중.** Gateway가 4317을 리슨한 뒤 Agent가 붙어야 `connection refused`를 피합니다.
2. **Helm 리스트는 병합되지 않습니다.** `pipelines`의 `receivers`/`processors`/`exporters`는 프리셋이 일부를 주입하더라도 **전체를 명시**해야 안전합니다.

> ⚠️ 같은 맥락에서, **`processors:` 아래 정의만으로는 동작하지 않습니다** — 반드시 `service.pipelines.logs.processors` 리스트에 이름을 넣어야 통과하고, 나열 순서가 곧 실행 순서입니다. 이 함정과 함께 **로그 레벨 파싱**(JSON/logfmt/klog/평문)·**특정 네임스페이스 수집 제외**(filelog `exclude` vs `filter` processor)는 [트러블슈팅편 — 로그 레벨 구분](/observability/victorialogs/victorialogs-otel-troubleshooting/#-8-평문klog-로그-레벨-구분-otel에서-파싱한다) · [processor 등록·네임스페이스 제외](/observability/victorialogs/victorialogs-otel-troubleshooting/#-9-processor는-pipeline에-등록해야-동작한다--네임스페이스-제외)를 참고하세요.

---

## ⚙️ Agent values.yaml (DaemonSet)

**Agent는 `filelog` receiver로 노드의 파드 로그(`/var/log/pods`)를 읽어 Gateway로 보내는 역할**입니다. 노드마다 뜨므로 리소스를 과하게 잡지 않는 것이 중요합니다.

```yaml
# === agent-values.yaml (mode: daemonset) ===
mode: daemonset

image:
  repository: <사내레지스트리>/otel-collector-contrib
  tag: "0.1xx.x"
  pullPolicy: IfNotPresent

command:
  name: otelcol-contrib   # contrib 바이너리명

# 리소스 — 노드마다 뜨므로 과도하게 잡지 말 것
resources:
  requests: { cpu: 100m, memory: 128Mi }
  limits:   { cpu: 500m, memory: 512Mi }

# 보안 컨텍스트 — 로그 파일 읽기 위해 root가 필요할 수 있음(런타임에 따라).
# 가능하면 readOnlyRootFilesystem, drop capabilities 권장.
securityContext:
  runAsUser: 0
  readOnlyRootFilesystem: true
  capabilities:
    drop: ["ALL"]

# 프리셋: 로그 수집 + k8s 메타데이터
presets:
  logsCollection:
    enabled: true               # container operator 포함 filelog 자동 생성 → 경로에서 namespace/pod/container 추출
    includeCollectorLogs: false # 콜렉터 자기 로그는 제외(루프 방지)
  kubernetesAttributes:
    enabled: true               # 위 기본 필드 기준으로 API 질의 → labels/annotations 보강 (+ 필요한 RBAC 자동 생성)

config:
  processors:
    # 메모리 보호 (필수 권장)
    memory_limiter:
      check_interval: 5s
      limit_percentage: 80
      spike_limit_percentage: 25
    batch:
      timeout: 5s
      send_batch_size: 1024
    # env 라벨 (클러스터마다 dev/stg/prod로 변경)
    resource:
      attributes:
        - key: env
          value: prod
          action: upsert
  exporters:
    # Gateway로 전송 (같은 클러스터 내부, OTLP gRPC)
    otlp:
      endpoint: otel-gateway-opentelemetry-collector.logging.svc:4317
      tls:
        insecure: true          # 클러스터 내부 통신. 외부면 Gateway의 TLS 블록 참고
      # 일시 장애 대비 큐/재시도
      sending_queue:
        enabled: true
        queue_size: 1000
      retry_on_failure:
        enabled: true
        initial_interval: 5s
        max_interval: 30s
  service:
    pipelines:
      logs:
        # logsCollection 프리셋이 filelog receiver를 자동 주입하지만,
        # 리스트는 병합 안 되므로 명시적으로 적는 것이 안전
        receivers: [filelog]
        processors: [memory_limiter, k8sattributes, resource, batch]
        exporters: [otlp]
      # 안 쓰는 파이프라인 비활성화
      metrics: null
      traces: null

# filelog는 노드 로그 경로 마운트가 필요.
# 클러스터 보안정책(PSA/admission)에서 hostPath 읽기전용 허용이 필요할 수 있음.
# hostPort는 로그 수집엔 불필요하므로 설정하지 말 것.
```

> 💡 `securityContext.runAsUser: 0`(root)으로 둔 건 컨테이너 런타임이 `/var/log/pods`를 root 권한으로 쓰기 때문입니다. 환경에 따라 non-root로도 읽히니, 보안정책이 엄격하면 먼저 non-root로 시도하고 **로그가 안 읽히면 root로 조정**하세요.

> ⚠️ 실제로는 **hostPath가 Kyverno에 걸려 경고**가 뜨거나(대개 Audit 모드라 배포는 됨), **hostPort가 values로 지워지지 않는** 차트 함정을 만나기 쉽습니다. 정책 모드 진단과 대응(PolicyException·post-render)은 [트러블슈팅편 — hostPath/hostPort와 Kyverno Audit](/observability/victorialogs/victorialogs-otel-troubleshooting/#-4-hostpathhostport와-kyverno-audit-모드)을 참고하세요.

> ⚠️ **두 프리셋은 역할이 다르고, `kubernetesAttributes`만으로는 k8s 필드가 안 붙습니다.** `logsCollection`이 만드는 `filelog`가 두 가지를 함께 켜야 pod 정보가 생깁니다 — **① `include_file_path: true`** 로 각 로그에 원본 파일 경로(`log.file.path`)를 붙이고, **② `operators: [type: container]`** 가 그 경로(`/var/log/pods/<namespace>_<pod>_<uid>/<container>/*.log`)를 파싱해 `k8s.namespace.name`·`k8s.pod.name`·`k8s.container.name` **기본 필드**를 추출합니다. 그다음에야 `kubernetesAttributes`(k8sattributes)가 그 기준으로 **Kubernetes API에 질의해 labels·annotations를 보강**합니다. `include_file_path`가 꺼져 있으면 파싱할 경로 자체가 없고, `container` operator가 없으면 기준이 될 pod 정보가 없어 **어느 쪽이 빠져도 필드가 하나도 안 들어옵니다.** 개념은 [1편](/observability/opentelemetry/collector/otel-collector-agent-gateway-architecture/#-여러-환경의-로그를-어떻게-구분하나)을 참고하세요.

`logsCollection` 프리셋은 이 둘을 자동으로 넣어 줍니다. **프리셋 없이 직접 `filelog`를 정의**하거나 동작을 확인하고 싶다면, 아래 형태가 최소 구성입니다.

```yaml
config:
  receivers:
    filelog:
      include: [/var/log/pods/*/*/*.log]
      include_file_path: true      # ① log.file.path 부착 — 없으면 경로 파싱 불가
      operators:
        - type: container          # ② 경로에서 namespace/pod/container 추출
  processors:
    k8sattributes:                 # ③ 위 기본 필드 기준으로 API 질의 → labels/annotations 보강
      auth_type: serviceAccount    # 파드의 SA 토큰으로 API 인증
      passthrough: false           # true면 API 호출을 안 해 labels가 안 붙음
      extract:
        metadata:
          - k8s.namespace.name
          - k8s.pod.name
          - k8s.node.name
          - k8s.container.name
      filter:
        node_from_env_var: K8S_NODE_NAME   # 자기 노드 pod만 watch (API 부하 감소)
```

> 💡 **RBAC는 차트가 자동으로 만듭니다.** `presets.kubernetesAttributes`를 켜면 그 프리셋이 동작하는 데 필요한 **최소 RBAC(ServiceAccount·ClusterRole·Binding)를 차트가 자동 생성**하므로 별도로 만들 필요가 없습니다. 프리셋 범위를 넘어서는 추가 메타데이터(더 넓은 labels/annotations 스코프)를 원할 때만 그에 맞는 RBAC를 추가로 부여하면 됩니다.

> 💡 **수동으로 `k8sattributes`를 설정한다면(프리셋 대신)** 세 옵션이 중요합니다 — `auth_type: serviceAccount`(파드에 마운트된 SA 토큰으로 API 인증), `passthrough: false`(**`true`면 API 호출을 안 해 labels가 안 붙음**), `filter.node_from_env_var: K8S_NODE_NAME`(자기 노드 pod만 watch — 없으면 노드마다 전체 클러스터를 watch해 API 서버 부하가 노드 수만큼 급증). `K8S_NODE_NAME`은 OTel 차트가 downward API(`spec.nodeName`)로 자동 주입하므로 따로 정의하지 않아도 됩니다.

---

## ⚙️ Gateway values.yaml (Deployment)

**Gateway는 Agent들이 OTLP로 보낸 로그를 받아 VictoriaLogs로 최종 적재하는 "출구"** 입니다. 직접 로그를 긁지 않으므로 `logsCollection` 프리셋이 필요 없고, 대신 **TLS·Secret·재시도 큐**가 핵심입니다.

```yaml
# === gateway-values.yaml (mode: deployment) ===
mode: deployment
replicaCount: 2                  # 대규모는 2~3, HA 위해 PodDisruptionBudget도 권장

image:
  repository: <사내레지스트리>/otel-collector-contrib
  tag: "0.1xx.x"
  pullPolicy: IfNotPresent

command:
  name: otelcol-contrib

resources:
  requests: { cpu: 200m, memory: 256Mi }
  limits:   { cpu: "1",  memory: 1Gi }

# Gateway는 직접 로그를 안 긁음
presets:
  kubernetesAttributes:
    enabled: false

# VictoriaLogs 인증/TLS용 Secret을 환경변수로 주입 (예: 베이직 인증 토큰)
extraEnvs:
  - name: VL_AUTH_TOKEN
    valueFrom:
      secretKeyRef:
        name: victorialogs-auth   # 사전 생성한 Secret
        key: token

config:
  receivers:
    otlp:
      protocols:
        grpc:
          endpoint: 0.0.0.0:4317   # Agent가 보냄
        http:
          endpoint: 0.0.0.0:4318
  processors:
    memory_limiter:
      check_interval: 5s
      limit_percentage: 80
      spike_limit_percentage: 25
    batch:
      timeout: 5s
      send_batch_size: 8192        # 대규모는 크게
  exporters:
    otlphttp/victorialogs:
      # VictoriaLogs OTLP 로그 적재 엔드포인트 (검증된 경로)
      logs_endpoint: http://vmauth.logging.svc:8427/insert/opentelemetry/v1/logs
      # 다른 클러스터(dev/stg/prod)면 mgmt 외부 주소 + HTTPS:
      # logs_endpoint: https://<mgmt-vmauth-외부주소>/insert/opentelemetry/v1/logs
      compression: gzip
      headers:
        # 스트림 필드를 제한해 카디널리티 폭발 방지 (실무 권장)
        VL-Stream-Fields: "k8s.namespace.name,k8s.pod.name,env"
        # 인증이 필요하면 Secret에서 주입한 토큰 사용
        Authorization: "Bearer ${VL_AUTH_TOKEN}"
      # 외부(클러스터 간) 전송 시 TLS 적용 예시
      tls:
        insecure: false
        # 사내 CA 신뢰가 필요하면 ca_file 지정 (ConfigMap/Secret로 마운트)
        ca_file: /etc/otel/certs/ca.crt
      sending_queue:
        enabled: true
        queue_size: 5000
      retry_on_failure:
        enabled: true
        initial_interval: 5s
        max_interval: 30s
        max_elapsed_time: 300s
  service:
    pipelines:
      logs:
        receivers: [otlp]
        processors: [memory_limiter, batch]
        exporters: [otlphttp/victorialogs]
      metrics: null
      traces: null

# 외부 클러스터에서 이 Gateway로 OTLP를 받게 노출할 때 (선택):
# 1) Service(LoadBalancer/NodePort) 또는
# 2) Gateway API(HTTPRoute) / Ingress 로 4317(gRPC)·4318(http) 노출.
# gRPC(4317)는 L7 Ingress에서 h2c 설정이 필요할 수 있으니 주의.
ingress:
  enabled: false   # 기본 비활성. 외부 수신이 필요할 때만 켜고 아래 참고 섹션대로 설정
```

핵심은 **exporter 선택**입니다. Agent → Gateway 구간은 `otlp`(gRPC), Gateway → VictoriaLogs 최종 적재는 `otlphttp`(HTTP)의 **`logs_endpoint`** 키를 씁니다.

### `endpoint` vs `logs_endpoint` — 경로를 어디까지 쓰나

**`otlphttp` exporter는 어떤 키를 쓰느냐에 따라 `/v1/logs` 경로를 자동으로 붙이기도, 안 붙이기도 합니다.** 여기서 400·404가 자주 납니다.

| 키 | 자동 경로 완성 | 적어야 하는 값(예: 클러스터 vmauth) |
|---|---|---|
| `endpoint` | ✅ OTLP 표준대로 뒤에 **`/v1/logs` 자동 부착** | `http://<vmauth>:8427/insert/opentelemetry` 까지만 → 실제 전송은 `…/opentelemetry/v1/logs` |
| `logs_endpoint` | ❌ 자동으로 안 붙음 | **전체 경로**를 다 써야 함: `http://<vmauth>:8427/insert/opentelemetry/v1/logs` |

즉 위 예시가 `logs_endpoint`에 전체 경로(`…/v1/logs`)를 적은 이유는, 이 키가 경로를 자동 완성하지 않기 때문입니다. `endpoint` 키를 쓰면 베이스(`…/insert/opentelemetry`)까지만 적어도 됩니다.

> 💡 exporter **타입**도 헷갈리지 마세요. `otlphttp` = HTTP(키 `endpoint`/`logs_endpoint`), `otlp` = gRPC(키 `endpoint`)입니다. exporter 이름 뒤의 `/victorialogs`(예: `otlphttp/victorialogs`)는 **별칭일 뿐** 타입 판단과 무관합니다 — 타입은 앞부분(`otlphttp`/`otlp`)으로 갈립니다.

---

## 🔐 TLS / Secret은 어떻게 적용하나

**클러스터 내부 통신은 `insecure: true`로 단순화할 수 있지만, 클러스터 간(외부)으로 나갈 때는 TLS와 인증을 적용**하는 것이 안전합니다.

**1) 인증 토큰 Secret 사전 생성**

```bash
kubectl create secret generic victorialogs-auth \
  --from-literal=token='<적재용-토큰>' -n logging
```

생성한 Secret은 Gateway values의 `extraEnvs`로 주입되어 exporter `headers`의 `Authorization: "Bearer ${VL_AUTH_TOKEN}"`에서 사용됩니다.

**2) 사내 CA 인증서 마운트**

사내 CA로 서명된 백엔드라면 `ca.crt`를 ConfigMap/Secret으로 만들고 차트의 `extraVolumes`/`extraVolumeMounts`로 `/etc/otel/certs`에 마운트한 뒤, exporter `tls.ca_file`에 경로를 지정합니다.

---

## 🌐 외부 노출: Ingress vs Gateway API

**같은 클러스터 안이면 노출이 필요 없습니다**(Service ClusterIP로 충분). 다른 클러스터에서 이 Gateway로 직접 보내야 할 때만 노출합니다.

| 방식 | HTTP(4318) | gRPC(4317) |
|---|---|---|
| **Service** | LoadBalancer/NodePort | LoadBalancer/NodePort |
| **Ingress** | 일반 Ingress 가능 | 백엔드 프로토콜을 **h2c/GRPC**로 지정해야 함(컨트롤러별 annotation 상이) |
| **Gateway API** | HTTPRoute | **GRPCRoute**가 적합 |

> 💡 **실무 단순화**: 클러스터 간 전송은 Gateway가 능동적으로 "보내는" 방향입니다. 따라서 외부 수신 노출은 중앙(mgmt)의 VictoriaLogs(vmauth) 쪽만 하면 되고, 각 클러스터의 Gateway는 노출하지 않아도 되는 경우가 많습니다.

---

## 🚀 설치 (순서가 중요)

**반드시 Gateway를 먼저 설치해 4317을 리슨시킨 뒤 Agent를 설치**합니다.

```bash
kubectl create namespace logging

# 1) Gateway 먼저
helm install otel-gateway ./opentelemetry-collector-<차트버전>.tgz \
  -f gateway-values.yaml -n logging
kubectl -n logging rollout status deploy/otel-gateway-opentelemetry-collector

# 2) Agent 나중
helm install otel-agent ./opentelemetry-collector-<차트버전>.tgz \
  -f agent-values.yaml -n logging
kubectl -n logging get pods -o wide
```

```mermaid
flowchart LR
    N["노드 파드 로그<br/>/var/log/pods"] --> AG["OTel Agent<br/>filelog → otlp"]
    AG -->|"otlp 4317"| GW["OTel Gateway<br/>otlp → otlphttp"]
    GW -->|"/insert/opentelemetry/v1/logs"| VL["VictoriaLogs"]
    VL --> UI["vmui<br/>/select/vmui"]
```

---

## 🔎 vmui로 적재 확인 (Grafana 없이)

**VictoriaLogs 내장 UI인 vmui로 Grafana 연결 전에 적재를 즉시 검증**할 수 있습니다.

```bash
# single-node 예시
kubectl -n logging port-forward svc/<victorialogs-svc> 9428
# 브라우저: http://localhost:9428/select/vmui
# 클러스터 모드면 vlselect(또는 vmauth) 서비스로 포트포워딩 후 /select/vmui
```

vmui의 LogsQL 입력창에서 다음처럼 확인합니다.

```logsql
env:prod
```

```logsql
k8s.namespace.name:<ns>
```

로그가 보이면 파이프라인이 정상입니다. Grafana 데이터소스 연결은 대시보드 편에서 다룹니다.

> ⚠️ 적재·조회 포트는 모드에 따라 다릅니다. **single-node는 본체 `9428`** 하나에 모든 기능이 통합돼 있고, **클러스터 모드는 vmauth 진입 `8427`**(또는 `vlinsert` 직결 `9481`)입니다(`9427`은 없음). 컴포넌트별 포트(vlinsert `9481`·vlselect `9471`·vmauth `8427`·single `9428`)는 [2편 백엔드 편](/observability/victorialogs/kubernetes-victorialogs-cluster-helm-install/#-victorialogs-클러스터는-무엇으로-구성되나)에 정리해 두었습니다. 실제 서비스명·포트는 `kubectl get svc -n <ns>`로 최종 확인하세요(차트 `nameOverride`에 따라 이름이 달라집니다).

---

## 🧪 검증 / 트러블슈팅

설치 후 다음 명령으로 핵심 지점을 점검합니다.

```bash
# 렌더링 이미지 경로가 사내 레지스트리로 바뀌었는지
helm template x ./opentelemetry-collector-<차트버전>.tgz -f agent-values.yaml | grep 'image:'

# Agent가 노드 수만큼 떴는지
kubectl -n logging get daemonset

# Gateway 로그에서 export 성공/실패 확인
kubectl -n logging logs deploy/otel-gateway-opentelemetry-collector | grep -i export
```

**자주 겪는 문제와 원인**

| 증상 | 원인 | 해결 |
|---|---|---|
| `ImagePullBackOff` | ghcr 경로를 사내로 안 덮어씀 | `image.repository` 확인 |
| `connection refused` | Agent를 Gateway보다 먼저 설치 | **Gateway 먼저** 재설치 |
| `401/403` | VL 인증 토큰/헤더 누락 | Secret·`Authorization` 헤더 확인 |
| 조회 급격히 느려짐 | 카디널리티 과다 | `VL-Stream-Fields`로 스트림 필드 제한 |

---

## 📐 대규모 vs 소규모, 무엇이 다른가

규모에 따라 달라지는 점만 한곳에 모으면 다음과 같습니다. 이 글의 기본 전제는 **대규모(Gateway 경유)** 입니다.

| 구분 | 대규모(기본) | 소규모/개인 |
|---|---|---|
| Gateway | 사용(replica 2~3) | 생략 |
| Agent exporter 목적지 | Gateway(`otlp:4317`) | VictoriaLogs(`otlphttp` `logs_endpoint`) 직결 |
| `batch.send_batch_size` | 크게(8192) | 기본값 |
| TLS/Secret | 클러스터 간 TLS·인증 적용 | 내부 `insecure` 허용 |
| 외부 노출 | 필요 시 Ingress/Gateway API | 불필요 |

> 💡 **소규모라면 Gateway values를 아예 만들지 마세요.** `agent-values.yaml`의 `exporters`를 `otlphttp/victorialogs`(`logs_endpoint` 직결)로 바꾸고, pipeline의 `exporters`도 그것으로 교체하면 됩니다. single-node 적재 주소는 `http://<victorialogs>:9428/insert/opentelemetry/v1/logs` 입니다.

---

## ❓ 자주 묻는 질문

**Q. exporter는 `otlp`와 `otlphttp` 중 뭘 쓰나요?**
Gateway로 보낼 땐 `otlp`(gRPC), VictoriaLogs로 최종 적재할 땐 `otlphttp`의 `logs_endpoint`를 씁니다.

**Q. VictoriaLogs 적재 주소가 뭔가요?**
`/insert/opentelemetry/v1/logs` 입니다. single-node는 `9428`, 클러스터(vmauth)는 `8427` 포트입니다.

**Q. 로그를 Grafana 없이 보고 싶어요.**
vmui(`/select/vmui`)로 바로 조회됩니다. 적재 검증은 Grafana 연결 전에 vmui로 하는 것이 빠릅니다.

**Q. 라벨이 너무 많아 조회가 느려요.**
`VL-Stream-Fields` 헤더로 스트림 필드를 `namespace/pod/env` 등 핵심만 남기세요. VictoriaLogs는 기본적으로 모든 resource 라벨을 스트림 필드로 취급해 카디널리티가 폭발할 수 있습니다. `VL-Extra-Fields`·`VL-Ignore-Fields`·`VL-Time-Field` 등 나머지 적재 헤더 전체 목록은 [트러블슈팅편 — VL-* 적재 헤더 종류](/observability/victorialogs/victorialogs-otel-troubleshooting/#-10-vl--적재-헤더-종류)를 참고하세요.

**Q. 인증은 어떻게 하나요?**
Secret으로 토큰을 만들어 `extraEnvs`로 주입하고, exporter `headers`의 `Authorization`에서 사용합니다.

**Q. Agent와 Gateway를 한 번에 설치할 수 없나요?**
없습니다. 차트 1개당 `mode` 1개라, 같은 차트를 values 2벌로 2회 설치합니다.

---

## 🧭 시리즈: OTel + VictoriaLogs 로그 스택

**OTel 트랙**

- **1편** — [OpenTelemetry 개념과 Agent/Gateway 구조](/observability/opentelemetry/collector/otel-collector-agent-gateway-architecture/)
- **2편** — [VictoriaLogs 클러스터 구축](/observability/victorialogs/kubernetes-victorialogs-cluster-helm-install/)
- **3편 (현재)** — 폐쇄망 Helm 설치 + values 완벽 설정
- **4편** — [멀티클러스터 중앙집중](/observability/opentelemetry/otel-multicluster-central-logging/)

**Vector 트랙** (대안 수집기)

- **1편** — [Vector 개념과 파이프라인 구조](/observability/opentelemetry/vector/kubernetes-vector-log-pipeline-concept/)
- **2편** — [Vector 설치: Agent/Aggregator Helm values](/observability/opentelemetry/vector/kubernetes-vector-agent-aggregator-helm-install/)
- **3편** — [VRL로 로그 가공](/observability/opentelemetry/vector/kubernetes-vector-vrl-log-processing/)

**비교**

- **OTel vs Vector** — [어떤 걸 선택할까](/observability/opentelemetry/collector/kubernetes-otel-collector-vs-vector/)

**대시보드 트랙**

- **1편** — [조회 개요: Grafana·vmui·Perses](/observability/victorialogs/victorialogs-log-viewing-grafana-vmui-perses/)
- **2편** — [Grafana 연결: 플러그인·Explore·대시보드](/observability/victorialogs/grafana-victorialogs-datasource-explore-dashboard/)
- **3편** — [vmui로 LogsQL 탐색](/observability/victorialogs/victorialogs-vmui-logsql-live-tail/)
- **4편** — [Perses로 코드형 대시보드](/observability/victorialogs/perses-victorialogs-dashboard-gitops/)

이 편의 한 줄 요약: **"`mode`에 따라 receiver/exporter/pipeline이 갈린다 — Agent는 `filelog→otlp`, Gateway는 `otlp→otlphttp`."** 폐쇄망에서는 이미지 경로 덮어쓰기, `memory_limiter`·재시도 큐·TLS·Secret·`VL-Stream-Fields`가 안정 운영의 필수 요소이며, 설치 직후 vmui로 적재를 검증하면 됩니다.

---

## 📚 참고

- [VictoriaLogs — OpenTelemetry 데이터 적재](https://docs.victoriametrics.com/victorialogs/data-ingestion/opentelemetry/)
- [Getting started with OpenTelemetry — VictoriaMetrics](https://docs.victoriametrics.com/guides/getting-started-with-opentelemetry/)
- [opentelemetry-collector Helm chart — GitHub](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector)
- [Collector Configuration — OpenTelemetry](https://opentelemetry.io/docs/collector/configuration/)
- [Kubernetes Collector Components — OpenTelemetry](https://opentelemetry.io/docs/kubernetes/collector/components/)
- 관련 글: [OpenTelemetry 개념과 Agent/Gateway 구조 (시리즈 1편)](/observability/opentelemetry/collector/otel-collector-agent-gateway-architecture/)
- 관련 글: [Kubernetes에서 OTel Collector로 로그 수집하기](/observability/opentelemetry/collector/kubernetes-otel-collector-logging/)
