---
title: "[Error] BusyBox initramfs 발생할 때"
date: 2024-03-05
categories: [Error, initramfs]
tags: [VirtualBox, Ubuntu, BusyBox, initramfs]
---

## VirtualBox의 Ubuntu 제대로 종료되지 않아 올바른 파티션을 찾지 못해 BusyBox 진입했다.

## 파일 시스템 복원(fsck)
- 시스템이 갑작스럽게 종료되거나 비정상적으로 종료되었을 때, 파일 시스템이 손상될 수 있다.
- fsck는 파일 시스템을 검사하여 손상된 부분을 찾아내어 손상된 파일이나 Directory를 복구하고 잘못된 포맷팅, 중복 블록, 불필요 파일 정리 등을 통해 정상 상태로 복원한다.

```
fsck [옵션] [파일 시스템 경로]
```

- clear 질문이 계속 나오는데 모두 y를 입력한다.


```
exit
```

- exit로 나온다.

### Error Example
```
BusyBox v1.xx.x(Ubuntu 1:1:xx.x-x ubuntu1) built in shell (ash)
Enter 'help' for a list of built-in commands.

(initramfs)_
```

#### 방법 1.
```
fsck -y /dev/sda1
```

```
reboot or exit
```

#### 방법 2.
- 위의 fsck -y /dev/sda1 명령어 없이 바로 exit를 해도 된다.

#### 방법 3.
- 명령어 쳤지만 부팅이 안될 때 'fsck -y /dev/sda1' 명령어를 치고 나면 재부팅이 되어야 하는데 다시 initramfs가 나올 수 있다.
- 이 때는 바로 fsck [대상경로]의 명령어로 실행시키면 된다.

```
/dev/sda3: UNEXPRECTED INCONSISTENCY; RUN fskc MANUALLY.
fsck exited with status code 4
The root filesystem on /dev/sda9 requires a manual fsck

Busybox v1.xx.x (Ubuntu 1:1.xx.x-x ubuntu1) built in shell(ash)
Enter 'help' for a list of built-in commands.

(initramfs)_
```

- 이렇게 나오면 바로 대상경로를 실행시키면 된다.
```
fsck /dev/sda3
```

> 대상경로는 사용자마다 다를 수 있으니 본인의 실행시켜야하는 대상경로를 확인해야 한다.
{: .prompt-info }

> 대상경로확인은 exit 치면 나온다.
{: .prompt-info }