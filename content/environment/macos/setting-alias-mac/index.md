---
title: "[Mac OS] Setting Alias Mac OS"
date: 2017-12-01
tags: [setting, alias, macos]
description: "macOS에서 alias를 영구 등록하는 방법. 기본 셸 zsh의 ~/.zshrc를 수정해 자주 쓰는 명령을 별칭으로 등록하는 과정을 정리합니다."
---

### alias 등록
- 맥북은 bash쉘이 아닌 zsh쉘을 기본으로 사용한다.
- 그렇기 때문에 `~/.bashrc`가 아닌 `~/.zshrc` 파일을 열어 수정을 해줘야 한다.
- zshrc 파일로 영구 등록

```bash
vi ~/.zshrc
```

- 원하는 alias를 등록해준다.
- alias [별명]=[linux 명령어] 

> 💡 문서의 맨 처음으로 이동: `gg` 또는 `1G`

> 💡 문서의 맨 마지막으로 이동: `G`

```conf
# k3s alias
alias k3sctl="kubectl --kubeconfig=${HOME}/.kube/k3s.yaml"

# istio 환경변수
export PATH=/Users/kyungryeol.yoon/istio-1.15.0/bin:/Users/kyungryeol.yoon/istio-1.15.0/bin:/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
```

- esc -> :wq 로 저장한다.
- 터미널을 끄고 다시 시작한다.