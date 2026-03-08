---
title: "[Python] 가상환경 venv 사용법"
date: 2021-07-02
categories: [Programming, Python]
tags: [python, venv, programming, backend, devops]
pin: true
---

## 🐍 왜 파이썬 가상환경(venv)을 써야 할까?

파이썬 프로젝트를 진행하다 보면 "A 프로젝트에서는 Django 3.2가 필요한데, B 프로젝트에서는 4.0이 필요하네?" 같은 상황이 발생합니다. 이때 시스템에 패키지를 전역으로 설치하면 버전 충돌로 인해 코드가 깨질 수 있습니다. 😱

**가상환경(Virtual Environment)**은 프로젝트마다 독립된 방을 만들어 주는 것과 같습니다.
- **의존성 분리**: 프로젝트별로 필요한 패키지 버전을 독립적으로 관리합니다.
- **깔끔한 환경**: 시스템 파이썬 환경을 더럽히지 않고 필요한 것만 골라 설치합니다.
- **협업 용이**: 팀원들과 동일한 패키지 환경을 공유하기 매우 쉬워집니다.

---

## 🛠️ 1. 가상환경 생성하기

프로젝트 루트 폴더(예: `my_project`)로 이동한 뒤 아래 명령어를 입력합니다. 가상환경 이름은 관례적으로 `venv`를 가장 많이 사용합니다.

### 기본 생성
```bash
# python -m venv [가상환경이름]
python -m venv venv
```

### 특정 버전으로 생성 (설치된 경우)

```bash
# Windows
py -3.10 -m venv venv

# macOS / Linux
python3.10 -m venv venv
```

> **Tip**: `--system-site-packages` 옵션을 붙이면 시스템에 이미 설치된 전역 패키지들을 포함한 상태로 가상환경을 시작할 수 있습니다.
{: .prompt-tip }

---

## 🚀 2. 가상환경 활성화 & 비활성화

가상환경을 만들었으면 그 '방'으로 들어가야 합니다. 운영체제에 따라 명령어가 다르니 주의하세요!

### 활성화 (Activate)

| 운영체제 | 터미널 (Shell) | 명령어 |
| --- | --- | --- |
| **Windows** | CMD / PowerShell | `venv\Scripts\activate` |
| **macOS / Linux** | bash / zsh | `source venv/bin/activate` |

활성화되면 터미널 프롬프트 앞에 `(venv)`라는 표시가 나타납니다.

### 비활성화 (Deactivate)

작업이 끝났다면 어느 환경에서든 아래 명령어 한 줄이면 됩니다.

```bash
deactivate
```

---

## 📦 3. 패키지 관리 (설치 및 공유)

가상환경이 활성화된 상태에서 패키지를 관리하는 방법입니다.

### 패키지 설치 및 확인

```bash
pip install pandas       # 설치
pip uninstall pandas     # 삭제
pip list                 # 설치된 패키지 목록 확인
```

### 협업의 핵심: requirements.txt

내가 사용한 패키지 목록을 파일로 만들어 팀원에게 전달하거나, 서버에 배포할 때 사용합니다.

```bash
# 1. 현재 환경의 패키지 목록 추출
pip freeze > requirements.txt

# 2. 파일에 기록된 패키지 한 번에 설치 (새 환경에서)
pip install -r requirements.txt
```

---

## ⚠️ 4. 주의사항 (Git 관리)

가상환경 폴더(`venv/`)는 용량이 크고 사용자의 로컬 경로에 의존적입니다. 따라서 **Git에 절대 올리지 않습니다.** 🙅‍♂️

`.gitignore` 파일에 반드시 아래 내용을 추가해 주세요.

```text
# .gitignore
venv/
__pycache__/
*.pyc
```

---

> 참고 자료: [venv와 virtualenv 차이](https://kyungryeol-yoon.github.io/posts/python-venv-virtualenv/)
{: .prompt-info }
