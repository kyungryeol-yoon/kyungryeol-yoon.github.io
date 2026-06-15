---
title: "[Python] 원하는 개수만큼 자르기"
date: 2022-10-22
tags: [python, list, programming]
description: "파이썬에서 문자열·리스트를 원하는 개수만큼 균등하게 자르는 방법. 슬라이싱, zip, iter를 활용한 세 가지 청크 분할 코드를 비교합니다."
---

```python
str_eng='ABCDEFGHIJKLMNOPQRSTUVWXYZ'
length=3
result = [str_eng[i:i+length] for i in range(0, len(str_eng), length)]

# ['ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQR', 'STU', 'VWX', 'YZ']

str_eng='ABCDEFGHIJKLMNOPQRSTUVWXYZ'
length=3
result = [''.join(x) for x in zip(*[list(str_eng[z::length]) for z in range(length)])]

# ['ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQR', 'STU', 'VWX']

str_eng='ABCDEFGHIJKLMNOPQRSTUVWXYZ'
length=3
result = list(map(''.join, zip(*[iter(str_eng)]*length)))

# ['ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQR', 'STU', 'VWX']
```