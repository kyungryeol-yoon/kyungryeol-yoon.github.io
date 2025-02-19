---
title: "[Mac OS] Setting Alias Mac OS"
date: 2017-12-01
categories: [OS, MacOS]
tags: [setting, alias, macos]
# comments: true
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

> 문서의 맨 처음으로 이동: `gg` 또는 `1G`
{: .prompt-tip }

> 문서의 맨 마지막으로 이동: `G`
{: .prompt-tip }

```conf
# k3s alias
alias k3sctl="kubectl --kubeconfig=${HOME}/.kube/k3s.yaml"

# istio 환경변수
export PATH=/Users/kyungryeol.yoon/istio-1.15.0/bin:/Users/kyungryeol.yoon/istio-1.15.0/bin:/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
```

- esc -> :wq 로 저장한다.
- 터미널을 끄고 다시 시작한다.