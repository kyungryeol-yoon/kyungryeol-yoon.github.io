---
title: "[Error] kubeadm join - pending"
date: 2022-08-27
categories: [Kubernetes, Error]
tags: [kubernetes, kubeadm]
---

- kubeadm join시 아래와 같은 에러가 발생하며 pending되는 현상 발생

## Error

- 아래와 같이 무한 pending

  ```bash
  [preflight] Running pre-flight checks
  ```

- 원인은 node join을 위한 token이 expired 되었기 때문
- token을 새로 생성해 해결 가능

## 해결 방법

- 아래 명령어로 token 생성

  ```bash
  kubeadm token create
  ```

## 확인

- 아래 명령어로 확인

  ```bash
  kubeadm token list
  ```

- `--discovery-token-ca-cert-hash`는 변경되지 않기 때문에 kubeadm join시 token을 새로 생성된 token 값으로 변경 후 join