---
title: "[Kubernetes] Install AWX"
date: 2024-06-02
categories: [Kubernetes, Install]
tags: [Kubernetes, AWX, Ansible]
---

### Helm이 설치되어 있지 않다면, Install helm
```
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod +x get_helm.sh
./get_helm.sh
helm version
```

### Install the AWX chart
- helm repo 저장소 추가
```
helm repo add awx-operator https://ansible.github.io/awx-operator/
"awx-operator" has been added to your repositories
```

> 이전에 repository를 추가한 경우, 아래 명령을 실행하여 최신 버전의 패키지를 가져온다.
{: .prompt-info }

```
helm repo update
```

#### Install awx-operator
```
helm install ansible-awx-operator awx-operator/awx-operator -n awx --create-namespace
```

#### Verify AWX operator installation
```
sudo kubectl get pods -n awx
```

#### Create PV, PVC and deploy AWX yaml file

> AWX에는 postgres 포드에 대한 영구 볼륨이 필요
{: .prompt-info }

1. StorageClass 생성 및 확인
- vi local-storage-class.yaml
```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-storage
  namespace: awx
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
```
- kubectl create -f local-storage-class.yaml
- kubectl get sc -n awx

2. PersistentVolume 생성 및 확인
- vi pv.yaml
```
apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgres-pv
  namespace: awx
spec:
  capacity:
    storage: 10Gi
  volumeMode: Filesystem
  accessModes:
  - ReadWriteOnce
  persistentVolumeReclaimPolicy: Delete
  storageClassName: local-storage
  local:
    path: /mnt/storage
  nodeAffinity:
    required:
      nodeSelectorTerms:
      - matchExpressions:
        - key: kubernetes.io/hostname
          operator: In
          values:
          - k8s-worker
```
- kubectl create -f pv.yaml

3. PersistentVolumeClaim 생성 및 확인
- vi pvc.yaml
```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-13-ansible-awx-postgres-13-0
  namespace: awx
spec:
  storageClassName: local-storage
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```
- kubectl create -f pvc.yaml
- kubectl get pv,pvc -n awx


### AWX instance 배포
- vi ansible-awx.yaml
```
---
apiVersion: awx.ansible.com/v1beta1
kind: AWX
metadata:
  name: ansible-awx
  namespace: awx
spec:
  service_type: nodeport
  postgres_storage_class: local-storage
```
- kubectl create -f ansible-awx.yaml
- kubectl get pods -n awx