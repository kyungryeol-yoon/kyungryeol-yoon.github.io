#!/usr/bin/env node
/**
 * Chirpy(Jekyll) → Hugo 변환기
 *
 * 사용법:
 *   node scripts/convert.mjs <SRC_POSTS_DIR> <OUT_CONTENT_DIR> [file1.md file2.md ...]
 *   - 파일 인자를 주면 그 글만, 안 주면 SRC 전체(.md) 변환.
 *
 * 변환 규칙:
 *   - front matter: categories→중첩 섹션 폴더 경로(키 제거), tags 유지,
 *     mermaid 키 제거, pin→pinned, image→그대로(번들로 복사), url=/posts/<slug>/ 주입.
 *   - prompt 박스: `> 내용 ... \n{: .prompt-X}` → {{< alert "X" >}}…{{< /alert >}} (코드펜스 보호)
 *   - 페이지 번들: <OUT>/<섹션경로>/<slug>/index.md
 *   - slug: 파일명에서 날짜 접두사 제거(= 기존 Chirpy /posts/<slug>/ 보존)
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, basename, extname, resolve } from "node:path";

const slugifySeg = (s) =>
  s.trim().toLowerCase().replace(/\+/g, "p").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// 카테고리 표시명 보존(원본 대소문자). slug→display 누적.
const sectionTitles = new Map();
const ensureSections = (outRoot, cats) => {
  let rel = "";
  for (const c of cats) {
    const seg = slugifySeg(c);
    rel = rel ? `${rel}/${seg}` : seg;
    if (!sectionTitles.has(rel)) sectionTitles.set(rel, c);
    const idx = join(outRoot, rel, "_index.md");
    if (!existsSync(idx)) {
      mkdirSync(dirname(idx), { recursive: true });
      writeFileSync(idx, `---\ntitle: ${JSON.stringify(c)}\n---\n`, "utf8");
    }
  }
};

const PROMPT_RE = /^\{:\s*\.prompt-(info|tip|warning|danger)\s*\}\s*$/;
const FENCE_RE = /^(\s*)(```+|~~~+)/;

function parseFrontMatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: {}, body: raw, fmRaw: "" };
  const fmBlock = m[1];
  const body = raw.slice(m[0].length);
  const fm = {};
  const lines = fmBlock.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let val = kv[2].trim();
    if (val === "" ) {
      // 맵/멀티라인(image: { path/alt }) — 들여쓰기 하위라인 수집
      const sub = {};
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) {
        const s = lines[++i].match(/^\s+([A-Za-z0-9_]+):\s*(.*)$/);
        if (s) sub[s[1]] = stripQuotes(s[2].trim());
      }
      fm[key] = Object.keys(sub).length ? sub : "";
    } else if (val.startsWith("[") && val.endsWith("]")) {
      fm[key] = val.slice(1, -1).split(",").map((x) => stripQuotes(x.trim())).filter(Boolean);
    } else if (val === "true" || val === "false") {
      fm[key] = val === "true";
    } else {
      fm[key] = stripQuotes(val);
    }
  }
  return { fm, body };
}
const stripQuotes = (s) => s.replace(/^["']|["']$/g, "");

/** prompt 박스 변환 (코드펜스 내부 보호) */
function convertPromptBoxes(body) {
  const lines = body.split("\n");
  const out = [];
  let fence = null; // 현재 코드펜스 마커
  for (const line of lines) {
    const f = line.match(FENCE_RE);
    if (f) {
      const marker = f[2][0]; // ` 또는 ~
      if (!fence) fence = marker;
      else if (line.trim().startsWith(fence)) fence = null;
      out.push(line);
      continue;
    }
    if (fence) { out.push(line); continue; }

    const pm = line.match(PROMPT_RE);
    if (pm) {
      const type = pm[1];
      // 직전 연속 blockquote 라인 회수
      const quote = [];
      while (out.length && /^\s*>/.test(out[out.length - 1])) {
        quote.unshift(out.pop());
      }
      // 끝쪽 빈 blockquote 제거
      const content = quote
        .map((l) => l.replace(/^\s*>\s?/, ""))
        .join("\n")
        .replace(/\n+$/,"");
      out.push(`{{< alert "${type}" >}}`);
      out.push(content);
      out.push(`{{< /alert >}}`);
      continue;
    }
    out.push(line);
  }
  return out.join("\n");
}

function fmToYaml(fm, slug) {
  const o = [];
  o.push("---");
  o.push(`title: ${JSON.stringify(fm.title ?? slug)}`);
  if (fm.date) o.push(`date: ${String(fm.date).slice(0, 10)}`);
  if (Array.isArray(fm.tags) && fm.tags.length) o.push(`tags: [${fm.tags.join(", ")}]`);
  if (fm.description) o.push(`description: ${JSON.stringify(fm.description)}`);
  if (fm.pin === true) o.push(`pinned: true`);
  if (fm.image) {
    const p = typeof fm.image === "object" ? fm.image.path : fm.image;
    if (p) o.push(`image: ${JSON.stringify(localizeImage(p))}`);
    if (typeof fm.image === "object" && fm.image.alt) o.push(`imageAlt: ${JSON.stringify(fm.image.alt)}`);
  }
  o.push(`url: /posts/${slug}/`);
  o.push("---");
  return o.join("\n") + "\n";
}
// 대표 이미지 경로를 번들 상대경로로(파일명만)
function localizeImage(p) {
  return basename(p);
}

function convertFile(srcFile, outRoot, srcImgRoot) {
  const raw = readFileSync(srcFile, "utf8");
  const { fm, body } = parseFrontMatter(raw);
  const cats = Array.isArray(fm.categories) ? fm.categories : [];
  if (!cats.length) throw new Error(`categories 없음: ${srcFile}`);
  const sectionPath = cats.map(slugifySeg).join("/");
  ensureSections(outRoot, cats);
  const fname = basename(srcFile, extname(srcFile));
  const slug = fname.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  const bundleDir = join(outRoot, sectionPath, slug);
  mkdirSync(bundleDir, { recursive: true });

  const newBody = convertPromptBoxes(body);
  const out = fmToYaml(fm, slug) + "\n" + newBody.replace(/^\n+/, "");
  writeFileSync(join(bundleDir, "index.md"), out, "utf8");

  // 대표 이미지가 로컬 경로면 번들로 복사
  if (fm.image) {
    const p = typeof fm.image === "object" ? fm.image.path : fm.image;
    if (p && !/^https?:\/\//.test(p)) {
      const cand = join(srcImgRoot, p.replace(/^\//, ""));
      if (existsSync(cand)) copyFileSync(cand, join(bundleDir, basename(p)));
      else console.warn(`  ! 이미지 없음: ${cand}`);
    }
  }
  return { slug, sectionPath, src: srcFile };
}

// --- main ---
const [, , SRC, OUT, ...files] = process.argv;
if (!SRC || !OUT) {
  console.error("usage: node convert.mjs <SRC_POSTS_DIR> <OUT_CONTENT_DIR> [files...]");
  process.exit(1);
}
const srcImgRoot = resolve(SRC, ".."); // _posts의 상위(레포 루트) 기준 /assets/img
let targets = files;
if (!targets.length) {
  const walk = (d) => readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".md") ? [p] : [];
  });
  targets = walk(SRC);
}
const report = [];
const failed = [];
for (const f of targets) {
  try { report.push(convertFile(resolve(f), resolve(OUT), srcImgRoot)); }
  catch (e) { failed.push({ f, e: e.message }); }
}
console.log(`변환 완료: ${report.length}개`);
for (const r of report) console.log(`  ${r.sectionPath}/${r.slug}  ← ${basename(r.src)}`);
if (failed.length) {
  console.log(`\n실패/수동확인: ${failed.length}개`);
  for (const x of failed) console.log(`  ! ${x.f}: ${x.e}`);
}
