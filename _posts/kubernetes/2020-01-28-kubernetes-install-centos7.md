---
# layout: post
title: "Kubernetes install Centos7"
date: 2020-01-28
# excerpt: "Kubernetes Centos7 설치법"
categories: [Kubernetes, Install, Centos]
tags: [Kubernetes, Centos7, Install]
# comments: true
---

## Configure the master node
Preparation
Run the following commands to pass bridged IP traffic to iptables chains
```
[root@test-vm1 ~]$ yum update -y
[root@test-vm1 ~]$ modprobe br_netfilter

[root@test-vm1 ~]$ cat <<EOF >  /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
[root@test-vm1 ~]$ sysctl --system
```
2a) Allow the necessary ports trough the firewall when you’re working in an unsafe environment or in production
```
firewall-cmd --zone=public --add-port=6443/tcp --permanent
firewall-cmd --zone=public --add-port=80/tcp --permanent
firewall-cmd --zone=public --add-port=443/tcp --permanent
firewall-cmd --zone=public --add-port=18080/tcp --permanent
firewall-cmd --zone=public --add-port=10254/tcp --permanent
firewall-cmd --reload
```
2b) If you’re just testing this in a safe lab environment you can disable the firewall.
```
[root@test-vm1 ~]$ systemctl stop firewalld && systemctl disable firewalld
```
Check if selinux is Enabled with the following command
```
[root@test-vm1 ~]$ sestatus
```
If the current mode is enforcing then you need to change the mode to permissive or disabled.
```
[root@test-vm1 ~]$ sed -i --follow-symlinks 's/SELINUX=enforcing/SELINUX=permissive/g' /etc/sysconfig/selinux
[root@test-vm1 ~]$ setenforce 0
```
Kubernetes doesn’t want to use swap so it can offer the best performance, so we have to disable it.
```
[root@test-vm1 ~]$ swapoff -a
```
```
[root@test-vm1 ~]$ vi /etc/fstab


#/dev/mapper/centos-swap swap                    swap    defaults        0 0
```
6a) Add the kubernetes repository to yum
```
[root@test-vm1 ~]$ cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOF
```
6b) Add the official docker repo to yum
```
[root@test-vm1 ~]$ yum remove docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-selinux docker-engine-selinux docker-engine
[root@test-vm1 ~]$ yum install -y yum-utils device-mapper-persistent-data lvm2
[root@test-vm1 ~]$ yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```
Installation
Install kubeadm and docker
```
[root@test-vm1 ~]$ yum install -y ebtables ethtool docker-ce kubelet kubeadm kubectl
```
Start docker and enable it at boot
```
[root@test-vm1 ~]$ systemctl start docker && systemctl enable docker
```
Start kubelet and enable it at boot
```
[root@test-vm1 ~]$ systemctl start kubelet && systemctl enable kubelet
```
Initialize kubernetes. Be aware, for some pod network implementations you might need to add a specific ‘–pod-network-cidr=’ setting. Please check https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/#pod-network before continuing.
```
[root@test-vm1 ~]$ kubeadm init --pod-network-cidr=10.244.0.0/16
I0715 12:50:01.543998    1958 feature_gate.go:230] feature gates: &{map[]}
[init] using Kubernetes version: v1.11.0
[preflight] running pre-flight checks
I0715 12:50:01.577212    1958 kernel_validator.go:81] Validating kernel version
I0715 12:50:01.577289    1958 kernel_validator.go:96] Validating kernel config
[preflight/images] Pulling images required for setting up a Kubernetes cluster
[preflight/images] This might take a minute or two, depending on the speed of your internet connection
[preflight/images] You can also perform this action in beforehand using 'kubeadm config images pull'
[kubelet] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[preflight] Activating the kubelet service
[certificates] Generated ca certificate and key.
[certificates] Generated apiserver certificate and key.
[certificates] apiserver serving cert is signed for DNS names [test-vm1.home.lcl kubernetes kubernetes.default kubernetes.default.svc kubernetes.default.svc.cluster.local] and IPs [10.96.0.1 192.168.1.221]
[certificates] Generated apiserver-kubelet-client certificate and key.
[certificates] Generated sa key and public key.
[certificates] Generated front-proxy-ca certificate and key.
[certificates] Generated front-proxy-client certificate and key.
[certificates] Generated etcd/ca certificate and key.
[certificates] Generated etcd/server certificate and key.
[certificates] etcd/server serving cert is signed for DNS names [test-vm1.home.lcl localhost] and IPs [127.0.0.1 ::1]
[certificates] Generated etcd/peer certificate and key.
[certificates] etcd/peer serving cert is signed for DNS names [test-vm1.home.lcl localhost] and IPs [192.168.1.221 127.0.0.1 ::1]
[certificates] Generated etcd/healthcheck-client certificate and key.
[certificates] Generated apiserver-etcd-client certificate and key.
[certificates] valid certificates and keys now exist in "/etc/kubernetes/pki"
[kubeconfig] Wrote KubeConfig file to disk: "/etc/kubernetes/admin.conf"
[kubeconfig] Wrote KubeConfig file to disk: "/etc/kubernetes/kubelet.conf"
[kubeconfig] Wrote KubeConfig file to disk: "/etc/kubernetes/controller-manager.conf"
[kubeconfig] Wrote KubeConfig file to disk: "/etc/kubernetes/scheduler.conf"
[controlplane] wrote Static Pod manifest for component kube-apiserver to "/etc/kubernetes/manifests/kube-apiserver.yaml"
[controlplane] wrote Static Pod manifest for component kube-controller-manager to "/etc/kubernetes/manifests/kube-controller-manager.yaml"
[controlplane] wrote Static Pod manifest for component kube-scheduler to "/etc/kubernetes/manifests/kube-scheduler.yaml"
[etcd] Wrote Static Pod manifest for a local etcd instance to "/etc/kubernetes/manifests/etcd.yaml"
[init] waiting for the kubelet to boot up the control plane as Static Pods from directory "/etc/kubernetes/manifests"
[init] this might take a minute or longer if the control plane images have to be pulled
[apiclient] All control plane components are healthy after 43.502080 seconds
[uploadconfig] storing the configuration used in ConfigMap "kubeadm-config" in the "kube-system" Namespace
[kubelet] Creating a ConfigMap "kubelet-config-1.11" in namespace kube-system with the configuration for the kubelets in the cluster
[markmaster] Marking the node test-vm1.home.lcl as master by adding the label "node-role.kubernetes.io/master=''"
[markmaster] Marking the node test-vm1.home.lcl as master by adding the taints [node-role.kubernetes.io/master:NoSchedule]
[patchnode] Uploading the CRI Socket information "/var/run/dockershim.sock" to the Node API object "test-vm1.home.lcl" as an annotation
[bootstraptoken] using token: e8yb38.htt4pz8dmxq77jha
[bootstraptoken] configured RBAC rules to allow Node Bootstrap tokens to post CSRs in order for nodes to get long term certificate credentials
[bootstraptoken] configured RBAC rules to allow the csrapprover controller automatically approve CSRs from a Node Bootstrap Token
[bootstraptoken] configured RBAC rules to allow certificate rotation for all node client certificates in the cluster
[bootstraptoken] creating the "cluster-info" ConfigMap in the "kube-public" namespace
[addons] Applied essential addon: CoreDNS
[addons] Applied essential addon: kube-proxy

Your Kubernetes master has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

You can now join any number of machines by running the following on each node
as root:

  kubeadm join 192.168.1.221:6443 --token e8yb38.hqq4pz9dmlq77jha --discovery-token-ca-cert-hash sha256:50b01f19d8060ba593a009d134912d62b95ca80fdbe76f3995c8ba6c4a92c705
```
Create admin user
```
[root@test-vm1 ~]$ groupadd -g 1000 k8sadm
[root@test-vm1 ~]$ useradd -u 1000 -g k8sadm -G wheel k8sadm
[root@test-vm1 ~]$ passwd k8sadm
Changing password for user k8sadm.
New password:
Retype new password:
passwd: all authentication tokens updated successfully.
[root@test-vm1 ~]$ su - k8sadm
[k8sadm@test-vm1 ~]$ mkdir -p $HOME/.kube
[k8sadm@test-vm1 ~]$ sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
[k8sadm@test-vm1 ~]$ sudo chown $(id -u):$(id -g) $HOME/.kube/config
```
Configure the pod network
```
[k8sadm@test-vm1 ~]$ kubectl get nodes
NAME                STATUS     ROLES     AGE       VERSION
test-vm1.home.lcl   NotReady   master    2m        v1.11.0
```
```
[k8sadm@test-vm1 ~]$ kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```
```
[k8sadm@test-vm1 ~]$ kubectl get nodes
NAME                STATUS    ROLES     AGE       VERSION
test-vm1.home.lcl   Ready     master    3m        v1.11.0
```
```
[k8sadm@test-vm1 ~]$ kubectl get pods --all-namespaces
NAMESPACE     NAME                                        READY     STATUS    RESTARTS   AGE
kube-system   coredns-78fcdf6894-g7rg4                    1/1       Running   0          2h
kube-system   coredns-78fcdf6894-vr4xm                    1/1       Running   0          2h
kube-system   etcd-test-vm1.home.lcl                      1/1       Running   1          2h
kube-system   kube-apiserver-test-vm1.home.lcl            1/1       Running   1          2h
kube-system   kube-controller-manager-test-vm1.home.lcl   1/1       Running   1          2h
kube-system   kube-proxy-524ql                            1/1       Running   1          2h
kube-system   kube-scheduler-test-vm1.home.lcl            1/1       Running   1          2h
kube-system   kube-flannel-ds-45d87                       1/1       Running   1          2h
kube-system   kube-flannel-ds-bqh8j                       1/1       Running   1          2h
kube-system   kube-flannel-ds-dfldc                       1/1       Running   1          2h
```
## Configure the worker nodes
Repeat steps 1 to 6 on all worker nodes

Install docker and kubeadm
```
[root@test-vm2 ~]$ yum install -y kubeadm docker-ce kubelet
[root@test-vm3 ~]$ yum install -y kubeadm docker-ce kubelet
```
Start docker and enable it at boot
```
[root@test-vm2 ~]$ systemctl start docker && systemctl enable docker
[root@test-vm3 ~]$ systemctl start docker && systemctl enable docker
```
Start kubelet and enable it at boot
```
[root@test-vm2 ~]$ systemctl start kubelet && systemctl enable kubelet
[root@test-vm3 ~]$ systemctl start kubelet && systemctl enable kubelet
```
Join the workers to the master
use the command kubeadm returned in step 10
```
[root@test-vm2 ~]$ kubeadm join 192.168.1.221:6443 --token e8yb38.hqq4pz9dmlq77jha --discovery-token-ca-cert-hash sha256:50b01f19d8060ba593a009d134912d62b95ca80fdbe76f3995c8ba6c4a92c705
[root@test-vm3 ~]$ kubeadm join 192.168.1.221:6443 --token e8yb38.hqq4pz9dmlq77jha --discovery-token-ca-cert-hash sha256:50b01f19d8060ba593a009d134912d62b95ca80fdbe76f3995c8ba6c4a92c705
```
verify the status
after a little while you will see
```
[k8sadm@test-vm1 ~]$ kubectl get nodes
NAME                STATUS    ROLES     AGE       VERSION
test-vm1.home.lcl   Ready     master    26m       v1.11.1
test-vm2.home.lcl   Ready     <none>    1m        v1.11.1
test-vm3.home.lcl   Ready     <none>    1m        v1.11.1
```
