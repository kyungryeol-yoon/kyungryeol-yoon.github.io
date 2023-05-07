---
title: "[Linux] 우분투(Ubuntu) 크롬(Chrome) 설치 및 다운로드"
date: 2020-05-11
categories: [Linux, Install]
tags: [Linux, Install, Ubuntu, Chrome]
---

## 우분투(Ubuntu)에서 크롬(Chrome) 설치 및 다운로드
### 단축키 Ctrl + Alt + T를 눌러 터미널창을 띄운 뒤 아래 명령어를 입력하여 크롬 브라우저 패키지 설치용 인증키를 받습니다.
```
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
```

### 크롬(Chrome) 웹 브라우저 패키지를 다운로드 받을 PPA를 sources.list.d에 추가합니다.
```
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list
```

### 패키지 리스트를 업데이트합니다.
```
sudo apt-get update
```

### 크롬(Chrome)을 설치합니다.
```
sudo apt-get install google-chrome-stable
```

### 크롬(Chrome) 설치를 위해 생성했던 파일을 제거합니다.
```
ls /etc/apt/sources.list.d/google*
sudo rm -rf /etc/apt/sources.list.d/google.list
```