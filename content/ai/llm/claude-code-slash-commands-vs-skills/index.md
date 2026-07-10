---
title: "[AI] 🧩 Claude Code 커맨드 vs 스킬: 블로그 자동화에 둘 다 써본 기준"
date: 2026-07-02
tags: [claude-code, skills, slash-commands, ai, llm, automation, agent-skills, anthropic]
description: "Claude Code의 슬래시 커맨드와 Agent Skills는 왜 비슷해 보일까요? 이 블로그를 자동화한 /write·/convert(커맨드)와 blog-lint(스킬) 실제 구성으로, 커맨드가 스킬에 병합된 현재 상황과 '누가 호출을 결정하는가' 기준을 정리합니다."
---

Claude Code를 쓰다 보면 **슬래시 커맨드(`.claude/commands/`)와 스킬(`.claude/skills/`)이 점점 비슷해 보입니다.** 결론부터 말하면 착각이 아닙니다 — 공식적으로 **커맨드는 스킬에 병합됐고**, 이제 둘의 차이는 "무엇을 쓰느냐"가 아니라 **"누가 호출을 결정하느냐(나 / Claude / 둘 다)"와 "파일을 번들하느냐"**로 좁혀졌습니다. 이 글은 실제로 이 블로그를 자동화하며 커맨드 2개(`/write`·`/convert`)와 스킬 1개(`blog-lint`)를 함께 굴려본 경험으로, 그 경계를 정리합니다.

> ❗ **2026-07 기준**입니다. Claude Code는 기능 변화가 빠르고, 공식 문서도 슬래시 커맨드 페이지를 "Extend Claude with skills"로 재편하는 중이라 세부 필드·동작은 버전에 따라 달라질 수 있습니다. 최신 사양은 하단 📚 참고의 공식 문서로 확인하세요.

---

## 🧪 이 블로그는 커맨드·스킬을 둘 다 쓴다

먼저 실제 구성부터 봅니다. 이 블로그(Hugo 자작 테마)의 `.claude/` 아래는 이렇게 나뉘어 있습니다.

```text
.claude/
├── commands/
│   ├── write.md         # /write  — 참고 URL들을 종합해 새 글 작성
│   └── convert.md       # /convert — drafts의 기존 md를 규칙에 맞게 변환
└── skills/
    └── blog-lint/
        ├── SKILL.md      # 글 품질 점검 규칙·트리거
        └── scripts/
            └── scan.py   # 실제 lint 로직(결정적 실행)
```

- **`/write`·`/convert`는 커맨드**입니다. "이 draft를 지금 변환해"처럼 **내가 의도적으로 트리거**하는 작업 워크플로라, 프롬프트 한 장이면 충분합니다.
- **`blog-lint`는 스킬**입니다. `scan.py`라는 **결정적 코드를 번들**해야 하고, "글 점검해줘" 같은 애매한 요청에도 Claude가 **알아서 발동**할 여지를 주고 싶었기 때문입니다.

이 나눔이 사실 커맨드와 스킬의 차이를 거의 그대로 보여줍니다. 왜 이렇게 갈렸는지는 아래에서 하나씩 풀어봅니다.

---

## 📌 먼저 결론: 커맨드는 스킬에 "흡수"됐다

가장 중요한 사실부터. Claude Code 공식 문서는 이제 이렇게 못 박습니다 — **"Custom commands have been merged into skills."** 즉 `.claude/commands/deploy.md`와 `.claude/skills/deploy/SKILL.md`는 **둘 다 `/deploy`를 만들고 똑같이 동작**합니다.

정리하면:

- **기존 `.claude/commands/` 파일은 그대로 계속 동작**합니다. 마이그레이션을 강제하지 않습니다.
- 스킬은 여기에 **선택적 기능을 더한 상위집합**입니다 — ① 지원 파일을 담는 **폴더 구조**, ② **누가 호출할지 제어**하는 프론트매터, ③ Claude가 **관련 상황에서 자동 로드**하는 능력.
- 게다가 스킬은 [Agent Skills](https://agentskills.io)라는 **오픈 표준**을 따라 Claude Code뿐 아니라 여러 도구에서 재사용됩니다.

> 💡 그래서 멘탈 모델을 이렇게 잡으면 편합니다. **"커맨드 = 폴더도 자동 발동도 없는, 가장 단순한 형태의 스킬."** 질문을 "커맨드냐 스킬이냐"가 아니라 **"이 워크플로를 어떻게 호출·구성할까"**로 바꾸면 헷갈릴 일이 없습니다.

---

## 🤔 그래도 뭐가 다른가

병합됐다고 해서 완전히 같은 건 아닙니다. 실무에서 갈리는 지점을 표로 정리하면 이렇습니다.

| 기준 | 커맨드 (`.claude/commands/*.md`) | 스킬 (`.claude/skills/<name>/SKILL.md`) |
|---|---|---|
| **호출 주체** | 사람만, `/이름`으로 **명시 호출** | 사람(`/이름`) + **Claude 자율 발동** 둘 다(기본값) |
| **구조** | 마크다운 **파일 1개** | **폴더** — SKILL.md + 스크립트·참고문서·예시 번들 |
| **로딩 방식** | 호출 시 프롬프트에 주입 | **점진적 공개** — 평소엔 `description`만, 발동 시 본문, 참고파일은 필요할 때만 |
| **결정성** | 순수 프롬프트(LLM이 매번 해석) | 번들 스크립트로 **결정적 실행** 가능(예: `scan.py`) |
| **이식성** | Claude Code 중심 | **Agent Skills 표준** — 여러 Claude 표면·도구에서 공유 |

각 행의 결론을 한 줄로 요약하면: **커맨드는 "내가 부르는 프롬프트 조각", 스킬은 "Claude도 부를 수 있고 코드·문서까지 품는 패키지"**입니다.

> 💡 점진적 공개가 스킬의 진짜 강점입니다. 스킬 본문은 **쓰일 때만 로드**되므로, 긴 참고 자료를 붙여둬도 실제로 발동하기 전까지는 컨텍스트 비용이 거의 0입니다. CLAUDE.md에 절차가 계속 불어난다면 그 부분을 스킬로 떼어내는 게 유리한 이유입니다.

---

## 🎛️ 진짜 축은 "누가 호출하나"

병합 이후 **설계 판단의 핵심 축은 호출 주체**입니다. 스킬은 프론트매터 두 필드로 이걸 정확히 제어합니다.

- **기본값** — 나도 `/이름`으로 부르고, Claude도 관련 상황에서 자동 발동.
- **`disable-model-invocation: true`** — **나만** 호출 가능. Claude가 멋대로 못 켭니다. `/commit`·`/deploy`처럼 **부수효과가 있거나 타이밍을 내가 통제해야 하는** 작업에 씁니다.
- **`user-invocable: false`** — **Claude만** 발동. `/` 메뉴에서 숨겨집니다. "커맨드로 부를 의미는 없지만 Claude는 알아야 할 배경지식"에 씁니다.

| 프론트매터 | 내가 호출 | Claude가 호출 | 컨텍스트 로드 |
|---|---|---|---|
| (기본) | ✅ | ✅ | description 상주, 발동 시 본문 |
| `disable-model-invocation: true` | ✅ | ❌ | description도 미상주, 내가 부를 때만 |
| `user-invocable: false` | ❌ | ✅ | description 상주, 발동 시 본문 |

> 💡 이 프레임으로 보면, **기존 커맨드는 사실상 "`disable-model-invocation`에 가까운 스킬"**입니다 — 내가 명시적으로만 트리거하니까요. 이 블로그의 `/convert`가 딱 그렇습니다. "변환해"라고 내가 부를 때만 돌면 되지, Claude가 알아서 draft를 변환하기 시작하면 곤란하죠.

---

## 🛠️ 실제 파일로 보는 차이

### 커맨드: 프롬프트 한 장 + `$ARGUMENTS`

`/write`의 `write.md`는 프론트매터 없이 **프롬프트 본문**만 있고, 인자를 `$ARGUMENTS`로 받습니다(발췌·일반화).

```markdown
# 블로그 작성 (모드 B)

여러 참고 블로그를 종합해 새 Hugo 포스트를 작성합니다.

## 작업 순서
1. `drafts/$ARGUMENTS/` 폴더에서 refs.md·notes.md 확인
2. URL들을 fetch해 핵심 분석·종합(단순 복사 금지)
3. 카테고리 스스로 판단 → 규칙에 맞게 작성
...
```

`/write kong-gateway`로 부르면 `$ARGUMENTS`가 `kong-gateway`로 치환됩니다. 커맨드에도 `description`·`argument-hint`·`allowed-tools`·`model` 같은 프론트매터를 **선택적으로** 붙일 수 있지만, 위처럼 본문만 있어도 완전히 동작합니다.

> 💡 인자는 `$ARGUMENTS`(전체) 외에 `$0`·`$1`(위치별), `$ARGUMENTS[0]` 같은 형태도 지원합니다. `/migrate SearchBar React Vue`에서 `$0`=`SearchBar`, `$1`=`React` 식으로 쪼개 쓸 수 있습니다.

### 스킬: `description`으로 발동하고, 스크립트를 번들한다

`blog-lint`의 `SKILL.md`는 프론트매터의 **`description`이 자율 발동의 트리거**입니다(발췌).

```yaml
---
name: blog-lint
description: Hugo 블로그 content/ 글의 이주 잔재·SEO 메타·slug 규칙·깨진 내부링크·H1·헤더 이모지 과다를 점검(lint)한다. 사용자가 "블로그 글 점검/검사/lint/품질 확인"을 요청할 때 사용.
---
```

그리고 본문(마크다운)에는 **번들된 스크립트를 실행하라는 지시**가 들어갑니다 — 예: `python3 .claude/skills/blog-lint/scripts/scan.py`.

여기서 **`description`에 "점검/검사/lint/품질 확인"** 같은 실제 사용자 표현을 넣어둔 게 핵심입니다. 제가 "글 점검해줘"라고만 해도 Claude가 이 description을 보고 스킬을 자동으로 집어 들거든요. 그리고 판정 로직은 프롬프트가 아니라 **번들된 `scan.py`가 결정적으로** 수행합니다 — LLM이 매번 규칙을 "해석"하는 게 아니라, 코드가 같은 입력에 같은 결과를 냅니다.

> 💡 스크립트 경로는 `${CLAUDE_SKILL_DIR}/scripts/scan.py`처럼 스킬 디렉터리 변수로 참조하면, 개인·프로젝트·플러그인 어디에 설치돼도 안전하게 풀립니다.

---

## 🧭 커맨드를 스킬로 올릴까? — 판단 체크리스트

기존 커맨드를 굳이 스킬로 옮길 필요는 없습니다(그대로 동작하니까요). 다만 **아래 중 하나라도 해당하면 스킬로 승격**할 가치가 있습니다.

- **코드·참고문서를 번들**하고 싶다 → 폴더 구조가 필요하니 스킬. (예: `blog-lint`의 `scan.py`)
- **Claude가 알아서 발동**하길 원한다 → `description` 기반 자율 발동이 필요하니 스킬.
- **여러 Claude 표면(Claude.ai·API·다른 도구)에서 재사용**하고 싶다 → Agent Skills 표준을 따르는 스킬.
- **긴 참고 자료**를 붙이되 평소 컨텍스트 비용은 아끼고 싶다 → 점진적 공개가 되는 스킬.

반대로, **"내가 명시적으로만 부르는 순수 프롬프트 워크플로"**라면 커맨드로 남겨둬도 충분합니다. 이 블로그가 딱 그 기준으로 나뉘어 있습니다.

| 자산 | 형태 | 이유 |
|---|---|---|
| `/write`·`/convert` | 커맨드 유지 | 내가 명시적으로 트리거하는 순수 프롬프트. 번들할 코드 없음 |
| `blog-lint` | 스킬 | `scan.py` 번들 + "글 점검해줘"에 자율 발동 필요 |

---

## ❓ 자주 묻는 질문

**Q. 그럼 커맨드는 없어지나요?**
당장은 아닙니다. 공식 문서가 "기존 `.claude/commands/` 파일은 계속 동작한다"고 명시합니다. 다만 신규로 만든다면, 확장 여지가 큰 **스킬 쪽이 권장**됩니다.

**Q. 스킬도 슬래시로 부를 수 있나요?**
네. `.claude/skills/<이름>/SKILL.md`가 있으면 `/이름`으로 직접 호출됩니다. 자동 발동을 막고 **명시 호출만** 원하면 `disable-model-invocation: true`를 주면 됩니다.

**Q. 같은 이름의 커맨드와 스킬이 둘 다 있으면?**
**스킬이 우선**합니다. 또 스킬끼리는 enterprise > personal(`~/.claude/skills`) > project(`.claude/skills`) 순으로 재정의됩니다.

**Q. 둘 중 뭐부터 시작하면 되나요?**
반복해서 붙여넣는 프롬프트가 있으면 **커맨드(파일 1개)로 가볍게** 시작하세요. 거기에 스크립트를 붙이거나 Claude가 알아서 부르길 원하는 순간, **폴더를 만들어 스킬로 승격**하면 됩니다.

**Q. 스킬이 안 불려요.**
`description`에 사용자가 실제로 쓸 법한 **키워드**가 들어갔는지 보세요. 자율 발동은 전적으로 이 description 매칭에 달려 있습니다. 급하면 `/이름`으로 직접 부르면 됩니다.

---

## 📚 참고

- [Extend Claude with skills — Claude Code Docs](https://code.claude.com/docs/en/slash-commands)
- [Agent Skills 오픈 표준 (agentskills.io)](https://agentskills.io)
- [Equipping agents for the real world with Agent Skills — Anthropic](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- 관련 글: [Claude Code로 문서 기반 바이브 코딩하기](/ai/llm/claude-code-vibe-coding-documentation-guide/)
