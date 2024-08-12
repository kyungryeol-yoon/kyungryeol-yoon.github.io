---
title: "[Kubernetes] Install Grafana"
date: 2024-06-08
categories: [Kubernetes, Grafana]
tags: [Kubernetes, Grafana, Helm, Install]
---

> Helm이 설치되어 있지 않다면, [설치 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-install-helm/)
{: .prompt-info }

# Search the Grafana chart
- Helm repo 저장소 추가
```
helm repo add grafana https://grafana.github.io/helm-charts
```
> 이전에 repository를 추가한 경우, 아래 명령을 실행하여 최신 버전의 패키지를 가져온다.
{: .prompt-info }

- Helm list 확인
```
helm repo list
```

- Helm repo 저장소 업데이트
```
helm repo update
```

- Grafana Helm Chart Release 검색
```
helm search repo grafana
```

## Install the Grafana Helm charts
- namespace 생성
```
kubectl create namespace monitoring
```

- Grafana 배포
```
helm install grafana grafana/grafana --namespace monitoring --set adminPassword=<your_password>
```

- Password 설정하지 않았을 때, 아래와 같이 찾아보기
```
kubectl get secret --namespace monitoring grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```

- port-forward로 연결하기
```
kubectl --namespace monitoring port-forward $POD_NAME 3000
```
```
k3sctl port-forward svc/grafana 3000:80 -n monitoring
```

## Customize Grafana default configuration
### Download the values.yaml file
- https://github.com/grafana/helm-charts/blob/main/charts/grafana/values.yaml

- 또는 Git 다운로드하여 수정
```
git clone https://github.com/grafana/helm-charts.git
```

- values.yaml 수정
```
vi helm-charts/charts/grafana/values.yaml
```

#### Setting Admin
```yaml
...
# Administrator credentials when not using an existing secret (see below)
adminUser: admin
adminPassword: <your_password>
...
```

#### Enable persistent storage (recommended)
```yaml
...
persistence:
  type: pvc
  enabled: true
  # storageClassName: default
  accessModes:
    - ReadWriteOnce
  size: 10Gi
  # annotations: {}
  finalizers:
    - kubernetes.io/pvc-protection
  # selectorLabels: {}
  ## Sub-directory of the PV to mount. Can be templated.
  # subPath: ""
  ## Name of an existing PVC. Can be templated.
  # existingClaim:
  ## Extra labels to apply to a PVC.
  extraPvcLabels: {}
...
```

#### 외부 접속을 위한 NodePort 설정
```yaml
...
## Expose the grafana service to be accessed from outside the cluster (LoadBalancer service).
## or access it from within the cluster (ClusterIP service). Set the service type and the port to serve it.
## ref: http://kubernetes.io/docs/user-guide/services/
##
service:
  enabled: true
  type: NodePort
  loadBalancerIP: ""
  loadBalancerClass: ""
  loadBalancerSourceRanges: []
  port: 80
  targetPort: 3000
    # targetPort: 4181 To be used with a proxy extraContainer
  ## Service annotations. Can be templated.
  annotations: {}
  labels: {}
  portName: service
  # Adds the appProtocol field to the service. This allows to work with istio protocol selection. Ex: "http" or "tcp"
  appProtocol: ""
...
```

#### Install Grafana
```
helm install grafana grafana/grafana -f values.yaml -n monitoring
```

# Uninstall the Grafana chart
```
helm uninstall <RELEASE-NAME> <NAMESPACE-NAME>
helm uninstall my-grafana -n monitoring
```

> 설치 참고 : https://grafana.com/docs/grafana/latest/setup-grafana/installation/helm
{: .prompt-info }