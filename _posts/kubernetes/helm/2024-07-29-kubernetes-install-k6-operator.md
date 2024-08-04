---
title: "[Kubernetes] Install K6-operator"
date: 2024-07-29
categories: [Kubernetes, K6]
tags: [Kubernetes, K6, Install]
---

## Install k6-operator

```
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
helm install k6-operator grafana/k6-operator
```

```
helm install k6-operator grafana/k6-operator -f values.yaml
```


```
# k6-resource.yml

apiVersion: k6.io/v1alpha1
kind: TestRun
metadata:
  name: k6-sample
spec:
  parallelism: 4
  script:
    configMap:
      name: k6-test
      file: test.js
  separate: false
  runner:
    image: <custom-image>
    metadata:
      labels:
        cool-label: foo
      annotations:
        cool-annotation: bar
    securityContext:
      runAsUser: 1000
      runAsGroup: 1000
      runAsNonRoot: true
    resources:
      limits:
        cpu: 200m
        memory: 1000Mi
      requests:
        cpu: 100m
        memory: 500Mi
  starter:
    image: <custom-image>
    metadata:
      labels:
        cool-label: foo
      annotations:
        cool-annotation: bar
    securityContext:
      runAsUser: 2000
      runAsGroup: 2000
      runAsNonRoot: true
```


```
# Build the k6 binary with the extension
FROM golang:1.20 as builder

RUN go install go.k6.io/xk6/cmd/xk6@latest
# For our example, we'll add support for output of test metrics to InfluxDB v2.
# Feel free to add other extensions using the '--with ...'.
RUN xk6 build \
    --with github.com/grafana/xk6-output-influxdb@latest \
    --output /k6

# Use the operator's base image and override the k6 binary
FROM grafana/k6:latest
COPY --from=builder /k6 /usr/bin/k6
```