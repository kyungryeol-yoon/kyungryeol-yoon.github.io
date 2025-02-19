---
title: "[Kubernetes] Install K3S in the Multipass"
date: 2024-05-20
categories: [Kubernetes, Install]
tags: [kubernetes, k3s, multipass, ubuntu, linux, install]
---

## VM deployments used multipass on mac

- master node 생성
  ```bash
  multipass launch --name k3s-master --cpus 2 --memory 4G --disk 50G focal
  ```

- worker1 node 생성
  ```bash
  multipass launch --name k3s-worker1 --cpus 2 --memory 4G --disk 50G focal
  ```

- worker2 node 생성
  ```bash
  multipass launch --name k3s-worker2 --cpus 2 --memory 4G --disk 50G focal
  ```

- registry node 생성
  ```bash
  multipass launch --name registry --cpus 2 --memory 4G --disk 100G focal
  ```

## ubuntu 구동 확인

```bash
multipass list
```

```bash
multipass ls
```

```bash
multipass info --all
```

## ubuntu swapoff

- master node swapoff
  ```bash
  multipass exec k3s-master -- /bin/bash -c "sudo swapoff -a"
  ```

- worker1 node swapoff
  ```bash
  multipass exec k3s-worker1 -- /bin/bash -c "sudo swapoff -a"
  ```

- worker2 node swapoff
  ```bash
  multipass exec k3s-worker2 -- /bin/bash -c "sudo swapoff -a"
  ```

- registry node swapoff
  ```bash
  multipass exec registry -- /bin/bash -c "sudo swapoff -a"
  ```

## ubuntu 메모리 사용량 확인

- master node 메모리 사용량 확인
  ```bash
  multipass exec k3s-master -- /bin/bash -c "free -m"
  ```

- worker1 node 메모리 사용량 확인
  ```bash
  multipass exec k3s-worker1 -- /bin/bash -c "free -m"
  ```

- worker2 node 메모리 사용량 확인
  ```bash
  multipass exec k3s-worker2 -- /bin/bash -c "free -m"
  ```

- registry node 메모리 사용량 확인
  ```bash
  multipass exec registry -- /bin/bash -c "free -m"
  ```

## k3s master 설치

```bash
multipass exec k3s-master -- /bin/bash -c "curl -sfL https://get.k3s.io | K3S_KUBECONFIG_MODE="644" sh -"
```

## k3s master Token 정보 조회

```bash
multipass exec k3s-master -- /bin/bash -c "sudo cat /var/lib/rancher/k3s/server/node-token"
```

## k3s worker Node 설치

```bash
multipass exec k3s-node1 -- /bin/bash -c "curl -sfL https://get.k3s.io | K3S_TOKEN=\"<토큰 정보>\" K3S_URL=https://<마스터 노드 IP>:6443 sh -"
```

```bash
K3S_NODEIP_MASTER="https://$(multipass info k3s-master | grep "IPv4" | awk -F' ' '{print $2}'):6443"
K3S_TOKEN="$(multipass exec k3s-master -- /bin/bash -c "sudo cat /var/lib/rancher/k3s/server/node-token")"
multipass exec k3s-worker1 -- /bin/bash -c "curl -sfL https://get.k3s.io | K3S_TOKEN=${K3S_TOKEN} K3S_URL=${K3S_NODEIP_MASTER} sh -"
multipass exec k3s-worker2 -- /bin/bash -c "curl -sfL https://get.k3s.io | K3S_TOKEN=${K3S_TOKEN} K3S_URL=${K3S_NODEIP_MASTER} sh -"
```

## k3s 노드 정보를 확인 한다.

```bash
multipass exec k3s-master kubectl get nodes
```

## Copy multipass vm kubectl config locally

- 계속 multipass cli를 사용하기는 귀찮으므로 k3s master node에서 k3s.yaml 파일을 로컬 Mac으로 가져온다.
- kubectl은 미리 Mac에 설치 되어 있었고, 없다면 설치 해야 한다.

```bash
multipass copy-files k3s-master:/etc/rancher/k3s/k3s.yaml ${HOME}/.kube/k3s.yaml
sed -ie s,https://127.0.0.1:6443,${K3S_NODEIP_MASTER},g ${HOME}/.kube/k3s.yaml
kubectl --kubeconfig=${HOME}/.kube/k3s.yaml get nodes
```

## Configure cluster node roles and taint

```bash
NAME          STATUS   ROLES                  AGE   VERSION
k3s-master    Ready    control-plane,master   36m   v1.29.5+k3s1
k3s-worker1   Ready    <none>                 29m   v1.29.5+k3s1
k3s-worker2   Ready    <none>                 29m   v1.29.5+k3s1
```

```bash
kubectl --kubeconfig=${HOME}/.kube/k3s.yaml label node k3s-master node-role.kubernetes.io/master=""
kubectl --kubeconfig=${HOME}/.kube/k3s.yaml label node k3s-worker1 node-role.kubernetes.io/node=""
kubectl --kubeconfig=${HOME}/.kube/k3s.yaml label node k3s-worker2 node-role.kubernetes.io/node=""
kubectl --kubeconfig=${HOME}/.kube/k3s.yaml taint node k3s-master node-role.kubernetes.io/master=effect:NoSchedule
kubectl --kubeconfig=${HOME}/.kube/k3s.yaml get nodes -o wide
```

```bash
NAME          STATUS   ROLES                  AGE   VERSION
k3s-worker1   Ready    node                   33m   v1.29.5+k3s1
k3s-worker2   Ready    node                   32m   v1.29.5+k3s1
k3s-master    Ready    control-plane,master   39m   v1.29.5+k3s1
```