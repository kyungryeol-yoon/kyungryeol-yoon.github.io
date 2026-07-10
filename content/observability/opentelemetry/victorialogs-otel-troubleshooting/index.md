---
title: "VictoriaLogs 클러스터 + OpenTelemetry 폐쇄망 트러블슈팅: 포트·vmauth·k8s 필드·로그 레벨 총정리"
date: 2026-07-10
tags: ["victorialogs", "opentelemetry", "otel-collector", "kubernetes", "observability", "troubleshooting", "logsql", "vmauth"]
description: "폐쇄망 K8s 멀티클러스터에 VictoriaLogs 클러스터 + OpenTelemetry 로그 스택을 구축하며 겪은 실전 문제를 증상→원인→해결로 정리합니다. single/cluster 포트, vmauth 400, k8s 필드 누락, block_stats 용량 산정, 로그 레벨 파싱까지 다룹니다."
series: "OTel + VictoriaLogs 로그 스택"
series_order: 13
---

공식 문서대로 했는데 안 되는 지점이 유독 많은 조합이 **VictoriaLogs 클러스터 + OpenTelemetry**입니다. 대부분은 공식 예시가 **single-node 기준**이라 cluster에서 포트·경로·라우팅이 어긋나거나, OTel의 **processor를 정의만 하고 pipeline에 등록하지 않아** 조용히 무시되는 데서 옵니다. 이 글은 폐쇄망 멀티클러스터(dev/stg/prod + 중앙 mgmt)에 로그 스택을 세우며 실제로 막혔던 문제들을 **증상 → 원인 → 해결** 형태로 모았습니다. 이 시리즈의 [백엔드편](/observability/opentelemetry/kubernetes-victorialogs-cluster-helm-install/)·[설치편](/observability/opentelemetry/kubernetes-otel-collector-offline-helm-install/)을 먼저 세운 뒤, 실제 운영에서 부딪히는 함정을 정리하는 마지막 편입니다.

> 전제 환경: K8s 멀티클러스터(노드 20+), VictoriaLogs는 **cluster 모드**로 mgmt에 구축, 수집은 OTel Collector(Agent DaemonSet + Gateway Deployment), 전송은 `otlphttp`(HTTP), `env` 라벨로 클러스터 구분, 폐쇄망(이미지·차트 버전 고정).

---

## 🔌 1. 포트 혼란: single은 9428, cluster는 9481·9471·8427

**증상**: 공식 OpenTelemetry 적재 가이드대로 `http://<host>:9428/insert/opentelemetry/v1/logs`로 보냈는데 전송이 안 되거나 연결이 거부됩니다.

**원인**: 그 `9428`은 **single-node 예시**입니다. single-node는 모든 기능이 포트 하나(`9428`)에 통합돼 있지만, **cluster 모드는 컴포넌트별로 포트가 분리**됩니다. single 문서를 보고 cluster에 `9428`로 적재를 시도하면 닿지 않습니다.

| 배포 모드 | 적재 | 조회 | 진입점 |
|---|---|---|---|
| **single-node** | `9428` | `9428` | `9428` (전부 통합) |
| **cluster** | **vlinsert `9481`** | **vlselect `9471`** | **vmauth `8427`** |

**해결**: 자기 구성이 cluster면 적재는 **vmauth(`8427`) 경유가 표준**이고, vmauth 없이 **vlinsert(`9481`) 직결**도 가능합니다. `vlinsert`는 OpenTelemetry·Elasticsearch·Loki·Syslog 등 **모든 적재 프로토콜을 이 포트에서** 받습니다.

### `endpoint` vs `logs_endpoint` — 경로 자동완성 차이

포트를 맞춰도 경로에서 또 막힙니다. `otlphttp` exporter는 **어떤 키를 쓰느냐에 따라 `/v1/logs`를 자동으로 붙이기도, 안 붙이기도** 합니다.

| 키 | 자동 경로 완성 | 적어야 하는 값 |
|---|---|---|
| `endpoint` | ✅ OTLP 표준대로 `/v1/logs` **자동 부착** | `http://<host>:9481/insert/opentelemetry` 까지만 |
| `logs_endpoint` | ❌ 자동으로 안 붙음 | 전체 경로 `http://<host>:9481/insert/opentelemetry/v1/logs` |

> 💡 `otlphttp`는 HTTP, `otlp`는 gRPC입니다. exporter 이름 뒤의 `/victorialogs` 같은 건 **별칭일 뿐** 타입과 무관합니다(타입은 앞부분 `otlphttp`/`otlp`로 갈립니다).

---

## 🚦 2. vmauth 400: url_prefix 경로 중복

**증상**: vlinsert(`9481`)로 **직접** 보내면 되는데, **vmauth(`8427`) 경유**로 보내면 `400`이 납니다.

**원인**: vmauth는 프록시이고, url_map의 `url_prefix`는 **들어온 경로를 prefix 뒤에 그대로 이어 붙입니다.** 그래서 `url_prefix` 끝에 `/insert`를 넣으면 경로가 중복됩니다.

```text
url_prefix: http://<vlinsert>:9481/insert
들어온 경로:                      /insert/opentelemetry/v1/logs
실제 요청:  http://<vlinsert>:9481/insert/insert/opentelemetry/v1/logs  → 400
```

조회도 마찬가지로 `.../select/select/logsql/query`가 되어 실패합니다.

**해결**: `url_prefix`에는 **포트까지만** 적고, 끝에 `/insert`·`/select`를 붙이지 않습니다. 경로 구분은 `src_paths`로 합니다.

```yaml
unauthorized_user:
  url_map:
    - src_paths:
        - "/insert/.*"
      url_prefix: http://<vlinsert-svc>:9481   # 끝에 /insert 붙이지 않음
    - src_paths:
        - "/select/.*"
      url_prefix: http://<vlselect-svc>:9471   # 끝에 /select 붙이지 않음
```

> 💡 `/insert.*`처럼 슬래시 없이 써도 정규식상 동작하지만, `/insert/.*`가 더 엄밀하고 안전합니다.

---

## 🚫 3. `-select.disable` 에러: 조회가 vlinsert로 잘못 라우팅

**증상**: vmui나 Grafana에서 조회가 안 되고 다음 에러가 뜹니다.

```text
requests to /select/* are disabled with -select.disable command-line flag
```

**원인**: url_map에 **포괄 규칙 하나**(`src_paths: ["/.*"]`)만 두고 전부 vlinsert로 보내면, **조회(`/select/*`) 요청까지 vlinsert로** 갑니다. cluster에서는 차트가 vlinsert에 `-select.disable`을, vlselect에 `-insert.disable`을 **기본으로 자동 주입**합니다(정상 동작). 그래서 조회가 vlinsert에 도달하면 이 플래그에 걸려 거부됩니다.

**해결**: 앞의 2번처럼 url_map을 `/insert/.*` → vlinsert, `/select/.*` → vlselect로 **분리**합니다. **vlinsert에 `-select.disable`이 있는 것 자체는 정상**입니다 — 이 에러는 "vlinsert에 문제가 있다"가 아니라 **"조회 요청이 엉뚱한 컴포넌트로 라우팅됐다"**는 신호로 읽어야 합니다.

```bash
# vlinsert에 select.disable이 있는지 확인 (있는 게 정상)
kubectl -n <ns> get pod <vlinsert-pod> -o yaml | grep -A20 args
```

---

## 📁 4. hostPath·hostPort와 Kyverno Audit 모드

### 증상 A — hostPath 금지 경고인데 배포는 됨

OTel Agent(DaemonSet)가 노드 로그(`/var/log/pods`)를 읽으려면 **hostPath 마운트(readOnly)**가 필요합니다. 그런데 설치 시 이런 경고가 뜹니다.

```text
HostPath volumes are forbidden ... spec.volumes[*].hostPath must be unset
```

**원인**: hostPath를 금지하는 **Kyverno 정책**(예: `disallow-host-path`)입니다. 다만 정책이 **Audit 모드**면 경고·리포트만 남기고 배포는 막지 않습니다.

**진단**:

```bash
# 정책 모드 확인 (Audit면 경고만, Enforce면 차단)
kubectl get clusterpolicy <name> -o yaml | grep validationFailureAction
# 예외가 등록돼 있는지 (없으면 No resources)
kubectl get policyexception -A
```

**해결**: `Audit` 모드 + 예외 없음이면 **기능은 정상**이므로 경고는 무시해도 됩니다. 다만 PolicyReport에 위반 기록이 쌓이고, 나중에 **`Enforce`로 바뀌면 차단**됩니다. 정공법은 readOnly hostPath를 **PolicyException으로 반영**하는 것입니다(네임스페이스·경로·readOnly 한정). 구두 승인만으로는 정책에 반영돼 있지 않을 수 있으니 실제 리소스로 등록을 요청하세요.

### 증상 B — hostPort가 계속 렌더링됨

로그 수집에 **hostPort는 불필요**한데, values에서 `-1`/`0`/삭제를 시도해도 차트가 계속 hostPort를 넣습니다.

**원인**: 차트 버전에 따라 ports 렌더링 템플릿이 **hostPort를 무조건 렌더링**합니다.

**해결**(권장 순):

1. hostPort를 만드는 **preset을 끄기**.
2. values의 `ports` 섹션에서 **hostPort 키 자체를 제거**(값을 0으로 두는 게 아니라 키를 없앰).
3. 출처를 확인하고, values로 안 되면 **post-render(kustomize)로 제거**(업그레이드에도 유지).

```bash
# hostPort가 어디서 나오는지 출처 확인
helm template <release> <chart> -f values.yaml | grep -B3 -A3 hostPort
```

> ⚠️ 차트 `templates/_config.tpl`에서 hostPort를 강제로 0/제거하는 건 **차트 업그레이드 시 사라지는 임시방편**입니다. 정착 방법으로는 위 (1)~(3)을 쓰세요.

---

## 🏷️ 5. k8s 필드가 하나도 안 들어온다: container operator 필요

**증상**: `presets.kubernetesAttributes: true`인데도 VictoriaLogs 대시보드에 `k8s.namespace.name`·`k8s.pod.name` 같은 필드가 **하나도** 없습니다.

**원인**: `k8sattributes` processor **혼자서는** k8s 필드를 못 만듭니다. 메타데이터는 **두 단계**로 붙습니다.

1. **filelog의 `container` operator + `include_file_path: true`** — 로그 파일 경로(`/var/log/pods/<namespace>_<pod>_<uid>/<container>/*.log`)에서 namespace·pod·container **기본 필드를 추출**합니다. 이게 없으면 애초에 pod 정보 자체가 안 생깁니다.
2. **`k8sattributes` processor** — 위에서 만들어진 pod 정보를 기준으로 **Kubernetes API에 질의해 labels·annotations를 보강**합니다.

즉 container operator가 먼저 "무엇에 대해 물어볼지"를 만들어야 k8sattributes가 동작합니다. 순서가 핵심입니다.

**해결**: filelog에 두 가지를 반드시 넣습니다.

```yaml
config:
  receivers:
    filelog:
      include: [/var/log/pods/*/*/*.log]
      include_file_path: true          # ① 경로를 로그에 부착 (없으면 파싱 불가)
      operators:
        - type: container              # ② 경로에서 namespace/pod/container 추출
  processors:
    k8sattributes:
      auth_type: serviceAccount        # SA 토큰으로 API 인증 (차트가 RBAC 자동 생성)
      passthrough: false               # true면 API 호출을 안 해 labels가 안 붙음
      extract:
        metadata:
          - k8s.namespace.name
          - k8s.pod.name
          - k8s.node.name
          - k8s.container.name
      filter:
        node_from_env_var: K8S_NODE_NAME   # 자기 노드 pod만 watch (API 부하 감소)
```

**k8sattributes 옵션 요점**:

- `passthrough: false`가 기본이자 정답입니다. `true`면 API 질의를 건너뛰어 labels가 비어 옵니다.
- `filter.node_from_env_var: K8S_NODE_NAME`를 빼면 **노드마다 전체 클러스터 pod를 watch**해 API 서버 부하가 노드 수만큼 폭증합니다. `K8S_NODE_NAME`은 차트가 downward API(`spec.nodeName`)로 자동 주입하므로 별도 정의가 필요 없습니다.
- **RBAC는 `kubernetesAttributes` preset이 최소 권한으로 자동 생성**합니다. 수동으로 만들 필요가 없고, 프리셋 범위를 넘는 스코프를 원할 때만 추가로 부여합니다.

---

## 📊 6. VictoriaLogs는 폴더가 아니라 스트림 필드로 분류한다

**증상**: 저장 디렉터리를 열어봤더니 **날짜별로만** 나뉘어 있고, 네임스페이스·파드별 폴더 구성이 없습니다.

**원인이자 개념**: VictoriaLogs는 디렉터리 계층으로 분류하지 않습니다. 물리 저장은 **날짜 파티션(day partition, `YYYYMMDD`)** 단위이고, 네임스페이스·파드·클러스터 구분은 폴더가 아니라 **스트림 필드(stream fields)**로 합니다. 날짜를 물리 단위로 두는 이유는 **retention(오래된 로그 삭제)을 날짜 통째로 지워** 빠르게 처리하기 위해서입니다.

### 스트림 필드 vs 일반 필드

- **스트림 필드**로 지정된 값들은 독립 필드가 아니라 **`_stream`이라는 하나의 묶음** 안에 들어갑니다.
  예: `_stream = {env="mgmt", k8s.namespace.name="kube-system", k8s.pod.name="..."}`
- 스트림 필드가 **아닌** 나머지는 일반(독립) 필드로 저장되어, `stats by ("필드명")`으로 바로 그룹핑할 수 있습니다.
- 그래서 스트림 필드를 `stats by ("k8s.namespace.name")`로 **직접 그룹핑하려 하면 빈 결과**가 납니다(묶여 있어서). `_stream`으로 집계한 뒤 `extract`로 값을 꺼내야 합니다(7번 참고).

> ⚠️ 기본값 주의: VictoriaLogs는 OTLP 리소스 라벨을 **전부 스트림 필드로** 취급합니다. 그대로 두면 `trace_id`처럼 고유값이 큰 필드까지 스트림에 들어가 **카디널리티가 폭증**합니다. 그래서 적재 시 `VL-Stream-Fields`로 **스트림 필드를 제한**하는 게 권장됩니다.

```yaml
exporters:
  otlphttp/victorialogs:
    endpoint: http://<vlinsert-svc>:9481/insert/opentelemetry   # /v1/logs 자동 부착
    headers:
      VL-Stream-Fields: "env,k8s.namespace.name,k8s.pod.name"    # 스트림 필드 제한
```

---

## 💾 7. 네임스페이스·클러스터별 로그 용량 산정 (block_stats)

**증상**: `_size` 필드로 용량을 보려니 `NaN`이 나옵니다.

**원인**: `_size` 필드는 존재하지 않습니다. 실제 압축된 디스크 사용량은 **`block_stats` pipe**로 봅니다 — `values_bytes`(로그 값) + `bloom_bytes`(블룸 필터 인덱스)의 합이 물리 저장량입니다. 디스크 용량은 저장소만 아는 값이라 **OTel이 아니라 VictoriaLogs 쿼리로** 산정하는 게 맞습니다(OTel은 압축 전 통과 데이터만 봅니다).

**기본 — 스트림별 용량**:

```text
_time:7d | block_stats
| stats by (_stream) sum(values_bytes) as v, sum(bloom_bytes) as b
| math (v+b)/1024/1024/1024 as total_gb
| sort by (total_gb desc)
```

> ⚠️ 반드시 시간 필터(`_time:7d` 등)로 범위를 좁히세요(안 그러면 전체 스캔). 점(`.`)이 든 필드명은 따옴표 필수입니다: `"k8s.namespace.name"`.

### 클러스터(env) 간 네임스페이스 겹침 — 가장 자주 놓치는 함정

`kube-system`, `logging` 같은 네임스페이스는 dev/stg/prod/mgmt **모든 클러스터에 존재**합니다. 네임스페이스 이름만으로 그룹핑하면 **여러 클러스터의 같은 이름 네임스페이스가 한 덩어리로 합쳐져** 클러스터 구분이 안 됩니다. 스트림 필드는 `_stream`에 묶여 있으므로, `extract`로 값을 꺼내 재집계해야 합니다.

**env + 네임스페이스 조합(클러스터별로 구분 — 권장)**:

```text
_time:7d | block_stats
| stats by (_stream) sum(values_bytes) as v, sum(bloom_bytes) as b
| math (v+b) as total_bytes
| extract 'env="<envval>"' from _stream
| extract 'k8s.namespace.name="<ns>"' from _stream
| stats by (envval, ns) sum(total_bytes) as bytes
| math bytes/1024/1024/1024 as total_gb
| fields envval, ns, total_gb
| sort by (total_gb desc) | limit 30
```

`extract '패턴="<추출변수>"' from _stream` 패턴이 핵심입니다. env·namespace를 **둘 다** 꺼내 `stats by (envval, ns)`로 묶으면 결과가 `prod/kube-system`, `dev/kube-system`처럼 클러스터별로 분리됩니다.

**특정 클러스터 고정 후 네임스페이스별(리포트·파이차트에 깔끔)**:

```text
_time:7d {env="prod"} | block_stats
| stats by (_stream) sum(values_bytes) as v, sum(bloom_bytes) as b
| math (v+b) as total_bytes
| extract 'k8s.namespace.name="<ns>"' from _stream
| stats by (ns) sum(total_bytes) as ns_bytes
| math ns_bytes/1024/1024/1024 as total_gb
| fields ns, total_gb
| sort by (total_gb desc) | limit 15
```

앞에 `{env="prod"}` 스트림 필터로 클러스터 하나를 고정하면, 파이차트 라벨이 `kube-system`처럼 짧아 보기 좋습니다(클러스터별로 패널을 분리).

**특정 네임스페이스 제외**(스캔 전 제거라 효율적):

```text
_time:7d {"k8s.namespace.name"!="kyverno-system"} | block_stats
| stats by (_stream) sum(values_bytes) as v, sum(bloom_bytes) as b
| math (v+b) as total_bytes
| extract 'k8s.namespace.name="<ns>"' from _stream
| stats by (ns) sum(total_bytes) as ns_bytes
| math ns_bytes/1024/1024/1024 as total_gb
| fields ns, total_gb | sort by (total_gb desc) | limit 15
```

여러 개 제외는 `{"k8s.namespace.name"!="kyverno-system", "k8s.namespace.name"!="kube-system"}`처럼 쉼표(AND)로 나열합니다.

**날짜별 추이**(시간 범위 조정이 아니라 시간 버킷 그룹핑):

```text
_time:30d | block_stats
| stats by (_stream, _time:1d) sum(values_bytes) as v, sum(bloom_bytes) as b
| math (v+b) as total_bytes
| extract 'k8s.namespace.name="<ns>"' from _stream
| stats by (ns, _time:1d) sum(total_bytes) as bytes
| math bytes/1024/1024/1024 as total_gb
| sort by (_time)
```

> 💡 파드별로 보면 재생성 때마다 이름이 바뀌어 같은 앱이 여러 줄로 쪼개집니다. 앱 단위로 보려면 `k8s.deployment.name`이나 `app` 라벨로 그룹핑하세요.

### Grafana `_time` override 경고

쿼리에 `_time:7d`를 넣으면 Grafana가 "time range is overridden by the query `_time` filter" 경고를 냅니다. **에러가 아니라**, 쿼리의 `_time`이 대시보드 시간 선택보다 우선한다는 안내입니다. 대시보드 시간 선택을 쓰려면 쿼리에서 `_time`을 빼고, 고정 기간 리포트라면 `_time:7d`를 넣고 경고를 무시하면 됩니다.

---

## 🔤 8. 평문·klog 로그 레벨 구분: OTel에서 파싱한다

**증상**: "로그를 error/warn/info로 구분해달라"는 요청을 받았는데, 앱이 평문만 보내 레벨 정보가 없습니다.

**원인**: VictoriaLogs는 로그 레벨을 **자동으로 알지 못합니다.** OTel 수집 단계에서 파싱해 `level` 필드로 만들어야 Grafana에서 구분됩니다. 문제는 **앱마다 로그 포맷이 다르고, 포맷별로 파싱 방식이 다르다**는 점입니다.

| 포맷 | 예시 | 파싱 방식 |
|---|---|---|
| **JSON** | `{"level":"INFO", ...}` | filelog `json_parser` (가장 정확) |
| **logfmt** | `time="..." level=info ...` | filelog `key_value_parser` |
| **klog** | `E0719 12:34:...` | 첫 글자 E/W/I/F를 정규식으로 판정 |
| **순수 평문** | 구조 없음 | 본문 키워드(error/fail/실패…)로 추정 |

**해결의 핵심은 우선순위**입니다 — **구조화 파싱(앱이 명시한 level)을 먼저** 쓰고, 안 되는 것만 추정합니다: 구조화 level → klog 첫 글자 → 평문 키워드 → `unknown`.

**① filelog에서 JSON·logfmt 먼저 파싱**(추측이 아니라 정확 추출):

```yaml
receivers:
  filelog:
    include: [/var/log/pods/*/*/*.log]
    include_file_path: true
    operators:
      - type: container
      - type: json_parser
        if: 'body matches "^\\{"'          # { 로 시작하면 JSON
        parse_from: body
      - type: key_value_parser
        if: 'body matches "level="'         # level= 이 있으면 logfmt
        parse_from: body
        delimiter: "="
        pair_delimiter: " "
```

**② transform으로 정규화·추정**:

```yaml
processors:
  transform/loglevel:
    log_statements:
      - context: log
        statements:
          # 0) 다른 필드명(severity/lvl 등)을 level로 통일
          - set(attributes["level"], attributes["severity"]) where attributes["level"] == nil and attributes["severity"] != nil
          - set(attributes["level"], attributes["lvl"]) where attributes["level"] == nil and attributes["lvl"] != nil
          # 1) 이미 있으면 소문자로 정규화 (INFO/Info/info 통일)
          - set(attributes["level"], ConvertCase(attributes["level"], "lower")) where attributes["level"] != nil
          # 2) 없으면 klog 첫 글자로 추정
          - set(attributes["level"], "fatal") where attributes["level"] == nil and IsMatch(body, "^F[0-9]")
          - set(attributes["level"], "error") where attributes["level"] == nil and IsMatch(body, "^E[0-9]")
          - set(attributes["level"], "warn")  where attributes["level"] == nil and IsMatch(body, "^W[0-9]")
          - set(attributes["level"], "info")  where attributes["level"] == nil and IsMatch(body, "^I[0-9]")
          # 3) 그래도 없으면 평문 키워드 추정 (영문 + 한글)
          - set(attributes["level"], "error") where attributes["level"] == nil and IsMatch(body, "(?i)(error|exception|fail|panic|실패|오류|에러|예외)")
          - set(attributes["level"], "warn")  where attributes["level"] == nil and IsMatch(body, "(?i)(warn|deprecated|경고|주의)")
          # 4) 다 안 되면 판별 불가
          - set(attributes["level"], "unknown") where attributes["level"] == nil
```

**놓치기 쉬운 포인트**:

- **대소문자 정규화 필수**: JSON은 `INFO`, logfmt는 `info`, 어떤 앱은 `Info`. `ConvertCase(..., "lower")`로 통일하지 않으면 Grafana에서 세 값으로 쪼개집니다.
- **필드명 차이**: level이 `severity`·`lvl`·`loglevel`로 올 수 있어, 여러 후보를 `level`로 옮기는 규칙을 먼저 둡니다.
- **OTTL nil 비교**: "값이 있을 때"는 `!= nil`, "없을 때"는 `== nil`을 **명시적으로** 씁니다. 값이 있으면 정규화하고, `== nil`일 때만 추정 규칙이 적용되도록 각 추정 규칙에 `== nil`을 붙입니다.
- **한계**: 단서 없는 평문은 판별 불가(`unknown`)이고 키워드 오탐도 가능합니다("error 처리 정상"이 error로 분류). 근본 해결은 앱의 JSON 구조화 로깅이며, **`unknown` 비율이 곧 "앱 로깅 개선 필요량"의 근거**가 됩니다.

> 🚨 가장 흔한 실수: `transform/loglevel`을 `processors:` 아래 **정의만** 하고 pipeline에 등록하지 않으면 **아무 일도 일어나지 않습니다.** 다음 9번을 반드시 지키세요.

---

## 🧹 9. processor는 pipeline에 등록해야 동작한다 + 네임스페이스 제외

### processor 정의 ≠ 동작

OTel에서 `processors:` 아래 정의는 **"이런 processor가 있다"는 선언일 뿐**입니다. `service.pipelines.<signal>.processors` **리스트에 이름을 넣어야** 실제로 그 파이프라인을 통과합니다. 그리고 **나열 순서 = 실행 순서**입니다.

```yaml
service:
  pipelines:
    logs:
      receivers: [filelog]
      processors: [k8sattributes, transform/loglevel, batch]   # ← 여기 등록해야 동작
      exporters: [otlphttp/victorialogs]
```

- 관례: `memory_limiter`는 맨 앞, `batch`는 맨 뒤. 그 사이에 k8sattributes → transform → filter 순.
- 순서 이유: `k8sattributes`(메타데이터 부착) → `transform/loglevel`(레벨 파싱) → `batch`(전송 직전 묶기).

### 수집 안 할 네임스페이스 제외 — 두 가지 방법

| 방법 | 거르는 위치 | 특징 |
|---|---|---|
| **A. filelog `exclude`** (권장) | 파일을 **아예 안 읽음** | 리소스·전송량 절약. 단순 네임스페이스 제외에 최적 |
| **B. filter processor** | k8sattributes **뒤에서** 버림 | 이미 읽고 파싱한 걸 버림(비용 큼). 라벨 등 복잡한 조건용 |

**방법 A — filelog exclude** (로그 경로가 `<namespace>_*` 형태라 네임스페이스별 제외 가능):

```yaml
receivers:
  filelog:
    include: [/var/log/pods/*/*/*.log]
    exclude:
      - /var/log/pods/kube-system_*/*/*.log
      - /var/log/pods/kyverno-system_*/*/*.log
    include_file_path: true
    operators:
      - type: container
```

**방법 B — filter processor** (pipeline 등록 필수, k8sattributes 뒤에):

```yaml
processors:
  filter/exclude_ns:
    logs:
      exclude:
        match_type: strict
        resource_attributes:
          - key: k8s.namespace.name
            value: kube-system
```

이때 pipeline은 `[k8sattributes, filter/exclude_ns, transform/loglevel, batch]` 순서가 됩니다.

---

## 🧩 10. VL-* 적재 헤더 종류

`VL-Stream-Fields` 외에도 적재를 제어하는 HTTP 헤더가 여럿 있습니다. **모든 HTTP 기반 적재 프로토콜이 지원**하며, 각 헤더는 HTTP query arg 형태로도 쓸 수 있습니다(query arg가 헤더보다 우선).

| 헤더 | query arg | 역할 |
|---|---|---|
| `VL-Msg-Field` | `_msg_field` | 로그 메시지 필드 이름. 미지정 시 `_msg`. 쉼표 나열 시 첫 비어있지 않은 값 |
| `VL-Time-Field` | `_time_field` | 타임스탬프 필드. 미지정/`0`/`-`이면 적재 시각 사용 |
| `VL-Stream-Fields` | `_stream_fields` | 스트림 필드로 취급할 필드 목록(쉼표 구분) |
| `VL-Ignore-Fields` | `ignore_fields` | 적재 시 무시할 필드 |
| `VL-Extra-Fields` | — | 모든 로그에 강제로 추가할 필드(`key=value`) |
| `VL-Decolorize-Fields` | `decolorize_fields` | ANSI 색상 코드 제거 대상 필드 |
| `VL-Preserve-JSON-Keys` | `preserve_json_keys` | 원본 값을 보존할 JSON 키 |
| `AccountID` / `ProjectID` | — | 멀티테넌시 테넌트 지정 |

> ⚠️ `VL-Stream-Fields`에 **빈 항목**(`foo,,bar`처럼 연속 쉼표)이 있으면, 예기치 않게 `_msg`가 스트림 필드에 추가되어 스트림 수가 폭증할 수 있습니다. 값에 빈 항목이 없도록 주의하세요.

---

## 🔎 11. 디버깅: 필드·스트림 확인 한 줄

무엇이 스트림 필드(`_stream`에 묶임)이고 무엇이 독립 필드인지 헷갈릴 때는, 로그 한 건을 통째로 봅니다.

```text
_time:5m | limit 1
```

`_stream` 안에 들어간 값들이 스트림 필드, 바깥에 있는 것이 일반 필드입니다. 앞선 `stats by (...)`가 빈 결과를 낸다면 대상이 스트림 필드였을 가능성이 큽니다(7번의 `extract` 패턴으로 해결).

> 폐쇄망에서 Grafana VictoriaLogs 플러그인을 수동 설치하다 "permission denied plugin backend"를 만난다면, 백엔드 플러그인 바이너리에 실행 권한(`+x`)이 없어서입니다. 커스텀 이미지로 플러그인을 포함하거나 init container로 `+x`를 부여하세요. 자세한 절차는 [폐쇄망 VictoriaLogs Grafana 플러그인 설치편](/observability/grafana/grafana-offline-victorialogs-plugin-install/)에 정리돼 있습니다.

---

## ❓ 자주 묻는 질문

**Q. cluster인데 `9428`로 보내도 되나요?**
안 됩니다. `9428`은 single-node 전용입니다. cluster는 적재 **vlinsert `9481`** 또는 **vmauth `8427`**, 조회 **vlselect `9471`** 또는 vmauth `8427`을 씁니다.

**Q. `-select.disable` 에러는 vlinsert를 고쳐야 하나요?**
아닙니다. vlinsert에 이 플래그가 있는 건 정상입니다. **조회 요청이 vlinsert로 잘못 라우팅**된 것이니 vmauth url_map을 `/select/.*` → vlselect로 분리하면 됩니다.

**Q. k8sattributes만 켰는데 왜 네임스페이스가 안 붙나요?**
filelog의 `container` operator + `include_file_path: true`가 **먼저** 경로에서 기본 필드를 만들어야 합니다. k8sattributes는 그 위에 API로 labels를 보강할 뿐입니다.

**Q. 로그 레벨 규칙을 만들었는데 반영이 안 돼요.**
`transform/loglevel`을 `service.pipelines.logs.processors` 리스트에 **등록**했는지 확인하세요. `processors:` 아래 정의만으로는 동작하지 않습니다.

**Q. 네임스페이스별 용량이 여러 클러스터에서 합쳐져요.**
`kube-system` 같은 네임스페이스는 모든 클러스터에 있습니다. `env`를 함께 `extract`해 `stats by (envval, ns)`로 조합하거나, `{env="prod"}`로 클러스터를 고정하세요.

---

## 📚 참고

- [VictoriaLogs — Cluster](https://docs.victoriametrics.com/victorialogs/cluster/)
- [VictoriaLogs — Data Ingestion (HTTP 헤더 목록)](https://docs.victoriametrics.com/victorialogs/data-ingestion/)
- [VictoriaLogs — Data Ingestion: OpenTelemetry](https://docs.victoriametrics.com/victorialogs/data-ingestion/opentelemetry/)
- [VictoriaLogs — Key Concepts (스트림 필드)](https://docs.victoriametrics.com/victorialogs/keyconcepts/)
- [VictoriaLogs — LogsQL](https://docs.victoriametrics.com/victorialogs/logsql/)
- [VictoriaLogs — FAQ (block_stats 디스크 용량)](https://docs.victoriametrics.com/victorialogs/faq/)
- [vmauth — VictoriaMetrics](https://docs.victoriametrics.com/victoriametrics/vmauth/)
- [OpenTelemetry Collector — filelog receiver container 파서](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/)
- 시리즈 관련 글: [백엔드편(VictoriaLogs 클러스터 구축)](/observability/opentelemetry/kubernetes-victorialogs-cluster-helm-install/) · [설치편(OTel Collector Helm)](/observability/opentelemetry/kubernetes-otel-collector-offline-helm-install/) · [멀티클러스터 중앙집중](/observability/opentelemetry/otel-multicluster-central-logging/)
