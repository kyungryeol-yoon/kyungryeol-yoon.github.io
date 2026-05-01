---
title: "[Docker] Network - no route to host 오류 원인과 해결 방법"
date: 2020-03-02
categories: [Docker, Network]
tags: [docker, network, error, no-route-to-host, troubleshooting]
---

## Docker Container "No Route to Host" 오류 원인과 해결 방법

Docker 환경에서 컨테이너 실행 중 다음과 같은 오류를 만날 때가 있다.

```

no route to host

```

이 오류는 애플리케이션 문제가 아니라 **네트워크 레벨(L3/L4) 문제**이다.  
즉, **컨테이너에서 대상 서버까지 네트워크 경로를 찾을 수 없을 때** 발생한다.

---

## 📌 언제 발생할까?

다음과 같은 상황에서 주로 발생한다.

- 컨테이너 → 외부 서버 접속
- 컨테이너 → 호스트 서버 접속
- 컨테이너 → 다른 컨테이너 접속
- 방화벽에 의해 차단된 경우
- 잘못된 IP 또는 포트로 접근한 경우

---

## 📌 대표적인 원인

### 1️⃣ 대상 서버가 꺼져 있는 경우

접속하려는 서버가 실행 중이 아니라면 네트워크 경로를 찾을 수 없다.

```bash
ping 대상IP
```

---

### 2️⃣ localhost를 잘못 사용한 경우 (가장 흔함)

컨테이너 내부에서:

```
localhost = 컨테이너 자기 자신
```

따라서 아래 요청은 실패한다.

```bash
curl http://localhost:8080
```

### ✅ 해결 방법

#### Mac / Windows

```bash
host.docker.internal
```

#### Linux

```bash
172.17.0.1
```

또는

```bash
docker run --network host ...
```

---

### 3️⃣ Docker 네트워크 분리 문제

서로 다른 Docker 네트워크에 연결된 컨테이너끼리는 통신할 수 없다.

확인 방법:

```bash
docker network ls
docker network inspect 네트워크명
```

---

### 4️⃣ 방화벽 문제 (매우 흔함)

다음과 같은 보안 설정이 원인일 수 있다.

* Linux: `ufw`, `firewalld`
* 클라우드 환경: Security Group
* 서버 레벨: `iptables`

확인:

```bash
sudo ufw status
```

---

### 5️⃣ 서버가 127.0.0.1 로만 바인딩된 경우

예시:

```python
app.run(host="127.0.0.1")
```

이 경우 외부에서 접근할 수 없다.

### ✅ 올바른 설정

```python
app.run(host="0.0.0.0")
```

---

## 📌 비슷한 오류와 차이점

| 오류                 | 의미                     |
| ------------------ | ---------------------- |
| connection refused | 서버는 존재하지만 포트가 열려 있지 않음 |
| timeout            | 응답 없음 (방화벽 가능성 높음)     |
| no route to host   | 네트워크 경로 자체가 없음         |

---

## 📌 빠른 체크 리스트

### 1️⃣ 컨테이너 내부에서 확인

```bash
ping 대상IP
curl 대상IP:포트
```

### 2️⃣ 호스트에서 포트 확인

```bash
netstat -tulnp
```

---

## 📌 가장 흔한 원인 요약

* localhost 잘못 사용
* 서버가 0.0.0.0 으로 바인딩되지 않음
* 방화벽 차단
* 서로 다른 Docker 네트워크 사용

---

## ✨ 마무리

`no route to host` 오류는 대부분 네트워크 설정 문제다.
애플리케이션 코드를 의심하기 전에 다음을 순서대로 점검해보자.

1. IP가 맞는지
2. 포트가 열려 있는지
3. 네트워크가 연결되어 있는지
4. 방화벽이 막고 있지 않은지

기본적인 네트워크 흐름을 이해하고 접근하면 대부분 빠르게 해결할 수 있다.
