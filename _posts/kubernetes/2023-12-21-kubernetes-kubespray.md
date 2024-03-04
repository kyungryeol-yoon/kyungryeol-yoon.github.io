---
title: "Kubernetes kubespray"
date: 2023-12-21
categories: [Kubernetes, Kubespray]
tags: [Kubernetes, Kubespray]
---

### Kubespray?
- Kubespray는 Ansible 플레이북, 인벤토리, 프로비저닝 도구와 일반적인 운영체제, 쿠버네티스 클러스터의 설정 관리 작업에 대한 도메인 지식의 결합으로 만들어졌다. Kubespray는 아래와 같은 기능을 제공한다.

- Kubespray 지원 사항
  - 고가용성을 지닌 클러스터
  - 구성 가능 (인스턴스를 위한 네트워크 플러그인 선택)
  - 대부분의 인기있는 리눅스 배포판들에 대한 지원
    - Flatcar Container Linux by Kinvolk
    - Debian Bullseye, Buster, Jessie, Stretch
    - Ubuntu 16.04, 18.04, 20.04, 22.04
    - CentOS/RHEL 7, 8, 9
    - Fedora 35, 36
    - Fedora CoreOS
    - openSUSE Leap 15.x/Tumbleweed
    - Oracle Linux 7, 8, 9
    - Alma Linux 8, 9
    - Rocky Linux 8, 9
    - Kylin Linux Advanced Server V10
    - Amazon Linux 2
  - 지속적인 통합 (CI) 테스트

### Vagrant 설정
- vagrant init
- vagrant up
- vagrant status

```
require "yaml"  

CONFIG = YAML.load_file(File.join(File.dirname(__FILE__), "config.yaml"))

Vagrant.configure("2") do |config|
  # Use the same SSH key for all machines
  config.ssh.insert_key = false

  # masters
  CONFIG["masters"].each do |master|
    config.vm.define master["name"] do |cfg|
      cfg.vm.box = master["box"]
      cfg.vm.network "private_network", ip: master["ip"], virtualbox_intnet: true
      cfg.vm.hostname = master["hostname"]

      cfg.vm.provider "virtualbox" do |v|
        v.memory = master["memory"]
        v.cpus = master["cpu"]
        v.name = master["name"]
      end
      cfg.vm.provision "shell", inline: <<-SCRIPT
        sed -i -e "s/PasswordAuthentication no/PasswordAuthentication yes/g" /etc/ssh/sshd _config
        systemctl restart sshd
      SCRIPT

      # set timezone & disable swap memory, ufw & enable ip forwarding
      cfg.vm.provision "shell", inline: <<-SCRIPT
        sudo apt-get update
        sudo timedatectl set-timezone "Asia/Seoul"
        sudo swapoff -a
        sudo sed -i "/swap/d" /etc/fstab
        sudo systemctl stop ufw
        sudo systemctl disable ufw
        sudo sed -i "s/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/" /etc/sysctl.conf
        sudo sysctl -p
      SCRIPT

      # install python
      cfg.vm.provision "shell", inline: <<-SCRIPT
        sudo apt install python3-pip python3-setuptools virtualenv -y
        sudo apt-get install -y conntrack
        sudo apt-get install -y socat
      SCRIPT
    end
  end
  
  # worker nodes
  CONFIG["workers"].each do |worker|
    config.vm.define worker["name"] do |cfg|
      cfg.vm.box = worker["box"]
      cfg.vm.network "private_network", ip: worker["ip"], virtualbox_intnet: true
      cfg.vm.hostname = worker["hostname"]
      
      cfg.vm.provider "virtualbox" do |v|
        v.memory = worker["memory"]
        v.cpus = worker["cpu"]
        v.name = worker["name"]
      end
      cfg.vm.provision "shell", inline: <<-SCRIPT
        sed -i -e "s/PasswordAuthentication no/PasswordAuthentication yes/g" /etc/ssh/sshd_config
        systemctl restart sshd
      SCRIPT

      # set timezone & disable swap memory & ufw & enable ip forwarding
      cfg.vm.provision "shell", inline: <<-SCRIPT
        sudo apt-get update
        sudo timedatectl set-timezone "Asia/Seoul"
        sudo swapoff -a
        sudo sed -i "/swap/d" /etc/fstab
        sudo systemctl stop ufw
        sudo systemctl disable ufw
        sudo sed -i "s/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/" /etc/sysctl.conf
        sudo sysctl -p
      SCRIPT

      cfg.vm.provision "shell", inline: <<-SCRIPT
        sudo apt-get install -y conntrack
        sudo apt-get install -y socat
      SCRIPT
    end
  end
end
```

- config.yaml

```
masters:
  - name: k8s-master-1
    box: generic/ubuntu2204
    hostname: k8s-master-1
    ip: 192.168.10.100
    memory: 2048
    cpu: 2

  - name: k8s-master-2
    box: generic/ubuntu2204
    hostname: k8s-master-2
    ip: 192.168.10.110
    memory: 2048
    cpu: 2

  - name: k8s-master-3
    box: generic/ubuntu2204
    hostname: k8s-master-3
    ip: 192.168.10.120
    memory: 2048
    cpu: 2

workers:
  - name: k8s-worker-1
    box: generic/ubuntu2204
    hostname: k8s-worker-1
    ip: 192.168.10.200
    memory: 2048
    cpu: 2

  - name: k8s-worker-2
    box: generic/ubuntu2204
    hostname: k8s-worker-2
    ip: 192.168.10.210
    memory: 2048
    cpu: 2
```

### SSH 생성
vagrant ssh k8s-master-1

ssh-keygen -t rsa

ls -al .ssh/

cat .ssh/id_rsa.pub

ssh-copy-id vagrant@192.168.10.100
ssh-copy-id vagrant@192.168.10.200
ssh-copy-id vagrant@192.168.10.210


virtualenv --python=python3 venv

. venv/bin/activate

git clone https://github.com/kubernetes-sigs/kubespray
cd kubespray
git checkout release-2.22

pip install -r requirements.txt


ansible --version

cp -rfp inventory/sample inventory/mycluster

declare -a IPS=(192.168.10.100 192.168.10.200 192.168.10.210)

CONFIG_FILE=inventory/mycluster/hosts.yaml python3 contrib/inventory_builder/inventory.py ${IPS[@]}

# vi inventory/mycluster/inventory.ini
ansible all -m ping -i inventory/mycluster/inventory.ini

vi inventory/mycluster/group_vars/k8s_cluster/addons.yml

# apt 캐시 업데이트
ansible all -i inventory/mycluster/inventory.ini -m apt -a 'update_cache=yes' --become

ansible all -i inventory/mycluster/inventory.ini -a 'timedatectl'

ansible-playbook -i inventory/mycluster/inventory.ini  --become --become-user=root cluster.yml -e ansible_ssh_timeout=50 --flush-cache -vvv
ansible-playbook -i inventory/mycluster/hosts.yaml  --become --become-user=root cluster.yml -e ignore_assert_errors=yes -e ansible_ssh_timeout=50
ansible-playbook -i inventory/mycluster/hosts.yaml  --become --become-user=root cluster.yml -e ansible_ssh_timeout=50 --flush-cache -vvv


deactivate

sudo su

kubectl get nodes
kubectl get componentstatus
kubectl get --raw='/readyz?verbose'


## vi inventory/mycluster/inventory.ini
```
[all]
k8s-master-1 ansible_host=192.168.10.100 ip=192.168.10.100
k8s-worker-1 ansible_host=192.168.10.200 ip=192.168.10.200
k8s-worker-2 ansible_host=192.168.10.210 ip=192.168.10.210
[kube_control_plane]
k8s-master-1

[etcd]
k8s-master-1

[kube_node]
k8s-worker-1
k8s-worker-2

[calico_rr]

[k8s_cluster:children]
kube_control_plane
kube_node
calico_rr
```

## vi inventory/mycluster/hosts.yaml
```
all:
  hosts:
    k8s-master-1:
      ansible_host: 192.168.10.100
      ip: 192.168.10.100
      access_ip: 192.168.10.100
    k8s-worker-1:
      ansible_host: 192.168.10.200
      ip: 192.168.10.200
      access_ip: 192.168.10.200
    k8s-worker-2:
      ansible_host: 192.168.10.210
      ip: 192.168.10.210
      access_ip: 192.168.10.210
  children:
    kube_control_plane:
      hosts:
        k8s-master-1:
    kube_node:
      hosts:
        k8s-worker-1:
        k8s-worker-2:
    etcd:
      hosts:
        k8s-master-1:
    k8s_cluster:
      children:
        kube_control_plane:
        kube_node:
    calico_rr:
      hosts: {}
```