// 자작 테마 클라이언트 스크립트 — 바닐라, 기능별 독립 블록(제거 시 해당 블록만 삭제).

// [11] [M6] Web Share API — 지원 시 네이티브 공유 시트, 미지원 시 URL 복사 -----
(function shareButton() {
  const btns = document.querySelectorAll(".share-btn");
  if (!btns.length) return;
  const canShare = typeof navigator.share === "function";
  btns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const title = document.title;
      const url = location.href;
      const label = btn.querySelector(".share-label");
      if (canShare) {
        try { await navigator.share({ title, url }); } catch (e) { /* 사용자 취소 등 무시 */ }
        return;
      }
      // 폴백: 클립보드 복사 + 1.5s 문구 교체
      try {
        await navigator.clipboard.writeText(url);
        if (label) {
          const orig = label.textContent;
          label.textContent = "복사됨";
          setTimeout(() => { label.textContent = orig; }, 1500);
        }
      } catch (e) {}
    });
  });
})();

// [1] 다크모드 토글 -------------------------------------------------------
(function darkToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", cur);
    try { localStorage.setItem("theme", cur); } catch (e) {}
  });
})();

// [2] TOC scroll-spy + 활성 섹션만 L3 펼침 -------------------------------
(function tocSpy() {
  const toc = document.getElementById("toc");
  if (!toc) return;
  const nav = toc.querySelector("nav");
  const rootUl = nav && nav.querySelector(":scope > ul");
  const links = [...toc.querySelectorAll('a[href^="#"]')];
  if (!links.length) return;
  const map = new Map();
  links.forEach((a) => {
    const id = decodeURIComponent(a.getAttribute("href").slice(1));
    const el = document.getElementById(id);
    if (el) map.set(el, a);
  });
  // 링크가 속한 최상위 li(L2) 찾기 — 활성 섹션만 하위(L3+)를 펼치기 위함
  function topLi(link) {
    let li = link.closest("li");
    while (li && rootUl && li.parentElement !== rootUl) {
      const p = li.parentElement;
      li = p ? p.closest("li") : null;
    }
    return li;
  }
  let curLink = null, curTop = null;
  // 전체 펼침 상태에서 활성 링크를 목차 칼럼 안에 보이게 — TOC 스크롤 컨테이너만 이동(페이지엔 영향 없음)
  function follow(link) {
    const sc = (nav && nav.scrollHeight > nav.clientHeight + 1) ? nav : toc;
    if (!sc || sc.scrollHeight <= sc.clientHeight + 1) return;
    const lr = link.getBoundingClientRect(), cr = sc.getBoundingClientRect();
    if (lr.top < cr.top + 8) sc.scrollTop += lr.top - cr.top - 8;
    else if (lr.bottom > cr.bottom - 8) sc.scrollTop += lr.bottom - cr.bottom + 8;
  }
  function setActive(link) {
    if (!link || link === curLink) return;
    if (curLink) curLink.classList.remove("active");
    curLink = link;
    curLink.classList.add("active");
    const top = topLi(link);
    if (top !== curTop) {
      if (curTop) curTop.classList.remove("toc-active");
      curTop = top;
      if (curTop) curTop.classList.add("toc-active");
    }
    follow(curLink);
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(map.get(e.target)); });
    },
    { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
  );
  map.forEach((_, el) => obs.observe(el));
})();

// [2a] TOC 스크롤 페이드: 스크롤 여지 있을 때만 위/아래 페이드 클래스 부여 -------
// 데스크톱은 .toc가, 모바일은 내부 nav(max-height:60vh)가 스크롤 → 둘 다 대응
(function tocFade() {
  const toc = document.getElementById("toc");
  if (!toc) return;
  const nav = toc.querySelector("nav");
  const targets = [toc, nav].filter(Boolean);
  const updateAll = () => targets.forEach((el) => {
    el.classList.toggle("scroll-fade-top", el.scrollTop > 2);
    el.classList.toggle("scroll-fade-bottom", el.scrollTop + el.clientHeight < el.scrollHeight - 2);
  });
  targets.forEach((el) => el.addEventListener("scroll", updateAll, { passive: true }));
  window.addEventListener("resize", updateAll);
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(updateAll);
    targets.forEach((el) => ro.observe(el));   // L3 펼침/접힘·details 열림으로 높이 바뀌면 재계산
  }
  const details = toc.querySelector(".toc-details");
  if (details) details.addEventListener("toggle", updateAll);
  updateAll();
  setTimeout(updateAll, 250);
})();

// [2b] TOC: 데스크톱 기본 펼침 / 모바일 기본 접힘 + 항목 탭 시 점프 후 자동 접기 --
(function tocResponsive() {
  const d = document.querySelector("#toc .toc-details");
  if (!d) return;
  const mq = window.matchMedia("(max-width: 768px)");
  const sync = () => { d.open = !mq.matches; };   // 데스크톱: 펼침, 모바일: 접힘
  sync();
  mq.addEventListener("change", sync);
  d.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", () => { if (mq.matches) d.open = false; })
  );
})();


// [2c] Sticky rail/chips 스크롤스파이 — 어떤 컨테이너든 [data-scrollspy]에 자동 적용
// 컨테이너에 data-scrollspy, 섹션에 data-scrollspy-section + data-key,
// 레일/칩 링크에 data-key만 붙이면 어느 페이지든 동일 UX가 붙는다.
(function navSpy() {
  document.querySelectorAll("[data-scrollspy]").forEach((root) => {
    const sections = [...root.querySelectorAll("[data-scrollspy-section][data-key]")];
    if (!sections.length) return;
    const rail = new Map(), chips = new Map();
    root.querySelectorAll(".arch-rail-list a[data-key]").forEach((a) => rail.set(a.dataset.key, a));
    root.querySelectorAll(".arch-chips a[data-key]").forEach((a) => chips.set(a.dataset.key, a));
    let cur = null;
    function setActive(key) {
      if (key === cur) return;
      [rail, chips].forEach((m) => {
        const p = m.get(cur); if (p) { p.classList.remove("is-active"); p.removeAttribute("aria-current"); }
        const n = m.get(key); if (n) { n.classList.add("is-active"); n.setAttribute("aria-current", "location"); }
      });
      cur = key;
      const chip = chips.get(key);
      if (chip) chip.scrollIntoView({ inline: "center", block: "nearest", behavior: "instant" });
    }
    const obs = new IntersectionObserver((entries) => {
      // IntersectionObserverEntry의 boundingClientRect를 재사용 — getBoundingClientRect 재호출 방지
      const vis = entries.filter((e) => e.isIntersecting);
      if (!vis.length) return;
      vis.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      setActive(vis[0].target.dataset.key);
    }, { rootMargin: "-80px 0px -60% 0px", threshold: 0 });
    sections.forEach((s) => obs.observe(s));
  });
})();

// [2d] Tags 인덱스 정렬 토글 (A-Z ↔ 인기순) --------------------------------
(function tagsSort() {
  const root = document.querySelector(".tags-index");
  if (!root) return;
  const btns = root.querySelectorAll(".tags-sort button[data-sort]");
  const viewAZ = root.querySelector('.tags-view[data-view="az"]');
  const viewPop = root.querySelector('.tags-view[data-view="pop"]');
  const cloud = root.querySelector("#tags-pop-cloud");
  if (!btns.length || !viewAZ || !viewPop || !cloud) return;
  let built = false;
  function buildPop() {
    if (built) return;
    // A-Z 뷰 안의 모든 태그를 복제해 count DESC로 정렬
    const tags = [...viewAZ.querySelectorAll("a.tag[data-count]")].map((a) => ({
      el: a.cloneNode(true),
      n: parseInt(a.dataset.count, 10) || 0,
    }));
    tags.sort((a, b) => b.n - a.n);
    tags.forEach((t) => cloud.appendChild(t.el));
    built = true;
  }
  function setMode(mode) {
    btns.forEach((b) => {
      const on = b.dataset.sort === mode;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (mode === "pop") { buildPop(); viewAZ.hidden = true; viewPop.hidden = false; root.classList.add("is-pop"); }
    else { viewAZ.hidden = false; viewPop.hidden = true; root.classList.remove("is-pop"); }
  }
  btns.forEach((b) => b.addEventListener("click", () => setMode(b.dataset.sort)));
})();

// [4] 헤딩 앵커 링크 복사 --------------------------------------------------
(function anchorCopy() {
  document.querySelectorAll("a[data-anchor]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const url = location.origin + location.pathname + a.getAttribute("href");
      history.replaceState(null, "", a.getAttribute("href"));
      if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
    });
  });
})();

// [7] 카테고리 트리 접기/펴기 (chevron 토글, 상태 기억) -------------------
(function catTree() {
  if (!document.querySelector(".cat-tree li.has-children")) return;
  const KEY = "catOpen";
  let saved;
  try { saved = new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch (e) { saved = new Set(); }

  function apply(li, isOpen) {
    li.classList.toggle("open", isOpen);
    const btn = li.querySelector(":scope > .cat-row > .cat-toggle");
    const children = li.querySelector(":scope > .children");
    if (btn) btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (children) children.hidden = !isOpen;
  }
  const items = document.querySelectorAll(".cat-tree li.has-children");
  // 저장된 상태 복원
  items.forEach((li) => apply(li, saved.has(li.dataset.cat)));
  // 현재 경로의 조상 카테고리 자동 펼침
  const path = location.pathname;
  items.forEach((li) => {
    const cat = li.dataset.cat;
    if (cat && cat !== "/" && path.indexOf(cat) === 0) {
      let el = li;
      while (el) { if (el.classList && el.classList.contains("has-children")) apply(el, true); el = el.parentElement ? el.parentElement.closest("li.has-children") : null; }
    }
  });
  // 전체 펼치기/접기 버튼 (여러 개 지원 — categories 페이지 + 홈/목록 사이드바)
  const syncers = [];
  document.querySelectorAll(".cat-tool-btn").forEach((btn) => {
    // 버튼과 같은 블록 안의 트리를 찾음
    let scope = btn.parentElement;
    while (scope && !scope.querySelector(".cat-tree")) scope = scope.parentElement;
    const treeItems = scope ? scope.querySelectorAll(".cat-tree li.has-children") : [];
    if (!treeItems.length) return;
    const sync = () => {
      const allOpen = [...treeItems].every((li) => li.classList.contains("open"));
      btn.setAttribute("aria-expanded", allOpen ? "true" : "false");
      const label = btn.querySelector(".label");
      if (label) label.textContent = allOpen ? "전체 접기" : "전체 펼치기";
    };
    btn.addEventListener("click", () => {
      const willOpen = btn.getAttribute("aria-expanded") !== "true";
      treeItems.forEach((li) => {
        apply(li, willOpen);
        if (willOpen) saved.add(li.dataset.cat); else saved.delete(li.dataset.cat);
      });
      try { localStorage.setItem(KEY, JSON.stringify([...saved])); } catch (e) {}
      syncers.forEach((fn) => fn());
    });
    syncers.push(sync);
  });

  // 토글 클릭
  document.querySelectorAll(".cat-toggle").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const li = btn.closest("li");
      const willOpen = !li.classList.contains("open");
      apply(li, willOpen);
      if (willOpen) saved.add(li.dataset.cat); else saved.delete(li.dataset.cat);
      try { localStorage.setItem(KEY, JSON.stringify([...saved])); } catch (e) {}
      syncers.forEach((fn) => fn());
    });
  });

  syncers.forEach((fn) => fn());
})();

// [10] 스크롤 진행률 링 + 맨 위로 (한 화면 스크롤 후 fade-in) ---------------
(function scrollProgress() {
  const btn = document.getElementById("to-top");
  const bar = document.getElementById("to-top-bar");
  if (!btn) return;
  const article = document.querySelector(".post .content"); // 글이면 본문 기준, 아니면 페이지 기준
  const touch = window.matchMedia("(hover: none)").matches;  // 터치 기기에서만 스크롤 중 숨김
  let idleTimer;
  function ratio() {
    if (article) {
      const start = article.offsetTop;
      const end = start + article.offsetHeight - window.innerHeight;
      return Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start)));
    }
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? Math.min(1, window.scrollY / max) : 0;
  }
  function update() {
    if (bar) bar.style.strokeDashoffset = 100 - ratio() * 100;
    // 한 화면의 40%만 내려도 노출 (소셜 아이콘이 헤더로 이동 → footer 겹침 없음)
    btn.classList.toggle("visible", window.scrollY > window.innerHeight * 0.4);
  }
  update();
  window.addEventListener("scroll", () => {
    update();
    if (!touch) return;
    btn.classList.add("is-scrolling");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => btn.classList.remove("is-scrolling"), 260);  // 멈춘 뒤 ~0.26s면 재등장
  }, { passive: true });
  window.addEventListener("resize", update);
  btn.addEventListener("click", () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });
})();

// [8] 모바일 햄버거 메뉴 --------------------------------------------------
(function hamburger() {
  const btn = document.getElementById("nav-toggle");
  const links = document.getElementById("primary-nav");
  const backdrop = document.getElementById("nav-backdrop");
  if (!btn || !links) return;
  function setOpen(open) {
    links.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (backdrop) backdrop.classList.toggle("show", open);
  }
  function close() { setOpen(false); }
  btn.addEventListener("click", (e) => { e.stopPropagation(); setOpen(!links.classList.contains("open")); });
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  if (backdrop) backdrop.addEventListener("click", close);
  document.addEventListener("click", (e) => { if (links.classList.contains("open") && !links.contains(e.target) && e.target !== btn) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();

// [6] ⌘K 통합 모달 (Pagefind 텍스트 검색 + 태그 다중선택 필터) ------------
(function findModal() {
  const modal = document.getElementById("search-modal");
  const trigger = document.getElementById("search-trigger");
  if (!modal) return;

  // -- Pagefind lazy 로드 --
  let loaded = false, lastFocus = null;
  function loadPagefind() {
    return new Promise((resolve) => {
      const css = document.createElement("link");
      css.rel = "stylesheet"; css.href = "/pagefind/pagefind-ui.css";
      document.head.appendChild(css);
      const js = document.createElement("script");
      js.src = "/pagefind/pagefind-ui.js"; js.onload = resolve; js.onerror = resolve;
      document.head.appendChild(js);
    });
  }
  async function ensureUI() {
    if (loaded) return;
    await loadPagefind();
    if (window.PagefindUI) {
      new PagefindUI({
        element: "#pf-search", autofocus: false, showSubResults: true, showImages: false,
        translations: { placeholder: "글 검색…", zero_results: '"[SEARCH_TERM]" 결과 없음', clear_search: "지우기", load_more: "더 보기" },
      });
    }
    loaded = true;
  }
  function focusPagefind() {
    const i = modal.querySelector(".pagefind-ui__search-input");
    if (i) i.focus();
  }

  // -- 태그 필터 (details 안) --
  const details = modal.querySelector("#search-tags");
  const chipsWrap = modal.querySelector("#tagm-chips");
  const resultsEl = modal.querySelector("#tagm-results");
  const selCount = modal.querySelector("#tagm-selcount");
  const clearBtn = modal.querySelector("#tagm-clear");
  const filterInput = modal.querySelector("#tagm-filter");
  let posts = null, filterText = "";
  const selected = new Set();

  async function ensureTagData() {
    if (posts) return;
    try { const r = await fetch("/index.json"); posts = await r.json(); } catch (e) { posts = []; }
  }
  const ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ESC_MAP[c]);
  function renderTags() {
    if (!chipsWrap) return;
    const sel = [...selected];
    if (selCount) selCount.textContent = sel.length ? `(${sel.length})` : "";
    if (clearBtn) clearBtn.hidden = sel.length === 0;
    const all = posts || [];
    const matching = sel.length ? all.filter((p) => sel.every((t) => (p.tags || []).indexOf(t) !== -1)) : all;
    const avail = new Set();
    matching.forEach((p) => (p.tags || []).forEach((t) => avail.add(t)));
    const q = filterText;
    chipsWrap.querySelectorAll(".tag-chip").forEach((chip) => {
      const enabled = selected.has(chip.dataset.tag) || avail.has(chip.dataset.tag);
      chip.disabled = !enabled;
      chip.classList.toggle("is-disabled", !enabled);
      const hit = !q || selected.has(chip.dataset.tag) || (chip.dataset.name || "").indexOf(q) !== -1;
      chip.classList.toggle("is-filtered", !hit);
    });
    if (!resultsEl) return;
    if (!sel.length) { resultsEl.innerHTML = '<p class="tag-empty">태그를 선택하면 해당 글이 표시됩니다.</p>'; return; }
    resultsEl.innerHTML = '<ul class="post-index">' + matching.map((p) =>
      `<li><span class="t"><a href="${esc(p.url)}">${esc(p.title)}</a></span><span class="d">${esc(p.date)}</span></li>`
    ).join("") + "</ul>";
  }

  // -- 열기/닫기 (통합) --
  async function open(opts) {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    await ensureUI();
    if (opts && opts.tags && details) {
      // details.open = true → toggle 이벤트가 ensureTagData + renderTags 를 담당(중복 방지)
      details.open = true;
      requestAnimationFrame(() => filterInput && filterInput.focus());
    } else {
      requestAnimationFrame(focusPagefind);
    }
  }
  function close() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (filterInput && filterText) { filterInput.value = ""; filterText = ""; renderTags(); }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  if (trigger) trigger.addEventListener("click", () => open());
  modal.querySelectorAll("[data-search-close]").forEach((el) => el.addEventListener("click", close));

  // 태그 details 처음 열릴 때 데이터 로드
  if (details) details.addEventListener("toggle", async () => {
    if (!details.open) return;
    await ensureTagData(); renderTags();
  });
  if (chipsWrap) chipsWrap.addEventListener("click", (e) => {
    const chip = e.target.closest(".tag-chip");
    if (!chip) return;
    const t = chip.dataset.tag;
    if (selected.has(t)) { selected.delete(t); chip.setAttribute("aria-pressed", "false"); }
    else { selected.add(t); chip.setAttribute("aria-pressed", "true"); }
    renderTags();
  });
  if (clearBtn) clearBtn.addEventListener("click", () => {
    selected.clear();
    chipsWrap.querySelectorAll(".tag-chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
    renderTags();
  });
  if (filterInput) filterInput.addEventListener("input", () => {
    filterText = filterInput.value.trim().toLowerCase();
    renderTags();
  });

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault(); modal.hidden ? open() : close();
    } else if (e.key === "/" && modal.hidden && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      e.preventDefault(); open();
    } else if (e.key === "Escape" && !modal.hidden) {
      close();
    }
  });

  // 딥링크: #search / #tags / #tags=slug,slug
  if (location.hash === "#search") open();
  else if (location.hash.indexOf("#tags") === 0) {
    const q = location.hash.split("=")[1];
    if (q && chipsWrap) decodeURIComponent(q).split(",").forEach((t) => {
      selected.add(t);
      const c = chipsWrap.querySelector('.tag-chip[data-tag="' + t + '"]');
      if (c) c.setAttribute("aria-pressed", "true");
    });
    open({ tags: true });
  }
})();

// [5] 코드블록 헤더(신호등 점 + 언어 라벨 + 복사) ---------------------------
(function codeBlocks() {
  const ICON_CODE = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>';
  const ICON_COPY = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  const ICON_DONE = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  const ICON_FILE = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';

  document.querySelectorAll(".highlight").forEach((block) => {
    if (block.querySelector(".code-header")) return;

    // 언어 추출: 코드 칸 <code class="language-xxx">
    const codeEl = block.querySelector('code[class*="language-"]');
    const m = codeEl && codeEl.className.match(/language-([\w-]+)/);
    const lang = m ? m[1] : "";
    const file = block.dataset.filename;   // {file="service.yaml"} → 렌더훅이 data-filename 부여

    const header = document.createElement("div");
    header.className = "code-header";
    header.innerHTML = '<span class="code-dots"><i></i><i></i><i></i></span><span class="code-lang"></span>';
    // 파일명 있으면 파일명 우선(확장자가 언어 암시), 없으면 언어 라벨. 텍스트는 append로 안전 삽입
    const langEl = header.querySelector(".code-lang");
    if (file) { langEl.innerHTML = ICON_FILE; langEl.append(file); langEl.classList.add("is-file"); }
    else if (lang) { langEl.innerHTML = ICON_CODE; langEl.append(lang.toUpperCase()); }

    const btn = document.createElement("button");
    btn.className = "code-copy";
    btn.type = "button";
    btn.setAttribute("aria-label", "코드 복사");
    btn.title = "복사";
    btn.innerHTML = ICON_COPY;
    btn.addEventListener("click", () => {
      // 줄번호(.ln 인라인 / .lnt 표) 제거 후 코드만 복사. 클론에서 번호 노드를 떼어 textContent
      const codeEl = block.querySelector("code");
      let text;
      if (codeEl) {
        const clone = codeEl.cloneNode(true);
        clone.querySelectorAll(".ln, .lnt").forEach((e) => e.remove());
        text = clone.textContent;
      } else {
        text = block.textContent;
      }
      text = text.replace(/\n$/, "");
      navigator.clipboard.writeText(text).then(() => {
        btn.classList.add("copied");
        btn.innerHTML = ICON_DONE + '<span class="code-copy-text">복사됨</span>';
        setTimeout(() => {
          btn.classList.remove("copied");
          btn.innerHTML = ICON_COPY;
        }, 1500);
      }).catch(() => {});
    });

    header.appendChild(btn);
    block.insertBefore(header, block.firstChild);
  });
})();
