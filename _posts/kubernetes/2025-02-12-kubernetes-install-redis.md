---
title: "[Kubernetes] Install Redis"
date: 2025-02-12
categories: [Kubernetes, Redis]
tags: [Kubernetes, Redis]
---


## ConfigMap 설정정

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: redis-configmap
  namespace: redis
data:
  acl.conf: |
    user default on nopass ~* +@all
    user admin on >password ~* +@all

    또는 

    user default on >password allkeys +@read
```