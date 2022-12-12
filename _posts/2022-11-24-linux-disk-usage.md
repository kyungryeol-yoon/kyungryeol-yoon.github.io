---
title: "[Linux] Directory와 파일 용량 확인 명령어"
date: 2022-11-24
categories: [Linux, command]
tags: [Linux, disk, usage, command]
---

### du 디렉토리명
- 디렉토리와 모든 하위 디렉토리의 용량을 표시해줍니다.
- 다음과 같이 명령하면 etc 디렉토리와 그 하위 디렉토리의 사용량이 출력됩니다. `단위는 kbyte`
```terminal
du /etc
```

### du -s 디렉토리명, du -sh 디렉토리명
- 선택한 디렉토리만의 용량을 알고 싶으면 s 옵션을 붙입니다.
```terminal
du -s /etc
```
- 용량이 읽기 편한 단위로 나오게 하려면 h 옵션을 붙입니다.
```terminal
du -sh /etc
```

### du -sh 디렉토리명/*
- 예를 들어 etc 디렉토리 바로 아래 디렉토리들의 용량을 알고 싶으면 다음과 같이 합니다.
```terminal
du -sh /etc/*
```

### du -d N 디렉토리명
- d 옵션으로 몇 단계 하위 디렉토리까지 출력할지 정할 수 있습니다.
- 다음과 같이 명령하면 etc 디렉토리의 2단계 하위 디렉토리까지의 용량을 출력합니다.
```terminal
du -d 2 /etc
```

### du -a 디렉토리명
- a 옵션을 붙이면 디렉토리에 속한 파일의 용량도 같이 출력합니다.
```terminal
du -a /etc
```

### 디스크 사용량 확인
- 참고로 디스크 사용량은 df 명령어로 확인할 수 있습니다.
```terminal
df -h
```