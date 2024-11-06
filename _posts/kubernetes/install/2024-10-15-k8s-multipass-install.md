---
title: "[Kubernetes] Install Kubernetes in the Multipass"
date: 2024-10-15
categories: [Kubernetes, Install]
tags: [Kubernetes, Install, Multipass]
---

> [Multipass 설명 참고](https://kyungryeol-yoon.github.io/posts/multipass/)
{: .prompt-info }

## cloud-init yaml 구성

### master.yaml

```yaml
package_update: true
package_upgrade: true
packages:
  - docker.io
  - apt-transport-https
  - ca-certificates
  - curl
  - ntpdate

runcmd:
  - sudo swapoff -a
  - sudo ntpdate ntp.ubuntu.com
  - sudo systemctl enable containerd
  - sudo systemctl start containerd
  - sudo mkdir -p /etc/apt/keyrings
  - curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
  - echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /" | sudo tee /etc/apt/sources.list.d/kubernetes.list
  - sudo apt update
  - sudo apt install -y kubelet kubeadm kubectl
  - sudo apt-mark hold kubelet kubeadm kubectl
  - sudo systemctl enable kubelet
  - sudo kubeadm init
  - mkdir -p /home/ubuntu/.kube
  - sudo cp -i /etc/kubernetes/admin.conf /home/ubuntu/.kube/config
  - sudo chown -R ubuntu:ubuntu /home/ubuntu/.kube
  - sudo kubeadm token create --print-join-command > /home/ubuntu/kubeadm_join_cmd.sh
  - sudo chown ubuntu:ubuntu /home/ubuntu/kubeadm_join_cmd.sh
  - chmod +x /home/ubuntu/kubeadm_join_cmd.sh
  - |
    sudo bash -c 'cat <<EOF > /home/ubuntu/k8s-post-init.sh
    #!/bin/bash
    export KUBECONFIG=/home/ubuntu/.kube/config
    sleep 60
    kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml
    kubectl taint nodes --all node-role.kubernetes.io/control-plane-
    EOF'
  - sudo chown ubuntu:ubuntu /home/ubuntu/k8s-post-init.sh
  - sudo chmod +x /home/ubuntu/k8s-post-init.sh
  - sudo -u ubuntu /home/ubuntu/k8s-post-init.sh
```

#### kubeadm 세부 설정 참고

- pod 네트워크 CIDR 설정
  - Calico 기반 구축
    - pod-network-cidr=192.168.0.0/16

  - Flannel 기반 구축
    - pod-network-cidr=10.244.0.0/16

  - Cilium 기반 구축
    - pod-network-cidr=10.0.0.0/8

```bash
sudo kubeadm init --pod-network-cidr=10.244.0.0/12 --apiserver-advertise-address=192.168.0.55
```

- --pod-network-cidr: pod 간 통신할 IP 주소를 지정
- --apiserver-advertise-address: Control-plane의 api-server가 사용할 IP 주소. 지정하지 않으면 default network interface 주소를 사용
- --service-cidr: Cluster 내에서 Application 간 통신을 위해 사용되며, 고유한 IP 주소를 가지게 된다. 기본값으로 10.96.0.0/12을 가진다.
- pod-network-cidr과 --service-cidr 주소를 겹치지 않게 설정. 겹칠 경우 Kubernetes가 중복되지 않게 배치함

### worker.yaml

```yaml
package_update: true
package_upgrade: true
packages:
  - docker.io
  - apt-transport-https
  - ca-certificates
  - curl
  - ntpdate

runcmd:
  - sudo swapoff -a
  - sudo ntpdate ntp.ubuntu.com
  - sudo systemctl enable containerd
  - sudo systemctl start containerd
  - sudo mkdir -p /etc/apt/keyrings
  - curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
  - echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /" | sudo tee /etc/apt/sources.list.d/kubernetes.list
  - sudo apt update
  - sudo apt install -y kubelet kubeadm kubectl
  - sudo systemctl enable kubelet
```

### Instance 생성

```bash
multipass launch focal --name mp-master --memory 4G --disk 50G --cpus 2 --cloud-init mp-master.yaml
multipass launch focal --name mp-master --memory 4G --disk 50G --cpus 2 --network name=multipass,mode=manual

multipass launch focal --name mp-worker-1 --memory 4G --disk 50G --cpus 2 --cloud-init mp-worker.yaml
multipass launch focal --name mp-worker-1 --memory 4G --disk 50G --cpus 2 --network name=multipass,mode=manual

multipass launch focal --name mp-worker-2 --memory 4G --disk 50G --cpus 2 --cloud-init mp-worker.yaml
multipass launch focal --name mp-worker-2 --memory 4G --disk 50G --cpus 2 --network name=multipass,mode=manual
```

## Network - Static IP

### Network for Windows

- 생성한 VM 접속하여 아래와 같이 설정 및 추가
  ```bash
  sudo vi /etc/netplan
  ```
  ```yaml
  network:
      ethernets:
          eth0:
              dhcp4: true
              match:
                  macaddress: 52:54:00:f1:f0:e8
              set-name: eth0
  --- 추가
          eth1:
              addresses: [192.168.0.55/24]
              routes:
                - to: default
                  via: 192.168.0.1
              nameservers:
                  addresses: [8.8.8.8, 1.1.1.1]
  ---
      version: 2
  ```

- --network name=multipass,mode=manual | (아래는 별도 추가)
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
              addresses: [192.168.0.55/24]
              gateway4: 192.168.0.1
              dhcp4: no
  ---
      version: 2
  ```

- --network name=multipass | mode 안했을 때 (아래는 별도 추가)
  ```yaml
  network:
      ethernets:
          default:
              dhcp4: true
              match:
                  macaddress: 52:54:00:25:1d:ab
          extra0:
              dhcp4: true
              dhcp4-overrides:
                  route-metric: 200
              match:
                  macaddress: 52:54:00:09:13:61
              optional: true

  --- 추가
          eth1:
              addresses: [192.168.0.55/24]
              gateway4: 192.168.0.1
              dhcp4: no
  ---
      version: 2
  ```

#### Restart Network

- 아래와 같이 network 적용 또는 instance를 재시작
  ```bash
  sudo netplan apply
  ```

### Network for MacOS

- Mac Terminal에서 아래와 같이 설정 및 추가
  ```bash
  sudo vi /var/db/dhcpd_leases

  {
    name=mp-master
    ip_address=192.168.64.55
    hw_address=ff,f1:f5:dd:7f:0:2:0:0:ab:11:fa:4c:c0:e7:17:a6:ae:9a
    identifier=ff,f1:f5:dd:7f:0:2:0:0:ab:11:fa:4c:c0:e7:17:a6:ae:9a
    lease=0x671d9fc1
  }
  {
    name=mp-worker-1
    ip_address=192.168.64.56
    hw_address=ff,f1:f5:dd:7f:0:2:0:0:ab:11:50:ed:1b:91:59:3e:45:b4
    identifier=ff,f1:f5:dd:7f:0:2:0:0:ab:11:50:ed:1b:91:59:3e:45:b4
    lease=0x671daf7a
  }
  ```

#### Restart Instance
```bash
multipass restart mp-master
multipass restart mp-worker-1
```

## Add Cluster Node : Join

- kubeadm_join_cmd.sh 파일 받아서 worker로 전송
  ```bash
  multipass transfer mp-master:/home/ubuntu/kubeadm_join_cmd.sh ./
  multipass transfer kubeadm_join_cmd.sh mp-worker-1:/home/ubuntu
  multipass transfer kubeadm_join_cmd.sh mp-worker-2:/home/ubuntu
  ```

- 각 worker 접속하여 join
  ```bash
  sudo ./kubeadm_join_cmd.sh
  ```