---
title: "[Kubernetes] Helm"
date: 2024-02-12
categories: [Kubernetes, Helm]
tags: [Kubernetes, Helm, Install]
---

## Install Helm

> [설치 참고](https://helm.sh/docs/intro/install/)
{: .prompt-info }

### Script 방식

```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3

chmod +x get_helm.sh

./get_helm.sh

helm version
```

### Windows

#### choco 이용

```bash
choco install kubernetes-helm
```

#### scoop 이용

```bash
scoop install helm
```

### Apt 이용 (Debian/Ubuntu)

```bash
curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
sudo apt-get install apt-transport-https --yes
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update
sudo apt-get install helm
```

## Helm Chart 명령어

> [Helm Commands 참고](https://helm.sh/ko/docs/helm/)
{: .prompt-info }

### helm search

- chart 찾기
    - `helm search hub [keyword]` 는 여러 저장소들에 있는 헬름 차트들을 포괄하는 helm hub 를 검색한다.
    - `helm search repo [keyword]` 는 helm repo add [name] [chars_url] 를 사용하여 로컬 헬름 클라이언트에 추가된 저장소들을 검색한다.

### helm install

- 패키지 설치
    - `helm install [chart] --generate-name --debug --dry-run`
        - `--dry-run` : 실제 클러스터에 설치 하지 않고 chart를 시험 설치하는 옵션
        - `--debug` : 배포를 위한 manifest 파일 내용을 보여줌
    - `helm install [release] [chart]`
    - `helm install -f values.yaml [chart] --generate-name`
    - `helm install --set servers[0].port=80 [release] [chart]`
    - `helm install [release] charts.tgz`
    - `helm install [release] path/to/charts`
    - `helm install [release] [charts_tgz_url]`

### helm status

- 릴리스의 상태 확인
    - `helm status [release]`

### helm show values

- 차트에 옵션 설정 가능한 values 조회
    - `helm show values [chart]`

### helm get values

- 해당 릴리스에 대한 옵션 설정 values를 조회
    - `helm get values [release]`

### helm upgrade

- 릴리스 업그레이드
    - `helm upgrade -f values.yaml [release] [chart]`

### helm rollback

- 릴리스 원복
    - `helm rollback [release] [version]`

### helm history

- 릴리스 버전 이력 조회
    - `helm history [release]`

### helm uninstall

- 릴리스 uninstall
    - `helm uninstall [release]`
    - `--keep-history`
        - 삭제시 릴리스 기록을 보존
        - 기본적으로는 기록도 삭제

### helm list

- 릴리스 목록 조회
    - `helm list --all`
    - `--all`
        - 실패하거나 삭제된 기록도 모두 표시

### helm repo

- 저장소 작업하기

### helm repo list

- 저장된 저장소 목록 조회
    - `helm repo list`

### helm repo add

- 새 저장소 추가
    - `helm repo add [name] [url]`

### helm repo update

- 저장소 업데이트
    - `helm repo update [name1] [name2] ...`
        > 이전에 repository를 추가한 경우, 아래 명령을 실행하여 최신 버전의 패키지를 가져온다.
        {: .prompt-info }

### helm repo remove

- 저장소 삭제
    - `helm repo remove [name1] [name2] ...`

### helm create

- 내 차트 만들기
    - `helm create [name]`
    - Directory에 차트가 생김

### helm package

- 배포용 차트로 패키징
    - `helm package [chart_path]`

### Chart

> [Chart 참고](https://helm.sh/ko/docs/topics/charts/)
{: .prompt-info }

- Chart.yaml
    - 차트에 대한 정보를 가진 YAML 파일
        ```yaml
        apiVersion: 차트 API 버전 (필수)
        name: 차트명 (필수)
        version: SemVer 2 버전 (필수)
        kubeVersion: 호환되는 쿠버네티스 버전의 SemVer 범위 (선택)
        description: 이 프로젝트에 대한 간략한 설명 (선택)
        type: 차트 타입 (선택)
        keywords:
          - 이 프로젝트에 대한 키워드 리스트 (선택)
        home: 프로젝트 홈페이지의 URL (선택)
        sources:
          - 이 프로젝트의 소스코드 URL 리스트 (선택)
        dependencies: # 차트 필요조건들의 리스트 (optional)
          - name: 차트명 (nginx)
            version: 차트의 버전 ("1.2.3")
            repository: 저장소 URL ("https://example.com/charts") 또는 ("@repo-name")
            condition: (선택) 차트들의 활성/비활성을 결정하는 boolean 값을 만드는 yaml 경로 (예시: subchart1.enabled)
            tags: # (선택)
              - 활성화 / 비활성을 함께하기 위해 차트들을 그룹화 할 수 있는 태그들
            enabled: (선택) 차트가 로드될수 있는지 결정하는 boolean
            import-values: # (선택)
              - ImportValues 는 가져올 상위 키에 대한 소스 값의 맵핑을 보유한다. 각 항목은 문자열이거나 하위 / 상위 하위 목록 항목 쌍일 수 있다.
            alias: (선택) 차트에 대한 별명으로 사용된다. 같은 차트를 여러번 추가해야할때 유용하다.
        maintainers: # (선택)
          - name: maintainer들의 이름 (각 maintainer마다 필수)
            email: maintainer들의 email (각 maintainer마다 선택)
            url: maintainer에 대한 URL (각 maintainer마다 선택)
        icon: 아이콘으로 사용될 SVG나 PNG 이미지 URL (선택)
        appVersion: 이 앱의 버전 (선택). SemVer인 필요는 없다.
        deprecated: 차트의 deprecated 여부 (선택, boolean)
        annotations:
          example: 키로 매핑된 주석들의 리스트 (선택).
        ```