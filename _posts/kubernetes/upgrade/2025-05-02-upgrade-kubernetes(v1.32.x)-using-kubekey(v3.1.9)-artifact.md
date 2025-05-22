---
title: "[Kubernetes] Upgrade Kuberntes(v1.32.x) using Kubekey(v3.1.9) Artifact"
date: 2025-05-02
categories: [Kubernetes, Upgrade]
tags: [kubernetes, kubekey, artifact, upgrade]
---

## kubekey artifact 구성 및 업그레이드

### script 다운로드

```bash
curl -sfL https://get-kk.kubesphere.io | VERSION=v3.1.9 sh -
```

### ubuntu-20.04-debs-amd64.iso 다운로드

```bash
wget https://github.com/kubesphere/kubekey/releases/download/v3.1.9/ubuntu-20.04-debs-amd64.iso
```

### artifact-3.1.9.yaml 작성

```yaml
apiVersion: kubekey.kubesphere.io/v1alpha2
kind: Manifest
metadata:
  name: artifact-v3.1.9
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
    version: v1.32.4
  components:
    helm:
      version: v3.14.3
    cni:
      version: v1.2.0
    etcd:
      version: v3.5.13
    calicoctl:
      version: v3.27.4
    containerRuntimes:
    - type: containerd
      version: 1.7.13
    crictl:
      version: v1.29.0
    harbor:
      version: v2.10.1
    docker-compose:
      version: v2.26.1
  images:
  - docker.io/kubesphere/kube-apiserver:v1.29.3
  - docker.io/kubesphere/kube-apiserver:v1.30.12
  - docker.io/kubesphere/kube-apiserver:v1.31.8
  - docker.io/kubesphere/kube-apiserver:v1.32.4
  - docker.io/kubesphere/kube-apiserver:v1.33.0
  - docker.io/kubesphere/kube-controller-manager:v1.29.3
  - docker.io/kubesphere/kube-controller-manager:v1.30.12
  - docker.io/kubesphere/kube-controller-manager:v1.31.8
  - docker.io/kubesphere/kube-controller-manager:v1.32.4
  - docker.io/kubesphere/kube-controller-manager:v1.33.0
  - docker.io/kubesphere/kube-scheduler:v1.29.3
  - docker.io/kubesphere/kube-scheduler:v1.30.12
  - docker.io/kubesphere/kube-scheduler:v1.31.8
  - docker.io/kubesphere/kube-scheduler:v1.32.4
  - docker.io/kubesphere/kube-scheduler:v1.33.0
  - docker.io/kubesphere/kube-proxy:v1.29.3
  - docker.io/kubesphere/kube-proxy:v1.30.12
  - docker.io/kubesphere/kube-proxy:v1.31.8
  - docker.io/kubesphere/kube-proxy:v1.32.4
  - docker.io/kubesphere/kube-proxy:v1.33.0
  - docker.io/kubesphere/pause:3.9
  - docker.io/coredns/coredns:1.9.3
  - docker.io/calico/cni:v3.23.2
  - docker.io/calico/cni:v3.27.3
  - docker.io/calico/kube-controllers:v3.23.2
  - docker.io/calico/kube-controllers:v3.27.3
  - docker.io/calico/node:v3.23.2
  - docker.io/calico/node:v3.27.3
  - docker.io/calico/pod2daemon-flexvol:v3.23.2
  - docker.io/calico/typha:v3.23.2
  - docker.io/kubesphere/flannel:v0.12.0
  - docker.io/openebs/provisioner-localpv:3.3.0
  - docker.io/openebs/linux-utils:3.3.0
  - docker.io/library/haproxy:2.3
  - docker.io/kubesphere/nfs-subdir-external-provisioner:v4.0.2
  - docker.io/kubesphere/k8s-dns-node-cache:1.15.12
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
  - <https://github.com/kubesphere/kubekey/blob/v3.1.9/version/components.json>
{: .prompt-info }

### Export Artifact

```bash
sudo ./kk artifact export -m artifact-3.1.9.yaml -o artifact-3.1.9.tar.gz
```

### Cluster 업그레이드를 위한 config 파일 생성 및 작성

```bash
sudo ./kk create config --with-kubesphere v3.3.2 --with-kubernetes v1.32.4 -f config-v1.32.4.yaml
```

```bash
vi config-v1.32.4.yaml
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
```

### Cluster 업그레이드

```bash
sudo ./kk upgrade cluster -f config-v1.32.4.yaml -a artifact-3.1.9.tar.gz
sudo ./kk create cluster -f config-v1.32.4.yaml -a artifact-3.1.9.tar.gz --with-packages
```

> image 별도로 push 방법
```bash
sudo ./kk artifact image push -f config-v1.32.4.yaml -a artifact-3.1.9.tar.gz
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
sudo ./kk create cluster --skip-push-images -f config-v1.32.4.yaml -a artifact-3.1.9.tar.gz
```
{: .prompt-tip }


### Cluster 업그레이드 완료

```bash

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
  - <https://github.com/kubesphere/kubekey/blob/v3.1.9/docs/manifest_and_artifact.md>
  - <https://github.com/kubesphere/ks-installer/releases/download/v3.4.1/images-list.txt>
  - <https://kubesphere.io/docs/v3.4/installing-on-linux/introduction/air-gapped-installation>
  - <https://github.com/kubesphere/kubekey/blob/v3.1.9/docs/manifest-example.md>