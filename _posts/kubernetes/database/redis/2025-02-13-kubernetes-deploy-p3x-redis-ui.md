---
title: "[Kubernetes] Deploy P3X Redis UI"
date: 2025-02-13
categories: [Kubernetes, Database]
tags: [Kubernetes, Redis, UI]
---

## P3X Redis UI 배포

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: p3x-redis-ui
  namespace: p3x-redis-ui
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: p3x-redis-ui
  template:
    metadata:
      labels:
        app.kubernetes.io/name: p3x-redis-ui
    spec:
      containers:
      - name: p3x-redis-ui
        image: patrikx3/p3x-redis-ui
        ports:
        - name: p3x-redis-ui
          containerPort: 7843
        volumeMounts:
        - name: p3x-redis-ui-settings
          mountPath: /settings/.p3xrs-conns.json
          subPath: .p3xrs-conns.json
      volumes:
      - name: p3x-redis-ui-settings
        configMap:
          name: p3x-redis-ui-settings
```

### ConfigMap 설정

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: p3x-redis-ui-settings
  namespace: p3x-redis-ui
data:
  .p3xrs-conns.json: |
    {
      "list": [
        {
          "name": "cluster",
          "host": "YOUR_REDIS_HOST",
          "port": 6379,
          "password": "YOUR_REDIS_PASSWORD_OR_EMPTY",
          "id": "unique"
        }
      ],
      "license": ""
    }
```