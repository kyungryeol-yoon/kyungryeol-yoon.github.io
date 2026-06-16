#!/usr/bin/env python3
"""Hugo 블로그 content/ 글 품질 점검(lint).

검사: Chirpy/Jekyll 이주 잔재, SEO 메타(description), slug 규칙,
깨진 옛 내부링크(/posts/), H1 사용, 헤더 이모지 과다 등.

사용:
    python3 .claude/skills/blog-lint/scripts/scan.py [content경로]
기본 경로는 ./content (repo 루트에서 실행 가정).
ERROR가 1건이라도 있으면 종료코드 1.
"""
import os, re, sys, glob

# 이모지 유니코드 범위(화살표 →, ℹ 등 오탐 줄이려 한정)
EMOJI = re.compile("[\U0001F300-\U0001FAFF\U00002600-\U000027BF\U00002B00-\U00002BFF]|\\d️⃣")
FM = re.compile(r'^---\n(.*?)\n---\n?(.*)$', re.S)
CODE_FENCE = re.compile(r'```.*?```', re.S)


def load(path):
    txt = open(path, encoding='utf-8').read()
    m = FM.match(txt)
    if not m:
        return None, txt, txt
    fm, body = m.group(1), m.group(2)
    return fm, body, txt


def scan(root):
    files = sorted(glob.glob(os.path.join(root, "**", "index.md"), recursive=True))
    issues = {}  # key -> (level, label, [files])

    def add(key, level, label, f):
        issues.setdefault(key, [level, label, []])[2].append(f)

    for f in files:
        rel = os.path.relpath(f)
        fm, body, raw = load(f)
        nocode = CODE_FENCE.sub('', body)
        slug = os.path.basename(os.path.dirname(f))

        # --- ERROR: 이주 잔재 / 규칙 위반 ---
        if '{: .' in raw:
            add('chirpy_ial', 'ERROR', "Chirpy IAL '{: .' 잔존(prompt 등 깨짐)", rel)
        if re.search(r'\]\([^)]*\)\{:\s*[^}]*\}', raw):
            add('img_ial', 'ERROR', "이미지 IAL '](...){: ...}' 잔존(Hugo 미지원)", rel)
        if fm and re.search(r'^\s*#\s*(layout|comments|pin|excerpt)\s*:', fm, re.M):
            add('fm_cruft', 'ERROR', "front matter Jekyll 주석(# layout/comments/pin/excerpt)", rel)
        if re.search(r'github\.io/posts/', raw) or re.search(r'\]\(/posts/', raw):
            add('old_link', 'ERROR', "옛 Jekyll 내부링크(/posts/...) — 404", rel)
        if re.search(r'^#\s\S', nocode, re.M):
            add('h1', 'ERROR', "H1(#) 헤더 사용(CLAUDE.md 금지, ##부터)", rel)

        # --- WARN: 품질 ---
        if fm is None:
            add('no_fm', 'WARN', "front matter 없음", rel)
        else:
            d = re.search(r'^description:\s*"?(.*?)"?\s*$', fm, re.M)
            if not d:
                add('no_desc', 'WARN', "description 없음(SEO/AEO)", rel)
            elif len(d.group(1)) < 60:
                add('short_desc', 'WARN', "description 60자 미만(빈약)", rel)
        if re.search(r'[^a-z0-9-]', slug):
            add('bad_slug', 'WARN', "slug에 소문자-하이픈 외 문자(괄호/공백/대문자 등)", rel)
        for line in nocode.splitlines():
            s = line.strip()
            if s.startswith('#') and len(EMOJI.findall(s)) >= 2:
                add('multi_emoji', 'WARN', "헤더 1줄에 이모지 2개+ (헤더당 1개 권장)", rel)
                break

        # --- INFO: 권장 ---
        first = (nocode.strip().split('\n\n', 1) or [''])[0].strip()
        if not first or first.startswith('#'):
            add('no_summary', 'INFO', "상단 요약 단락 없음(AEO: 첫 2~3문장 요약 권장)", rel)
        if '## 📚' not in body and '## 🔗' not in body and '## 참고' not in body:
            add('no_refs', 'INFO', "하단 '📚 참고'/'🔗 관련 글' 섹션 없음", rel)

    return files, issues


def main():
    root = sys.argv[1] if len(sys.argv) > 1 else "content"
    if not os.path.isdir(root):
        print(f"❌ content 경로를 찾을 수 없습니다: {root} (repo 루트에서 실행하세요)")
        sys.exit(2)

    files, issues = scan(root)
    order = {'ERROR': 0, 'WARN': 1, 'INFO': 2}
    icon = {'ERROR': '🔴', 'WARN': '🟠', 'INFO': '🔵'}
    counts = {'ERROR': 0, 'WARN': 0, 'INFO': 0}

    print(f"📋 blog-lint — 글 {len(files)}개 점검\n" + "=" * 50)
    for key in sorted(issues, key=lambda k: (order[issues[k][0]], -len(issues[k][2]))):
        level, label, flist = issues[key]
        counts[level] += len(flist)
        print(f"\n{icon[level]} {level}  {label} — {len(flist)}건")
        for x in flist[:8]:
            print(f"     {x}")
        if len(flist) > 8:
            print(f"     … 외 {len(flist) - 8}건")

    print("\n" + "=" * 50)
    print(f"요약: 🔴 ERROR {counts['ERROR']} / 🟠 WARN {counts['WARN']} / 🔵 INFO {counts['INFO']}")
    if counts['ERROR'] == 0:
        print("✅ ERROR 없음 — 이주 잔재·규칙 위반 깨끗합니다.")
    sys.exit(1 if counts['ERROR'] else 0)


if __name__ == "__main__":
    main()
