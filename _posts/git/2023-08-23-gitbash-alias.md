---
title: "[Git] Git Bash Alias"
date: 2023-08-23
categories: [Git, Alias]
tags: [Git, Windows, Alias]
---

## Windows Git Bash에서 Alias 설정

- `C:\Program Files\Git\etc\profile.d` 경로의 `aliases.sh` 파일에 아래와 같이 추가
    ```bash
    alias mgmt='cp -f %USERPROFILE%/.kube/config_mgmt %USERPROFILE%/.kube/config; kubectl get node -o wide'
    alias prod='cp -f %USERPROFILE%/.kube/config_prod %USERPROFILE%/.kube/config; kubectl get node -o wide'
    alias stg='cp -f %USERPROFILE%/.kube/config_stg %USERPROFILE%/.kube/config; kubectl get node -o wide'
    alias dev='cp -f %USERPROFILE%/.kube/config_dev %USERPROFILE%/.kube/config; kubectl get node -o wide'
    alias beta='cp -f %USERPROFILE%/.kube/config_beta %USERPROFILE%/.kube/config; kubectl get node -o wide'
    ```

- `C:\Program Files\Git\etc` 경로로 이동, `bash.bashrc` 파일에 아래와 같이 추가
    ```bash
    . /etc/profile.d/aliases.sh
    ```

- Terminal에서 `/etc` 경로로 이동, 아래 명령어로 적용
    ```bash
    source bash.bashrc
    ```