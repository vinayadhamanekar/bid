/* Health Chain · BID v2. No dependencies.
   Every motion "before" state lives in CSS under `.motion` + `.is-armed`,
   which this script adds only when it can also play the motion. Without JS
   or with reduced motion, the page shows its final state. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;
  var animate = !reduce && hasIO;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function onceVisible(el, fn, threshold) {
    if (!el) return;
    if (!hasIO) { fn(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); fn(); } });
    }, { threshold: threshold || 0.2, rootMargin: "0px 0px -5% 0px" });
    io.observe(el);
  }

  /* ---------------- Header, menus, mobile nav ---------------- */
  var header = $("[data-header]");
  var bar = $("[data-progress]");
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 12);
    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty("--p", max > 0 ? Math.min(1, y / max) : 0);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  $$("[data-menu]").forEach(function (item) {
    var trigger = $(".nav-trigger", item);
    var timer;
    function setOpen(open) {
      item.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
    }
    trigger.addEventListener("click", function () { setOpen(!item.classList.contains("is-open")); });
    item.addEventListener("mouseenter", function () { clearTimeout(timer); setOpen(true); });
    item.addEventListener("mouseleave", function () { timer = setTimeout(function () { setOpen(false); }, 130); });
    item.addEventListener("focusout", function (e) { if (!item.contains(e.relatedTarget)) setOpen(false); });
    item.addEventListener("keydown", function (e) { if (e.key === "Escape") { setOpen(false); trigger.focus(); } });
    document.addEventListener("click", function (e) { if (!item.contains(e.target)) setOpen(false); });
  });

  var toggle = $("[data-nav-toggle]");
  var mobileNav = $("[data-mobile-nav]");
  if (toggle && mobileNav) {
    var setMobile = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      mobileNav.hidden = !open;
    };
    toggle.addEventListener("click", function () { setMobile(toggle.getAttribute("aria-expanded") !== "true"); });
    $$("a", mobileNav).forEach(function (a) { a.addEventListener("click", function () { setMobile(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !mobileNav.hidden) { setMobile(false); toggle.focus(); } });
    window.addEventListener("resize", function () { if (window.innerWidth >= 1000) setMobile(false); });
  }
  $$("[data-acc]").forEach(function (group) {
    var btn = $(".m-toggle", group), sub = $(".m-sub", group);
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      sub.hidden = !open;
    });
  });

  /* ---------------- Generic reveal ---------------- */
  var reveals = $$(".reveal");
  if (animate) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
        rio.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
    reveals.forEach(function (el) { rio.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Staggered groups: all cards appear together, ≤60ms apart (Visuals: fade-in cards) */
  function stagger(list, cls) {
    if (!list) return;
    $$(":scope > *", list).forEach(function (c, i) { c.style.setProperty("--i", i); });
    if (!animate) return;
    list.classList.add("is-armed");
    onceVisible(list, function () { list.classList.remove("is-armed"); list.classList.add(cls || "is-in"); }, 0.1);
  }
  $$("[data-cards]").forEach(function (l) { stagger(l); });
  stagger($("[data-chips]"));

  /* ---------------- Hero: two-bridge chart ---------------- */
  var bridge = $("[data-bridge]");
  if (bridge) {
    var rows = $$(".bc-row", bridge);
    var views = $$(".bc-views li", bridge);
    var replay = $("[data-bridge-replay]", bridge);
    var timers = [];
    // Which of the three totals each row "reaches": finance (0), regulatory (5), bid (7)
    var viewAt = { 0: 0, 5: 1, 7: 2 };
    var showAll = function () {
      rows.forEach(function (r) { r.classList.add("is-on"); });
      views.forEach(function (v) { v.classList.add("is-on"); });
    };
    var play = function () {
      timers.forEach(clearTimeout); timers = [];
      bridge.classList.add("is-armed");
      rows.forEach(function (r) { r.classList.remove("is-on"); });
      views.forEach(function (v) { v.classList.remove("is-on"); });
      if (replay) replay.hidden = true;
      rows.forEach(function (r, i) {
        timers.push(setTimeout(function () {
          r.classList.add("is-on");
          if (viewAt[i] !== undefined) views[viewAt[i]].classList.add("is-on");
        }, 200 + i * 260));
      });
      timers.push(setTimeout(function () { if (replay) replay.hidden = false; }, 200 + rows.length * 260 + 500));
    };
    if (animate) {
      bridge.classList.add("is-armed");
      onceVisible(bridge, function () { setTimeout(play, 350); }, 0.25);
      if (replay) replay.addEventListener("click", play);
      // gentle pointer tilt on fine pointers
      if (window.matchMedia("(pointer: fine)").matches) {
        var hero = bridge.closest(".hero"), raf;
        hero.addEventListener("pointermove", function (e) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(function () {
            var r = bridge.getBoundingClientRect();
            var x = (e.clientX - (r.left + r.width / 2)) / r.width;
            var y = (e.clientY - (r.top + r.height / 2)) / r.height;
            bridge.style.transform = "perspective(1200px) rotateY(" + (x * 3).toFixed(2) + "deg) rotateX(" + (-y * 3).toFixed(2) + "deg)";
          });
        });
        hero.addEventListener("pointerleave", function () { cancelAnimationFrame(raf); bridge.style.transform = ""; });
      }
    } else {
      showAll();
    }
  }

  /* ---------------- Problem visual (uses .reveal → .is-visible) ---------------- */

  /* ---------------- Three views: nodes and links light in order ---------------- */
  var chain = $("[data-chain]");
  if (chain) {
    var links = $$(":scope > li", chain);
    if (animate) {
      chain.classList.add("is-armed");
      onceVisible(chain, function () {
        links.forEach(function (li, i) { setTimeout(function () { li.classList.add("is-on"); }, i * 220); });
        setTimeout(function () { chain.classList.remove("is-armed"); }, links.length * 220 + 800);
      }, 0.25);
    }
  }

  /* ---------------- Reconciliation rail: scroll-spy ---------------- */
  var rail = $("[data-rail]");
  var spyLinks = $$("[data-spy]");
  if (rail && spyLinks.length && hasIO) {
    var byId = {};
    spyLinks.forEach(function (a) { byId[a.getAttribute("data-spy")] = a; });
    var setActive = function (link) {
      var passed = true;
      spyLinks.forEach(function (a) {
        var on = a === link;
        if (on) passed = false;
        a.classList.toggle("is-active", on);
        a.classList.toggle("is-done", passed && !on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
      rail.style.setProperty("--ind-y", link.offsetTop + "px");
      rail.style.setProperty("--ind-h", link.offsetHeight + "px");
    };
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting && byId[e.target.id]) setActive(byId[e.target.id]); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------------- Part 1 screen: load rows tick in ---------------- */
  $$(".screen").forEach(function (scr) {
    var items = $$(".loads li", scr);
    if (!items.length) return;
    items.forEach(function (li, i) { li.style.setProperty("--i", i); });
    if (!animate) return;
    scr.classList.add("is-armed");
    onceVisible(scr, function () { scr.classList.remove("is-armed"); }, 0.3);
  });

  /* ---------------- Part 2: allocated / contract switch (M10) ---------------- */
  var claim = $("[data-claim]");
  if (claim) {
    var sw = $$("[data-switch]", claim);
    var cps = $$("[data-cp]", claim);
    var select = function (key) {
      sw.forEach(function (b) {
        var on = b.getAttribute("data-switch") === key;
        b.setAttribute("aria-checked", String(on));
        b.tabIndex = on ? 0 : -1;
      });
      cps.forEach(function (c) { c.classList.toggle("is-active", c.getAttribute("data-cp") === key); });
    };
    sw.forEach(function (b, i) {
      b.addEventListener("click", function () { select(b.getAttribute("data-switch")); });
      b.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          var next = sw[(i + 1) % sw.length];
          select(next.getAttribute("data-switch")); next.focus(); e.preventDefault();
        }
      });
    });
    select("allocated");
  }

  /* ---------------- Ask it / Answer: shown immediately; Replay re-types ---------------- */
  $$("[data-qa]").forEach(function (qa) {
    var btn = $(".qa-replay", qa);
    var q = $(".qa-text", qa);
    if (!btn || !q) return;
    var full = q.textContent.replace(/\s+/g, " ").trim();
    var tid;
    if (reduce) { btn.hidden = true; return; }
    btn.addEventListener("click", function () {
      clearTimeout(tid);
      var i = 0;
      q.setAttribute("aria-label", full);
      qa.classList.add("is-replaying");
      q.classList.add("is-typing");
      (function next() {
        i++;
        q.textContent = full.slice(0, i);
        if (i < full.length) { tid = setTimeout(next, 24 + Math.random() * 18); return; }
        tid = setTimeout(function () { q.classList.remove("is-typing"); qa.classList.remove("is-replaying"); q.removeAttribute("aria-label"); }, 350);
      })();
    });
  });

  /* ---------------- Ledger: rows and gap bar fill once ---------------- */
  var ledger = $("[data-ledger]");
  if (ledger) {
    var lrows = $$("tbody tr", ledger);
    var segs = $$(".gap-bar span", ledger);
    if (animate) {
      ledger.classList.add("is-armed");
      onceVisible(ledger, function () {
        lrows.forEach(function (tr, i) {
          setTimeout(function () { tr.classList.add("is-on"); if (segs[i]) segs[i].classList.add("is-on"); }, 120 + i * 180);
        });
      }, 0.25);
    }
  }

  /* ---------------- Records drawer (interactive example) ----------------
     Illustrative sample records only. Amounts per $100 of finance cost,
     summing exactly to each ledger entry. Not customer data. */
  var ENTRIES = [
    {
      id: "no-claim", tab: "Care with no claim", kind: "Only in finance",
      title: "Care with no claim, such as nurse calls", amount: 20, open: false,
      method: "Matched on member, date, service and amount. These finance records have no matching claim, so they appear in the finance books but not in the regulatory report.",
      rows: [
        ["M-7F3A", "03 Sep", "Post-op nurse call", 6.40, null],
        ["M-2C91", "05 Sep", "Pre-op nurse call", 5.10, null],
        ["M-B044", "11 Sep", "Care coordination call", 4.70, null],
        ["M-9E17", "18 Sep", "Post-op nurse call", 3.80, null]
      ]
    },
    {
      id: "hospital", tab: "Hospital charges", kind: "Different amounts",
      title: "Hospital charges converted to cost", amount: 13, open: false,
      method: "Matched on member, date, service and amount. The same services are priced differently: the regulatory report converts hospital charges to cost.",
      rows: [
        ["M-4A28", "02 Sep", "Outpatient surgery, facility", 9.20, 4.60],
        ["M-61D0", "09 Sep", "Outpatient surgery, facility", 8.40, 4.30],
        ["M-C7B5", "16 Sep", "Outpatient surgery, facility", 7.10, 2.80]
      ]
    },
    {
      id: "contract", tab: "Contract rate", kind: "Different amounts",
      title: "Medical group contract rate", amount: 8, open: false,
      method: "Matched on member, date, service and amount. The regulatory report prices these services at the medical group contract rate.",
      rows: [
        ["M-3D6E", "04 Sep", "Surgeon fee, medical group", 5.30, 2.60],
        ["M-8B12", "12 Sep", "Anesthesia, medical group", 4.10, 1.40],
        ["M-E559", "23 Sep", "Surgeon fee, medical group", 4.90, 2.30]
      ]
    },
    {
      id: "review", tab: "Still under review", kind: "Open",
      title: "Still under review", amount: 4, open: true,
      method: "No cause confirmed yet. These records are shown as their own line, never forced to zero, and listed for your team to review.",
      rows: [
        ["M-5F80", "07 Sep", "Outpatient surgery, facility", 2.50, null],
        ["M-A2C4", "19 Sep", "Facility fee", 1.50, null]
      ]
    }
  ];

  var drawer = $("[data-drawer]");
  if (drawer) {
    var panel = $(".drawer-panel", drawer);
    var tabs = $("[data-d-tabs]", drawer);
    var lastFocus = null;
    var money = function (v) { return v == null ? "—" : "$" + v.toFixed(2); };

    ENTRIES.forEach(function (e) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = e.tab; b.setAttribute("data-tab", e.id);
      b.addEventListener("click", function () { render(e.id); });
      tabs.appendChild(b);
    });

    var render = function (id) {
      var e = ENTRIES.filter(function (x) { return x.id === id; })[0] || ENTRIES[0];
      $("[data-d-kind]", drawer).textContent = e.kind;
      $("[data-d-title]", drawer).textContent = e.title;
      $("[data-d-amount]", drawer).textContent = "$" + e.amount + " per $100";
      var st = $("[data-d-status]", drawer);
      st.textContent = e.open ? "Open, listed for your team to review" : "Explained";
      st.className = e.open ? "is-open" : "is-ok";
      $("[data-d-method]", drawer).textContent = e.method;
      var body = $("[data-d-rows]", drawer);
      body.innerHTML = "";
      var total = 0;
      e.rows.forEach(function (r, i) {
        var diff = r[3] - (r[4] || 0);
        total += diff;
        var tr = document.createElement("tr");
        tr.style.setProperty("--i", i);
        [r[0], r[1], r[2]].forEach(function (t, k) {
          var td = document.createElement("td"); td.textContent = t; if (k === 0) td.className = "mono"; tr.appendChild(td);
        });
        [r[3], r[4], diff].forEach(function (v) {
          var td = document.createElement("td"); td.className = "num" + (v == null ? " dash" : ""); td.textContent = money(v); tr.appendChild(td);
        });
        body.appendChild(tr);
      });
      $("[data-d-total]", drawer).textContent = money(total);
      $$("button", tabs).forEach(function (b) {
        if (b.getAttribute("data-tab") === e.id) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
      });
    };

    var open = function (id, opener) {
      lastFocus = opener || document.activeElement;
      render(id);
      drawer.hidden = false;
      document.body.classList.add("no-scroll");
      requestAnimationFrame(function () { requestAnimationFrame(function () { drawer.classList.add("is-open"); panel.focus(); }); });
    };
    var close = function () {
      drawer.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
      setTimeout(function () { drawer.hidden = true; }, reduce ? 0 : 380);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    $$("[data-entry]").forEach(function (b) { b.addEventListener("click", function () { open(b.getAttribute("data-entry"), b); }); });
    $$("[data-open-entry]").forEach(function (b) { b.addEventListener("click", function () { open(b.getAttribute("data-open-entry"), b); }); });
    $$("[data-drawer-close]", drawer).forEach(function (b) { b.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) {
      if (drawer.hidden) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key === "Tab") { // keep focus inside the dialog
        var f = $$("button, a[href]", panel).filter(function (x) { return x.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    });
  }

  /* ---------------- Configuration timeline ---------------- */
  var tl = $("[data-timeline]");
  if (tl) {
    var steps = $$(":scope > li", tl);
    if (animate) {
      tl.classList.add("is-armed");
      onceVisible(tl, function () {
        tl.classList.remove("is-armed");
        steps.forEach(function (li, i) { setTimeout(function () { li.classList.add("is-lit"); }, 250 + i * 380); });
      }, 0.35);
    } else {
      steps.forEach(function (li) { li.classList.add("is-lit"); });
    }
  }

  /* ---------------- How it works: line fills step to step ---------------- */
  var flow = $("[data-flow]");
  if (flow) {
    var fs = $$(".step", flow);
    if (animate) {
      flow.style.setProperty("--flow", 0);
      onceVisible(flow, function () {
        fs.forEach(function (s, i) {
          setTimeout(function () { s.classList.add("is-on"); flow.style.setProperty("--flow", i / (fs.length - 1)); }, 150 + i * 450);
        });
      }, 0.3);
    }
  }

  /* ---------------- Security: hashed id scrambles once ---------------- */
  var hashEl = $("[data-hash]");
  if (hashEl && animate) {
    onceVisible(hashEl, function () {
      var final = hashEl.textContent, hex = "0123456789abcdef", n = 0;
      var r4 = function () { var s = ""; for (var k = 0; k < 4; k++) s += hex.charAt(Math.floor(Math.random() * 16)); return s; };
      var t = setInterval(function () {
        hashEl.textContent = "# " + r4() + "…" + r4();
        if (++n > 14) { clearInterval(t); hashEl.textContent = final; }
      }, 55);
    }, 0.6);
  }

  /* ---------------- Closing ---------------- */
  var closing = $("[data-closing]");
  if (closing) onceVisible(closing, function () { closing.classList.add("is-in"); }, 0.2);

  var year = $("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
