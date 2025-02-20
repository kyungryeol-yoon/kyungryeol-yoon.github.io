---
title: "[Kubernetes] About Argo CD"
date: 2021-10-17
categories: [DevOps, Argo CD]
tags: [argo cd, kubernetes, gitops, devops]
---

- Argo CD는 GitOps 스타일의 배포를 지원하는 CD 도구
- Git 저장소의 내용과 Kubernetes 클러스터를 동기화해주는 역할을 하는 에이전트

## 작동 원리
- Argo CD는 원하는 애플리케이션 상태를 정의하기위한 소스로 Git repository를 사용하는 GitOps 패턴을 따른다.
- Kubernetes 매니페스트는 여러 방법으로 지정할 수 있다.
- Argo CD는 지정된 대상 환경에서 원하는 애플리케이션 상태의 배포를 자동화한다.

![](/images/kubernetes/argo-cd/argo-cd-architecture.png)

## 설치

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

## GitOps
- 핵심은 git repository에 저장된 Kubernetes manifest 같은 파일을 이용하여 배포를 선언적으로 하는 것이다.
- git 저장소에 있는 것을 Kubernetes 클러스터에 동기화한다.

### GitOps의 원칙
1. 모든 시스템은 선언적으로 선언되어야 함\\
`선언적(declarative)`이라 함은 명령들의 집합이 아니라 사실(fact)들의 집합으로 구성이 되었음을 보장한다는 의미
쿠버네티스의 manifest들은 모두 선언적으로 작성되었고 이를 Git으로 관리한다면 versioning과 같은 Git의 장점과 더불어, SSOT(single source of truth)를 소유하게 됨
2. 시스템의 상태는 Git의 버전을 따라감\\
Git에 저장된 쿠버네티스 manifest를 기준으로 시스템에 배포되기 때문에 이전 버전의 시스템을 배포하고싶으면 git revert와 같은 명령어를 사용하면 됨
3. 승인된 변화는 자동으로 시스템에 적용됨\\
한 번 선언된 manifest가 Git에 등록되고 관리되기 시작하면 변화(코드수정 등)가 발생할때마다 자동으로 시스템에 적용되어야 하며, 클러스터에 배포할때마다 자격증명은 필요하지 않아야 함
4. 배포에 실패하면 이를 사용자에게 경고해야 함\\
시스템 상태가 선언되고 버전 제어 하에 유지되었을 때 배포가 실패하게되면 사용자에게 경고할 수 있는 시스템을 마련해야 함

### 기존의 배포 방식
1. 개발자가 소스코드를 작성
2. git 저장소에 push
3. Jenkins, CircleCI, Github Action과 같은 CI를 통해 테스트와 빌드 작업
4. 생성한 Container Image를 저장소(ex: Harbor)에 업로드
5. 업로드 된 Container Image의 정보를 참조해서 서버에 배포

![](/images/kubernetes/argo-cd/argo-cd-001.png)

### GitOps의 배포방식
1. 개발자가 소스코드를 작성
2. git 저장소에 push
3. Jenkins, CircleCI, Github Action 같은 CI에 의해서 테스트와 빌드 작업이 실행, 생성한 Container Image를 저장소(ex: Harbor)에 업로드
4. GitOps방식으로 관리되는 Manifest 파일의 변경사항을 감시하며, 현재 배포된 환경의 상태와 Git에 정의된 Manifest 상태를 동일하게 유지하는 역할을 수행

![](/images/kubernetes/argo-cd/argo-cd-002.png)