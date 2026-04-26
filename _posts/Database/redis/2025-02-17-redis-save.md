---
title: "[Redis] Save"
date: 2025-02-17
categories: [Database, Redis]
tags: [redis, save, message broker]
---

- Redis는 기본적으로 메모리 기반 저장소이지만, 데이터를 디스크에 저장하기 위해 `RDB` 또는 `AOF` 모드를 사용할 수 있다.
- 이를 설정 파일에서 조정하거나, `redis-cli` 명령어를 통해 실시간으로 변경할 수 있다.

## Redis 접속

```bash
kubectl get pods -l app=redis  # redis라는 label을 가진 Pod 확인
```

- Redis Pod에 접속

```bash
kubectl exec -it <redis-pod-name> -- redis-cli
```

## Redis 저장 방식 변경

- Redis는 기본적으로 두 가지 방식으로 데이터를 디스크에 저장할 수 있다: **RDB (Redis Database) snapshotting**과 **AOF (Append-Only File).**

### RDB (Redis Database snapshotting) 방식 변경

- RDB는 특정 시간 간격으로 데이터를 디스크에 덤프하여 저장하는 방식이다. Redis 설정에서 `save` 옵션을 사용하여 RDB 덤프 간격을 설정할 수 있다.

- 현재 `save` 설정을 확인하려면 `redis-cli`에서 다음 명령을 입력한다.

```bash
CONFIG GET save
```

- RDB 설정을 변경하려면 `CONFIG SET` 명령어를 사용하여 덤프 주기를 설정할 수 있다. 예를 들어, 60초마다 1000개의 키가 변경되면 덤프를 생성하도록 설정하려면 아래와 같이 실행한다.

```bash
CONFIG SET save "60 1000"
```

- 이 설정은 **60초 동안 1000개의 키가 변경되면 RDB 파일을 덤프**하도록 지정한다. 이 설정은 Redis가 동작하는 동안 지속되지 않으므로, 영구적인 변경을 원한다면 `redis.conf` 파일에서 이 값을 설정해야 한다.

### AOF (Append-Only File) 방식 변경

- AOF는 모든 쓰기 명령을 로그 파일에 순차적으로 기록하여 데이터 손실을 방지하는 방식이다. `appendonly` 옵션을 사용하여 AOF를 활성화하거나 비활성화할 수 있다.

- 현재 AOF 설정을 확인하려면 `redis-cli`에서 다음 명령을 입력한다.

```bash
CONFIG GET appendonly
```

- AOF를 활성화하려면 다음 명령을 입력한다.

```bash
CONFIG SET appendonly yes
```

- AOF의 동작 방식을 조정하려면 `appendfsync` 설정을 사용할 수 있다. 예를 들어, AOF 동기화를 `always`로 설정하면, Redis는 각 쓰기 연산 후에 즉시 파일을 디스크에 동기화한다.

```bash
CONFIG SET appendfsync always
```

- AOF는 성능에 영향을 미칠 수 있으므로, 이를 사용하되 주기적인 백업과 모니터링이 필요하다.

### 변경 사항 확인

- 저장 방식을 변경한 후, 설정이 적용되었는지 다시 확인할 수 있다.

```bash
CONFIG GET save
CONFIG GET appendonly
```

### 영구적인 설정 변경

- `CONFIG SET` 명령어는 Redis가 종료되고 재시작되면 설정이 초기화된다. 따라서 영구적인 변경을 원한다면 Redis 설정 파일인 `redis.conf`에서 해당 값을 수정해야 한다.

- Redis의 설정 파일 (`redis.conf`)을 Kubernetes 설정에 맞게 수정한 후, 해당 파일을 Pod에 반영하거나, Redis가 사용하는 ConfigMap을 업데이트해야 한다.

```bash
kubectl edit configmap redis-config
```

- 위 명령을 사용하여 ConfigMap을 수정하고, 그에 맞는 변경을 Redis Pod에 적용한다. Pod가 재시작되면 새로운 설정이 반영된다.

### 변경 후 Redis 재시작

- 변경 사항을 적용하려면 Redis Pod를 재시작해야 할 수 있다. Redis Pod를 재시작하려면 다음 명령어를 사용할 수 있다.

```bash
kubectl rollout restart deployment redis
```