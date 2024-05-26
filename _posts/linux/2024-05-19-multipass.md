---
title: "Multipass - Install Ubuntu"
date: 2024-05-19
categories: [Multipass, Ubuntu, Linux]
tags: [Multipass, Ubuntu, Linux]
---

## Multipass 설치
```
brew install --cask multipass
```

### 공식 홈페이지
- https://multipass.run 공식 홈페이지에서 직접 pkg를 받아 다운로드받을 수도 있다. 맥 OS 말고도 리눅스와 윈도우도 지원한다.


## Multipass 사용
### Instance 생성
```
multipass launch
```

- 사용할 버전을 명시해줄 수도 있다.
```
multipass launch 20.04
```

- 위와 같은 옵션 값을 통해 Instance의 스펙을 조절해줄 수 있다.
```
multipass launch --cpus <cpus> --disk <disk> --memory <mem> --name <name>
```

```
-c, --cpus <cpus>
할당할 CPU의 개수
최소값 : 1, 기본값 : 1
```

```
-d, --disk <disk>
할당할 저장공간
기본적으로 byte 단위이며, K, M, G 접미사를 붙여서 단위를 지정할 수 있다.
```

```
-m, --memory <mem>
할당할 메모리
기본적으로 byte 단위이며, K, M, G 접미사를 붙여서 단위를 지정할 수 있다.
```

```
-n, --name <name>
Instance의 이름을 지정해준다.
```

### Instance 목록 조회
- list 명령어로 존재하는 Instance들을 확인할 수 있다. ls로 줄여쓸 수도 있다.
```
multipass list
```

### Instance Shell 접속
- shell 명령어를 통해 해당 Instance의 쉘에 접근할 수 있다.
```
multipass shell <instance name>
```

### Instance 명령 실행
- 어느 Instance가 특정한 명령을 수행하길 원한다면, exec 명령어를 사용하면 된다. -- 하이픈 두개 뒤에 수행할 명령어를 기입해주자.
```
multipass exec <instance name> -- <명령어>
```

### Instance 정지
- stop 명령어를 통해 Instance를 정지시킬 수 있다. 정지된 Instance는 State가 Stopped가 된다.
```
multipass stop <instance name>
```

### Instance 시작
- start 명령어를 통해 정지되어 있던(Stopped 상태) Instance를 실행시킬 수 있다.
```
multipass start <instance name>
```

### Instance 삭제
- delete 명령어를 통해 Instance를 삭제할 수 있다. 해당 명령어를 통해 Instance를 삭제할 경우, 완전히 없어지는 것이 아니다. ls 명령을 통해 Instance 목록을 조회할 시, State가 deleted인 상태로 남아있다.
```
multipass delete <instance name>
```

### Instance 복구
- recover 명령어를 통해 deleted 상태인 Instance를 복구할 수 있다. 복구된 Instance는 Stopped 상태가 된다.
```
multipass recover <instance name>
```

### Instance 영구 삭제
- purge 명령어를 통해 deleted 상태인 Instance를 영구 삭제한다.
```
multipass purge
```