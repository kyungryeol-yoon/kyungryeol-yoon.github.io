---
title: "[Kubernetes] kubetail"
date: 2020-04-15
categories: [Kubernetes, Tool]
tags: [kubernetes, kubetail]
---

- 여러 POD의 로그를 동시에 조회하는 기능
- `kubectl logs -f`를 실행하는 것과 동일하지만 여러 Pod에 적용

## Install Ubuntu

```bash
sudo apt install kubetail
```

## Install Mac OS

```bash
brew tap johanhaleby/kubetail && brew install kubetail
```

> kubetail에 대한 설정 방법은 [설치 문서](https://github.com/johanhaleby/kubetail)를 참고하시기 바랍니다.
{: .prompt-info }

## How to use
### Container or Multiple Containers

```bash
kubetail app2 -c container1
kubetail app2 -c container1 -c container2
```

### Multiple Apps(pods)

```bash
kubetail app1,app2
``` 

### Deployment or DaemonSet

```bash
kubetail "coredns-556f6dffc4-*" -n kube-system
Will tail 2 logs...
coredns-556f6dffc4-bd2mr
coredns-556f6dffc4-hbvdt
```

### Label selector.

```bash
kubetail --selector service=my-service --since 10m
kubetail --selector release=p-jm-han
```

### Regex

```bash
kubetail "^app1|.*my-demo.*" --regex

kubetail '.*loki-read-*|.*loki-write-*' -n monitoring --regex
Using regex '.*loki-read-*|.*loki-write-*' to match pods
Will tail 6 logs...
loki-read-0
loki-read-1
loki-read-2
loki-write-0
loki-write-1
loki-write-2
```

> [명령어] `--help`를 입력하면 더 다양한 옵션들을 찾을 수 있다.
{: .prompt-info }