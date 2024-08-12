---
title: "[Kubernetes] Install SMB CSI Driver for Kubernetes"
date: 2024-08-12
categories: [Kubernetes, CSI]
tags: [Kubernetes, csi, smb, Install]
---

> Helm이 설치되어 있지 않다면, [설치 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-install-helm/)
{: .prompt-info }

# Install CSI Driver SMB
- Helm repo 저장소 추가
```shell
helm repo add csi-driver-smb https://raw.githubusercontent.com/kubernetes-csi/csi-driver-smb/master/charts
```

- Helm list 확인
```shell
helm repo list
```

- Helm repo 저장소 업데이트
```shell
helm repo update
```

- Helm install
```shell
helm install csi-driver-smb csi-driver-smb/csi-driver-smb --version 1.15.0
```

# Customizing CSI Driver SMB
```shell
helm install -n csi-smb-provisioner csi-driver-smb csi-driver-smb/csi-driver-smb -f override-values.yaml
```

# Test
> 참고 [Storage Class](https://github.com/kubernetes-csi/csi-driver-smb/blob/master/deploy/example/storageclass-smb.yaml)
{: .prompt-info }

## 1. Namespace 생성
```shell
kubectl create ns smb-test
```

## 2. Secret 생성
```shell
kubectl -n smb-test create secret generic smb-creds \
--from-literal username=testuser \
--from-literal domain=12.123.123.123 \
--from-literal password=testpw
```

## 3. PersistentVolume 생성
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

## 4. PersistentVolumeClaim 생성
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
  volumeName: pv-smb
  storageClassName: ''
```

## 5. Deployment 생성
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

## 6. 확인
```shell
kubectl -n smb-test exec -it deploy-smb-pod-8569fdd89c-dmlzh -- ls -rtl /mnt/smb

total 28
-rwxrwxrwx 1 root root 26280 Sep 25 17:53 outfile
```

## 7. test.txt 파일 생성
```shell
kubectl -n smb-test exec -it deploy-smb-pod-8569fdd89c-dmlzh -- touch /mnt/smb/test.txt
```

## 8. 확인2
```shell
kubectl -n smb-test exec -it deploy-smb-pod-8569fdd89c-dmlzh -- ls -la /mnt/smb

total 48
drwxrwxrwx 2 root root     0 Sep 25 18:02 .
drwxr-xr-x 1 root root  4096 Sep 25 17:51 ..
-rwxrwxrwx 1 root root 43800 Sep 25 18:03 outfile
-rwxrwxrwx 1 root root     0 Sep 25 18:15 test.txt
```