
## 과제: 데이터 파이프라인용 제너레이터 3개

1. `batch_generator` — 데이터를 배치 단위로 나누기
2. `file_line_reader` — 대용량 파일을 한 줄씩 읽기 (빈 줄 옵션)
3. `infinite_id_generator` — 무한 고유 ID 생성기

요구사항: 모든 함수에 타입 힌트, `Generator` 또는 `Iterator` 사용, 파일이 없으면 `FileNotFoundError` 발생, `next()`와 `for` 두 방식 모두 테스트.

---

## 제너레이터 기본 개념

제너레이터는 값을 한 번에 다 만들지 않고, 필요할 때 하나씩 만들어내는 함수다. `return` 대신 `yield`를 쓴다.

```python
# 일반 함수 — 리스트를 통째로 메모리에 올림
def get_numbers(n: int) -> list[int]:
    result = []
    for i in range(n):
        result.append(i ** 2)
    return result                    # 1억 개면 메모리 폭발

# 제너레이터 — 하나씩 생성
def gen_numbers(n: int):
    for i in range(n):
        yield i ** 2                 # 1억 개여도 메모리 1개분만 사용
```

---

## 1. batch_generator

### 1차 시도

```python
def batch_generator(data: list, batch_size: int):
    for i in range(len(data)):
        if i*batch_size >= len(data):
            return 
        yield data[i*batch_size:i*batch_size+batch_size]
```

동작은 맞지만, `range(len(data))`를 만들어놓고 대부분 버린다. 10개 데이터면 `range(10)`이지만 실제로 필요한 건 4번 루프뿐이다.

### 피드백: `range`의 step 인자 활용

`range(start, stop, step)`의 세 번째 인자로 증가폭을 줄 수 있다는 걸 까먹고 있었다.

```python
def batch_generator(data: list, batch_size: int) -> Iterator[list]:
    for i in range(0, len(data), batch_size):    # 0, 3, 6, 9
        yield data[i:i + batch_size]
```

슬라이싱이 범위를 초과해도 에러 없이 잘라주기 때문에(`data[9:12]` → `[9]`), 조건문도 `return`도 필요 없다.

---

## 2. file_line_reader — 여기서 여러 번 헤맸다

### 1차 시도 — 두 가지 문제

```python
def file_line_reader(filepath: str, skip_empty: bool = True):
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            for line in file:
                yield line.strip()
    except FileNotFoundError:
        print("파일을 찾을 수 없습니다. 경로를 확인해주세요.")
```

**① `skip_empty`를 구현하지 않음.** 파라미터는 받아놓고 전혀 사용하지 않았다. 빈 줄이 그대로 출력됐다.

**② 에러를 `print`로 덮어버림.** 요구사항은 "`FileNotFoundError`를 발생시킨다"였는데, `try/except`로 잡아서 `print`로 조용히 처리하고 있었다. 호출하는 쪽에서는 파일이 없는 건지 비어있는 건지 구분할 수 없다.

```python
# 호출자 입장에서
for line in file_line_reader("없는파일.csv"):
    process(line)
# → "파일을 찾을 수 없습니다" 출력 후 for 루프 0회 실행
# → 버그가 조용히 숨어버림
```

이 패턴이 [과제 2의 `@retry`에서 `return last_exception`으로 예외를 값처럼 돌려보낸 것](#)과 정확히 같은 문제였다. **에러는 숨기지 말고 발생시켜라. 호출자가 처리하게 둬라.**

### 2차 시도 — 에러 처리를 바꿨지만 여전히 숨김

```python
def file_line_reader(filepath: str, skip_empty: bool = True):
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as file:
            for line in file:
                if skip_empty:
                    yield line.strip()
                else:
                    yield line
    else:
        print(f"'{filepath}' 파일을 찾을 수 없습니다.")
```

`os.path.exists`로 먼저 체크하도록 바꿨지만, 결국 없을 때 `print`만 하고 조용히 끝나는 건 똑같다. 그리고 `skip_empty`의 의미를 완전히 잘못 이해했다.

| 내가 구현한 의미 | 실제 의미 |
|---|---|
| `True` → `strip()` 적용 | `True` → 빈 줄 건너뛰기 |
| `False` → `strip()` 미적용 | `False` → 빈 줄도 yield |

`strip()`은 `skip_empty`와 **무관하게 항상** 적용되어야 했다. `skip_empty`는 strip 이후 빈 문자열이면 건너뛸지 결정하는 플래그다.

### 3차 시도 (완성) — EAFP 패턴

```python
def file_line_reader(filepath: str, skip_empty: bool = True) -> Iterator[str]:
    with open(filepath, 'r', encoding='utf-8') as file:
        for line in file:
            stripped = line.strip()
            if skip_empty and not stripped:    # 빈 문자열은 falsy
                continue
            yield stripped
```

두 가지 변화:

**EAFP 패턴 적용.** `os.path.exists`로 먼저 체크하지 않고, `open()`이 알아서 `FileNotFoundError`를 던지도록 둔다. 이게 파이썬 철학인 **EAFP(Easier to Ask for Forgiveness than Permission)** 다. "되는지 확인하고 해라"보다 "일단 해보고 안 되면 예외"가 더 파이썬답다.

**`skip_empty` 올바른 구현.** `strip()`은 항상 적용하고, 빈 문자열이면 `continue`로 건너뛴다. Python에서 빈 문자열은 falsy이므로 `not stripped`로 체크할 수 있다.

---

## 3. infinite_id_generator

처음부터 잘 동작했다.

```python
def infinite_id_generator(prefix: str = "item") -> Iterator[str]:
    count = 0
    while True:
        count += 1
        yield f"{prefix}_{count:04d}"
```

`while True` + `yield`로 무한 생성. `f"{count:04d}"`는 4자리 0패딩. 제너레이터는 `next()` 호출 사이에 상태를 유지하므로 `count`가 누적된다.

---

## 실행 결과

```
=== batch_generator ===
[0, 1, 2]
[3, 4, 5]
[6, 7, 8]
[9]

=== file_line_reader(skip_empty=True) ===
'서울,15.2,45,32.1'
'부산,17.8,61,22.3'
'대구,19.3,38,41.5'
'인천,14.7,55,29.8'

=== file_line_reader(skip_empty=False) ===
'서울,15.2,45,32.1'
'부산,17.8,61,22.3'
''
'대구,19.3,38,41.5'
''
'인천,14.7,55,29.8'

=== 없는 파일 ===
FileNotFoundError: [Errno 2] No such file or directory: 'nonexistent.csv'

=== infinite_id_generator ===
user_0001
user_0002
user_0003
```

---

## 제너레이터의 타입 힌트 — `Generator` vs `Iterator`

과제 중에 헷갈렸던 지점이다. `Generator[T, None, None]`에서 `None`이 두 개 붙는 이유가 뭔가?

`Generator`의 타입 파라미터는 3개다:

```python
Generator[YieldType, SendType, ReturnType]
```

- **YieldType** — `yield`로 내보내는 값의 타입
- **SendType** — `.send()`로 제너레이터에 값을 보낼 때의 타입
- **ReturnType** — 제너레이터가 끝날 때 `return`하는 값의 타입

대부분은 YieldType만 신경쓰면 되니 나머지는 `None`으로 둔다. 더 간결한 방법은 `Iterator`를 쓰는 것이다:

```python
from collections.abc import Iterator

def batch_generator(data: list, batch_size: int) -> Iterator[list]:
    ...
```

실무 코드에서는 `Iterator[T]`가 훨씬 많이 쓰인다. `.send()`나 return 값을 쓸 일이 없다면 `Iterator`가 깔끔하다.

---

## 이번 과제에서 배운 것

**`yield`의 기본 동작:** 함수가 `yield`를 만나면 값을 내보내고 일시정지한다. 다음 호출에서 그 자리부터 재개한다.

**`range(start, stop, step)`:** 증가폭을 직접 지정할 수 있다는 걸 까먹고 있었다. `range(0, len(data), batch_size)` 같은 패턴은 파이썬 어디서든 쓰인다.

**EAFP 패턴:** `os.path.exists`로 먼저 체크(LBYL)하는 대신, 일단 `open()`을 시도하고 예외가 발생하면 처리(EAFP)하는 것이 더 파이썬답다.

**에러를 숨기지 말기:** `try/except`로 잡아서 `print`로 덮는 건 디버깅을 악몽으로 만든다. 호출자가 예외를 받아서 처리할 수 있도록 자연스럽게 발생시켜야 한다.

**`skip_empty` 같은 파라미터의 의미:** 이름만 보고 추측하지 말고 요구사항을 정확히 읽어야 한다. 과제 1의 "항목별 평균"을 "전체 평균"으로 오해한 것, 과제 2의 `result == 'done'` 하드코딩, 이번의 `skip_empty` 오해 — 모두 같은 패턴의 실수였다.

**타입 힌트 간결하게:** `Generator[T, None, None]` 대신 `Iterator[T]`를 쓰자.

---

## 반복해서 나타난 패턴

세 과제를 하면서 반복적으로 지적받은 두 가지가 있다.

**① 하드코딩:** `result == 'done'`, `result['status'] == 'ok'`, `isinstance(arg, int)`, `skip_empty` 오해 — 전부 특정 값이나 상황에 의존하는 코드를 쓰는 습관이다. 범용 함수를 만들 때는 의도적으로 추상화해야 한다.

**② 에러 숨김:** `@retry`의 `return last_exception`, `file_line_reader`의 `print` + 조용한 종료. 에러를 값으로 반환하거나 로그로 덮어버리면 호출자는 무엇이 잘못됐는지 알 수 없다.
