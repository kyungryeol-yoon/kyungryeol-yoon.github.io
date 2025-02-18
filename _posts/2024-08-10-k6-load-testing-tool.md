---
title: "[K6] K6 Load Testing Tool"
date: 2024-08-10
categories: [Tool, K6]
tags: [K6, Test, JavaScript, Open Source]
---

- Smoke Test, Load Test, Stress Test 등 다양한 테스트 지원
- 예를 들어, Kubernetes에 애플리케이션 Pod를 배포한다고 가정했을 때
  - Pod의 resources를 지정해줘야 하는데 어느 정도 값을 줘야 하는 지 모를 때가 있다.
  - 이때 k6 의 Load Test 를 진행하면 보다 수월하게 값을 지정할 수 있다.

> Load Test Type
- <https://grafana.com/docs/k6/latest/testing-guides/test-types/>
{: .prompt-info }

## 주요 성능 지표

- 퍼포먼스 테스트의 결과를 분석 할때, 반드시 알아야 할 주요 성능 지표가 있다.
	- Latency(지연시간)
	- Throughput(처리량)
	- Iterations(반복)

### Latency(지연시간)

- 고객이 배달 앱을 통해 식당에 음식을 주문하고 문 앞까지 도착하는 시간에 비유할 수 있다.
- 주문하는데 1분이 걸렸고, 요리하는데 10분, 배달 오는데 10분 총 21 분이 소요되었다. 이때는 21 분의 지연시간이 걸렸다고 할 수 있다.
- 인터넷에서 요청을 보내고 응답을 받기 전까지를 측정한 지표

### Throuput(처리량)

- 이번엔 한 식당에 100 명의 고객이 웨이팅하고 있다고 가정
- Throuput은 식당이 1시간 동안 100 명의 고객에게 음식을 대접할 수 있는지에 비유할 수 있다.
- 식당이 높은 Throuput을 가졌다면, 1시간 동안 100 명의 고객에게 모두 음식을 대접할 수 있을 것이고, 낮은 Throuput을 가졌다면 고객들은 더 많은 시간을 기다려야 할 것이다.

### Iterations(반복)

- "A 고객이 음식을 주문하고, 식당은 음식을 조리하고, 고객에게 음식을 제공합니다."
- "B 고객이 음식을 주문하고, 식당은 음식을 조리하고, 고객에게 음식을 제공합니다."
- "C 고객이 음식을 주문하고, 식당은 음식을 조리하고, 고객에게 음식을 제공합니다."
- 이렇듯 같은 행위를 얼마만큼 안정적으로 반복할 수 있는지를 테스트하는 지표

## k6의 Lifecycle은 크게 네가지

```js
// 1. 초기화 - init code

// 2. 전처리 - setup code
export function setup() {
	//　로그인 토큰취득 등 API실행전에 필요한 처리 구현
}

// 3. API실행(시나리오 실행) - VU code
export default function (data) {
	/// API를 실행할 시나리오를 구현
}

// 4. API 실행후 처리 - teardown code
export function teardown(data) {
	// API 실행후에 필요한 처리가 있다면 구현
}
```

1. init은 스크립트를 초기화
	- 모듈 임포트
	- 로컬 파일 시스템에서 파일 로드
	- 모든 옵션에 대한 설정 테스트
	- 함수 정의 (default에서 수행 혹은 setup, teardown에서 수행)
2. `(선택사항)` setup코드는 환경을 준비하고, 데이터를 생성
	- setup은 init 다음에 수행되며 오직 한번만 수행
3. VU코드는 default 함수에서 수행. 실제로 테스트 요청을 보내는 코드가 작성된다. 옵션에 정의한 만큼 반복 동작한다.
	- default 함수에서 실제 테스트를 수행
	- 혹은 옵션에서 특정 시나리오가 정의한 함수를 수행
	- VU코드는 테스트가 수행되는 기간동안 지속적으로 반복 수행
	- VU코드는 테스트를 위한 http코드를 생성하고, 메트릭의 생성, 테스트를 위한 모든 작업을 수행
	- job 함수를 제외하고 모든 작업이 수행되며, job은 init함수에서 수행
		- VU코드는 로컬 파일을 읽을 수 없다.
		- VU코드는 어떠한 모듈도 로드할 수 없다.
4. `(선택사항)` teardown 함수는 테스트의 환경을 정리하고, 자원을 릴리즈한다.
	- teardown은 테스트 끝날때 한번만 수행되며 VU 코드가 종료되고 난뒤 바로 수행

### setup, teardown 스킵

- `--no-setup` 옵션을 이용하여 셋업을 스킵한다.
- `--no-teardown` 옵션을 이용하여 teardown 을 스킵한다.

```bash
k6 run --no-setup --no-teardown ...
```

### setup에서 정의한 데이터를 전달

- setup에서 정의한 데이터를 default function과 teardown 으로 전달

```js
export function setup() {
  return { v: 1 };
}

export default function (data) {
  console.log(JSON.stringify(data));
}

export function teardown(data) {
  if (data.v != 1) {
    throw new Error('incorrect data: ' + JSON.stringify(data));
  }
}
```

- setup에서 데이터를 return을 하게 되면 이 return 된 객체가 전달이 되는 방식이다.
- 이후 defult, teardown에서 data를 파라미터로 전달 받을 수 있다.
	- 데이터는 오직 json 데이터만 전달가능하며, 함수는 전달불가이다.
	- 데이터가 너무 크면 더 많은 메모리가 사용된다.
	- default() 에서 데이터를 변경할 수 없다.

> Test Life Cycle
- <https://grafana.com/docs/k6/latest/using-k6/test-lifecycle/>
{: .prompt-info }

## Test Code 작성 방법

- k6는 가상 유저를 만들어 애플리케이션에 원하는 요청을 반복적으로 보내게 된다.

```js
import http from "k6/http"		// http test
import { sleep } from "k6"		// sleep 기능 사용 시 추가 (sleep(n) → 지정한 n 기간 동한 VU 실행을 일시 중지)

export let options = {
	vus: 10,          // 가상의 유저 수
	duration: '1m'    // 테스트 진행 시간
};

const BASE_URL = 'http://test.k6.io';		// 테스트 URL

export default function () {
	let getUrl = BASE_URL
	http.get(getUrl);
	sleep(1);
}
```

- 10명의 가상 유저가 10s 동안 <https://test.k6.io> 을 호출

> - K6 Web Page Test : <https://test.k6.io>
- K6 API Test : <https://test-api.k6.io>
{: .prompt-info }

> - 1명의 가상 유저가 한번만 default function을 호출하는 것이 아닌, 60초 동안 해당 함수를 계속 호출한다.
- 즉, default function을 1명씩 1번 호출해서 총 10번 호출하는 것이 아닌, 1명의 가상유저가 5~10번 정도 호출한다.
{: .prompt-info }

> - Production 환경이 아닌 Dev 또는 Staging 환경에서 진행
- 성능을 분석할 때, 절대 평균값으로 판단하지 않기
- 클라우드 환경을 이용한다면, k6를 테스트할 때 Scale Up, Out에 주의
{: .prompt-warning }

### Test Code 작성 예시

```js
import http from "k6/http";
import { sleep, check } from "k6";
import { Trend } from "k6/metrics";

const trends = {
  scenario1: new Trend("scenario1_response_time", true),
  scenario2: new Trend("scenario2_response time", true),
};

const VUS = 1;
const DURATION = "10s";

export const options = {
  scenarios: {
    scenario1: {
      executor: "constant-vus",
      exec: "scenarioFunc",
      vus: VUS,
      duration: DURATION,
      env: {
        SCENARIO_ID: "1",
      },
    },
    scenario2: {
      executor: "constant-vus",
      exec: "scenarioFunc",
      vus: VUS,
      duration: DURATION,
      env: {
        SCENARIO_ID: "2",
      },
    },
  },
};

export function setup() {
  const url = "";		// token취득
  const params = {
    headers: {
      Authorization: "Bearer XXX",
    },
  };
  const res = http.get(url, params);
  const token = JSON.parse(res.body).account.token;

  return token;
  return { data: res.json() };
}

export function teardown(data) {
  console.log("Function teardown : " + JSON.stringify(data));
}

export function scenarioFunc(token, data) {
  const scenarioUrl = "";		// 실행할 API
  const scenario = http.get(scenarioUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  __ENV.SCENARIO_ID === "1"
    ? trends.scenario1.add(scenario.timings.duration)
    : trends.scenario2.add(scenario.timings.duration);

  console.log("Function default : " + JSON.stringify(data));

  check(scenario, {
    "scenario status is 200": (res) => res.status === 200,
  });

  sleep(1);
}
```

#### Option 관련
```js
export const options = {
  scenarios: {
    scenario1: {
      executor: "constant-vus",
      exec: "scenarioFunc",
      vus: VUS,
      duration: DURATION,
      env: {
        SCENARIO_ID: "1",
      },
    },
  },
};
```

- **executor** : k6의 실행 엔진을 나타낸다.
	- 여기에서 VU(Virtual user)나 스크립트 실행 패턴을 지정할 수 있다.
	- 자세한 내용은 k6의 [executors](https://grafana.com/docs/k6/latest/using-k6/scenarios/executors/)를 참조
- **exec** : 실행하고자 하는 시나리오를 지정
- **vus** : Virtual Users API를 실행할 가상 유저. 필요한 만큼의 병렬 실행 수를 여기에 설정
- **duration** : VUS가 반복 시나리오를 실행하는 시간을 설정
- **env** : 공통으로 사용되는 변수를 설정
 
> 참고
  - <https://grafana.com/docs/k6/latest/using-k6/k6-options/reference/>
{: .prompt-info }

#### Trend 관련

```js
const trends = {
  scenario1: new Trend("scenario1_response_time", true),
  scenario2: new Trend("scenario2_response_time", true),
};
```

- Trend는 실행 결과에 포함할 User 지정 Metric
- 시나리오별 응답 시간을 통해 실행 결과에 포함시키기 위해 추가
- Trend를 추가하면 아래와 같이 실행 결과에서 볼 수 있다.

```
scenario1_response_time.......: avg=1.29s    min=1.26s    med=1.29s max=1.35s    p(90)=1.34s    p(95)=1.34s
scenario2_response_time.......: avg=1.29s    min=1.25s    med=1.29s max=1.36s    p(90)=1.32s    p(95)=1.34s
```

#### Setup 관련

```js
export function setup() {
  const url = "";
  const params = {
    headers: {
      Authorization: "Bearer XXX",
    },
  };
  const res = http.get(url, params);
  const token = JSON.parse(res.body).account.token;

  return token;
}
```

- 여기에서 토큰 취득 등 시나리오를 실행하기 전에 실행되어야할 처리를 설정하는 곳
- 로그인이 필요한 서비스를 가정하여 토큰을 취득

#### scenario 관련

```js
export function scenarioFunc(token) {
  const scenarioUrl = "";
  const scenario = http.get(scenarioUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  __ENV.SCENARIO_ID === "1"
    ? trends.scenario1.add(scenario.timings.duration)
    : trends.scenario2.add(scenario.timings.duration);

  check(scenario, {
    "scenario status is 200": (res) => res.status === 200,
  });

  sleep(1);
}
```

- 여기서 실행하고 싶은 시나리오를 작성
- 같은 API를 실행하는 시나리오가 2개이기 때문에 그에 따라 Trend를 실행 시나리오 아이디로 분리

- check메서드는 값에 대해 true/false를 반환
- 여기에서 API실행이 성공했는지 실패했는지 확인하고 결과에 기록
- 실패해도 중간에 멈추지 않고 실행하기 때문에 유연하게 대응할 수 있다.

> K6 HTTP Module
- <https://grafana.com/docs/k6/latest/javascript-api/k6-http/>
{: .prompt-info }

> K6 JavaScript API
- <https://grafana.com/docs/k6/latest/javascript-api/>
{: .prompt-info }

### Result

```
          /\      |‾‾| /‾‾/   /‾‾/
     /\  /  \     |  |/  /   /  /
    /  \/    \    |     (   /   ‾‾\
   /          \   |  |\  \ |  (‾)  |
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: scripts.js
     output: -

  scenarios: (100.00%) 2 scenario, 200 max VUs, 40s max duration (incl. graceful stop):
           * scenario1: 1 looping VUS for 10s (exec: scenarioFunc, gracefulStop: 30s)
           * scenario2: 1 looping VUS for 10s (exec: scenarioFunc, gracefulStop: 30s)


running (11.9s), 0/2 VUS, 16 complete and interrupted iterations
scenario1 ✓ [======================================] 1 VUS 10s
scenario2 ✓ [======================================] 1 VUS 10s

     ✓ scenario status is 200
	 
     ▮ setup

     checks.........................: 100.00% ✓ 2893      ✗ 0
     data_received..................: 3.5 MB  58 kB/s
     data_sent......................: 416 kB  6.9 kB/s
     http_req_blocked...............: avg=49.33ms min=1µs      med=3µs   max=3.45s    p(90)=16µs    p(95)=377.18ms
     http_req_connecting............: avg=13.09ms min=0s       med=0s    max=199.77ms p(90)=0s      p(95)=186.36ms
     http_req_duration..............: avg=2.14s   min=190.5ms  med=1.32s max=5.79s    p(90)=5.39s   p(95)=5.57s
       { expected_response:true }...: avg=2.14s   min=190.5ms  med=1.32s max=5.79s    p(90)=5.39s   p(95)=5.57s
     http_req_failed................: 0.00%   ✓ 0         ✗ 2893
     http_req_receiving.............: avg=81.97µs min=19µs     med=61µs  max=2.43ms   p(90)=141.8µs p(95)=205.4µs
     http_req_sending...............: avg=22.37µs min=5µs      med=16µs  max=687µs    p(90)=38µs    p(95)=57µs
     http_req_tls_handshaking.......: avg=36.2ms  min=0s       med=0s    max=3.2s     p(90)=0s      p(95)=190.18ms
     http_req_waiting...............: avg=2.14s   min=190.38ms med=1.32s max=5.79s    p(90)=5.39s   p(95)=5.57s
     http_reqs......................: 2893    48.176768/s
     iteration_duration.............: avg=2.19s   min=190.7ms  med=1.39s max=6.05s    p(90)=5.4s    p(95)=5.58s
     iterations.....................: 2893    48.176768/s
     scenario1) Response time.......: avg=1.29s   min=1.26s    med=1.29s max=1.36s    p(90)=1.32s   p(95)=1.34s
     scenario2) Response time.......: avg=1.29s   min=1.25s    med=1.29s max=1.36s    p(90)=1.32s   p(95)=1.34s
     vus............................: 2       min=0       max=2
     vus_max........................: 2       min=2       max=2
```

- **checks**
	- 결과 : 100.00% ✓ 2893 ✗ 0
	- 의미 : 요청이 성공한 비율(%)

- **data_received**
	- 결과 : 3.5 MB  58 kB/s
	- 의미 : 응답한 데이터 양 (Total, /s)

- **data_sent**
	- 결과 : 416 kB  6.9 kB/s
	- 의미 : 요청한 데이터 양 (Total, /s)

- **http_req_blocked**
	- 결과 : avg=49.33ms min=1µs      med=3µs   max=3.45s    p(90)=16µs    p(95)=377.18ms
	- 의미 : TCP 접속 대기시간(avg, min, med, max, p(90), p(95)

- **http_req_connecting**
	- 결과 : avg=13.09ms min=0s       med=0s    max=199.77ms p(90)=0s      p(95)=186.36ms
	- 의미 : TCP 접속에 걸린시간(avg, min, med, max, p(90), p(95)

- **http_req_duration**
	- 결과 : avg=2.14s   min=190.5ms  med=1.32s max=5.79s    p(90)=5.39s   p(95)=5.57s
	- 의미 : 요청 → 응답 까지 얼마나 걸렸는지를 나타내는 지표. http_req_sending + http_req_waiting + http_req_receiveing(avg, min, med, max, p(90), p(95)

- **{ expected_response:true }**
	- 결과 : avg=2.14s   min=190.5ms  med=1.32s max=5.79s    p(90)=5.39s   p(95)=5.57s
	- 의미 : 정상응답만 http_req_duration(avg, min, med, max, p(90), p(95) 정상응답이 없을 경우 이 항목은 표시되지 않음

- **http_req_failed**
	- 결과 : 0.00%   ✓ 0   ✗ 2893
	- 의미 : 요청이 실패한 비율(%)

- **http_req_receiving**
	- 결과 : avg=81.97µs min=19µs     med=61µs  max=2.43ms   p(90)=141.8µs p(95)=205.4µs
	- 의미 : 응답의 1바이트가 도달하고 나서 마지막 바이트를 수신할 때까지의 시간(avg, min, med, max, p(90), p(95)

- **http_req_sending**
	- 결과 : avg=22.37µs min=5µs      med=16µs  max=687µs    p(90)=38µs    p(95)=57µs
	- 의미 : 요청을 전송하는데 걸린시간(avg, min, med, max, p(90), p(95)

- **http_req_tls_handshaking**
	- 결과 : avg=36.2ms  min=0s       med=0s    max=3.2s     p(90)=0s      p(95)=190.18ms
	- 의미 : TLS 세션의 핸드쉐이크에 걸린 시간(avg, min, med, max, p(90), p(95) http에서는 0

- **http_req_waiting**
	- 결과 : avg=2.14s   min=190.38ms med=1.32s max=5.79s    p(90)=5.39s   p(95)=5.57s
	- 의미 : 요청이 전송 완료된 후 응답이 시작될 때까지의 시간(avg, min, med, max, p(90), p(95) TTFB(Time To First Byte)

- **http_reqs**
	- 결과 : 2893    48.176768/s
	- 의미 : 총 리퀘스트수 (Total, /s)

- **iteration_duration**
	- 결과 : avg=2.19s   min=190.7ms  med=1.39s max=6.05s    p(90)=5.4s    p(95)=5.58s
	- 의미 : 시나리오 1회 반복에 걸린 시간(avg, min, med, max, p(90), p(95)

- **iterations**
	- 결과 : 2893    48.176768/s
	- 의미 : 시나리오 반복 횟수(Total, /s)

- **vus**
	- 결과 : 2 min=0 max=2
	- 의미 : Virtual Users, 시나리오 실행시 유저수(병렬)

- **vus_max**
	- 결과 : 2 min=0 max=2
	- 의미 : 최대 Virtual Users, 시나리오의 최대 실행유저수(병렬)

### p(90)과 p(95)의 의미

- p는 percentile을 의미하고 뒤에 90, 95는 각각 90%, 95%를 의미
	- p(90)은 "90%의 요청이 주어진 지연보다 빠르거나 동일한 시간 안에 완료된다는 것을 의미"
	- p(95)는 "95%의 요청이 주어진 지연보다 빠르거나 동일한 시간 안에 완료된다는 것을 의미"

#### 500명의 고객들이 햄버거를 주문했다고 가정

1. 80%인 400명은 20초 안에 햄버거를 받았고, 20%인 100명은 햄버거를 받기까지 10분 이상이 걸렸다.
2. 이때 평균적으로 한 고객이 햄버거를 받기까지 약 4분이 소요
3. 대부분의 사람들이 20초 내에 햄버거를 받았음에도 불구하고 평균 시간은 4분으로 측정되기 때문에 햄버거를 받기까지의 시간이 오래 걸린다고 생각할 수 있다. 

- 이렇듯 평균은 실제로 전체 성능을 말해주기엔 함정이 있다.
- 따라서 퍼포먼스 측정을 진행 할 때는 평균을 보는 것에 주의를 주어야 하며, 평균보다는 p(90)과 p(95)가 더 중요하다.

#### 100만 건의 요청을 보냈을 때, 모든 요청은 1초 내에 이루어져야 하는데, 딱 하나의 요청만이 1분이 걸렸다고 가정

- 일반적인 관점에서는 실패로 볼 수 있지만, Service Level Objective(SLO) 관점에서 바라보면 성공. 왜냐하면 SLO에서 100%는 있을 수 없기 때문이다.
- AWS S3 서비스만 봐도 [99.999999999%의 내구성과 99.99%의 가용성을 제공](https://docs.aws.amazon.com/ko_kr/AmazonS3/latest/userguide/DataDurability.html)한다고 합니다.

### [Test 표준 측정 항목](https://grafana.com/docs/k6/latest/using-k6/metrics/reference/#standard-built-in-metrics)

| Metric Name | Type | Description |
|:-|:-|:-|
| vus | Gauge | 현재 활성화 된 사용자 유저 |
| vus_max | Gauge | 가능한 최대 가상 사용자 수(로드 레벨을 확장할 때 성능에 영향을 미치지 않도록 VU 리소스가 미리 할당됨) |
| iterations | Counter | 테스트에서 Vu가 JS 스크립트를 실행한 총 횟수 |
| iteration_duration | Trend | default/main function의 전체 반복을 한 번 완료하는데 소요된 시간 |
| dropped_iterations | Counter | k6 v0.27.0에 도입된 VU lack 또는 lack of time으로 인해 시작할 수 없는 반복 회수 |
| data_received | Counter | 데이터를 전달받은 양 |
| data_sent | Counter | 데이터를 전달한 양 |
| checks | Rate | 성공적으로 체크된 Rate |

### [HTTP 측정 항목](https://grafana.com/docs/k6/latest/using-k6/metrics/reference/#http)

| Metric Name | Type | Description |
|:-|:-|:-|
| http_reqs | Counter | 총 얼마나 많은 HTTP requests를 k6에서 생성했는지 횟수 |
| http_req_blocked | Trend | 요청을 시작하기 전에 차단된 시간(TCP connection slot 을 기다리는) 단위: float |
| http_req_connecting | Trend | 원격 호스트에 대한 TCP 연결을 설정하는데 소요된 시간. 단위: float |
| http_req_tls_handshaking | Trend | 원격 호스트와의 핸드셰이킹 TLS 세션에 소요된 시간 |
| http_req_sending | Trend | 원격 호스트에 데이터를 보내는데 소요된 시간. 단위: float |
| http_req_waiting | Trend | 원격 호스트로부터의 응답을 대기하는 데 소요된 시간 (a.k.a. “time to first byte”, or “TTFB”). 단위: float |
| http_req_receiving | Trend | 원격 호스트로부터 응답 데이터를 수신하는 데 소요된 시간. 단위: float |
| http_req_duration | Trend | 요청의 총 시간. It's equal to http_req_sending + http_req_waiting + http_req_receiving (즉, 초기 DNS 조회/연결 시간 없이 원격 서버가 요청을 처리하고 응답하는 데 소요된 시간s). 단위: float |
| http_req_failed | Rate | [setResponseCallback](https://k6.io/docs/javascript-api/k6-http/setresponsecallback/) 에 따른 요칭 실패 비율. |


> 출력 가능한 옵션
- <https://grafana.com/docs/k6/latest/results-output/real-time/>
{: .prompt-info }

> Swagger API 관련
- <https://k6.io/blog/load-testing-your-api-with-swagger-openapi-and-k6/>
{: .prompt-info }

> Postman 관련
- <https://grafana.com/blog/2020/04/19/load-testing-your-api-with-postman/>
{: .prompt-info }

> k6-learn
- <https://github.com/grafana/k6-learn>
{: .prompt-info }