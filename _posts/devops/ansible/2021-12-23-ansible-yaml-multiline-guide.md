---
title: "[Ansible] Ansible YAML에서 Multiline 처리 방법"
date: 2021-12-23
description: "Ansible Playbook 작성 시 YAML의 Multiline 스타일과 처리 방법을 정리합니다."
categories: [DevOps, Ansible]
tags: [ansible, yaml, multiline, playbook]
---

## Multiline 스타일 종류

YAML에서 멀티라인을 표현하는 가장 대표적인 두 가지 스타일은 다음과 같습니다.

- **Literal style (`|`)**
- **Folded style (`>`)**

---

## Literal style (`|`)

Literal 스타일은 **줄바꿈을 그대로 보존**합니다.  
즉 입력한 그대로 여러 줄이 결과에 포함됩니다.

예:

```yaml
my_pattern: |
  This is line one
  This is line two
  Line three
```

위와 같이 작성하면 출력 결과는 **정확히 입력한 줄바꿈까지 그대로 반영**됩니다.

이는 아래와 같은 상황에서 유용합니다.

* Shell script 삽입
* 여러 줄 리터럴 텍스트
* 정형화된 로그 메시지

---

## Folded style (`>`)

Folded 스타일은 **줄바꿈을 접어서 하나의 공간(space)로 변환**합니다.
다만 연속된 줄바꿈이나 빈 줄은 중복 줄바꿈으로 유지됩니다.

예:

```yaml
my_pattern: >
  This is line one
  This is line two
  Line three
```

위 문법은 실제 값으로는 아래처럼 해석됩니다.

```
This is line one This is line two Line three
```

즉 줄바꿈이 기본적으로 공백으로 대체됩니다.

---

## Block Chomping

YAML은 Multiline에서 **줄바꿈 처리 방식을 제어**하기 위해 Chomping indicator를 제공합니다.

| Indicator | 설명          |            |
| --------- | ----------- | ---------- |
| `         | -`          | 마지막 줄바꿈 제거 |
| `         | +`          | 모든 줄바꿈 보존  |
| `>`       | 공백으로 줄바꿈 접기 |            |

예를 들어 `|+`를 사용하면 입력한 **줄바꿈이 모두 유지**됩니다.

```yaml
my_pattern: |+
  First line
  Second line
  Third line
```

이 경우 출력은 **많은 줄바꿈까지 유지된 형태**입니다.

---

## 실무 활용 예

Ansible에서 multiline을 활용하는 대표적인 예는 다음과 같습니다.

### Shell 스크립트 삽입

```yaml
- name: Run custom script
  shell: |
    echo "Start process"
    mkdir -p /etc/example
    cp files/app.conf /etc/example/
```

이처럼 스크립트를 그대로 Playbook에 포함할 수 있습니다.

### 큰 텍스트 변수

```yaml
vars:
  banner: >
    Welcome to the server!
    Please follow the instructions below.
```

문자열 안에서 줄바꿈을 텍스트 흐름으로 처리하고 싶을 때 `>` 스타일이 적합합니다.

---

## 정리

Ansible Playbook에서 YAML Multiline은 다음과 같이 이해하면 됩니다.

* `|`: 입력 그대로 줄바꿈 유지 (Literal)
* `>`: 줄바꿈을 **공백으로 합침** (Folded)
* 추가적인 `+`, `-`를 통해 줄바꿈 유지/삭제 옵션 조정 가능

YAML 멀티라인을 잘 활용하면 Playbook을 더 읽기 좋고 유지보수하기 쉬운 코드로 작성할 수 있습니다.

---
