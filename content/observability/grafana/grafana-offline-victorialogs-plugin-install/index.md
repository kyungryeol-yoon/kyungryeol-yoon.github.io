---
title: "[Grafana] 폐쇄망 K8s에서 VictoriaLogs 플러그인 수동 설치와 permission denied 해결"
date: 2026-06-11
tags: [grafana, victorialogs, victoriametrics, 폐쇄망, plugin, kubernetes, troubleshooting, airgapped]
description: "폐쇄망(에어갭) 쿠버네티스 환경에서 Grafana에 VictoriaLogs 데이터소스 플러그인을 수동 설치하는 방법과, 백엔드 플러그인의 'Could not start plugin backend permission denied' 에러를 권한·커스텀 이미지로 해결하는 실전 가이드입니다."
---

폐쇄망(에어갭) 쿠버네티스 환경에서는 `grafana-cli`로 플러그인을 자동 설치할 수 없어, 파일을 외부에서 반입해 **수동 설치**해야 합니다. 이 글에서는 Grafana에 **VictoriaLogs 데이터소스 플러그인**을 수동으로 넣는 과정과, 그 과정에서 흔히 만나는 **`Could not start plugin backend: permission denied`** 에러의 원인·해결(임시 chmod → 영구 커스텀 이미지)을 실전 기록으로 정리합니다.

## 🔌 폐쇄망에서 Grafana 플러그인 설치가 까다로운 이유

폐쇄망은 외부 인터넷이 차단돼 있어 `grafana-cli plugins install ...` 같은 **온라인 자동 설치가 동작하지 않습니다.** 따라서 플러그인 파일을 인터넷이 되는 곳에서 받아 사내망으로 반입한 뒤 직접 배치해야 합니다.

여기서 핵심은 **플러그인의 종류**입니다.

| 구분 | 프론트엔드 플러그인 | 백엔드 플러그인 |
|---|---|---|
| 구성 | JS/HTML만 | JS + **Go 바이너리** |
| 실행 | 브라우저에서 렌더 | Grafana가 **바이너리를 실행** |
| 함정 | 거의 없음 | **실행 권한(+x) 필요** |

> ⚠️ **VictoriaLogs 데이터소스는 백엔드 플러그인**입니다(`victoriametrics-logs-datasource`). Go 바이너리를 Grafana가 직접 실행하므로 **실행 권한이 없으면 기동에 실패**합니다. 이 점이 뒤에서 다룰 에러의 직접 원인입니다.

---

## 0️⃣ 플러그인 내려받기 (인터넷 되는 곳에서)

폐쇄망 반입 전, 인터넷이 되는 PC에서 플러그인 zip을 받습니다. Grafana 플러그인 API의 `download` 엔드포인트를 쓰면 됩니다.

```bash
# 로그 데이터소스 (이 글의 주제)
curl -L -o victoriametrics-logs-datasource.zip \
  https://grafana.com/api/plugins/victoriametrics-logs-datasource/versions/0.28.0/download

# 메트릭 데이터소스도 동일한 방식
curl -L -o victoriametrics-metrics-datasource.zip \
  https://grafana.com/api/plugins/victoriametrics-metrics-datasource/versions/0.25.0/download

# 압축 해제 → 폴더명이 곧 플러그인 ID
unzip victoriametrics-logs-datasource.zip   # → victoriametrics-logs-datasource/
```

> ⚠️ **레포명 ≠ 플러그인 ID 주의.** GitHub 레포는 `victorialogs-datasource`지만, **실제 설치 플러그인 ID는 `victoriametrics-logs-datasource`** 입니다. 압축을 풀면 폴더명이 `victoriametrics-logs-datasource`이고, 뒤에 나오는 **복사 경로·`type`·미서명 허용 목록 모두 이 ID**를 써야 합니다. (메트릭은 `victoriametrics-metrics-datasource`)

> 💡 버전(`0.28.0` 등)은 예시입니다. 최신 버전은 [플러그인 페이지](https://grafana.com/grafana/plugins/victoriametrics-logs-datasource/)에서 확인하세요.

---

## 1️⃣ Grafana 파드 구조 확인 (멀티 컨테이너)

Helm으로 배포한 Grafana 파드는 보통 **멀티 컨테이너**입니다. 플러그인을 복사할 대상은 **메인 `grafana` 컨테이너**이므로, 먼저 컨테이너 이름을 확인합니다.

```bash
kubectl get pod <grafana-pod> -n <ns> \
  -o jsonpath='{.spec.containers[*].name}'
# 예: grafana-sc-dashboard grafana-sc-datasources grafana
```

- `grafana-sc-dashboard` / `grafana-sc-datasources` — 대시보드·데이터소스를 자동 등록하는 **사이드카**
- `grafana` — **실제 Grafana 앱 컨테이너 (플러그인 배치 대상)**

---

## 2️⃣ 플러그인 수동 복사 (kubectl cp)

외부에서 받은 플러그인 디렉터리를 메인 컨테이너의 플러그인 경로(기본 `/var/lib/grafana/plugins`)로 복사합니다. **`-c grafana`로 컨테이너를 반드시 명시**합니다.

```bash
kubectl cp ./victoriametrics-logs-datasource \
  <ns>/<grafana-pod>:/var/lib/grafana/plugins/victoriametrics-logs-datasource \
  -c grafana
```

복사가 됐는지 컨테이너 안에서 바로 확인합니다.

```bash
kubectl exec -it <grafana-pod> -n <ns> -c grafana -- \
  ls -l /var/lib/grafana/plugins/victoriametrics-logs-datasource
```

> 👀 이때 백엔드 바이너리(예: `gpx_victoriametrics_logs_datasource_linux_amd64`)의 권한에 **실행 비트(`x`)가 빠져 있는 것**이 보일 수 있습니다. 그게 바로 다음 단계에서 만나는 `permission denied`의 원인입니다.

복사 후 파드를 재시작합니다.

```bash
kubectl rollout restart deployment/<grafana> -n <ns>
```

---

## 2️⃣가 끝났는데 왜 안 보일까? — 막힌 지점

재시작했는데도 **Grafana 데이터소스 목록에 VictoriaLogs가 나타나지 않습니다.** 이럴 때는 추측하지 말고 **로그부터** 봅니다.

```bash
kubectl logs <grafana-pod> -n <ns> -c grafana | grep -i plugin
```

로그에 다음과 같은 에러가 보입니다.

```text
Could not start plugin backend ... permission denied
```

### 원인은?

`kubectl cp`로 로컬 → 컨테이너로 파일을 복사하는 과정에서 **리눅스 실행 권한(+x)이 누락**됩니다. 백엔드 플러그인의 Go 바이너리가 실행되지 못해 플러그인 기동에 실패한 것입니다. 즉 **"plugin backend + permission denied" = 실행 권한 문제**로 보면 거의 맞습니다.

---

## 3️⃣ 임시 해결 — chmod로 실행 권한 부여

원인 확인 차원에서 컨테이너 안에서 플러그인 경로에 실행 권한을 줍니다.

```bash
kubectl exec -it <grafana-pod> -n <ns> -c grafana -- \
  chmod -R 755 /var/lib/grafana/plugins/victoriametrics-logs-datasource
```

재시작하면 플러그인이 정상 기동하고 데이터소스 목록에 나타납니다.

> ⚠️ **이건 운영 해법이 아닙니다.** 파드가 재생성(노드 이동·스케일링·업그레이드)되면 **복사한 파일과 권한이 모두 사라져** 매번 반복해야 합니다. 원인 규명·임시 확인용으로만 쓰세요.

---

## 4️⃣ 영구 해결 — 커스텀 이미지로 빌드

플러그인을 **이미지에 포함**시키고 실행 권한까지 부여해 빌드하면, 파드가 몇 번 재생성되어도 항상 플러그인이 존재하고 권한이 유지됩니다. 폐쇄망에서는 보통 사내 레지스트리(예: Harbor)에 푸시해 사용합니다.

```dockerfile
FROM grafana/grafana:11.2.0

USER root

# 폐쇄망에서 미리 받아 반입한 플러그인을 이미지에 포함
ENV GF_PATHS_PLUGINS=/var/lib/grafana/plugins
COPY victoriametrics-logs-datasource ${GF_PATHS_PLUGINS}/victoriametrics-logs-datasource

# 핵심: 백엔드 바이너리에 실행 권한 부여
RUN chmod -R 755 ${GF_PATHS_PLUGINS}/victoriametrics-logs-datasource

# 미서명 플러그인 로딩 허용(서명 안 된 플러그인일 때)
ENV GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=victoriametrics-logs-datasource

USER grafana
```

```bash
# 사내 레지스트리에 푸시
docker build -t harbor.example.com/monitoring/grafana-victorialogs:11.2.0 .
docker push harbor.example.com/monitoring/grafana-victorialogs:11.2.0
```

이후 Helm `values.yaml`에서 이미지를 교체해 배포합니다.

```yaml
image:
  repository: harbor.example.com/monitoring/grafana-victorialogs
  tag: "11.2.0"
```

> 💡 미서명 플러그인은 `grafana.ini`의 `[plugins]` 섹션에 `allow_loading_unsigned_plugins = victoriametrics-logs-datasource`로도 허용할 수 있습니다(위 Dockerfile의 환경변수와 동일 효과).

---

## 🧩 더 깔끔하게: 사이드카로 데이터소스 자동 등록 (선택)

플러그인을 손으로 추가하는 대신, **`grafana-sc-datasources` 사이드카**를 활용하면 라벨이 달린 ConfigMap을 자동으로 데이터소스로 등록해 줍니다(선언적·재현 가능).

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: victorialogs-datasource
  labels:
    grafana_datasource: "1"   # 사이드카가 탐지하는 라벨(차트 sidecar.datasources.label 값)
data:
  victorialogs.yaml: |
    apiVersion: 1
    datasources:
      - name: VictoriaLogs
        type: victoriametrics-logs-datasource
        access: proxy
        url: http://victorialogs:9428
        isDefault: false
```

> 💡 단, 사이드카는 **데이터소스 "등록"** 을 자동화할 뿐, **플러그인 바이너리 자체는 여전히 이미지에 있어야** 합니다(4단계). 둘은 보완 관계입니다.

---

## 📊 메트릭 데이터소스(VictoriaMetrics)도 동일합니다

VictoriaMetrics **메트릭** 데이터소스(`victoriametrics-metrics-datasource`)도 **백엔드 플러그인**이라, 위 로그 데이터소스와 **설치·권한·커스텀 이미지 절차가 100% 동일**합니다. 플러그인은 수집용이 아니라 Grafana에서 메트릭을 **조회·시각화**하는 용도이며(수집은 `vmagent` 등이 담당), 바꿀 값만 아래처럼 치환하면 됩니다.

| 구분 | 로그 (이 글) | 메트릭 |
|---|---|---|
| 플러그인 ID / 폴더명 | `victoriametrics-logs-datasource` | `victoriametrics-metrics-datasource` |
| 다운로드 URL | `.../plugins/victoriametrics-logs-datasource/versions/0.28.0/download` | `.../plugins/victoriametrics-metrics-datasource/versions/0.25.0/download` |
| 미서명 허용 ID | `victoriametrics-logs-datasource` | `victoriametrics-metrics-datasource` |
| 데이터소스 `type` | `victoriametrics-logs-datasource` | `victoriametrics-metrics-datasource` |
| 백엔드 엔드포인트(`url`) | VictoriaLogs `http://victorialogs:9428` | VictoriaMetrics `http://victoriametrics:8428` |

즉 위 **0️⃣~4️⃣ 단계에서 `logs`를 `metrics`로 바꾸기만** 하면 됩니다. 데이터소스 자동 등록(사이드카) ConfigMap만 메트릭용으로 보이면 다음과 같습니다.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: victoriametrics-datasource
  labels:
    grafana_datasource: "1"
data:
  victoriametrics.yaml: |
    apiVersion: 1
    datasources:
      - name: VictoriaMetrics
        type: victoriametrics-metrics-datasource
        access: proxy
        url: http://victoriametrics:8428
        isDefault: true
```

> 💡 메트릭은 VictoriaMetrics가 Prometheus 호환이라 Grafana 기본 **Prometheus 데이터소스로도 조회**할 수 있습니다. 다만 이 전용 플러그인은 **MetricsQL**(PromQL 확장)·자동완성 등 VM 특화 기능을 지원합니다.

---

## 🤔 교훈 요약

- 폐쇄망에서는 자동 설치가 막혀 **수동 복사**가 불가피하고, 그 과정에서 **실행 권한 누락**이 흔한 함정입니다.
- **`plugin backend` + `permission denied`** 에러는 곧 **실행 권한(+x) 문제**일 가능성이 높습니다 → **로그부터 확인**.
- `kubectl cp` + `chmod`는 **원인 규명·임시 확인용**이지 운영 해법이 아닙니다. 영구 해법은 **커스텀 이미지**(또는 차트의 플러그인 주입 메커니즘).
- 멀티 컨테이너 파드에서는 **`-c`로 메인 컨테이너를 정확히 지정**해야 합니다.

---

## ❓ 자주 묻는 질문

**Q. 데이터소스 목록에 플러그인이 안 보이면 가장 먼저 볼 것은?**
`kubectl logs <pod> -c grafana | grep -i plugin`. `permission denied`가 보이면 실행 권한 문제입니다.

**Q. chmod로 고쳤는데 며칠 뒤 또 사라졌어요.**
파드가 재생성되면서 `kubectl cp`로 넣은 파일이 사라진 것입니다. **커스텀 이미지**로 전환하세요.

**Q. 서명되지 않은 플러그인이라 로드가 거부됩니다.**
`allow_loading_unsigned_plugins`(또는 `GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS`)에 플러그인 ID(`victoriametrics-logs-datasource`)를 추가하세요.

**Q. 프론트엔드 플러그인도 권한 문제가 생기나요?**
대부분 없습니다. 실행 권한 문제는 **백엔드 바이너리를 가진 플러그인**(데이터소스 등)에서 발생합니다.

---

## 📚 참고

- [Install a plugin — Grafana documentation](https://grafana.com/docs/grafana/latest/administration/plugin-management/plugin-install/)
- [Configure a Grafana Docker image — Grafana documentation](https://grafana.com/docs/grafana/latest/setup-grafana/configure-docker/)
- [How to install grafana plugin in airgap container environment — Grafana Community](https://community.grafana.com/t/how-to-install-grafana-plugin-in-airgap-container-environment/73513)
- [“Could not start plugin backend” from multiple plugins — Grafana Community](https://community.grafana.com/t/could-not-start-plugin-backend-from-multiple-plugins/126630)
- [VictoriaMetrics/victorialogs-datasource — GitHub](https://github.com/VictoriaMetrics/victorialogs-datasource)
- [Grafana Integration — VictoriaMetrics Helm Charts](https://deepwiki.com/VictoriaMetrics/helm-charts/5.2-grafana-integration)
