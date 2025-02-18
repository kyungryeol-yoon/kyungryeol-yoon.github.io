---
title: "[Linux] Directory와 파일 용량 확인 명령어"
date: 2022-11-24
categories: [OS, Linux]
tags: [Linux, Disk, usage, Command]
---

## du Directory명

- Directory와 모든 하위 Directory의 용량을 표시해준다.
- 다음과 같이 명령하면 etc Directory와 그 하위 Directory의 사용량이 출력된다. 단위는 `kbyte`

  ```bash
  du /etc
  ```

## du -s Directory명

- 선택한 Directory만의 용량을 알고 싶으면 s 옵션을 붙인다.

  ```bash
  du -s /etc
  ```

## du -sh Directory명

- 용량이 읽기 편한 단위로 나오게 하려면 h 옵션을 붙인다.

  ```bash
  du -sh /etc
  ```

## du -sh Directory명/*

- 예를 들어 etc Directory 바로 아래 Directory들의 용량을 알고 싶으면 다음과 같이 한다.

  ```bash
  du -sh /etc/*
  ```

## du -d N Directory명

- d 옵션으로 몇 단계 하위 Directory까지 출력할지 정할 수 있다.
- 다음과 같이 명령하면 etc Directory의 2단계 하위 Directory까지의 용량을 출력한다.

  ```bash
  du -d 2 /etc
  ```

## du -a Directory명

- a 옵션을 붙이면 Directory에 속한 파일의 용량도 같이 출력한다.

  ```bash
  du -a /etc
  ```

## 디스크 사용량 확인

- 참고로 디스크 사용량은 df 명령어로 확인할 수 있다.

  ```bash
  df -h
  ```