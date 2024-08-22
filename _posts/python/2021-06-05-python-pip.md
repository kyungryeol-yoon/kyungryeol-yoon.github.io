---
title: "[Python] pip install Package"
date: 2021-06-05
categories: [Python, pip]
tags: [Python, pip, Package]
---

## pip의 일괄 설치 옵션 : -r requirements.txt
- 아래의 커맨드로 설정 파일 requirements.txt에 작성된 내용에 따라 패키지를 일괄 설치된다.
- 설정 파일명은 임의로 어떠한 이름으로해도 상관없지만, requirements.txt이라는 이름으로 하는 것이 일반적이다.

```shell
pip install -r requirements.txt
```

## 설정 파일 requirements.txt의 작성법
- 설정 파일 requirements.txt의 예는 아래와 같다.

```txt
###### Requirements without Version Specifiers ######`
fastapi
click
uvicorn

###### Requirements with Version Specifiers ######`
annotated-types==0.7.0
anyio==4.4.0
click==8.1.7
colorama==0.4.6
fastapi==0.112.1
h11==0.14.0
idna==3.7
pydantic==2.8.2
pydantic_core==2.20.1
sniffio==1.3.1
starlette==0.38.2
typing_extensions==4.12.2
uvicorn==0.30.6
```

- Python 코드와 동일하게 #는 커멘트 주석처리한다.
- ==나 >, >=, <, <=등으로 패키지를 지정할 수 있다.
- 버전 지정을 생략한 겅우에는 자동으로 그 패키지의 최신버전이 설치된다.
- ,(컴마)로 구분하면 2개의 조건을 AND로 지정할 수 있다.

- 아래의 예는 1.0이상이면서 2.0이하의 버전을 인스톨하도록 지정한 것이다.
```txt
package >= 1.0, <=2.0
```

## 현재 환경의 설정 파일을 출력하는 pip freeze
- pip freeze 커맨드로 현재 환경에 설치되어 있는 패키지와 버전이 pip install -r로 사용할 수 있는 설정 파일 형식을 출력해준다.

```shell
pip freeze > requirements.txt
```

- 이렇게 출력된 파일은 맨 처음에 소개 했던 pip install -r 커맨드로 파일에 기재되어 있는 패키지, 버전을 한 번에 설치해준다. 