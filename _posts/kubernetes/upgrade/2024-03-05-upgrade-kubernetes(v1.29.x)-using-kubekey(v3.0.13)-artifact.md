---
title: "[Kubernetes] Upgrade Kuberntes(v1.29.x) using Kubekey(v3.0.13) Artifact"
date: 2024-03-05
categories: [Kubernetes, Upgrade]
tags: [kubernetes, kubekey, artifact, upgrade]
---

## script 다운로드

```bash
curl -sfL https://get-kk.kubesphere.io | VERSION=v3.0.13 sh -
```

## artifact-3.0.13.yaml 작성

```yaml
apiVersion: kubekey.kubesphere.io/v1alpha2
kind: Manifest
metadata:
  name: artifact-v3.0.13
spec:
  arches:
  - amd64
  operatingSystems:
  - arch: amd64
    type: linux
    id: ubuntu
    version: "20.04"
    osImage: Ubuntu 20.04.4 LTS
    repository:
      iso:
        localPath: ""
        url: "https://github.com/kubesphere/kubekey/releases/download/v3.0.13/ubuntu-20.04-debs-amd64.iso"
  kubernetesDistributions:
  - type: kubernetes
    version: v1.26.5
  components:
    helm:
      version: v3.9.0
    cni:
      version: v1.2.0
    etcd:
      version: v3.4.13
    calicoctl:
      version: v3.26.1
    ## For now, if your cluster container runtime is containerd, KubeKey will add a docker 20.10.8 container runtime in the below list.
    ## The reason is KubeKey creates a cluster with containerd by installing a docker first and making kubelet connect the socket file of containerd which docker contained.
    containerRuntimes:
    - type: docker
      version: 20.10.8
    - type: containerd
      version: 1.6.4
    crictl:
      version: v1.24.0
    docker-registry:
      version: "2"
    harbor:
      version: v2.5.3
    docker-compose:
      version: v2.2.2
  images:
  - docker.io/kubesphere/kube-apiserver:v1.27.2
  - docker.io/kubesphere/kube-apiserver:v1.26.5
  - docker.io/kubesphere/kube-controller-manager:v1.27.2
  - docker.io/kubesphere/kube-controller-manager:v1.26.5
  - docker.io/kubesphere/kube-scheduler:v1.27.2
  - docker.io/kubesphere/kube-scheduler:v1.26.5
  - docker.io/kubesphere/kube-proxy:v1.27.2
  - docker.io/kubesphere/kube-proxy:v1.26.5
  - docker.io/kubesphere/pause:3.8
  - docker.io/kubesphere/pause:3.7
  - docker.io/kubesphere/pause:3.6
  - docker.io/coredns/coredns:1.9.3
  - docker.io/coredns/coredns:1.8.6
  - docker.io/calico/cni:v3.26.1
  - docker.io/calico/cni:v3.23.2
  - docker.io/calico/kube-controllers:v3.26.1
  - docker.io/calico/kube-controllers:v3.23.2
  - docker.io/calico/node:v3.26.1
  - docker.io/calico/node:v3.23.2
  - docker.io/calico/pod2daemon-flexvol:v3.26.1
  - docker.io/calico/pod2daemon-flexvol:v3.23.2
  - docker.io/calico/typha:v3.26.1
  - docker.io/calico/typha:v3.23.2
  - docker.io/kubesphere/flannel:v0.12.0
  - docker.io/openebs/provisioner-localpv:3.3.0
  - docker.io/openebs/linux-utils:3.3.0
  - docker.io/library/haproxy:2.3
  - docker.io/kubesphere/nfs-subdir-external-provisioner:v4.0.2
  - docker.io/kubesphere/k8s-dns-node-cache:1.15.12
  # https://github.com/kubesphere/ks-installer/releases/download/v3.4.1/images-list.txt
  ##kubesphere-images
  - docker.io/kubesphere/ks-installer:v3.4.1
  - docker.io/kubesphere/ks-installer:v3.3.2
  - docker.io/kubesphere/ks-apiserver:v3.4.1
  - docker.io/kubesphere/ks-apiserver:v3.3.2
  - docker.io/kubesphere/ks-console:v3.4.1
  - docker.io/kubesphere/ks-console:v3.3.2
  - docker.io/kubesphere/ks-controller-manager:v3.4.1
  - docker.io/kubesphere/ks-controller-manager:v3.3.2
  - docker.io/kubesphere/kubectl:v1.22.0
  - docker.io/kubesphere/kubectl:v1.20.0
  - docker.io/kubesphere/kubefed:v0.8.1
  - docker.io/kubesphere/tower:v0.2.1
  - docker.io/kubesphere/tower:v0.2.0
  - docker.io/minio/minio:RELEASE.2019-08-07T01-59-21Z
  - docker.io/minio/mc:RELEASE.2019-08-07T23-14-43Z
  - docker.io/csiplugin/snapshot-controller:v4.0.0
  - docker.io/kubesphere/nginx-ingress-controller:v1.3.1
  - docker.io/kubesphere/nginx-ingress-controller:v1.1.0
  - docker.io/mirrorgooglecontainers/defaultbackend-amd64:1.4
  - docker.io/kubesphere/metrics-server:v0.4.2
  - docker.io/library/redis:5.0.14-alpine
  - docker.io/library/haproxy:2.0.25-alpine
  - docker.io/library/alpine:3.14
  - docker.io/osixia/openldap:1.3.0
  - docker.io/kubesphere/netshoot:v1.0
  ##kubeedge-images
  # - docker.io/kubeedge/cloudcore:v1.13.0
  # - docker.io/kubeedge/cloudcore:v1.9.2
  # - docker.io/kubesphere/iptables-manager:v1.13.0
  # - docker.io/kubeedge/iptables-manager:v1.9.2
  # - docker.io/kubesphere/edgeservice:v0.3.0
  # - docker.io/kubesphere/edgeservice:v0.2.0
  ##gatekeeper-images
  # - docker.io/openpolicyagent/gatekeeper:v3.5.2
  ##openpitrix-images
  # - docker.io/kubesphere/openpitrix-jobs:v3.3.2
  ##kubesphere-devops-images
  # - docker.io/kubesphere/devops-apiserver:ks-v3.4.1
  # - docker.io/kubesphere/devops-apiserver:ks-v3.3.2
  # - docker.io/kubesphere/devops-controller:ks-v3.4.1
  # - docker.io/kubesphere/devops-controller:ks-v3.3.2
  # - docker.io/kubesphere/devops-tools:ks-v3.4.1
  # - docker.io/kubesphere/devops-tools:ks-v3.3.2
  # - docker.io/kubesphere/ks-jenkins:v3.4.0-2.319.3-1
  # - docker.io/kubesphere/ks-jenkins:v3.3.0-2.319.1
  # - docker.io/jenkins/inbound-agent:4.10-2
  # - docker.io/kubesphere/builder-base:v3.2.2
  # - docker.io/kubesphere/builder-nodejs:v3.2.0
  # - docker.io/kubesphere/builder-maven:v3.2.1-jdk11
  # - docker.io/kubesphere/builder-maven:v3.2.0
  # - docker.io/kubesphere/builder-python:v3.2.0
  # - docker.io/kubesphere/builder-go:v3.2.2-1.18
  # - docker.io/kubesphere/builder-go:v3.2.2-1.17
  # - docker.io/kubesphere/builder-go:v3.2.2-1.16
  # - docker.io/kubesphere/builder-go:v3.2.0
  # - docker.io/kubesphere/builder-base:v3.2.2-podman
  # - docker.io/kubesphere/builder-nodejs:v3.2.0-podman
  # - docker.io/kubesphere/builder-maven:v3.2.1-jdk11-podman
  # - docker.io/kubesphere/builder-maven:v3.2.0-podman
  # - docker.io/kubesphere/builder-python:v3.2.0-podman
  # - docker.io/kubesphere/builder-go:v3.2.0-podman
  # - docker.io/kubesphere/builder-go:v3.2.2-1.18-podman
  # - docker.io/kubesphere/builder-go:v3.2.2-1.17-podman
  # - docker.io/kubesphere/builder-go:v3.2.2-1.16-podman
  # - docker.io/kubesphere/s2ioperator:v3.2.1
  # - docker.io/kubesphere/s2irun:v3.2.0
  # - docker.io/kubesphere/s2i-binary:v3.2.0
  # - docker.io/kubesphere/tomcat85-java11-centos7:v3.2.0
  # - docker.io/kubesphere/tomcat85-java11-runtime:v3.2.0
  # - docker.io/kubesphere/tomcat85-java8-centos7:v3.2.0
  # - docker.io/kubesphere/tomcat85-java8-runtime:v3.2.0
  # - docker.io/kubesphere/java-11-centos7:v3.2.0
  # - docker.io/kubesphere/java-11-runtime:v3.2.0
  # - docker.io/kubesphere/java-8-centos7:v3.2.0
  # - docker.io/kubesphere/java-8-runtime:v3.2.0
  # - docker.io/kubesphere/nodejs-8-centos7:v3.2.0
  # - docker.io/kubesphere/nodejs-6-centos7:v3.2.0
  # - docker.io/kubesphere/nodejs-4-centos7:v3.2.0
  # - docker.io/kubesphere/python-36-centos7:v3.2.0
  # - docker.io/kubesphere/python-35-centos7:v3.2.0
  # - docker.io/kubesphere/python-34-centos7:v3.2.0
  # - docker.io/kubesphere/python-27-centos7:v3.2.0
  # - quay.io/argoproj/argocd:v2.3.3
  # - quay.io/argoproj/argocd-applicationset:v0.4.1
  # - ghcr.io/dexidp/dex:v2.30.2
  # - docker.io/library/redis:6.2.6-alpine
  ##kubesphere-monitoring-images
  # - docker.io/jimmidyson/configmap-reload:v0.7.1
  # - docker.io/jimmidyson/configmap-reload:v0.5.0
  # - docker.io/prom/prometheus:v2.39.1
  # - docker.io/prom/prometheus:v2.34.0
  # - docker.io/kubesphere/prometheus-config-reloader:v0.55.1
  # - docker.io/kubesphere/prometheus-operator:v0.55.1
  # - docker.io/kubesphere/kube-rbac-proxy:v0.11.0
  # - docker.io/kubesphere/kube-state-metrics:v2.6.0
  # - docker.io/kubesphere/kube-state-metrics:v2.5.0
  # - docker.io/prom/node-exporter:v1.3.1
  # - docker.io/prom/alertmanager:v0.23.0
  # - docker.io/thanosio/thanos:v0.31.0
  # - docker.io/thanosio/thanos:v0.25.2
  # - docker.io/grafana/grafana:8.3.3
  # - docker.io/kubesphere/kube-rbac-proxy:v0.11.0
  # - docker.io/kubesphere/kube-rbac-proxy:v0.8.0
  # - docker.io/kubesphere/notification-manager-operator:v2.3.0
  # - docker.io/kubesphere/notification-manager-operator:v1.4.0
  # - docker.io/kubesphere/notification-manager:v2.3.0
  # - docker.io/kubesphere/notification-manager:v1.4.0
  # - docker.io/kubesphere/notification-tenant-sidecar:v3.2.0
  ##kubesphere-logging-images
  # - docker.io/kubesphere/elasticsearch-curator:v5.7.6
  # - docker.io/kubesphere/opensearch-curator:v0.0.5
  # - docker.io/kubesphere/elasticsearch-oss:6.8.22
  # - docker.io/opensearchproject/opensearch:2.6.0
  # - docker.io/opensearchproject/opensearch-dashboards:2.6.0
  # - docker.io/kubesphere/fluentbit-operator:v0.14.0
  # - docker.io/kubesphere/fluentbit-operator:v0.13.0
  # - docker.io/library/docker:19.03
  # - docker.io/kubesphere/fluent-bit:v1.9.4
  # - docker.io/kubesphere/fluent-bit:v1.8.11
  # - docker.io/kubesphere/log-sidecar-injector:v1.2.0
  # - docker.io/elastic/filebeat:6.7.0
  # - docker.io/kubesphere/kube-events-operator:v0.6.0
  # - docker.io/kubesphere/kube-events-operator:v0.4.0
  # - docker.io/kubesphere/kube-events-exporter:v0.6.0
  # - docker.io/kubesphere/kube-events-exporter:v0.4.0
  # - docker.io/kubesphere/kube-events-ruler:v0.6.0
  # - docker.io/kubesphere/kube-events-ruler:v0.4.0
  # - docker.io/kubesphere/kube-auditing-operator:v0.2.0
  # - docker.io/kubesphere/kube-auditing-webhook:v0.2.0
  ##istio-images
  # - docker.io/istio/pilot:1.14.6
  # - docker.io/istio/pilot:1.11.1
  # - docker.io/istio/proxyv2:1.14.6
  # - docker.io/istio/proxyv2:1.11.1
  # - docker.io/jaegertracing/jaeger-operator:1.29
  # - docker.io/jaegertracing/jaeger-operator:1.27
  # - docker.io/jaegertracing/jaeger-agent:1.29
  # - docker.io/jaegertracing/jaeger-agent:1.27
  # - docker.io/jaegertracing/jaeger-collector:1.29
  # - docker.io/jaegertracing/jaeger-collector:1.27
  # - docker.io/jaegertracing/jaeger-query:1.29
  # - docker.io/jaegertracing/jaeger-query:1.27
  # - docker.io/jaegertracing/jaeger-es-index-cleaner:1.29
  # - docker.io/jaegertracing/jaeger-es-index-cleaner:1.27
  # - docker.io/kubesphere/kiali-operator:v1.50.1
  # - docker.io/kubesphere/kiali-operator:v1.38.1
  # - docker.io/kubesphere/kiali:v1.50
  # - docker.io/kubesphere/kiali:v1.38
  # ##example-images
  # - docker.io/library/busybox:1.31.1
  # - docker.io/library/nginx:1.14-alpine
  # - docker.io/joosthofman/wget:1.0
  # - docker.io/nginxdemos/hello:plain-text
  # - docker.io/library/wordpress:4.8-apache
  # - docker.io/mirrorgooglecontainers/hpa-example:latest
  # - docker.io/fluent/fluentd:v1.4.2-2.0
  # - docker.io/library/perl:latest
  # - docker.io/kubesphere/examples-bookinfo-productpage-v1:1.16.2
  # - docker.io/kubesphere/examples-bookinfo-reviews-v1:1.16.2
  # - docker.io/kubesphere/examples-bookinfo-reviews-v2:1.16.2
  # - docker.io/kubesphere/examples-bookinfo-details-v1:1.16.2
  # - docker.io/kubesphere/examples-bookinfo-ratings-v1:1.16.3
  # ##weave-scope-images
  # - docker.io/weaveworks/scope:1.13.0
  registry:
    auths:
      "docker.io":
        username: "username"
        password: "password"
```

## Export Artifact

```bash
sudo ./kk artifact export -m artifact-3.0.13.yaml -o artifact-3.0.13.tar.gz
```

## Cluster 설치를 위한 config 파일 생성 및 작성

- config 파일 생성

  ```bash
  sudo ./kk create config --with-kubesphere v3.4.1 --with-kubernetes v1.26.5 -f config-sample.yaml
  ```

- config 파일 작성

  ```yaml
  apiVersion: kubekey.kubesphere.io/v1alpha2
  kind: Cluster
  metadata:
    name: sample
  spec:
    hosts:
    - {name: manage-master, address: 192.168.10.100, internalAddress: 192.168.10.100, user: root, password: vagrant}
    - {name: manage-worker-1, address: 192.168.10.110, internalAddress: 192.168.10.110, user: root, password: vagrant}
    - {name: manage-worker-2, address: 192.168.10.120, internalAddress: 192.168.10.120, user: root, password: vagrant}
    roleGroups:
      etcd:
      - manage-master
      control-plane:
      - manage-master
      worker:
      - manage-worker-1
      - manage-worker-2
      registry:
      - manage-worker-1
    controlPlaneEndpoint:
      ## Internal loadbalancer for apiservers
      # internalLoadbalancer: haproxy

      #domain: lb.kubesphere.local
      domain: 192.168.10.100
      address: ""
      port: 6443
    kubernetes:
      version: v1.26.5
      clusterName: cluster.local
      autoRenewCerts: true
      containerManager: containerd
    etcd:
      type: kubekey
    network:
      plugin: calico
      kubePodsCIDR: 10.233.64.0/18
      kubeServiceCIDR: 10.233.0.0/18
      ## multus support. https://github.com/k8snetworkplumbingwg/multus-cni
      multusCNI:
        enabled: false
    registry:
      type: harbor
      auths:
        "dockerhub.kubekey.local":
          username: admin
          password: Harbor12345
      privateRegistry: "dockerhub.kubekey.local"
      namespaceOverride: "kubesphereio"
      registryMirrors: []
      insecureRegistries: []
    addons: []
  ---
  apiVersion: installer.kubesphere.io/v1alpha1
  kind: ClusterConfiguration
  metadata:
    name: ks-installer
    namespace: kubesphere-system
    labels:
      version: v3.4.1
  spec:
    persistence:
      storageClass: ""
    authentication:
      jwtSecret: ""
    local_registry: ""
    # dev_tag: ""
    etcd:
      monitoring: false
      endpointIps: localhost
      port: 2379
      tlsEnable: true
    common:
      core:
        console:
          enableMultiLogin: true
          port: 30880
          type: NodePort
      # apiserver:
      #  resources: {}
      # controllerManager:
      #  resources: {}
      redis:
        enabled: false
        enableHA: false
        volumeSize: 2Gi
      openldap:
        enabled: false
        volumeSize: 2Gi
      minio:
        volumeSize: 20Gi
      monitoring:
        # type: external
        endpoint: http://prometheus-operated.kubesphere-monitoring-system.svc:9090
        GPUMonitoring:
          enabled: false
      gpu:
        kinds:
        - resourceName: "nvidia.com/gpu"
          resourceType: "GPU"
          default: true
      es:
        # master:
        #   volumeSize: 4Gi
        #   replicas: 1
        #   resources: {}
        # data:
        #   volumeSize: 20Gi
        #   replicas: 1
        #   resources: {}
        enabled: false
        logMaxAge: 7
        elkPrefix: logstash
        basicAuth:
          enabled: false
          username: ""
          password: ""
        externalElasticsearchHost: ""
        externalElasticsearchPort: ""
      opensearch:
        # master:
        #   volumeSize: 4Gi
        #   replicas: 1
        #   resources: {}
        # data:
        #   volumeSize: 20Gi
        #   replicas: 1
        #   resources: {}
        enabled: true
        logMaxAge: 7
        opensearchPrefix: whizard
        basicAuth:
          enabled: true
          username: "admin"
          password: "admin"
        externalOpensearchHost: ""
        externalOpensearchPort: ""
        dashboard:
          enabled: false
    alerting:
      enabled: false
      # thanosruler:
      #   replicas: 1
      #   resources: {}
    auditing:
      enabled: false
      # operator:
      #   resources: {}
      # webhook:
      #   resources: {}
    devops:
      enabled: false
      jenkinsCpuReq: 0.5
      jenkinsCpuLim: 1
      jenkinsMemoryReq: 4Gi
      jenkinsMemoryLim: 4Gi
      jenkinsVolumeSize: 16Gi
    events:
      enabled: false
      # operator:
      #   resources: {}
      # exporter:
      #   resources: {}
      ruler:
        enabled: true
        replicas: 2
      #   resources: {}
    logging:
      enabled: false
      logsidecar:
        enabled: true
        replicas: 2
        # resources: {}
    metrics_server:
      enabled: false
    monitoring:
      storageClass: ""
      node_exporter:
        port: 9100
        # resources: {}
      # kube_rbac_proxy:
      #   resources: {}
      # kube_state_metrics:
      #   resources: {}
      # prometheus:
      #   replicas: 1
      #   volumeSize: 20Gi
      #   resources: {}
      #   operator:
      #     resources: {}
      # alertmanager:
      #   replicas: 1
      #   resources: {}
      # notification_manager:
      #   resources: {}
      #   operator:
      #     resources: {}
      #   proxy:
      #     resources: {}
      gpu:
        nvidia_dcgm_exporter:
          enabled: false
          # resources: {}
    multicluster:
      clusterRole: none
    network:
      networkpolicy:
        enabled: false
      ippool:
        type: none
      topology:
        type: none
    openpitrix:
      store:
        enabled: false
    servicemesh:
      enabled: false
      istio:
        components:
          ingressGateways:
          - name: istio-ingressgateway
            enabled: false
          cni:
            enabled: false
    edgeruntime:
      enabled: false
      kubeedge:
        enabled: false
        cloudCore:
          cloudHub:
            advertiseAddress:
              - ""
          service:
            cloudhubNodePort: "30000"
            cloudhubQuicNodePort: "30001"
            cloudhubHttpsNodePort: "30002"
            cloudstreamNodePort: "30003"
            tunnelNodePort: "30004"
          # resources: {}
          # hostNetWork: false
        iptables-manager:
          enabled: true
          mode: "external"
          # resources: {}
        # edgeService:
        #   resources: {}
    gatekeeper:
      enabled: false
      # controller_manager:
      #   resources: {}
      # audit:
      #   resources: {}
    terminal:
      timeout: 600
  ```

## Upgrade

```bash
sudo ./kk upgrade -f config-sample.yaml -a artifact-3.0.13.tar.gz
```

> Upgrade하면서 log 확인
```bash
kubectl logs -n kubesphere-system $(kubectl get pod -n kubesphere-system -l 'app in (ks-install, ks-installer)' -o jsonpath='{.items[0].metadata.name}') -f
```
{: .prompt-tip }

> `--skip-dependency-check`를 추가하면 Kubernetes 및 KubeSphere 버전 의존성 검사를 생략할 수 있다.
```bash
sudo ./kk upgrade -f config-sample.yaml -a artifact-3.0.13.tar.gz --skip-dependency-check
```
{: .prompt-tip }

> image 별도로 push 방법
```bash
sudo ./kk artifact image push -f config-sample.yaml -a artifact-3.0.7.tar.gz
```
{: .prompt-tip }

> [ERROR] Harbor에 image push 할 때 Unauthorized 에러 발생 때
- 다시 로그인
```bash
docker login [your.host.com]:port -u username -p password
sudo docker login https://cr.harbor.kubekey.com -u admin -p Harbor12345
```
{: .prompt-danger }

> kubekey command 참고
- <https://github.com/kubesphere/kubekey/blob/master/docs/commands/kk-upgrade.md>
{: .prompt-info }

> offline 설치 위한 artifact 참고
- version 참고
  - kubernetes와 관련된 image는 <https://github.com/kubesphere/ks-installer/releases>에서 주요 release에만 포함되는 image-list.txt파일을 참고
  - kubekey의 버전별로 kubernetes, kubesphere의 최신 지원 버전이 있음
      - kubekey/version/components.json
      - kubekey/cmd/kk/pkg/version/kubesphere/version_enum.go
      - kubekey/cmd/kk/pkg/version/kubernetes/version_enum.go
  - default 버전에 대한 설정은 kubekey/cmd/kk/apis/kubekey/v1alpha2/default.go 파일에 있다
- <https://github.com/kubesphere/kubekey/blob/v3.0.13/docs/manifest_and_artifact.md>
- <https://github.com/kubesphere/ks-installer/releases/download/v3.4.1/images-list.txt>
- <https://kubesphere.io/docs/v3.4/installing-on-linux/introduction/air-gapped-installation>
- <https://github.com/kubesphere/kubekey/blob/v3.0.13/docs/manifest-example.md>
{: .prompt-info }