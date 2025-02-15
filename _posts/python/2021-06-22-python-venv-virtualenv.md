---
title: "[Python] 가상환경 venv, virtualenv"
date: 2021-06-22
categories: [Python, venv]
tags: [Python, venv, virtualenv, Programming]
---

## virtualenv와 venv의 차이?

- 기본적으로 둘 다 가상 환경을 만드는 라이브러리지만, 약간의 차이가 있다.

- **venv** : Python 3.3 버전 이후부터 기본 라이브러리로 포함되어 별도의 설치 과정이 필요없다.
- **virtualenv** : Python 2 버전부터 쓰던 라이브러리로, Python 3에서도 사용 가능하고 별도의 설치 과정 필요

- 더 정확하게 venv 모듈은 virtualenv의 경량화된 모듈로, 속도와 확장성 측면에서 virtualenv이 더 우수하다고 한다.
- 대신 venv는 기본 내장 라이브러리이기 때문에 pip install의 설치 과정이 필요없어서 간단한다.

## venv으로 가상환경 만들기

```bash
# 버전 지정 없이 설치
python -m venv [가상환경이름]

# 버전을 지정해서 설치
py -버전 -m venv [가상환경이름]
```

## virtualenv로 가상환경 만들기

- venv와 달리 pip install로 virtualenv 라이브러리 설치 과정이 필요하다.

- pip는 Python 버전마다 다르므로, Python 버전을 확인한 뒤 해당 버전에 맞는 pip로 설치를 진행해주어야 한다.
- Python을 설치하면 기본적으로 `Python버전명\lib\site-packages\` 내부에 pip폴더가 존재한다.

### virtualenv Version 지정하여 설치

- pip Version 지정 설치

  ```bash
  py -버전 -m pip install virtualenv

  py -3.7 -m pip install virtualenv
  ```

- virtualenv 가상환경 생성

  ```bash
  virtualenv 가상환경이름 --python=[Python Version]

  virtualenv myenv --python=3.7
  ```

> venv 참고
- <https://docs.python.org/3/library/venv.htm>
{: .prompt-info }