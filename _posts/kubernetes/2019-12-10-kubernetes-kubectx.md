---
title: "[Kubernetes] kubectx"
date: 2019-12-10
categories: [Kubernetes, kubectx]
tags: [Kubernetes, kubectx]
---

Kubernetes의 Context를 여러개 사용하고 있다면,\\
kubectx는 Context를 쉽게 변경할 수 있도록 도움을 줍니다.\\
이 도구를 사용하면, `kubectl config use-context greentea` 같은 긴 명령어를 사용하지 않아도 됩니다.\\
fzf를 설치하면 대화식 메뉴를 제공하기 때문에, 더욱 편리하게 사용할 수 있습니다.

> Kubernetes는 Cluster, User, Namespace를 조합한 Context라는 오브젝트를 제공한다. Context는 독립적인 단위로 흔히 우리가 생각하는 클러스터를 Context 단위로 볼 수도 있지만, 사실 그보다 더 세분화된 단위라고 볼 수 있다.
{: .prompt-info }

## kubectx 명령을 실행하면, Context 목록을 보여줍니다.
```terminal
$ kubectx
coffee
minikube
test
```

## Context를 변경하기 위해서는, Context 명을 입력하면 됩니다.
```terminal
$ kubectx minikube
Switched to context "minikube".
```

## 만약 fzf가 설치되어 있으면, kubectx 명령을 실행하면 대화식 메뉴를 보여줍니다.
```terminal
$ kubectx
> coffee
  minikube
  test
  3/3
```

> kubectx에 대한 설정 방법은 [설치 문서](https://github.com/ahmetb/kubectl-aliases)를 참고하시기 바랍니다.
{: .prompt-info }