Multipass에 Kubernetes를 배포하고 Cloud-Init을 통해 자동화된 구성을 설정하려는군요! 훌륭한 선택입니다. 이를 위한 상세한 가이드를 제공해 드리겠습니다.

1. Cloud-Init 이해하기
Cloud-Init은 가상 머신의 초기 설정을 자동화하는 도구입니다.
YAML 파일을 통해 다양한 설정 (호스트 이름, 사용자, 패키지 설치, 서비스 시작 등)을 정의할 수 있습니다.
Multipass는 Cloud-Init을 지원하여 인스턴스 생성 시 YAML 파일을 지정할 수 있습니다.
2. YAML 파일 작성
다음은 Kubernetes 마스터 노드를 설치하는 간단한 Cloud-Init YAML 예시입니다. 실제 환경에 맞게 수정해야 합니다.

YAML
#cloud-config
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
코드를 사용할 때는 주의가 필요합니다.

write_files: 호스트 이름과 hosts 파일을 설정합니다.   
runcmd:
Docker, kubelet, kubeadm, kubectl 설치
스왑 비활성화
kubeadm init 실행 (pod 네트워크 CIDR 설정)
kubeconfig 파일 복사 및 권한 설정
3. Multipass를 이용한 인스턴스 생성
Bash
multipass launch --name my-master --cloud-init cloud-init.yaml ubuntu:22.04
코드를 사용할 때는 주의가 필요합니다.

--name: 인스턴스 이름 설정
--cloud-init: YAML 파일 지정
ubuntu:22.04: 이미지 선택
4. 노드 추가 및 클러스터 구성
kubeadm join 명령을 사용하여 추가 노드를 클러스터에 추가합니다.
**CNI (Container Network Interface)**를 설치하여 pod 네트워킹을 구성합니다. (Flannel, Calico 등)
Ingress Controller를 설치하여 서비스에 대한 외부 접근을 설정합니다. (Nginx Ingress Controller 등)
5. 고급 설정
Network: flannel, calico 등 다양한 CNI를 사용하여 네트워킹을 구성할 수 있습니다.
Storage: Persistent Volume을 사용하여 영구 저장소를 제공할 수 있습니다.
Security: RBAC (Role-Based Access Control)를 사용하여 권한을 관리하고, 네트워크 정책을 설정할 수 있습니다.
High Availability: Control Plane 노드를 복제하여 고가용성을 확보할 수 있습니다.
주의 사항
YAML 파일: YAML 문법을 정확히 지켜야 합니다.
패키지: 필요한 패키지를 모두 설치해야 합니다.
kubeadm: kubeadm 명령을 실행할 때 공식 문서를 참고하여 정확한 옵션을 사용해야 합니다.
네트워킹: 네트워킹 설정은 환경에 따라 달라질 수 있습니다.
보안: Kubernetes 클러스터의 보안을 위해 적절한 조치를 취해야 합니다.

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


```md
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


eyJhbGciOiJSUzI1NiIsImtpZCI6IjAtcFk0RnRjdkRpc3NqTl8tSmhOZEl2c0J0T1ZKeHBTcmNYSXNKaExhX2sifQ.eyJhdWQiOlsiaHR0cHM6Ly9rdWJlcm5ldGVzLmRlZmF1bHQuc3ZjLmNsdXN0ZXIubG9jYWwiXSwiZXhwIjoxNzI5MDc2NjUzLCJpYXQiOjE3MjkwNzMwNTMsImlzcyI6Imh0dHBzOi8va3ViZXJuZXRlcy5kZWZhdWx0LnN2Yy5jbHVzdGVyLmxvY2FsIiwia3ViZXJuZXRlcy5pbyI6eyJuYW1lc3BhY2UiOiJrdWJlcm5ldGVzLWRhc2hib2FyZCIsInNlcnZpY2VhY2NvdW50Ijp7Im5hbWUiOiJhZG1pbi11c2VyIiwidWlkIjoiODk3ZDcyNjctNTFjMS00NGM1LWEyYWMtODE3ODM2YjAwMDZhIn19LCJuYmYiOjE3MjkwNzMwNTMsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDprdWJlcm5ldGVzLWRhc2hib2FyZDphZG1pbi11c2VyIn0.hzP1Y_sBviimc1EqwKWnn3psOTNmoSVN3Cm0YE1xWZzWTx4ahDVDY63V_vpcjcTJM6nNSKtVq2ACv7NawTm8XOGdxYdgDH1gv_B5Xdi8qDPvgVGUqcfwNaFpG_NnBDirG4VbgPMRK7lx949-oNOFhvyLJZD3mS_B6A_IC2_fDW622feZF5boSrnQ1XCHt2XdJLQB33CkY9eDsH5RzoVbEZYpVO822gNmMq99tj5qJZ2X8mXTgiSoPTyY5YKS589MRafqx3cugdObvyHApofsrW63NdrixO4I4RJ8yqdm52fqdVG9FppvKoLH0POnd_yZSCVguHLRaBc7QwFoWawj0g
```