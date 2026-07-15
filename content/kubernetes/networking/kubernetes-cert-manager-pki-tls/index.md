---
title: "[Kubernetes] 🔏 인증서와 cert-manager: 두 갈래 PKI와 TLS 자동화"
date: 2026-06-05
tags: [cert-manager, tls, pki, certificate, kubeadm, gateway-api, letsencrypt, kubernetes, network]
description: "key·cert·CA·TLS 용어를 신분증 비유로 정리하고, 쿠버네티스의 두 갈래 PKI(클러스터 내부 vs 앱/인그레스)와 cert-manager의 인증서 발급·갱신 자동화를 다룹니다."
---

쿠버네티스를 다루다 보면 kubeadm로 클러스터를 세울 때도 인증서가 나오고, Ingress·Gateway에도 인증서가 나옵니다. 같은 걸까요? 이 글에서는 `key`·`cert`·`CA`·`TLS` 용어를 신분증 비유로 정리하고, 쿠버네티스에 **PKI가 두 갈래**(클러스터 내부 mTLS vs 앱/인그레스 TLS)로 별개라는 점, 그리고 cert-manager가 "받은 인증서를 넣는" 게 아니라 **발급·갱신 행위를 자동화**한다는 핵심을 다룹니다.

> **이 시리즈는** 쿠버네티스 gRPC 삽질에서 출발해 HTTP/2·TLS·로드밸런서·Gateway API·인증서까지 풀어가는 기록입니다. 이번 6편은 **인증서와 cert-manager** 편입니다. 앞선 [2편(h2 vs h2c)](/kubernetes/networking/kubernetes-grpc-http2-vs-h2c-tls/), [5편(Gateway API)](/kubernetes/networking/kubernetes-ingress-to-gateway-api-httproute/)을 먼저 보면 좋습니다.

---

## 🪪 용어 4개 — 경쟁 관계가 아니라 한 시스템의 역할들

**key·CA·certificate·TLS는 서로 다른 선택지가 아니라, 하나의 신분증 시스템을 이루는 역할들입니다.**

| 용어 | 신분증 비유 | 실제 의미 |
|---|---|---|
| **key(키)** | 나만 만들 수 있는 서명 | 개인키 + 검증용 공개키. 모든 것의 토대 |
| **CA(인증기관)** | 신분증 발급 기관(정부) | 자기 키(CA key)로 인증서에 도장을 찍음 |
| **certificate(cert/crt)** | 신분증 카드 그 자체 | 공개키 + 신원 + CA의 서명 |
| **TLS** | 검문소에서 신분증 제시·검증 | 위 재료를 실제로 쓰는 프로토콜 |

정리하면 "**CA가 자기 키로 인증서(신분증)에 서명하고, TLS가 연결할 때 그걸 제시·검증한다.**" 넷이 한 흐름의 부품이지, 서로 다른 선택지가 아닙니다.

---

## 🍴 헷갈림의 핵심: 같은 기술을 쓰는 별개의 두 체계

**쿠버네티스에는 완전히 별개인 두 종류의 인증서 체계가 있고, 둘 다 같은 기술(X.509 + TLS)을 써서 똑같아 보입니다.** 여기가 진짜 함정입니다.

### ① 클러스터 내부 PKI (kubeadm certs) — 컴포넌트끼리 인증용

- 클러스터에 **자체 CA**(`ca.crt`/`ca.key`)가 있고, 그게 API 서버·etcd·kubelet 등의 인증서를 서명합니다.
- 컴포넌트들은 "상대 인증서가 우리 클러스터 CA가 서명한 거냐"로 서로를 믿습니다(mTLS, 상호 인증).
- 이게 보통 갱신하는 그 인증서입니다. (잎사귀(leaf) 인증서는 기본 1년, CA 자체는 보통 10년)
- 관리 도구: kubeadm (`kubeadm certs renew` 등). **외부 서비스와 무관.**

### ② 앱/인그레스 TLS (Gateway·Ingress + cert-manager) — 외부 클라이언트용

- 공인 CA(또는 사내 CA)가 `a.example.com` 같은 **도메인 인증서**를 서명합니다.
- 외부 브라우저·클라이언트가 "이 https 서버 믿어도 되나"를 판단하는 용도입니다.
- 관리 도구: cert-manager나 수동 Secret. **클러스터 내부 통신과 무관.**

> 🧠 둘은 별개의 CA, 별개의 목적, 별개의 수명·관리 도구입니다. 클러스터 CA는 `a.example.com` 인증서와 아무 상관이 없고, 브라우저는 클러스터 CA를 모르며, 컴포넌트들은 Let's Encrypt를 신경 쓰지 않습니다. 기술은 같지만(X.509+TLS), 다른 건 **"누구를 위한 신뢰냐"** — ①은 클러스터 식구들끼리, ②는 바깥 손님에게입니다.

| 구분 | ① 클러스터 내부 PKI | ② 앱/인그레스 TLS |
|---|---|---|
| 목적 | 컴포넌트 상호 인증(mTLS) | 외부 클라이언트 신뢰 |
| CA | 클러스터 자체 CA | 공인/사내 CA (Let's Encrypt 등) |
| 수명 | leaf 1년, CA 10년 | 발급처별(Let's Encrypt 90일) |
| 관리 | kubeadm | cert-manager / 수동 Secret |

이제부터는 ②(앱/인그레스 TLS) 얘기입니다.

---

## 🏢 Gateway에서 TLS를 중앙화하기

**Gateway API에서는 TLS 설정이 Gateway의 listener로 올라가, TLS 개인키가 플랫폼팀 한 곳에 모입니다.** 5편에서 본 역할 분리가 여기서 보안 이점으로 이어집니다.

**예전 Ingress 방식의 약점**: Ingress의 TLS Secret은 Ingress와 같은 네임스페이스, 즉 **앱팀 네임스페이스**에 있어야 했습니다. 그래서 TLS 개인키가 팀마다 흩어졌고, 관리·감사 범위가 컸습니다.

**Gateway API에서는** Gateway(플랫폼팀 리소스)의 listener에 TLS를 두므로, **개인키가 플랫폼팀 한 곳에 모이고 앱팀은 Route만 붙입니다.**

```yaml
kind: Gateway
metadata:
  name: shared-gateway
  namespace: gateway-system          # 플랫폼팀 소유
spec:
  listeners:
    - name: team-a
      port: 443
      protocol: HTTPS
      hostname: "a.example.com"        # 프로젝트별 도메인
      tls:
        mode: Terminate
        certificateRefs:
          - name: team-a-tls            # 프로젝트별 인증서
      allowedRoutes:
        namespaces:
          from: Selector
          selector:
            matchLabels:
              team: a
```

- **프로젝트별로 다른 인증서**도 가능합니다. listener를 도메인별로 나누면 TLS의 SNI(접속하려는 도메인)로 인증서가 자동 선택됩니다.
- **추가 통제 장치**: `allowedRoutes`로 어느 네임스페이스의 Route만 붙을지 제한하고, 다른 네임스페이스의 Secret을 참조하려면 **ReferenceGrant**로 명시적 허용이 필요합니다(크로스 네임스페이스 접근 기본 차단 = 보안 기능).
- HTTPRoute가 어느 listener에 붙을지는 `hostname` 교집합으로 자동 매칭되고, 명확히 하려면 `sectionName`(listener 이름)을 적어주면 됩니다.

---

## 🤖 cert-manager — "받은 인증서를 넣는" 게 아니라 "받는 행위를 자동화"

**cert-manager는 담당자에게 받은 인증서를 넣어주는 도구가 아니라, 직접 개인키를 만들고 CA에 인증서를 요청해 받아오는 도구입니다.** 작동 방향이 반대라는 점이 큰 오해 포인트입니다. 즉 완성된 인증서를 사람한테 받아 넣는 게 아니라, **사람의 손을 거치는 단계 자체를 없앱니다.**

### 자동화 흐름

1. cert-manager 설치 (클러스터에 Pod로)
2. **Issuer/ClusterIssuer** 정의 — "인증서를 어디서 받을지"(Let's Encrypt, Vault, 사내 CA 등)
3. **Certificate** 생성(또는 애너테이션) — "a.example.com 인증서 필요"
4. cert-manager가 발급처와 통신하고 **도메인 소유를 증명**(HTTP-01 / DNS-01 챌린지)
5. 받은 인증서+키를 **Secret에 자동 저장** → Gateway가 그 Secret 참조
6. 만료 전 **자동 갱신** (예: Let's Encrypt는 90일)

핵심은 **사람이 개인키를 만들거나 `secret.yaml`을 주고받을 일이 사라진다**는 것입니다.

```yaml
# ClusterIssuer (Let's Encrypt ACME)
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod-account-key
    solvers:
      - http01:
          ingress:
            class: nginx
---
# Certificate — cert-manager가 발급·갱신·Secret 저장을 자동 처리
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: team-a-tls
  namespace: gateway-system
spec:
  secretName: team-a-tls            # Gateway가 참조하는 Secret 이름
  dnsNames:
    - a.example.com
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
```

발급처(issuer) 종류도 다양합니다: ACME(Let's Encrypt 등), HashiCorp Vault, Venafi, 사내 CA, self-signed. 핵심은 "사람이 아니라 **프로그램이 자동으로 요청·수령할 수 있는** 발급처"라는 점입니다.

> ⚠️ cert-manager가 수동 발급을 대체하려면 회사 CA가 **자동 연동(ACME/Vault 등) 가능**해야 합니다. 순수 수동 발급뿐이면 cert-manager가 그 발급을 자동화하지 못합니다.

**수동 발급을 유지해야 한다면** 적어도 `secret.yaml`을 손으로 쓰는 대신 이렇게 줄일 수 있습니다.

```bash
kubectl create secret tls my-tls \
  --cert=tls.crt --key=tls.key -n my-namespace
```

---

## 📝 한 줄 요약

- key·cert·CA·TLS는 한 신분증 시스템의 역할들입니다.
- 쿠버네티스엔 PKI가 **두 갈래** — 클러스터 내부(kubeadm, mTLS)와 앱/인그레스 TLS — 로 완전히 별개입니다.
- cert-manager는 "받은 인증서를 넣는" 게 아니라 **"받는 행위(발급·갱신)를 자동화"** 하는 도구이며, 자동 연동 가능한 CA가 전제입니다.

---

## ❓ 자주 묻는 질문

### Q. kubeadm 인증서와 Ingress TLS 인증서는 같은 건가요?

아닙니다. kubeadm 인증서는 클러스터 컴포넌트끼리의 mTLS용(클러스터 자체 CA), Ingress/Gateway TLS는 외부 클라이언트용(공인/사내 CA)입니다. CA·목적·수명·관리 도구가 모두 다릅니다.

### Q. cert-manager에 회사에서 받은 .pfx를 넣으면 관리해주나요?

그게 cert-manager의 방식이 아닙니다. cert-manager는 직접 키를 만들고 CA에 발급을 요청합니다. 회사 CA가 ACME/Vault 등으로 자동 연동되지 않고 순수 수동 발급만 한다면, cert-manager로 자동화할 수 없습니다.

### Q. Let's Encrypt 인증서 유효기간은 얼마인가요?

90일입니다. cert-manager는 만료 전에 자동으로 갱신하므로 수동 개입이 필요 없습니다.

### Q. HTTP-01과 DNS-01 챌린지의 차이는?

둘 다 도메인 소유를 증명하는 방식입니다. HTTP-01은 도메인의 특정 경로에 토큰을 노출(80 포트 필요), DNS-01은 DNS TXT 레코드로 증명합니다. 와일드카드 인증서(`*.example.com`)는 DNS-01만 가능합니다.

### Q. Gateway API에서 다른 네임스페이스의 인증서 Secret을 참조하려면?

ReferenceGrant로 명시적 허용이 필요합니다. 크로스 네임스페이스 접근은 기본 차단되어 있어, 이 보안 기능을 통해 어떤 네임스페이스가 어떤 리소스를 참조할 수 있는지 통제합니다.

---

## 📚 참고

- [cert-manager 공식 문서](https://cert-manager.io/docs/)
- [cert-manager - ACME / Let's Encrypt Issuer](https://cert-manager.io/docs/configuration/acme/)
- [Kubernetes Docs - PKI certificates and requirements](https://kubernetes.io/docs/setup/best-practices/certificates/)
- [Kubernetes Docs - Certificate Management with kubeadm](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/)
- [Gateway API - TLS Configuration](https://gateway-api.sigs.k8s.io/guides/tls/)
- [관련 글: Gateway API (5편)](/kubernetes/networking/kubernetes-ingress-to-gateway-api-httproute/) · [h2 vs h2c (2편)](/kubernetes/networking/kubernetes-grpc-http2-vs-h2c-tls/)
</content>
