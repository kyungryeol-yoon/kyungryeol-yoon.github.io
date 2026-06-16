---
title: "[Virtual Box] Ubuntu Terminal Not Open"
date: 2022-12-01
tags: [virtual-box, ubuntu, termianl, error]
description: "VirtualBox Ubuntu에서 터미널이 열리지 않는 문제 해결법. locale 재생성과 TTY(Ctrl+Alt+F3) 접속으로 복구하는 방법을 정리합니다."
---

> 💡 Ubuntu Desktop 이라면 'Ctrl + Alt + F3' 으로 TTY Terminal 접속

```bash
sudo locale-gen --purge
```

- 재부팅 후 Termianl 실행

```
Ctrl+Alt+F1: Returns you to the graphical desktop environment log in screen
Ctrl+Alt+F2: Returns you to the graphical desktop environment
Ctrl+Alt+F3: Opens TTY 3
Ctrl+Alt+F4: Opens TTY 4
Ctrl+Alt+F5: Opens TTY 5
Ctrl+Alt+F6: Opens TTY 6
```