---
title: "[Blog] Chirpy"
date: 2025-01-15
categories: [Blog, Chirpy]
tags: [Blog, Chirpy]
---

> Linux 환경에서 작업
- WSL(Windows Subsystem for Linux)
- Docker
- Mac OS
{: .prompt-info }


> - bundle 실행 전 반드시 ruby 버전이 최소 3 버전 이상인지 확인해야 한다.
  - 이 상태에서 bundle을 통해 모듈을 설치할 경우 Chirpy에서 사용하는 모듈과 호환되지 않아 블로그 기능(다크모드, 검색, 이미지 표시, 모바일 환경 비정상 동작 등)이 정상적으로 동작하지 않는다.
- Node.js Version 20 이상 추천한다.
{: .prompt-tip }


## Ruby 설치

- 아래와 같이 설치하면 2.x version이 설치된다.

  ```bash
  sudo apt-get install ruby-full
  ```

  ```bash
  ruby -v
  ```

### Ruby 3.x Version 설치

```bash
gpg --keyserver hkp://keyserver.ubuntu.com --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
```

```bash
\curl -sSL https://get.rvm.io | bash -s stable
```

```bash
rvm install 3.4.1
```

```bash
ruby -v
```

## Node.js 설치

```bash
curl -fsSL https://deb.nodesource.com/setup_23.x -o nodesource_setup.sh
```

> node.js 모듈을 설치하지 않으면 `assets/js/dist/*.min.js` **Not Found** 에러 발생과 함께 블로그 기능이 정상적으로 동작하지 않는다.
{: .prompt-info }

## 필요 패키지 설치

```bash
gem install bundler
```

```bash
bundle install
```

## 초기화 전에 `git commit`

```bash
git add .
```

```bash
git commit -m "chore(release): prepare for version 1.2.3"
```

## Chirpy 초기화

```bash
sudo bash tools/init.sh
```

```bash
git push
```