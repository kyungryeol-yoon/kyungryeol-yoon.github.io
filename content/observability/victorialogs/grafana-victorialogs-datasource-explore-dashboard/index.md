---
title: "Grafana에 VictoriaLogs 연결하기: 플러그인 설치부터 Explore·대시보드·알림까지"
date: 2026-06-21
tags: ["grafana", "victorialogs", "logsql", "kubernetes", "observability", "dashboard", "plugin"]
description: "Grafana에서 VictoriaLogs 로그를 조회하기 위한 데이터소스 플러그인 설치(온라인·폐쇄망), 데이터소스 프로비저닝, Explore와 QueryBuilder, 대시보드 패널, Ad Hoc 필터 설정을 실전 기준으로 정리합니다."
series: "OTel + VictoriaLogs 로그 스택"
series_order: 10
---

Grafana에서 VictoriaLogs 로그를 보려면 **`victoriametrics-logs-datasource` 플러그인을 설치**하고 **데이터소스 URL을 진입점(single `9428` / cluster vmauth `8427`)으로 지정**하면 됩니다. 설치는 온라인이면 `GF_INSTALL_PLUGINS`, 폐쇄망이면 **init container로 release tarball을 풀어 넣으며**, 백엔드 플러그인이라 실행 권한에 주의해야 합니다. 연결 후에는 Explore에서 LogsQL `*`로 시작해 **QueryBuilder·패널·Ad Hoc 필터**로 확장합니다. 이 글은 **"OTel + VictoriaLogs 로그 스택" 시리즈의 대시보드 트랙 2편(Grafana 연결)** 으로, [1편(조회 개요)](/observability/victorialogs/victorialogs-log-viewing-grafana-vmui-perses/)에서 잡은 "데이터소스 방식"을 실제로 구현합니다.

## 🔌 무엇을 설치하나

**Grafana ↔ VictoriaLogs 연결의 핵심은 `victoriametrics-logs-datasource` 데이터소스 플러그인 하나**입니다. Grafana 플러그인 카탈로그에서 "victorialogs"로 검색되며, 데이터소스 `type` 문자열도 동일합니다.

> ⚠️ 이 플러그인은 **Go 바이너리를 포함한 백엔드 플러그인**입니다. 즉 **실행 권한(+x)** 이 있어야 기동됩니다. 폐쇄망에서 수동 복사하면 권한 누락으로 "permission denied / plugin backend" 오류가 흔합니다(상세는 [오프라인 플러그인 설치 트러블슈팅 글](/observability/victorialogs/grafana-offline-victorialogs-plugin-install/)).

설치 → 데이터소스 추가 → Explore 순으로 진행합니다.

---

## 📦 플러그인 설치: 온라인 vs 폐쇄망

**설치 방법은 인터넷 가능 여부로 갈립니다.** 규모와 무관하게 이 둘 중 하나입니다.

**1) 온라인 — 환경변수 한 줄**

```yaml
# docker / helm env
GF_INSTALL_PLUGINS: victoriametrics-logs-datasource
```

컨테이너 시작 시 플러그인이 자동으로 내려받아 설치됩니다.

**2) 폐쇄망 — init container로 tarball 설치**

사내 미러에서 release tarball을 받아 `/var/lib/grafana/plugins`에 풀어 넣습니다. Helm Grafana 차트면 `extraInitContainers`를 씁니다.

```yaml
# Helm Grafana 차트: extraInitContainers
extraInitContainers:
  - name: load-vl-plugin
    image: <사내레지스트리>/curl:latest
    workingDir: /var/lib/grafana
    securityContext:
      runAsUser: 472          # grafana 유저
      runAsGroup: 472
      runAsNonRoot: true
    command: ["/bin/sh"]
    args:
      - "-c"
      - |
        set -ex
        mkdir -p /var/lib/grafana/plugins/
        curl -L <사내미러>/victoriametrics-logs-datasource-<버전>.tar.gz -o /tmp/vl.tar.gz
        tar -xf /tmp/vl.tar.gz -C /var/lib/grafana/plugins/
    volumeMounts:
      - name: storage          # grafana-operator는 grafana-data
        mountPath: /var/lib/grafana
```

> ⚠️ `kubectl cp`로 직접 복사하면 실행 권한이 빠지기 쉽습니다. **init container 또는 커스텀 이미지**로 설치하는 것을 권장합니다. grafana-operator를 쓴다면 `/spec/deployment/spec/template/spec/initContainers`에 동일하게 넣되, `volumeMount` 이름(`grafana-data` vs `storage`)에 주의하세요.

---

## ⚙️ 데이터소스 프로비저닝 (코드로 선언)

**데이터소스는 UI로도, 프로비저닝 파일로도 추가**할 수 있습니다. GitOps라면 파일 방식이 좋습니다.

```yaml
# provisioning/datasources/victorialogs.yaml
apiVersion: 1
datasources:
  - name: VictoriaLogs
    type: victoriametrics-logs-datasource
    access: proxy
    # cluster: vmauth 8427 / single: 9428
    url: http://<release>-vmauth.<ns>.svc:8427
    jsonData:
      # 필요 시 멀티테넌시 헤더
      multitenancyHeaders:
        AccountID: "0"
        ProjectID: "0"
```

- `access: proxy` — 쿼리가 Grafana 백엔드를 거쳐 나갑니다(브라우저 직결 아님).
- **sidecar 방식 Grafana 차트**면 `grafana_datasource: "1"` 라벨을 단 ConfigMap으로 자동 등록할 수도 있습니다.

---

## 🔍 Explore로 첫 조회

**연결을 확인하는 가장 빠른 길은 Explore에서 LogsQL `*`** 입니다.

```logsql
*                          # 전체 조회
env:prod                   # 환경 분리
k8s.namespace.name:<ns>    # 특정 네임스페이스
```

- Explore에서 데이터소스로 **VictoriaLogs**를 선택하고 위 쿼리를 입력합니다.
- **라이브 스트리밍** 토글로 실시간 tail이 가능합니다.

---

## 🧱 QueryBuilder vs Code

**LogsQL을 직접 쓰기 부담되면 QueryBuilder로 시각적으로 조립**할 수 있습니다(Builder/Code 토글).

- **Builder** — 필드·값 드롭다운으로 파이프(Filter·Modify·Aggregate·Sort·Limit)를 연결합니다.
- **Builder → Code** — LogsQL로 **안전하게 직렬화**됩니다.
- **Code → Builder** — 확인을 거치며 **수동 작성 쿼리는 폐기**되니 주의하세요(raw LogsQL의 builder 자동변환은 아직 미지원).

> 💡 스트림 필드는 field picker의 **"Stream fields"** 그룹에 모여 있고, 선택하면 자동으로 stream filter로 변환됩니다. 참고로 스트림 필드는 `_stream`에 **묶여** 있어 `stats by ("k8s.namespace.name")`로 직접 그룹핑하면 빈 결과가 납니다. 이 함정과 `block_stats`로 **용량을 산정**하는 법은 [트러블슈팅편 — 스트림 필드 분류](/observability/victorialogs/victorialogs-otel-troubleshooting/#-6-victorialogs는-폴더가-아니라-스트림-필드로-분류한다) · [로그 용량 산정](/observability/victorialogs/victorialogs-otel-troubleshooting/#-7-네임스페이스클러스터별-로그-용량-산정-block_stats)을 참고하세요.

---

## 📊 대시보드 패널 만들기

**패널 시각화 종류에 맞는 query type을 골라야** 데이터가 제대로 그려집니다.

| 패널 | Query Type |
|---|---|
| Logs / Table | **Raw Logs** |
| Time series / Heatmap | **Range** |
| Stats | **Instant** |

예를 들어 **네임스페이스별 로그량 추이 그래프**는 Time series 패널 + `Range` query type에 `stats by (k8s.namespace.name)` 형태로 만듭니다.

---

## 🎚️ Ad Hoc 필터로 대시보드 인터랙티브하게

**Ad Hoc 필터를 쓰면 대시보드 상단에서 즉석으로 로그를 필터링**할 수 있습니다. 패널별로 적용 방식을 셋 중에 고릅니다.

| 모드 | 동작 |
|---|---|
| **Extra Filters**(기본) | `extra_filters` 파라미터로 전송, 파이프라인 최상단 적용 — `join`/`union` 서브쿼리엔 **전파 안 됨** |
| **Root Query** | 쿼리 앞에 prepend (예: `level:="error" \| <query>`) |
| **Off** | 자동 주입 비활성화(수동 보간) |

> 💡 multi-value 연산자(`one of`/`not one of`)는 Grafana 11.3 이상에서 지원됩니다.

---

## 🔗 vmui 연동

**데이터소스 설정에 vmui URL을 지정하면, 쿼리 에디터에서 "run in vmui" 버튼**으로 같은 쿼리를 vmui로 바로 띄울 수 있습니다. 지정하지 않으면 데이터소스 url + `/select/vmui`가 사용됩니다. 복잡한 탐색은 vmui로 넘겨서 보면 편합니다.

---

## 🧪 검증 / 트러블슈팅

```bash
# 플러그인 로드 확인 (멀티 컨테이너면 -c grafana 지정)
kubectl -n <ns> logs <grafana-pod> -c grafana | grep -i plugin

# 데이터소스 헬스: Grafana UI에서 Save & Test → 초록불
```

| 증상 | 원인 | 해결 |
|---|---|---|
| `permission denied` / plugin backend | 백엔드 실행 권한 누락 | init container/커스텀 이미지 ([트러블슈팅 글](/observability/victorialogs/grafana-offline-victorialogs-plugin-install/)) |
| 연결 실패 | 데이터소스 url 포트 혼동 | cluster `8427` / single `9428` 확인 |
| 플러그인 안 보임 | 잘못된 컨테이너에 복사 | `-c grafana` 컨테이너 지정 |
| 빈 결과 | 시간 범위·스트림필드·미적재 | 범위 넓히고 실제 적재 여부 vmui로 확인 |

---

## 📐 규모 관점

**규모에 따라 다른 건 데이터소스 URL 하나뿐**입니다. 플러그인·쿼리·패널·Ad Hoc은 모두 동일합니다.

| 구분 | 대규모(클러스터) | 소규모/개인 |
|---|---|---|
| 데이터소스 url | `http://<release>-vmauth.<ns>.svc:8427` | `http://<victorialogs>:9428` |
| 그 외 | 동일 | 동일 |

---

## ❓ 자주 묻는 질문

**Q. 플러그인 이름이 뭔가요?**
`victoriametrics-logs-datasource` 입니다(데이터소스 `type`도 동일).

**Q. 데이터소스 URL은요?**
클러스터는 vmauth `8427`, single-node는 `9428`입니다.

**Q. 폐쇄망에서 permission denied가 납니다.**
백엔드 플러그인 실행 권한 문제입니다. init container 또는 커스텀 이미지로 설치하세요([트러블슈팅 글](/observability/victorialogs/grafana-offline-victorialogs-plugin-install/)).

**Q. 쿼리 언어는 무엇인가요?**
LogsQL입니다. Explore에서 `*`로 시작하세요.

**Q. 대시보드에서 환경별로 필터하려면?**
Ad Hoc 필터(Extra Filters 또는 Root Query)를 쓰세요.

**Q. 빌더로 만든 쿼리를 코드로 볼 수 있나요?**
Builder → Code는 안전하게 직렬화됩니다. 반대(Code → Builder)는 수동 쿼리가 폐기되니 주의하세요.

---

## 🧭 시리즈: OTel + VictoriaLogs 로그 스택

이 시리즈는 같은 백엔드(VictoriaLogs)에 로그를 보내는 두 수집기 트랙과 비교·대시보드로 구성됩니다.

**OTel 트랙**

- **1편** — [OpenTelemetry 개념과 Agent/Gateway 구조](/observability/opentelemetry/collector/otel-collector-agent-gateway-architecture/)
- **2편** — [VictoriaLogs 클러스터 구축](/observability/victorialogs/kubernetes-victorialogs-cluster-helm-install/)
- **3편** — [폐쇄망 OTel Collector Helm 설치](/observability/opentelemetry/collector/kubernetes-otel-collector-offline-helm-install/)
- **4편** — [멀티클러스터 중앙집중](/observability/opentelemetry/otel-multicluster-central-logging/)

**Vector 트랙** (대안 수집기)

- **1편** — [Vector 개념과 파이프라인 구조](/observability/opentelemetry/vector/kubernetes-vector-log-pipeline-concept/)
- **2편** — [Vector 설치: Agent/Aggregator Helm values](/observability/opentelemetry/vector/kubernetes-vector-agent-aggregator-helm-install/)
- **3편** — [VRL로 로그 가공](/observability/opentelemetry/vector/kubernetes-vector-vrl-log-processing/)

**비교**

- **OTel vs Vector** — [어떤 걸 선택할까](/observability/opentelemetry/collector/kubernetes-otel-collector-vs-vector/)

**대시보드 트랙**

- **1편** — [조회 개요: Grafana·vmui·Perses](/observability/victorialogs/victorialogs-log-viewing-grafana-vmui-perses/)
- **2편 (현재)** — Grafana 연결: 플러그인·Explore·대시보드
- **3편** — [vmui로 LogsQL 탐색](/observability/victorialogs/victorialogs-vmui-logsql-live-tail/)
- **4편** — [Perses로 코드형 대시보드](/observability/victorialogs/perses-victorialogs-dashboard-gitops/)

이 편의 한 줄 요약: **"플러그인(`victoriametrics-logs-datasource`) + 데이터소스 URL(cluster `8427` / single `9428`)이면 연결 끝."** 폐쇄망은 init container로 설치하되 백엔드 실행 권한에 주의하고, LogsQL로 Explore → QueryBuilder → 패널 → Ad Hoc 필터 순으로 확장합니다.

---

## 📚 참고

- [VictoriaLogs — Grafana 통합](https://docs.victoriametrics.com/victorialogs/integrations/grafana/)
- [victoriametrics-logs-datasource — Grafana 플러그인](https://grafana.com/grafana/plugins/victoriametrics-logs-datasource/)
- [victorialogs-datasource — GitHub](https://github.com/VictoriaMetrics/victorialogs-datasource)
- [VictoriaLogs — 쿼리(LogsQL)](https://docs.victoriametrics.com/victorialogs/querying/)
- [LogsQL — VictoriaLogs](https://docs.victoriametrics.com/victorialogs/logsql/)
- 관련 글: [VictoriaLogs 로그 조회 개요 (대시보드 트랙 1편)](/observability/victorialogs/victorialogs-log-viewing-grafana-vmui-perses/)
- 관련 글: [폐쇄망 Grafana VictoriaLogs 플러그인 설치·permission denied 해결](/observability/victorialogs/grafana-offline-victorialogs-plugin-install/)
