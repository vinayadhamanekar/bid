/* Health Chain · BID page, animated edition (index-animated.html).
   Navigation behaviour is the same as script.js; the rest adds explanatory,
   play-once motion. No dependencies.

   Every "before" state is CSS under `.motion` (set in <head>), so with
   reduced motion or no JS the page shows its final state. Here, T scales
   every delay: with reduced motion T = 0 and sequences complete instantly. */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;
  var T = reduceMotion ? 0 : 1;

  /* =====================================================================
     Reusable motion helpers
     ===================================================================== */

  // Run fn once, the first time el scrolls into view.
  function onceVisible(el, fn, threshold) {
    if (!el) return;
    if (!hasIO) { fn(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.disconnect();
        fn();
      });
    }, { threshold: threshold || 0.25, rootMargin: "0px 0px -6% 0px" });
    io.observe(el);
  }

  // setTimeout that runs immediately when there is no delay (reduced motion).
  function later(fn, ms, bag) {
    ms = ms * T;
    if (!ms) { fn(); return; }
    var id = setTimeout(fn, ms);
    if (bag) bag.push(id);
  }

  // Call step(item, i) for each item in turn, `gap` ms apart, after `start` ms.
  function sequence(items, gap, step, start, bag) {
    items.forEach(function (item, i) {
      later(function () { step(item, i); }, (start || 0) + i * gap, bag);
    });
    return (start || 0) + (items.length - 1) * gap;
  }

  function fmt(v) { return v < 0 ? "−" + Math.abs(v) : String(v); }

  // Count an element's text from its current value to data-count.
  function countUp(el, ms) {
    var to = parseFloat(el.getAttribute("data-count"));
    var from = el._v || 0;
    if (!T || !ms || !window.requestAnimationFrame) { el._v = to; el.textContent = fmt(to); return; }
    var t0 = performance.now();
    requestAnimationFrame(function tick(now) {
      var k = Math.min(1, (now - t0) / ms);
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(Math.round(from + (to - from) * e));
      if (k < 1) requestAnimationFrame(tick); else el._v = to;
    });
  }
  function resetCount(el) { el._v = 0; el.textContent = "0"; }

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function toArray(list) { return Array.prototype.slice.call(list); }

  /* =====================================================================
     Navigation (unchanged from script.js)
     ===================================================================== */

  var header = document.querySelector("[data-header]");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  document.querySelectorAll("[data-menu]").forEach(function (item) {
    var trigger = item.querySelector(".nav-trigger");
    var closeTimer;
    function setOpen(open) {
      item.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
      var labelLink = item.querySelector(".nav-split a");
      if (labelLink) trigger.setAttribute("aria-label", (open ? "Collapse " : "Expand ") + labelLink.textContent + " menu");
    }
    trigger.addEventListener("click", function () { setOpen(!item.classList.contains("is-open")); });
    item.addEventListener("mouseenter", function () { clearTimeout(closeTimer); setOpen(true); });
    item.addEventListener("mouseleave", function () { closeTimer = setTimeout(function () { setOpen(false); }, 130); });
    item.addEventListener("focusout", function (e) { if (!item.contains(e.relatedTarget)) setOpen(false); });
    item.addEventListener("keydown", function (e) { if (e.key === "Escape") { setOpen(false); trigger.focus(); } });
    item.querySelectorAll(".menu a").forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    document.addEventListener("click", function (e) { if (!item.contains(e.target)) setOpen(false); });
  });

  var toggle = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (toggle && mobileNav) {
    var setMobile = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      mobileNav.hidden = !open;
    };
    toggle.addEventListener("click", function () { setMobile(toggle.getAttribute("aria-expanded") !== "true"); });
    mobileNav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMobile(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !mobileNav.hidden) { setMobile(false); toggle.focus(); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth >= 768) setMobile(false); });
  }

  document.querySelectorAll("[data-acc]").forEach(function (group) {
    var btn = group.querySelector(".m-toggle");
    var sub = group.querySelector(".m-sub");
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", (open ? "Collapse " : "Expand ") + group.querySelector(".m-row a").textContent + " menu");
      sub.hidden = !open;
    });
  });

  document.querySelectorAll("[data-placeholder]").forEach(function (a) {
    a.title = a.getAttribute("data-placeholder");
    a.addEventListener("click", function (e) { e.preventDefault(); });
  });

  /* =====================================================================
     Scroll reveals (.reveal → .is-visible, once)
     ===================================================================== */

  var revealTargets = document.querySelectorAll(".reveal");
  if (hasIO && !reduceMotion) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    revealTargets.forEach(function (el) { revealer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* =====================================================================
     A · Hero cost walk: rows appear in order, values count, the line
     between the three views fills as the walk moves toward the bid.
     ===================================================================== */

  var walk = document.querySelector("[data-walk]");
  if (walk) {
    var wSteps = toArray(walk.querySelectorAll(".walk-step"));
    var wViews = toArray(walk.querySelectorAll(".walk-views li"));
    var wReplay = walk.querySelector(".walk-replay");
    var wTimers = [];

    // Which views are lit / how full each connector is after row i.
    var showViews = function (i) {
      wViews[0].classList.toggle("is-on", i >= 0);
      wViews[1].classList.toggle("is-on", i >= 2);
      wViews[2].classList.toggle("is-on", i >= wSteps.length - 1);
      wViews[0].style.setProperty("--fill", clamp01(i / 2));
      wViews[1].style.setProperty("--fill", clamp01((i - 2) / (wSteps.length - 3)));
    };
    var walkReset = function () {
      wTimers.forEach(clearTimeout);
      wTimers = [];
      wSteps.forEach(function (li) { li.classList.remove("is-on"); resetCount(li.querySelector("[data-count]")); });
      showViews(-1);
    };
    var walkPlay = function () {
      walkReset();
      if (wReplay) wReplay.hidden = true;
      var end = sequence(wSteps, 480, function (li, i) {
        li.classList.add("is-on");
        countUp(li.querySelector("[data-count]"), 600);
        showViews(i);
      }, 250, wTimers);
      if (wReplay && T) later(function () { wReplay.hidden = false; }, end + 900, wTimers);
    };

    if (T) walkReset();
    onceVisible(walk, function () { later(walkPlay, 450); }, 0.3);
    if (wReplay) wReplay.addEventListener("click", walkPlay);

    // Gentle pointer tilt (fine pointers only), as on the original page
    if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
      var hero = walk.closest(".hero");
      var frame;
      hero.addEventListener("pointermove", function (e) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(function () {
          var r = walk.getBoundingClientRect();
          var x = (e.clientX - (r.left + r.width / 2)) / r.width;
          var y = (e.clientY - (r.top + r.height / 2)) / r.height;
          walk.style.transform = "perspective(1200px) rotateY(" + (x * 4).toFixed(2) + "deg) rotateX(" + (-y * 4).toFixed(2) + "deg)";
        });
      });
      hero.addEventListener("pointerleave", function () { cancelAnimationFrame(frame); walk.style.transform = ""; });
    }
  }

  /* =====================================================================
     B · Data tags: staggered once ([data-stagger] children get --i)
     ===================================================================== */

  document.querySelectorAll("[data-stagger]").forEach(function (list) {
    toArray(list.children).forEach(function (child, i) { child.style.setProperty("--i", i); });
    onceVisible(list, function () { list.classList.add("is-in"); }, 0.2);
  });

  /* =====================================================================
     C · Module rail: sliding indicator on the module in view
     ===================================================================== */

  var rail = document.querySelector("[data-rail]");
  var spyLinks = toArray(document.querySelectorAll("[data-spy]"));
  if (rail && spyLinks.length && hasIO) {
    var active = null;
    var placeIndicator = function () {
      if (!active) return;
      rail.style.setProperty("--ind-y", active.offsetTop + "px");
      rail.style.setProperty("--ind-h", active.offsetHeight + "px");
      rail.classList.add("has-ind");
    };
    var setActive = function (link) {
      active = link;
      var passed = true;
      spyLinks.forEach(function (a) {
        var on = a === link;
        if (on) passed = false;
        a.classList.toggle("is-active", on);
        a.classList.toggle("is-done", passed && !on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
      placeIndicator();
    };
    var linkFor = {};
    spyLinks.forEach(function (a) { linkFor[a.getAttribute("data-spy")] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && linkFor[entry.target.id]) setActive(linkFor[entry.target.id]);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(linkFor).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
    window.addEventListener("resize", placeIndicator);
  }

  /* =====================================================================
     D · Ask it / Answer: type the question, then reveal the answer.
     Each pair plays once when it is mostly in view. Clicking the card
     shows everything at once. Screen readers get the full text throughout.
     ===================================================================== */

  var makeTypeable = function (el) {
    var text = el.textContent.replace(/\s+/g, " ").trim();
    el.textContent = "";
    el.classList.add("qa-type");
    var ghost = document.createElement("span");
    ghost.className = "qa-ghost";
    ghost.setAttribute("aria-hidden", "true");
    ghost.textContent = text;
    var live = document.createElement("span");
    live.className = "qa-live";
    live.setAttribute("aria-hidden", "true");
    var sr = document.createElement("span");
    sr.className = "sr-only";
    sr.textContent = text;
    el.append(ghost, live, sr);
    return { el: el, live: live, text: text };
  };

  if (T && hasIO) {
    document.querySelectorAll(".qa").forEach(function (qa) {
      var question = qa.querySelector(".qa-q em");
      var answerRow = qa.querySelector(".qa-a");
      var tag = answerRow && answerRow.querySelector(".qa-tag");
      if (!question || !tag) return;

      var answer = document.createElement("span");
      answer.className = "qa-answer";
      while (tag.nextSibling) answer.appendChild(tag.nextSibling);
      answerRow.appendChild(answer);

      var q = makeTypeable(question);
      var done = false;
      var finish = function () {
        if (done) return;
        done = true;
        q.live.textContent = q.text;
        q.el.classList.remove("is-typing");
        qa.classList.remove("is-pending");
        qa.classList.add("is-answered");
      };
      qa.classList.add("is-pending");
      qa.addEventListener("click", finish);

      onceVisible(qa, function () {
        var i = 0;
        q.el.classList.add("is-typing");
        setTimeout(function next() {
          if (done) return;
          i++;
          q.live.textContent = q.text.slice(0, i);
          if (i >= q.text.length) { setTimeout(finish, 420); return; }
          var ch = q.text.charAt(i - 1);
          setTimeout(next, 30 * (0.7 + Math.random() * 0.6) + (/[,.?;:]/.test(ch) ? 140 : 0));
        }, 300);
      }, 0.6);
    });
  }

  /* =====================================================================
     E · Cost walk module: journey between the views, then the ledger
     row by row, each row filling its share of the difference bar.
     ===================================================================== */

  var journey = document.querySelector("[data-journey]");
  if (journey) {
    onceVisible(journey, function () {
      sequence(toArray(journey.children), 380, function (el) { el.classList.add("is-on"); }, 150);
    }, 0.5);
  }

  var ledger = document.querySelector("[data-ledger]");
  if (ledger) {
    var rows = toArray(ledger.querySelectorAll(".cw-ledger tbody tr"));
    var segs = toArray(ledger.querySelectorAll(".cw-gap-bar span"));
    var explained = ledger.querySelector("[data-explained]");
    if (T) {
      rows.forEach(function (tr) { resetCount(tr.querySelector("[data-count]")); });
      if (explained) resetCount(explained);
    }
    onceVisible(ledger, function () {
      var total = 0;
      var end = sequence(rows, 650, function (tr, i) {
        var num = tr.querySelector("[data-count]");
        tr.classList.add("is-on");
        countUp(num, 500);
        if (segs[i]) segs[i].classList.add("is-on");
        if (explained && !tr.classList.contains("is-residual")) {
          total += parseFloat(num.getAttribute("data-count"));
          explained.setAttribute("data-count", total);
          countUp(explained, 500);
        }
      }, 200);
      later(function () { ledger.classList.add("is-done"); }, end + 500);
    }, 0.35);
  }

  /* =====================================================================
     F · The connection: Encounter → Claim → Bid, driven by scroll.
     Progress only moves forward, so scrolling back up never replays it.
     ===================================================================== */

  var chainWrap = document.querySelector("[data-chain-wrap]");
  if (chainWrap) {
    var cNodes = toArray(chainWrap.querySelectorAll(".chain-node"));
    var cLinks = toArray(chainWrap.querySelectorAll(".chain-link"));
    var cBase = chainWrap.querySelector(".chain-base");
    var pMax = 0;

    var applyChain = function (p) {
      var on = [p > 0.02, p >= 0.36, p >= 0.7];
      var current = -1;
      cNodes.forEach(function (n, i) { n.classList.toggle("is-on", on[i]); if (on[i]) current = i; });
      cNodes.forEach(function (n, i) { n.classList.toggle("is-current", i === current && p < 1); });
      var fills = [clamp01((p - 0.1) / 0.24), clamp01((p - 0.44) / 0.24)];
      cLinks.forEach(function (l, i) {
        l.querySelector(".chain-track").style.setProperty("--fill", fills[i]);
        l.classList.toggle("is-on", fills[i] >= 1);
      });
      if (cBase) cBase.classList.toggle("is-on", p >= 0.84);
    };

    if (!T || !hasIO) {
      applyChain(1);
    } else {
      var ticking = false;
      var measure = function () {
        ticking = false;
        var r = chainWrap.getBoundingClientRect();
        var vh = window.innerHeight;
        var p = clamp01((vh * 0.85 - r.top) / (r.height + vh * 0.1));
        if (p <= pMax) return;
        pMax = p;
        applyChain(pMax);
        if (pMax >= 1) stopChain();
      };
      var onChainScroll = function () {
        if (!ticking) { ticking = true; requestAnimationFrame(measure); }
      };
      var stopChain = function () {
        window.removeEventListener("scroll", onChainScroll);
        window.removeEventListener("resize", onChainScroll);
        chainIO.disconnect();
      };
      applyChain(0);
      // Only listen to scroll while the section is near the viewport.
      var chainIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            window.addEventListener("scroll", onChainScroll, { passive: true });
            window.addEventListener("resize", onChainScroll);
            onChainScroll();
          } else {
            window.removeEventListener("scroll", onChainScroll);
            window.removeEventListener("resize", onChainScroll);
            // Jumped past the section (e.g. an anchor link): show it complete.
            if (entry.boundingClientRect.bottom < 0) { pMax = 1; applyChain(1); stopChain(); }
          }
        });
      });
      chainIO.observe(chainWrap);
    }
  }

  /* =====================================================================
     H · Configuration timeline: captured → confirmed → frozen → versioned,
     once. The line runs to each dot and the dot lights as it arrives.
     ===================================================================== */

  var timeline = document.querySelector("[data-timeline]");
  if (timeline) {
    var tlItems = toArray(timeline.children);
    var tlLast = -1;
    var tlFillTo = function (i) {
      var dot = tlItems[i].querySelector(".tl-dot");
      var t = timeline.getBoundingClientRect();
      var d = dot.getBoundingClientRect();
      // the line starts 14px from the top (see .timeline::after in style.css)
      timeline.style.setProperty("--tl-fill", Math.max(0, d.top + d.height / 2 - t.top - 14) + "px");
    };
    timeline.classList.add("tl-run");
    onceVisible(timeline, function () {
      var end = sequence(tlItems, 900, function (li, i) {
        tlFillTo(i);
        later(function () {
          tlItems.forEach(function (x) { x.classList.remove("is-current"); });
          li.classList.add("is-lit", "is-current");
          tlLast = i;
        }, 450);
      }, 500);
      later(function () { tlItems.forEach(function (x) { x.classList.remove("is-current"); }); }, end + 1800);
    }, 0.4);
    window.addEventListener("resize", function () { if (tlLast >= 0) tlFillTo(tlLast); });
  }

  /* =====================================================================
     J · How it works: Connect → Configure → Trace, the line fills between.
     ===================================================================== */

  var flow = document.querySelector("[data-flow]");
  if (flow) {
    var fSteps = toArray(flow.querySelectorAll(".step"));
    if (T) flow.style.setProperty("--flow", 0);
    onceVisible(flow, function () {
      sequence(fSteps, 750, function (step, i) {
        step.classList.add("is-on");
        if (i > 0) {
          flow.style.setProperty("--flow", i / (fSteps.length - 1)); // desktop: one line across
          fSteps[i - 1].classList.add("is-linked");                  // phone: line into this step
        }
      }, 150);
    }, 0.3);
  }

  /* =====================================================================
     K · Security: build the picture once, de-identify the member id,
     then link each point in the list to its part of the picture.
     ===================================================================== */

  var secVisual = document.querySelector("[data-sec-visual]");
  if (secVisual) {
    var svParts = toArray(secVisual.querySelectorAll("[data-sv]"));
    var hashEl = secVisual.querySelector("[data-hash]");
    var dataRow = secVisual.querySelector(".sv-data");
    var scramble = function () {
      var final = hashEl.textContent;
      var hex = "0123456789abcdef";
      var n = 0;
      var tick = setInterval(function () {
        var s = "# ";
        for (var k = 0; k < 4; k++) s += hex.charAt(Math.floor(Math.random() * 16));
        s += "…";
        for (k = 0; k < 4; k++) s += hex.charAt(Math.floor(Math.random() * 16));
        hashEl.textContent = s;
        if (++n > 12) { clearInterval(tick); hashEl.textContent = final; dataRow.classList.add("is-hashed"); }
      }, 55);
    };
    onceVisible(secVisual, function () {
      sequence(svParts, 300, function (part) {
        part.classList.add("is-on");
        if (part === dataRow) { if (T) later(scramble, 250); else dataRow.classList.add("is-hashed"); }
      }, 300);
    }, 0.3);

    document.querySelectorAll("[data-sv-focus]").forEach(function (item) {
      item.addEventListener("mouseenter", function () { secVisual.setAttribute("data-focus", item.getAttribute("data-sv-focus")); });
      item.addEventListener("mouseleave", function () { secVisual.removeAttribute("data-focus"); });
    });
  }

  /* =====================================================================
     L · Closing: background settles as the section arrives
     ===================================================================== */

  var closing = document.querySelector("[data-closing]");
  if (closing) onceVisible(closing, function () { closing.classList.add("is-in"); }, 0.2);

  /* ---------- Footer year ---------- */
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
