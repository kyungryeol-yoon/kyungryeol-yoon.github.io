---
title: "[Python] Fast API"
date: 2021-07-15
categories: [Programming, Python]
tags: [Python, FastAPI, Programming]
---

## FastAPI란?
파이썬 3.6+ 으로 API서버를 구축하기 위한 모던하고, 빠른 웹 프레임 워크

### fastapi 설치
```bash
pip install fastapi
```

### uvicorn 설치
```bash
pip install uvicorn
```

## 간단한 실행
```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
	return { "message" : "Hello World" }
```

### fastapi + uvicorn 실행
```bash
uvicorn main:app --reload --host=0.0.0.0 --port=8000
```

| Name | Description |
|:-|:-|
| `main` | 여기서 main은 main.py의 main을 말한다 |
| `app` | main.py안에 있는 app=FastAPI() |
| `--reload` | 코드 변경 시 자동으로 저장되어 재시작 됨 |
| `--host` | 모든 접근이 가능하게 하려면 0.0.0.0을 입력한다. |
| `--port` | 접속 원하는 포트를 지정해준다. |