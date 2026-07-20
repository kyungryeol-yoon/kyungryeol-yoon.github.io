---
title: "[Linux] 🔐 OpenSSL로 PFX 인증서 변환 후 Kubernetes TLS Secret 만들기"
date: 2026-05-18
tags: [openssl, pfx, pkcs12, kubernetes, tls, secret, certificate, ingress]
description: "Windows에서 발급받은 PFX(PKCS#12) 인증서를 OpenSSL로 PEM 형식의 키·인증서로 분리하고, kubectl로 Kubernetes TLS Secret을 생성하는 전체 과정을 정리했습니다."
---

이 글에서는 Windows IIS나 CA에서 발급한 PFX(PKCS#12) 인증서 파일을 OpenSSL 명령으로 개인키(.key)와 인증서 체인(.crt) PEM 파일로 분리하고, 이를 `kubectl create secret tls`로 Kubernetes TLS Secret 매니페스트로 변환하는 워크플로우를 단계별로 다룹니다. Ingress·Argo CD 등에서 사용할 TLS Secret을 만들 때 그대로 활용할 수 있습니다.

---

## 📦 PFX(PKCS#12) 파일이란?

PFX는 PKCS#12 표준을 따르는 바이너리 형식의 인증서 컨테이너입니다. 하나의 파일 안에 **개인키 + 인증서 + 중간 CA 체인**이 모두 패스워드로 암호화되어 들어 있어, Windows 환경에서 인증서를 백업하거나 이관할 때 주로 사용됩니다.

반면 Linux 진영(Nginx, HAProxy, Kubernetes Ingress 등)은 일반적으로 PEM 형식의 별도 파일(`.key`, `.crt`)을 요구합니다. 따라서 PFX를 그대로 사용할 수 없고 OpenSSL로 변환해야 합니다.

| 항목 | PFX (PKCS#12) | PEM |
| --- | --- | --- |
| 형식 | 바이너리 | Base64 텍스트 |
| 확장자 | `.pfx`, `.p12` | `.key`, `.crt`, `.pem` |
| 구성 | 키 + 인증서 + 체인 통합 | 파일별 분리 |
| 암호화 | 항상 패스워드 보호 | 선택적 (키만 암호화 가능) |
| 주 사용처 | Windows, IIS | Linux, Nginx, Kubernetes |

---

## 🛠️ 사전 준비

OpenSSL과 kubectl이 설치되어 있어야 합니다.

```bash
openssl version
# OpenSSL 3.0.x 이상 권장

kubectl version --client
```

작업할 PFX 파일과 그 파일의 패스워드를 미리 준비해 둡니다. 이 글에서는 다음과 같은 변수로 진행한다고 가정하겠습니다.

```bash
PFX_FILE="example.com.pfx"
PFX_PASS="ChangeMeStrongPass"   # PFX 원본 패스워드
TMP_PASS="ChangeMeTempPass"     # 중간 작업용 임시 패스워드
KEY_OUT="tls.key"
CRT_OUT="fullchain.crt"
NAMESPACE="argocd"
SECRET_NAME="tls-example-com"
```

> ⚠️ 실제 운영 환경에서는 패스워드를 셸 히스토리에 남기지 않도록 `-passin file:...` 또는 환경변수(`-passin env:VAR`)를 사용하는 것이 안전합니다.

---

## 1️⃣ PFX에서 개인키 추출하기

먼저 PFX에서 개인키만 분리합니다. 이 시점에서는 키가 여전히 임시 패스워드(`TMP_PASS`)로 암호화된 PEM 형식으로 출력됩니다.

```bash
openssl pkcs12 \
  -passin pass:${PFX_PASS} \
  -passout pass:${TMP_PASS} \
  -in ${PFX_FILE} \
  -nocerts \
  -out tmp.key
```

| 옵션 | 설명 |
| --- | --- |
| `pkcs12` | PKCS#12 형식 처리 서브커맨드 |
| `-passin pass:...` | 입력 PFX 파일의 패스워드 |
| `-passout pass:...` | 출력 PEM 키에 적용할 패스워드 |
| `-in` | 입력 PFX 파일 경로 |
| `-nocerts` | 인증서는 제외하고 키만 추출 |
| `-out` | 출력 파일 경로 |

> **Tip**: `-passout`을 빼면 OpenSSL이 대화형으로 패스워드를 물어봅니다. 자동화 스크립트에서는 명시적으로 지정하는 편이 안정적입니다.

---

## 2️⃣ 개인키 패스워드 제거 (복호화)

Kubernetes TLS Secret과 대부분의 Ingress 컨트롤러는 **패스워드가 없는 PEM 키**를 요구합니다. 따라서 임시 패스워드로 암호화된 키를 평문 RSA 키로 변환합니다.

```bash
openssl rsa \
  -passin pass:${TMP_PASS} \
  -in tmp.key \
  -out ${KEY_OUT}
```

명령이 성공하면 다음과 같은 메시지가 출력됩니다.

```text
writing RSA key
```

생성된 `${KEY_OUT}` 파일은 다음과 같이 시작합니다.

```text
-----BEGIN RSA PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQ...
-----END RSA PRIVATE KEY-----
```

> ⚠️ 평문 개인키는 노출 시 즉시 인증서 폐기 사유가 됩니다. 작업이 끝나면 임시 파일(`tmp.key`)은 반드시 삭제하세요.

---

## 3️⃣ 인증서 체인 추출하기

이번에는 키를 제외한 클라이언트 인증서와 중간 CA 인증서를 한 파일로 묶어 추출합니다.

```bash
openssl pkcs12 \
  -passin pass:${PFX_PASS} \
  -in ${PFX_FILE} \
  -clcerts \
  -nokeys \
  -out ${CRT_OUT}
```

| 옵션 | 설명 |
| --- | --- |
| `-clcerts` | 클라이언트(서버) 인증서만 출력 |
| `-nokeys` | 개인키는 제외 |

체인이 분리되어 있어 풀체인(fullchain)으로 묶고 싶다면 `-clcerts` 옵션을 빼고, 출력된 인증서 블록 중 필요한 것을 확인해 정렬합니다.

```bash
openssl pkcs12 \
  -passin pass:${PFX_PASS} \
  -in ${PFX_FILE} \
  -nokeys \
  -out fullchain.crt
```

> **Tip**: Ingress에서 SSL Labs A+ 등급을 받으려면 서버 인증서 + 중간 CA 순서로 정렬된 풀체인이 필요합니다.

---

## 4️⃣ 추출 결과 검증하기

변환이 정상적으로 끝났는지 반드시 확인합니다.

**인증서 정보 확인**

```bash
openssl x509 -in ${CRT_OUT} -noout -subject -issuer -dates
```

```text
subject=CN=example.com
issuer=CN=Internal Issuing CA
notBefore=Jan  1 00:00:00 2026 GMT
notAfter=Dec 31 23:59:59 2026 GMT
```

**개인키와 인증서가 한 쌍인지 확인 (모듈러스 비교)**

```bash
diff \
  <(openssl rsa -in ${KEY_OUT} -modulus -noout) \
  <(openssl x509 -in ${CRT_OUT} -modulus -noout)
```

출력이 없으면 같은 쌍입니다. 다르면 잘못된 키/인증서 조합이므로 Secret을 만들어도 TLS 핸드셰이크가 실패합니다.

---

## 5️⃣ Kubernetes TLS Secret YAML 만들기

`kubectl create secret tls`에 `--dry-run=client -o yaml`을 붙이면 클러스터에 반영하지 않고 매니페스트만 생성할 수 있습니다.

```bash
kubectl create secret tls ${SECRET_NAME} \
  -n ${NAMESPACE} \
  --key ${KEY_OUT} \
  --cert ${CRT_OUT} \
  --dry-run=client -o yaml > tls-example-com.yaml
```

생성된 매니페스트는 다음과 같은 형태입니다.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: tls-example-com
  namespace: argocd
type: kubernetes.io/tls
data:
  tls.crt: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUZ...
  tls.key: LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpN...
```

> **Tip**: Git에 커밋한다면 평문 Secret 대신 [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)나 [External Secrets Operator](https://external-secrets.io/)로 암호화하는 것이 좋습니다.

---

## 6️⃣ 클러스터에 적용 및 Ingress 연결

생성한 매니페스트를 적용합니다.

```bash
kubectl apply -f tls-example-com.yaml

kubectl get secret ${SECRET_NAME} -n ${NAMESPACE}
# NAME              TYPE                DATA   AGE
# tls-example-com   kubernetes.io/tls   2      5s
```

이후 Ingress 리소스에서 `tls.secretName`으로 참조합니다.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-server-ingress
  namespace: argocd
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - example.com
      secretName: tls-example-com
  rules:
    - host: example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: argocd-server
                port:
                  number: 443
```

---

## 🧹 마무리 정리

작업이 끝나면 민감 파일을 안전하게 정리합니다.

```bash
shred -u tmp.key ${KEY_OUT} 2>/dev/null || rm -f tmp.key ${KEY_OUT}
```

> ⚠️ `shred`는 ext4 등 일부 파일시스템에서만 효과적입니다. SSD·복사본 캐시·tmpfs에서는 완전 삭제가 보장되지 않으므로 작업 디렉터리 자체를 안전한 위치(예: `tmpfs` 마운트)로 잡는 편이 좋습니다.

---

## 🚀 한 번에 처리하는 스크립트

위 단계를 자동화한 예시 스크립트입니다.

```bash
#!/usr/bin/env bash
set -euo pipefail

PFX_FILE="${1:?usage: $0 <pfx> <pfx-pass> <namespace> <secret-name>}"
PFX_PASS="${2}"
NAMESPACE="${3}"
SECRET_NAME="${4}"
TMP_PASS="$(openssl rand -hex 8)"

WORKDIR="$(mktemp -d)"
trap 'rm -rf "${WORKDIR}"' EXIT

openssl pkcs12 -passin "pass:${PFX_PASS}" -passout "pass:${TMP_PASS}" \
  -in "${PFX_FILE}" -nocerts -out "${WORKDIR}/tmp.key"

openssl rsa -passin "pass:${TMP_PASS}" \
  -in "${WORKDIR}/tmp.key" -out "${WORKDIR}/tls.key"

openssl pkcs12 -passin "pass:${PFX_PASS}" \
  -in "${PFX_FILE}" -nokeys -out "${WORKDIR}/tls.crt"

kubectl create secret tls "${SECRET_NAME}" \
  -n "${NAMESPACE}" \
  --key "${WORKDIR}/tls.key" \
  --cert "${WORKDIR}/tls.crt" \
  --dry-run=client -o yaml
```

---

## ❓ 자주 묻는 질문

### Q. `-nodes` 옵션을 한 번에 쓰면 되지 않나요?

가능합니다. `openssl pkcs12 -in file.pfx -nodes -out all.pem` 한 줄로 키와 인증서를 평문으로 함께 추출할 수 있습니다. 다만 키/인증서를 한 파일에 섞으면 `kubectl create secret tls`처럼 두 파일을 요구하는 도구에서 다시 분리해야 하므로, 단계별로 추출하는 편이 자동화에 유리합니다.

### Q. "Mac verify error: invalid password" 오류가 납니다.

PFX 파일의 패스워드가 틀린 경우입니다. 일부 환경에서는 OpenSSL 3.x에서 구버전 PFX의 해시 알고리즘을 거부하기도 합니다. 이 경우 `-legacy` 옵션을 추가해 보세요.

```bash
openssl pkcs12 -legacy -passin pass:... -in file.pfx -out out.pem
```

### Q. 평문 RSA 키와 PKCS#8 키 중 어느 쪽을 써야 하나요?

대부분의 Kubernetes Ingress 컨트롤러는 두 형식을 모두 지원합니다. 다만 일부 신규 도구(예: Envoy 일부 빌드)는 PKCS#8을 선호합니다. 변환은 다음과 같이 합니다.

```bash
openssl pkcs8 -topk8 -nocrypt -in tls.key -out tls.pkcs8.key
```

### Q. `--dry-run=client`와 `--dry-run=server`의 차이는?

`client`는 클라이언트(kubectl) 측에서만 매니페스트를 생성하고 API 서버로 보내지 않습니다. `server`는 API 서버까지 가서 어드미션 검증을 수행하지만 실제로 저장하지 않습니다. Secret YAML을 만들 때는 `client`로 충분합니다.

### Q. Secret을 만든 뒤 인증서가 갱신되면 어떻게 하나요?

같은 이름으로 `kubectl create secret tls ... --dry-run=client -o yaml | kubectl apply -f -`를 다시 실행하면 됩니다. Ingress 컨트롤러는 Secret 변경을 감지해 자동으로 새 인증서를 로드합니다.

---

## 📚 참고

- [OpenSSL pkcs12 공식 문서](https://docs.openssl.org/master/man1/openssl-pkcs12/)
- [OpenSSL rsa 공식 문서](https://docs.openssl.org/master/man1/openssl-rsa/)
- [Kubernetes TLS Secret 공식 문서](https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets)
- [kubectl create secret tls 레퍼런스](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#-em-secret-tls-em-)
- [Ingress TLS 설정](https://kubernetes.io/docs/concepts/services-networking/ingress/#tls)
