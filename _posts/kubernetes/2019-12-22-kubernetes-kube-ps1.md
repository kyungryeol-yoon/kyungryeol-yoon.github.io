---
title: "[Kubernetes] kube-ps1"
date: 2019-12-22
categories: [Kubernetes, kube-ps1]
tags: [Kubernetes, kube-ps1]
---

kube-ps1를 사용하면, 현재 사용하고 있는 Kubernetes Context 및 Namespace를 보여줍니다.\\
Context와 Namespace를 보는게 불편하다면,\\
kubeoff 명령어를 실행해서 kube-ps을 비활성화 시킬수도 있습니다.

## kube-ps1의 설치가 완료되면, 셀의 프롬프트가 다음처럼 표시됩니다.
```terminal
(⎈ |[context]:[namespace]) $
(⎈ |greentea:kube-system) $
```

> kube-ps1에 대한 설정 방법은 [설치 문서](https://github.com/jonmosco/kube-ps1)를 참고하시기 바랍니다.
{: .prompt-info }