---
title: "[Redis] 영속화와 백업 전략 — RDB & AOF 완벽 정리"
date: 2023-04-03
tags: [redis, persistence, rdb, aof, backup, database]
description: "Redis 인메모리 데이터를 디스크에 보존하는 두 가지 영속화 방식 RDB(스냅샷)와 AOF(쓰기 로그)의 개념·설정·장단점을 비교하고, Redis 7 하이브리드 등 실무 백업·운영 전략을 정리합니다."
---

Redis는 인메모리 저장소라 매우 빠르지만, 서버 재시작·장애 시 메모리 데이터가 사라집니다. 이를 보완하는 것이 **영속화(Persistence)** 입니다. 이 글에서는 두 방식인 **RDB(스냅샷)** 와 **AOF(쓰기 로그)** 의 개념·설정·장단점을 비교하고, **Redis 7 하이브리드** 등 실무 운영 전략까지 정리합니다.

## 📌 왜 영속화가 필요한가?

Redis는 기본적으로 데이터를 메모리에 둡니다. 즉 프로세스 종료·서버 재부팅 시 **데이터가 사라집니다.** 이를 막기 위해 디스크에 저장하는 두 가지 방식을 제공합니다.

1. **RDB (Snapshotting)** — 특정 시점 스냅샷
2. **AOF (Append Only File)** — 모든 쓰기 명령 로그

---

## 1️⃣ RDB (Snapshotting)

### 개념

특정 시점의 메모리 데이터를 **스냅샷으로 디스크에 저장**합니다. `dump.rdb` 파일로 저장되고, 재시작 시 이 파일을 읽어 복구합니다.

### SAVE vs BGSAVE

| 명령 | 동작 |
|---|---|
| `SAVE` | 프로세스를 멈추고 즉시 저장 (blocking — 서비스 중단 위험) |
| `BGSAVE` | 자식 프로세스를 fork해 백그라운드 저장 (non-blocking) |

Redis는 기본적으로 **BGSAVE** 방식을 사용합니다.

### 설정 예시 (`redis.conf`)

```text
save 900 1      # 900초 동안 1회 이상 변경되면 저장
save 300 10     # 300초 동안 10회 이상 변경되면 저장
save 60 10000   # 60초 동안 10000회 이상 변경되면 저장

dbfilename dump.rdb
dir /var/lib/redis
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
```

> 💡 여러 `save` 조건은 **하나라도 만족하면** 스냅샷이 실행됩니다.

### 장단점

| 항목 | 장점 | 단점 |
|---|---|---|
| 파일 크기 | 작음 | 스냅샷 사이 데이터 유실 가능 |
| 복구 속도 | 빠름 | fork 비용 발생 |
| 운영 특성 | 빠른 백업 | 빈번 저장 시 성능 영향 |

---

## 2️⃣ AOF (Append Only File)

### 개념

모든 쓰기 명령(SET, DEL 등)을 **순차적으로 로그에 기록**합니다. 재시작 시 로그를 재실행해 복구하며, 텍스트 형식이라 사람이 읽을 수도 있습니다.

### 설정 예시 (`redis.conf`)

```text
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

### 주요 옵션

| 옵션 | 설명 |
|---|---|
| `appendfsync` | 로그 동기화 타이밍 (`always` / `everysec` / `no`) |
| `no-appendfsync-on-rewrite` | rewrite 중 fsync 중단 여부 |
| `auto-aof-rewrite-percentage` | 자동 rewrite 트리거 비율 |
| `auto-aof-rewrite-min-size` | 자동 rewrite 최소 파일 크기 |
| `aof-load-truncated` | 손상 시 잘린 부분까지만 로드 |
| `aof-use-rdb-preamble` | AOF에 RDB 프리앰블 포함(하이브리드) |
| `aof-timestamp-enabled` | 타임스탬프 기록 여부 |

> 💡 `appendfsync everysec`(기본 권장)은 백그라운드 스레드가 1초마다 fsync합니다. 성능을 유지하면서 **최악의 경우 데이터 손실은 1초** 수준입니다.

### AOF Rewrite (압축)

AOF는 계속 쌓여 커지므로, **Rewrite**로 불필요한 명령을 정리합니다. 예를 들어 같은 키에 `SET`이 100번 실행됐다면 **마지막 값만 남겨** 파일을 최적화합니다.

### 장단점

| 항목 | 내용 |
|---|---|
| 파일 크기 | 큼 |
| 복구 속도 | 느림(로그 재실행) |
| 데이터 무결성 | 높음 |

---

## 🆚 RDB vs AOF 비교

| 항목 | RDB | AOF |
|---|---|---|
| 저장 방식 | 스냅샷 시점 저장 | 모든 쓰기 명령 로그 |
| 복구 시점 | 가장 최근 스냅샷 | 전체 로그 재실행 |
| 파일 크기 | 작음 | 큼 |
| 복구 속도 | 빠름 | 느림 |
| 데이터 완전성 | 일부 유실 가능 | 대부분 보장 |
| 운영 상황 | 주기 백업 | 데이터 무결성 우선 |

---

## 🔄 Redis 7 하이브리드 (RDB + AOF)

Redis 7.0부터 AOF는 **multi-part** 구조로 바뀌었습니다. AOF rewrite 시 부모 프로세스는 새 **증분(incremental) AOF**에 계속 쓰고, 자식 프로세스가 **기준(base) AOF**(RDB 형식)를 생성한 뒤, 매니페스트 파일로 원자적 교체를 수행합니다.

대부분의 프로덕션에서는 **RDB + AOF 하이브리드 + `appendfsync everysec`** 조합이 권장됩니다.

- RDB 스냅샷으로 **빠른 재시작**
- AOF로 **최대 1초 손실** 수준의 무결성

---

## 🧩 실습 예시 (Docker)

```bash
# RDB 기반 — redis.conf의 save 조건으로 스냅샷
docker run \
  -v $(pwd)/redis.conf:/redis.conf \
  --name redis-rdb \
  redis redis-server /redis.conf
```

AOF는 `redis.conf`에 `appendonly yes`를 켠 뒤 같은 방식으로 실행하면 됩니다.

---

## 🤔 운영 전략

- **순수 캐시 용도** → 영속화 비활성화 가능(속도 우선)
- **주기 백업** → RDB 스냅샷
- **데이터 무결성 우선** → AOF 활성화
- **균형(권장)** → RDB + AOF 동시 활성화

---

## ❓ 자주 묻는 질문

**Q. RDB와 AOF 중 무엇을 켜야 하나요?**
프로덕션이라면 **둘 다(하이브리드)** 가 기본입니다. RDB로 빠른 복구, AOF로 유실 최소화를 동시에 얻습니다.

**Q. `appendfsync always`가 더 안전한데 왜 `everysec`을 권장하나요?**
`always`는 매 쓰기마다 fsync라 가장 안전하지만 처리량이 크게 떨어집니다. `everysec`은 성능과 안전(최대 1초 손실)의 균형점입니다.

**Q. AOF 파일이 너무 커집니다.**
`auto-aof-rewrite-*` 설정으로 자동 Rewrite를 켜 두면 주기적으로 압축됩니다.

---

## 📚 참고

- [Redis persistence — Redis Docs](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
- [Redis Persistence: RDB vs AOF Configuration and Recovery — Redis](https://redis.io/tutorials/operate/redis-at-scale/persistence-and-durability/)
- [How to Choose Between RDB and AOF Persistence in Redis — OneUptime](https://oneuptime.com/blog/post/2026-01-27-rdb-vs-aof-persistence-redis/view)
