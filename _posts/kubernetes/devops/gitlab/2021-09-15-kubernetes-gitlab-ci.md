---
title: "[Kubernetes] Gitlab CI"
date: 2021-09-15
categories: [Kubernetes, DevOps]
tags: [kubernetes, gitlab, ci]
---

> [Install Gitlab Runner 참고](https://kyungryeol-yoon.github.io/posts/kubernetes-install-gitlab-runner-using-helm/)
{: .prompt-info }

```yml
stages:
  - build
  - test

variables:
  # DOCKER_HOST: tcp://docker:2376
  # DOCKER_HOST: tcp://docker:2375
  DOCKER_HOST: tcp://localhost:2375
  DOCKER_TLS_CERTDIR: ""
  DOCKER_DRIVER: overlay2
  
services:
  # - docker:24.0.5-dind  # Docker-in-Docker (dind) 서비스 사용
  - docker:19.03.12-dind

before_script:
  - docker info  # Docker 데몬 연결 확인

build:
  stage: build
  tags:
    - k8s
  # image: docker:24.0.5
  image: docker:19.03.12
  script:
    - docker build -t 192.168.0.54:8443/sample-app/test:0.0.1 .
    - docker push 192.168.0.54:8443/sample-app/test:0.0.1
  when: manual

test:
  stage: test
  tags:
    - k8s
  image: docker:19.03.12
  script:
    - docker run my-image test
  when: manual
```

```yml
stages:
- build
- test
docker-build:
  stage: build
  only:
  - master
  variables:
      DOCKER_HOST: tcp://docker:2376
      DOCKER_TLS_CERTDIR: /certs
      DOCKER_TLS_VERIFY: "1"
      DOCKER_CERT_PATH: $DOCKER_TLS_CERTDIR/client
      RND: ""
      CI_DOCKER_CONFIG: ""
      CI_IMAGE: "harbor.localhost.com/sample-api/sample-api"
      IMAGE_TAG: "1.0.1"
  image: mgmt-system/library-docker:latest
  services:
  - name: mgmt-system/docker-runner:dind
      alias: docker
  before_script:
  - echo "run.. CI_REGISTRY = $CI_REGISTRY"
  - echo "run.. CI_DOCKER_CONFIG = $CI_DOCKER_CONFIG"
  script:
  - mkdir ~/.docker
  - echo "$CI_DOCKER_CONFIG" | base64 -d > ~/.docker/config.json
  - cat ~/.docker/config.json
  - docker build --no-cache -t "$CI_IMAGE":"$IMAGE_TAG" .
  - docker push "$CI_IMAGE":"$IMAGE_TAG"
  when: manual
unit_test:
  stage: test
  image: system/system-python3.8.8:1.0
  script:
  - echo "Running unit tests..."
  - python3 -m venv venv
  - source venv/bin/activate
  - pip install --no-cache-dir -r requirements.txt -i http://nexus.com/repo/pypi/simple --trusted-host nexus.com
  - pytest test
  when: manual
```

## error (docker:19.03.12-dind, docker:19.03.12)

```
x509: certificate signed by unknown authority
```

## error (docker:24.0.5-dind, docker:24.0.5)

```
ERROR: Cannot connect to the Docker daemon at tcp://docker:2375. Is the docker daemon running?
errors pretty printing info
```

> 만약 gitlab-ci.yml 에서 runner의 tag 또는 name을 지정할 경우 helm의 values.yaml에서 tags 혹은 name에 값을 설정해주면 된다.
{: .prompt-info }

```yaml
  ## Specify the tags associated with the runner. Comma-separated list of tags.
  ##
  ## ref: https://docs.gitlab.com/ee/ci/runners/configure_runners.html#use-tags-to-control-which-jobs-a-runner-can-run
  ##
  tags: "my-runner"

  ## Specify the name for the runner.
  ##
  # name: ""
```