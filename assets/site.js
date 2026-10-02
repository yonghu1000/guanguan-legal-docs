/* 关关 Guanguan · 法务与支持站点 —— 交互层
   零依赖 · 原生 ES2019 · 全部特性均可降级 */
(function () {
  "use strict";

  var doc = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------------ 主题 */
  (function theme() {
    var btn = $(".theme");
    var KEY = "gg-theme";
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}

    var sys = window.matchMedia("(prefers-color-scheme: dark)");

    function apply(mode) {
      if (mode === "dark" || mode === "light") doc.setAttribute("data-theme", mode);
      else doc.removeAttribute("data-theme");
    }
    apply(saved);

    if (!saved) {
      /* 首屏即套用系统偏好，而不是等用户改了系统设置才跟 */
      apply(sys.matches ? "dark" : "light");
      var onChange = function () { apply(sys.matches ? "dark" : "light"); };
      if (sys.addEventListener) sys.addEventListener("change", onChange);
      else if (sys.addListener) sys.addListener(onChange);
    }

    if (!btn) return;
    btn.setAttribute("aria-label", "切换深/浅色外观");
    btn.addEventListener("click", function () {
      var cur = doc.getAttribute("data-theme");
      if (!cur) cur = sys.matches ? "dark" : "light";
      var next = cur === "dark" ? "light" : "dark";
      doc.setAttribute("data-theme", next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
  })();

  /* -------------------------------------------------------------- 移动端导航 */
  (function drawer() {
    var btn = $(".navtoggle");
    if (!btn) return;
    btn.setAttribute("aria-expanded", "false");
    var sync = function (open) {
      document.body.classList.toggle("nav-open", open);
      document.body.classList.toggle("is-locked", open);
      btn.setAttribute("aria-expanded", String(open));
    };
    btn.addEventListener("click", function () {
      sync(!document.body.classList.contains("nav-open"));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") sync(false);
    });
    $$(".index a").forEach(function (a) {
      a.addEventListener("click", function () { sync(false); });
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 920) sync(false);
    });
  })();

  /* -------------------------------------------------------- 目录构建 + 高亮 */
  var toc = (function buildToc() {
    var host = $("#toc-list");
    var rail = $(".index__active");
    var sections = $$("main .sect[id]");
    if (!host || !sections.length) return null;

    var frag = document.createDocumentFragment();
    sections.forEach(function (s, i) {
      var title = s.getAttribute("data-title") || (s.querySelector("h2") || {}).textContent || s.id;
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + s.id;
      a.innerHTML = "<b>" + String(i + 1).padStart(2, "0") + "</b><span></span>";
      a.querySelector("span").textContent = title.trim();
      li.appendChild(a);
      frag.appendChild(li);
    });
    host.appendChild(frag);

    var links = $$("a", host);
    var current = -1;

    function setActive(idx) {
      if (idx === current) return;
      current = idx;
      links.forEach(function (a, i) {
        if (i === idx) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
      if (!rail) return;
      if (idx < 0) { rail.classList.remove("on"); return; }
      rail.classList.add("on");
      rail.style.setProperty("--y", links[idx].offsetTop + 5 + "px");
    }

    return { sections: sections, setActive: setActive, links: links };
  })();

  /* ------------------------------------------------- 滚动：进度条 / 曝光计 */
  (function onScroll() {
    var bar = $(".progress i");
    var meter = $(".meter");
    var cap = $(".meter__cap");
    var article = $("main");
    var topBtn = $(".totop");
    var ticking = false;

    function frame() {
      ticking = false;

      var y = window.pageYOffset || doc.scrollTop;
      var max = (doc.scrollHeight - window.innerHeight) || 1;
      var pGlobal = Math.min(1, Math.max(0, y / max));
      if (bar) bar.style.setProperty("--p", pGlobal.toFixed(4));

      if (meter && article) {
        var r = article.getBoundingClientRect();
        var total = Math.max(1, r.height - window.innerHeight * 0.72);
        var passed = Math.min(total, Math.max(0, -r.top + window.innerHeight * 0.28));
        var p = Math.min(1, passed / total);
        meter.style.setProperty("--p", p.toFixed(4));
        if (cap) cap.textContent = String(Math.round(p * 100)).padStart(2, "0") + "%";
      }

      if (topBtn) topBtn.classList.toggle("on", pGlobal > 0.06);

      if (toc) {
        var line = window.innerHeight * 0.32;
        var idx = -1;
        for (var i = 0; i < toc.sections.length; i++) {
          if (toc.sections[i].getBoundingClientRect().top <= line) idx = i;
        }
        toc.setActive(idx);
      }
    }

    function request() {
      if (!ticking) { ticking = true; requestAnimationFrame(frame); }
    }

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    frame();
  })();

  /* -------------------------------------------------------------- 进入揭示 */
  (function reveal() {
    if (reduced || !("IntersectionObserver" in window)) {
      $$(".rv").forEach(function (n) { n.classList.add("in"); });
      return;
    }
    var groups = $$(".hero, main .sect, main .cards");
    if (!groups.length) return;

    groups.forEach(function (group) {
      var items = Array.prototype.slice.call(
        group.children.length ? group.children : []
      ).filter(function (n) {
        return !n.classList.contains("sect") && n.tagName !== "SCRIPT";
      });
      items.forEach(function (n) { n.classList.add("rv"); });
    });

    var revealed = 0;
    var io = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.style.setProperty("--d", Math.min(batch, 5) * 55 + "ms");
        en.target.classList.add("in");
        batch++;
        revealed++;
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

    $$(".rv").forEach(function (n) { io.observe(n); });

    /* 兜底：若 1.5s 内一次都没触发（观察器被禁用、页面处于 prerender、
       或被自动化工具以不可见视口加载），把内容直接显示出来，绝不留下空白。 */
    setTimeout(function () {
      if (revealed > 0) return;
      $$(".rv").forEach(function (n) { n.classList.add("in"); });
    }, 1500);
  })();

  /* -------------------------------------------------------------- 手风琴 */
  (function acc() {
    $$(".qa__item").forEach(function (item) {
      var q = $(".qa__q", item);
      var a = $(".qa__a", item);
      if (!q || !a) return;
      var id = "qa-" + Math.random().toString(36).slice(2, 8);
      q.setAttribute("aria-expanded", "false");
      q.setAttribute("aria-controls", id);
      a.id = id;

      q.addEventListener("click", function () {
        var open = item.classList.contains("open");
        /* 同组互斥，页面更克制 */
        var siblings = item.parentNode.querySelectorAll(".qa__item.open");
        Array.prototype.forEach.call(siblings, function (s) {
          s.classList.remove("open");
          var sq = $(".qa__q", s);
          if (sq) sq.setAttribute("aria-expanded", "false");
        });
        item.classList.toggle("open", !open);
        q.setAttribute("aria-expanded", String(!open));
      });
    });
  })();

  /* ---------------------------------------------------------- 邮箱一键复制 */
  (function copy() {
    $$("[data-copy]").forEach(function (btn) {
      var tail = $(".chip__tail", btn);
      var label = $(".chip__tail b", btn);
      var original = label ? label.textContent : "";
      var timer = null;

      function fallback(text) {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:absolute;left:-9999px;top:0";
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta);
        return ok;
      }

      btn.addEventListener("click", function () {
        var value = btn.getAttribute("data-copy") || "";
        var done = function () {
          btn.classList.add("done", "is-anim");
          if (label) label.textContent = "已复制";
          if (tail) tail.setAttribute("aria-live", "polite");
          clearTimeout(timer);
          timer = setTimeout(function () {
            btn.classList.remove("done", "is-anim");
            if (label) label.textContent = original;
          }, 2400);
        };

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(value).then(done, function () {
            if (fallback(value)) done();
          });
        } else if (fallback(value)) {
          done();
        }
      });
    });
  })();

  /* -------------------------------------------------------------- 回到顶部 */
  (function toTop() {
    var btn = $(".totop");
    if (!btn) return;
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  })();

  /* -------------------------------------------------------------- 曝光计生成 */
  (function meter() {
    var host = $(".meter");
    if (!host) return;
    var N = 41;
    function row(cls) {
      var d = document.createElement("div");
      d.className = "meter__row" + (cls ? " " + cls : "");
      for (var i = 0; i < N; i++) {
        var t = i / (N - 1);
        /* 确定性曲线：不是随机，每次刷新都一致 */
        var h =
          0.30 +
          0.24 * Math.sin(t * 3.1 + 0.6) +
          0.16 * Math.sin(t * 7.7 + 2.1) +
          0.10 * Math.sin(t * 13.3 + 4.4);
        h = Math.min(1, Math.max(0.08, h));
        var bar = document.createElement("i");
        bar.style.setProperty("--h", h.toFixed(3));
        d.appendChild(bar);
      }
      return d;
    }
    host.appendChild(row());
    host.appendChild(row("meter__row--fill"));
  })();
})();
