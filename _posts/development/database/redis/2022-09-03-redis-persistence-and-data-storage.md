---
title: "[Redis] Redis Persistence and Data Storage (RDB / AOF)"
date: 2022-09-03
description: "Redis의 영속성(Persistence) 구조와 RDB / AOF 저장 방식, 설정 및 운영 전략을 정리합니다."
categories: [Database, Redis]
tags: [redis, persistence, rdb, aof, backup]
---

# Redis Persistence (데이터 영구 저장)

Redis는 인메모리 기반 데이터 저장소입니다.
메모리만 사용하면 속도는 빠르지만 서버 재시작, 장애 등으로 데이터가 사라집니다.
이 문제를 보완하기 위해 Redis는 **디스크에 데이터를 저장하는 영속성 기능**을 제공합니다.

Redis에서 지원하는 영속성 방식은 **RDB (Snapshotting)** 과 **AOF (Append Only File)** 두 가지입니다.

---

## 🔎 영속성 개념

Redis는 기본적으로 메모리에 데이터를 저장합니다.
그러나 영속성 설정을 통해 **현재 메모리 상태를 디스크로 저장**함으로써, 서버가 꺼지거나 Redis가 재시작해도 데이터를 유지할 수 있습니다.

---

## 📌 1. RDB (Snapshotting) 방식

### 개념

RDB는 **일정 주기 또는 조건에 따라 메모리 스냅샷을 찍어 파일로 저장**하는 방식입니다.
이 스냅샷은 `dump.rdb` 파일로 저장됩니다.

---

### 동작 원리

Redis는 `redis.conf`에서 `save` 설정으로 스냅샷 저장 시점을 지정합니다.
예를 들어:

```text
save 900 1
save 300 10
save 60 10000
````

위 설정은 다음 조건 중 **하나라도 만족하면 스냅샷**을 생성합니다.

* 900초 동안 키 변경 1번
* 300초 동안 10번
* 60초 동안 10000번

---

### 특징

✔ 스냅샷 파일은 **작고 빠르게 로드** 가능
✔ 복구 시점이 정확한 시점 기반
❗ 설정 간격 사이의 데이터는 손실될 수 있음

---

### RDB 설정 예시

* `dbfilename dump.rdb` → 저장 파일명
* `dir /var/lib/redis` → 저장 위치
* `stop-writes-on-bgsave-error yes` → 저장 실패 시 쓰기 중단 여부

---

## 🧾 2. AOF (Append Only File) 방식

### 개념

AOF는 **모든 쓰기(write) 명령을 텍스트 로그로 기록**하는 방식입니다.
쓰기, 수정, 삭제 등의 명령이 실행될 때마다 로그에 남기고, Redis 재시작 시 이 로그를 순차적으로 실행하여 복구합니다.

---

### 동작 원리

* Redis가 쓰기 명령을 실행할 때 즉시 로그에 저장
* 서버가 종료되면 로그를 재실행하여 동일 상태 복원

---

### AOF 장·단점

✔ 로그이므로 **데이터 유실 최소화**
✔ 텍스트 로그이므로 필요 시 편집하여 복구 가능
❗ 로그 파일 크기 큼
❗ 재실행이 많을 경우 **복구 속도 느림**

---

### AOF 설정 예

```text
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

* `appendfsync everysec`: 1초마다 디스크 동기화(권장)
* `always`: 매 명령마다 동기화(안정성 높음, 성능 저하)
* `no`: OS 디스크 주기 따라 sync(데이터 유실 가능)

---

## 🧠 RDB vs AOF 비교

| 항목     | RDB      | AOF                    |
| ------ | -------- | ---------------------- |
| 저장 방식  | Snapshot | Write 로그               |
| 복구 안정성 | 중간       | 높음                     |
| 파일 크기  | 작음       | 큼                      |
| 복구 속도  | 빠름       | 느림                     |
| 유실 가능성 | 있음       | 거의 없음                |

---

## ⚙️ 실무 운영 전략

Redis가 단순 캐시 역할이라면 영속성 없이 사용하는 경우도 있습니다.
백업이 필요하면 **RDB로 주기적인 스냅샷**을 설정합니다.
데이터 유실을 극도로 줄이고 싶다면 **AOF를 활성화**합니다.
실제로는 두 방식을 **혼합 적용**하는 경우가 많습니다.

> 예: 주기 RDB 백업 + AOF 로그를 replay하여 최신 상태 복구

---

## 🏁 정리

Redis 영속성을 이해하면 다음을 판단할 수 있습니다.

* RDB: 스냅샷 기반, 빠른 복구
* AOF: 모든 쓰기 기록, 데이터 안전성 우수
* 혼합: 두 방식의 장점을 모두 활용

---

필요하면 이 글에 Redis 설정 예제, `redis.conf` 기본값 설명, 복구 시뮬레이션 예시까지 확장해 드릴 수 있어요 🚀

```

---
