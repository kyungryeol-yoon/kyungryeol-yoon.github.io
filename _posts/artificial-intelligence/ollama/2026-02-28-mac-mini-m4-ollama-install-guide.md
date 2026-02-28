---
title: "[LLM] Mac Mini M4 환경에서 Ollama 설치 및 관리 가이드"
date: 2026-02-28
categories: [Artificial Intelligence, LLM]
tags: [ollama, mac mini, apple silicon, m4, local llm]
---

# Mac Mini M4(Apple Silicon) 환경에서 Ollama 설치 및 관리 가이드

## 📌 개요

본 가이드는 Apple Silicon 기반 Mac Mini M4 환경에서 로컬 LLM(Local Large Language Model) 도구인 Ollama를 설치하고 관리하는 방법을 설명합니다.  
Homebrew를 활용하여 설치하고, 서비스 등록부터 모델 실행, 삭제 방법까지 전체 과정을 정리합니다.

---

## 🚀 1. Homebrew 준비 및 설치

### 1.1 Homebrew 설치 확인

먼저 Homebrew가 설치되어 있는지 확인합니다.

```bash
brew --version
````

설치되어 있지 않다면 Homebrew 공식 사이트 안내에 따라 먼저 설치하세요.

---

### 1.2 Homebrew 업데이트

패키지 인덱스를 최신 상태로 유지합니다.

```bash
brew update
```

---

## 🛠 2. Ollama 설치

Homebrew를 통해 Ollama를 설치합니다.

```bash
brew install ollama
```

설치 완료 후 정상 설치 여부를 확인합니다.

```bash
ollama --version
```

---

## ⚙️ 3. Ollama 실행 방식

### 3.1 백그라운드 서비스 실행 (권장)

시스템 부팅 시 자동 실행되도록 설정:

```bash
brew services start ollama
```

서비스 상태 확인:

```bash
brew services list
```

---

### 3.2 포그라운드 실행

현재 터미널 세션에서만 실행하려면:

```bash
ollama serve
```

> 터미널 세션이 종료되면 Ollama도 함께 종료됩니다.

---

## 🤖 4. 모델 다운로드 및 실행

모델을 다운로드하고 바로 실행할 수 있습니다.

```bash
ollama run llama3.2
```

처음 실행 시 모델이 자동으로 다운로드됩니다.

설치된 모델 목록 확인:

```bash
ollama list
```

현재 실행 중인 모델 확인:

```bash
ollama ps
```

---

## 🌐 5. 외부 접속 허용 설정

기본적으로 Ollama는 `127.0.0.1:11434`에 바인딩됩니다.

외부 네트워크 접근을 허용하려면:

```bash
export OLLAMA_HOST=0.0.0.0
```

영구 적용하려면 `~/.zshrc` 또는 `~/.bashrc`에 추가합니다.

```bash
echo 'export OLLAMA_HOST=0.0.0.0' >> ~/.zshrc
source ~/.zshrc
```

---

## 🧠 6. 리소스 관리 팁 (Apple Silicon)

Apple Silicon은 Unified Memory 구조를 사용하므로,
대형 모델 실행 시 메모리 사용량을 반드시 확인하는 것이 좋습니다.

macOS에서 Activity Monitor를 통해 메모리 사용량을 모니터링하세요.

대형 모델 실행 시:

* 8GB RAM → 7B 이하 모델 권장
* 16GB RAM → 13B 모델 가능
* 32GB 이상 → 대형 모델 원활

---

## ❌ 7. Ollama 완전 삭제 (Uninstall)

### 7.1 패키지 삭제

```bash
brew uninstall ollama
```

### 7.2 데이터 디렉토리 삭제

```bash
rm -rf ~/.ollama
```

> ⚠️ 해당 명령은 모든 모델 데이터를 완전히 삭제하므로 신중하게 실행하세요.

---

## ✅ 마무리

이 가이드를 통해 Mac Mini M4 환경에서:

* Ollama 설치
* 서비스 등록
* 모델 실행
* 외부 접속 설정
* 완전 삭제

까지 전체 워크플로우를 정리했습니다.

로컬 LLM 환경을 구축하려는 Apple Silicon 사용자에게 기본 세팅 가이드로 활용할 수 있습니다.
