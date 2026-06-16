---
name: blog-lint
description: Hugo 블로그 content/ 글의 이주 잔재(Chirpy/Jekyll), SEO 메타(description), slug 규칙, 깨진 옛 내부링크(/posts/), H1 사용, 헤더 이모지 과다를 점검(lint)한다. 사용자가 "블로그 글 점검/검사/lint/품질 확인"을 요청할 때 사용.
---

# blog-lint — 블로그 글 품질 점검

Hugo 블로그(`content/` 페이지 번들)의 글 품질을 일괄 점검하는 Skill입니다.
규칙 기준은 저장소 루트의 `CLAUDE.md`입니다.

## 실행 방법

저장소 루트에서 스캔 스크립트를 실행합니다.

```bash
python3 .claude/skills/blog-lint/scripts/scan.py
```

- 특정 경로만 보려면 인자로 전달: `python3 .claude/skills/blog-lint/scripts/scan.py content/kubernetes`
- ERROR가 1건이라도 있으면 종료코드 1.

## 결과 해석 및 보고

스크립트는 문제를 세 단계로 분류해 출력합니다. 결과를 사용자에게 **요약 보고**하세요.

- 🔴 **ERROR** — 렌더가 깨지거나 규칙 위반(즉시 고칠 가치):
  - Chirpy IAL `{: .prompt-* }`·이미지 `{: width=… }` 잔존 → 본문에 리터럴로 노출됨
  - front matter Jekyll 주석(`# layout/comments/pin/excerpt`)
  - 옛 Jekyll 내부링크 `/posts/<slug>/` → 현재 스킴은 `/<섹션>/<slug>/`, 404
  - H1(`#`) 헤더(CLAUDE.md는 `##`부터)
- 🟠 **WARN** — 품질 저하: `description` 없음/60자 미만, slug에 소문자-하이픈 외 문자, 헤더 이모지 2개+.
- 🔵 **INFO** — 권장사항: 상단 요약 단락 없음, 하단 `📚 참고`/`🔗 관련 글` 섹션 없음.

## 수정으로 이어가기

- **ERROR 대부분은 기계적으로 고칠 수 있습니다**: prompt 블록→blockquote(💡/⚠️/🚨) 변환, front matter 주석 줄 제거, `/posts/` 링크를 현재 Hugo 경로로 재매핑, IAL 속성 제거. 발견되면 사용자에게 **수정 적용 여부를 확인한 뒤** 진행하세요.
- **WARN(description 등)**은 글 내용을 읽고 보강해야 하므로, 일괄 자동화보다 섹션 단위로 제안하세요. slug 개명은 URL이 바뀌므로 반드시 사용자 확인.
- **INFO**는 참고용 — 강제하지 마세요.

## 원칙

- 기본 동작은 **점검·리포트까지**. 파일 수정과 git(커밋/푸시)은 항상 사용자 확인 후 수행합니다.
- 수정 후에는 `hugo --gc --minify` 빌드가 0 에러인지, 스캔 ERROR가 0으로 떨어지는지 확인하세요.
