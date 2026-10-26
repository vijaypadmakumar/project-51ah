/* ==========================================================================
   Project 51A(h): shared site script
   Defines window.P51 (helpers used by the page scripts), then on
   DOMContentLoaded sets up the phone menu, scroll reveals, blinds,
   parallax numbers and self-drawing lines.
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var scrollFns = [];

  /* Escape text for safe use inside HTML strings */
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* Build an image box. With no src it renders a labelled placeholder that
     names the photo needed and the path it should be saved to. */
  function media(opts) {
    var o = opts || {};
    var cls = 'media' + (o.cls ? ' ' + o.cls : '');
    var attrs = ' class="' + cls + '"';
    var style = (o.ar ? '--ar: ' + o.ar + ';' : '') + (o.style || '');
    if (style) attrs += ' style="' + esc(style) + '"';
    if (o.tone) attrs += ' data-tone="' + esc(o.tone) + '"';
    if (o.attrs) attrs += ' ' + o.attrs;

    if (o.src) {
      /* A missing file removes itself and leaves the plain tinted box */
      return '<div' + attrs + '><img src="' + esc(o.src) + '" alt="' + esc(o.alt || '') +
        '" loading="' + (o.eager ? 'eager' : 'lazy') + '" decoding="async" onerror="this.remove()"></div>';
    }
    return '<div' + attrs + ' role="img" aria-label="' + esc('Placeholder: ' + (o.alt || o.label || 'photograph')) + '">' +
      '<span class="ph__label">IMAGE · ' + esc(o.label || 'Photograph') +
      (o.path ? '<code>' + esc(o.path) + '</code>' : '') + '</span></div>';
  }

  /* Path of a project photo. An address written in the project's `images`
     wins; otherwise, once `photos: true` is set, the standard file name in
     assets/images/projects/<slug>/ is used, e.g. photo(p, 'cover'). */
  function photo(p, name) {
    if (p.images && p.images[name]) return p.images[name];
    return p.photos ? 'assets/images/projects/' + p.slug + '/' + name + '.jpg' : '';
  }

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* Reveal on scroll --------------------------------------------------- */

  var REVEAL = '.rv, .up, .bi, .wipe, .mask, [data-blinds]';
  var observer = null;

  function addBlinds(root) {
    qsa('[data-blinds]', root).forEach(function (el) {
      if (el.querySelector(':scope > .blinds')) return;
      var n = parseInt(el.getAttribute('data-blinds'), 10) || 12;
      var wrap = document.createElement('div');
      wrap.className = 'blinds';
      wrap.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < n; i++) {
        var s = document.createElement('span');
        s.style.setProperty('--d', ((n - 1 - i) * 40) + 'ms');
        wrap.appendChild(s);
      }
      el.appendChild(wrap);
    });
  }

  function reveal(root) {
    root = root || document;
    addBlinds(root);
    var els = qsa(REVEAL, root);
    if (root.matches && root.matches(REVEAL)) els.push(root);

    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    }
    els.forEach(function (el) {
      if (!el.classList.contains('is-in')) observer.observe(el);
    });
  }

  /* Scroll-linked effects --------------------------------------------- */

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  function onScroll(fn) { scrollFns.push(fn); }

  var ticking = false;
  function requestTick() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      var vh = window.innerHeight;
      for (var i = 0; i < scrollFns.length; i++) scrollFns[i](vh);
    });
  }

  /* Outlined numbers and the hero tile drift at a different speed.
     data-parallax="70" moves the element from +70px to -70px as its
     parent crosses the screen. */
  function setupParallax() {
    var els = qsa('[data-parallax]');
    if (!els.length) return;
    onScroll(function (vh) {
      if (reduceMotion.matches) return;
      els.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var amount = parseFloat(el.getAttribute('data-parallax')) || 60;
        if (window.innerWidth <= 720) amount *= 0.5;
        var p = clamp((vh - r.top) / (vh + r.height), 0, 1);
        el.style.transform = 'translate3d(0,' + (amount * (1 - 2 * p)).toFixed(1) + 'px,0)';
      });
    });
  }

  /* Lines in the dark bands draw themselves while the band scrolls in */
  function setupDraw() {
    var paths = qsa('.draw-line path');
    if (!paths.length) return;
    paths.forEach(function (p) {
      p.setAttribute('pathLength', '1');
      p.style.strokeDasharray = '1';
      p.style.strokeDashoffset = reduceMotion.matches ? '0' : '1';
    });
    onScroll(function (vh) {
      if (reduceMotion.matches) return;
      paths.forEach(function (p) {
        var r = p.closest('.band').getBoundingClientRect();
        var cover = (vh - r.top) / (vh + r.height);
        var prog = clamp((cover - 0.05) / 0.5, 0, 1);
        p.style.strokeDashoffset = (1 - prog).toFixed(3);
      });
    });
  }

  /* Numbers count up once when they scroll in: <dd data-count="24">24</dd> */
  function setupCount() {
    var els = qsa('[data-count]');
    if (!els.length || reduceMotion.matches || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        var el = entry.target;
        var end = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var t0 = null;
        (function step(t) {
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / 1400);
          var eased = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(end * eased) + suffix;
          if (k < 1) window.requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) {
      if (isNaN(parseFloat(el.getAttribute('data-count')))) return;
      el.textContent = '0' + (el.getAttribute('data-suffix') || '');
      io.observe(el);
    });
  }

  /* Phone menu --------------------------------------------------------- */

  function setupMenu() {
    var toggle = qs('.menu-toggle');
    var nav = qs('.site-header .site-nav');
    if (!toggle || !nav) return;

    var menu = document.createElement('div');
    menu.className = 'menu';
    menu.id = 'site-menu';
    menu.setAttribute('aria-label', 'Site menu');

    var links = document.createElement('nav');
    links.className = 'menu__links';
    links.setAttribute('aria-label', 'Menu');
    var foot = document.createElement('div');
    foot.className = 'menu__foot';

    qsa('a', nav).forEach(function (a) {
      var copy = a.cloneNode(true);
      if (a.classList.contains('btn')) {
        copy.classList.add('btn--lg');
        foot.appendChild(copy);
      } else {
        copy.className = '';
        links.appendChild(copy);
      }
    });
    var mail = document.createElement('a');
    mail.className = 'ul small';
    mail.href = 'mailto:' + P51.STUDIO_EMAIL;
    mail.textContent = P51.STUDIO_EMAIL;
    foot.appendChild(mail);

    menu.appendChild(links);
    menu.appendChild(foot);
    document.body.appendChild(menu);
    menu.inert = true;
    menu.setAttribute('aria-hidden', 'true');

    toggle.setAttribute('aria-controls', 'site-menu');
    toggle.setAttribute('aria-expanded', 'false');
    var label = qs('.menu-toggle__label', toggle);

    function setOpen(open) {
      document.documentElement.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Close' : 'Menu';
      menu.inert = !open;
      menu.setAttribute('aria-hidden', String(!open));
      if (open) {
        var first = qs('a', links);
        if (first) first.focus({ preventScroll: true });
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(!document.documentElement.classList.contains('menu-open'));
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.documentElement.classList.contains('menu-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 720 && document.documentElement.classList.contains('menu-open')) setOpen(false);
    });
  }

  /* Init --------------------------------------------------------------- */

  function init() {
    setupMenu();
    reveal(document);
    setupParallax();
    setupDraw();
    setupCount();
    qsa('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick);
    requestTick();
  }

  window.P51 = {
    /* Replace with the studio's real address before launch */
    STUDIO_EMAIL: 'studio@example.com',
    esc: esc,
    media: media,
    photo: photo,
    qs: qs,
    qsa: qsa,
    clamp: clamp,
    reveal: reveal,
    onScroll: onScroll,
    requestTick: requestTick,
    reduceMotion: reduceMotion
  };

  /* Scripts load with `defer`, so page scripts (home.js, work.js…) render
     their content before DOMContentLoaded fires and init() sees it all. */
  if (document.readyState === 'complete') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
