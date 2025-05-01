---
title: "[Kubernetes] Install Kuberntes(v1.29.x) using Kubekey(v3.1.1) Artifact on Multipass"
date: 2025-04-28
categories: [Kubernetes, Install]
tags: [kubernetes, kubekey, artifact, install]
---

## Multipass 접속을 위한 ssh key 생성

```bash
ssh-keygen -t rsa -b 2048 -f ~/.ssh/id_rsa_multipass
```

## cloud-init 구성

- cloud-init 생성

  ```bash
  vi cloud-init.yaml
  ```

- cloud-init 작성

  ```yaml
  users:
    - default
    - name: root
      sudo: ALL=(ALL) NOPASSWD:ALL
      ssh_authorized_keys:
        - <content of YOUR public key>

    - name: ubuntu
      sudo: ALL=(ALL) NOPASSWD:ALL
      ssh_authorized_keys:
        - <content of YOUR public key>

  runcmd:
    - sudo apt-get update
    - sudo timedatectl set-timezone "Asia/Seoul"
    - sudo swapoff -a
    - sudo sed -i "/swap/d" /etc/fstab
    - sudo apt-get install -y conntrack
    - sudo apt-get install -y socat
  ```

### cloud-init의 ssh_authorized_keys 설정을 하지 않았을 시

- 각 Node의 `~/.ssh` 경로의 있는 `authorized_keys`에 `id_rsa_multipass.pub` 내용 붙여넣기

  ```bash
  cat $HOME/.ssh/id_rsa_multipass.pub
  ```

- root 계정일 때

  ```bash
  # root 접속
  sudo -i

  # 수정 또는 .ssh 폴더 생성 후 authorized_keys 작성
  vi .ssh/authorized_keys
  ```

## Multipass 생성

- Repository 생성

  ```bash
  multipass launch focal --name kk-repo --memory 8G --disk 100G --cpus 4 --network name=multipass,mode=manual --cloud-init cloud-init.yaml
  ```

- Master 생성

  ```bash
  multipass launch focal --name kk-master --memory 8G --disk 50G --cpus 4 --network name=multipass,mode=manual --cloud-init cloud-init.yaml
  ```

- Worker-1 생성

  ```bash
  multipass launch focal --name kk-worker-1 --memory 8G --disk 50G --cpus 4 --network name=multipass,mode=manual --cloud-init cloud-init.yaml
  ```

- Worker-2 생성

  ```bash
  multipass launch focal --name kk-worker-2 --memory 8G --disk 50G --cpus 4 --network name=multipass,mode=manual --cloud-init cloud-init.yaml
  ```

## Multipass 접속

- kk-repo

  ```bash
  ssh -i $HOME/.ssh/id_rsa_multipass ubuntu@192.168.0.100
  ```

  ```bash
  multipass shell kk-repo
  ```

- kk-master

  ```bash
  ssh -i $HOME/.ssh/id_rsa_multipass ubuntu@192.168.0.101
  ```
  
  ```bash
  multipass shell kk-master
  ```

- kk-worker-1

  ```bash
  ssh -i $HOME/.ssh/id_rsa_multipass ubuntu@192.168.0.102
  ```
  
  ```bash
  multipass shell kk-worker-1
  ```

- kk-worker-2

  ```bash
  ssh -i $HOME/.ssh/id_rsa_multipass ubuntu@192.168.0.103
  ```
  
  ```bash
  multipass shell kk-worker-2
  ```

### 각 Node별로 Static IP 설정

```bash
sudo vi /etc/netplan/50-cloud-init.yaml
```

- kk-repo

  ```yaml
  network:
      ethernets:
          eth0:
              dhcp4: true
              dhcp6: true
              match:
                  macaddress: 52:54:00:80:6b:21
              set-name: eth0
  --- 추가
          eth1:
              addresses: [192.168.0.100/24]
              gateway4: 192.168.0.1
              dhcp4: no
  ---
      version: 2
  ```

- kk-master

  ```yaml
  network:
      ethernets:
          eth0:
              dhcp4: true
              dhcp6: true
              match:
                  macaddress: 52:54:00:80:6b:21
              set-name: eth0
  --- 추가
          eth1:
              addresses: [192.168.0.101/24]
              gateway4: 192.168.0.1
              dhcp4: no
  ---
      version: 2
  ```

- kk-worker-1

  ```yaml
  network:
      ethernets:
          eth0:
              dhcp4: true
              dhcp6: true
              match:
                  macaddress: 52:54:00:80:6b:21
              set-name: eth0
  --- 추가
          eth1:
              addresses: [192.168.0.102/24]
              gateway4: 192.168.0.1
              dhcp4: no
  ---
      version: 2
  ```

- kk-worker-2

  ```yaml
  network:
      ethernets:
          eth0:
              dhcp4: true
              dhcp6: true
              match:
                  macaddress: 52:54:00:80:6b:21
              set-name: eth0
  --- 추가
          eth1:
              addresses: [192.168.0.103/24]
              gateway4: 192.168.0.1
              dhcp4: no
  ---
      version: 2
  ```

## kubekey artifact 구성 및 설치

### script 다운로드

```bash
curl -sfL https://get-kk.kubesphere.io | VERSION=v3.1.1 sh -
```

### ubuntu-20.04-debs-amd64.iso 다운로드

```bash
wget https://github.com/kubesphere/kubekey/releases/download/v3.1.1/ubuntu-20.04-debs-amd64.iso
```

### artifact-3.1.1.yaml 작성

```yaml
apiVersion: kubekey.kubesphere.io/v1alpha2
kind: Manifest
metadata:
  name: artifact-v3.1.1
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
        localPath: "/home/ubuntu/kk_install/ubuntu-20.04-debs-amd64.iso"
        # url: "https://github.com/kubesphere/kubekey/releases/download/v3.1.1/ubuntu-20.04-debs-amd64.iso"
  kubernetesDistributions:
  - type: kubernetes
    version: v1.29.3
  components:
    helm:
      version: v3.14.3
    cni:
      version: v1.2.0
    etcd:
      version: v3.5.13
    calicoctl:
      version: v3.27.3
    ## For now, if your cluster container runtime is containerd, KubeKey will add a docker 20.10.8 container runtime in the below list.
    ## The reason is KubeKey creates a cluster with containerd by installing a docker first and making kubelet connect the socket file of containerd which docker contained.
    containerRuntimes:
    - type: docker
      version: 24.0.9
    - type: containerd
      version: 1.7.13
    crictl:
      version: v1.29.0
    docker-registry:
      version: "2"
    harbor:
      version: v2.10.1
    docker-compose:
      version: v2.26.1
  images:
  - docker.io/kubesphere/kube-apiserver:v1.29.3
  - docker.io/kubesphere/kube-controller-manager:v1.29.3
  - docker.io/kubesphere/kube-scheduler:v1.29.3
  - docker.io/kubesphere/kube-proxy:v1.29.3
  - docker.io/kubesphere/pause:3.9
  - docker.io/coredns/coredns:1.9.3
  - docker.io/calico/cni:v3.27.3
  - docker.io/calico/cni:v3.23.2
  - docker.io/calico/kube-controllers:v3.27.3
  - docker.io/calico/kube-controllers:v3.23.2
  - docker.io/calico/node:v3.27.3
  - docker.io/calico/node:v3.23.2
  - docker.io/calico/pod2daemon-flexvol:v3.23.2
  - docker.io/calico/typha:v3.23.2
  - docker.io/kubesphere/flannel:v0.12.0
  - docker.io/openebs/provisioner-localpv:3.3.0
  - docker.io/openebs/linux-utils:3.3.0
  - docker.io/library/haproxy:2.3
  - docker.io/kubesphere/nfs-subdir-external-provisioner:v4.0.2
  - docker.io/kubesphere/k8s-dns-node-cache:1.22.20
  - docker.io/kubesphere/k8s-dns-node-cache:1.15.12
  # https://github.com/kubesphere/ks-installer/releases/download/v3.3.2/images-list.txt
  ##kubesphere-images
  - docker.io/kubesphere/ks-installer:v3.4.1
  - docker.io/kubesphere/ks-apiserver:v3.4.1
  - docker.io/kubesphere/ks-console:v3.4.1
  - docker.io/kubesphere/ks-controller-manager:v3.4.1
  - docker.io/kubesphere/kubectl:v1.22.0
  - docker.io/kubesphere/kubefed:v0.8.1
  - docker.io/kubesphere/tower:v0.2.1
  - docker.io/minio/minio:RELEASE.2019-08-07T01-59-21Z
  - docker.io/minio/mc:RELEASE.2019-08-07T23-14-43Z
  - docker.io/csiplugin/snapshot-controller:v4.0.0
  - docker.io/kubesphere/nginx-ingress-controller:v1.3.1
  - docker.io/mirrorgooglecontainers/defaultbackend-amd64:1.4
  - docker.io/kubesphere/metrics-server:v0.4.2
  - docker.io/library/redis:5.0.14-alpine
  - docker.io/library/haproxy:2.0.25-alpine
  - docker.io/library/alpine:3.14
  - docker.io/osixia/openldap:1.3.0
  - docker.io/kubesphere/netshoot:v1.0
  ##kubeedge-images
  - docker.io/kubeedge/cloudcore:v1.13.0
  - docker.io/kubesphere/iptables-manager:v1.13.0
  - docker.io/kubeedge/iptables-manager:v1.9.2
  - docker.io/kubesphere/edgeservice:v0.3.0
  - docker.io/kubesphere/edgeservice:v0.2.0
  ##gatekeeper-images
  - docker.io/openpolicyagent/gatekeeper:v3.5.2
  ##openpitrix-images
  - docker.io/kubesphere/openpitrix-jobs:v3.3.2
  ##kubesphere-devops-images
  - docker.io/kubesphere/devops-apiserver:ks-v3.4.1
  - docker.io/kubesphere/devops-controller:ks-v3.4.1
  - docker.io/kubesphere/devops-tools:ks-v3.4.1
  - docker.io/kubesphere/ks-jenkins:v3.4.0-2.319.3-1
  - docker.io/jenkins/inbound-agent:4.10-2
  - docker.io/kubesphere/builder-base:v3.2.2
  - docker.io/kubesphere/builder-nodejs:v3.2.0
  - docker.io/kubesphere/builder-maven:v3.2.1-jdk11
  - docker.io/kubesphere/builder-maven:v3.2.0
  - docker.io/kubesphere/builder-python:v3.2.0
  - docker.io/kubesphere/builder-go:v3.2.2-1.18
  - docker.io/kubesphere/builder-go:v3.2.2-1.17
  - docker.io/kubesphere/builder-go:v3.2.2-1.16
  - docker.io/kubesphere/builder-go:v3.2.0
  - docker.io/kubesphere/builder-base:v3.2.2-podman
  - docker.io/kubesphere/builder-nodejs:v3.2.0-podman
  - docker.io/kubesphere/builder-maven:v3.2.1-jdk11-podman
  - docker.io/kubesphere/builder-maven:v3.2.0-podman
  - docker.io/kubesphere/builder-python:v3.2.0-podman
  - docker.io/kubesphere/builder-go:v3.2.0-podman
  - docker.io/kubesphere/builder-go:v3.2.2-1.18-podman
  - docker.io/kubesphere/builder-go:v3.2.2-1.17-podman
  - docker.io/kubesphere/builder-go:v3.2.2-1.16-podman
  - docker.io/kubesphere/s2ioperator:v3.2.1
  - docker.io/kubesphere/s2irun:v3.2.0
  - docker.io/kubesphere/s2i-binary:v3.2.0
  - docker.io/kubesphere/tomcat85-java11-centos7:v3.2.0
  - docker.io/kubesphere/tomcat85-java11-runtime:v3.2.0
  - docker.io/kubesphere/tomcat85-java8-centos7:v3.2.0
  - docker.io/kubesphere/tomcat85-java8-runtime:v3.2.0
  - docker.io/kubesphere/java-11-centos7:v3.2.0
  - docker.io/kubesphere/java-11-runtime:v3.2.0
  - docker.io/kubesphere/java-8-centos7:v3.2.0
  - docker.io/kubesphere/java-8-runtime:v3.2.0
  - docker.io/kubesphere/nodejs-8-centos7:v3.2.0
  - docker.io/kubesphere/nodejs-6-centos7:v3.2.0
  - docker.io/kubesphere/nodejs-4-centos7:v3.2.0
  - docker.io/kubesphere/python-36-centos7:v3.2.0
  - docker.io/kubesphere/python-35-centos7:v3.2.0
  - docker.io/kubesphere/python-34-centos7:v3.2.0
  - docker.io/kubesphere/python-27-centos7:v3.2.0
  - quay.io/argoproj/argocd:v2.3.3
  - quay.io/argoproj/argocd-applicationset:v0.4.1
  - ghcr.io/dexidp/dex:v2.30.2
  - docker.io/library/redis:6.2.6-alpine
  ##kubesphere-monitoring-images
  - docker.io/jimmidyson/configmap-reload:v0.7.1
  - docker.io/prom/prometheus:v2.39.1
  - docker.io/kubesphere/prometheus-config-reloader:v0.55.1
  - docker.io/kubesphere/prometheus-operator:v0.55.1
  - docker.io/kubesphere/kube-rbac-proxy:v0.11.0
  - docker.io/kubesphere/kube-state-metrics:v2.6.0
  - docker.io/prom/node-exporter:v1.3.1
  - docker.io/prom/alertmanager:v0.23.0
  - docker.io/thanosio/thanos:v0.31.0
  - docker.io/grafana/grafana:8.3.3
  - docker.io/kubesphere/kube-rbac-proxy:v0.11.0
  - docker.io/kubesphere/notification-manager-operator:v2.3.0
  - docker.io/kubesphere/notification-manager:v2.3.0
  - docker.io/kubesphere/notification-tenant-sidecar:v3.2.0
  ##kubesphere-logging-images
  - docker.io/kubesphere/elasticsearch-curator:v5.7.6
  - docker.io/kubesphere/opensearch-curator:v0.0.5
  - docker.io/kubesphere/elasticsearch-oss:6.8.22
  - docker.io/opensearchproject/opensearch:2.6.0
  - docker.io/opensearchproject/opensearch-dashboards:2.6.0
  - docker.io/kubesphere/fluentbit-operator:v0.14.0
  - docker.io/library/docker:19.03
  - docker.io/kubesphere/fluent-bit:v1.9.4
  - docker.io/kubesphere/log-sidecar-injector:v1.2.0
  - docker.io/elastic/filebeat:6.7.0
  - docker.io/kubesphere/kube-events-operator:v0.6.0
  - docker.io/kubesphere/kube-events-ruler:v0.6.0
  - docker.io/kubesphere/kube-auditing-operator:v0.2.0
  - docker.io/kubesphere/kube-auditing-webhook:v0.2.0
  ##istio-images
  - docker.io/istio/pilot:1.14.6
  - docker.io/istio/proxyv2:1.14.6
  - docker.io/jaegertracing/jaeger-operator:1.29
  - docker.io/jaegertracing/jaeger-agent:1.29
  - docker.io/jaegertracing/jaeger-collector:1.29
  - docker.io/jaegertracing/jaeger-query:1.29
  - docker.io/jaegertracing/jaeger-es-index-cleaner:1.29
  - docker.io/kubesphere/kiali-operator:v1.50.1
  - docker.io/kubesphere/kiali:v1.50
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

#### components version 확인(지원하는 version이 없을 시 아래와 같이 Error)

```
Failed to download docker binary: curl -L -o /home/ubuntu/kk_install/kubekey/artifact/docker/20.10.8/amd64/docker-20.10.8.tgz https://download.docker.com/linux/static/stable/x86_64/docker-20.10.8.tgz error: No SHA256 found for docker. 20.10.8 is not supported.
17:40:24 KST failed: [LocalHost]
error: Pipeline[ArtifactExportPipeline] execute failed: Module[ArtifactBinariesModule] exec failed:
failed: [LocalHost] [DownloadBinaries] exec failed after 1 retries: Failed to download docker binary: curl -L -o /home/ubuntu/kk_install/kubekey/artifact/docker/20.10.8/amd64/docker-20.10.8.tgz https://download.docker.com/linux/static/stable/x86_64/docker-20.10.8.tgz error: No SHA256 found for docker. 20.10.8 is not supported.
```

> Components 참고
  - <https://github.com/kubesphere/kubekey/blob/v3.1.1/version/components.json>
{: .prompt-info }

### Export Artifact

```bash
sudo ./kk artifact export -m artifact-3.1.1.yaml -o artifact-3.1.1.tar.gz
```

### Cluster 설치를 위한 config 파일 생성 및 작성

```bash
sudo ./kk create config --with-kubesphere v3.3.2 --with-kubernetes v1.29.3 -f config-v1.29.3.yaml
```

```bash
vi config-v1.29.3.yaml
```

```yaml
apiVersion: kubekey.kubesphere.io/v1alpha2
kind: Cluster
metadata:
  name: sample
spec:
  hosts:
  - {name: kk-repo, address: 192.168.0.100, internalAddress: 192.168.0.100, privateKeyPath: "/home/ubuntu/.ssh/id_rsa_multipass"}
  - {name: kk-master, address: 192.168.0.101, internalAddress: 192.168.0.101, privateKeyPath: "/home/ubuntu/.ssh/id_rsa_multipass"}
  - {name: kk-worker-1, address: 192.168.0.102, internalAddress: 192.168.0.102, privateKeyPath: "/home/ubuntu/.ssh/id_rsa_multipass"}
  - {name: kk-worker-2, address: 192.168.0.103, internalAddress: 192.168.0.103, privateKeyPath: "/home/ubuntu/.ssh/id_rsa_multipass"}
  roleGroups:
    etcd:
    - kk-master
    control-plane:
    - kk-master
    worker:
    - kk-worker-1
    - kk-worker-2
    registry:
    - kk-repo
  controlPlaneEndpoint:
    ## Internal loadbalancer for apiservers
    # internalLoadbalancer: haproxy

    domain: lb.kubesphere.local
    # domain: 192.168.0.101
    address: "192.168.0.101"
    port: 6443
  kubernetes:
    version: v1.29.3
    imageRepo: kubesphere
    clusterName: cluster.local
    masqueradeAll: false
    maxPods: 150
    nodeCidrMaskSize: 24
    proxyMode: ipvs
    autoRenewCerts: true
    containerManager: containerd
    featureGates:
      RotateKubeletServerCertificate: true
    apiserverArgs:
    - default-not-ready-toleration-seconds=30
    - default-unreachable-toleration-seconds=30
    controllerManagerArgs:
    - node-monitor-period=2s
    - node-monitor-grace-period=16s
    kubeletConfiguration:
      nodeStatusUpdateFrequency: 4s
  # etcd:
    # type: kubekey
  network:
    plugin: calico
    calico:
      ipipMode: Always
      vxianMode: Never
      vethMTU: 1440
    kubePodsCIDR: 10.233.64.0/18
    kubeServiceCIDR: 10.233.0.0/18
    ## multus support. https://github.com/k8snetworkplumbingwg/multus-cni
    multusCNI:
      enabled: false
  registry:
    type: harbor
    auths:
      "cr.harbor.kubekey.com":
        username: admin
        password: Harbor12345
    privateRegistry: "cr.harbor.kubekey.com"
    namespaceOverride: "kubesphereio"
    registryMirrors: []
    insecureRegistries: ["cr.harbor.kubekey.com"]
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
  zone: ""
  local_registry: ""
  namespace_override: ""
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
      logMaxAge: 7
      elkPrefix: logstash
      basicAuth:
        enabled: false
        username: ""
        password: ""
      externalElasticsearchHost: ""
      externalElasticsearchPort: ""
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
    # resources: {}
    jenkinsMemoryLim: 8Gi
    jenkinsMemoryReq: 4Gi
    jenkinsVolumeSize: 8Gi
  events:
    enabled: false
    # operator:
    #   resources: {}
    # exporter:
    #   resources: {}
    # ruler:
    #   enabled: true
    #   replicas: 2
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
  terminal:
    timeout: 600
```

### Repo에서 각 Node 접속을 위해 `id_rsa_multipass` 파일 복사

```bash
multipass copy-files $HOME/.ssh/id_rsa_multipass kk-repo:/home/ubuntu/.ssh/id_rsa_multipass
```

### Registry 설치

```bash
sudo ./kk init registry -f config-v1.29.3.yaml -a artifact-3.1.1.tar.gz
```

> harbor 주소 : [harbor 설치한 ip]:80
{: .prompt-info }

> [ERROR] ssh error
- 각 node 별로 ssh가 안될시 root passwd가 맞지 않아 발생함.
- Multipass에서 vm이 생성되면 root 비번을 설정해줘야 하는 듯
```bash
sudo passwd root
```
{: .prompt-danger }

### Harbor 인증서 복사 및 업데이트 (`harbor curl: (60) SSL certificate problem: unable to get local issuer certificate`)

#### Repo 및 각 Node의 인증서 복사

```bash
sudo cp /etc/docker/certs.d/cr.harbor.kubekey.com/ca.crt /usr/local/share/ca-certificates/harbor-ca.crt
sudo scp -i /home/ubuntu/.ssh/id_rsa_multipass /usr/local/share/ca-certificates/harbor-ca.crt root@192.168.0.101:/usr/local/share/ca-certificates/harbor-ca.crt
sudo scp -i /home/ubuntu/.ssh/id_rsa_multipass /usr/local/share/ca-certificates/harbor-ca.crt root@192.168.0.102:/usr/local/share/ca-certificates/harbor-ca.crt
sudo scp -i /home/ubuntu/.ssh/id_rsa_multipass /usr/local/share/ca-certificates/harbor-ca.crt root@192.168.0.103:/usr/local/share/ca-certificates/harbor-ca.crt
```

#### 각 Node 별로 인증서 업데이트

```bash
sudo update-ca-certificates
```

#### 인증서 적용 확인

```bash
ls -lrt /etc/ssl/certs
```

```
- harbor-ca.pem -> /usr/local/share/ca-certificates/harbor-ca.crt
- ca-certificates.crt
```

#### Container Restart

```bash
sudo systemctl restart containerd
```

### Harbor Project 생성

#### Sample Bash 파일 다운로드

```bash
curl -O https://raw.githubusercontent.com/kubesphere/ks-installer/master/scripts/create_project_harbor.sh
```

#### url 수정 : <https://cr.harbor.kubekey.com>

```bash
vi create_project_harbor.sh
```

```bash
#!/usr/bin/env bash

# Copyright 2018 The KubeSphere Authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

url="https://cr.harbor.kubekey.com"  #Change the value of url to https://cr.harbor.kubekey.com.
user="admin"
passwd="Harbor12345"

harbor_projects=(library
    kubesphereio
    kubesphere
    argoproj
    calico
    coredns
    openebs
    csiplugin
    minio
    mirrorgooglecontainers
    osixia
    prom
    thanosio
    jimmidyson
    grafana
    elastic
    istio
    jaegertracing
    jenkins
    weaveworks
    openpitrix
    joosthofman
    nginxdemos
    fluent
    kubeedge
    openpolicyagent
)

for project in "${harbor_projects[@]}"; do
    echo "creating $project"
    curl -u "${user}:${passwd}" -X POST -H "Content-Type: application/json" "${url}/api/v2.0/projects" -d "{ \"project_name\": \"${project}\", \"public\": true}" -k #Add -k at the end of the curl command.
done
```

#### 파일 권한 변경

```bash
chmod +x create_project_harbor.sh
```

#### 실행

```bash
./create_project_harbor.sh
```

### Cluster 설치

```bash
sudo ./kk create cluster -f config-v1.29.3.yaml -a artifact-3.1.1.tar.gz
sudo ./kk create cluster -f config-v1.29.3.yaml -a artifact-3.1.1.tar.gz --with-packages
```

> image 별도로 push 방법
```bash
sudo ./kk artifact image push -f config-v1.29.3.yaml -a artifact-3.1.1.tar.gz
```
{: .prompt-tip }

> [ERROR] Harbor에 image push 할 때 Unauthorized 에러 발생 때
- 다시 로그인
```bash
docker login [your.host.com]:port -u username -p password
sudo docker login https://cr.harbor.kubekey.com -u admin -p Harbor12345
```
{: .prompt-danger }

> `--skip-push-images`를 추가하면 harbor에 image를 push하는 과정으로 생략할 수 있다.
```bash
sudo ./kk create cluster --skip-push-images -f config-v1.29.3.yaml -a artifact-3.1.1.tar.gz
```
{: .prompt-tip }

#### Cluster 설치하면서 log 확인

```bash
kubectl logs -n kubesphere-system $(kubectl get pod -n kubesphere-system -l 'app in (ks-install, ks-installer)' -o jsonpath='{.items[0].metadata.name}') -f
```

#### Kubernetes 일반 유저 일 때

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

> 만약 일반 계정에서 아래와 sudo 명령어 없이 kubectl 명령어 사용시 아래와 같은 오류가 발생하면
- [ERROR]  error loading config file `/etc/kubernetes/admin.conf`: open /etc/kubernetes/admin.conf: permission denied
  - 아래 명령어를 입력하면 sudo 없이 사용 가능하다.
    ```bash
    export KUBECONFIG=$HOME/.kube/config
    ```
{: .prompt-danger }

> [ERROR] error making pod data directories: mkdir /var/lib/kubelet/pods/86cfe394-ba32-4a9f-ad65-1fb21f98a4ba: read-only file system
```bash
chown -R kubelet:kubelet /var/lib/kubelet/pods
chmod 750 /var/lib/kubelet/pods
systemctl restart kubelet
```
{: .prompt-danger }

### Cluster 설치 완료

```bash
#####################################################
###              Welcome to KubeSphere!           ###
#####################################################

Console: http://192.168.0.101:30880
Account: admin
Password: P@88w0rd
NOTES：
  1. After you log into the console, please check the
     monitoring status of service components in
     "Cluster Management". If any service is not
     ready, please wait patiently until all components
     are up and running.
  2. Please change the default password after login.

#####################################################
https://kubesphere.io             2025-05-01 22:32:53
#####################################################
22:32:54 KST success: [kk-master]
22:32:54 KST Pipeline[CreateClusterPipeline] execute successfully
Installation is complete.

Please check the result using the command:

        kubectl logs -n kubesphere-system $(kubectl get pod -n kubesphere-system -l 'app in (ks-install, ks-installer)' -o jsonpath='{.items[0].metadata.name}') -f
```

## offline 설치 위한 artifact 참고

- version 참고
  - kubernetes와 관련된 image는 <https://github.com/kubesphere/ks-installer/releases>에서 주요 release에만 포함되는 image-list.txt파일을 참고
  - kubekey의 버전별로 kubernetes, kubesphere의 최신 지원 버전이 있음
      - kubekey/version/components.json
      - kubekey/cmd/kk/pkg/version/kubesphere/version_enum.go
      - kubekey/cmd/kk/pkg/version/kubernetes/version_enum.go
  - default 버전에 대한 설정은 kubekey/cmd/kk/apis/kubekey/v1alpha2/default.go 파일에 있다

- 참고
  - <https://github.com/kubesphere/kubekey/blob/v3.1.1/docs/manifest_and_artifact.md>
  - <https://github.com/kubesphere/ks-installer/releases/download/v3.4.1/images-list.txt>
  - <https://kubesphere.io/docs/v3.4/installing-on-linux/introduction/air-gapped-installation>
  - <https://github.com/kubesphere/kubekey/blob/v3.1.1/docs/manifest-example.md>