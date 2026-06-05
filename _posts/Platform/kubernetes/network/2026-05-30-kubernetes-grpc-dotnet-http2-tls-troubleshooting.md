---
title: "[Kubernetes] 🔌 gRPC가 .NET에서만 안 됐다: HTTP/2·TLS·scheme 문제 해결"
date: 2026-05-30
categories: [Platform, Kubernetes, Network]
tags: [grpc, kubernetes, http2, kestrel, dotnet, h2c, tls, gateway, network]
description: "쿠버네티스 게이트웨이 뒤에서 .NET gRPC만 연결이 끊기는 문제를 HTTP/2(h2c)와 Kestrel의 AllowAlternateSchemes 설정으로 해결하는 과정을 정리했습니다."
pin: false
---

쿠버네티스에 gRPC 서비스를 올렸는데 **Python 서버는 붙고 .NET(Kestrel) 서버만 계속 끊기는** 문제를 겪었습니다. 이 글에서는 그 원인이 ① 게이트웨이가 백엔드로 HTTP/1.1을 보내는 문제와 ② TLS 종료 후에도 `:scheme=https` 라벨이 남아 Kestrel이 거부하는 문제, **두 개의 서로 다른 계층**에 있었음을 추적하고 `h2c` + `AllowAlternateSchemes`로 해결하는 과정을 단계별로 다룹니다.

> **이 시리즈는** 쿠버네티스에 gRPC 서비스를 올리다 막힌 삽질에서 출발해, HTTP/2·TLS·로드밸런서·Gateway API·인증서까지 하나씩 풀어가는 기록입니다. 1편(이 글)은 **문제와 해결**입니다.

---

## 🚨 증상: 같은 gRPC인데 한쪽만 안 된다

쿠버네티스에 gRPC 서비스를 올렸습니다. 게이트웨이 설정은 동일한데 결과가 갈렸습니다.

| 백엔드 | 포트 80 (평문) | 포트 443 (TLS) |
|---|---|---|
| **Python gRPC 서버** | ✅ 정상 | ✅ 정상 |
| **.NET(Kestrel) gRPC 서버** | ✅ 정상 | ❌ 연결 끊김 |

Kestrel 로그에는 다음과 같은 에러가 찍혔습니다.

```text
The request :scheme header 'https' does not match the transport scheme 'http'.
```

처음 든 생각은 "HTTP/2가 문제니까 HTTP/2를 피해보자"였습니다. 결론부터 말하면 **그건 불가능합니다.** gRPC는 HTTP/2 위에서만 동작하기 때문입니다. HTTP/2를 빼는 순간 그건 더 이상 gRPC가 아닙니다.

그래서 방향을 바꿨습니다. "피하자"가 아니라 **"어디서, 왜 깨지는지"를 정확히 찾자**로요.

---

## 📌 핵심 전제 두 가지

본격적으로 들어가기 전에 두 가지만 깔고 갑니다. (자세한 개념은 다음 편에서 다룹니다.)

1. **gRPC = HTTP/2.** 처음부터 끝까지 HTTP/2를 요구합니다.
2. **"통신 방식(HTTP 버전)"과 "암호화(TLS)"는 별개입니다.** 이게 모든 혼란의 근원이었습니다.

특히 헷갈렸던 건 `h2c`라는 단어였습니다.

### h2와 h2c는 무엇인가?

`h2`는 **TLS 위에서 동작하는 HTTP/2**, `h2c`는 **암호화 없이(평문) 동작하는 HTTP/2**를 가리킵니다(`c` = cleartext). "HTTP/2인데 평문"이라는 말이 모순처럼 들리지만, HTTP/2와 TLS가 별개의 계층이라는 것을 알고 나면 자연스럽습니다.

| 표기 | 프로토콜 | 암호화 | 일반적인 포트 |
|---|---|---|---|
| `h2` | HTTP/2 | TLS 있음 | 443 |
| `h2c` | HTTP/2 | 평문 | 80 |

---

## 🔍 원인 ① — 게이트웨이가 HTTP/1.1로 말을 걸고 있었다

**첫 번째 원인은 게이트웨이가 백엔드로 HTTP/1.1을 보내고 있었던 것입니다.** Kestrel을 HTTP/2 전용으로 설정해 두면 그 포트는 HTTP/2만 알아듣습니다. 그런데 게이트웨이는 별도 지정이 없으면 백엔드로 **HTTP/1.1**을 보냅니다. "언어"가 안 맞으니 Kestrel이 거부합니다.

### 해결 ①-a: 게이트웨이가 h2c로 보내게 한다

Service에 `appProtocol`을 명시하면, 게이트웨이가 백엔드로 평문 HTTP/2를 보내야 한다는 것을 알게 됩니다.

```yaml
# Service
apiVersion: v1
kind: Service
metadata:
  name: my-grpc-svc
spec:
  ports:
    - name: grpc
      port: 8080
      targetPort: 8080
      appProtocol: kubernetes.io/h2c   # 평문 HTTP/2로 전달하라
```

Contour를 사용한다면 HTTPProxy에서 백엔드 프로토콜을 직접 지정할 수도 있습니다.

```yaml
# Contour HTTPProxy
spec:
  routes:
    - services:
        - name: my-grpc-svc
          port: 8080
          protocol: h2c
```

### 해결 ①-b: Kestrel을 HTTP/2 전용으로 둔다

평문 포트에는 프로토콜 자동 협상(ALPN)이 없어서, `Http1AndHttp2`로 두면 협상 단계 없이 **HTTP/1.1로 떨어집니다.** 따라서 평문 gRPC 포트는 `Http2`로 고정해야 합니다.

```jsonc
// appsettings.json
{
  "Kestrel": {
    "EndpointDefaults": {
      "Protocols": "Http2"
    }
  }
}
```

> ⚠️ `Http1AndHttp2`는 TLS(ALPN)가 있을 때만 HTTP/2로 협상됩니다. TLS 종료가 게이트웨이에서 일어나는 쿠버네티스 환경에서는 평문 포트이므로 `Http2`로 명시해야 합니다.

---

## 🔍 원인 ② — scheme 라벨 불일치 (.NET만 막혔던 진짜 이유)

**두 번째 원인이자 .NET만 막힌 진짜 이유는 `:scheme` 라벨과 실제 전송 방식의 불일치입니다.** 게이트웨이가 TLS를 종료(복호화)해 평문으로 바꿔 보내면서도, 요청에 붙은 `:scheme` 값은 원래대로 **`https`** 로 남겨 둡니다. 그런데 Kestrel에 도착한 연결은 평문입니다. Kestrel은 "scheme은 https라는데 연결은 평문이네? 안 맞잖아"라며 거부합니다. 이게 로그에 찍힌 그 에러의 정체였습니다.

```text
The request :scheme header 'https' does not match the transport scheme 'http'.
```

Python gRPC 서버는 이 scheme 검증을 하지 않아서 그냥 통과했고, Kestrel만 엄격하게 검사했던 것입니다.

### 해결 ②: Kestrel에게 그 scheme을 허용하라고 알려준다

`AllowAlternateSchemes` 옵션을 켜면 Kestrel이 `:scheme`과 전송 방식이 달라도 허용합니다.

```csharp
builder.WebHost.ConfigureKestrel(options =>
{
    options.AllowAlternateSchemes = true;
});
```

덤으로 이 옵션을 켜면 `HttpRequest.Scheme`이 원래 값(`https`)으로 잡혀, 앱이 리다이렉트·절대경로 URL을 만들 때도 올바르게 동작합니다.

> **Tip**: `AllowAlternateSchemes`는 .NET 6 이상에서 사용할 수 있습니다. scheme 값 자체는 여전히 유효한 형식이어야 합니다.

---

## 🧩 두 설정은 "중복"이 아니라 "서로 다른 층"

처음엔 "둘 다 h2c 관련 아닌가?" 싶었는데, 역할이 완전히 다릅니다.

| 설정 | 담당하는 계층 | 의미 |
|---|---|---|
| Service의 `appProtocol: h2c` | **통신 방식(언어)** | "HTTP/2로 보내라" |
| Kestrel `AllowAlternateSchemes` | **헤더(라벨) 검증** | "https 라벨을 평문 위에서도 허용해라" |

그래서 하나만 빼도, 둘 다 빼도 통신이 안 됩니다. **둘 다 맞춰야** 합니다.

---

## ✅ 증상이 전부 설명된다

두 원인을 알고 나면 처음의 증상 표가 모두 설명됩니다.

- **왜 80은 되고 443은 안 됐나?**
  80(평문)으로 들어오면 게이트웨이가 scheme `http`로 전달 → 실제도 평문 → 일치 → OK.
  443(TLS)은 scheme `https`를 평문 위로 전달 → 불일치 → 실패.

- **왜 Python은 되고 .NET은 안 됐나?**
  Python 서버는 scheme 라벨을 검증하지 않았고, Kestrel만 엄격하게 검사했기 때문입니다.

---

## 📝 한 줄 요약

.NET gRPC가 게이트웨이 뒤에서 안 됐던 건 **두 가지**였습니다.

1. 게이트웨이가 HTTP/1.1로 말을 걸어서 → Service `appProtocol: h2c` + Kestrel `Protocols: Http2`
2. TLS를 푼 뒤에도 `:scheme=https` 라벨이 남아 Kestrel이 거부해서 → `AllowAlternateSchemes = true`

둘은 다른 층의 문제라 **둘 다** 맞춰야 합니다.

---

## ❓ 자주 묻는 질문

### Q. gRPC를 HTTP/1.1로 쓸 수는 없나요?

없습니다. gRPC는 스트리밍과 멀티플렉싱을 위해 HTTP/2를 전제로 설계되어, HTTP/2를 빼면 더 이상 gRPC가 아닙니다.

### Q. h2와 h2c의 차이는 무엇인가요?

둘 다 HTTP/2입니다. `h2`는 TLS 위에서(암호화), `h2c`는 평문에서 동작합니다. 쿠버네티스에서 게이트웨이가 TLS를 종료하면 백엔드로는 `h2c`(평문 HTTP/2)가 전달됩니다.

### Q. Kestrel을 `Http1AndHttp2`로 두면 안 되나요?

평문 포트에서는 ALPN 협상이 없어 HTTP/1.1로 떨어집니다. TLS 종료가 게이트웨이에서 일어나는 환경에서는 평문 gRPC 포트를 `Http2`로 고정해야 합니다.

### Q. `AllowAlternateSchemes`는 어떤 상황에서 필요한가요?

게이트웨이/로드밸런서가 TLS를 종료한 뒤 `:scheme`을 원래 값(`https`)으로 유지한 채 평문으로 백엔드에 전달할 때 필요합니다. 이 옵션이 없으면 Kestrel이 scheme과 전송 방식 불일치로 연결을 거부합니다.

---

## 📚 참고

- [Allow alternate schemes in Kestrel requests · PR #34013 (dotnet/aspnetcore)](https://github.com/dotnet/aspnetcore/pull/34013)
- [GRPC :scheme pseudo-header causes ConnectionAbortedException · Issue #30532 (dotnet/aspnetcore)](https://github.com/dotnet/aspnetcore/issues/30532)
- [gRPC issue when Kestrel set to Http1AndHttp2 with unsecure urls · Issue #979 (grpc/grpc-dotnet)](https://github.com/grpc/grpc-dotnet/issues/979)
- [Kubernetes Service appProtocol 문서](https://kubernetes.io/docs/concepts/services-networking/service/#application-protocol)
- [Contour HTTPProxy: gRPC / h2c upstream](https://projectcontour.io/docs/main/config/upstream-tls/)
</content>
</invoke>
