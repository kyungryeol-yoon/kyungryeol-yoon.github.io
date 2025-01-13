---
title: "[Linux] tree 디렉토리 구조 조회"
date: 2018-11-11
categories: [Linux, Directory]
tags: [Linux, Directory, tree]
---

## tree란?
터미널에서 디렉토리 구조 조회를 용이하게 해준다.

ls 명령어를 사용해서 디렉토리 내부를 확인할 수 있기는 하지만, 서브 디렉토리 내부에 포함된 파일을 확인하려면 다시 cd, ls 명령어를 중복 사용해야 하는 불편함이 있다. 이럴 때 tree 명령어를 활용하면 한 눈에 디렉토리 구조를 파악할 수 있어 매우 유용하다.

## tree 설치
기본적으로 tree 명령은 설치되지 않습니다.

### RHEL / CentOS / Fedora Linux 환경에서 yum 으로 설치
```
yum install tree
```

### Debian / Mint / Ubuntu Linux 환경에서 apt-get 으로 설치
```
sudo apt-get install tree
```

### Mac OS 환경 에서 homebrew로 설치
```
brew install tree
Updating Homebrew...
==> Downloading https://homebrew.bintray.com/bottles/tree-1.7.0.yosemite.bottle.1.tar.gz
######################################################################## 100.0%
==> Pouring tree-1.7.0.yosemite.bottle.1.tar.gz
/usr/local/Cellar/tree/1.7.0: 7 files, 113.4KB
```

## tree 사용법
### 사용법
```
tree (옵션)
```

### 디렉토리 구조 조회
```
tree
.
├── build.gradle
├── gradle
│   └── wrapper
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradlew
├── gradlew.bat
├── settings.gradle
└── src
    ├── main
    │   └── java
    │       └── Library.java
    └── test
        └── java
            └── LibraryTest.java

7 directories, 8 files
```

## tree 옵션

| 옵션 | 설명 |
|:-|:-|
| -a | 숨겨진 파일 포함 모두 표시 |
| -d | 디렉토리 구조만 표시 |
| -l | 디렉토리와 같은 기호 링크를 따라 가서 표시 |
| -f | 상대 경로로 표시 |
| -i | 들여쓰기를 적용하지 않고 표시 |
| -q | 출력할 수 없는 '?' 문자까지 표시 |
| -N | 출력할 수 없는 문자까지 모두 표시 |
| -p | 퍼미션(권한) 설정까지 표시 |
| -u | 파일 권한자 또는 UID 숫자 표시 |
| -g | 각 파일의 용량(Bytes) 표시 |
| -h | 각 파일의 용량 크기를 사람이 보기 편하게 표시 |
| -D | 수정한 날짜 표시 |
| -F | 뒤에 '/', '=', '*', 또는 `|` 붙여 사용 |
| -v | 디렉토리 내 파일을 알파벳 순으로 정렬 |
| -r | 디렉토리 내 파일을 알파벳 역순으로 정렬 |
| -t | 최근 수정한 파일 순으로 정렬 |
| -x | 현재 파일 시스템만 놔둠 |
| -n | 컬러 모드 표시 Off |
| -C | 컬러 모드 표시 On |