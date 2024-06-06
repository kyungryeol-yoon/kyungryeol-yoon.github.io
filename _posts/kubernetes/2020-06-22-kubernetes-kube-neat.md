---
title: "[Kubernetes] kubectl neat"
date: 2020-06-22
categories: [Kubernetes, kubectl-neat]
tags: [Kubernetes, kubectl-neat]
---

- -o yaml 로 기존 리소스를 저장하면 아래와 같은 불필요한 정보도 추가되어 저장된다.
    1. 생성 타임스탬프 또는 일부 내부 ID와 같은 메타데이터
    2. 누락된 속성을 기본값으로 채우기
    3. 서비스 계정 토큰과 같은 승인 컨트롤러가 생성한 추가 시스템 속성
    4. 상태 정보
- k neat를 사용하여 정리된 yaml 을 얻을 수 있다.

### Install krew first
- Krew is a tool that makes it easy to use kubectl plugins

> Install krew 참고 https://github.com/kubernetes-sigs/krew
{: .prompt-info }

### Install neat with krew
```
kubectl krew install neat
```

> kubectl-neat에 대한 설정 방법은 [설치 문서](https://github.com/itaysk/kubectl-neat)를 참고하시기 바랍니다.
{: .prompt-info }