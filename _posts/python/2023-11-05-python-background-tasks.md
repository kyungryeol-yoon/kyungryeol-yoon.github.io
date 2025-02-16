---
title: "[Python] Background Tasks"
date: 2023-11-05
categories: [Python, BackgroundTasks]
tags: [Python, BackgroundTasks]
---

- 서버에서 요청을 처리할 때, 작업이 오래 걸리는 요청에 대해서는 응답을 먼저 보내주고 Background에서 나머지 작업을 수행하도록 한다.
- 이러한 구조를 위해서 보통은 worker thread를 돌리거나 worker queue 등을 사용하여 다른 쓰레드 또는 프로세스를 통해 Background에서 작업을 수행하도록 한다.

- FastAPI에서는 starlette의 BackgroundTasks를 사용하여 요청에 대한 Background 작업을 실행하는 기능을 제공한다.
- BackgroundTasks에 추가된 task들은 FastAPI에서 asynchronous 하게 실행한다.
- 이를 통해서 오래 걸리는 작업은 Background Task로 등록한 후 response를 먼저 반환하도록 할 수 있다.

## 1. BackgroundTasks

- BackgroundTasks는 fastapi 모듈의 BackgroundTasks 클래스를 import하여 사용할 수 있다.
- FastAPI app에서 BackgroundTasks를 사용할 때는 path operation function에서 BackgroundTasks 타입으로 변수를 선언하여 사용할 수 있다.

- FastAPI의 path operation function에서 BackgroundTasks 타입 변수를 선언하는 이유는 fastapi에서 router를 조회하여 arguments를 파싱하는 과정에서 BackgroundTasks 객체를 주입해주기 때문인데 이는 아래에서 좀 더 자세하게 설명한다.

- BackgroundTasks를 사용하는 코드의 예제는 다음과 같다.
- 다음의 코드는 POST `/send-notification/{email}`로 요청이 왔을때, `{"message": "Notification sent in the background"}`를 response로 먼저 반환하고 실제 notification 전송은 Background에서 실행한다.

- send_notification 함수는 BackgroundTasks 타입의 background_tasks 변수를 선언하고 이 변수에 write_notification이라는 task를 추가한다.
- 이렇게 추가된 task는 reponse 전달 이후 실행된다.

```py
from fastapi import BackgroundTasks, FastAPI

app = FastAPI()

def write_notification(email: str, message=""):
  with open("log.txt", mode="w") as email_file:
    content = f"notification for {email}: {message}"
    email_file.write(content)

@app.post("/send-notification/{email}")
async def send_notification(email: str, background_tasks: BackgroundTasks):
  background_tasks.add_task(write_notification, email, message="some notification")
  return {"message": "Notification sent in the background"}
```

### task function

- BackgroundTasks에 추가되는 task function은 parameter를 입력받아 실행되는 일반적인 형태의 함수이다.
- BackgroundTasks에서 실행시에 함수의 타입을 확인하기 때문에 async와 sync 모두 가능하다.

```py
def add_task(
      self, func: typing.Callable[P, typing.Any], *args: P.args, **kwargs: P.kwargs
    ) -> None:
      task = BackgroundTask(func, *args, **kwargs)
      self.tasks.append(task)
```

- BackgroundTasks로 추가하기 위해서는 Background에서 실행할 task function과 arguments들을 add_task 함수로 입력해주면 된다.
- add_task 함수는 아래와 같이 task function 을 입력받는 func 와 task function의 arguments를 입력하는 `*args`, `**kwargs` 로 이루어져 있다.

```py
def write_notification(email: str, message=""):
  with open("log.txt", mode="w") as email_file:
    content = f"notification for {email}: {message}"
    email_file.write(content)

...
    background_tasks.add_task(write_notification, email, message="some notification")
...
```

- send_notification 의 예제에서는 위와 같이 func로 write_notification 함수를 `*args`에 email, `**kwargs`에 message="some notification"을 arguments로 입력했다.
- 이렇게 입력된 값들은 Background에서 다음과 같이 실행된다.

```py
write_notification(email, message="some notification")
```

- func로 입력된 write_notification에 email과 "some notification" 이 arguments로 입력되어 실행된다.

## 2. FastAPI와 BackgroundTasks 구조

### BackgroundTask와 BackgroundTasks

- BackgroundTasks의 클래스 구조는 다음과 같다.
- FastAPI는 starlette 프레임워크에 구현된 background 모듈을 import하여 사용한다.

- BackgroundTasks는 add_task로 추가된 task 함수와 인자들을 tasks 리스트에 저장하고 해당 객체가 호출되면 task 들을 하나씩 실행한다.
- 각 task 들은 BackgroundTask 객체로 저장되는데, BackgroundTask는 func, args, kwargs 를 저장하고 있다가 BackgroundTasks에서 task를 하나씩 await하면 그때 func 으로 저장된 함수를 arguments 들과 함께 실행한다.

- BackgroundTask는 is_async라는 변수를 통해서 func가 sync 인지 async 인지 저장해놓고 실행할 때 해당 변수의 값을 확인하여 함수 타입에 맞는 방법으로 실행한다.
- 이 때문에 task function으로는 sync와 async가 모두 가능한 것이다.

```py
class BackgroundTask:
  def __init__(
    self, func: typing.Callable[P, typing.Any], *args: P.args, **kwargs: P.kwargs
  ) -> None:
    self.func = func
    self.args = args
    self.kwargs = kwargs
    self.is_async = is_async_callable(func)

  async def __call__(self) -> None:
    if self.is_async:
      await self.func(*self.args, **self.kwargs)
    else:
      await run_in_threadpool(self.func, *self.args, **self.kwargs)


class BackgroundTasks(BackgroundTask):
  def __init__(self, tasks: typing.Optional[typing.Sequence[BackgroundTask]] = None):
    self.tasks = list(tasks) if tasks else []

  def add_task(
    self, func: typing.Callable[P, typing.Any], *args: P.args, **kwargs: P.kwargs
  ) -> None:
    task = BackgroundTask(func, *args, **kwargs)
    self.tasks.append(task)

  async def __call__(self) -> None:
    for task in self.tasks:
      await task()
```

### BackgroundTasks injection

- FastAPI 문서에 따르면 BackgroundTasks를 사용할때는 path operation function에서 사용하라고 한다.
- 그 이유는 FastAPI에서 request의 endpoint path에 맞는 handler를 찾고 request의 값들을 파싱하여 해당 handler function의 arguments로 입력하는 과정에서 BackgroundTasks 객체를 주입해주기 때문이다.

```py
...✂...
if dependant.background_tasks_param_name:
  if background_tasks is None:
    background_tasks = BackgroundTasks()
  values[dependant.background_tasks_param_name] = background_tasks
...✂...
```

- 위의 코드는 FastAPI에서 함수의 인자로 BackgroundTasks 객체를 생성하여 입력해주는 코드의 일부를 가져온 것이다.
- 이 코드에서 values가 path operation function, 즉 request handler 함수의 keyword arguments로 입력되는 dict 변수이다.

- dependant는 request handler 함수를 분석하여 해당 함수의 parameter 등에 대한 정보를 가지고 있다.
- 만약 parameter 중에 BackgroundTasks 타입으로 선언된 parameter가 있다면 해당 parameter의 이름을 background_tasks_param_name으로 가지고 있는다.

- 이러한 정보를 바탕으로 코드를 해석하면, request handler 함수의 parameter 중에 BackgroundTasks 타입으로 선언된 parameter가 있다면, BackgroundTasks 객체를 해당 함수의 인자로 추가해준다는 것으로 이해할 수 있다.

- FastAPI는 request의 path와 body 등의 값을 request handler의 parameter 형식에 맞게 파싱할 때, 재귀를 통해서 위의 로직을 반복한다.
- 그렇기 때문에 BackgroundTasks 타입을 path operation function의 parameter 또는 Depends를 사용하여 dependency, sub-dependency로 선언해도 동일하게 사용할 수 있게 된다.

## 3. BackgroundTasks와 Celery

- FastAPI 의 Background tasks 문서의 마지막 절에는 BackgroundTasks 사용에 대한 주의사항이 있다.
- 이 글에서는 보다 더 무겁고 같은 프로세스 안에서 동작해야할 필요가 없는 작업에 대해서는 Celery를 사용하는 것을 추천한다.

- FastAPI의 BackgroundTasks는 FastAPI application의 프로세스 내부에서 실행되기 때문에 무거운 작업의 경우 application이 다른 request를 처리할 때 부하가 발생하여 성능적인 문제를 야기할 수 있다.
- 반면에 Celery는 message queue로 통신하여 아예 다른 worker process에서 작업을 수행하기 때문에 성능적으로 더 안정적으로 application을 운영할 수 있다.

- 하지만 Celery는 message queu와 여러 설정들을 추가로 해주어야 하고, 다른 프로세스에서 실행되는 만큼 변수와 메모리 등을 공유할 수 없기 때문에 상황에 잘맞는 방식으로 Background 구조를 선택해야 한다.

> FastAPI Background Tasks 참고
- https://fastapi.tiangolo.com/tutorial/background-tasks/
{: .prompt-info }