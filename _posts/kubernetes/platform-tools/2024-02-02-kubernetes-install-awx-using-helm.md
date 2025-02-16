---
title: "[Kubernetes] Install AWX Using Helm Chart"
date: 2024-02-02
categories: [Kubernetes, AWX]
tags: [Kubernetes, AWX, Ansible, Install, Helm]
render_with_liquid: false
---

> [Helm 설치 및 설명 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-helm/)
{: .prompt-info }

## Install awx-operator

```bash
helm repo add awx-operator https://ansible.github.io/awx-operator/
helm repo update
helm install ansible-awx-operator awx-operator/awx-operator -n awx --create-namespace
```

> **설치 참고**
  - <https://ansible.readthedocs.io/projects/awx-operator/en/latest/installation/basic-install.html>
  - <https://github.com/ansible/awx-operator/blob/devel/docs/installation/basic-install.md>
{: .prompt-info }

## Customize Default Configuration

- values.yaml 수정
  > 최상위 values.yaml을 수정하면 하위 폴더 values.yaml을 override 한다.
  {: .prompt-info }

- Chart : <https://github.com/ansible/awx-operator/tree/{tags}/.helm/starter>
- Release file (.tgz) : <https://github.com/ansible/awx-operator/releases>

### Install Customize Default Configuration

```bash
helm install [RELEASE NAME] [Chart.yaml 경로] -f [YAML 파일 또는 URL에 값 지정 (여러 개를 지정가능)] -n [NAMESPACE NAME]
```

```bash
helm install ansible-awx-operator awx-operator/awx-operator -f override-values.yaml -n [NAMESPACE NAME]
```

## Verify AWX operator installation

```bash
kubectl get pods -n awx
```

## Create PV, PVC and deploy AWX yaml file

> AWX에는 postgres Pod에 대한 영구 볼륨이 필요
{: .prompt-info }

> 다만 StorageClass가 설정되어 있다면 자동으로 pv, pvc 생성을 해주므로 AWX instance 바로 배포
{: .prompt-tip }

### StorageClass

#### StorageClass 생성 파일 작성

```bash
vi local-storage-class.yaml
```

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-storage
  namespace: awx
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
```

#### StorageClass 생성 및 확인

```bash
kubectl create -f local-storage-class.yaml
```

```bash
kubectl get sc -n awx
```

### PersistentVolume

#### PersistentVolume 생성 파일 작성

```bash
vi pv.yaml
```

```yaml
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

#### PersistentVolume 생성 및 확인

```bash
kubectl create -f pv.yaml
```

```bash
kubectl get pv -n awx
```

### PersistentVolumeClaim

#### PersistentVolumeClaim 생성 파일 작성

```bash
vi pvc.yaml
```

```yaml
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

#### PersistentVolumeClaim 생성 및 확인

```bash
kubectl create -f pvc.yaml
```

```bash
kubectl get pvc -n awx
```

### AWX instance 배포 - admin password 없이 Setting

#### Instance 생성 파일 작성

```bash
vi ansible-awx.yaml
```

```yaml
apiVersion: awx.ansible.com/v1beta1
kind: AWX
metadata:
  name: ansible-awx
  namespace: awx
spec:
  service_type: nodeport
  postgres_storage_class: local-storage
  # projects_persistence: true
  # projects_storage_access_mode: ReadWriteOnce
```

#### Instance 배포

```bash
kubectl create -f ansible-awx.yaml
```

#### Instance 확인

```bash
kubectl get pods -n awx
```

### AWX Web 접속

#### service 없을 시 아래와 같이 생성

```bash
kubectl expose deployment ansible-awx-web --name ansible-awx-web-svc --type NodePort -n awx
```
- service 확인

  ```bash
  kubectl get svc ansible-awx-web-svc -n awx
  ```

#### 기본적으로 관리자는 admin이고 비밀번호는 <resourcename>-admin-password 확인할 수 있다.

```bash
kubectl get secrets -n awx | grep -i admin-password
```

```bash
kubectl get secret ansible-awx-admin-password -o jsonpath="{.data.password}" -n awx | base64 --decode ; echo

or

kubectl -n awx get secret ansible-awx-admin-password -o go-template='{{range $k,$v := .data}}{{printf "%s: " $k}}{{if not $v}}{{$v}}{{else}}{{$v | base64decode}}{{end}}{{"\n"}}{{end}}'
```

- Paasword 설정하지 않았을 때 아래와 같이 Secret 조회가 된다.

  ```bash
  kubectl get secret -n awx
  NAME                                         TYPE                 DATA   AGE
  sh.helm.release.v1.ansible-awx-operator.v1   helm.sh/release.v1   1      33m
  redhat-operators-pull-secret                 Opaque               1      25m
  ansible-awx-app-credentials                  Opaque               3      24m
  ansible-awx-admin-password                   Opaque               1      24m
  ansible-awx-secret-key                       Opaque               1      24m
  ansible-awx-postgres-configuration           Opaque               6      24m
  ansible-awx-broadcast-websocket              Opaque               1      24m
  ansible-awx-receptor-ca                      kubernetes.io/tls    2      24m
  ansible-awx-receptor-work-signing            Opaque               2      24m
  ```

### AWX instance 배포 - admin password 없이 Setting

#### Instance Secret 파일 작성

```bash
vi awx-admin-password.yaml
```

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: awx-admin-password
  namespace: awx
stringData:
  password: mysuperlongpassword
```

#### Instance Secret 배포

```bash
kubectl apply -f awx-admin-password.yaml
```

#### Instance 생성 파일 작성

```bash
vi ansible-awx.yaml
```

```yaml
apiVersion: awx.ansible.com/v1beta1
kind: AWX
metadata:
  name: ansible-awx
  namespace: awx
spec:
  service_type: nodeport
  postgres_storage_class: local-path
  admin_user: admin
  admin_password_secret: awx-admin-password
  # projects_persistence: true
  # projects_storage_access_mode: ReadWriteOnce
```

#### Instance 배포

```bash
kubectl create -f ansible-awx.yaml
```

#### Paasword 설정했을 시 아래와 같이 Secret 조회가 된다.

```bash
kubectl get secret -n awx
NAME                                         TYPE                 DATA   AGE
sh.helm.release.v1.ansible-awx-operator.v1   helm.sh/release.v1   1      63m
awx-admin-password                           Opaque               1      2m7s
redhat-operators-pull-secret                 Opaque               1      90s
ansible-awx-secret-key                       Opaque               1      87s
ansible-awx-broadcast-websocket              Opaque               1      86s
ansible-awx-postgres-configuration           Opaque               6      84s
ansible-awx-receptor-ca                      kubernetes.io/tls    2      73s
ansible-awx-receptor-work-signing            Opaque               2      71s
ansible-awx-app-credentials                  Opaque               3      70s
```