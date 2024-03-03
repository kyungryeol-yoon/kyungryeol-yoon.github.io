---
title: "Kubernetes Kubekey Artifact"
date: 2024-03-01
categories: [Kubernetes, Kubekey]
tags: [Kubernetes, Kubekey, Artifact]
---

# offline 설치 위한 artifact 파일 생성
## version 참고
- kubernetes와 관련된 image는 https://github.com/kubesphere/ks-installer/releases 에서 주요 release에만 포함되는 image-list.txt파일을 참고
- kubekey의 버전별로 kubernetes, kubesphere의 최신 지원 버전이 있음
    - kubekey/version/components.json
    - kubekey/cmd/kk/pkg/version/kubesphere/version_enum.go
    - kubekey/cmd/kk/pkg/version/kubernetes/version_enum.go
- default 버전에 대한 설정은 kubekey/cmd/kk/apis/kubekey/v1alpha2/default.go 파일에 있다

## 참고
- https://github.com/kubesphere/kubekey/blob/v3.0.13/docs/manifest_and_artifact.md
- https://github.com/kubesphere/ks-installer/releases/download/v3.4.1/images-list.txt
- https://kubesphere.io/docs/v3.4/installing-on-linux/introduction/air-gapped-installation
- https://github.com/kubesphere/kubekey/blob/v3.0.13/docs/manifest-example.md

## kubekey artifact 설치
### 1. script 다운로드
```
curl -sfL https://get-kk.kubesphere.io | VERSION=v3.0.7 sh -
```
### 2. artifact-3.0.7.yaml 작성
```yaml
apiVersion: kubekey.kubesphere.io/v1alpha2
kind: Manifest
metadata:
  name: artifact-v3.0.7
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
        url: "https://github.com/kubesphere/kubekey/releases/download/v3.0.7/ubuntu-20.04-debs-amd64.iso"
  kubernetesDistributions:
  - type: kubernetes
    version: v1.24.9
  components:
    helm:
      version: v3.9.0
    cni:
      version: v0.9.1
    etcd:
      version: v3.4.13
    calicoctl:
      version: v3.23.2
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
#  - docker.io/kubesphere/kube-apiserver:v1.23.15
#  - docker.io/kubesphere/kube-controller-manager:v1.23.15
```
### 3. Export Artifact
```
sudo ./kk artifact export -m artifact-3.0.7.yaml -o artifact-3.0.7.tar.gz
```

### 4. registry 설치
```
kk init registry -f config-sample.yaml -a artifact-3.0.7.tar.gz
```

### 5. Cluster 설치를 위한 config 파일 생성 및 작성
```
sudo ./kk create config --with-kubesphere v3.4.1 --with-kubernetes v1.24.9 -f config-sample.yaml
```

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
    version: v3.3.2
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

### 6. harbor 수정
```
curl -O https://raw.githubusercontent.com/kubesphere/ks-installer/master/scripts/create_project_harbor.sh
```

#### url 수정 : https://dockerhub.kubekey.local
```
vi create_project_harbor.sh
```

```
chmod +x create_project_harbor.sh
```

##### error 났을 때 (harbor curl: (60) SSL certificate problem: unable to get local issuer certificate)
```
sudo cp /etc/docker/certs.d/dockerhub.kubekey.local/ca.crt /usr/local/share/ca-certificates/harbor-ca.crt
scp -i /home/vagrant/.ssh/id_rsa /usr/local/share/ca-certificates/harbor-ca.crt root@192.168.10.110:/usr/local/share/ca-certificates/harbor-ca.crt
scp -i /home/vagrant/.ssh/id_rsa /usr/local/share/ca-certificates/harbor-ca.crt root@192.168.10.120:/usr/local/share/ca-certificates/harbor-ca.crt
```

##### image 별도로 push 방법
```
sudo kk artifact image push -f config-sample.yaml -a artifact-3.0.7.tar.gz
```

### 7. Cluster 설치
```
sudo kk create cluster -f config-sample.yaml -a artifact-3.0.7.tar.gz
./kk create cluster -f config-sample.yaml -a artifact-3.0.7.tar.gz --with-packages
```

#### --skip-push-images를 추가하면 harbor에 image를 push하는 과정으로 생략할 수 있다.
```
sudo kk create cluster --skip-push-images -f config-sample.yaml -a artifact-3.0.7.tar.gz
./kk-v3.0.13 create cluster --skip-push-images -f config-sampler.yaml -a artifact-3.0.7.tar.gz
```

#### Cluster 설치하면서 log 확인
```
kubectl logs -n kubesphere-system $(kubectl get pod -n kubesphere-system -l 'app in (ks-install, ks-installer)' -o jsonpath='{.items[0].metadata.name}') -f
```