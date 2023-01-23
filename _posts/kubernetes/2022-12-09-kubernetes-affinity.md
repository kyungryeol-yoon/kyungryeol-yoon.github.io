---
title: "Kubernetes Affinity"
date: 2022-12-09
categories: [Kubernetes, Affinity]
tags: [Kubernetes, Affinity]
---

### 1) Affinity?
- Affinity란 선호도란 뜻이다. Pod는 항상 Node에서 띄워져야 하는데, 이러한 배치를 함에 있어 선호하는 Node나 Pod를 설정할 수 있게끔 하는 리소스이다.

### 2) Affinity 종류
- nodeAffinity는 어떤 Node를 선호할 것인가? 에 관련한 리소스이다. 즉, Pod를 배치할 때 어떤 Node에 스케쥴링할지 설정을 해준다.
- podAffinity는 Pod가 배치될 때, 실행 중인 Pod들 중에 선호하는 Pod를 찾아 해당 Pod와 동일한 Node로 배치하는 걸 설정해준다.
- podAnitAffinity는 실행 중인 Pod들 중에, 선호하지 않은 Pod가 실행 중인 Node는 피해서 배치를 하겠다는 걸 설정해준다.

#### 1) nodeAffinity?
- 선호하는 노드를 설정하는 방법으로, nodeSelector 보다 확장된 Label Selector 기능을 지원한다. 그래서 좀 더 실무환경에 적합한 Pod 배치 전략이다.
- matchExpressions 사용 가능하다. (In, NotIn, Exists, DoesNotExist, Gt, Lt 등의 옵션이 있다.)
- 여러 유즈케이스에 활용 가능한 2가지 옵션이 있는데. Hard, Soft로 나뉜다. 매우 조건이 길기 때문에 2등분해서 의미를 이해하면 좋다.
    - 반드시 충족해야 하는 조건 (Hard)
        - requiredDuringSchedulingIgnoredDuringExecution
            - 즉, 스케쥴링되는 워크로드에는 필수 조건이고, 실행 중인 워크로드는 조건을 무시한다는 의미이다.
    - 선호하는 조건 (Soft)
        - preferredDuringSchedulingIgnoredDuringExecution
            - 즉, 스케쥴링되는 워크로드에는 선호 조건이고, 실행 중인 워크로드는 조건을 무시한다는 의미이다.
    - 용어 설명:
        - IgnoredDuringExecution: 실행 중인 워크로드에 대해서는 해당 규칙을 무시한다.
        - RequiredDuringExecution: 위와 반대개념으로 실행 중인 워크로드에 대해서 해당 규칙을 반드시 필요로 한다.