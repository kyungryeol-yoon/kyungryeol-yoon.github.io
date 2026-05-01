---
title: "[Python] 🚀 uv로 프로젝트 & 패키지 관리 완벽 가이드"
date: 2026-03-19
categories: [Backend, Python]
tags: [python, uv, package-management, venv, devops]
pin: true
---

## 🐍 uv로 Python 프로젝트 관리하기

`uv`는 Python 프로젝트에서 **패키지 관리 + 가상환경 + Python 버전 관리**를 한 번에 해결해주는 최신 도구입니다.
Rust로 작성되어 기존 `pip`보다 **10~100배 빠르며**, `pip`, `venv`, `pyenv`를 대체할 수 있는 **올인원 툴**입니다 ⚡

이 글에서는 실무에서 바로 사용할 수 있도록 **정확한 명령어 기준으로 깔끔하게 정리**했습니다.

---

## 📥 설치하기

### macOS / Linux

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Windows

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### pip으로 설치

```bash
pip install uv
```

설치 후 버전 확인:

```bash
uv --version
```

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

### 📁 uv init 시 생성되는 파일

`uv init` 실행 후 프로젝트 디렉토리에 아래 파일들이 자동으로 생성됩니다.

```text
my-project/
├── pyproject.toml       # 프로젝트 메타데이터 및 의존성 정의
├── .python-version      # 사용할 Python 버전 고정
├── uv.lock              # 의존성 버전 잠금 파일 (자동 생성)
├── .venv/               # 가상환경 디렉토리
└── src/
    └── main.py          # 기본 진입점
```

> **Tip**: `uv.lock` 파일은 git에 포함해야 팀원 전체가 동일한 의존성 환경을 보장받을 수 있습니다.

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
uv pip freeze               # 현재 환경의 의존성 requirements 형식으로 출력
```

---

## 🤔 uv add vs uv pip install 차이

두 명령어 모두 패키지를 설치하지만 사용 목적이 다릅니다.

| 구분 | `uv add` | `uv pip install` |
|------|----------|-----------------|
| **용도** | 프로젝트 의존성으로 등록 | 즉시 설치 (pip 호환) |
| **pyproject.toml** | ✅ 자동 업데이트 | ✗ 업데이트 안 함 |
| **uv.lock** | ✅ 자동 갱신 | ✗ 갱신 안 함 |
| **추천 상황** | 팀 프로젝트, 공유 환경 | 일회성 설치, 임시 테스트 |

> **Tip**: 팀 프로젝트에서는 `uv add`를 사용해야 `pyproject.toml`과 `uv.lock`이 업데이트되어 팀원과 환경을 공유할 수 있습니다.

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

## ⚡ uv가 빠른 이유

`uv`는 단순히 "빠르다"는 말로만 설명되지만, 그 이유는 다음 기술들의 조합입니다.

| 기술 | 설명 |
|------|------|
| **Rust 구현** | 컴파일 언어로 Python 대비 실행 속도 우월 |
| **병렬 처리** | 여러 패키지를 동시에 다운로드·설치 |
| **전역 캐시** | 한 번 다운로드한 패키지는 하드 링크로 재사용 (디스크 절약) |
| **PubGrub 알고리즘** | pip의 순차 탐색보다 효율적인 의존성 해결 알고리즘 |
| **HTTP/2 지원** | 연결 풀링으로 네트워크 요청 효율화 |

---

## 📊 pip + venv + pyenv vs uv 비교

| 항목 | 기존 방식 | uv |
|------|----------|----|
| **프로젝트 초기화** | 수동 설정 | `uv init` |
| **가상환경 생성** | `python -m venv .venv` | 자동 생성 |
| **가상환경 활성화** | 매번 수동 | `uv run` 시 자동 |
| **패키지 설치** | `pip install` | `uv add` / `uv pip install` |
| **의존성 잠금** | `pip freeze > requirements.txt` | `uv lock` (자동) |
| **Python 버전 관리** | pyenv 별도 설치 필요 | `uv python install` 통합 |
| **의존성 해결 방식** | 순차 처리 | 병렬 처리 (PubGrub) |
| **캐시 방식** | 프로젝트별 개별 저장 | 전역 캐시 + 하드 링크 |
| **속도** | 기준 (1x) | 10~100x 빠름 |

---

## 🏗️ 실전 프로젝트 예제

### 데이터 과학 프로젝트

```bash
uv init data-science-project --python 3.11
cd data-science-project
uv add pandas numpy matplotlib scikit-learn
uv add --dev jupyter notebook
uv run jupyter notebook
```

### FastAPI 웹 서버

```bash
uv init web-api --python 3.11
cd web-api
uv add fastapi uvicorn sqlalchemy pydantic
uv add --dev pytest black mypy
uv run uvicorn src.main:app --reload
```

### 머신러닝 프로젝트

```bash
uv init ml-project --python 3.11
cd ml-project
uv add torch torchvision transformers datasets
uv add --dev jupyter wandb tensorboard
uv run python src/train.py
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

---

## 📚 참고

- [uv 공식 GitHub](https://github.com/astral-sh/uv)
