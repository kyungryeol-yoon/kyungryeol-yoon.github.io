---
title: "[Python] 원하는 개수만큼 자르기"
date: 2022-10-22
categories: [Programming, Python]
tags: [Python, List, Programming]
---

### 원하는 개수만큼 문자열을 잘라서 리스트에 담기
```python
a = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
unit = 7
b = [a[i : i + unit] for i in range(0,len(a),unit)]

# ['ABCDEFG', 'HIJKLMN', 'OPQRSTU', 'VWXYZ']
```

```python
seq='ABCDEFGHIJKLMNOPQRSTUVWXYZ'
length=3
result = [seq[i:i+length] for i in range(0, len(seq), length)]

# ['ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQR', 'STU', 'VWX', 'YZ']

seq='ABCDEFGHIJKLMNOPQRSTUVWXYZ'
length=3
result = [''.join(x) for x in zip(*[list(seq[z::length]) for z in range(length)])]

# ['ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQR', 'STU', 'VWX']

seq='ABCDEFGHIJKLMNOPQRSTUVWXYZ'
length=3
result = list(map(''.join, zip(*[iter(seq)]*length)))

# ['ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQR', 'STU', 'VWX']
```