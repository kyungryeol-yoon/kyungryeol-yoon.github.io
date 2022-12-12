---
title: "[Python] 원하는 개수만큼 자르기"
date: 2022-10-22
# categories: [Programming, Python]
tags: [Python, List, Programming]
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