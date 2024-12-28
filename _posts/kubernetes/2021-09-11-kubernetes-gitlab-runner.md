---
title: "[Kubernetes] Gitlab Runner"
date: 2021-09-11
categories: [Kubernetes, Gitlab]
tags: [Kubernetes, Gitlab, Runner]
---

> [Helm 설치 및 설명 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-helm/)
{: .prompt-info }

> [gitlab runner 참고](https://docs.gitlab.com/runner/install/kubernetes.html)
{: .prompt-info }

## Helm Chart를 사용하여 GitLab Runner 설치

- GitLab Helm 리포지터리를 추가
    ```bash
    helm repo add gitlab https://charts.gitlab.io
    ```

- `values.yaml` 파일을 사용하여 실행
    ```bash
    helm install --namespace <NAMESPACE> gitlab-runner -f <CONFIG_VALUES_FILE> gitlab/gitlab-runner
    ```

- `<NAMESPACE>`는 GitLab 러너를 설치하기 원하는 Kubernetes Namespace
- `<CONFIG_VALUES_FILE>`은 커스텀 설정이 포함된 파일의 경로. Helm Chart를 사용

## Values 작성

- `values.yaml` 파일
    ```yaml
    gitlabUrl: https://gitlab.com # gitlab url 입력
    runnerRegistrationToken: a-trnA24KR77Mh***** # registration token 생성(CI/CD > Runner > New Project Runner)
    ```

![](/images/kubernetes/docker/gitlab/gitlab-runner-step4.png)

- helm 설치하기(`values.yaml` 파일이 있는 폴더에서 아래 명령어를 수행)
    ```bash
    helm install --namespace hello-world gitlab-runner -f values.yaml gitlab/gitlab-runner
    ```

## Helm Chart를 사용하여 GitLab Runner 업그레이드

- GitLab 러너를 업그레이드하기 전에, GitLab에 러너를 중지시키고 모든 Job이 끝났는지 확인
- 러너를 중지시키는 것은 완료 시 권한부여 오류같이 Job에서 발생하는 문제를 방지할 수 있다.

```bash
helm upgrade --namespace <NAMESPACE> -f <CONFIG_VALUES_FILE> <RELEASE-NAME> gitlab/gitlab-runner
```

- `<NAMESPACE>`는 GitLab 러너를 설치하기 원하는 Kubernetes Namespace
- `<CONFIG_VALUES_FILE>`은 커스텀 설정이 포함된 파일의 경로. Helm Chart를 사용하여 GitLab Runner 설정하기를 참고
- `<RELEASE-NMAE>`은 차트를 설치할 때 지어주는 이름. Helm Chart를 사용하여 GitLab Runner 설치하기에서는 gitlab-runner라고 했다.

> GitLab Runner Helm Chart를 최신 버전이 아닌 특정 버전으로 업데이트하길 원한다면, helm upgrade 명령어에 --version <RUNNER_HELM_CHART_VERSION>을 추가
{: .prompt-info }