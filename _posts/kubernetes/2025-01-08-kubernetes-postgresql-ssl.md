---
title: "[Kubernetes] PostgreSQL SSL Mode 설정"
date: 2025-01-08
categories: [Kubernetes, PostgreSQL]
tags: [Kubernetes, PostgreSQL, SSL]
---

- Kubernetes에서 PostgreSQL의 `pg_hba.conf` 파일에서 SSL 모드를 활성화하려면 다음 단계에 따라 설정할 수 있습니다.

## SSL 인증서 준비

- SSL 모드를 활성화하려면 PostgreSQL 서버와 클라이언트가 인증서와 개인 키를 설정해야 합니다. 보통 다음 파일들이 필요합니다:

- `server.crt`: 서버 인증서
- `server.key`: 서버의 개인 키
- `root.crt`: 클라이언트가 신뢰하는 CA 인증서 (optional, 클라이언트 검증용)

- 인증서 파일을 Kubernetes 비밀(Secret)로 관리하는 것이 일반적입니다.

## PostgreSQL Docker 이미지에서 SSL 설정하기

- PostgreSQL의 Docker 이미지를 사용하고 있다면, `postgresql.conf` 파일과 `pg_hba.conf` 파일을 수정하여 SSL을 활성화할 수 있습니다.

- `postgresql.conf`에서 SSL 활성화:

- `ssl = on`
- `ssl_cert_file = '/path/to/server.crt'`
- `ssl_key_file = '/path/to/server.key'`
- `ssl_ca_file = '/path/to/root.crt'` (옵션)

## pg_hba.conf 파일에서 SSL 모드 설정

- `pg_hba.conf` 파일에서 SSL 모드를 활성화하려면, `hostssl` 키워드를 사용하여 SSL 연결만 허용하도록 설정할 수 있습니다.

```sql
# TYPE  DATABASE        USER            ADDRESS                 METHOD
hostssl  all             all             0.0.0.0/0               md5
hostssl  all             all             ::/0                    md5
```

- 이 설정은 모든 IP에서 SSL 연결만 허용하고, `md5` 인증 방법을 사용하도록 설정합니다.

## Kubernetes에서 설정 적용하기

- Kubernetes에서 PostgreSQL Pod의 설정을 수정하려면, `ConfigMap` 또는 `Secret`을 사용하여 `pg_hba.conf`와 SSL 인증서 파일을 제공해야 합니다.

### ConfigMap 또는 Secret을 사용하여 `pg_hba.conf` 수정

- Kubernetes ConfigMap 또는 Secret을 생성하여 `pg_hba.conf`와 `postgresql.conf`를 제공할 수 있습니다.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: postgresql-config
data:
  pg_hba.conf: |
    # TYPE  DATABASE        USER            ADDRESS                 METHOD
    hostssl  all             all             0.0.0.0/0               md5
    hostssl  all             all             ::/0                    md5
  postgresql.conf: |
    ssl = on
    ssl_cert_file = '/etc/ssl/certs/server.crt'
    ssl_key_file = '/etc/ssl/private/server.key'
    ssl_ca_file = '/etc/ssl/certs/root.crt'
```

### Pod에 SSL 인증서 및 키 파일을 추가

- `server.crt`, `server.key`, `root.crt` 파일을 Kubernetes Secret으로 생성합니다.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgresql-ssl-secret
data:
  server.crt: <base64-encoded-certificate>
  server.key: <base64-encoded-private-key>
  root.crt: <base64-encoded-ca-certificate>
```

- 그런 다음 PostgreSQL Pod의 볼륨으로 Secret을 마운트하여 `postgresql.conf` 및 `pg_hba.conf`와 함께 사용할 수 있습니다.

## PostgreSQL Pod에 적용

- `pg_hba.conf`와 SSL 관련 파일들을 수정한 후, 해당 파일들을 컨테이너 내부에 마운트해야 합니다. PostgreSQL 컨테이너의 `postgresql.conf` 파일과 `pg_hba.conf` 파일을 수정한 후, 컨테이너를 재시작하여 변경 사항을 적용합니다.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgresql
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: postgresql
    spec:
      containers:
      - name: postgresql
        image: postgres:latest
        volumeMounts:
        - name: postgresql-config-volume
          mountPath: /etc/postgresql/postgresql.conf
          subPath: postgresql.conf
        - name: postgresql-ssl-secret
          mountPath: /etc/ssl/certs
        - name: postgresql-config-volume
          mountPath: /etc/pgsql/pg_hba.conf
          subPath: pg_hba.conf
      volumes:
      - name: postgresql-config-volume
        configMap:
          name: postgresql-config
      - name: postgresql-ssl-secret
        secret:
          secretName: postgresql-ssl-secret
```

## Pod 재시작

- 위 설정을 완료한 후, PostgreSQL Pod를 재시작하여 SSL 및 `pg_hba.conf` 설정이 적용되도록 합니다.

```bash
kubectl rollout restart deployment postgresql
```

- 이 과정을 통해 Kubernetes에서 PostgreSQL에 SSL을 활성화하고, `pg_hba.conf` 파일에 `hostssl` 설정을 추가하여 SSL 연결을 강제할 수 있습니다.

## `postgresql.conf` 파일에서 SSL 설정

- `postgresql.conf`에서 `ssl` 옵션을 활성화하고, **서버 인증서와 키를 지정하지 않으면, 클라이언트와의 SSL 연결을 사용하지만 서버 인증서 없이 연결할 수 있습니다.** `ssl_cert_file`과 `ssl_key_file`을 지정하지 않으면 기본적으로 서버는 인증서와 키가 없다는 상태로 연결을 받을 수 있습니다.

```plaintext
ssl = on
ssl_ca_file = '/path/to/root.crt'  # CA 인증서만 사용
```

- 이 설정은 클라이언트 측에서 SSL 연결을 시도할 때, 서버가 인증서를 요구하지 않지만, 클라이언트가 `root.crt` (CA 인증서)를 신뢰하는 경우에 SSL 연결을 할 수 있게 해줍니다.

## pg_hba.conf에서 SSL 연결 설정

- `pg_hba.conf` 파일에서 SSL 연결을 허용하려면 `hostssl`을 사용해야 합니다. `hostssl`은 SSL을 통해 연결되는 클라이언트를 허용합니다.

```plaintext
# TYPE  DATABASE        USER            ADDRESS                 METHOD
hostssl  all             all             0.0.0.0/0               md5
hostssl  all             all             ::/0                    md5
```

- 이 설정은 **모든 IP에서 SSL 연결만 허용**하고, 인증 방법은 **md5**를 사용하도록 설정됩니다.

## Kubernetes에서 설정 적용

- Kubernetes에서 SSL을 적용하려면, `ConfigMap` 또는 **Secret**을 사용하여 **pg_hba.conf**와 `postgresql.conf` 파일을 설정하고, **CA 인증서** 파일만 포함된 **Secret**을 마운트하여 사용할 수 있습니다.

### ConfigMap 및 Secret 생성

- 먼저, `postgresql.conf`와 `pg_hba.conf`를 Kubernetes `ConfigMap`에 저장합니다. 그리고, `root.crt` CA 인증서를 포함한 `Secret`을 생성합니다.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: postgresql-config
data:
  pg_hba.conf: |
    hostssl  all             all             0.0.0.0/0               md5
    hostssl  all             all             ::/0                    md5
  postgresql.conf: |
    ssl = on
    ssl_ca_file = '/etc/ssl/certs/root.crt'
```

- Secret 예시 (CA 인증서만 포함):

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgresql-ssl-secret
data:
  root.crt: <base64-encoded-ca-cert>
```

### Deployment 수정하여 볼륨 마운트

- PostgreSQL Pod에 `ConfigMap`과 `Secret`을 마운트하여 `pg_hba.conf`와 `postgresql.conf`를 업데이트합니다.

```yaml
코드 복사
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgresql
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: postgresql
    spec:
      containers:
      - name: postgresql
        image: postgres:latest
        volumeMounts:
        - name: postgresql-config-volume
          mountPath: /etc/postgresql/postgresql.conf
          subPath: postgresql.conf
        - name: postgresql-config-volume
          mountPath: /etc/pgsql/pg_hba.conf
          subPath: pg_hba.conf
        - name: postgresql-ssl-secret
          mountPath: /etc/ssl/certs
      volumes:
      - name: postgresql-config-volume
        configMap:
          name: postgresql-config
      - name: postgresql-ssl-secret
        secret:
          secretName: postgresql-ssl-secret
```

## Pod 재시작

- 설정을 완료한 후, PostgreSQL Pod를 재시작하여 새로운 설정을 적용합니다:

```bash
kubectl rollout restart deployment postgresql
```