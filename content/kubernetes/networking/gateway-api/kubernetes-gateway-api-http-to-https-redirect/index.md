---
title: "[Kubernetes] 🔒 Gateway API로 HTTP→HTTPS 리다이렉트 (HTTPRoute RequestRedirect)"
date: 2026-06-10
tags: [gateway-api, httproute, requestredirect, https-redirect, ssl-redirect, allowedroutes, kubernetes, network, tls]
description: "Gateway API의 표준 필터 RequestRedirect로 HTTP를 HTTPS로 리다이렉트하는 방법을 정리합니다. 리스너 2개+라우트 2개 기본형부터 allowedRoutes로 평문 노출을 원천 차단하는 실무 패턴까지 다룹니다."
---

Gateway API에서 HTTP→HTTPS 리다이렉트는 Ingress의 annotation(`ssl-redirect`)이 아니라 **표준 필터** `RequestRedirect`로 합니다. 이 글에서는 **HTTP(80)·HTTPS(443) 리스너 2개 + HTTPRoute 2개**로 구성하는 기본형과, 앱 팀이 `sectionName`을 빠뜨려도 평문 노출이 안 되도록 **`allowedRoutes`로 80 리스너를 잠그는** 실무 패턴, 그리고 "구성했는데 http가 계속 되는" 트러블슈팅을 정리합니다.

> **이 시리즈는** 쿠버네티스 gRPC 삽질에서 출발해 HTTP/2·TLS·로드밸런서·Gateway API·인증서까지 풀어가는 기록입니다. 앞선 [Ingress → Gateway API 편](/kubernetes/networking/gateway-api/kubernetes-ingress-to-gateway-api-httproute/)과 [cert-manager TLS 편](/kubernetes/networking/gateway-api/kubernetes-cert-manager-pki-tls/)을 먼저 보면 이해가 빠릅니다.

---

## 🎯 핵심: RequestRedirect 필터

**`RequestRedirect`는 클라이언트에 3XX 응답을 돌려줘 다른 위치로 다시 요청하게 하는 Gateway API 표준 필터입니다.** HTTPRoute의 `rules[].filters`에 `type: RequestRedirect`를 선언하고, HTTP→HTTPS 업그레이드는 `scheme: https` + `statusCode: 301`이 정석입니다.

```yaml
rules:
- filters:
  - type: RequestRedirect
    requestRedirect:
      scheme: https
      statusCode: 301
```

리다이렉트는 **지정한 URL 요소만 바꾸고 나머지는 보존**합니다. 예를 들어 `GET http://redirect.example/cinnamon` 요청은 다음과 같이 응답됩니다.

```http
HTTP/1.1 301 Moved Permanently
location: https://redirect.example/cinnamon
```

scheme만 `https`로 바뀌고 host(`redirect.example`)·path(`/cinnamon`)는 그대로 유지됩니다.

> ⚠️ `RequestRedirect`와 `URLRewrite`는 **한 rule 안에서 동시에 쓸 수 없습니다.** RequestRedirect는 클라이언트에게 3XX로 "다시 요청해라"를 돌려주는 것이고, URLRewrite는 백엔드로 보내기 전에 요청을 조용히 바꾸는 것이라 성격이 다릅니다.

### 지원하는 상태 코드는?

| 코드 | 의미 | 메모 |
|---|---|---|
| 301 | 영구 이동 (Moved Permanently) | **HTTP→HTTPS 업그레이드 권장** |
| 302 | 임시 (Found) | `statusCode` 생략 시 기본값 |
| 303 | See Other | POST→GET 패턴 |
| 307 | 임시 + **메서드 보존** | Extended 지원 |
| 308 | 영구 + **메서드 보존** | Extended 지원 |

> 💡 307/308과 path 단위 redirect는 "Extended" 지원이라 구현체(Contour·Istio·Envoy Gateway 등)별로 지원 여부가 다릅니다. 사용 전 [conformance 문서](https://gateway-api.sigs.k8s.io/concepts/conformance/)로 확인하세요.

---

## 🧱 기본 구성: 리스너 2개 + 라우트 2개

**HTTP→HTTPS 리다이렉트의 기본형은 Gateway에 80·443 리스너를 모두 두고, HTTPRoute를 2개(80=리다이렉트, 443=백엔드 전달) 만드는 것입니다.**

### 1️⃣ Gateway — HTTP·HTTPS 리스너 둘 다

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: redirect-gateway
  namespace: gateway-system        # 플랫폼팀 소유
spec:
  gatewayClassName: foo-lb
  listeners:
  - name: http
    protocol: HTTP
    port: 80
  - name: https
    protocol: HTTPS
    port: 443
    tls:
      mode: Terminate
      certificateRefs:
      - name: redirect-example      # TLS Secret (cert-manager가 발급)
```

### 2️⃣ HTTPRoute ① — 80 리스너에 붙여 리다이렉트

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: http-filter-redirect
  namespace: gateway-system        # 80 리스너에 붙이려면 Gateway와 같은 네임스페이스
spec:
  parentRefs:
  - name: redirect-gateway
    sectionName: http              # http(80) 리스너만 선택
  hostnames:
  - redirect.example
  rules:
  - filters:
    - type: RequestRedirect
      requestRedirect:
        scheme: https
        statusCode: 301
```

### 3️⃣ HTTPRoute ② — 443 리스너에 붙여 백엔드로 전달

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: https-route
  namespace: team-a                # 앱 팀 네임스페이스
  labels:
    gateway-access: "true"         # 443 리스너 allowedRoutes selector와 매칭 (아래 참고)
spec:
  parentRefs:
  - name: redirect-gateway
    namespace: gateway-system      # Gateway가 다른 네임스페이스라 명시
    sectionName: https
  hostnames:
  - redirect.example
  rules:
  - backendRefs:
    - name: example-svc            # team-a 안의 Service
      port: 80
```

> 💡 **네임스페이스 배치 메모**
> - **Gateway + 리다이렉트 라우트** → `gateway-system`(플랫폼). 80 리스너가 기본 `from: Same`이라 리다이렉트 라우트도 같은 ns에 둬야 붙습니다.
> - **백엔드 라우트** → `team-a`(앱 팀). Gateway가 다른 ns라 `parentRefs.namespace`를 명시하고, 443 리스너의 `allowedRoutes`가 이 ns를 허용해야 합니다.
> - **`backendRefs`가 다른 ns의 Service**를 가리키면 그쪽에 **ReferenceGrant**가 필요합니다. 같은 ns면 불필요.
> - 모두 한 네임스페이스에 둘 거면 namespace 표기는 생략해도 됩니다(공식 가이드 예시 형태).

---

## ❓ 왜 라우트가 꼭 2개여야 하나?

**한 HTTPRoute의 `rules`는 그 라우트가 붙은 모든 리스너에 똑같이 적용되기 때문입니다.** 그래서 "80=리다이렉트 / 443=백엔드 전달"을 한 라우트 안에서 나눌 수 없습니다. 역할별로 라우트를 분리해야 합니다.

### 리다이렉트 라우트는 게이트웨이당 1개로 충분합니다

리다이렉트 라우트에서 `hostnames`를 생략하면 그 80 리스너로 들어오는 **모든 호스트**에 적용됩니다. 따라서 앱이 여러 개여도 리다이렉트 라우트는 하나면 되고, 나머지는 각 앱의 443 백엔드 라우트만 추가하면 됩니다(어차피 만들 것).

### `sectionName: https`만 박으면 404, 리다이렉트가 아닙니다

앱 라우트를 443에만 고정하면 80으로 온 요청은 **매칭되는 라우트가 없어 404**가 납니다(리다이렉트 ❌). 브라우저로 테스트했을 때 https로 넘어갔다면 그건 브라우저의 https-first 동작일 뿐, 게이트웨이가 리다이렉트한 게 아닙니다. curl·모바일 앱 등 http 클라이언트를 부드럽게 https로 보내려면 **리다이렉트 라우트는 여전히 필요**합니다.

---

## 🛡️ allowedRoutes로 평문 노출 원천 차단

**앱 팀이 `sectionName`을 빠뜨리면 그 라우트가 80 리스너에도 바인딩돼 평문(HTTP)으로 서빙될 수 있습니다.** 개별 라우트의 "예의"에 기대지 말고, 80 리스너를 플랫폼 전용으로 잠가서 막는 것이 안전합니다.

`sectionName`이 없으면 라우트는 호환되는 **모든 리스너(80 포함)에 바인딩**됩니다. 그러면 80에서 백엔드 라우트가 리다이렉트 라우트보다 더 구체적으로 매칭되어 평문 서빙이 일어날 수 있습니다. `allowedRoutes`로 다음처럼 잠급니다.

```yaml
spec:
  listeners:
  - name: http
    port: 80
    protocol: HTTP
    allowedRoutes:
      namespaces:
        from: Same          # 게이트웨이 네임스페이스(=플랫폼 리다이렉트 라우트)만 허용
  - name: https
    port: 443
    protocol: HTTPS
    tls:
      mode: Terminate
      certificateRefs:
      - name: redirect-example
    allowedRoutes:
      namespaces:
        from: Selector      # 앱 팀 라우트는 여기에만
        selector:
          matchLabels:
            gateway-access: "true"
```

이렇게 하면 앱 팀이 `sectionName`을 빠뜨려도 그 라우트는 **80에서는 거부**되고 443에만 붙습니다. 80은 플랫폼 리다이렉트 라우트가 독점하므로 **평문 노출이 원천 차단**됩니다.

---

## 🔧 트러블슈팅: 구성했는데 http가 계속 될 때

순서대로 확인합니다.

**1️⃣ 리다이렉트 라우트가 80에 진짜 붙었나?**

```bash
kubectl describe httproute http-filter-redirect -n gateway-system
```

`status.parents[].conditions`에서 `Accepted: True`인지 확인합니다. 안 붙는 흔한 원인:

- `allowedRoutes` 네임스페이스 불일치(기본값이 `Same`)
- `sectionName` 오타 (`http`인데 `https`로 쓰는 등)
- `parentRefs.namespace` 오류
- `hostnames` 불일치

**2️⃣ 80에 백엔드 라우트가 끼어들었나?**

앱 라우트가 `sectionName` 없이 80에도 붙으면 매칭 우선순위에서 백엔드가 이겨 평문으로 서빙됩니다. → 앱 라우트에 `sectionName: https`를 명시하거나, 위 `allowedRoutes` 잠금을 적용합니다.

**3️⃣ 요청이 이 Gateway를 거치긴 하나?**

예전 ingress-nginx가 아직 80을 서비스하고 있거나, NodePort·LB로 백엔드에 직접 접근하거나, `port-forward`로 테스트하는 경우 Gateway가 트래픽 경로에 없어 리다이렉트가 적용될 리 없습니다.

리다이렉트 동작 확인은 curl로 합니다.

```bash
curl -I http://redirect.example/cinnamon
# HTTP/1.1 301 Moved Permanently
# location: https://redirect.example/cinnamon
```

---

## ❓ 자주 묻는 질문

### Q. Ingress의 `ssl-redirect` annotation과 무엇이 다른가요?

Ingress는 컨트롤러마다 `nginx.ingress.kubernetes.io/ssl-redirect: "true"` 같은 **벤더 전용 annotation**으로 리다이렉트했습니다. Gateway API는 이를 표준 필터 `RequestRedirect`로 정의해 **구현체에 상관없이 동일한 스펙**으로 동작하게 합니다.

### Q. 301과 302 중 무엇을 써야 하나요?

HTTP→HTTPS 영구 전환에는 **301**(영구 이동)을 권장합니다. 브라우저·검색엔진이 결과를 캐시해 다음부터 바로 https로 요청하기 때문입니다. `statusCode`를 생략하면 기본값은 302(임시)입니다.

### Q. 리다이렉트 라우트를 빼고 443 라우트만 두면 안 되나요?

브라우저는 https-first 동작 때문에 잘 넘어가는 것처럼 보이지만, 80으로 직접 온 요청(curl·구형 클라이언트·외부 연동)은 **404**가 납니다. 부드러운 리다이렉트를 보장하려면 80 리스너에 붙는 리다이렉트 라우트가 반드시 필요합니다.

### Q. POST 요청도 리다이렉트되나요?

301/302는 리다이렉트 시 메서드가 GET으로 바뀔 수 있습니다. POST 등 메서드를 보존해야 하면 **307/308**을 사용해야 하지만, 이는 Extended 지원이라 구현체 지원 여부를 먼저 확인하세요.

---

## 📚 참고

- [HTTP redirects and rewrites (Gateway API 공식 가이드)](https://gateway-api.sigs.k8s.io/guides/user-guides/http-redirect-rewrite/)
- [HTTPRoute API 레퍼런스](https://gateway-api.sigs.k8s.io/reference/api-types/httproute/)
- [HTTPRequestRedirectFilter 스펙](https://gateway-api.sigs.k8s.io/reference/api-spec/main/spec/#httprequestredirectfilter)
- [Cross-Namespace routing (allowedRoutes)](https://gateway-api.sigs.k8s.io/guides/user-guides/multiple-ns/)
- [TLS 설정 가이드](https://gateway-api.sigs.k8s.io/guides/user-guides/tls/)
- [Conformance(지원 레벨) 개념](https://gateway-api.sigs.k8s.io/concepts/conformance/)
</content>
</invoke>
