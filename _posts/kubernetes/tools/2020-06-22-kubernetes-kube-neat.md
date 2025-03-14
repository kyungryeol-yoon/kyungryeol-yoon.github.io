---
title: "[Kubernetes] kubectl neat"
date: 2020-06-22
categories: [Kubernetes, Tool]
tags: [kubernetes, kubectl-neat]
---

- `-o yaml` 로 기존 리소스를 저장하면 아래와 같은 불필요한 정보도 추가되어 저장된다.
    1. 생성 타임스탬프 또는 일부 내부 ID와 같은 메타데이터
    2. 누락된 속성을 기본값으로 채우기
    3. 서비스 계정 토큰과 같은 승인 컨트롤러가 생성한 추가 시스템 속성
    4. 상태 정보
- k neat를 사용하여 정리된 yaml 을 얻을 수 있다.

## Install krew first

- Krew는 kubectl plugin을 쉽게 사용할 수 있게 해주는 도구입니다.

> Install krew 참고
- <https://github.com/kubernetes-sigs/krew>
{: .prompt-info }

```
(
  set -x; cd "$(mktemp -d)" &&
  OS="$(uname | tr '[:upper:]' '[:lower:]')" &&
  ARCH="$(uname -m | sed -e 's/x86_64/amd64/' -e 's/\(arm\)\(64\)\?.*/\1\2/' -e 's/aarch64$/arm64/')" &&
  KREW="krew-${OS}_${ARCH}" &&
  curl -fsSLO "https://github.com/kubernetes-sigs/krew/releases/latest/download/${KREW}.tar.gz" &&
  tar zxvf "${KREW}.tar.gz" &&
  ./"${KREW}" install krew
)
```

### Add Env to bashrc or zshrc

```bash
export PATH="${KREW_ROOT:-$HOME/.krew}/bin:$PATH"
```

### 기본 구조

```bash
kubectl krew [Command]
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }

## Install neat with krew

```bash
kubectl krew install neat
```

> kubectl-neat에 대한 설정 방법은 [설치 문서](https://github.com/itaysk/kubectl-neat)를 참고
{: .prompt-info }

### 기본 구조

- 끝에 `k neat`를 붙여준다.

```bash
kubectl get pod [pod-name] -o yaml | k neat
```

