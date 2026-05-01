---
title: "[macOS] 👻 Ghostty 터미널 완전 정복: 설치부터 커스터마이징까지"
date: 2026-04-25
categories: [OS, macOS]
tags: [ghostty, terminal, macos, starship, nerd-font, zshrc, homebrew, apple-silicon]
pin: false
---

Ghostty는 GPU 가속을 통해 압도적인 속도를 제공하는 최신 터미널입니다.
Apple Silicon의 성능을 100% 활용하기 위한 필수 도구로, 설치부터 커스터마이징까지 핵심만 정리했습니다.

---

## 🚀 설치 및 폰트 세팅

```bash
brew install --cask ghostty
```

> ⚠️ 반드시 아이콘이 포함된 **Nerd Font**를 사용해야 이모지 깨짐 현상을 방지할 수 있습니다.

추천 폰트는 **JetBrainsMono Nerd Font**입니다.
내장된 수백 개의 테마 목록은 아래 명령어로 확인할 수 있습니다.

```bash
ghostty +list-themes
```

---

## 🛠️ Node / npx 명령어를 찾을 수 없을 때 (PATH 해결법)

가장 빈번하게 발생하는 `command not found: node` 오류는 환경 변수 설정과 물리적 파일 연결 문제입니다.

### STEP 1: .zshrc 환경 변수 최적화

Apple Silicon 기반 맥은 Homebrew 경로가 이전과 다릅니다.
`~/.zshrc` 최상단에 아래 설정을 추가합니다.

```bash
# Homebrew 및 주요 경로를 최우선으로 설정 (중복 경로 방지)
export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:$HOME/bin:$HOME/.local/bin:/usr/local/bin:$PATH"

# Homebrew 환경변수 즉시 로드
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### STEP 2: 그래도 안 된다면? Node 재설치

경로 설정 후에도 문제가 해결되지 않는다면 설치 자체가 깨진 것입니다.
재설치가 가장 확실한 해결책입니다.

```bash
brew uninstall --ignore-dependencies node
brew install node
brew link --overwrite node
```

> **Tip**: 설정 후에는 단순히 창을 닫지 말고 `Cmd + Q`로 Ghostty를 완전히 종료한 뒤 다시 실행하세요.

---

## ⌨️ 단축키 및 설정 즉시 반영

Ghostty의 진가는 마우스 없이 모든 것을 제어하는 단축키에서 나옵니다.

| 단축키 | 기능 |
|--------|------|
| `Cmd + Shift + ,` | 설정 파일 즉시 반영 (재시작 불필요) |
| `Cmd + D` | 화면 세로 분할 |
| `Cmd + Shift + D` | 화면 가로 분할 |
| `Cmd + W` | 현재 분할 창 닫기 |
| `Cmd + Option + 방향키` | 분할 창 간 이동 |

> **Tip**: 설정 파일을 수정한 뒤 `Cmd + Shift + ,`로 즉시 반영하는 습관을 들이면 생산성이 크게 향상됩니다.

---

## 🎨 Starship 및 디테일 커스터마이징

터미널 프롬프트의 가독성을 높이기 위한 세부 설정입니다.

### Starship 개행(빈 줄) 제거

Starship은 기본적으로 명령어 사이에 여백을 둡니다.
`~/.config/starship.toml`에서 아래 옵션으로 제거할 수 있습니다.

```toml
add_newline = false # 명령어 사이 빈 줄 제거

[line_break]
disabled = true # 명령어를 한 줄로 깔끔하게 유지
```

### 분할 화면 경계선 색상

경계선을 테마 컬러와 맞추면 훨씬 세련된 환경이 구축됩니다.
`~/.config/ghostty/config`에 추가합니다.

```ini
window-divider-color = "#3d59a1" # 테마에 맞는 색상값
window-divider-width = 1
```

---

## ❓ 자주 묻는 질문 및 트러블슈팅

### Q1. Expo 실행 시 'Unable to run simctl' (Code 72) 에러

Xcode 경로 설정이 꼬인 문제입니다. 아래 명령어로 Xcode 위치를 다시 설정하세요.

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

### Q2. 기본 터미널은 되는데 Ghostty에서만 설정이 안 먹는 이유

Ghostty는 성능 최적화를 위해 일부 환경 파일을 생략하고 시작하는 경우가 있습니다.
아래 두 가지 방법을 함께 사용하면 해결됩니다.

```bash
source ~/.zshrc
```

설정 파일 수동 로드 후 `Cmd + Shift + ,`로 즉시 반영합니다.

---

## ✅ 요약

1. Ghostty 설치 후 **Nerd Font**를 반드시 적용합니다.
2. `~/.zshrc` 맨 위에 **Homebrew 경로를 최우선으로** 배치합니다.
3. 그래도 안 되면 고민하지 말고 `brew reinstall node`를 실행합니다.
4. `Cmd + Shift + ,` 단축키를 활용해 실시간으로 환경을 다듬습니다.
