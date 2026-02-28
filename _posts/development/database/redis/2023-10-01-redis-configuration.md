---
title: "[Redis] Redis 설정 옵션 정리"
date: 2023-10-01
description: "Redis의 주요 설정 옵션들을 공식 구성 파일(redis.conf) 기준으로 정리한 개발자용 가이드"
categories: [Database, Redis]
tags: [redis, database, configuration]
---

# Redis 설정 옵션 완전 정리

Redis는 빠르고 가벼운 인메모리 데이터 저장소로 널리 사용됩니다.  
이 문서는 Redis 공식 설정 파일(`redis.conf`)에서 **자주 사용하는 옵션들을 중심으로 정리**한 내용입니다.

---

## 🧰 설치 및 기본 서버 준비

아래는 기본적인 설치 및 방화벽 포트 설정 예시입니다.

```bash
#!/bin/bash

# 패키지 업데이트 및 Redis 설치
dnf -y update && dnf -y upgrade && dnf -y install firewalld redis yum-utils net-tools wget curl

# 방화벽 서비스 활성화 및 포트 오픈
systemctl start firewalld
systemctl enable firewalld
firewall-cmd --permanent --add-port=6379/tcp
firewall-cmd --permanent --add-service=redis
firewall-cmd --reload

# Redis 설정 적용 & 활성화
echo "bind 0.0.0.0" > /etc/redis.conf
systemctl start redis
systemctl enable redis

# Redis 상태 확인
systemctl status redis
netstat -lntp | grep 6379
```

위 예시는 **Firewalld 환경에서 Redis 포트(6379)을 열고 서비스로 등록**하는 방법입니다.

---

## 🧾 redis.conf 구성 구조

Redis 설정 파일(`/etc/redis.conf`)은 대부분의 옵션이 다음 형식으로 되어 있습니다.

```
keyword arg1 arg2 ... argN
```

예를 들어:

```
requirepass "hello world"
```

이와 같이 `keyword + 값` 형태로 옵션을 정의합니다.

---

## 📌 일반 옵션 (General)

| 옵션               | 설명                                              |
| ---------------- | ----------------------------------------------- |
| `requirepass`    | Redis에 접속시 필요한 비밀번호 설정                          |
| `daemonize`      | Redis를 데몬으로 실행할지 여부                             |
| `supervised`     | systemd / upstart와 같은 서비스 관리 방식 지정              |
| `loglevel`       | 로그 레벨 (`debug`, `verbose`, `notice`, `warning`) |
| `logfile`        | 로그 출력 파일 지정                                     |
| `syslog-enabled` | Syslog 사용 여부                                    |

기본 값은 대부분 운영자 환경에 맞게 구성되어 있지 않으므로 상황에 따라 조정할 수 있습니다.

---

## 🧠 메모리 관련 옵션

Redis는 메모리 관리가 중요합니다. 대표적인 메모리 옵션은 다음과 같습니다:

| 옵션                 | 설명                                              |
| ------------------ | ----------------------------------------------- |
| `maxmemory`        | Redis 인스턴스가 사용할 최대 메모리                          |
| `maxmemory-policy` | 메모리 초과 시 처리 방식 (`noeviction`, `allkeys-lru`, 등) |

예:

```
maxmemory-policy noeviction
```

는 메모리 한도를 넘어가면 에러를 반환합니다.

---

## 🗄️ 스냅샷 & 데이터 저장

Redis는 RDB 스냅샷 방식을 지원합니다.

| 옵션           | 설명          |
| ------------ | ----------- |
| `dbfilename` | 덤프 파일 이름    |
| `dir`        | 덤프 저장 디렉터리  |
| `save`       | 자동 백업 주기 설정 |

스냅샷은 Redis가 실행 중인 데이터를 지정 주기마다 디스크에 저장합니다.

---

## 📡 네트워크 설정

Redis 서버가 외부에서 접근 가능하게 설정하려면 다음 옵션들을 주의해야 합니다.

| 옵션               | 설명                |
| ---------------- | ----------------- |
| `bind`           | Redis가 수신할 IP 지정  |
| `protected-mode` | 보호 모드 활성화 여부      |
| `port`           | 수신 포트 지정          |
| `tcp-keepalive`  | TCP keep-alive 설정 |

예:

```
bind 192.168.0.150 10.0.0.5
port 6379
protected-mode yes
```

Redis를 외부에서 안전하게 노출하기 위해서는 **bind와 protected-mode 옵션을 함께 설정**하는 것이 좋습니다.

---

## 🔐 복제 & 보안 옵션

| 옵션           | 설명                       |
| ------------ | ------------------------ |
| `replicaof`  | Redis replication(복제) 설정 |
| `masterauth` | 복제 시 마스터 인증 비밀번호      |

Replica 서버가 Master와 연결을 유지하고 복제하기 위해 필요한 옵션입니다.

---

## 📊 CLI 연결 예시

Redis CLI를 통해 접속할 때는 다음 명령을 사용할 수 있습니다.

```bash
redis-cli -h [접속IP] -p [포트] -a [비밀번호]
```

예:

```
redis-cli -h 192.168.0.150 -p 6379 -a "yourpass"
```

기본적인 키/값 조작도 아래와 같이 수행할 수 있습니다.

```bash
redis-cli set mykey "hello"
redis-cli get mykey
redis-cli del mykey
redis-cli flushall
```

---

## 📌 핵심 정리

Redis 설정은 크게 다음 영역으로 나눌 수 있습니다.

1. 🔧 서비스 설치 및 방화벽 설정
2. 🛠 일반 옵션 (로그, 비밀번호)
3. 🧠 메모리 & eviction 정책
4. 💾 스냅샷 & 디스크 저장
5. 🌐 네트워크 접속 정책
6. 🔐 복제 & 보안
7. 📡 CLI로 직접 실습

---
