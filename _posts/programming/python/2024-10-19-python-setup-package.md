---
title: "[Python] Python Setup Package"
date: 2024-10-19
categories: [Programming, Python]
tags: [Python, Package, Programming]
---

## Package Directory 구조 만들기

- package로 만들기 위해 Directory 구조를 만든다.
- 프로젝트는 기본적으로 아래와 같은 형태로 구성한다.

```bash
project/
├── package/
│   ├── __init__.py
│   └── module.py
├── README.md
└── setup.py
```

| Name | Description |
|:-|:-|
| project | 프로젝트 root Directory |
| package | 프로젝트의 핵심 Directory. 일반적으로 Package의 이름과 동일하게 지정한다. |
| __init__.py | Package를 모듈로 인식하게 만드는 파일. Package가 import될 때 실행된다. |
| module.py | Package에서 제공하는 기능들이 정의된 Python 모듈 파일. 여러 개의 모듈로 구성할 수도 있으며, 기능별로 파일을 나눌 수 있다. |
| README.md | 프로젝트의 설명 파일 |
| setup.py | PIP 배포를 위한 설정 파일 |

## Package 배포를 위한 의존성 설치
- 손수 만든 Python 프로젝트를 배포하기 위한 몇가지 의존성 Package가 존재한다.
- 이후 손쉽게 배포하기 위해, 먼저 의존성을 설치해 준다.

```bash
pip install setuptools
pip install wheel
pip install twine
```

## Package 설치를 위한 설정 파일 작성

- Package를 설치 가능하게 만들기 위해 setup.py 파일을 작성한다.

```py
from setuptools import setup

# README.md 파일을 불러오는 기능
with open('README.md', encoding='utf-8') as f:
  long_description = f.read()

setup(
  name='project', # 등록할 Package 이름 (PyPI에 등록되는 이름)
  version='0.0.1', # Package 버전
  description='This is my Python Package.', # Package의 짧은 설명
  long_description=long_description, # Package의 상세 설명
  long_description_content_type = 'text/markdown', # long_description의 형식
  author='author name', # Package 작성자 이름
  author_email='author email', # Package 작성자 이메일
  url='https://example.com', # 프로젝트의 공식 URL
  license='MIT', # Package의 라이선스 정보
  python_requires='>=3.7', # Package가 지원하는 Python 버전
  install_requires=[], # Package가 의존하는 외부 라이브러리 목록
  packages=['package'], # 포함할 Python Package 목록
  package_data={}, # Package에 포함할 추가 데이터 목록
  keywords=[], # Package 검색 키워드
  classifiers=[
    'Development Status :: 4 - Beta',
    'Intended Audience :: Developers',
    'Programming Language :: Python :: 3',
    'Operating System :: OS Independent',
    'License :: OSI Approved :: MIT License',
  ] # Package 분류
)
```

## Package 배포

```bash
python setup.py bdist_wheel
```

- 명령어를 실행하면 Package 파일들이 생성된다.
- 아래 명령어를 통해 PyPI로 배포
    ```py
    python -m twine upload dist/{배포할 Package 파일}
    ```

- 명령어를 실행하면 아래와 같이 API 토큰을 입력하라고 한다.
- API 토큰은 PyPI 사이트에 로그인한 후, Account settings에서 발급받을 수 있다.
    ```bash
    Uploading distributions to https://upload.pypi.org/legacy/
    Enter your API token: 
    ```

- 이후 올바른 API 토큰을 입력하면 배포가 시작되고, 패키지가 등록된다.

## Package 설치

- Package 설치하려면 Terminal을 열고 Package Directory로 이동한 후 다음 명령어를 실행한다.
    ```bash
    pip install .
    ```

- 이 명령어를 실행하면 Package가 Local 환경에 설치된다.

## Package 사용

- 설치된 Package를 다른 Python Script에서 사용할 수 있다.
    ```py
    from my_package import my_utils
    ```