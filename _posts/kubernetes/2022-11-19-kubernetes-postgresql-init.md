---
title: "K8S PostgreSQL initdb 설정"
date: 2022-11-19
categories: [Kubernetes, PostgreSQL]
tags: [Kubernetes, PostgreSQL]
---

- PV 또는 PVC 설정이 되어 있지 않았을 때
- PV 또는 PVC 실수로 지웠을 때
- 환경이 동일하고 같은 테이블을 사용하는 db를 재사용할 때

postgresql pod가 생성될 때 최초로 아래와 같은 기본 테이블 세팅 설정

### ConfigMap yaml
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: postgresql-initdb-config
data:
  init.sql: |
    CREATE TABLE IF NOT EXISTS customers (
        customer_id bpchar NOT NULL,
        company_name character varying(40) NOT NULL,
        contact_name character varying(30),
        contact_title character varying(30),
        address character varying(60),
        city character varying(15),
        region character varying(15),
        postal_code character varying(10),
        country character varying(15),
        phone character varying(24),
        fax character varying(24)
    );

 INSERT INTO customers VALUES ('Chris', 'company_name', 'contact_name', 'contact_title', 'address', 'city_name', region_name, 'postal_code', 'Korea', 'phone-number', 'fax-number');
```

### PV yaml
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgresql-claim0
  labels:
    type: local
spec:
  storageClassName: manual
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/Users/docker/postgres/docker-pg-vol/data"
```

### PVC yaml
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgresql-claim0
  labels:
    app: postgresql
    tier: database
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 100Mi
```

### Deployment yaml
```yaml
kind: Deployment
metadata:
  name: postgresql
  labels:
    app: postgresql
    tier: database
spec:
  selector:
    matchLabels:
      app: postgresql
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: postgresql
        tier: database
    spec:
      containers:
        - name: postgresql
          image: postgres:12
          imagePullPolicy: "IfNotPresent"
          env:
            - name: POSTGRES_DB
              value: db_name
            - name: POSTGRES_USER
              value: postgres
            - name: POSTGRES_PASSWORD
              value: setting_password
          ports:
            - containerPort: 5432
              name: postgresql
          volumeMounts:
            - name: postgresql-claim0
              mountPath: /var/lib/postgresql/data

            - mountPath: /docker-entrypoint-initdb.d
              name: postgresql-initdb
      volumes:
        - name: postgresql-claim0
          persistentVolumeClaim:
            claimName: postgresql-claim0

        - name: postgresql-initdb
          configMap:
            name: postgresql-initdb-config
```