---
# layout: post
title: "[C++] Lvalue와 Rvalue"
date: 2016-03-20
categories: [Programming, CPP]
tags: [Left Value, Right Value, CPP, Programming]
# comments: true
---

## Lvalue (Left-value)

- Lvalue는 "Left-value"의 줄임말로, 메모리 상에 특정 주소를 가지며, 이 값은 변경이 가능하거나 수정 가능한 값이다.
- 다시 말해, Lvalue는 대입 연산자(=)의 왼쪽에 위치할 수 있는 표현식이다. Lvalue는 항상 메모리에서 특정 주소를 참조하기 때문에, 해당 값은 변수를 통해 접근할 수 있다.

### 특징

- 메모리 주소를 가지며, 해당 값을 수정할 수 있다.
- 변수나 객체와 같은 값들이 대표적인 Lvalue입니다.
- 대입 연산자의 왼쪽에 올 수 있다.
	```cpp
	int a = 10;  // 'a'는 Lvalue, 대입 연산자의 왼쪽에 있다.
	a = 20;      // 'a'는 Lvalue, 값을 변경할 수 있다.
	```

	```cpp
	int a = 10;
	a = 20;  // 'a'는 Lvalue, 대입 연산자의 왼쪽에 위치하고 값이 변경된다.
	```

### Lvalue의 종류

- **일반 변수**: int a = 5;에서 a는 Lvalue입니다.
- **배열 요소**: arr[3] 같은 배열 요소도 Lvalue입니다.
- **참조**: int& x = a;에서 x는 Lvalue입니다.

## Rvalue (Right-value)

- Rvalue는 "Right-value"의 줄임말로, 값 자체를 나타내며, 메모리 상의 특정 주소를 가지지 않는 값이다.
- 대입 연산자의 오른쪽에 위치하는 표현식이 Rvalue에 해당합니다. Rvalue는 일시적인 값으로, 일반적으로 리터럴 값이나 연산 결과로 생성된다.
- Rvalue는 변경할 수 없거나 수정할 수 없는 값이기도 한다.

### 특징

- 메모리 주소를 가지지 않으며, 보통 값만 존재한다.
- 대입 연산자의 오른쪽에 올 수 있다.
- 값이 임시적이거나 일시적이어서, 해당 값을 수정할 수 없다.
	```cpp
	int a = 10;  // 'a'는 Lvalue
	a = 20;      // '20'은 Rvalue, 대입 연산자의 오른쪽에 있다.
	```

	```cpp
	int a = 10;
	a = 20;  // '20'은 Rvalue, 대입 연산자의 오른쪽에 위치하며 변경할 수 없다.
	```

### Rvalue의 종류

- **리터럴**: 10 같은 상수 값은 Rvalue이다.
- **연산 결과**: a + b와 같은 표현식은 Rvalue이다. 이 표현식은 값을 계산하지만, 해당 값은 메모리의 특정 위치에 존재하지 않는다.
- **임시 객체**: std::vector<int>(5)와 같이 임시로 생성된 객체도 Rvalue이다

## Lvalue와 Rvalue 구분

```cpp
int a = 5;       // 'a'는 Lvalue
int b = a + 3;   // 'a + 3'은 Rvalue, 계산된 결과는 임시 객체로 존재
b = a + 5;       // 'a + 5'는 Rvalue, 'b'는 Lvalue (대입 연산자의 왼쪽)
```

## Lvalue와 Rvalue의 관계

- Lvalue를 Rvalue로 사용할 수 있는 경우
	- Lvalue는 Rvalue로 변환될 수 있다. 예를 들어, a는 Lvalue이지만 a + 1은 Rvalue이다.
	- Lvalue는 Rvalue로 "읽히기" 위해 사용될 수 있다. 예를 들어, int x = a + 1;에서 a + 1은 Rvalue이다.

- Rvalue를 Lvalue로 사용할 수 있는 경우
	- Rvalue는 직접적으로 Lvalue로 변환될 수 없지만, Rvalue를 참조할 수 있는 임시 객체 참조(rvalue reference)를 이용하여 간접적으로 Lvalue처럼 다룰 수 있다.

## C++11에서 추가된 Rvalue 참조와 Move Semantics

- C++11부터 도입된 **Rvalue 참조(T&&)**와 Move Semantics은 Rvalue 개념을 보다 발전시킨 것이다.
- Rvalue 참조는 임시 객체나 이동 가능한 객체를 이동할 수 있게 해 주며, 이를 통해 성능을 크게 개선할 수 있다.

```cpp
void func(int&& x) {
    // x는 Rvalue 참조로, x를 이동할 수 있다.
}
```

- T&&는 일반적으로 Rvalue 참조를 의미하며, 주로 임시 객체를 다룰 때 사용된다.
- Move Semantics은 자원을 복사하는 대신 자원의 소유권을 이동하는 방법을 제공한다.

## 결론

- **Lvalue**: 메모리 주소를 가지며, 수정 가능한 값(변수 등).
- **Rvalue**: 메모리 주소를 가지지 않으며, 주로 임시적인 값(리터럴, 연산 결과 등)