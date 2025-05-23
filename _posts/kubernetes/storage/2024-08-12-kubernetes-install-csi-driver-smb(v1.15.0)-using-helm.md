---
title: "[Kubernetes] Install CSI Driver SMB(v1.15.0) for Kubernetes Using Helm Chart"
date: 2024-08-12
categories: [Kubernetes, Storage]
tags: [kubernetes, k8s-sig-storage, smb, install, helm]
---

> [Helm 설치 및 설명 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-helm/)
{: .prompt-info }

## Install CSI Driver SMB

```bash
helm repo add csi-driver-smb https://raw.githubusercontent.com/kubernetes-csi/csi-driver-smb/master/charts
helm repo update
helm install csi-driver-smb csi-driver-smb/csi-driver-smb --version 1.15.0
```

> CSI Driver SMB - Helm 설치 참고
- <https://github.com/kubernetes-csi/csi-driver-smb>
{: .prompt-info }

## Customize Default Configuration

- values.yaml 수정
  > 최상위 values.yaml을 수정하면 하위 폴더 values.yaml을 override 한다.
  {: .prompt-info }
  - Chart
    - <https://github.com/kubernetes-csi/csi-driver-smb/tree/master/charts>
  - Release file (.tgz)
    - <https://github.com/kubernetes-csi/csi-driver-smb/releases>

### Install Customize Default Configuration

```bash
helm install [RELEASE NAME] [Chart.yaml 경로] -f [YAML 파일 또는 URL에 값 지정 (여러 개를 지정가능)] -n [NAMESPACE NAME]
```

```bash
helm install csi-driver-smb csi-driver-smb/csi-driver-smb -f override-values.yaml -n [NAMESPACE NAME]
```

## Test

### 1. Namespace 생성

```bash
kubectl create ns smb-test
```

### 2. Secret 생성

```bash
kubectl -n smb-test create secret generic smb-creds \
--from-literal username=testuser \
--from-literal domain=12.123.123.123 \
--from-literal password=testpw
```

### 3. PersistentVolume or StorageClass 생성

#### PersistentVolume

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-smb
  namespace: smb-test
spec:
  storageClassName: ''
  capacity:
    storage: 50Gi
  accessModes:
    - ReadWriteMany
  persistentVolumeReclaimPolicy: Retain
  mountOptions:
    - dir_mode=0777
    - file_mode=0777
    - vers=3.0
  csi:
    driver: smb.csi.k8s.io
    readOnly: false
    volumeHandle: $VOLUMEID  # make sure it's a unique id in the cluster
    volumeAttributes:
      source: //12.123.123.123/testuser
    nodeStageSecretRef:
      name: smb-creds
      namespace: smb-test
```

#### StorageClass

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: smb
  namespace: smb-test
provisioner: smb.csi.k8s.io
parameters:
  # On Windows, "*.default.svc.cluster.local" could not be recognized by csi-proxy
  source: //smb-server.default.svc.cluster.local/share
  # if csi.storage.k8s.io/provisioner-secret is provided, will create a sub directory
  # with PV name under source
  # csi.storage.k8s.io/provisioner-secret-name: smbcreds
  # csi.storage.k8s.io/provisioner-secret-namespace: [NAMESPACE NAME]
  csi.storage.k8s.io/node-stage-secret-name: smbcreds
  csi.storage.k8s.io/node-stage-secret-namespace: smb-test
volumeBindingMode: Immediate
mountOptions:
  - dir_mode=0777
  - file_mode=0777
  - uid=1001
  - gid=1001
  - noperm
  - mfsymlinks
  - cache=strict
  - noserverino  # required to prevent data corruption
```

> **Storage Class 참고**
  - <https://github.com/kubernetes-csi/csi-driver-smb/blob/master/deploy/example/storageclass-smb.yaml>
{: .prompt-info }

### 4. PersistentVolumeClaim 생성

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: pvc-smb
  namespace: smb-test
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 10Gi
  volumeName: pv-smb    # pv를 설정했을 때
  storageClassName: smb    # sc를 설정했을 때
```

### 5. Deployment 생성

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: nginx
  name: deploy-smb-pod
  namespace: smb-test
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
      name: deploy-smb-pod
    spec:
      containers:
        - name: deploy-smb-pod
          image: nginx:1.19.5
          command:
            - "/bin/bash"
            - "-c"
            - set -euo pipefail; while true; do echo $(date) >> /mnt/smb/outfile; sleep 1; done
          volumeMounts:
            - name: smb
              mountPath: "/mnt/smb"
              readOnly: false
      volumes:
        - name: smb
          persistentVolumeClaim:
            claimName: pvc-smb
```

### 6. 확인

```bash
kubectl -n smb-test exec -it deploy-smb-pod-8569fdd89c-dmlzh -- ls -rtl /mnt/smb

total 28
-rwxrwxrwx 1 root root 26280 Sep 25 17:53 outfile
```

### 7. test.txt 파일 생성

```bash
kubectl -n smb-test exec -it deploy-smb-pod-8569fdd89c-dmlzh -- touch /mnt/smb/test.txt
```

### 8. 확인2

```bash
kubectl -n smb-test exec -it deploy-smb-pod-8569fdd89c-dmlzh -- ls -la /mnt/smb

total 48
drwxrwxrwx 2 root root     0 Sep 25 18:02 .
drwxr-xr-x 1 root root  4096 Sep 25 17:51 ..
-rwxrwxrwx 1 root root 43800 Sep 25 18:03 outfile
-rwxrwxrwx 1 root root     0 Sep 25 18:15 test.txt
```