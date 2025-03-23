---
title: "[Kubernetes] metrics-server"
date: 2021-11-21
categories: [Kubernetes, Tool]
tags: [kubernetes, metrics-server]
---

- Kubernetes의 Metrics-Server는 각 Node에 설치된 kubelet을 통해서 node 및 pod의 CPU, Memory 의 사용량 Metric을 수집

- node 리소스 사용량 확인

  ```bash
  kubectl top node
  NAME          CPU(cores)   CPU(%)   MEMORY(bytes)   MEMORY(%)
  mp-master     180m         2%       1593Mi          20%
  mp-worker-1   115m         1%       2409Mi          30%
  mp-worker-2   79m          0%       786Mi           10%
  ```

- pod 리소스 사용량 확인

  ```bash
  kubectl top po -A
  NAMESPACE     NAME                                         CPU(cores)   MEMORY(bytes)
  alloy         alloy-5ms5k                                  4m           49Mi
  alloy         alloy-7q8fc                                  4m           49Mi
  alloy         alloy-mcswx                                  4m           49Mi
  grafana       grafana-55cdd669f-rmwmr                      12m          80Mi
  kafka         kafbat-ui-kafka-ui-6fd44cc8fc-ksq8w          2m           426Mi
  kafka         my-cluster-dual-role-0                       17m          886Mi
  kafka         my-cluster-entity-operator-6f988ccdb-cwwq7   4m           434Mi
  kafka         strimzi-cluster-operator-74f9cd5689-x6sjp    29m          275Mi
  kube-system   calico-kube-controllers-658d97c59c-h5c5t     2m           22Mi
  kube-system   calico-node-85fsz                            26m          104Mi
  kube-system   calico-node-sz2q8                            22m          104Mi
  kube-system   calico-node-wttp9                            24m          104Mi
  kube-system   coredns-76f75df574-hnhwx                     2m           18Mi
  kube-system   coredns-76f75df574-pfvts                     2m           17Mi
  kube-system   etcd-mp-master                               32m          55Mi
  kube-system   kube-apiserver-mp-master                     53m          329Mi
  kube-system   kube-controller-manager-mp-master            17m          53Mi
  kube-system   kube-proxy-64pst                             1m           22Mi
  kube-system   kube-proxy-bnfnp                             1m           22Mi
  kube-system   kube-proxy-h79m7                             1m           22Mi
  kube-system   kube-scheduler-mp-master                     3m           22Mi
  kube-system   metrics-server-596474b58-bjhf8               4m           23Mi
  mgmt-system   gitlab-runner-56c8f85494-4hhz4               11m          78Mi
  ```

> Install metrics-server 참고
- <https://github.com/kubernetes-sigs/metrics-server>
{: .prompt-info }

## Metrics-Server 설치

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### Metrics-server 설치 중 오류

#### Readiness probe failed: HTTP probe failed with statuscode: 500

- 아래와 같이 상태가 0/1이고, `Readiness probe failed: HTTP probe failed with statuscode: 500`라는 Event가 발견

  ```bash
  Events:
    Type     Reason          Age                   From               Message
    ----     ------          ----                  ----               -------
    Normal   Scheduled       16m                   default-scheduler  Successfully assigned kube-system/metrics-server-75bf97fcc9-xhrnz to mp-worker-2
    Normal   Pulling         16m                   kubelet            Pulling image "registry.k8s.io/metrics-server/metrics-server:v0.7.2"
    Normal   Pulled          16m                   kubelet            Successfully pulled image "registry.k8s.io/metrics-server/metrics-server:v0.7.2" in 14.31s (14.31s including waiting)
    Normal   Created         16m                   kubelet            Created container: metrics-server
    Normal   Started         16m                   kubelet            Started container metrics-server
    Warning  Unhealthy       11m (x31 over 15m)    kubelet            Readiness probe failed: HTTP probe failed with statuscode: 500
    Normal   SandboxChanged  6m3s (x2 over 6m34s)  kubelet            Pod sandbox changed, it will be killed and re-created.
    Normal   Pulled          6m1s                  kubelet            Container image "registry.k8s.io/metrics-server/metrics-server:v0.7.2" already present on machine
    Normal   Created         6m                    kubelet            Created container: metrics-server
    Normal   Started         6m                    kubelet            Started container metrics-server
    Warning  Unhealthy       89s (x29 over 5m39s)  kubelet            Readiness probe failed: HTTP probe failed with statuscode: 500
  ```

- 설치된 metrics-server에서 아래와 같이 `--kubelet-insecure-tls`라는 Command를 추가

  ```bash
  kubectl edit deploy -n kube-system metrics-server 
  ```

  ```yaml
  ...✂...

      spec:
        containers:
        - args:
          - --cert-dir=/tmp
          - --secure-port=443
          - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname
          - --kubelet-use-node-status-port
          - --metric-resolution=15s
          - --kubelet-insecure-tls   << 추가

  ...✂...
  ```

#### Error from server (ServiceUnavailable): the server is currently unable to handle the request (get nodes.metrics.k8s.io)
 
- kubecetl top 명령어 오류

  ```bash
  kubectl top node

  Error from server (ServiceUnavailable): the server is currently unable to handle the request (get nodes.metrics.k8s.io)
  ```

- metrics-server를 수정해서 `spec.template.spec` 라인에 `hostNetwork: true` 를 추가

  ```bash
  kubectl edit deploy -n kube-system metrics-server 
  ```

  ```yaml
  dnsPolicy: ClusterFirst
  hostNetwork: true    << 추가
  nodeSelector:
    kubernetes.io/os: linux
  ```

## High Availability

- On Kubernetes v1.21+

  ```bash
  kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/high-availability-1.21+.yaml
  ```

- On Kubernetes v1.19-1.21

  ```bash
  kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/high-availability.yaml
  ```