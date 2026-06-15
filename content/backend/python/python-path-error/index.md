---
title: "[Error] Python PATH Problem"
date: 2024-08-20
tags: [python, list, programming]
description: "Windows에서 python 명령이 동작하지 않는 PATH 문제의 원인과 해결법. 시스템 환경변수에 경로 추가, 재설치 시 Add to PATH 방법을 정리합니다."
---

- Command 상에서 python 파일명.py를 써서 실행하면 Python이라는 응답이 나오는 것을 볼 수 있다.

## 문제점

- 윈도우10 시스템 변수에 경로(PATH)로 추가하지 않았기 때문에 발생한다.
  ```bash
  PS F:\Development\python_prj\BoardAPI> python -m venv venv
  Python
  PS F:\Development\python_prj\BoardAPI> python -v
  Python
  PS F:\Development\python_prj\BoardAPI> python3 -v
  Python
  PS F:\Development\python_prj\BoardAPI>
  ```

## 해결 방법

- 윈도우10 시스템 변수에 경로(PATH)로 추가한다면 이 문제는 해결된다.
- 또는 다시 설치해서 Add Path 해준다.