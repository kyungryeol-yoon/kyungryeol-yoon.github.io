---
title: "[Kubernetes] Deploy Redis Insight"
date: 2025-02-14
categories: [Database, Redis]
tags: [kubernetes, redis, ui]
---

## Redis Insight 배포

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redisinsight #deployment name
  labels:
    app: redisinsight #deployment label
spec:
  replicas: 1 #a single replica pod
  selector:
    matchLabels:
      app: redisinsight #which pods is the deployment managing, as defined by the pod template
  template: #pod template
    metadata:
      labels:
        app: redisinsight #label for pod/s
    spec:
      containers:
      - name:  redisinsight #Container name (DNS_LABEL, unique)
        image: redis/redisinsight:latest #repo/image
        imagePullPolicy: IfNotPresent #Installs the latest Redis Insight version
        volumeMounts:
        - name: redisinsight #Pod volumes to mount into the container's filesystem. Cannot be updated.
          mountPath: /data
        ports:
        - containerPort: 5540 #exposed container port and protocol
          protocol: TCP
      volumes:
      - name: redisinsight
        emptyDir: {} # node-ephemeral volume https://kubernetes.io/docs/concepts/storage/volumes/#emptydir
```

> Redis Insight 설치 참고
- <https://redis.io/docs/latest/operate/redisinsight/install/install-on-k8s>
{: .prompt-info }

> Redis Insight Configuration Settings 참고
- <https://redis.io/docs/latest/operate/redisinsight/configuration>
{: .prompt-info }