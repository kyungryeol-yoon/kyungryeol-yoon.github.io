---
title: "[Kubernetes] Host Network"
date: 2023-03-02
categories: [Kubernetes, Concept]
tags: [Kubernetes, Host, Network]
render_with_liquid: false
---

## hostNetwork: false

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
spec:
  containers:
  - name: nginx
    image: nginx
    ports:
    - name: nginx-port
      hostIP: [Node IP]
      hostPort: 30123
      containerPort: 8888
    volumeMounts:
    - mountPath: /etc/nginx/conf.d/default.conf
      name: nginx-conf
  volumes:
  - name: nginx-conf
    hostPath:
      path: /root/default.conf
      type: File
```

- 해당 Pod가 배포된 Node의 IP + NodePort로 해당 서비스에 접근이 가능해진다.
- curl [hostIP]:[hostPort]로 nginx 웹서버의 정상적인 응답을 받을 수 있게 된다.

## hostNetwork: true

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: danger-pod
spec:
  hostNetwork: true
  containers:
  - name: nginx
    image: nginx
    ports:
    - name: nginx-port
      hostPort: 8888
      containerPort: 8888
    volumeMounts:
    - mountPath: /etc/nginx/conf.d/default.conf
      name: nginx-conf
  volumes:
  - name: nginx-conf
    hostPath:
      path: /root/default.conf
      type: File
```

- hostNetwork를 true로 설정하게되면 Pod가 자신이 배포된 node의 IP를 가지는 것을 확인할 수 있다.
- host의 Network를 사용하기 때문에 containerPort와 hostPort를 동일하게 설정해야한다. 그렇지않으면 에러가 발생할 것이다


## 해당 옵션을 사용할 시, 고려할 점

### spec.hostNetwork

- true와 false 두가지 옵션이 존재한다(미 설정시, Default: false).
- 해당 값을 true로 설정 시, Pod의 IP가 Pod가 배포된 Node의 IP로 설정된다. 
 
### spec.containers[].ports[].containerPort

- 해당 설정을 명시한다고해서 해당 container의 Port가 open되는 것은 아니다.
- 해당 옵션을 원하는 Port로 사용하기 위해서는 반드시 해당 container에 원하는 Port를 사용하는 서비스 등이 동작중이여야 한다.
- 즉, container가 자체적으로 Port를 사용하고 있어야한다.
 
### spec.containers[].ports[].hostIP

- 아무 IP나 사용하면안되고 Node 중 하나의 IP를 사용하여야한다. 
 
### spec.containers[].ports[].hostPort

- 0 < port < 65536 중에서 Port를 사용하면 된다.
- 만약 hostNetwork 값을 true로 사용할 시, containerPort와 같은 값을 지정해야한다.
- 역시나 해당 설정을 한다고해서 해당 Pod가 배포된 Node의 Port가 Open 되는 것은 아니다.