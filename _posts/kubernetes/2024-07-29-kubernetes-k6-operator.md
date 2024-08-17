---
title: "[Kubernetes] K6-operator"
date: 2024-07-29
categories: [Kubernetes, K6]
tags: [Kubernetes, K6, Install, Helm]
---

> Helm 설치 및 설명, [참고](https://kyungryeol-yoon.github.io/posts/kubernetes-helm/)
{: .prompt-info }

## Install k6-operator
- Helm install
  ```shell
  helm repo add grafana https://grafana.github.io/helm-charts
  helm repo update
  helm install k6-operator grafana/k6-operator
  ```

> **설치 참고** : https://grafana.com/docs/k6/latest/set-up/set-up-distributed-k6/install-k6-operator/
{: .prompt-info }

## Customize Default Configuration
- values.yaml 수정
  > 최상위 values.yaml을 수정하면 하위 폴더 values.yaml을 override 한다.
  {: .prompt-info }

- Chart : https://github.com/grafana/k6-operator/tree/main/charts/k6-operator
- Release file (.tgz) : https://github.com/grafana/k6-operator/releases

### Install Customize Default Configuration
```shell
helm install [RELEASE NAME] [Chart.yaml 경로] -f [YAML 파일 또는 URL에 값 지정 (여러 개를 지정가능)] -n [NAMESPACE NAME]
```

```shell
helm install k6-operator grafana/k6-operator -f override-values.yaml -n [NAMESPACE NAME]
```

## k6 resource 설정 관련
- Resource yaml 작성
  ```yaml
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
    cleanup: 'post'   # configure the automatic deletion of all resources
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

- 적용
  ```shell
  kubectl apply -f /path/to/your/k6-resource.yml
  ```

- 삭제
  ```shell
  kubectl delete -f /path/to/your/k6-resource.yml
  ```

> [Run k6 사용법](https://grafana.com/docs/k6/latest/set-up/set-up-distributed-k6/usage/)
{: .prompt-info }

> [Stream real-time](https://grafana.com/docs/k6/latest/results-output/real-time/)
{: .prompt-info }

> [InfluxDB 설치 관련](https://kyungryeol-yoon.github.io/posts/kubernetes-install-influxdb/)
{: .prompt-info }

### Dockerfile Build with xk6-output-influxdb
```Dockerfile
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

### Dockerfile Build with xk6-output-prometheus-remote 
```Dockerfile
# Build the k6 binary with the extension
FROM golang:1.18.1 as builder

RUN go install go.k6.io/xk6/cmd/xk6@latest
RUN xk6 build --output /k6 --with github.com/grafana/xk6-output-prometheus-remote@latest

# Use the operator's base image and override the k6 binary
FROM grafana/k6:latest
COPY --from=builder /k6 /usr/bin/k6
```

### k6 resource 예시
```yaml
apiVersion: k6.io/v1alpha1
kind: K6
metadata:
  name: k6-sample
spec:
  arguments: -o xk6-prometheus-rw --tag testid=test
  parallelism: 1
  runner:
    image: <custom-image>
    env:
    - name: K6_PROMETHEUS_RW_SERVER_URL
      value: http://kube-prometheus-stack-prometheus.monitoring:9090/api/v1/write
    - name: K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM
      value: "true"
    image: k6-prometheus:v1
  starter:
    image: <custom-image>
  script:
    configMap:
      file: scritps.js
      name: test-script
```

## 테스트 JavaScript
### Ex 1.
```js
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

### Ex 2.
```js
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

## 테스트 JavaScript 적용
```shell
kubectl -n [NAMESPACE NAME] create configmap test-script --from-file /home/documents/k6/scritps.js 
configmap/test-script created
```

> 참고 : [K6 Load Test](https://kyungryeol-yoon.github.io/posts/k6-load-testing-tool/)
{: .prompt-info }

## Uninstall the Chart
```shell
helm uninstall [RELEASE NAME] -n [NAMESPACE NAME]
```