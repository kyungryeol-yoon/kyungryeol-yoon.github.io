---
layout: post
title: Kubernetes mysql pod 생성
date: 2020-01-30
# excerpt: Kubernetes mysql pod 생성 관련
categories: [Kubernetes, MySQL]
tags: [kubernetes, kubectl, mysql, pod]
comments: true
---

## MySQL pod 생성

- 컨테이너 이미지가 존재한다는 가정하에 가능하다.
- 만약 이미지가 없다면 Docker Hub에서 들고온다.
(https://hub.docker.com/search?image_filter=official&type=image)
- Docker Hub의 공식적인 이미지가 아닌 것은 직접 만들어야 하며, 그 이미지를 Docker Hub에 올릴 수 있다.
(물론 전체 공개이며, 개인적으로 사용하고 싶다면 Private를 구매해야 한다.)

### kubectl create or run

run을 통해 이미지와 replicas 등 스펙들을 설정할 수 있다.

```
kubectl run mysql-test --image=mysql:5.7.8 --port=3306 --replicas=1 --env="MYSQL_ROOT_PASSWORD=testpw" --env="MYSQL_DATABASE=testdb"
```

### kubectl apply
```
kubectl apply -f mysql-test.yaml mysql-test
```

### yaml을 통한 명령어

yaml을 통해 세부적으로 작성하기 편하며,
혹시나 pod에 대한 속성을 수정할 일이 있다면, 이전에는 어떻게 구성하였는지 확인하기 위해 yaml파일을 폴더 별로 관리를 추천한다.

```
apiVersion: v1
kind: Service
metadata:
  name: mysql-test
spec:
  ports:
  - port: 3306
  selector:
    app: mysql
---
apiVersion: apps/v1 # for versions before 1.9.0 use apps/v1beta2
kind: Deployment
metadata:
  name: mysql-test
spec:
  selector:
    matchLabels:
      app: mysql
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: mysql
    spec:
      nodeName: kube-node-1
      containers:
      - image: mysql:5.7.8
        name: mysql-test
        env:
          # Use secret in real usage
        - name: MYSQL_ROOT_PASSWORD
          value: testpw
        ports:
        - containerPort: 3306
          name: mysql-test
```
