---
title: "Kubernetes Kubekey"
date: 2024-03-01
categories: [Kubernetes, Kubekey]
tags: [Kubernetes, Kubekey]
---

# KubeKey 설치
## 1. script 다운로드
```
curl -sfL https://get-kk.kubesphere.io | VERSION=v3.0.7 sh -
or
curl -sfL https://get-kk.kubesphere.io | sh -
```

## 2. Binary Downloads
- https://github.com/kubesphere/kubekey/releases

## 3. Build Binary from Source Code
```
git clone https://github.com/kubesphere/kubekey.git
cd kubekey
make kk
```

### Quick Start
- Quick Start is for all-in-one installation which is a good start to get familiar with Kubernetes and KubeSphere.
- Note: Since Kubernetes temporarily does not support uppercase NodeName, contains uppercase letters in the hostname will lead to subsequent installation error

#### Command
- If you have problem to access https://storage.googleapis.com, execute first export KKZONE=cn.
```
./kk create cluster [--with-kubernetes versio] [--with-kubesphere version]
```

##### Examples
- Create a pure Kubernetes cluster with default version (Kubernetes v1.23.10).
```
./kk create cluster
```

- Create a Kubernetes cluster with a specified version.
```
./kk create cluster --with-kubernetes v1.24.1 --container-manager containerd
```

- Create a Kubernetes cluster with KubeSphere installed.
```
./kk create cluster --with-kubesphere v3.2.1
```

## 4. 세부 설정을 위한 Create Config
```
./kk create config [--with-kubernetes version] [--with-kubesphere version] [(-f | --filename) path]
```
- 다른 파일 이름이나 다른 폴더에 있는 파일을 지정할 수도 있다.
```
./kk create config [--with-kubernetes version] [(-f | --file) path]
```
```
./kk create config --with-kubernetes v1.20.4
```

### vi config-sample.yaml
```yaml
apiVersion: kubekey.kubesphere.io/v1alpha1
kind: Cluster
metadata:
  name: sample
spec:
  hosts:
  - {name: master, address: 192.168.0.1, internalAddress: 192.168.0.1, user: root, password: Testing123}
  - {name: worker1, address: 192.168.0.2, internalAddress: 192.168.0.2, user: root, password: Testing123}
  - {name: worker2, address: 192.168.0.3, internalAddress: 192.168.0.3, user: root, password: Testing123}
  roleGroups:
    etcd:
    - master
    master:
    - master
    worker:
    - worker1
    - worker2
  controlPlaneEndpoint:
    domain: lb.kubesphere.local
    address: ""
    port: "6443"
  kubernetes:
    version: v1.17.9
    imageRepo: kubesphere
    clusterName: cluster.local
  network:
    plugin: calico
    kubePodsCIDR: 10.233.64.0/18
    kubeServiceCIDR: 10.233.0.0/18
  registry:
    registryMirrors: []
    insecureRegistries: []
  addons: []
hosts:
- {name: master, address: 192.168.0.1, internalAddress: 192.168.0.1, privateKeyPath: "~/.ssh/id_rsa"}
```

## 5. Install Cluster
```
./kk create cluster -f config-sample.yaml
```