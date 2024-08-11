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

### k6 resource 설정 관련

```
# k6-resource.yml

apiVersion: k6.io/v1alpha1
kind: TestRun
metadata:
  name: k6-sample
spec:
  parallelism: 4
  arguments: --out influxdb=http://influxdb:8086/k6
  arguments: -o xk6-influxdb=http://localhost:8086
  arguments: -o xk6-prometheus-rw --tag testid=test
  arguments: -o experimental-prometheus-rw    # prometheus : --enable-feature=remote-write-receiver
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

> [Stream real-time](https://grafana.com/docs/k6/latest/results-output/real-time/)
{: .prompt-info }

> [InfluxDB 설치 관련](https://kyungryeol-yoon.github.io/posts/kubernetes-install-influxdb/)
{: .prompt-info }

```Dockerfile/xk6-output-influxdb
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

```Dockerfile/xk6-output-prometheus-remote
# Build the k6 binary with the extension
FROM golang:1.18.1 as builder

RUN go install go.k6.io/xk6/cmd/xk6@latest
RUN xk6 build --output /k6 --with github.com/grafana/xk6-output-prometheus-remote@latest

# Use the operator's base image and override the k6 binary
FROM grafana/k6:latest
COPY --from=builder /k6 /usr/bin/k6
```

#### k6 resource 예시

```
apiVersion: k6.io/v1alpha1
kind: K6
metadata:
  name: k6-sample
spec:
  arguments: -o xk6-prometheus-rw --tag testid=test
  parallelism: 1
  runner:
    env:
    - name: K6_PROMETHEUS_RW_SERVER_URL
      value: http://kube-prometheus-stack-prometheus.monitoring:9090/api/v1/write
    - name: K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM
      value: "true"
    image: k6-prometheus:v1
  script:
    configMap:
      file: scritps.js
      name: test-script
```

### 테스트 JavaScript

#### Ex 1.
```
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '10s', target: 20 },
    { duration: '10s', target: 30 },
    { duration: '10s', target: 0 },
  ],
};

export default function () {
  http.get('http://test.k6.io');
  sleep(1);
}
```

#### Ex 2.
```
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  insecureSkipTLSVerify: true,
  stages: [
    { target: 200, duration: '30s' },
    { target: 0, duration: '30s' },
  ],
};

export default function () {
  const result = http.get('https://test-api.k6.io/public/crocodiles/');
  check(result, {
    'http response status code is 200': result.status === 200,
  });
}
```

### 테스트 JavaScript 적용
```
kubectl -n [namespace] create configmap test-script --from-file /home/documents/k6/scritps.js 
configmap/test-script created
```

> [K6 Load Test](https://kyungryeol-yoon.github.io/posts/k6-load-testing-tool/)
{: .prompt-info }