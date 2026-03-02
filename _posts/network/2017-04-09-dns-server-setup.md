---
title: "[Network] 도메인 서버(DNS) 구축과 관리"
date: 2017-04-09
categories: [Network, DNS]
tags: [dns, domain, network, server, devops]
---

# 🖥️ 도메인 서버(DNS) 구축

DNS는 도메인 이름을 IP로 변환하여 서비스 접근을 가능하게 합니다.  
개발자 관점에서 직접 DNS를 이해하고 구축할 수 있으면 **서비스 장애 대응과 인프라 관리**에 강점이 됩니다.

---

## 1️⃣ DNS 기본 개념

- **역할**: 도메인 ↔ IP 변환
- **레코드 종류**
  - `A` : IPv4
  - `AAAA` : IPv6
  - `CNAME` : 다른 도메인
  - `MX` : 메일 서버

---

## 2️⃣ DNS 서버 종류

- **권한 DNS(Authoritative)**: 자신의 도메인 관리
- **재귀 DNS(Recursive)**: 다른 DNS 결과를 사용자에게 전달

---

## 3️⃣ BIND9 예시 (Ubuntu)

```bash
sudo apt update
sudo apt install bind9

# named.conf.local 설정
zone "mydomain.com" {
    type master;
    file "/etc/bind/db.mydomain.com";
};

# db.mydomain.com 예시
$TTL    604800
@       IN      SOA     ns1.mydomain.com. admin.mydomain.com. (
                          2026030201 ; Serial
                          604800     ; Refresh
                          86400      ; Retry
                          2419200    ; Expire
                          604800 )   ; Negative Cache TTL
;
@       IN      NS      ns1.mydomain.com.
ns1     IN      A       192.168.1.10
www     IN      A       192.168.1.20

sudo systemctl restart bind9
```

---

## 4️⃣ 개발자 팁

* TTL 값 관리 → 캐시 정책 최적화
* 권한 DNS / 재귀 DNS 분리 → 보안 강화
* 테스트: `dig`, `nslookup` 활용
* 컨테이너/클라우드 환경에서 DNS 문제 대응 가능

💡 한 줄 기억:

> **DNS 이해 = 도메인 접근 문제 해결 + 서비스 안정성 확보**
