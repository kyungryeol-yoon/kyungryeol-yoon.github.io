---
title: "Perses로 VictoriaLogs 대시보드 만들기: 코드로 관리하는 GitOps 대시보드"
date: 2026-06-23T00:00:00+09:00
tags: ["perses", "victorialogs", "logsql", "kubernetes", "observability", "dashboard", "gitops"]
description: "CNCF 진영의 오픈소스 대시보드 Perses로 VictoriaLogs 로그를 시각화하는 방법을 다룹니다. 데이터소스 연결, Logs Table·통계 패널, LogsQL 변수, 대시보드를 코드로 관리하는 GitOps 방식과 Grafana와의 차이를 정리합니다."
series: "OTel + VictoriaLogs 로그 스택"
series_order: 12
---

Perses는 **CNCF 진영의 오픈소스 대시보드**로, 가장 큰 강점은 **대시보드를 코드로 관리하는 GitOps 친화성**입니다. VictoriaLogs를 데이터소스로 연결해 **Logs Table·통계 패널**을 만들고, **LogsQL과 변수**로 인터랙티브한 대시보드를 구성합니다. Grafana의 대안이지만 성숙도는 아직 발전 중이라, **코드형 대시보드·버전 관리가 중요한 팀**에 특히 어울립니다. 이 글은 **"OTel + VictoriaLogs 로그 스택" 시리즈의 대시보드 트랙 4편(Perses)이자 시리즈 마지막 편**으로, [1편(조회 개요)](/observability/opentelemetry/victorialogs-log-viewing-grafana-vmui-perses/)에서 소개한 Perses를 실제로 써보고 시리즈를 마무리합니다.

## 🆕 Perses란 무엇인가

**Perses는 관측 데이터 시각화를 위한 CNCF 진영의 오픈소스 대시보드 도구**입니다. Grafana와 같은 "데이터소스 방식"(외부 도구가 VictoriaLogs를 연결해 LogsQL로 조회)에 속하지만, 결정적 차이가 하나 있습니다.

- **대시보드를 코드(선언형)로 관리** — 가장 큰 강점입니다. 대시보드 정의를 Git에 저장하고 PR 리뷰·자동 배포할 수 있습니다(GitOps 친화).
- **Grafana 대안** — VictoriaLogs를 데이터소스로 연결해 LogsQL로 조회합니다(v0.53.0-beta.2+에서 VictoriaLogs 지원).
- **성숙도는 발전 중** — 플러그인·생태계는 아직 Grafana만큼은 아닙니다. 과장 없이 "코드화·경량 강점, 성숙도는 성장 중"으로 보면 됩니다.

---

## 🔗 VictoriaLogs 데이터소스 연결

**먼저 프로젝트에 VictoriaLogs Datasource를 만듭니다.** 프로젝트의 datasources 화면에서 드롭다운에서 **"VictoriaLogs Datasource"** 를 선택하고, 접근 방식(proxy/direct)과 URL을 지정합니다.

| 모드 | 데이터소스 URL |
|---|---|
| single-node | `http://<victorialogs>:9428` |
| cluster | `http://<release>-vmauth.<ns>.svc:8427` (vmauth 경유) |

> 💡 이 단계가 1편에서 말한 "데이터소스 방식"에 해당합니다 — Grafana와 같은 부류이고, 연결 지점(URL)도 동일합니다.

---

## 📋 로그 테이블 패널 만들기

**로그를 표로 보려면 Logs Table 패널을 씁니다.** 대시보드 편집(`projects/<project>/dashboards/<dashboard>` → Edit) → Panel 추가 후:

- **Panel Type**: `Logs Table`
- **Query Type**: `VictoriaLogs Log Query`
- **Datasource**: 위에서 만든 VictoriaLogs Datasource
- **Query**: LogsQL 입력

```logsql
k8s.namespace.name:prod AND level:error
```

---

## 📈 통계/그래프 패널

**시계열 그래프는 Time Series Chart 패널 + LogsQL stats 쿼리**로 만듭니다.

- **Panel Type**: `Time Series Chart`
- **Query Type**: `VictoriaLogs Time Series Query`
- **Query**: LogsQL `stats` 파이프

```logsql
* | stats by (k8s.namespace.name) count()
```

예를 들어 위 쿼리는 네임스페이스별 로그 건수를 그래프로 그립니다. 로그 데이터에서 메트릭을 뽑아 시각화하는 셈입니다.

---

## 🎚️ 변수로 인터랙티브하게

**변수를 쓰면 대시보드 상단에서 값을 골라 패널을 동적으로 필터**할 수 있습니다. `List` 타입 변수를 **"VictoriaLogs Field Values Variable"** 소스로 만들고, **LogsQL 쿼리 + Field Name**으로 값을 추출합니다.

패널 쿼리에서는 다음 형식으로 참조합니다.

| 형식 | 용도 |
|---|---|
| `${var-name}` | 기본 치환 |
| `${var:pipe}` | 정규식 필터(`|` 구분) |
| `${var:csv}` | 콤마 구분 값 |

```logsql
k8s.namespace.name:${namespace} AND level:error
```

예: 네임스페이스 목록을 변수 `namespace`로 만들어두면, 드롭다운에서 고른 값이 모든 패널에 적용됩니다.

---

## 🗂️ GitOps: 대시보드를 코드로

**Perses의 진짜 차별점은 여기입니다.** 대시보드 정의를 **선언형 코드**로 두므로:

- **Git에 저장 → PR 리뷰 → 자동 배포** — 대시보드도 애플리케이션처럼 버전 관리합니다.
- **환경 간 일관성·재현성** — dev/stg/prod 대시보드를 같은 코드에서 찍어내 표류(drift)를 막습니다.
- **수동 클릭 대신 코드** — 누가 언제 무엇을 바꿨는지 이력이 남습니다.

> 💡 ArgoCD·Flux 같은 GitOps 파이프라인으로 **대시보드까지 코드로 배포**하려는 팀에 특히 잘 맞습니다. "대시보드를 손으로 만들고 잊어버리는" 문제를 구조적으로 없앱니다.

---

## ⚖️ Grafana와 무엇이 다른가

**둘 다 데이터소스 방식으로 LogsQL을 써 VictoriaLogs를 조회**합니다. 차이는 "관리 철학"입니다.

| 항목 | Grafana | Perses |
|---|---|---|
| 대시보드 관리 | UI 중심(+프로비저닝) | **코드/선언형** |
| 성숙도·생태계 | 풍부 | 발전 중 |
| GitOps | 가능(부가 기능) | **핵심 지향** |
| 무게감 | 무겁고 기능 많음 | 가벼움 |

- **Grafana** — 성숙한 생태계·풍부한 플러그인·통합 대시보드가 강점.
- **Perses** — 대시보드 코드화·GitOps·경량이 강점.

> 언제 Perses? **대시보드 버전 관리·코드화가 우선**이고 경량·표준을 지향할 때입니다. (Grafana를 "완전히 대체"한다기보다 **성향이 다른 선택지**로 보는 게 정확합니다.)

---

## 🧪 검증 / 참고

- **LogsQL은 전 도구 공통**이라 vmui·Grafana에서 쓰던 쿼리를 Perses 패널에 그대로 재사용하면 됩니다.
- 데이터소스 URL(single `9428` / cluster vmauth `8427`)만 환경에 맞게 정확히 지정하면 연결은 끝납니다.
- 쿼리·stats 표현은 VictoriaLogs playground에서 미리 실험해볼 수 있습니다.

---

## ❓ 자주 묻는 질문

**Q. Perses는 Grafana를 대체하나요?**
대안입니다. LogsQL로 같은 VictoriaLogs를 조회하지만, 성숙도 차이가 있어 "대체"보다 "성향이 다른 선택지"로 보는 게 맞습니다.

**Q. Perses의 가장 큰 강점은?**
대시보드를 **코드로 관리(GitOps)** 하는 것입니다. 버전 관리·리뷰·자동 배포가 가능합니다.

**Q. 연결 URL은 무엇인가요?**
cluster는 vmauth `8427`, single-node는 `9428`입니다(Grafana·vmui와 동일).

**Q. 쿼리 언어는?**
LogsQL입니다. 다른 도구와 동일하게 재사용됩니다.

**Q. 변수를 쓰려면?**
`VictoriaLogs Field Values Variable`로 List 변수를 만들고 패널에서 `${var-name}`으로 참조합니다.

---

## 🏁 시리즈를 마치며

**여기까지가 "OTel + VictoriaLogs 로그 스택" 시리즈의 마지막입니다.** 전체 경로를 한 번 되짚으면:

1. **백엔드** — VictoriaLogs 클러스터로 로그 저장소를 세우고,
2. **수집** — OTel Collector 또는 Vector로 K8s 로그를 모아 보내고,
3. **비교** — 두 수집기 중 상황에 맞는 것을 고르고,
4. **조회** — Grafana·vmui·Perses 중 용도에 맞는 도구로 본다.

핵심 교훈 3줄:

- **수집은 표준으로** — OTLP 등 표준을 쓰면 백엔드 교체·확장이 자유롭습니다.
- **저장은 단순·확장 가능하게** — VictoriaLogs는 가볍게 시작해 클러스터로 키울 수 있습니다.
- **조회는 상황에 맞게** — 빠른 디버깅은 vmui, 상시 대시보드는 Grafana, 코드형은 Perses. 셋은 병행 가능합니다.

---

## 🧭 시리즈: OTel + VictoriaLogs 로그 스택 *(완결)*

이 시리즈는 같은 백엔드(VictoriaLogs)에 로그를 보내는 두 수집기 트랙과 비교·대시보드로 구성됩니다.

**OTel 트랙**

- **1편** — [OpenTelemetry 개념과 Agent/Gateway 구조](/observability/opentelemetry/otel-collector-agent-gateway-architecture/)
- **2편** — [VictoriaLogs 클러스터 구축](/observability/opentelemetry/kubernetes-victorialogs-cluster-helm-install/)
- **3편** — [폐쇄망 OTel Collector Helm 설치](/observability/opentelemetry/kubernetes-otel-collector-offline-helm-install/)
- **4편** — [멀티클러스터 중앙집중](/observability/opentelemetry/otel-multicluster-central-logging/)

**Vector 트랙** (대안 수집기)

- **1편** — [Vector 개념과 파이프라인 구조](/observability/opentelemetry/kubernetes-vector-log-pipeline-concept/)
- **2편** — [Vector 설치: Agent/Aggregator Helm values](/observability/opentelemetry/kubernetes-vector-agent-aggregator-helm-install/)
- **3편** — [VRL로 로그 가공](/observability/opentelemetry/kubernetes-vector-vrl-log-processing/)

**비교**

- **OTel vs Vector** — [어떤 걸 선택할까](/observability/opentelemetry/kubernetes-otel-collector-vs-vector/)

**대시보드 트랙**

- **1편** — [조회 개요: Grafana·vmui·Perses](/observability/opentelemetry/victorialogs-log-viewing-grafana-vmui-perses/)
- **2편** — [Grafana 연결: 플러그인·Explore·대시보드](/observability/opentelemetry/grafana-victorialogs-datasource-explore-dashboard/)
- **3편** — [vmui로 LogsQL 탐색](/observability/opentelemetry/victorialogs-vmui-logsql-live-tail/)
- **4편 (현재)** — Perses로 코드형 대시보드

이 편의 한 줄 요약: **"Perses는 대시보드를 코드로 관리하는 GitOps 친화 대시보드다."** VictoriaLogs를 데이터소스로 연결해 Logs Table·Time Series 패널과 변수로 구성하며, 코드화·버전 관리가 중요한 팀에 어울립니다.

---

## 📚 참고

- [VictoriaLogs — Perses 통합](https://docs.victoriametrics.com/victorialogs/integrations/perses/)
- [Perses 공식 사이트](https://perses.dev/)
- [LogsQL — VictoriaLogs](https://docs.victoriametrics.com/victorialogs/logsql/)
- [VictoriaLogs — 쿼리(querying)](https://docs.victoriametrics.com/victorialogs/querying/)
- 관련 글: [VictoriaLogs 로그 조회 개요 (대시보드 트랙 1편)](/observability/opentelemetry/victorialogs-log-viewing-grafana-vmui-perses/)
- 관련 글: [Grafana에 VictoriaLogs 연결하기 (대시보드 트랙 2편)](/observability/opentelemetry/grafana-victorialogs-datasource-explore-dashboard/)
