---
title: "[Linux] alias 명령어 치환"
date: 2018-10-25
categories: [OS, Linux]
tags: [linux, alias]
---

## alias 명령어

- 복잡한 명령어와 옵션을 간단히 입력할 수 있는 문자열로 치환한다.

### 사용법

```bash
alias [단축키]='[명령어]'
```

## alias 명령어 사용 예제
### 예제 1)

- alias로 지정된 명령어 확인한다.

```bash
alias
```

### 예제 2)

- clear 명령어 대신 c를 입력해도 같은 기능을 하게 만든다.

```bash
alias c='clear'
```

### 예제 3)

- mkdir -p a/b/c 명령어 대신 m을 입력해도 같은 기능을 하게 만든다.

```bash
alias m='mkdir -p a/b/c'
```

## alias 명령어 영구 저장

- 설정 해 놓은 alias는 창이 꺼지면 다 사라진다.
- 영구적으로 저장 하고 싶을땐 `.bashrc`에 저장 하면 된다.
- `.bashrc`의 위치는 `~계정명/.bashrc` 이다.
- A라는 계정에서 저장한 alias명령어는 B라는 계정에서 사용 불가능하다.

### 저장법

1. `cat >> ~root/.bashrc` 입력
2. 자신이 저장 할 alias 입력
3. Enter 후 `Ctrl + C`
4. 창을 껐다가 키거나, 아래 명령어을 입력한다.

  ```bash
  chsh -s /bin/bash
  ```