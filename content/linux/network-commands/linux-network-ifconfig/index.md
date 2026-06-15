---
title: "[Linux] 네트워크 - ifconfig 네트워크 정보 확인"
date: 2018-09-01
tags: [linux, network, ifconfig]
description: "리눅스 ifconfig 명령어로 네트워크 인터페이스 정보를 확인하는 방법. -a(비활성 포함), 인터페이스 up/down 활성화 옵션과 예제를 정리합니다."
---

## ifconfig 명령어

- 네트워크 인터페이스 정보 확인한다.

### 사용법

```bash
ifconfig
```

- `ifconfig -a` : 비 활성화 장치 포함하여 모두 보기
- `ifconfig` [interface] [up / down] : 지정한 장치를 활성화 혹은 비 활성화할 때 사용