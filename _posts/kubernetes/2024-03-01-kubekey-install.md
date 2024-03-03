---
title: "Kubernetes Kubekey"
date: 2024-03-01
categories: [Kubernetes, Kubekey]
tags: [Kubernetes, Kubekey]
---

# KubeKey 설치
## 1. script
```
curl -sfL https://get-kk.kubesphere.io | VERSION=v3.0.7 sh -
or
curl -sfL https://get-kk.kubesphere.io | sh -
```

## 2. Binary Downloads https://github.com/kubesphere/kubekey/releases

## 3. Build Binary from Source Code
git clone https://github.com/kubesphere/kubekey.git
cd kubekey
make kk

## 4. Create Config
```
./kk create config [--with-kubernetes version] [(-f | --file) path]
./kk create config --with-kubernetes v1.20.4
```
### vi config-sample.yaml
```config-sample.yaml
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

```
./kk create cluster -f config-sample.yaml
```

# another
./kk create cluster [--with-kubernetes version] [--with-kubesphere version]

## Examples
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