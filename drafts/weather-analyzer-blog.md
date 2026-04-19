# Python 다시 시작하기 — AI 엔지니어를 향한 첫 번째 과제

> 7년 만에 Python을 다시 잡았다. 예전에 ML로 미세먼지 예측도 해보고, FastAPI 프로젝트도 해봤지만, 몇 년간 Kubernetes 인프라 일만 하다 보니 문법부터 다시 헷갈리기 시작했다. AI 엔지니어로 커리어를 전환하기 위해, Claude를 스터디 파트너 삼아 체계적으로 공부를 시작했다.

## 과제: WeatherAnalyzer 클래스 구현

첫 번째 과제는 **타입 힌트**와 **컴프리헨션**을 활용한 날씨 데이터 분석 클래스 만들기.

### 입력 데이터

```python
weather_data = [
    {"city": "서울", "date": "2026-04-01", "temp": 15.2, "humidity": 45, "pm25": 32.1},
    {"city": "서울", "date": "2026-04-02", "temp": 18.5, "humidity": 52, "pm25": 28.7},
    {"city": "부산", "date": "2026-04-01", "temp": 17.8, "humidity": 61, "pm25": 22.3},
    {"city": "부산", "date": "2026-04-02", "temp": 20.1, "humidity": 58, "pm25": 19.5},
]
```

### 요구사항

1. `get_city_avg(city)` — 특정 도시의 temp, humidity, pm25 **각각의 평균**을 딕셔너리로 반환
2. `get_good_air_days(threshold)` — pm25가 threshold 이하인 날만 필터링 (컴프리헨션 사용)
3. `summary()` — 모든 도시별 평균을 `{"서울": {...}, "부산": {...}}` 형태로 반환 (딕셔너리 컴프리헨션 사용)
4. 모든 함수에 타입 힌트 적용

---

## 1차 시도: 일단 기억나는 대로 작성

```python
class WeatherAnalyzer:
    def __init__(self, list_input: list[dict[str]]):
        self._list_input = list_input

    def get_city_avg(self, city: str) -> dict[str, float]:
        results = {
            item["city"]: (item["temp"] + item["humidity"] + item["pm25"]) / 3
            for item in self._list_input if item['city'] == city
        }
        return results

    def get_good_air_days(self, threshold: float = 30.0) -> list[dict]:
        results = [item for item in self._list_input if item['pm25'] <= threshold]
        return results

    def summary(self) -> dict[str, dict[str, float]]:
        results = [{
            item["city"]: (item["temp"] + item["humidity"] + item["pm25"]) / 3
            for item in self._list_input
        }]
        return results
```

### 리뷰에서 지적받은 점

**타입 힌트 오류:** `dict[str]`은 유효하지 않다. `dict`는 key와 value 타입을 둘 다 명시해야 한다. 값이 `str`, `float`, `int` 등 여러 타입이 섞여 있으므로 `dict[str, Any]`로 써야 한다.

**get_city_avg 로직 오류:** 가장 큰 실수였다. 온도, 습도, 미세먼지를 **합산해서 3으로 나누는** 의미 없는 계산을 하고 있었다. 요구사항은 각 항목의 **도시별 평균**이었다.

```python
# 내가 한 것 (틀림)
(item["temp"] + item["humidity"] + item["pm25"]) / 3   # → 의미 없는 숫자

# 기대한 것
{"temp": 18.95, "humidity": 59.5, "pm25": 20.9}         # → 각 항목별 평균
```

**딕셔너리 키 중복 문제:** 컴프리헨션에서 같은 키("부산")가 여러 번 나오면 마지막 값만 남는다. 즉 부산 4/1 데이터가 사라진다.

**summary의 반환 타입 불일치:** 리스트로 감싸서 `list[dict]`를 반환하고 있었는데, 요구사항은 `dict[str, dict]`이었다.

---

## 2차 시도: 로직 수정 + dataclass 도전

```python
from dataclasses import dataclass, field
from typing import Any

@dataclass
class WeatherAnalyzer:
    city: str
    date: str
    temp: float
    humidity: int
    pm25: float

    def __init__(self, list_input: list[dict[str, Any]]):
        self._list_input = list_input

    def get_city_avg(self, city: str) -> dict[str, float]:
        results = {
            city: [
                {'temp': sum(data['temp'] for data in self._list_input if data['city'] == city) /
                         len([data for data in self._list_input if data['city'] == city])},
                {'humidity': sum(data['humidity'] for data in self._list_input if data['city'] == city) /
                             len([data for data in self._list_input if data['city'] == city])},
                {'pm25': sum(data['pm25'] for data in self._list_input if data['city'] == city) /
                         len([data for data in self._list_input if data['city'] == city])},
            ]
        }
        return results

    def summary(self) -> dict[str, dict[str, float]]:
        cities = set(d['city'] for d in self._list_input)
        results = {item: self.get_city_avg(item) for item in cities}
        return results
```

### 좋아진 점

- 항목별 평균을 **따로** 구하는 방향은 맞았다.
- `summary()`에서 `get_city_avg()`를 **재활용**하는 설계도 좋았다.

### 여전히 남은 문제

**@dataclass 오용:** `@dataclass`는 `__init__`을 자동 생성해주는 건데, 직접 `__init__`을 정의하면 자동생성이 무시된다. 위에 선언한 `city`, `date` 등의 필드도 실제로 사용되지 않았다.

**반환 구조:** `dict` 안에 `list` 안에 `dict` 3개라는 불필요하게 복잡한 구조가 만들어졌다.

```python
# 내 반환값 (너무 복잡)
{"부산": [{"temp": 18.95}, {"humidity": 59.5}, {"pm25": 20.9}]}

# 기대한 반환값 (심플)
{"temp": 18.95, "humidity": 59.5, "pm25": 20.9}
```

**같은 필터링이 6번 반복:** `data['city'] == city` 필터링을 temp, humidity, pm25마다 sum과 len에서 각각 반복하고 있었다. 총 6번. 먼저 한 번 필터링하고 재사용하면 된다.

---

## 3차 시도 (최종): 피드백 반영

```python
from typing import Any

class WeatherAnalyzer:
    def __init__(self, list_input: list[dict[str, Any]]):
        self._list_input = list_input

    def get_city_avg(self, city: str) -> dict[str, float]:
        city_data = [d for d in self._list_input if d['city'] == city]
        n = len(city_data)
        results = {
            'temp': sum(d['temp'] for d in city_data) / n,
            'humidity': sum(d['humidity'] for d in city_data) / n,
            'pm25': sum(d['pm25'] for d in city_data) / n,
        }
        return results

    def get_good_air_days(self, threshold: float = 30.0) -> list[dict]:
        return [item for item in self._list_input if item['pm25'] <= threshold]

    def summary(self) -> dict[str, dict[str, float]]:
        cities = set(d['city'] for d in self._list_input)
        return {city: self.get_city_avg(city) for city in cities}
```

### 실행 결과

```
get_city_avg('부산')  → {'temp': 18.95, 'humidity': 59.5, 'pm25': 20.9}
get_good_air_days(20) → [{'city': '부산', 'date': '2026-04-02', 'temp': 20.1, 'humidity': 58, 'pm25': 19.5}]
summary()             → {'부산': {'temp': 18.95, ...}, '서울': {'temp': 16.85, ...}}
```

---

## 모범답안과 비교

리뷰에서 받은 모범답안에는 몇 가지 추가 테크닉이 있었다.

### 1. 필드 반복을 상수로 제거

```python
class WeatherAnalyzer:
    FIELDS = ('temp', 'humidity', 'pm25')

    def get_city_avg(self, city: str) -> dict[str, float]:
        city_data = [d for d in self._data if d['city'] == city]
        n = len(city_data)
        return {f: round(sum(d[f] for d in city_data) / n, 2) for f in self.FIELDS}
```

`FIELDS`를 상수로 정의해두면 필드가 추가되어도 한 곳만 수정하면 된다. 딕셔너리 컴프리헨션으로 3줄이 1줄로 줄어든다.

### 2. 방어 코드

```python
if not city_data:
    raise ValueError(f"도시 '{city}'의 데이터가 없습니다")
```

존재하지 않는 도시를 넣으면 `n = 0`이 되어 `ZeroDivisionError`가 발생한다. 실무에서는 이런 엣지 케이스를 항상 고려해야 한다.

### 3. `__repr__` 구현

```python
def __repr__(self) -> str:
    return f"WeatherAnalyzer({len(self._data)}건, 도시: {sorted({d['city'] for d in self._data})})"
```

`print(analyzer)` 했을 때 객체 정보를 한눈에 볼 수 있어 디버깅에 유용하다.

---

## 이번 과제에서 배운 것

**타입 힌트:** `dict[str]`이 아니라 `dict[str, Any]`처럼 key/value 타입을 모두 명시해야 한다. 모던 Python에서 타입 힌트는 선택이 아닌 사실상 표준이다.

**컴프리헨션의 함정:** 딕셔너리 컴프리헨션에서 같은 키가 여러 번 나오면 마지막 값만 남는다. 데이터를 먼저 그룹핑하고 집계해야 한다.

**@dataclass의 용도:** `@dataclass`는 데이터를 담는 클래스에 쓰는 것이지, 로직 중심의 분석 클래스에 억지로 끼워넣을 필요가 없다.

**필터링 한 번, 재사용 여러 번:** 같은 조건의 필터링을 반복하지 말고 변수에 담아서 재사용한다. 가독성과 성능 모두 좋아진다.

**메서드 안에 print 넣지 않기:** 디버깅할 때는 편하지만, 메서드는 값을 반환하고 출력은 호출하는 쪽에서 결정하는 게 좋은 습관이다.

---

*다음 과제: 데코레이터 — 오래만에 보니 헷갈리는 바로 그 주제를 다룰 예정이다.*