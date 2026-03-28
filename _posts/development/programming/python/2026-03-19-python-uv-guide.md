---
title: "[Python] 🚀 uv로 프로젝트 & 패키지 관리 완벽 가이드"
date: 2026-03-19
categories: [Programming, Python]
tags: [python, uv, package-management, venv, devops]
pin: true
---

## 🐍 uv로 Python 프로젝트 관리하기

`uv`는 Python 프로젝트에서 **패키지 관리 + 가상환경 + Python 버전 관리**를 한 번에 해결해주는 최신 도구입니다.
기존 `pip`, `venv`, `pyenv`를 대체할 수 있는 **올인원 툴**이라고 보시면 됩니다 ⚡

이 글에서는 실무에서 바로 사용할 수 있도록 **정확한 명령어 기준으로 깔끔하게 정리**했습니다.

---

## 1️⃣ 프로젝트 생성 및 설정

### 📦 프로젝트 생성

```bash
# 현재 디렉토리에 새로운 파이썬 프로젝트 환경을 초기화하는 기본적인 파일과 폴더 구조가 자동으로 생성
uv init

# 기본 프로젝트 생성
uv init my-project

# 설정 파일만 필요하다면
uv init --bare

# 특정 Python 버전으로 생성
uv init my-project --python 3.11

# 가상환경 없이 생성
uv init my-project --no-venv
```

⚠️ 만약 `error: Failed to discover parent workspace;` 가 발생했다면 `--no-workspace` 옵션을 넣어주어 프로젝트를 생성

### 📚 의존성 관리

```bash
# 패키지 추가
uv add requests

# 특정 버전 추가
uv add requests==2.31.0

# 개발 의존성 추가
uv add --dev pytest

# 로컬 패키지 (editable 모드)
uv add -e ./localpackage
```

### ❌ 의존성 제거

```bash
uv remove requests
uv remove --dev pytest
```

### 🔄 의존성 동기화

```bash
uv sync                 # 전체 설치
uv sync --dev           # 개발 의존성 포함
uv sync --no-dev        # 개발 의존성 제외
```

### 🔒 의존성 잠금

```bash
uv lock
uv lock --dev
uv lock --no-dev
```

---

## 2️⃣ 패키지 설치 (pip 스타일)

### 📥 기본 설치

```bash
uv pip install requests
```

### 🎯 특정 버전 설치

```bash
uv pip install "requests==2.31.0"
uv pip install "requests>=2.31.0"
uv pip install "requests<3.0.0"
```

### 🧪 개발 도구 설치

```bash
uv pip install --dev pytest
uv pip install --dev black isort mypy
```

### ❌ 패키지 제거

```bash
uv pip uninstall requests
uv pip uninstall -y requests
```

### ⬆️ 패키지 업그레이드

```bash
uv pip install --upgrade requests
uv pip install --upgrade pip
```

### 🔍 패키지 조회

```bash
uv pip search "data science"
uv pip show requests
uv pip list
uv pip list outdated
```

---

## 3️⃣ 가상환경 관리

### 🏗️ 가상환경 생성

```bash
uv venv
uv venv --python 3.11
uv venv --name myenv
uv venv --clear
```

### ▶️ 가상환경 활성화

#### macOS / Linux

```bash
source .venv/bin/activate
source myenv/bin/activate
```

#### Windows

```bash
.venv\Scripts\activate
myenv\Scripts\activate
```

### ⛔ 가상환경 비활성화

```bash
deactivate
```

---

## 4️⃣ Python 버전 관리

### 📦 Python 설치

```bash
uv python install 3.11
uv python install 3.11.0
uv python install 3.11 --force
```

### 🧰 버전 관리

```bash
uv python list
uv python remove 3.11
uv python pin 3.11
```

### ▶️ 특정 버전 실행

```bash
uv run --python 3.11 script.py
uv run --python 3.11 -m pytest
```

---

## 5️⃣ 스크립트 실행

### ▶️ 기본 실행

```bash
uv run script.py
uv run -m module
```

### 📦 의존성과 함께 실행

```bash
uv run --with-deps script.py
uv run --no-deps script.py
```

### 🎛️ 인자 전달

```bash
uv run script.py --arg1 value1 --arg2 value2
uv run -m pytest tests/ --verbose
```

### 🌍 환경 변수 설정

```bash
uv run --env VAR1=value1 --env VAR2=value2 script.py
```

---

## 💡 실무 팁

* ✅ `uv sync` 하나로 팀 환경 통일 가능
* ✅ `uv lock`으로 의존성 충돌 방지
* ✅ `uv run`으로 Python 버전까지 통제
* ✅ `pip + venv + pyenv` 대체 가능

---

## 🎯 이런 분들께 추천

* ⚡ 빠른 Python 환경을 원하시는 분
* 🧩 의존성 관리에 스트레스 받는 분
* 🐳 Docker / CI 환경에서 속도 개선이 필요한 분

---

## 🎉 마무리

`uv`는 단순한 패키지 매니저가 아니라
👉 **Python 개발 환경 전체를 관리하는 차세대 도구**입니다.

앞으로 Python 프로젝트는 이렇게 관리하는 것이 표준이 될 가능성이 높습니다 🚀

* ⚡ 빠른 패키지 설치
* 🧩 의존성 관리 통합
* 🐍 Python 버전 관리까지 한 번에

👉 기존 `pip`, `venv`, `pyenv`를 따로 쓰던 분들에게 강력 추천!
