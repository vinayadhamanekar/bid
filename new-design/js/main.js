/* ==========================================================================
   Plumbline · main.js
   No dependencies. Everything here is front-end only: lookups, forms and the
   demo console do not call a back end yet.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- Navigation: scroll state, progress, scroll spy ---------------- */
  var nav = $('#nav');
  var bar = $('#progress-bar');
  var spyLinks = $$('.nav__links a.nav__link[href^="#"]');
  var spyTargets = spyLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      nav.classList.toggle('is-scrolled', y > 24);
      if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
      var mark = y + window.innerHeight * 0.35;
      var current = -1;
      spyTargets.forEach(function (t, i) { if (t && t.offsetTop <= mark) current = i; });
      spyLinks.forEach(function (a, i) { a.classList.toggle('is-current', i === current); });
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- Dropdown (hover on desktop, click/keyboard everywhere) ---------------- */
  $$('[data-dropdown]').forEach(function (group) {
    var btn = $('.nav__trigger', group);
    var closeTimer;
    function set(open) {
      group.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    }
    btn.addEventListener('click', function () { set(!group.classList.contains('is-open')); });
    group.addEventListener('mouseenter', function () { if (window.matchMedia('(hover: hover)').matches) { clearTimeout(closeTimer); set(true); } });
    group.addEventListener('mouseleave', function () { if (window.matchMedia('(hover: hover)').matches) { closeTimer = setTimeout(function () { set(false); }, 120); } });
    group.addEventListener('keydown', function (e) { if (e.key === 'Escape') { set(false); btn.focus(); } });
    group.addEventListener('focusout', function (e) { if (!group.contains(e.relatedTarget)) set(false); });
    document.addEventListener('click', function (e) { if (!group.contains(e.target)) set(false); });
    $$('a', group).forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
  });

  /* ---------------- Mobile sheet ---------------- */
  var burger = $('#burger');
  var sheet = $('#sheet');
  function setSheet(open) {
    sheet.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setSheet(sheet.hidden); });
  $$('a', sheet).forEach(function (a) { a.addEventListener('click', function () { setSheet(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) { setSheet(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 1020 && !sheet.hidden) setSheet(false); });

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------- Count-up numbers ---------------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    if (reduceMotion.matches) { el.textContent = target.toFixed(dec); return; }
    var start = null, dur = 1200;
    function step(t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = target.toFixed(dec); }, dur + 100);
  }
  var counters = $$('[data-count]');
  setTimeout(function () { counters.forEach(countUp); }, reduceMotion.matches ? 0 : 700);

  /* ---------------- Hero hex map (illustrative) ---------------- */
  var hexWrap = $('#hexmap');
  var readout = $('#hex-readout');
  var hexes = [];
  (function buildHexes() {
    if (!hexWrap) return;
    var cols = 12, rows = 6, r = 15, w = Math.sqrt(3) * r, h = 1.5 * r;
    var seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + (cols * w + w / 2 + 4) + ' ' + (rows * h + r / 2 + 6));
    var n = 0;
    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < cols; col++) {
        var dx = (col - cols / 2 + 0.5) / (cols / 2), dy = (row - rows / 2 + 0.5) / (rows / 2);
        if (dx * dx * 0.9 + dy * dy * 1.1 + (rnd() - 0.5) * 0.5 > 1.05) continue;
        var cx = col * w + (row % 2 ? w : w / 2) + 2, cy = row * h + r + 3;
        var pts = [];
        for (var k = 0; k < 6; k++) {
          var a = Math.PI / 180 * (60 * k - 30);
          pts.push((cx + (r - 1) * Math.cos(a)).toFixed(1) + ',' + (cy + (r - 1) * Math.sin(a)).toFixed(1));
        }
        n++;
        var share = Math.round((6 + rnd() * 40) * 10) / 10;
        var delta = Math.round((rnd() * 6 - 3.2) * 10) / 10;
        var mix = Math.min(1, share / 46);
        var p = document.createElementNS(ns, 'polygon');
        p.setAttribute('points', pts.join(' '));
        p.setAttribute('class', 'hex');
        p.style.setProperty('--h', 'color-mix(in srgb, #3B3FE0 ' + Math.round(14 + mix * 86) + '%, #EEF0FF)');
        p.style.setProperty('--hd', (n * 0.018 + 0.3).toFixed(2) + 's');
        p.dataset.label = 'County ' + String(n).padStart(2, '0') + ' · your share ' + share.toFixed(1) + '% · ' + (delta < 0 ? '▼ ' : '▲ ') + Math.abs(delta).toFixed(1) + ' pts';
        svg.appendChild(p);
        hexes.push(p);
      }
    }
    hexWrap.appendChild(svg);
  })();

  var autoHex = null, hexIdx = 0;
  function activateHex(el) {
    hexes.forEach(function (h) { h.classList.toggle('is-active', h === el); });
    if (readout && el) readout.textContent = el.dataset.label;
  }
  hexes.forEach(function (h) {
    h.addEventListener('mouseenter', function () { stopAutoHex(); activateHex(h); });
  });
  function stopAutoHex() { if (autoHex) { clearInterval(autoHex); autoHex = null; } }
  if (!reduceMotion.matches && hexes.length) {
    setTimeout(function () {
      autoHex = setInterval(function () {
        hexIdx = (hexIdx + 7) % hexes.length;
        activateHex(hexes[hexIdx]);
      }, 2200);
    }, 2000);
  }

  /* ---------------- Hero parallax (pointer devices only) ---------------- */
  var pRoot = $('[data-parallax-root]');
  if (pRoot && !reduceMotion.matches && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var layers = $$('[data-depth]', pRoot);
    var heroSec = $('.hero');
    heroSec.addEventListener('mousemove', function (e) {
      var rect = heroSec.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      layers.forEach(function (l) {
        var d = parseFloat(l.getAttribute('data-depth'));
        l.style.transform = 'translate3d(' + (-x * d).toFixed(1) + 'px,' + (-y * d).toFixed(1) + 'px,0)';
      });
    });
    heroSec.addEventListener('mouseleave', function () { layers.forEach(function (l) { l.style.transform = ''; }); });
  }

  /* ---------------- Ticker: duplicate list for a seamless loop ---------------- */
  var ticker = $('#ticker');
  if (ticker && !reduceMotion.matches) {
    var clone = ticker.firstElementChild.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    ticker.appendChild(clone);
  }

  /* ---------------- Lookups (demo only) ---------------- */
  $$('[data-lookup]').forEach(function (form) {
    var input = $('input', form);
    var status = $('[data-lookup-status]', form);
    var kind = form.getAttribute('data-lookup');
    var isV28 = !!$('#tool-v28', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (input.value || '').trim();
      var ok;
      if (kind === 'contract') { v = v.toUpperCase(); ok = /^[HRES]\d{4}$/.test(v); }
      else { ok = v.length > 1; }
      status.classList.remove('is-ok', 'is-error');
      if (!ok) {
        status.textContent = kind === 'contract' ? 'Enter a contract ID like H1234.' : 'Enter a county and state, e.g. Maricopa, AZ.';
        status.classList.add('is-error');
        input.setAttribute('aria-invalid', 'true');
        form.classList.remove('is-shake'); void form.offsetWidth; form.classList.add('is-shake');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      input.value = v;
      var what = kind === 'county' ? 'the market sheet for ' + v : (isV28 ? 'the V28 impact check for ' + v : 'the scorecard for ' + v);
      status.textContent = 'Building ' + what + ' from public CMS data. Demo only: this page has no back end yet.';
      status.classList.add('is-ok');
      if (form.hasAttribute('data-hero')) refreshScorecard(v);
    });
  });

  function refreshScorecard(id) {
    var idEl = $('#sc-id');
    var card = $('.scorecard');
    if (idEl) idEl.textContent = id;
    if (card) { card.classList.remove('is-refresh'); void card.offsetWidth; card.classList.add('is-refresh'); }
    counters.forEach(countUp);
  }

  /* ---------------- Data filters ---------------- */
  var sourceItems = $$('#sources li');
  var filterBtns = $$('.filter');
  function applyFilter(cat) {
    filterBtns.forEach(function (b) {
      var on = b.getAttribute('data-filter') === cat;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    var i = 0;
    sourceItems.forEach(function (li) {
      var show = cat === 'all' || li.getAttribute('data-cat') === cat;
      li.classList.toggle('is-hidden', !show);
      li.classList.remove('is-enter');
      if (show && !reduceMotion.matches) { li.style.animationDelay = (i++ * 0.04) + 's'; void li.offsetWidth; li.classList.add('is-enter'); }
    });
  }
  filterBtns.forEach(function (b) { b.addEventListener('click', function () { applyFilter(b.getAttribute('data-filter')); }); });
  $$('[data-filter-link]').forEach(function (a) { a.addEventListener('click', function () { applyFilter(a.getAttribute('data-filter-link')); }); });

  /* ---------------- Variance rows ---------------- */
  var vNote = $('#variance-note');
  $$('#variance .vrow').forEach(function (row, i, all) {
    row.addEventListener('click', function () {
      all.forEach(function (r) { r.classList.toggle('is-active', r === row); r.setAttribute('aria-pressed', String(r === row)); });
      var label = $('.vrow__l', row).textContent, val = $('.vrow__v', row).textContent;
      var dir = val.charAt(0) === '+' ? 'over' : 'under';
      vNote.textContent = label + ' · ' + val + ' ' + dir + ' bid. ' + row.getAttribute('data-note') + ' (Illustrative.)';
    });
    row.setAttribute('aria-pressed', 'false');
  });

  /* ---------------- Contact preselect + flash ---------------- */
  var programSel = $('#c-program');
  var contactCard = $('.finale__contact');
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-program]');
    if (!a || !programSel) return;
    programSel.value = a.getAttribute('data-program');
    setTimeout(function () {
      contactCard.classList.remove('is-flash'); void contactCard.offsetWidth; contactCard.classList.add('is-flash');
      var nameInput = $('#c-name');
      if (nameInput) nameInput.focus({ preventScroll: true });
    }, reduceMotion.matches ? 0 : 650);
  });

  /* ---------------- Forms (demo only) ---------------- */
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function setStatus(el, msg, ok) { el.textContent = msg; el.classList.toggle('is-ok', ok); el.classList.toggle('is-error', !ok); }

  var brief = $('#brief-form');
  if (brief) brief.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('#nl-email'), st = $('#brief-status');
    if ($('#nl-company').value) return; // honeypot
    if (!emailRe.test(email.value.trim())) { email.setAttribute('aria-invalid', 'true'); setStatus(st, 'Enter a valid work email.', false); email.focus(); return; }
    email.removeAttribute('aria-invalid');
    setStatus(st, 'Thanks. The first brief arrives next week. (Demo only: nothing was sent.)', true);
    brief.reset();
  });

  var contact = $('#contact-form');
  if (contact) contact.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#c-name'), email = $('#c-email'), st = $('#contact-status');
    var bad = null;
    [name, email].forEach(function (f) { f.removeAttribute('aria-invalid'); });
    if (!name.value.trim()) bad = name;
    else if (!emailRe.test(email.value.trim())) bad = email;
    if (bad) { bad.setAttribute('aria-invalid', 'true'); setStatus(st, bad === name ? 'Add your name.' : 'Enter a valid work email.', false); bad.focus(); return; }
    var prog = programSel.options[programSel.selectedIndex].text.toLowerCase();
    setStatus(st, 'Thanks, ' + name.value.trim().split(' ')[0] + '. We\'ll reply about ' + prog + ' within one business day. (Demo only: nothing was sent.)', true);
    contact.reset();
  });

  /* ---------------- Ask console ---------------- */
  var CH = window.PLUMB_CHAPTERS || [];
  var tabsEl = $('#ask-tabs'), panel = $('#ask-panel'), qsEl = $('#ask-questions'), titleEl = $('#console-title');
  var timers = [], curCh = 0, curQ = 0, started = false;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function renderTabs() {
    tabsEl.innerHTML = CH.map(function (c, i) {
      var links = (c.links || []).map(function (l) {
        return '<a href="' + esc(l.href) + '"' + (l.program ? ' data-program="' + esc(l.program) + '"' : '') + '>' + esc(l.label) + ' →</a>';
      }).join('');
      return '<div class="atab-item" style="--c:' + c.color + '">' +
        '<button type="button" class="atab" role="tab" id="atab-' + i + '" aria-controls="ask-panel" aria-selected="false" tabindex="-1">' +
          '<span class="atab__bar" aria-hidden="true"></span>' +
          '<span class="atab__num">' + esc(c.num) + '</span>' +
          '<span class="atab__world">' + esc(c.worldName) + '</span>' +
          '<span class="atab__title">' + esc(c.title) + '</span>' +
        '</button>' +
        '<div class="atab__more">' +
          '<p class="atab__about">' + esc(c.about) + '</p>' +
          '<div class="atab__details">' + c.details.map(function (d) { return '<span>' + esc(d) + '</span>'; }).join('') + '</div>' +
          '<p class="atab__stat">' + esc(c.stat) + '</p>' +
          '<div class="atab__links">' + links + '</div>' +
        '</div></div>';
    }).join('');
    $$('.atab', tabsEl).forEach(function (t, i, all) {
      t.addEventListener('click', function () { select(i, 0, true); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = null;
        if (k === 'ArrowDown' || k === 'ArrowRight') n = (i + 1) % all.length;
        if (k === 'ArrowUp' || k === 'ArrowLeft') n = (i - 1 + all.length) % all.length;
        if (k === 'Home') n = 0;
        if (k === 'End') n = all.length - 1;
        if (n !== null) { e.preventDefault(); all[n].focus(); select(n, 0, true); }
      });
    });
  }

  function blockHtml(b, color) {
    if (!b) return '';
    if (b.kind === 'rank') {
      return '<div class="blk-rank" style="--c:' + color + '">' + b.rows.map(function (r, i) {
        return '<div class="blk-rank__row"><span>' + esc(r.label) + '</span>' +
          '<span class="blk-rank__bar"><i style="width:' + Math.round(r.frac * 100) + '%;animation-delay:' + (i * 0.08) + 's"></i></span>' +
          '<span class="blk-rank__val">' + esc(r.val) + '</span>' +
          '<span class="blk-rank__delta' + (r.down ? ' is-down' : '') + '">' + esc(r.delta) + '</span></div>';
      }).join('') + '</div>';
    }
    if (b.kind === 'table') {
      return '<table class="blk-table"><thead><tr>' + b.cols.map(function (c) { return '<th scope="col">' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        b.rows.map(function (r, i) { return '<tr' + (i === b.hi ? ' class="is-hi"' : '') + '>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') +
        '</tbody></table>';
    }
    if (b.kind === 'stats') {
      return '<div class="blk-stats">' + b.items.map(function (s) { return '<div><span>' + esc(s.label) + '</span><b>' + esc(s.val) + '</b></div>'; }).join('') + '</div>';
    }
    return '';
  }

  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function play() {
    clearTimers();
    var c = CH[curCh], d = c.demo[curQ];
    var instant = reduceMotion.matches;
    panel.innerHTML = '<p class="msg-q">' + esc(d.q) + '</p><div class="acts"></div>';
    var actsEl = $('.acts', panel);
    var answer = '<div class="answer"><p class="answer__lead">' + esc(d.lead) + '</p>' + blockHtml(d.block, c.color) +
      '<div class="answer__srcs">' + d.srcs.map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('') + '</div></div>';
    if (instant) {
      actsEl.innerHTML = d.acts.map(function (a) { return '<p class="act is-done">' + esc(a) + '</p>'; }).join('');
      panel.insertAdjacentHTML('beforeend', answer);
      return;
    }
    var t = 450;
    d.acts.forEach(function (a, i) {
      later(function () {
        var prev = actsEl.lastElementChild; if (prev) prev.classList.add('is-done');
        actsEl.insertAdjacentHTML('beforeend', '<p class="act">' + esc(a) + '</p>');
      }, t + i * 650);
    });
    later(function () {
      var last = actsEl.lastElementChild; if (last) last.classList.add('is-done');
      panel.insertAdjacentHTML('beforeend', answer);
    }, t + d.acts.length * 650 + 250);
  }

  function renderQs() {
    var c = CH[curCh];
    qsEl.innerHTML = c.demo.map(function (d, i) {
      return '<button type="button" class="qchip" aria-pressed="' + (i === curQ) + '" data-q="' + i + '">' + esc(d.q) + '</button>';
    }).join('');
    $$('.qchip', qsEl).forEach(function (b) {
      b.addEventListener('click', function () { select(curCh, parseInt(b.getAttribute('data-q'), 10), true); });
    });
  }

  function select(ci, qi, run) {
    curCh = ci; curQ = qi;
    $$('.atab-item', tabsEl).forEach(function (item, i) {
      var on = i === ci;
      item.classList.toggle('is-active', on);
      var t = $('.atab', item);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', 'atab-' + ci);
    titleEl.textContent = 'Workspace · ' + CH[ci].worldName;
    renderQs();
    if (run) play();
  }

  if (CH.length && tabsEl) {
    renderTabs();
    select(0, 0, false);
    panel.innerHTML = '<p class="msg-q">' + esc(CH[0].demo[0].q) + '</p>';
    if ('IntersectionObserver' in window) {
      var askIO = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting && !started) { started = true; play(); askIO.disconnect(); }
      }, { threshold: 0.35 });
      askIO.observe($('.console'));
    } else { play(); }
  }
})();
