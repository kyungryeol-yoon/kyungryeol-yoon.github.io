---
title: "[Mac OS] Homebrew and Cask"
date: 2022-07-30
categories: [OS, MacOS]
tags: [Homebrew, Cask, MacOS]
# comments: true
---

## Homebrew와 Cask에 대한 설명

- Homebrew와 Cask는 macOS 및 Linux에서 소프트웨어를 설치하고 관리하는 데 사용되는 패키지 관리 도구이다.
- Homebrew는 주로 명령어 기반으로 소프트웨어를 설치하는 데 사용되며, Cask는 그래픽 인터페이스가 필요한 앱들을 설치하는 데 특화되어 있다.

### Homebrew

- Homebrew는 macOS에서 소프트웨어를 설치, 관리, 업데이트하는 데 널리 사용되는 패키지 관리 시스템이다.
- Linux에서도 사용할 수 있으며, 주로 **명령줄 도구**나 **Library**를 설치하는 데 사용된다.

#### 특징

- **명령줄 도구**를 설치하는 데 주로 사용된다.
  - 예: `git`, `node.js`, `python`, `htop` 등.
- macOS 시스템에 **특화된** 설치 관리 도구이다.
- **스크립트**나 명령어로 설치를 자동화할 수 있다.
- 의존성 관리가 뛰어나며, 필요한 Library나 도구를 함께 설치해준다.
- 설치된 패키지를 손쉽게 업그레이드하거나 삭제할 수 있다.

#### Homebrew 사용 예시

```bash
# Homebrew 설치 (macOS)
bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 패키지 설치
brew install wget

# 설치된 패키지 업데이트
brew update
brew upgrade

# 설치된 패키지 목록 확인
brew list

# 패키지 삭제
brew uninstall wget
```

### Homebrew Cask

- Homebrew Cask는 Homebrew의 확장 기능으로, **그래픽 사용자 인터페이스(GUI)**를 가진 애플리케이션을 설치하는 데 사용된다.
- Cask는 일반적으로 macOS 앱스토어에 있는 것과 같은 **GUI 애플리케이션**을 설치할 때 유용하다.
- 예를 들어, 브라우저나, 이미지 편집기, 텍스트 편집기와 같은 애플리케이션들이 여기에 해당한다.

- Cask를 사용하면 `.dmg`, `.pkg`, `.app` 파일을 자동으로 다운로드하고 설치해 주며, 앱의 최신 버전도 쉽게 관리할 수 있다.

#### 특징

- **GUI 애플리케이션**을 설치하는 데 사용된다.
  - 예: `Google Chrome`, `Visual Studio Code`, `Slack`, `Spotify` 등.
- `brew install` 명령어와 비슷하지만, `cask`를 명시적으로 사용해야 한다.
- 사용자가 직접 다운로드하여 설치하는 것보다 훨씬 더 빠르고 쉽게 앱을 설치할 수 있다.

#### Homebrew Cask 사용 예시

```bash
# Homebrew Cask 설치
brew install cask

# GUI 애플리케이션 설치
brew install --cask google-chrome

# 설치된 GUI 애플리케이션 목록 확인
brew list --cask

# 앱 삭제
brew uninstall --cask google-chrome
```

### Homebrew와 Cask의 차이점

- **Homebrew**는 주로 명령줄 도구, 라이브러리, 서버 프로그램 등 **CLI 도구**를 설치하는 데 사용된다.
- **Cask**는 GUI 애플리케이션을 설치하는 데 사용된다.
- 예를 들어, `Google Chrome`, `Slack`, `Visual Studio Code` 같은 애플리케이션을 설치할 때 사용된다.


## 만약 `zsh: command not found: brew` 오류가 발생한다면

```bash
brew --version
zsh: command not found: brew
```

```bash
# zshrc에 homebrew path 추가
echo 'export PATH=/opt/homebrew/bin:$PATH' >> ~/.zshrc
# zshrc 반영
source ~/.zshrc
```