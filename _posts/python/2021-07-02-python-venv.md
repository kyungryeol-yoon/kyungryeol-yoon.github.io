---
title: "[Python] 가상환경 venv 사용하기"
date: 2021-07-15
categories: [Python, venv]
tags: [Python, venv, Programming]
---

## 가상환경을 사용하는 이유
당연히 파이썬 패키지(라이브러리) 간 의존성 때문에 쓰는 거다.\\
특정 패키지 버전을 업데이트 할 때 다른 것들이 호환되지 않아 문제가 생기는 경우가 발생한다.\\
그리고 작업환경이 바뀌더라도, 예를 들면 PC를 교체하더라도 필요한 패키지들을 동일한 버전으로 설치해 작업할 수 있기 때문에 무조건 사용하는 게 좋다.

## 가상환경 생성
예를 들어 바탕화면에 “my_project”라는 폴더를 만들어 작업을 한다면, 그 폴더 안에서 python -m venv `가상환경이름`이라고 쳐주면 된다.

```
C:\Users\kryoon\Desktop\my_project>python -m venv [가상환경이름]
```

이러면 “my_project”라는 폴더 안에 “가상환경이름”으로 하위폴더가 하나 생성된다. 실제 작업은 프로젝트 폴더 내에서 하면 된다.

가상환경이름은 그냥 venv라고 만드는 걸 추천한다. python -m venv venv 이런 식으로. 어떤 프로젝트든 가상환경을 활성화 하고 싶을 때 venv라는 이름으로만 사용하면 되기 때문이다.

>  애초에 가상환경을 만들 때 내가 시스템 기본 파이썬을 사용하면서 설치했던 전역 패키지들을 깔고 시작하는 방법도 있다. 명령어 칠 때 뒤에 `--system-site-packages`라고 붙여주면 된다.
{: .prompt-tip }

```
C:\Users\kryoon\Desktop\my_project>python -m venv [가상환경이름] --system-site-packages
```

## 가상환경 활성화/비활성화
프로젝트 폴더 안에서 가상환경이름\Scripts\activate.bat 이라고 쳐주면 가상환경이 활성화된다.

```
C:\Users\kryoon\Desktop\my_project>가상환경이름\Scripts\activate.bat
```

만약 venv라고 가상환경이름을 만들었다면 `venv\Scripts\activate.bat`

가상환경을 비활성화 하고 싶다면 `deactivate`

## 가상환경 내에서 패키지 설치, 삭제
가상환경 내에서 패키지를 설치하려면, 가상환경을 활성화 한 상태에서 평소처럼 pip install로 패키지 설치를 하면 된다. (삭제는 pip uninstall)

```
(venv) C:\Users\kryoon\Desktop\my_project>pip install 패키지이름
```

가상환경 활성화 상태에서 `pip freeze`라고 명령어를 쳐보면 설치된 패키지 목록들을 볼 수 있다.