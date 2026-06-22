---
title: "vmui로 VictoriaLogs 로그 보기: Grafana 없이 내장 웹 UI로 LogsQL 탐색하기"
date: 2026-06-22
tags: ["victorialogs", "vmui", "logsql", "kubernetes", "observability", "logging"]
description: "VictoriaLogs 내장 웹 UI인 vmui로 별도 설치 없이 로그를 조회하는 방법을 다룹니다. 접속 경로, LogsQL 탐색, 라이브 테일링, JSON 원본 보기, 적재 직후 검증 활용법을 정리합니다."
series: "OTel + VictoriaLogs 로그 스택"
series_order: 11
---

vmui는 **VictoriaLogs에 내장된 웹 UI**로, 별도 설치나 데이터소스 연결 없이 **LogsQL로 로그를 조회**합니다. single-node는 `9428/select/vmui`, 클러스터는 vmauth `8427/select/vmui/`로 접속하며, 포트포워딩으로 바로 열 수 있습니다. **라이브 테일링과 JSON 원본 보기**를 지원해 적재 직후 검증과 빠른 디버깅에 특히 유용합니다. 이 글은 **"OTel + VictoriaLogs 로그 스택" 시리즈의 대시보드 트랙 3편(vmui)** 으로, [1편(조회 개요)](/observability/opentelemetry/victorialogs-log-viewing-grafana-vmui-perses/)에서 소개한 "내장 UI 방식"을 실제로 써봅니다.

## 🖥️ vmui란 무엇인가

**vmui는 VictoriaLogs 실행 파일에 임베드된 웹 UI**입니다(소스는 저장소의 `app/vmui`). 별도 설치도, 데이터소스 연결도 필요 없습니다 — **저장소가 곧 UI**입니다.

- **설치 0** — VictoriaLogs를 띄우면 vmui도 같이 떠 있습니다.
- **LogsQL 조회** — Grafana와 동일한 쿼리 언어로 탐색합니다.
- **빠른 확인용** — Grafana 도입 전이나, 플러그인 권한 이슈 없이 **가장 빠르게** 로그를 보고 싶을 때 적합합니다.

---

## 🔗 어떻게 접속하나

**접속 경로는 모드에 따라 포트만 다릅니다.**

| 모드 | 경로 |
|---|---|
| single-node | `http://<victorialogs>:9428/select/vmui` |
| cluster | `http://<release>-vmauth.<ns>.svc:8427/select/vmui/` (vmauth 경유) |

쿠버네티스 내부라면 포트포워딩으로 바로 엽니다.

```bash
# cluster (vmauth 경유)
kubectl -n <ns> port-forward svc/<release>-vmauth 8427
# 브라우저: http://localhost:8427/select/vmui/

# single-node
kubectl -n <ns> port-forward svc/<vl-svc> 9428
# 브라우저: http://localhost:9428/select/vmui
```

---

## 🔍 LogsQL로 조회하기

**`*`로 전체를 띄운 뒤 조건을 좁혀가는 것**이 기본 흐름입니다.

```logsql
*                              # 전체
error                          # _msg에 error 포함
level:error                    # level 필드가 error
k8s.namespace.name:prod        # 특정 네임스페이스
env:prod AND level:error       # 조합
error | limit 10               # 최근 10건
```

> 💡 `*` 전체 조회도 안전합니다. **클라이언트가 연결을 닫으면 쿼리가 즉시 취소**되고 자원이 해제되므로, 매칭이 수십억 건이어도 부담이 적습니다. 그래도 시간 범위로 좁히면 더 빠릅니다.

---

## 👁️ 결과 보기: 테이블 / JSON / Live

**vmui는 같은 쿼리 결과를 세 가지 방식으로 보여줍니다.**

- **테이블·로그 뷰** — 사람이 읽기 좋은 형태.
- **JSON** — `/select/logsql/query`의 원본 응답으로, **필드 구조**를 그대로 확인할 때.
- **Live** — 라이브 테일링(실시간 스트림).

---

## 📡 라이브 테일링 활용

**Live 모드는 `/select/logsql/tail`로 실시간 로그를 흘려보며 추적**합니다. 배포·장애 순간을 실시간 관찰할 때 유용합니다.

- **과거 로그 포함** — `start_offset`으로 시작 전 로그도 함께 봅니다(예: `start_offset=1h` → 최근 1시간).
- **기본 5초 지연** — 신규 로그는 수집기 → VictoriaLogs 전달을 보장하기 위해 기본 5초 버퍼를 둡니다. 갭이 보이면 `offset` 값을 늘리세요(새 로그는 1초마다 확인, `refresh_interval`로 조정).

---

## ✅ 적재 직후 검증에 딱 좋다

**vmui의 진가는 "되는지부터 확인"입니다.** 수집기(OTel·Vector)를 붙인 직후 vmui에서 로그가 바로 뜨는지 보면 파이프라인 정상 여부를 즉시 판단할 수 있습니다.

- Grafana 설치·플러그인 권한 이슈 없이 **가장 빠른 확인 경로**.
- 특정 파드·네임스페이스 로그 즉시 조회, 라이브 테일로 실시간 추적.

> 💡 **운영 대시보드는 Grafana, 빠른 확인·디버깅은 vmui** — 둘을 함께 쓰는 것이 실용적입니다.

---

## 📐 규모 관점

규모에 따라 다른 건 **접속 포트뿐**이고, 사용법은 동일합니다.

| 구분 | 대규모(클러스터) | 소규모/개인 |
|---|---|---|
| 접속 | vmauth `:8427/select/vmui/` | victoria-logs `:9428/select/vmui` |
| 사용법 | 동일 | 동일 |

---

## ❓ 자주 묻는 질문

**Q. vmui는 따로 설치하나요?**
아닙니다. VictoriaLogs에 내장되어 있습니다.

**Q. 접속 주소가 뭔가요?**
single-node는 `9428/select/vmui`, 클러스터는 vmauth `8427/select/vmui/`입니다.

**Q. Grafana 없이도 되나요?**
됩니다. vmui만으로 LogsQL 조회가 가능합니다.

**Q. 실시간 로그는 어떻게 보나요?**
Live 모드(라이브 테일링)를 쓰세요. 신규 로그는 전달 보장을 위해 기본 5초 지연됩니다.

**Q. `*` 전체 조회가 위험하지 않나요?**
연결을 닫으면 즉시 취소·자원 해제되어 안전합니다.

**Q. 언제 vmui, 언제 Grafana인가요?**
빠른 확인·디버깅은 vmui, 상시 대시보드·알림은 Grafana입니다.

---

## 🧭 시리즈: OTel + VictoriaLogs 로그 스택

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
- **3편 (현재)** — vmui로 LogsQL 탐색
- **4편** — [Perses로 코드형 대시보드](/observability/opentelemetry/perses-victorialogs-dashboard-gitops/)

이 편의 한 줄 요약: **"vmui는 설치·연결 없는 VictoriaLogs 내장 UI다."** `/select/vmui`로 접속해 LogsQL로 조회하고, 라이브 테일·JSON 원본으로 적재 검증과 디버깅을 빠르게 합니다. 상시 운영은 Grafana, 빠른 확인은 vmui로 병행하세요.

---

## 📚 참고

- [VictoriaLogs — 쿼리(querying)](https://docs.victoriametrics.com/victorialogs/querying/)
- [LogsQL — VictoriaLogs](https://docs.victoriametrics.com/victorialogs/logsql/)
- [VictoriaLogs 공식 문서](https://docs.victoriametrics.com/victorialogs/)
- [VictoriaLogs cluster Helm chart](https://docs.victoriametrics.com/helm/victoria-logs-cluster/)
- 관련 글: [VictoriaLogs 로그 조회 개요 (대시보드 트랙 1편)](/observability/opentelemetry/victorialogs-log-viewing-grafana-vmui-perses/)
- 관련 글: [Grafana에 VictoriaLogs 연결하기 (대시보드 트랙 2편)](/observability/opentelemetry/grafana-victorialogs-datasource-explore-dashboard/)
