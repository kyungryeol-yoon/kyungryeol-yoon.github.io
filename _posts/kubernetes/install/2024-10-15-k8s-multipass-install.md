---
title: "[Kubernetes] Install Kubernetes in the Multipass"
date: 2024-10-15
categories: [Kubernetes, Install]
tags: [Kubernetes, Install, Multipass]
---

> [Multipass 설명 참고](https://kyungryeol-yoon.github.io/posts/multipass/)
{: .prompt-info }

1. Cloud-Init 이해하기
Cloud-Init은 가상 머신의 초기 설정을 자동화하는 도구입니다.
YAML 파일을 통해 다양한 설정 (호스트 이름, 사용자, 패키지 설치, 서비스 시작 등)을 정의할 수 있습니다.
Multipass는 Cloud-Init을 지원하여 인스턴스 생성 시 YAML 파일을 지정할 수 있습니다.

2. YAML 파일 작성
다음은 Kubernetes 마스터 노드를 설치하는 간단한 Cloud-Init YAML 예시입니다. 실제 환경에 맞게 수정해야 합니다.

- cloud-config.YAML
```yaml
write_files:
  - path: /etc/hostname
    content: your-master-node
  - path: /etc/hosts
    content: '127.0.0.1   localhost your-master-node\n'
runcmd:
  - 'apt update && apt install -y docker.io kubelet kubeadm kubectl'
  - 'swapoff -a' # 스왑 비활성화 (Kubernetes 권장)
  - 'kubeadm init --pod-network-cidr=10.244.0.0/16'
  - 'mkdir -p $HOME/.kube'
  - 'sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config'
  - 'sudo chown $(id -u):$(id -g) $HOME/.kube/config'
```

- write_files: 호스트 이름과 hosts 파일을 설정합니다.   
- runcmd:
- Docker, kubelet, kubeadm, kubectl 설치
- 스왑 비활성화
- kubeadm init 실행 (pod 네트워크 CIDR 설정)
- kubeconfig 파일 복사 및 권한 설정

3. Multipass를 이용한 인스턴스 생성
Bash
multipass launch --name my-master --cloud-init cloud-init.yaml ubuntu:22.04
코드를 사용할 때는 주의가 필요합니다.

- --name: 인스턴스 이름 설정
- --cloud-init: YAML 파일 지정
- ubuntu:22.04: 이미지 선택

4. 노드 추가 및 클러스터 구성
kubeadm join 명령을 사용하여 추가 노드를 클러스터에 추가합니다.
**CNI (Container Network Interface)**를 설치하여 pod 네트워킹을 구성합니다. (Flannel, Calico 등)
Ingress Controller를 설치하여 서비스에 대한 외부 접근을 설정합니다. (Nginx Ingress Controller 등)

- master.yaml
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


- worker.yaml
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


- network
```yaml
# /etc/netplan
network:
    ethernets:
        eth0:
            dhcp4: true
            match:
                macaddress: 52:54:00:f1:f0:e8
            set-name: eth0
        eth1:
            addresses: [192.168.0.55/24]
            routes:
              - to: default
                via: 192.168.0.1
            nameservers:
                addresses: [8.8.8.8, 1.1.1.1]
    version: 2
---'--network name=multipass,mode=manual | (아래는 별도 추가)'
network:
    ethernets:
        eth0:
            dhcp4: true
            dhcp6: true
            match:
                macaddress: 52:54:00:80:6b:21
            set-name: eth0
        eth1:
            addresses: [192.168.0.55/24]
            gateway4: 192.168.0.1
            dhcp4: no
    version: 2
version: 2
---'--network name=multipass | mode 안했을 때(아래는 별도 추가)'
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
        eth1:
            addresses: [192.168.0.55/24]
            gateway4: 192.168.0.1
            dhcp4: no
    version: 2
```

- for mac network
```yaml
sudo vi /var/db/dhcpd_leases

{
	name=mp-worker-1
	ip_address=192.168.64.4
	hw_address=ff,f1:f5:dd:7f:0:2:0:0:ab:11:50:ed:1b:91:59:3e:45:b4
	identifier=ff,f1:f5:dd:7f:0:2:0:0:ab:11:50:ed:1b:91:59:3e:45:b4
	lease=0x671daf7a
}
{
	name=mp-master
	ip_address=192.168.64.3
	hw_address=ff,f1:f5:dd:7f:0:2:0:0:ab:11:8f:ed:bd:8d:2d:2d:2a:17
	identifier=ff,f1:f5:dd:7f:0:2:0:0:ab:11:8f:ed:bd:8d:2d:2d:2a:17
	lease=0x671daf43
}
{
	name=mp-master
	ip_address=192.168.64.2
	hw_address=ff,f1:f5:dd:7f:0:2:0:0:ab:11:b2:bc:2c:c6:2b:87:cf:5a
	identifier=ff,f1:f5:dd:7f:0:2:0:0:ab:11:b2:bc:2c:c6:2b:87:cf:5a
	lease=0x671dae13
}
{
	name=mp-master
	ip_address=192.168.64.55
	hw_address=ff,f1:f5:dd:7f:0:2:0:0:ab:11:fa:4c:c0:e7:17:a6:ae:9a
	identifier=ff,f1:f5:dd:7f:0:2:0:0:ab:11:fa:4c:c0:e7:17:a6:ae:9a
	lease=0x671d9fc1
}
```


```
multipass launch focal --name mp-master --memory 4G --disk 50G --cpus 2 --cloud-init mp-master.yaml
multipass launch focal --name mp-master --memory 4G --disk 50G --cpus 2 --network name=multipass,mode=manual

multipass launch focal --name mp-worker-1 --memory 4G --disk 50G --cpus 2 --cloud-init mp-worker.yaml
multipass launch focal --name mp-worker-1 --memory 4G --disk 50G --cpus 2 --network name=multipass,mode=manual

multipass launch focal --name mp-worker-2 --memory 4G --disk 50G --cpus 2 --cloud-init mp-worker.yaml
multipass launch focal --name mp-worker-2 --memory 4G --disk 50G --cpus 2 --network name=multipass,mode=manual

multipass launch -n ubuntu_test -c 2 -m 2G -d 10G --network name=multipass,mode=manual

# 네트워크 변경 sudo netplan apply

multipass transfer mp-master:/home/ubuntu/kubeadm_join_cmd.sh ./
multipass transfer kubeadm_join_cmd.sh mp-worker-1:/home/ubuntu
multipass transfer kubeadm_join_cmd.sh mp-worker-2:/home/ubuntu

sudo ./kubeadm_join_cmd.sh

```