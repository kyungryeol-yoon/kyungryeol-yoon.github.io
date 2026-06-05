---
title: "[Kubernetes] 🔐 HTTP/2는 TLS가 아니다: h2 vs h2c 완벽 정리"
date: 2026-06-01
categories: [Platform, Kubernetes, Network]
tags: [http2, h2c, tls, grpc, alpn, kubernetes, tls-termination, network, scheme]
description: "HTTP/2와 TLS는 별개라는 사실을 봉투·엽서 비유로 풀어내고, h2와 h2c의 차이, ALPN 협상, TLS termination까지 쿠버네티스 gRPC 통신의 기초 개념을 정리했습니다."
pin: false
---

쿠버네티스에서 gRPC를 다루다 보면 "평문 HTTP/2(h2c)", "scheme이 https인데 평문" 같은 모순처럼 들리는 말들과 마주칩니다. 이 글에서는 그 혼란의 근원인 **"HTTP/2 = TLS"라는 오해**를 봉투·엽서 비유로 깨고, `h2`와 `h2c`의 차이, ALPN 협상, TLS termination을 정리합니다. 이 개념만 잡으면 게이트웨이 뒤 gRPC 통신이 왜 그렇게 동작하는지 전부 설명됩니다.

> **이 시리즈는** 쿠버네티스에 gRPC 서비스를 올리다 막힌 삽질에서 출발해 HTTP/2·TLS·로드밸런서·Gateway API·인증서까지 풀어가는 기록입니다. 이번 2편은 **기초 개념(h2 vs h2c)** 편입니다. 1편을 아직 안 읽었다면 [.NET gRPC가 게이트웨이 뒤에서 안 됐던 문제와 해결](/posts/kubernetes-grpc-dotnet-http2-tls-troubleshooting/)을 먼저 보면 좋습니다.

---

## 🧱 모든 혼란의 근원: "HTTP/2 = TLS"라는 오해

**HTTP/2와 TLS는 별개입니다.** 가장 먼저 깨야 할 오해입니다. 둘은 서로 다른 축에 있습니다.

- **TLS** = 암호화. 데이터를 봉투에 넣어 봉하느냐의 문제입니다.
- **HTTP/2** = 통신 프로토콜. 편지를 어떤 "언어"로 쓰느냐의 문제입니다(HTTP/1.1이냐 HTTP/2냐).

비유하면 이렇습니다.

- **암호화(TLS) = 봉투** / **평문 = 엽서**
- **통신 방식(HTTP 버전) = 편지를 쓴 언어**

편지를 HTTP/2라는 언어로 쓰되, 봉투에 담아 보낼 수도 있고(암호화), 엽서로 보낼 수도 있습니다(평문). 이 둘은 독립적입니다.

---

## 🔢 네 가지 조합

포장(암호화)과 언어(HTTP 버전)가 독립이라, 네 가지 조합이 모두 가능합니다.

| | 평문 (엽서) | TLS (봉투) |
|---|---|---|
| **HTTP/1.1** | 그냥 HTTP (`http://`) | HTTPS (`https://`) |
| **HTTP/2** | **h2c** | **h2** |

여기서 `h2c`의 **`c`는 cleartext(평문)**, 즉 "암호화하지 않은 HTTP/2"입니다.

### 왜 "평문 HTTP/2"가 모순처럼 들릴까?

**브라우저 때문입니다.** 브라우저는 보안상 HTTP/2를 TLS 위에서만(h2) 허용하고, 평문 HTTP/2(h2c)는 쓰지 않습니다. 그래서 일상에서 "HTTP/2 = HTTPS"처럼 느껴집니다. 하지만 그건 브라우저의 정책일 뿐, **프로토콜 자체의 규칙이 아닙니다.** 서버끼리 통신할 땐 평문 HTTP/2(h2c)를 흔히 쓰며, 쿠버네티스 클러스터 내부가 대표적입니다.

> 🧠 흔한 오해: "HTTP/2면 당연히 https니까 인증서가 필요하겠지." 실제로는 클러스터 내부 통신은 평문 HTTP/2(h2c)인 경우가 많고, 암호화는 별개 문제입니다.

---

## 📜 h2 / h2c는 누가 지어낸 말이 아니다

`h2`와 `h2c`는 특정 도구의 용어가 아니라 **HTTP/2 표준(RFC 7540)에 정의되고 IANA에 등록된 공식 식별자**입니다.

원래 `h2`는 TLS 핸드셰이크 때 "우리 HTTP/2로 말하자"를 짧게 주고받기 위한 **ALPN 토큰**입니다. 그래서 `http2`처럼 길게 쓰지 않고 `h2`라는 짧은 형태로 정했습니다. `h2c`는 평문 연결에서 HTTP/1.1 → HTTP/2 업그레이드를 요청할 때 쓰던 토큰이었습니다.

이게 중요한 이유는 **도구가 바뀌어도 의미가 같기 때문**입니다. Envoy·Kestrel·gRPC·Contour HTTPProxy 어디서 보든 `h2c`는 전부 "평문 HTTP/2"라는 같은 뜻입니다. 각 도구가 제멋대로 지은 게 아니라 같은 표준을 따르므로, 한 번 익히면 그대로 통합니다.

> **참고**: 이후 HTTP/2 표준이 RFC 9113으로 정리되며 평문 업그레이드(`Upgrade: h2c`) 메커니즘 등 세부 규칙은 일부 바뀌었지만, `h2`=TLS HTTP/2, `h2c`=평문 HTTP/2라는 기본 의미는 그대로입니다.

---

## 🤝 ALPN — 봉투를 열기 전에 "언어"를 합의하는 과정

**ALPN(Application-Layer Protocol Negotiation)은 TLS 핸드셰이크 단계에서 클라이언트와 서버가 어떤 프로토콜로 통신할지 미리 합의하는 과정입니다.** 봉투(TLS)를 봉하기 전에 "우리 무슨 언어로 말할까?"를 정하는 셈이고, 여기서 `h2`로 합의되면 HTTP/2로 통신합니다.

핵심 포인트는 **평문(엽서)에는 이 ALPN 단계가 없다**는 것입니다.

그래서 1편에서 Kestrel을 `Http1AndHttp2`로 두면 안 됐던 것입니다. 평문 포트에는 "무슨 언어냐"를 협상할 ALPN이 없으니, Kestrel이 안전하게 HTTP/1.1로 떨어뜨립니다. 평문에서 HTTP/2를 받으려면 **`Http2` 전용**으로 못 박아야 합니다.

```jsonc
// appsettings.json — 평문 포트에서 HTTP/2를 강제
{
  "Kestrel": {
    "EndpointDefaults": {
      "Protocols": "Http2"
    }
  }
}
```

---

## ✂️ TLS termination — 봉투를 어디서 뜯느냐

**TLS termination(TLS 종료)은 게이트웨이가 들어오는 암호화 연결의 봉투(TLS)를 뜯어 평문으로 바꾸는 지점입니다.** 내용을 읽어 라우팅하려면 봉투를 먼저 열어야 하기 때문입니다. 그리고 클러스터 안쪽(게이트웨이 → Pod)으로는 다시 엽서(평문 h2c)로 전달합니다.

```text
클라이언트 ──(봉투, h2)──▶ 게이트웨이[봉투 뜯음] ──(엽서, h2c)──▶ Pod
```

여기서 1편의 원인 ②가 나옵니다. 게이트웨이는 봉투를 뜯어 엽서로 바꾸면서도, 편지에 붙은 **`:scheme` 라벨**은 원래대로 "https(봉투)"라고 남겨 둡니다. 그러니 엽서를 받은 Kestrel이 "라벨엔 봉투라는데 넌 엽서네?" 하고 거부한 것입니다. `AllowAlternateSchemes`는 "그 라벨은 무시하고 받아라"라는 허락이었습니다.

```csharp
builder.WebHost.ConfigureKestrel(options =>
{
    options.AllowAlternateSchemes = true; // :scheme=https + 평문 전송 허용
});
```

---

## 🧩 정리: 세 가지만 구분하면 된다

1편의 모든 증상이 이 세 가지의 조합으로 설명됩니다.

| 구분 | 의미 | 예시 |
|---|---|---|
| **봉투 / 엽서** | 암호화 여부 | TLS / 평문 |
| **언어** | 통신 방식 | HTTP/1.1 / HTTP/2 |
| **라벨** | 요청 헤더 | `:scheme`, `:authority` 등 |

> **외울 한 문장:** 통신 방식(HTTP/1.1·HTTP/2)과 암호화(TLS를 쓰냐 마냐)는 **완전히 별개다.**

이 한 문장이 몸에 배면, "평문 HTTP/2"도 "scheme이 https인데 평문"도 더 이상 모순으로 들리지 않습니다.

---

## ❓ 자주 묻는 질문

### Q. h2와 h2c의 차이는 무엇인가요?

둘 다 HTTP/2입니다. `h2`는 TLS 위에서(암호화) 동작하는 HTTP/2, `h2c`는 평문(cleartext)에서 동작하는 HTTP/2입니다. `c`는 cleartext를 뜻합니다.

### Q. HTTP/2를 쓰려면 반드시 인증서(TLS)가 필요한가요?

아닙니다. 그건 브라우저의 정책일 뿐 프로토콜 규칙이 아닙니다. 서버 간 통신, 특히 쿠버네티스 클러스터 내부에서는 평문 HTTP/2(h2c)를 흔히 사용합니다.

### Q. ALPN이 없으면 왜 HTTP/2로 통신할 수 없나요?

평문 연결에는 TLS 핸드셰이크 자체가 없어 ALPN 협상 단계가 없습니다. 따라서 "HTTP/2로 말하자"를 합의할 방법이 없어, 서버는 안전하게 HTTP/1.1로 처리하거나 HTTP/2 전용으로 명시되어 있어야 합니다.

### Q. TLS termination 이후 백엔드는 어떤 프로토콜을 받나요?

게이트웨이가 TLS를 종료하면 백엔드(Pod)로는 평문이 전달됩니다. gRPC라면 이때 평문 HTTP/2, 즉 `h2c`로 전달되어야 합니다.

---

## 📚 참고

- [RFC 7540 - Hypertext Transfer Protocol Version 2 (HTTP/2)](https://datatracker.ietf.org/doc/html/rfc7540)
- [RFC 9113 - HTTP/2 (RFC 7540 개정판)](https://datatracker.ietf.org/doc/html/rfc9113)
- [IANA TLS Application-Layer Protocol Negotiation (ALPN) Protocol IDs](https://www.iana.org/assignments/tls-extensiontype-values/tls-extensiontype-values.xhtml#alpn-protocol-ids)
- [MDN - Application-Layer Protocol Negotiation (ALPN)](https://developer.mozilla.org/en-US/docs/Glossary/ALPN)
- [관련 글: gRPC가 .NET에서만 안 됐다 (시리즈 1편)](/posts/kubernetes-grpc-dotnet-http2-tls-troubleshooting/)
</content>
