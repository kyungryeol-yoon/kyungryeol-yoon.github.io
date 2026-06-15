---
title: "[Git] Git Bash Alias - Windows"
date: 2023-08-23
tags: [git, windows, alias]
description: "Windows Git Bash에서 alias를 설정하는 방법. aliases.sh, bash.bashrc 파일을 수정해 자주 쓰는 명령을 별칭으로 등록하는 과정을 정리합니다."
---

## Windows Git Bash에서 Alias 설정

- `C:\Program Files\Git\etc\profile.d` 경로의 `aliases.sh` 파일에 아래와 같이 추가
  ```bash
  alias mgmt='cp -f $HOME/.kube/config_mgmt $HOME/.kube/config; kubectl get node -o wide'
  alias prod='cp -f $HOME/.kube/config_prod $HOME/.kube/config; kubectl get node -o wide'
  alias stg='cp -f $HOME/.kube/config_stg $HOME/.kube/config; kubectl get node -o wide'
  alias dev='cp -f $HOME/.kube/config_dev $HOME/.kube/config; kubectl get node -o wide'
  alias beta='cp -f $HOME/.kube/config_beta $HOME/.kube/config; kubectl get node -o wide'
  alias ls='ls -F --color=auto --show-control-chars'
  alias ll='ls -l'
  ```

- `C:\Program Files\Git\etc` 경로로 이동, `bash.bashrc` 파일에 아래와 같이 추가
  ```bash
  . /etc/profile.d/aliases.sh
  ```

- Terminal에서 `/etc` 경로로 이동, 아래 명령어로 적용
  ```bash
  source bash.bashrc
  ```