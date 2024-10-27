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

## Multipass ssh 접속
- 가상 Instance에 일반적인 ssh 명령으로 쉘에 접속 시도하게 되면 permission denied로 접속이 되지 않는다.
- 이를 해결하기 위해서 다음 단계를 수행한다.
    - ssh 키 생성
    - Instance 생성시 적용될 yaml 파일 작성
    - --cloud-init 옵션을 지정하여 Instance 생성

### ssh key 생성
    - 명령을 수행하면 $HOME/.ssh 경로에 id_rsa_multipass (개인키), id_rsa_multipass.pub (공개키) 파일이 생성된다.
```bash
ssh-keygen -t rsa -b 2048 -f ~/.ssh/id_rsa_multipass
```

### cloud-init 옵션에 적용할 yaml 파일 작성
    - ssh_authorized_keys 설정 항목에 id_rsa_multipass.pub 파일의 내용을 그대로 복사하여 설정하면 Instance 생성 시 지정된 공개키가 Instance에 적용된다.
    - Instance의 $HOME/.ssh/authorized_keys 파일에 공개키가 저장된다.
```yaml
users:
  - default
  - name: ubuntu
    sudo: ALL=(ALL) NOPASSWD:ALL
    ssh_authorized_keys:
      - <id_rsa_multipass.pub 파일 내용>
```

### Instance 생성
- yaml 파일을 $HOME/multipass/cloud-init/cloud-init-ssh.yaml 경로에 저장한 경우 위와 같이 실행한다.
```bash
multipass launch focal --name some-instance --cloud-init ~/multipass/cloud-init/cloud-init-ssh.yaml
```

- ssh 접속
```bash
ssh -i $HOME/.ssh/id_rsa_multipass ubuntu@192.168.64.2
```

- -i 옵션과 함께 개인키 경로를 매번 지정하기 귀찮다면 $HOME/.ssh/config 파일에 다음과 같이 설정한다.
```
Host multipass-some-instance
	User ubuntu
	Hostname 192.168.64.2
	IdentityFile ~/.ssh/id_rsa_multipass
```

- ssh 간편하게 접속
```bash
ssh multipass-some-instance
```

## Multipass Alias
- 특정 Instance에서 명령을 실행하는 alias(별칭)을 만들어 사용할 수 있다.

### Alias 등록
```bash
multipass alias <instance-name>:<command> <alias-name>
```

### Alias 목록
```bash
multipass aliases
```

### Alias 삭제
```bash
multipass unalias <alias-name> ... <alias-name>
multipass unalias --all
```

### Alias 실행
```bash
multipass <alias-name> -- <argument>
```

> - Shell 설정파일 (.bashrc, .zshrc, ..) 에 PATH 환경 변수에 아래 경로를 등록하면 multipass prefix는 생략 가능하다.
- 각 OS 마다 경로는 다음과 같지만 환경마다 다를 수 있다.
- macOS의 경우 alias 등록 시 PATH 환경 변수에 추가할 경로가 안내된다.
{: .prompt-tip }
```bash
#MacOS m1 silicon
$HOME/Library/Application Support/multipass/bin

#Linux
$HOME/snap/multipass/common/bin

#Windows
https://multipass.run/docs/using-aliases#heading--windows 참조
```

- PATH 환경 변수에 경로가 추가되면 다음과 같이 multipass prefix 없이 사용 가능하다.
```bash
<alias-name> --help
<alias-name>
```

## Multipass Mount
- multipass mount 명령을 사용하여 Host와 Instance 간의 데이터를 공유할 수 있다.
```
# Instance 생성시 Mount
multipass launch --mount <host-path>:<instance-path>
# 이미 존재하는 Mount에 대해서 Mount 설정
multipass mount <host-path> <instance-name>:<instance-path>
```

## Multipass 복사 및 전송
### 복사 명령어
```bash
multipass copy-files [복사할 파일 path] [설정한 multipass 이름]:[복사할 path]
multipass copy-files C:\ProgramData\Multipass\data\ssh-keys\id_rsa primary:/home/ubuntu/.ssh/id_rsa
```

### 전송 명령어
```bash
multipass transfer [options] <source> [<source> ...] <destination>
```

#### Instance ➡ Host로 파일 전송
```bash
# some-instance의 /home/ubuntu/transfer_file을 Host의 $HOME/multipass_shared 경로에 전송한다.
$> multipass transfer some-instance:/home/ubuntu/transfer_file $HOME/multipass_shared

# some-instance의 /home/ubuntu/transfer_file 내용을 Host의 stdout 으로 출력한다.
$> multipass transfer some-instance:/home/ubuntu/transfer_file -
테스트용 전송 데이터
테스트용 전송 데이터
```

#### Host ➡ Instance로 파일 전송
```bash
# Host의 $HOME/multipass_shared/directory1 Directory 전체를 
# some-instance의 /home/ubuntu/directory1 으로 전송한다.
$> multipass transfer -r $HOME/multipass_shared/directory1 some-instance:/home/ubuntu/

# Host의 stdin (사용자 입력) 데이터를 some-instance의 /home/ubuntu/console_output 파일에 저장한다.
# 참고로 stdin 입력 종료는 Ctrl + D 로 종료한다.
$> multipass transfer - some-instance:/home/ubuntu/console_output
this is test message1
this is test message2
this is test message3
Ctrl + D

# some-instance의 /home/ubuntu/console_outpout 파일 확인
$> multipass exec some-instance -- cat /home/ubuntu/console_output
this is test message1
this is test message2
this is test message3
```