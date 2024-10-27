---
title: "Multipass - Install Ubuntu"
date: 2024-05-19
categories: [Multipass, Ubuntu, Linux]
tags: [Multipass, Ubuntu, Linux]
---

## Multipass 설치
```bash
brew install --cask multipass
```

### 공식 홈페이지
- https://multipass.run 공식 홈페이지에서 직접 pkg를 받아 다운로드받을 수도 있다. 맥 OS 말고도 리눅스와 윈도우도 지원한다.


## Multipass 사용
### Instance 생성
- 현재 multipass를 통해 생성할 수 있는 Instance의 모든 Image 목록이 표시된다.
```bash
multipass find
```

```bash
multipass launch
```

- 사용할 버전을 명시해줄 수도 있다.
```bash
multipass launch 20.04
```

- 위와 같은 옵션 값을 통해 Instance의 스펙을 조절해줄 수 있다.
```bash
multipass launch --cpus <cpus> --disk <disk> --memory <mem> --name <name> --cloud-init cloud-init.yaml
```

```bash
-c, --cpus <cpus>
할당할 CPU의 개수
최소값 : 1, 기본값 : 1
```

```bash
-d, --disk <disk>
할당할 저장공간
기본적으로 byte 단위이며, K, M, G 접미사를 붙여서 단위를 지정할 수 있다.
```

```bash
-m, --memory <mem>
할당할 메모리
기본적으로 byte 단위이며, K, M, G 접미사를 붙여서 단위를 지정할 수 있다.
```

```bash
-n, --name <name>
Instance의 이름을 지정해준다.
```

```bash
--cloud-init <file> | <url>
Cloud 초기화 파일을 사용하여 가상 Instance를 설정한다. Cloud 초기화 파일은 yaml 형식의 설정 파일로, Instance 시작 시 다양한 초기 설정을 자동으로 수행할 수 있다.
```


### Instance 목록 조회
- list 명령어로 존재하는 Instance들을 확인할 수 있다. ls로 줄여쓸 수도 있다.
```bash
multipass list
```

### Instance Resource 변경
- local.<instance-name>을 통해서 Resource를 변경할 수 있다.
```bash
multipass stop some-instance
multipass set local.some-instance.cpus=4
multipass set local.some-instance.disk=40G
multipass set local.some-instance.memory=8G
```

> - Instance의 Disk 크기를 늘릴 때 Partition이 자동으로 확장되지 않아 새로운 사용 가능한 공간을 사용하지 못할 수 있다.
- 이는 일반적으로 Disk 크기를 늘리려고 할 때 Partition이 이미 꽉 찬 경우에 발생한다.
{: .prompt-warning }

#### 다음과 같이 파티션을 수동으로 확장해야 한다.
- some-instance Shell에 접속
```bash
$> multipass shell some-instance
ubuntu@some-instance$ sudo parted /dev/sda resizepart 1 100%
Warning: Not all of the space available to /dev/sda appears to be used, you can fix the GPT to use all of the space (an extra 4194304 blocks) or continue with the current setting?
Fix/Ignore? fix
Partition number? 1
Warning: Partition /dev/sda1 is being used. Are you sure you want to continue?
Yes/No? yes
ubuntu@some-instance$ sudo resize2fs /dev/sda1
```

### Instance Shell 접속
- shell 명령어를 통해 해당 Instance의 쉘에 접근할 수 있다.
```bash
multipass shell <instance name>
```

### Instance 명령 실행
- 어느 Instance가 특정한 명령을 수행하길 원한다면, exec 명령어를 사용하면 된다. -- 하이픈 두개 뒤에 수행할 명령어를 기입해주자.
```bash
multipass exec <instance name> -- <명령어>
```

### Instance 정지
- stop 명령어를 통해 Instance를 정지시킬 수 있다. 정지된 Instance는 State가 Stopped가 된다.
```bash
multipass stop <instance name>
```

### Instance 시작
- start 명령어를 통해 정지되어 있던(Stopped 상태) Instance를 실행시킬 수 있다.
```bash
multipass start <instance name>
```

### Instance 삭제
- delete 명령어를 통해 Instance를 삭제할 수 있다. 해당 명령어를 통해 Instance를 삭제할 경우, 완전히 없어지는 것이 아니다. ls 명령을 통해 Instance 목록을 조회할 시, State가 deleted인 상태로 남아있다.
```bash
multipass delete <instance name>
```

### Instance 복구
- recover 명령어를 통해 deleted 상태인 Instance를 복구할 수 있다. 복구된 Instance는 Stopped 상태가 된다.
```bash
multipass recover <instance name>
```

### Instance 영구 삭제
- purge 명령어를 통해 deleted 상태인 Instance를 영구 삭제한다.
```bash
multipass purge
```

```bash
multipass delete --purge <instance-name>
```

> delete와 purge를 한 번에 실행할 수 있다.
{: .prompt-tip }
