---
title: "Multipass - Install K3S"
date: 2024-05-20
categories: [Kubernetes, Install]
tags: [Kubernetes, K3S, Multipass, Ubuntu, Linux]
---

## VM deployments used multipass on mac
```
multipass launch --name k3s-master --cpus 2 --memory 4G --disk 50G focal
multipass launch --name k3s-worker1 --cpus 2 --memory 4G --disk 50G focal
multipass launch --name k3s-worker2 --cpus 2 --memory 4G --disk 50G focal
multipass launch --name registry --cpus 2 --memory 4G --disk 100G focal
```

## ubuntu 구동 확인
```
multipass list

or

multipass ls

of

multipass info --all
```

## ubuntu swapoff
```
multipass exec k3s-master -- /bin/bash -c "sudo swapoff -a"
multipass exec k3s-worker1 -- /bin/bash -c "sudo swapoff -a"
multipass exec k3s-worker2 -- /bin/bash -c "sudo swapoff -a"
multipass exec registry -- /bin/bash -c "sudo swapoff -a"
```

## ubuntu 메모리 사용량 확인
```
multipass exec k3s-master -- /bin/bash -c "free -m"
multipass exec k3s-worker1 -- /bin/bash -c "free -m"
multipass exec k3s-worker2 -- /bin/bash -c "free -m"
multipass exec registry -- /bin/bash -c "free -m"
```

## k3s master 설치
```
multipass exec k3s-master -- /bin/bash -c "curl -sfL https://get.k3s.io | K3S_KUBECONFIG_MODE="644" sh -"
```

## k3s master Token 정보 조회
```
multipass exec k3s-master -- /bin/bash -c "sudo cat /var/lib/rancher/k3s/server/node-token"
```

## k3s worker Node 설치
```
multipass exec k3s-node1 -- /bin/bash -c "curl -sfL https://get.k3s.io | K3S_TOKEN=\"<토큰 정보>\" K3S_URL=https://<마스터 노드 IP>:6443 sh -"
```

```
K3S_NODEIP_MASTER="https://$(multipass info k3s-master | grep "IPv4" | awk -F' ' '{print $2}'):6443"
K3S_TOKEN="$(multipass exec k3s-master -- /bin/bash -c "sudo cat /var/lib/rancher/k3s/server/node-token")"
multipass exec k3s-worker1 -- /bin/bash -c "curl -sfL https://get.k3s.io | K3S_TOKEN=${K3S_TOKEN} K3S_URL=${K3S_NODEIP_MASTER} sh -"
multipass exec k3s-worker2 -- /bin/bash -c "curl -sfL https://get.k3s.io | K3S_TOKEN=${K3S_TOKEN} K3S_URL=${K3S_NODEIP_MASTER} sh -"
```

## k3s 노드 정보를 확인 한다.
```
multipass exec k3s-master kubectl get nodes
```

## Copy multipass vm kubectl config locally
- 계속 multipass cli를 사용하기는 귀찮으므로 k3s master node에서 k3s.yaml 파일을 로컬 Mac으로 가져온다.
- kubectl은 미리 Mac에 설치 되어 있었고, 없다면 설치 해야 한다.

```
multipass copy-files k3s-master:/etc/rancher/k3s/k3s.yaml ${HOME}/.kube/k3s.yaml
sed -ie s,https://127.0.0.1:6443,${K3S_NODEIP_MASTER},g ${HOME}/.kube/k3s.yaml
kubectl --kubeconfig=${HOME}/.kube/k3s.yaml get nodes
```

## Configure cluster node roles and taint

```
NAME          STATUS   ROLES                  AGE   VERSION
k3s-master    Ready    control-plane,master   36m   v1.29.5+k3s1
k3s-worker1   Ready    <none>                 29m   v1.29.5+k3s1
k3s-worker2   Ready    <none>                 29m   v1.29.5+k3s1
```

```
kubectl --kubeconfig=${HOME}/.kube/k3s.yaml label node k3s-master node-role.kubernetes.io/master=""
kubectl --kubeconfig=${HOME}/.kube/k3s.yaml label node k3s-worker1 node-role.kubernetes.io/node=""
kubectl --kubeconfig=${HOME}/.kube/k3s.yaml label node k3s-worker2 node-role.kubernetes.io/node=""
kubectl --kubeconfig=${HOME}/.kube/k3s.yaml taint node k3s-master node-role.kubernetes.io/master=effect:NoSchedule
kubectl --kubeconfig=${HOME}/.kube/k3s.yaml get nodes -o wide
```

```
NAME          STATUS   ROLES                  AGE   VERSION
k3s-worker1   Ready    node                   33m   v1.29.5+k3s1
k3s-worker2   Ready    node                   32m   v1.29.5+k3s1
k3s-master    Ready    control-plane,master   39m   v1.29.5+k3s1
```

