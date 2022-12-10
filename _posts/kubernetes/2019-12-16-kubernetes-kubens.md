---
title: "Kubernetes kubens"
date: 2019-12-16
categories: [Kubernetes, kubens]
tags: [Kubernetes, kubens]
---

Kubernetes의 Namespace를 여러개 사용하고 있다면,\\
kubens는 기본 Namespace를 변경할 수 있도록 도와줍니다.\\
fzf를 설치하면 대화식 메뉴를 제공하기 때문에, 더욱 편리하게 사용할 수 있습니다.

#### kubens 명령을 실행하면, Namespace 목록을 보여줍니다.
```terminal
$ kubens
kube-system
kube-public
istio-system
default
```

#### Namespace를 변경하기 위해서는, Namespace 명을 입력하면 됩니다.
```terminal
$ kubens kube-system
Context "minikube" modified.
Active namespace is "kube-system".
```

#### 만약 fzf가 설치되어 있으면, kubens 명령을 실행하면 대화식 메뉴를 보여줍니다.
```terminal
$ kubens
> kube-system
  kube-public
  istio-system
  default
  4/4
```

> kubens에 대한 설정 방법은 [설치 문서](https://github.com/ahmetb/kubectl-aliases)를 참고하시기 바랍니다.
{: .prompt-info }