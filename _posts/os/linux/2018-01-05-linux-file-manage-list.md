---
title: "[Linux] 파일 관리 -ls 파일 목록 조회"
date: 2018-01-05
categories: [OS, Linux]
tags: [linux, file, ls, list]
---

## ls 명령어

- 현재 위치 혹은 원하는 위치에 있는 모든 파일 목록을 보여준다.
- ls는 list의 약자이다.

### 사용법

```bash
ls (옵션) (경로:생략하면 현재 위치)
```

### Option

- `-l` : long의 줄임말로 파일 출력 형식을 긴 목록 형식으로 출력
- `-a` : 모든 파일 보기 (숨김파일까지)
- `-b` : c-style 알파벳 순으로 파일 및 Directory를 출력
- `-r` : 역순으로 보기
- `-R` : 하위 Directory 끝까지 보기
- `-t` : 시간순으로 보기
- `-n` : 소유자와 소유자 그룹을 UDI와 GID로 출력
- `-m` : 파일의 출력 형식이 Directory 및 파일을 쉽표로 구분
- `-i` : 각 파일의 인덱스 값을 첫 번째 열에 출력
- `-I` : 지정한 파일 및 Directory를 제외하고 출력
- `-L` : 심볼릭 링크의 정보를 출력할 때 원본 파일의 정보를 출력
- `-lrt` : 위에서 아래로 시간순으로 자세히 보기

> Linux는 대소문자를 구분하므로 `-r`이 아닌 `-R`로 써야 한다.
{: .prompt-info }

## ls 명령어 사용 예제
### 예제 1)

- 현재 Directory(pwd를 입력했을때 나온 위치)의 목록 보여준다.

```bash
ls
```

### 예제 2)

- `/home/devkuma` Directory 내용을 자세히 보여준다.

```bash
ls -l /home/devkuma
[kryoon@localhost ~]$ ls -l /home/devkuma

합계 4
drwxr-x---. 6 root    root     49  6월  6 08:06 data
-rwx------. 1 devkuma devkuma 198  6월  1 11:20 deploy
```

- 목록 내용에서 앞에 표시되는 문자열(예:`drwxr-x---`)의 의미는 아래와 같다.
  - d로 시작하는것 = Directory
  - -로 시작하는 것 = 파일
  - l로 시작하는 것 = 링크 파일(바로 가기)

### 예제 3)
- `/etc Directory`의 숨김 파일 포함해서 보여준다.

```bash
ls -a /etc
```

> (.)으로 시작되는 파일은 숨김파일이다. (예: .ssh)
{: .prompt-info }

### 예제 4)

- `/etc`의 하위 Directory 끝까지 보여준다.

```bash
ls -R /etc
```

### 예제 5)

- `/etc`의 숨김 파일 포함해서, 하위 Directory 끝까지 자세히 보여준다.

```bash
ls -alR /etc
```

> 명령어의 옵션은 조합이 가능하다. 순서는 상관없다.
{: .prompt-info }