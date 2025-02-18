---
title: "[Kubernetes] Alias"
date: 2019-11-17
categories: [Kubernetes, Alias]
tags: [Kubernetes, kubectl, Alias]
---

## 별칭 주기
매번 kubectl의 모든 명령어를 입력할 수 있지만, 상당히 불편함을 느낄것입니다.\\
이런 불편함을 줄이는 가장 쉬운 방법은 별칭(alias)를 지정해서 사용하는 것입니다.

```conf
alias k='kubectl'
alias kg='kubectl get'
alias kgpo='kubectl get pod'

alias ksysgpo='kubectl --namespace=kube-system get pod'

alias krm='kubectl delete'
alias krmf='kubectl delete -f'
alias krming='kubectl delete ingress'
alias krmingl='kubectl delete ingress -l'
alias krmingall='kubectl delete ingress --all-namespaces'

alias kgsvcoyaml='kubectl get service -o=yaml'
alias kgsvcwn='kubectl get service --watch --namespace'
alias kgsvcslwn='kubectl get service --show-labels --watch --namespace'

alias kgwf='kubectl get --watch -f'

...✂...
```
     
> 자주 쓰는 명령어는 [kubectl-aliases](https://github.com/ahmetb/kubectl-aliases)에 정의되어 있다.
{: .prompt-info }