---
title: "[Gitlab] Docker in Docker"
date: 2025-04-22
categories: [DevOps, Gitlab]
tags: [gitlab, cache, docker]
---


**핵심 아이디어:** Docker 이미지 레이어 캐시와 GitLab CI의 캐싱 기능을 결합하여 이전 빌드 정보를 재활용하는 것입니다.

**구체적인 방법:**

1.  **`--cache-from` 옵션 활용:**
    * `docker build` 명령어 실행 시 `--cache-from` 옵션을 사용하여 이전 빌드에서 생성된 이미지를 캐시로 지정합니다.
    * 이렇게 하면 Docker는 이미지를 빌드할 때 각 레이어가 변경되었는지 확인하고, 변경되지 않은 레이어는 캐시된 이미지를 재사용하여 빌드 시간을 단축합니다.
    * `.gitlab-ci.yml` 파일의 `script` 섹션에서 다음과 같이 사용할 수 있습니다.

    ```yaml
    build:
      stage: build
      script:
        - docker pull $CI_REGISTRY_IMAGE:latest || true # 이전 이미지 풀 (실패해도 무시)
        - docker build --cache-from $CI_REGISTRY_IMAGE:latest -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
        - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    ```

    * `$CI_REGISTRY_IMAGE:latest`는 이전 빌드에서 푸시된 최신 이미지를 가리킵니다. `|| true`는 이미지가 없을 경우 빌드가 실패하는 것을 방지합니다.
    * 매 빌드마다 새로운 태그(`$CI_COMMIT_SHA`)로 이미지를 빌드하고 푸시하여 이후 빌드에서 캐시로 활용할 수 있도록 합니다.

2.  **Docker BuildKit의 Inline Cache 활용:**
    * Docker 18.09 버전부터 도입된 BuildKit은 빌드 캐시를 이미지 메타데이터에 내장하는 Inline Cache 기능을 제공합니다.
    * 이를 활성화하면 `--cache-from` 없이도 빌드 컨텍스트 내에서 캐시 정보를 활용할 수 있어 효율성을 높일 수 있습니다.
    * `.gitlab-ci.yml` 파일의 `variables` 섹션에 다음과 같이 설정하거나, `docker build` 시 `--build-arg` 옵션으로 전달할 수 있습니다.

    ```yaml
    variables:
      DOCKER_BUILDKIT: "1"
      BUILDKIT_INLINE_CACHE: "1"
    ```

    또는

    ```yaml
    build:
      stage: build
      script:
        - docker build --build-arg BUILDKIT_INLINE_CACHE=1 -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
        - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    ```

3.  **GitLab CI 캐시 활용 (선택적):**
    * GitLab CI 자체의 캐싱 기능을 활용하여 Docker 빌드에 필요한 소스 코드, 의존성 등을 캐싱할 수도 있습니다.
    * `.gitlab-ci.yml` 파일의 `cache` 섹션을 사용하여 캐싱할 경로를 지정합니다.

    ```yaml
    cache:
      key: $CI_COMMIT_REF_SLUG
      paths:
        - ./your_source_code
        - ./node_modules # 예시
        - ./vendor # 예시
    ```

    * 하지만 Docker 이미지 레이어 캐시와 달리, GitLab CI 캐시는 파일 단위로 동작하므로 Docker 이미지 빌드 자체의 캐싱과는 직접적인 관련이 적을 수 있습니다. 주로 빌드 환경 준비 시간을 줄이는 데 효과적입니다.

4.  **Multi-Stage Dockerfile 구성 최적화:**
    * Dockerfile의 각 단계를 논리적으로 분리하고, 변경 가능성이 낮은 단계(예: 의존성 설치)를 먼저 배치합니다. 이렇게 하면 앞쪽 레이어가 변경되지 않는 한 뒤쪽 레이어는 캐시를 재활용할 수 있습니다.
    * 빌드에 불필요한 파일은 최종 이미지에 포함되지 않도록 주의하여 이미지 크기를 줄이고 캐시 효율성을 높입니다.

5.  **Docker Registry 캐시 활용 (고급):**
    * GitLab Container Registry 또는 별도의 Docker Registry를 캐시 저장소로 활용하여 더욱 정교한 캐싱 전략을 구현할 수 있습니다.
    * `docker buildx` 명령어를 사용하면 Registry를 캐시 백엔드로 지정하여 빌드 캐시를 Registry에 저장하고 재사용할 수 있습니다. 이는 여러 러너 간에 캐시를 공유하는 데 유용합니다.

**주의사항:**

* `--cache-from`은 지정된 이미지가 존재해야 동작합니다. 따라서 첫 번째 빌드 또는 캐시 이미지가 없는 경우에는 풀(pull) 작업이 필요할 수 있습니다.
* 캐시 키를 적절하게 관리하는 것이 중요합니다. 너무 자주 변경되는 캐시 키는 캐시의 효과를 떨어뜨립니다.
* Dockerfile의 명령어 순서가 캐시 효율성에 큰 영향을 미칩니다. 자주 변경되는 설정이나 파일 복사 명령어는 가능한 뒤쪽에 배치하는 것이 좋습니다.
