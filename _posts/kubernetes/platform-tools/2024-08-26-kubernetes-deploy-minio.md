---
title: "[Kubernetes] Deploy MinIO"
date: 2024-08-26
categories: [Kubernetes, minio]
tags: [Kubernetes, minio]
---

## Create MinIO Object

```bash
curl https://raw.githubusercontent.com/minio/docs/master/source/extra/examples/minio-dev.yaml -O
```

```yaml
# Deploys a new Namespace for the MinIO Pod
apiVersion: v1
kind: Namespace
metadata:
  name: minio-dev # Change this value if you want a different namespace name
  labels:
    name: minio-dev # Change this value to match metadata.name
---
# Deploys a new MinIO Pod into the metadata.namespace Kubernetes namespace
#
# The `spec.containers[0].args` contains the command run on the pod
# The `/data` directory corresponds to the `spec.containers[0].volumeMounts[0].mountPath`
# That mount path corresponds to a Kubernetes HostPath which binds `/data` to a local drive or volume on the worker node where the pod runs
# 
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: minio
  name: minio
  namespace: minio-dev # Change this value to match the namespace metadata.name
spec:
  containers:
  - name: minio
    image: quay.io/minio/minio:latest
    command:
    - /bin/bash
    - -c
    args: 
    - minio server /data --console-address :9001
    volumeMounts:
    - mountPath: /data
      name: localvolume # Corresponds to the `spec.volumes` Persistent Volume
  nodeSelector:
    kubernetes.io/hostname: kubealpha.local # Specify a node label associated to the Worker Node on which you want to deploy the pod.
  volumes:
  - name: localvolume
    hostPath: # MinIO generally recommends using locally-attached volumes
      path: /mnt/disk1/data # Specify a path to a local drive or volume on the Kubernetes worker node
      type: DirectoryOrCreate # The path to the last directory must exist
```

> minio 설치 참고
- <https://min.io/docs/minio/kubernetes/upstream/index.html>
{: .prompt-info }


## Apply the MinIO Object Definition

The following command applies the minio-dev.yaml configuration and deploys the objects to Kubernetes:

```bash
kubectl apply -f minio-dev.yaml
```

The command output should resemble the following:

```
namespace/minio-dev created
pod/minio created
```

You can verify the state of the pod by running kubectl get pods:

```
kubectl get pods -n minio-dev
```

The output should resemble the following:

```
NAME    READY   STATUS    RESTARTS   AGE
minio   1/1     Running   0          77s
```

You can also use the following commands to retrieve detailed information on the pod status:

```
kubectl describe pod/minio -n minio-dev

kubectl logs pod/minio -n minio-dev
```

## Temporarily Access the MinIO S3 API and Console

Use the kubectl port-forward command to temporarily forward traffic from the MinIO pod to the local machine:

```
kubectl port-forward pod/minio 9000 9090 -n minio-dev
```

The command forwards the pod ports 9000 and 9090 to the matching port on the local machine while active in the shell. The kubectl port-forward command only functions while active in the shell session. Terminating the session closes the ports on the local machine.

Note
The following steps of this procedure assume an active kubectl port-forward command.
To configure long term access to the pod, configure Ingress or similar network control components within Kubernetes to route traffic to and from the pod. Configuring Ingress is out of the scope for this documentation.

## Connect your Browser to the MinIO Server

Access the MinIO Console by opening a browser on the local machine and navigating to <http://127.0.0.1:9001>.

Log in to the Console with the credentials minioadmin | minioadmin. These are the default root user credentials.