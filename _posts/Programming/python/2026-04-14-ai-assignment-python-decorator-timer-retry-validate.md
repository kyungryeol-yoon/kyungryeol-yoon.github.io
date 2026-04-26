---
title: "[AI Assignment - Python] 🎀 데코레이터 완전 정복 — timer, retry, validate_types 직접 구현"
date: 2026-04-14
categories: [Programming, Python]
tags: [python, decorator, functools, type-hints, clean-code, oop]
pin: false
---

## 🎯 과제: 실무형 데코레이터 3개 구현

1. `@timer` — 함수 실행 시간 측정
2. `@retry(max_attempts=3)` — 실패 시 자동 재시도
3. `@validate_types` — 타입 힌트 기반 런타임 타입 검증

모든 데코레이터에 `functools.wraps`를 적용하는 것이 요구사항이었습니다.

---

## 📐 데코레이터 기본 구조

과제에 들어가기 전에 먼저 기본 구조를 정리했습니다.

```python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        # 함수 실행 전에 할 일
        result = func(*args, **kwargs)
        # 함수 실행 후에 할 일
        return result
    return wrapper

# @my_decorator는 사실 이것과 같습니다:
# say_hello = my_decorator(say_hello)
```

인자를 받는 데코레이터는 한 겹 더 감쌉니다:

```python
def repeat(n: int):           # ← 데코레이터 팩토리
    def decorator(func):      # ← 실제 데코레이터
        def wrapper(*args, **kwargs):
            ...
        return wrapper
    return decorator
```

---

## 1️⃣ @timer

### 1차 시도

```python
def timer(func):
    def running_check(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        if result == 'done':
            text = f"출력: slow_function 실행 시간: {end_time - start_time:.2f}초"
        return text
    print(running_check().__repr__())
    return running_check
```

### 지적받은 점 3가지

**`if result == 'done'` 하드코딩:** 데코레이터는 어떤 함수든 감쌀 수 있어야 합니다. `'done'`을 반환하는 함수에서만 작동하면 범용성이 없습니다.

**`text`를 반환하고 `result`를 소실:** 원래 함수의 반환값을 돌려줘야 하는데, 출력 문자열을 반환하고 있었습니다. `if`를 타지 않으면 `text`가 미정의되어 `NameError`도 발생합니다.

**데코레이터 안에서 직접 실행:** `print(running_check())` 이 줄 때문에 `@timer`가 붙는 순간 함수가 바로 실행됩니다. 데코레이터는 감싼 함수를 반환만 해야 합니다.

```python
# 실행 타이밍 이해
@timer                    # ← 이 시점에 timer(slow_function) 실행
def slow_function():      #    → wrapper를 반환만 해야 함
    ...

slow_function()           # ← 이 시점에 wrapper() 실행
```

### 2차 시도 (완성)

```python
def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        print(f"{func.__name__} 실행 시간: {elapsed:.2f}초")
        return result
    return wrapper
```

> **Tip**: 핵심 패턴 — wrapper는 `result`를 반환, 데코레이터는 `wrapper`를 반환합니다.

---

## 2️⃣ @retry

### 1차 시도

```python
def retry(max_attempts: int):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(max_attempts):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator
```

재시도 로직을 데코레이터 안이 아니라 `__main__`에 따로 작성했습니다:

```python
# __main__에서 직접 재시도 — 데코레이터의 의미가 없어짐
for i in range(max_attempts):
    try:
        check = unstable_api_call()
        if check['status'] == 'ok':
            break
    except Exception as e:
        print(f"시도 {i+1}/{max_attempts} 실패: {e}")
```

> ⚠️ 데코레이터의 가치는 호출하는 쪽이 재시도 로직을 몰라도 되게 만드는 것입니다. `try/except` + `for` 루프가 `wrapper` 안에 있어야 합니다.

### 2차 시도 — return vs raise 문제

```python
def wrapper(*args, **kwargs):
    last_exception = None
    for i in range(max_attempts):
        try:
            result = func(*args, **kwargs)
            print(f"{func.__name__} 시도 {i+1}/{max_attempts} 성공")
            return result
        except Exception as e:
            last_exception = e
            print(f"{func.__name__} 시도 {i+1}/{max_attempts} 실패: {e}")
    return last_exception   # ← 문제!
```

3번 다 실패하면:

```
result = 서버 응답 없음
type = <class 'ConnectionError'>   ← 예외 객체가 정상 반환값처럼 돌아옴
```

`return last_exception`은 예외를 정상 반환값으로 돌려보냅니다. 호출하는 쪽에서 에러가 발생했는지 알 수가 없습니다.

### 3차 시도 — 바깥 try/except 추가 (역시 실패)

```python
def wrapper(*args, **kwargs):
    last_exception = None
    try:
        for i in range(max_attempts):
            try:
                result = func(*args, **kwargs)
                return result
            except Exception as e:
                last_exception = e
                break
    except Exception as e:
        raise last_exception
```

안쪽 `except`가 이미 예외를 처리하기 때문에 바깥 `except`까지 예외가 전파되지 않았습니다. 결과적으로 `None`이 반환되었습니다.

### 4차 시도 (완성)

```python
def retry(max_attempts: int):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for i in range(max_attempts):
                try:
                    result = func(*args, **kwargs)
                    print(f"{func.__name__} 시도 {i+1}/{max_attempts} 성공")
                    return result
                except Exception as e:
                    last_exception = e
                    print(f"{func.__name__} 시도 {i+1}/{max_attempts} 실패: {e}")
            raise last_exception
        return wrapper
    return decorator
```

> **Tip**: 성공하면 `return`으로 함수가 즉시 종료됩니다. `for`문이 끝까지 다 돌았다는 것 자체가 전부 실패를 의미하므로, `for`문 바로 뒤에 `raise`만 놓으면 됩니다.

---

## 3️⃣ @validate_types

### 1차 시도 — int 하드코딩

```python
def validate_types(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        for arg in args:
            if not isinstance(arg, int):
                raise TypeError(f"인자는 정수(int)여야 합니다. 받은 타입: {type(arg)}")
        return func(*args, **kwargs)
    return wrapper
```

동작은 하지만, 모든 인자가 `int`인지만 검사합니다. `get_type_hints`와 `inspect`를 import 해놓고도 안 쓰고 있었습니다. 이러면 `greet(name: str, count: int)` 같은 함수에서 `str`을 넣어도 에러가 납니다.

### 2차 시도 — 에러 메시지 문제

```python
for param_name, value in zip(params, args):
    if not isinstance(value, hints[param_name]):
        raise TypeError(f"인자는 정수(int)여야 합니다. 받은 타입: {type(param_name)}")
```

로직은 맞았지만 에러 메시지에 두 가지 문제가 있었습니다:
- `"정수(int)"`가 하드코딩 — `str`이어야 하는 파라미터에도 "정수(int)여야 합니다"가 출력됨
- `type(param_name)` — `param_name`은 `"a"` 같은 문자열이므로 항상 `<class 'str'>`이 나옴. `type(value)`를 써야 함

### 3차 시도 (완성)

```python
def validate_types(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        hints = get_type_hints(func)
        sig = inspect.signature(func)
        params = list(sig.parameters.keys())

        for param_name, value in zip(params, args):
            if not isinstance(value, hints[param_name]):
                raise TypeError(
                    f"'{param_name}'의 타입이 {hints[param_name].__name__}여야 하지만 "
                    f"{type(value).__name__}이 전달됨"
                )
        return func(*args, **kwargs)
    return wrapper
```

---

## ✅ 실행 결과

```
=== timer ===
slow_function 실행 시간: 1.50초

=== retry ===
unstable_api_call 시도 1/3 실패: 서버 응답 없음
unstable_api_call 시도 2/3 성공

=== validate_types ===
add(1, 2)          → 3
add("1", "2")      → TypeError: 'a'의 타입이 int여야 하지만 str이 전달됨
greet(123, 3)      → TypeError: 'name'의 타입이 str여야 하지만 int이 전달됨
greet("hello", 3)  → hellohellohello
```

---

## 🔍 functools.wraps는 왜 필요한가

처음에는 `@wraps` 없이도 `func.__name__`이 잘 나와서 필요 없다고 생각했습니다. 하지만 그건 데코레이터 내부에서 `func`을 직접 참조하고 있기 때문이었습니다. 문제는 바깥에서 볼 때입니다:

```python
@timer
def slow_function():
    """느린 함수입니다"""
    ...

# @wraps 없이
print(slow_function.__name__)    # → "wrapper"     ← 원래 이름 소실
print(slow_function.__doc__)     # → None           ← docstring 소실

# @wraps 있으면
print(slow_function.__name__)    # → "slow_function"
print(slow_function.__doc__)     # → "느린 함수입니다"
```

> ⚠️ FastAPI 같은 프레임워크가 함수의 `__name__`과 `__doc__`을 읽어서 API 문서를 자동 생성하는데, `@wraps`가 없으면 모든 엔드포인트 이름이 "wrapper"로 표시됩니다.

---

## 💡 Python 타입 힌트는 런타임에 강제되지 않는다

과제 중에 "타입 힌트를 넣으면 `add("1", 2)`에서 바로 에러가 나지 않나요?"라는 의문이 생겼습니다. 답은 **아닙니다**.

```python
def add(a: int, b: int) -> int:
    return a + b

add("hello", "world")   # → "helloworld" (에러 없음!)
add(1.5, 2.3)            # → 3.8 (int 아닌데 에러 없음!)
```

Python의 타입 힌트는 그냥 "메모"입니다. 실제로 타입을 강제하려면 `mypy` 같은 정적 분석 도구를 쓰거나, 이번 과제의 `@validate_types`처럼 런타임에 직접 체크해야 합니다. FastAPI가 내부적으로 이런 런타임 검증을 해주는 대표적인 예입니다.

---

## 🤔 데코레이터가 왜 필요한가

과제를 하면서 "굳이 데코레이터가 필요한가?"라는 의문이 들었습니다. 하지만 `@retry` 없이 API 호출 3개를 만든다고 가정하면 답이 나옵니다:

```python
# 데코레이터 없이 — 재시도 로직이 매번 반복
def call_openai():
    for i in range(3):
        try: return openai.chat(...)
        except: ...

def call_anthropic():
    for i in range(3):              # ← 똑같은 코드
        try: return anthropic.messages(...)
        except: ...
```

```python
# 데코레이터로 — 비즈니스 로직만 남음
@retry(max_attempts=3)
def call_openai():
    return openai.chat(...)

@retry(max_attempts=3)
def call_anthropic():
    return anthropic.messages(...)
```

데코레이터의 가치는 **횡단 관심사의 분리**입니다. 로깅, 인증, 재시도, 캐싱, 타입 검증 같은 건 비즈니스 로직이 아닌데 여기저기서 필요합니다. 이걸 함수마다 반복하는 대신 `@` 한 줄로 붙이는 것입니다.

---

## 📝 이번 과제에서 배운 것

**데코레이터 기본 패턴:** `wrapper`는 `result`를 반환, 데코레이터는 `wrapper`를 반환합니다. 데코레이터 안에서 함수를 직접 실행하면 안 됩니다.

**인자 있는 데코레이터:** 팩토리 → 데코레이터 → wrapper의 3중 중첩 구조입니다. 키워드 인자로 호출할 때는 이름이 일치해야 하고, 위치 인자로 호출하면 상관없습니다.

**`return` vs `raise`:** 예외를 `return`하면 정상 반환값처럼 돌아갑니다. 예외는 반드시 `raise`로 발생시켜야 호출하는 쪽에서 인지할 수 있습니다.

**`@wraps`의 역할:** 원래 함수의 `__name__`, `__doc__` 등 메타데이터를 보존합니다. FastAPI 같은 프레임워크의 자동 문서 생성에 영향을 줍니다.

**타입 힌트는 메모일 뿐:** Python은 런타임에 타입을 강제하지 않습니다. `get_type_hints()`와 `inspect.signature()`로 직접 읽어와야 합니다.
