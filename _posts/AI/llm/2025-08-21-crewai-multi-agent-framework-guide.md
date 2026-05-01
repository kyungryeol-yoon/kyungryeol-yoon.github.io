---
title: "[AI] 🤝 CrewAI: 멀티 에이전트 AI 협업 프레임워크 완벽 가이드"
date: 2025-08-21
categories: [Artificial-Intelligence, LLM]
tags: [crewai, llm, ai-agent, multi-agent, python, openai, langchain, ai-framework]
description: "CrewAI는 여러 AI Agent가 역할을 분담하고 협력하는 멀티 에이전트 프레임워크입니다. Agent·Task·Tool·Crew 구성요소부터 Sequential/Hierarchical 프로세스, 메모리 시스템, Python 코드 예제까지 실무 기준으로 정리했습니다."
pin: false
---

**CrewAI**는 여러 AI Agent가 인간 팀처럼 역할을 나누고 협력하여 복잡한 작업을 처리하는 멀티 에이전트 오케스트레이션 프레임워크입니다.
단일 LLM 호출로는 해결하기 어려운 리서치·작성·분석·코딩 등 다단계 작업을 Agent 팀이 분업하여 처리합니다.
이 글에서는 핵심 구성요소, 프로세스 유형, 메모리 시스템, Python 코드 예제를 실무 기준으로 정리합니다.

---

## 🤝 CrewAI란?

CrewAI는 **역할 기반 AI Agent 협업 플랫폼**입니다.
각 Agent는 특정 전문 역할(리서처, 작가, 분석가 등)을 부여받고, 독립적으로 작업을 수행하거나 다른 Agent에게 위임하면서 팀 목표를 달성합니다.

```text
사용자 입력 (목표)
        ↓
    Crew 오케스트레이터
   ┌────┴────┐
Agent A    Agent B    Agent C
(리서처)   (작가)     (검수자)
   └────┬────┘
    최종 결과물
```

| 항목 | 단일 LLM | CrewAI 멀티 에이전트 |
|------|----------|---------------------|
| 작업 복잡도 | 단순 단발성 | 다단계·복합 작업 |
| 전문화 | 범용 | 역할별 전문화 |
| 컨텍스트 | 단일 대화 | 에이전트 간 공유·누적 |
| 확장성 | 제한적 | Agent 추가로 수평 확장 |

---

## 🧱 핵심 구성요소

### Agent — 자율 작업 단위

Agent는 특정 역할과 목표를 가진 자율적 AI 소프트웨어입니다.

| 파라미터 | 설명 |
|----------|------|
| `role` | Agent의 기능/직책 정의 |
| `goal` | 개별 목표로 의사결정 방향 제시 |
| `backstory` | 배경 스토리로 역할 맥락 강화 |
| `tools` | 사용 가능한 도구 목록 |
| `llm` | 사용할 LLM (기본값: OpenAI GPT-4) |
| `verbose` | `True` 설정 시 실행 로그 출력 |
| `allow_delegation` | `True`면 다른 Agent에게 작업 위임 가능 |
| `memory` | `True`면 메모리 시스템 활성화 |
| `max_iter` | 최대 반복 횟수 (기본값: 15) |

### Task — 구체적 작업 단위

Agent가 수행할 명확한 과제를 정의합니다.

| 파라미터 | 설명 |
|----------|------|
| `description` | 작업 내용과 수행 방법 |
| `agent` | 담당 Agent 지정 |
| `expected_output` | 기대 결과물 형식 설명 |
| `tools` | 해당 Task에만 사용되는 도구 |
| `context` | 이전 Task 출력을 컨텍스트로 전달 |
| `output_file` | 결과를 파일로 저장 |

### Tool — Agent의 외부 능력

Agent가 실제 데이터를 수집하거나 외부 서비스와 상호작용하는 함수입니다.

```python
from crewai_tools import SerperDevTool, ScrapeWebsiteTool, WebsiteSearchTool

search_tool = SerperDevTool()      # Google 검색
scrape_tool = ScrapeWebsiteTool()  # 웹 페이지 스크래핑
rag_tool    = WebsiteSearchTool()  # 웹 콘텐츠 RAG 검색
```

### Process — 작업 흐름 조율 방식

| 프로세스 | 설명 |
|----------|------|
| `Process.sequential` | 작업을 순서대로 실행, 앞 결과가 다음 컨텍스트가 됨 |
| `Process.hierarchical` | 매니저 Agent가 작업을 하위 Agent에게 위임·검수 |

### Crew — 최상위 오케스트레이터

Agent와 Task를 모아서 실행 계획을 관리하는 최상위 구조입니다.

---

## 📦 설치

```bash
pip install crewai
pip install 'crewai[tools]'   # 기본 도구 모음 포함
```

환경 변수 설정 (`.env` 파일):

```bash
OPENAI_API_KEY=sk-...
SERPER_API_KEY=...             # SerperDevTool 사용 시 필요
```

---

## 🚀 빠른 시작: 블로그 글 자동 작성 에이전트

리서처 Agent가 주제를 조사하고, 에디터 Agent가 블로그 글을 작성하는 2인 팀 예제입니다.

```python
import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool, ScrapeWebsiteTool

load_dotenv()
os.environ["OPENAI_MODEL_NAME"] = "gpt-4o"

# ── Tools ────────────────────────────────────────
search_tool = SerperDevTool()
scrape_tool = ScrapeWebsiteTool()

# ── Agents ───────────────────────────────────────
researcher = Agent(
    role="시니어 리서처",
    goal="주어진 주제에 대해 웹에서 최신 정보를 수집하고 핵심 인사이트를 정리한다",
    backstory="다양한 기술 문서와 블로그를 분석하여 최고의 리서치 결과를 만드는 전문가",
    tools=[search_tool, scrape_tool],
    allow_delegation=False,
    verbose=True,
)

editor = Agent(
    role="IT 블로거 / 에디터",
    goal="리서치 결과를 바탕으로 읽기 쉽고 실용적인 블로그 글을 작성한다",
    backstory="개발자 독자를 위해 명확하고 유익한 기술 콘텐츠를 작성하는 전문 블로거",
    verbose=True,
)

# ── Tasks ────────────────────────────────────────
research_task = Task(
    description="""'{topic}'에 관한 최신 정보를 웹에서 검색하고 분석하세요.
    핵심 개념, 주요 기능, 실제 활용 사례를 정리하세요.""",
    agent=researcher,
    expected_output="주제의 핵심 내용, 주요 기능, 활용 사례를 포함한 리서치 보고서",
)

writing_task = Task(
    description="""리서치 결과를 바탕으로 '{topic}'에 대한 블로그 포스트를 작성하세요.
    도입부, 주요 3개 섹션, 실용적 예시, 결론으로 구성하세요.""",
    agent=editor,
    expected_output="마크다운 형식의 블로그 포스트 (도입부, 3개 섹션, 결론 포함)",
    context=[research_task],       # 리서치 결과를 컨텍스트로 전달
    output_file="output_blog.md",
)

# ── Crew ─────────────────────────────────────────
crew = Crew(
    agents=[researcher, editor],
    tasks=[research_task, writing_task],
    process=Process.sequential,
    verbose=True,
)

result = crew.kickoff(inputs={"topic": "CrewAI 멀티 에이전트 프레임워크"})
print(result.raw)
```

---

## ⚙️ 프로세스 유형

### Sequential (순차 처리)

작업 목록 순서대로 실행하며, 앞 Task의 출력이 다음 Task의 컨텍스트가 됩니다.
가장 단순하고 예측 가능한 흐름입니다.

```python
crew = Crew(
    agents=[researcher, editor, reviewer],
    tasks=[research_task, writing_task, review_task],
    process=Process.sequential,
)
```

```text
research_task → writing_task → review_task
    (출력)  →   (컨텍스트)  →   (컨텍스트)
```

### Hierarchical (계층 처리)

매니저 Agent가 자동 생성되어 작업을 하위 Agent에게 위임하고 결과를 검수합니다.
복잡하고 동적인 워크플로에 적합합니다.

```python
from langchain_openai import ChatOpenAI

crew = Crew(
    agents=[researcher, editor, reviewer],
    tasks=[complex_task],
    process=Process.hierarchical,
    manager_llm=ChatOpenAI(model="gpt-4o"),  # 매니저 LLM 지정
)
```

```text
Manager Agent (자동 생성)
  ├── researcher 에게 조사 위임
  ├── editor 에게 작성 위임
  └── 결과 검수 후 최종 승인
```

---

## 🧠 메모리 시스템

CrewAI v1.10+ 에서는 통합 메모리 시스템을 제공합니다.
Agent가 이전 실행 맥락을 기억하고 중복 작업을 줄일 수 있습니다.

| 메모리 유형 | 범위 | 설명 |
|------------|------|------|
| **Short-term** | 현재 Crew 실행 내 | 대화 중 컨텍스트 유지 |
| **Long-term** | 실행 간 영속 | 벡터 스토어에 저장, 재실행 시 활용 |
| **Entity** | 현재 실행 내 | 언급된 인물·조직·개념 추적 |

```python
researcher = Agent(
    role="리서처",
    goal="정보 수집",
    backstory="...",
    memory=True,           # 메모리 활성화
)

crew = Crew(
    agents=[researcher],
    tasks=[task],
    memory=True,           # Crew 레벨 메모리 활성화
)
```

---

## 🔧 커스텀 Tool 구현

`@tool` 데코레이터로 Python 함수를 Agent가 사용할 수 있는 도구로 등록합니다.

```python
from crewai.tools import tool

@tool('naver_news_search')
def search_naver_news(query: str) -> str:
    """네이버 뉴스 API에서 최신 기사 URL을 검색합니다."""
    import requests
    # 실제 API 호출 구현
    response = requests.get(
        "https://openapi.naver.com/v1/search/news.json",
        params={"query": query, "display": 5},
        headers={
            "X-Naver-Client-Id": os.getenv("NAVER_CLIENT_ID"),
            "X-Naver-Client-Secret": os.getenv("NAVER_CLIENT_SECRET"),
        }
    )
    items = response.json().get("items", [])
    return "\n".join(item["link"] for item in items)
```

> **Tip**: docstring이 Tool의 설명으로 사용됩니다. Agent가 언제 이 Tool을 써야 하는지 명확히 작성하면 호출 정확도가 높아집니다.

---

## 📋 YAML 설정 방식 (대규모 프로젝트 권장)

Agent와 Task 정의를 YAML 파일로 분리하면 코드와 설정을 분리하여 관리하기 쉽습니다.

**`config/agents.yaml`:**

```yaml
researcher:
  role: 시니어 리서처
  goal: 주어진 주제의 최신 정보를 수집하고 핵심 인사이트를 정리한다
  backstory: 다양한 기술 문서를 분석하여 최고의 리서치 결과를 만드는 전문가

editor:
  role: IT 블로거 에디터
  goal: 리서치 결과를 읽기 쉬운 블로그 글로 작성한다
  backstory: 개발자 독자를 위해 명확한 기술 콘텐츠를 작성하는 전문 블로거
```

**`config/tasks.yaml`:**

```yaml
research_task:
  description: "{topic}"에 관한 최신 정보를 수집하고 핵심 내용을 정리하세요.
  expected_output: 핵심 개념, 주요 기능, 활용 사례를 포함한 리서치 보고서
  agent: researcher

writing_task:
  description: 리서치 결과를 바탕으로 "{topic}" 블로그 포스트를 작성하세요.
  expected_output: 마크다운 블로그 포스트
  agent: editor
  context:
    - research_task
```

**`crew.py`:**

```python
from crewai import Agent, Task, Crew, Process
from crewai.project import CrewBase, agent, task, crew

@CrewBase
class BlogCrew:
    agents_config = 'config/agents.yaml'
    tasks_config  = 'config/tasks.yaml'

    @agent
    def researcher(self) -> Agent:
        return Agent(config=self.agents_config['researcher'], tools=[search_tool])

    @agent
    def editor(self) -> Agent:
        return Agent(config=self.agents_config['editor'])

    @task
    def research_task(self) -> Task:
        return Task(config=self.tasks_config['research_task'])

    @task
    def writing_task(self) -> Task:
        return Task(config=self.tasks_config['writing_task'])

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
        )
```

---

## 🏗️ 실전 예제: 뉴스 리서치 멀티 에이전트

검색 → 내용 추출 → 요약 응답을 3개 Agent가 분담하는 파이프라인입니다.

```python
from crewai import Agent, Task, Crew, Process
from crewai.tools import tool

@tool('fetch_article')
def fetch_article(url: str) -> str:
    """주어진 URL의 기사 본문을 추출합니다."""
    from newspaper import Article
    article = Article(url)
    article.download()
    article.parse()
    return article.text

# Agents
searcher = Agent(
    role="뉴스 검색 전문가",
    goal="사용자 질문에 맞는 최신 뉴스 URL을 수집한다",
    backstory="다양한 뉴스 소스에서 정확한 기사를 찾는 리서치 전문가",
    tools=[search_tool],
)

analyzer = Agent(
    role="콘텐츠 분석가",
    goal="기사 URL에서 본문을 추출하고 핵심 내용을 분석한다",
    backstory="복잡한 기사를 빠르게 파악하고 핵심을 추출하는 분석가",
    tools=[fetch_article],
)

answerman = Agent(
    role="최종 응답 작성자",
    goal="분석된 정보를 바탕으로 사용자에게 명확한 답변을 제공한다",
    backstory="복잡한 정보를 쉽고 정확하게 전달하는 커뮤니케이션 전문가",
)

# Tasks
search_task = Task(
    description="'{query}'에 관한 최신 뉴스 기사 URL 5개를 수집하세요.",
    agent=searcher,
    expected_output="관련 뉴스 기사 URL 목록 (최소 5개)",
)

analysis_task = Task(
    description="수집된 URL에서 기사 본문을 추출하고 핵심 내용을 정리하세요.",
    agent=analyzer,
    expected_output="각 기사의 핵심 내용 요약",
    context=[search_task],
)

answer_task = Task(
    description="분석 결과를 바탕으로 '{query}'에 대한 종합 답변을 작성하세요.",
    agent=answerman,
    expected_output="출처와 근거를 포함한 명확한 답변",
    context=[analysis_task],
)

# Crew 실행
crew = Crew(
    agents=[searcher, analyzer, answerman],
    tasks=[search_task, analysis_task, answer_task],
    process=Process.sequential,
)

result = crew.kickoff(inputs={"query": "2026년 AI Agent 트렌드"})
print(result.raw)
```

---

## ❓ 자주 묻는 질문

### Q. CrewAI와 LangChain의 차이는?

LangChain은 LLM 체이닝과 도구 통합을 위한 범용 라이브러리입니다.
CrewAI는 멀티 에이전트 협업 오케스트레이션에 특화되어 있으며, LangChain 위에서 동작할 수 있습니다.

### Q. OpenAI 외에 다른 LLM을 사용할 수 있나요?

네, `llm` 파라미터로 Anthropic Claude, Google Gemini, Ollama(로컬 LLM) 등을 지정할 수 있습니다.

```python
from langchain_anthropic import ChatAnthropic

agent = Agent(
    role="분석가",
    goal="...",
    backstory="...",
    llm=ChatAnthropic(model="claude-sonnet-4-6"),
)
```

### Q. Sequential과 Hierarchical 중 어떤 걸 써야 하나요?

단계별 흐름이 명확하고 예측 가능하면 **Sequential**, 작업의 복잡도가 높고 동적 위임이 필요하면 **Hierarchical**을 선택하세요.

---

## 📚 참고

- [CrewAI 공식 문서](https://docs.crewai.com/)
- [CrewAI GitHub](https://github.com/crewaiinc/crewai)
