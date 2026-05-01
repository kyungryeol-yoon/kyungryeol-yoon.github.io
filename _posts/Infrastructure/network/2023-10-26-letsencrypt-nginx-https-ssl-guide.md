---
title: "[Network] 🔒 Let's Encrypt + Certbot으로 Nginx HTTPS 무료 SSL 적용하기"
date: 2023-10-26
categories: [Infrastructure, Network]
tags: [ssl, https, letsencrypt, certbot, nginx, tls, certificate, acme, ubuntu, linux]
pin: false
---

웹 서비스를 운영할 때 HTTPS는 선택이 아닌 필수입니다.
**Let's Encrypt**는 비영리 기관 ISRG(Internet Security Research Group)에서 운영하는 무료 SSL/TLS 인증서 발급 기관입니다.
**Certbot** 클라이언트를 사용하면 명령어 몇 줄로 인증서 발급부터 Nginx 설정 자동화, 자동 갱신까지 한 번에 처리할 수 있습니다.

---

## 🔑 SSL/TLS와 HTTPS 기본 개념

SSL(Secure Sockets Layer) / TLS(Transport Layer Security)는 클라이언트와 서버 간 통신을 암호화하는 보안 프로토콜입니다.
HTTPS는 이 SSL/TLS 암호화를 적용한 HTTP를 의미합니다.

```text
HTTP  (평문 전송) → 중간자 공격, 도청 가능
HTTPS (암호화 전송) → 데이터 무결성 보장, 신뢰할 수 있는 서버 검증
```

**TLS 핸드셰이크 동작 원리:**

```text
클라이언트                        서버
    │── ClientHello ────────────→ │  암호화 방식 제안
    │← ServerHello + 인증서 ─────  │  서버 인증서 전달
    │── 인증서 검증 ────────────→  │  CA 서명 확인
    │── 세션 키 생성 (대칭키) ───→  │  이후 데이터 암호화
    │←─────── 암호화 통신 ────────  │
```

### 인증서 종류

| 종류 | 보호 범위 | 예시 |
|------|----------|------|
| 단일 도메인 | 1개 도메인 | `example.com` |
| 와일드카드 | 1개 도메인 + 모든 서브도메인 | `*.example.com` |
| 멀티 도메인(SAN) | 여러 도메인 동시 | `a.com`, `b.com` |

### Let's Encrypt 특징

| 항목 | 내용 |
|------|------|
| **비용** | 무료 |
| **유효기간** | 90일 (자동 갱신 필수) |
| **발급 방식** | ACME 프로토콜 자동화 |
| **신뢰도** | 주요 브라우저·OS에서 신뢰 |
| **제한** | 동일 도메인 주당 5회 발급 제한 |

> **Tip**: 유효기간이 90일로 짧은 이유는 보안 사고 발생 시 영향 범위를 줄이고, 자동 갱신 생태계를 유도하기 위해서입니다.

---

## 🛠️ 사전 준비

- 도메인이 서버 IP로 DNS 레코드가 연결되어 있어야 합니다.
- 방화벽에서 포트 **80(HTTP)** 과 **443(HTTPS)** 이 열려 있어야 합니다.
- Certbot 인증 시 포트 80을 사용하므로 Nginx가 실행 중이어야 합니다.

```bash
# 포트 개방 확인 (Ubuntu UFW 기준)
sudo ufw allow 80
sudo ufw allow 443
sudo ufw reload
```

---

## 📦 Certbot 설치

### Ubuntu / Debian

```bash
sudo apt update
sudo apt install nginx -y
sudo apt install certbot python3-certbot-nginx -y
```

### Rocky Linux / CentOS

```bash
sudo dnf install nginx -y
sudo dnf install epel-release -y
sudo dnf install certbot python3-certbot-nginx -y
```

### Apache를 사용하는 경우

`python3-certbot-nginx` 대신 `python3-certbot-apache`를 설치합니다.

```bash
sudo apt install certbot python3-certbot-apache -y
```

---

## ⚙️ Nginx 기본 설정 (HTTP)

인증서 발급 전에 Nginx가 도메인을 인식할 수 있도록 설정합니다.

```bash
sudo vi /etc/nginx/conf.d/example.com.conf
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

설정 적용:

```bash
sudo nginx -t          # 문법 검사
sudo systemctl reload nginx
```

---

## 🔐 SSL 인증서 발급

### Nginx 플러그인 방식 (권장)

Certbot이 Nginx 설정을 자동으로 수정해줍니다.

```bash
sudo certbot --nginx -d example.com -d www.example.com
```

발급 과정에서 이메일 주소 입력, 이용약관 동의, HTTP→HTTPS 리다이렉트 설정 여부를 묻습니다.

발급 성공 시 아래 메시지가 출력됩니다.

```text
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/example.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/example.com/privkey.pem
This certificate expires on 2026-07-25.
```

### Standalone 방식 (Nginx 중지 후 발급)

```bash
sudo systemctl stop nginx
sudo certbot certonly --standalone -d example.com
sudo systemctl start nginx
```

포트 80을 Certbot이 직접 사용하므로 Nginx를 먼저 중지해야 합니다.

### Webroot 방식

Nginx를 중지하지 않고 발급할 수 있습니다.

```bash
sudo certbot certonly --webroot \
  -w /var/www/html \
  -d example.com \
  -d www.example.com
```

---

## 📄 발급 후 Nginx 설정

`--nginx` 옵션으로 발급하면 설정이 자동으로 수정됩니다. 수동으로 적용하는 경우 아래를 참고하세요.

```nginx
# HTTP → HTTPS 리다이렉트
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}

# HTTPS 서버
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name example.com www.example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

설정 적용:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔄 자동 갱신 설정

Let's Encrypt 인증서는 **90일마다 만료**됩니다. 자동 갱신을 반드시 설정해야 합니다.

### 갱신 테스트

```bash
sudo certbot renew --dry-run
```

`--dry-run`은 실제 갱신 없이 갱신 과정을 시뮬레이션합니다.

### Crontab으로 자동 갱신

```bash
sudo crontab -e
```

아래 라인을 추가합니다. 만료 30일 전부터 갱신을 시도합니다.

```bash
# 매일 정오에 갱신 확인
0 12 * * * /usr/bin/certbot renew --quiet

# 또는 매주 월요일 새벽 3시 + 갱신 후 Nginx 재시작
0 3 * * 1 /usr/bin/certbot renew --quiet --deploy-hook "systemctl reload nginx"
```

### Systemd Timer로 자동 갱신 (Ubuntu 권장)

Ubuntu 22.04 이상에서는 Certbot 패키지 설치 시 systemd timer가 자동으로 등록됩니다.

```bash
# 타이머 상태 확인
sudo systemctl status certbot.timer

# 수동으로 갱신 실행
sudo certbot renew
```

---

## 🔍 인증서 관리 명령어

```bash
# 발급된 인증서 목록 확인
sudo certbot certificates

# 특정 도메인 인증서 갱신
sudo certbot renew --cert-name example.com

# 인증서 폐기
sudo certbot revoke --cert-path /etc/letsencrypt/live/example.com/fullchain.pem

# 인증서 삭제 (로컬 파일만 삭제)
sudo certbot delete --cert-name example.com
```

---

## ❓ 트러블슈팅

### 발급 실패: 타임아웃 오류

```text
Timeout during connect (likely firewall problem)
```

→ 방화벽에서 포트 80/443 개방 여부를 확인합니다. 클라우드 환경이라면 보안 그룹(Security Group)도 확인합니다.

### 발급 실패: 도메인 확인 오류

```text
DNS problem: NXDOMAIN looking up A for example.com
```

→ DNS A 레코드가 서버 IP로 올바르게 설정되어 있는지 확인합니다.

```bash
dig A example.com
nslookup example.com
```

### Nginx 설정 오류

```text
nginx: [emerg] invalid parameter
```

→ `sudo nginx -t`로 설정 문법을 검사하고, 세미콜론·괄호 누락 여부를 확인합니다.

### 주당 발급 한도 초과

```text
Error: too many certificates already issued for exact set of domains
```

→ Let's Encrypt는 동일 도메인에 대해 **주당 5회 발급 제한**이 있습니다. `--staging` 옵션으로 테스트 인증서를 발급하여 설정을 검증한 후 실제 발급합니다.

```bash
# 테스트 인증서 발급 (한도 미소모)
sudo certbot --nginx --staging -d example.com
```

---

## ✅ 요약

1. `sudo apt install certbot python3-certbot-nginx`로 Certbot을 설치합니다.
2. Nginx에 `server_name`을 설정한 뒤 `sudo certbot --nginx -d 도메인`으로 인증서를 발급합니다.
3. 발급 후 `/etc/letsencrypt/live/도메인/` 경로에 인증서가 저장됩니다.
4. `sudo certbot renew --dry-run`으로 자동 갱신을 테스트한 뒤 crontab 또는 systemd timer로 자동 갱신을 설정합니다.