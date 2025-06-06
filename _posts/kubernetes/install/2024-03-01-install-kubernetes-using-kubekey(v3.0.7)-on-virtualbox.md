---
title: "[Kubernetes] Install Kubernetes using Kubekey(v3.0.7) on VirtualBox"
date: 2024-03-01
categories: [Kubernetes, Install]
tags: [kubernetes, kubekey, install]
---

## script 다운로드

```bash
curl -sfL https://get-kk.kubesphere.io | VERSION=v3.0.7 sh -
```

### Binary Downloads

- <https://github.com/kubesphere/kubekey/releases>

### Build Binary from Source Code

```bash
git clone https://github.com/kubesphere/kubekey.git
cd kubekey
make kk
```

## Quick Install Cluster

```bash
./kk create cluster [--with-kubernetes versio] [--with-kubesphere version]
```

- Create a Kubernetes cluster with a specified version.

  ```bash
  ./kk create cluster --with-kubernetes v1.24.1 --container-manager containerd
  ```

- Create a Kubernetes cluster with KubeSphere installed.

  ```bash
  ./kk create cluster --with-kubesphere v3.2.1
  ```

## Custom Install Cluster

### 세부 설정을 위한 Create Config

```bash
./kk create config [--with-kubernetes version] [--with-kubesphere version] [(-f | --filename) path]
```

> 다른 파일 이름이나 다른 폴더에 있는 파일을 지정할 수도 있다.
```bash
./kk create config [--with-kubernetes version] [(-f | --file) path]
```
- Examples
  ```bash
  ./kk create config --with-kubernetes v1.20.4
  ```
{: .prompt-info }

- 파일 작성

  ```bash
  vi config-sample.yaml
  ```


  ```yaml
  apiVersion: kubekey.kubesphere.io/v1alpha1
  kind: Cluster
  metadata:
    name: sample
  spec:
    hosts:
    - {name: master, address: 192.168.0.1, internalAddress: 192.168.0.1, privateKeyPath: "~/.ssh/id_rsa"}

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
  ```

### Install Cluster

```bash
./kk create cluster -f config-sample.yaml
```

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