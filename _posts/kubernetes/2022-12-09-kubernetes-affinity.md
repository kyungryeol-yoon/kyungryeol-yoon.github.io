---
title: "Kubernetes Affinity"
date: 2022-12-09
categories: [Kubernetes, Affinity]
tags: [Kubernetes, Affinity]
---

### Affinity?
- Affinity란 선호도란 뜻이다. Pod는 항상 Node에서 띄워져야 하는데, 이러한 배치를 함에 있어 선호하는 Node나 Pod를 설정할 수 있는 리소스이다.

### Affinity 종류
- nodeAffinity는 어떤 Node를 선호할 것인가? 에 관련한 리소스이다. 즉, Pod를 배치할 때 어떤 Node에 스케쥴링할지 설정을 해준다.
- podAffinity는 Pod가 배치될 때, 실행 중인 Pod들 중에 선호하는 Pod를 찾아 해당 Pod와 동일한 Node로 배치하는 걸 설정해준다.
- podAnitAffinity는 실행 중인 Pod들 중에, 선호하지 않은 Pod가 실행 중인 Node는 피해서 배치를 하겠다는 걸 설정해준다.

### nodeAffinity?
- 선호하는 노드를 설정하는 방법으로, nodeSelector 보다 확장된 Label Selector 기능을 지원한다. 그래서 좀 더 실무환경에 적합한 Pod 배치 전략이다.
- matchExpressions 사용 가능하다. (In, NotIn, Exists, DoesNotExist, Gt, Lt 등의 옵션이 있다.)
- 여러 유즈케이스에 활용 가능한 2가지 옵션이 있는데. Hard, Soft로 나뉜다. 매우 조건이 길기 때문에 2등분해서 의미를 이해하면 좋다.
    - 반드시 충족해야 하는 조건 (Hard)
        - requiredDuringSchedulingIgnoredDuringExecution : `스케쥴링하는 동안 꼭 필요한` 조건
            - 즉, 스케쥴링되는 워크로드에는 필수 조건이고, 실행 중인 워크로드는 조건을 무시한다는 의미이다.
            - requiredDuringSchedulingIgnoredDuringExecution를 구성하는 매니페스트 파일

            ```yaml
            ...생략
            affinity:
            nodeAffinity:
                requiredDuringSchedulingIgnoredDuringExecution:
                nodeSelectorTerms:
                - matchExpressions:
                    - key: disktype
                    operator: In
                    values:
                    - ssd
            ```

    - 선호하는 조건 (Soft)
        - preferredDuringSchedulingIgnoredDuringExecution : `스케쥴링하는 동안 만족하면 좋은` 조건입니다. 꼭 이 조건을 만족해야하는 것은 아니라는 의미입니다.
            - 즉, 스케쥴링되는 워크로드에는 선호 조건이고, 실행 중인 워크로드는 조건을 무시한다는 의미이다.

            ```yaml
            ...생략
            preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 10
            preference:
            - matchExpressions:
                - key: disktype
                operator: In
                values:
                - hdd
            ```

    - 용어 설명:
        - IgnoredDuringExecution: 실행 중인 워크로드에 대해서는 해당 규칙을 무시한다.
        - RequiredDuringExecution: 위와 반대개념으로 실행 중인 워크로드에 대해서 해당 규칙을 반드시 필요로 한다.

| key 필드 값 | 설명 |
| - | - |
| In | values[] 필드에 설정한 값 중 레이블에 있는 값과 일치하는 것이 하나라도 있는지 확인합니다. |
| Notln | `In`과 반대로 values[]에 있는 값 모두와 맞지 않는 지 확인합니다. |
| Exists | `key` 필드에 설정한 값이 레이블에 있는지만 확인합니다. (values[] 필드가 필요 없습니다.) |
| DoseNotExist | `Exists`와 반대로 노드의 레이블에 `key` 필드 값이 없는지만 확인합니다. |
| Gt | Greater than의 약자로 values[] 필드에 설정된 값이 설정된 값 보다 더 큰 숫자형 데이터 인지 확인합니다. 이 때 values[] 필드에는 값이 하나만 있어야 합니다. |
| Lt | Lower than의 약자로 values[] 필드에 설정된 값이 설정된 값 보다 더 작은 숫자형 데이터 인지 확인합니다. 이 때 values[] 필드에는 값이 하나만 있어야 합니다. |

#### nodeAffinity 세팅
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-affinity-required
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello
  template:
    metadata:
      name: hello
      labels:
        app: hello
    spec:
      containers:
      - name: nginx
        image: nginxdemos/hello:plain-text
        ports:
        - name: http
          containerPort: 80
          protocol: TCP
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: team
                operator: In
                values:
                - blue
                - red
```
- operator In은 or 연산자라고 이해하면 된다. 즉, key가 team이고, value가 blue 혹은 red인 조건을 필수로 한다.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-affinity-preferred
spec:
  replicas: 4
  selector:
    matchLabels:
      app: hello
  template:
    metadata:
      name: hello
      labels:
        app: hello
    spec:
      containers:
      - name: nginx
        image: nginxdemos/hello:plain-text
        ports:
        - name: http
          containerPort: 80
          protocol: TCP
      affinity:
        nodeAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 40
            preference:
              matchExpressions:
              - key: team
                operator: In
                values:
                - green
```
- operator In은 or 연산자라고 이해하면 된다. 즉, key가 team이고, value가 green인 조건을 선호 한다.
- preferred는 weight가 있고, 각각에 matchExpressions을 넣는 구조로 되어 있다.
    - weight는 0~100 사이의 값을 가질 수 있다. 각각의 rule을 기반으로 weight를 설정해서 점수를 줌으로써 Pod가 어떤 Node에 최종 배치될지 우선순위를 설정하는 것으로 이해하면 된다.
    - 즉, weight는 여러개 설정할 수 있고, 점수를 매겨 우선순위를 결정하는 데 쓰이는 것이다.

```bash
kubectl label node kube-01 --overwrite team=green
kubectl label node kube-02 --overwrite team=red
kubectl label node kube-03 --overwrite team=blue
```
- 특정 node 각각에 label(key-valu)를 지정하는 set-node-labels.sh 스크립트이다.

```console
kubectl get nodes --show-labels
kubectl get nodes --label-columns team
```

### podAffinity?
- 선호하는 파드를 설정하는 방법으로, 사용법은 nodeAffinity와 거의 동일하다.
- 역시 여러 유즈케이스에 활용 가능한 2가지 옵션을 제공하며, Hard, Soft로 나뉜다. nodeAffinity와 동일하여 자세한 설명은 생략한다.
    - 반드시 충족해야 하는 조건 (Hard)
        - requiredDuringSchedulingIgnoredDuringExecution
    - 선호하는 조건 (Soft)
        - preferredDuringSchedulingIgnoredDuringExecution
- podAffinity의 가장 중요한 부분은 다음의 개념이다.
- 토폴로지 키 (Topology Key)
    - 쿠버네티스 Node에 설정된 Label에 대해서, Label Selector를 수행할 노드의 범위를 결정한다.
    - Topology Key는 노드의 레이블 key를 설정하는 것이며, 어떠한 값을 key name으로 넣어도 상관없지만 다음과 같은 3가지 key를 주로 쓴다.
        - Node 단위: kubernetes.io/hostname
        - zone 단위: topology.kubernetes.io/zone
            - AZ(Availablity Zone: 가용영역)
        - region 단위: topology.kubernetes.io/region
            - 지역 (서울, 도쿄 등)

#### podAffinity 세팅
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
spec:
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      name: mysql
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mariadb:latest
        env:
        - name: MYSQL_ROOT_PASSWORD
          value: setting_password
        - name: MYSQL_DATABASE
          value: kubernetes
        ports:
        - name: http
          containerPort: 3306
          protocol: TCP
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pod-affinity-required
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello
  template:
    metadata:
      name: hello
      labels:
        app: hello
    spec:
      containers:
      - name: nginx
        image: nginxdemos/hello:plain-text
        ports:
        - name: http
          containerPort: 80
          protocol: TCP
      affinity:
        podAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - mysql
            topologyKey: kubernetes.io/hostname
            # topologyKey: topology.kubernetes.io/zone
            # topologyKey: topology.kubernetes.io/region
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pod-affinity-preferred
spec:
  replicas: 4
  selector:
    matchLabels:
      app: hello
  template:
    metadata:
      name: hello
      labels:
        app: hello
    spec:
      containers:
      - name: nginx
        image: nginxdemos/hello:plain-text
        ports:
        - name: http
          containerPort: 80
          protocol: TCP
      affinity:
        podAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - mysql
              topologyKey: kubernetes.io/hostname
              # topologyKey: topology.kubernetes.io/zone
              # topologyKey: topology.kubernetes.io/region
```

### podAntiAffinity?
- 선호하지 않는 파드를 설정하는 방법으로, podAffinity를 podAntiAffinity로만 변경하면 사용법 동일하다.
- 역시 여러 유즈케이스에 활용 가능한 2가지 옵션을 제공하며, Hard, Soft로 나뉜다. podAffinity와 동일하여 자세한 설명은 생략한다.
    - 반드시 충족해야 하는 조건 (Hard)
        - requiredDuringSchedulingIgnoredDuringExecution
    - 선호하는 조건 (Soft)
        - preferredDuringSchedulingIgnoredDuringExecution
- 토폴로지 키 (Topology Key)도 podAffinity와 같은 방식이다. 자세한 건 3번 챕터(podAffinity)를 참고하면 된다.

#### podAntiAffinity 세팅
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pod-anti-affinity-required
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello
  template:
    metadata:
      name: hello
      labels:
        app: hello
    spec:
      containers:
      - name: nginx
        image: nginxdemos/hello:plain-text
        ports:
        - name: http
          containerPort: 80
          protocol: TCP
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - mysql
            topologyKey: kubernetes.io/hostname
            # topologyKey: topology.kubernetes.io/zone
            # topologyKey: topology.kubernetes.io/region
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pod-anti-affinity-preferred
spec:
  replicas: 4
  selector:
    matchLabels:
      app: hello
  template:
    metadata:
      name: hello
      labels:
        app: hello
    spec:
      containers:
      - name: nginx
        image: nginxdemos/hello:plain-text
        ports:
        - name: http
          containerPort: 80
          protocol: TCP
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - mysql
              topologyKey: kubernetes.io/hostname
              # topologyKey: topology.kubernetes.io/zone
              # topologyKey: topology.kubernetes.io/region
```