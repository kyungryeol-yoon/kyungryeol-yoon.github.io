---
title: "[Kubernetes] Redis Save"
date: 2025-02-17
categories: [Kubernetes, Redis]
tags: [Kubernetes, Redis]
---

Kubernetes(K8s)에서 Redis의 데이터 저장 방식을 변경하려면, Redis의 설정을 수정해야 합니다. Redis는 기본적으로 메모리 기반 저장소이지만, 데이터를 디스크에 저장하기 위해 `RDB` 또는 `AOF` 모드를 사용할 수 있습니다. 이를 설정 파일에서 조정하거나, `redis-cli` 명령어를 통해 실시간으로 변경할 수 있습니다.

아래는 `redis-cli`를 통해 Redis의 저장 방식을 변경하는 방법입니다.

1. Redis 접속
Kubernetes에서 Redis에 접속하려면 먼저 Redis Pod의 이름을 확인하고, `kubectl exec`를 사용하여 해당 Pod에 접속해야 합니다.

```bash
kubectl get pods -l app=redis  # redis라는 label을 가진 Pod 확인
```
Redis Pod에 접속합니다.

```bash
kubectl exec -it <redis-pod-name> -- redis-cli
```
`<redis-pod-name>`을 실제 Pod 이름으로 바꿔서 입력합니다. 이제 `redis-cli` 명령어를 통해 Redis에 접속할 수 있습니다.

2. Redis 저장 방식 변경
Redis는 기본적으로 두 가지 방식으로 데이터를 디스크에 저장할 수 있습니다: **RDB (Redis Database) snapshotting**과 **AOF (Append-Only File).**

1. RDB (Redis Database snapshotting) 방식 변경
RDB는 특정 시간 간격으로 데이터를 디스크에 덤프하여 저장하는 방식입니다. Redis 설정에서 `save` 옵션을 사용하여 RDB 덤프 간격을 설정할 수 있습니다.

현재 `save` 설정을 확인하려면 `redis-cli`에서 다음 명령을 입력합니다.

```bash
CONFIG GET save
```
RDB 설정을 변경하려면 `CONFIG SET` 명령어를 사용하여 덤프 주기를 설정할 수 있습니다. 예를 들어, 60초마다 1000개의 키가 변경되면 덤프를 생성하도록 설정하려면 아래와 같이 실행합니다:

```bash
CONFIG SET save "60 1000"
```
이 설정은 **60초 동안 1000개의 키가 변경되면 RDB 파일을 덤프**하도록 지정합니다. 이 설정은 Redis가 동작하는 동안 지속되지 않으므로, 영구적인 변경을 원한다면 `redis.conf` 파일에서 이 값을 설정해야 합니다.

2. AOF (Append-Only File) 방식 변경
AOF는 모든 쓰기 명령을 로그 파일에 순차적으로 기록하여 데이터 손실을 방지하는 방식입니다. `appendonly` 옵션을 사용하여 AOF를 활성화하거나 비활성화할 수 있습니다.

현재 AOF 설정을 확인하려면 `redis-cli`에서 다음 명령을 입력합니다:

```bash
CONFIG GET appendonly
```
AOF를 활성화하려면 다음 명령을 입력합니다:

```bash
CONFIG SET appendonly yes
```
AOF의 동작 방식을 조정하려면 `appendfsync` 설정을 사용할 수 있습니다. 예를 들어, AOF 동기화를 `always`로 설정하면, Redis는 각 쓰기 연산 후에 즉시 파일을 디스크에 동기화합니다.

```bash
CONFIG SET appendfsync always
```
AOF는 성능에 영향을 미칠 수 있으므로, 이를 사용하되 주기적인 백업과 모니터링이 필요합니다.

3. 변경 사항 확인
저장 방식을 변경한 후, 설정이 적용되었는지 다시 확인할 수 있습니다.

```bash
CONFIG GET save
CONFIG GET appendonly
```

4. 영구적인 설정 변경
`CONFIG SET` 명령어는 Redis가 종료되고 재시작되면 설정이 초기화됩니다. 따라서 영구적인 변경을 원한다면 Redis 설정 파일인 `redis.conf`에서 해당 값을 수정해야 합니다.

Redis의 설정 파일 (`redis.conf`)을 Kubernetes 설정에 맞게 수정한 후, 해당 파일을 Pod에 반영하거나, Redis가 사용하는 ConfigMap을 업데이트해야 합니다.

```bash
kubectl edit configmap redis-config
```
위 명령을 사용하여 ConfigMap을 수정하고, 그에 맞는 변경을 Redis Pod에 적용합니다. Pod가 재시작되면 새로운 설정이 반영됩니다.

5. 변경 후 Redis 재시작
변경 사항을 적용하려면 Redis Pod를 재시작해야 할 수 있습니다. Redis Pod를 재시작하려면 다음 명령어를 사용할 수 있습니다:

```bash
kubectl rollout restart deployment redis
```
이 명령은 Redis Deployment를 재시작하여 새로운 설정을 적용합니다.

결론
`redis-cli`를 사용하여 Redis의 저장 방식을 변경할 수 있습니다. `save`와 `appendonly` 설정을 통해 RDB와 AOF 방식의 저장을 제어할 수 있으며, 이러한 설정은 `CONFIG SET` 명령어를 통해 실시간으로 변경 가능합니다. 그러나, 영구적인 설정을 원한다면 `redis.conf` 파일을 수정하거나 ConfigMap을 업데이트해야 합니다.