---
title: "[Kubernetes] Deploy Redis(7.4.2)"
date: 2025-02-12
categories: [Database, Redis]
tags: [kubernetes, redis, message broker]
---

## Command를 통해 Redis ACL 설정하여 배포 + PVC 설정

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: redis-namespace
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
        - name: redis
          image: redis:latest
          ports:
            - containerPort: 6379
          command:
            - sh
            - '-c'
          args:
            - "nohup sh -c 'sleep 15 && redis-cli -a $REDIS_PASSWORD ACL SETUSER $REDIS_USERNAME on +@all ~* \\>$REDIS_PASSWORD' & redis-server --requirepass $REDIS_PASSWORD"
          env:
          - name: REDIS_USERNAME
            valueFrom:
              secretKeyRef:
                name: redis-credentials
                key: REDIS_USERNAME
          - name: REDIS_PASSWORD
            valueFrom:
              secretKeyRef:
                name: redis-credentials
                key: REDIS_PASSWORD
          volumeMounts:
            - name: redis-data
              mountPath: /data
      volumes:
        - name: redis-data
          persistentVolumeClaim:
            claimName: redis-pvc
```

### 데이터 보존을 위한 PVC 생성

#### Persistent Volume 생성

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: redis-pv
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /mnt/data/redis
```

#### Persistent Volume Claim 생성

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

### Secret 설정

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: redis-credentials
  namespace: redis-namespace
type: Opaque
data:
  # base64 인코딩된 값 (user와 password 값)
  REDIS_USERNAME: YWRtaW4=  # admin을 base64로 인코딩한 값
  REDIS_PASSWORD: MTIzNQ==  # 1235를 base64로 인코딩한 값
```

## Redis ACL 설정을 ConfigMap을 통해 Redis 배포

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: redis-namespace
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
        - name: redis
          image: redis:latest
          ports:
            - containerPort: 6379
          command:
            - "redis-server"
            - "--aclfile"
            - "/etc/redis/redis.acl"  # ACL 파일 경로 지정
          volumeMounts:
            - name: redis-acl-config
              mountPath: /etc/redis
              subPath: redis.acl
      volumes:
        - name: redis-acl-config
          configMap:
            name: redis-acl-config
```

### ConfigMap 설정

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: redis-acl-config
  namespace: redis-namespace
data:
  redis.acl: |
    # default 계정 No Password
    user default on nopass ~* +@all

    # admin 계정 Password 설정
    user admin on >password ~* +@all

    또는

    # 모든 key 읽기 권한만 부여
    user default on >password allkeys +@read

    또는

    # 관리자 계정
    user default on +@all

    # 사용자 계정 (readonly 권한)
    user myuser on >password +@read

    # 관리자 권한을 가진 사용자
    user admin on >adminpassword +@all
```


## ACL, Redis 설정 관련 ConfigMap을 통해 Command로 배포

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: redis-namespace
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
        - name: redis
          image: redis:latest
          ports:
            - containerPort: 6379
          command:
            - sh
            - '-c'
          args:
            - "nohup sh -c 'sleep 15 && redis-cli -a $REDIS_PASSWORD ACL SETUSER $REDIS_USERNAME on +@all ~* \\>$REDIS_PASSWORD' & redis-server /etc/redis/redis.conf --aclfile /etc/redis/redis.acl --requirepass $REDIS_PASSWORD"
          env:
          - name: REDIS_USERNAME
            valueFrom:
              secretKeyRef:
                name: redis-credentials
                key: REDIS_USERNAME
          - name: REDIS_PASSWORD
            valueFrom:
              secretKeyRef:
                name: redis-credentials
                key: REDIS_PASSWORD
          volumeMounts:
            - name: redis-data
              mountPath: /data
            - name: redis-acl-config
              mountPath: /etc/redis
              subPath: redis.acl
            - name: redis-config
              mountPath: /etc/redis
              subPath: redis.conf
      volumes:
        - name: redis-data
          persistentVolumeClaim:
            claimName: redis-pvc
        - name: redis-acl-config
          configMap:
            name: redis-acl-config
        - name: redis-config
          configMap:
            name: redis-config
```

### Redis ConfigMap 설정

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: redis-config
  namespace: redis-namespace
data:
  redis.conf: |
    # Redis의 기본 설정 예시
    save 900 1
    save 300 10
    save 60 10000

    appendonly yes
    appendfsync everysec

    # 아래와 같이 ACL 파일 경로 설정하지 않는다면 command에서 실행
    aclfile /etc/redis/redis.acl
```

### Redis ACL ConfigMap 설정

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: redis-acl-config
  namespace: redis-namespace
data:
  redis.acl: |
    # default 계정 No Password
    user default on nopass ~* +@all

    # admin 계정 Password 설정
    user admin on >password ~* +@all

    또는

    # 모든 key 읽기 권한만 부여
    user default on >password allkeys +@read

    또는

    # 관리자 계정
    user default on +@all

    # 사용자 계정 (readonly 권한)
    user myuser on >password +@read

    # 관리자 권한을 가진 사용자
    user admin on >adminpassword +@all
```