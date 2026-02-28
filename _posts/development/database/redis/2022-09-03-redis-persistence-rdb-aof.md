---
title: "[Redis] Redis Persistence: RDB & AOF Explained"
date: 2022-09-03
description: "Redis의 영속성(Persistence) 구조와 RDB / AOF 저장 방식, 설정 및 운영 전략을 정리합니다."
categories: [Database, Redis]
tags: [redis, persistence, rdb, aof, backup]
---

# Redis Persistence (영속성 & 데이터 저장)

Redis는 인메모리 데이터 저장소로 매우 빠르지만, 메모리 기반이기 때문에 서버 재시작 시 데이터가 사라질 수 있습니다.  
이를 보완하기 위해 Redis는 **디스크에 데이터를 저장하는 영속성(Persistence)** 기능을 제공합니다. Redis는 두 가지 영속성 방식을 지원합니다.

1. **RDB (Snapshotting)**  
2. **AOF (Append Only File)**

---

## 🔎 Persistence 개념

Redis Persistence는 Redis 데이터를 **메모리뿐 아니라 디스크에도 저장**해 장애 시 데이터를 복원할 수 있도록 해줍니다.  
이 두 방식은 목적은 같지만 저장 방식과 복구 방식, 성능 특성이 다릅니다.

---

## 1️⃣ RDB (Snapshotting)

### 🧠 개념

RDB는 특정 시점의 Redis 메모리 데이터를 **스냅샷 형태로 디스크에 저장**하는 방식입니다.  
dump 파일(`dump.rdb`)로 저장되며 Redis 재시작 시 이 파일을 다시 읽어 데이터 복구를 수행합니다.

---

### 🧩 RDB 저장 시점: SAVE vs BGSAVE

Redis는 두 가지 스냅샷 저장 방법을 제공합니다.

| 명령 | 영향 |
|------|------|
| `SAVE` | Redis 프로세스를 잠시 멈추고 즉시 스냅샷을 생성 (blocking) |
| `BGSAVE` | 자식 프로세스를 fork하여 백그라운드에서 저장 (non‑blocking) |

- `SAVE`: 동기식으로 데이터 저장 → 서비스 중단 위험  
- `BGSAVE`: fork 기반 비동기 저장 → 서비스 중단 없이 백업 가능

RDB는 기본적으로 **BGSAVE 방식**을 사용합니다.

---

### 🧠 설정 예시

`redis.conf` 파일 예:

```text
save 900 1      # 900초 동안 1회 이상 변경되면 저장
save 300 10     # 300초 동안 10회 이상 변경되면 저장
save 60 10000   # 60초 동안 10000회 이상 변경되면 저장
```

추가 설정:

```text
dbfilename dump.rdb
dir /var/lib/redis
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
```

---

### 📊 장단점

| 항목    | 장점    | 단점                 |
| ----- | ----- | ------------------ |
| 파일 크기 | 작음    | 중간 주기 사이 데이터 손실 가능 |
| 복구 속도 | 빠름    | fork 비용 발생         |
| 운영 특성 | 빠른 백업 | 빈번 저장시 성능 영향       |

---

## 2️⃣ AOF (Append Only File)

### 🧠 개념

AOF는 모든 쓰기(write) 명령을 **순차적으로 기록**하는 방식입니다.
Redis는 저장된 로그를 재실행하여 데이터를 복구합니다.

### 📌 설정 예시

`redis.conf` 예:

```text
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

---

## 📌 AOF 세부 옵션

| 옵션                            | 설명                                      |
| ----------------------------- | --------------------------------------- |
| `appendfsync`                 | 로그 동기화 타이밍 (`always`, `everysec`, `no`) |
| `no-appendfsync-on-rewrite`   | rewrite중 fsync 중단 여부                    |
| `auto-aof-rewrite-percentage` | 자동 rewrite 비율                           |
| `auto-aof-rewrite-min-size`   | 자동 rewrite 최소 파일 크기                     |
| `aof-load-truncated`          | 손상시 기록 잘라쓰기 옵션                          |
| `aof-use-rdb-preamble`        | RDB 프리앰블 포함 여부                          |
| `aof-timestamp-enabled`       | 타임스탬프 기록 여부                             |

이런 옵션들은 **AOF 동작 및 성능/안정성 균형**을 조정하는 데 유용합니다.

---

### 📊 AOF 특징

| 항목      | 내용 |
| ------- | -- |
| 파일 크기   | 큼  |
| 복구 속도   | 느림 |
| 데이터 무결성 | 높음 |

---

## RDB vs AOF 비교

| 항목     | RDB      | AOF        |
| ------ | -------- | ---------- |
| 저장 방식  | Snapshot | 모든 쓰기 로그   |
| 데이터 안전 | 보통       | 매우 높음      |
| 파일 크기  | 작음       | 큼          |
| 복구 속도  | 빠름       | 느림         |
| 운영 상황  | 주기 백업    | 데이터 무결성 우선 |

---

## 실무 운영 전략

* **Cache 용도**: 영속성 비활성화 가능
* **주기 백업**: RDB 설정을 통해 스냅샷 저장
* **데이터 무결성 우선**: AOF 기록 활성화
* **균형 전략**: RDB + AOF 동시 활성화

> RDB는 빠른 복구를, AOF는 적은 데이터 유실을 보장합니다. 두 방식을 병행하면 운영 안정성을 높일 수 있습니다.

---

## 정리

Redis Persistence는 데이터 안정성과 운영 목적에 따라 선택합니다.

* 🧠 **RDB**: Snapshot 기반으로 빠른 복구, 작은 파일
* 📜 **AOF**: 모든 쓰기 로그 기록, 데이터 무결성 우수
* 🔄 **혼합**: 두 방식 장점을 조합한 운영 전략

---
