(function () {
  'use strict';

  var P = window.P51;
  var esc = P.esc;
  var list = window.P51_PROJECTS || [];
  if (!list.length) return;

  var slug = new URLSearchParams(window.location.search).get('p');
  var idx = Math.max(0, list.findIndex(function (p) { return p.slug === slug; }));
  var p = list[idx];
  var base = 'assets/images/projects/' + p.slug + '/';
  var imgs = p.images || {};

  document.title = p.name + ' · Project 51A(h)';
  var meta = document.querySelector('meta[name="description"]');
  if (meta && p.brief) meta.setAttribute('content', p.brief);

  /* An empty field shows a bracketed note naming what to write and where */
  function hint(what, field) {
    const hint_activate = true; // change this to remove placeholders
    if(hint_activate) {
      return '<span class="hint">[' + esc(what) + ']<code>Fill in: assets/js/projects-data.js › ' +
      esc(p.slug) + ' › ' + esc(field) + '</code></span>';
    } else {
      return "";
    }
  }
  function text(value, what, field) { return value ? esc(value) : hint(what, field); }

  /* Head */
  P.qs('#p-code').textContent = '51A(h) / ' + p.n;
  P.qs('#p-title > .mask > span').textContent = p.name;
  P.qs('#p-brief').innerHTML = text(p.brief, 'One sentence: who the project is for and the main idea', 'brief');

  /* Lead photo with blinds reveal */
  P.qs('#p-lead').innerHTML = P.media({
    src: P.photo(p, 'lead'),
    alt: p.name,
    label: 'Lead photo, the project’s defining view · 2:1, at least 2400 px wide',
    path: base + 'lead.jpg',
    cls: 'lead-media',
    tone: p.tone,
    eager: true,
    attrs: 'data-blinds'
  });

  /* Facts */
  var facts = [
    ['Place', p.place ? p.place + ', Kerala' : '', 'place'],
    ['Year', p.year, 'year'],
    ['Phase', p.phase, 'phase'],
    ['Built area', p.area, 'area'],
    ['Method', p.method, 'method'],
    ['Materials', p.materials, 'materials'],
    ['Photographs', p.photographer, 'photographer']
  ];
  P.qs('#p-facts').innerHTML = facts.map(function (f) {
    return '<div><dt>' + esc(f[0]) + '</dt><dd>' +
      (f[1] ? esc(f[1]) : '<span class="hint">[add ' + esc(f[2]) + ']</span>') + '</dd></div>';
  }).join('');

  /* Story chapters: one per block in the project's `story`, as many as it has.
     A block's step, title, text, caption and photo are all its own; the
     shared template only fills in the photo label and placeholder colour. */
  var template = window.P51_CHAPTERS || [];
  var blocks = (p.story && p.story.length) ? p.story : template.map(function () { return {}; });
  var tones = ['alt', 'tile', '1', '3'];
  P.qs('#p-chapters').innerHTML = blocks.map(function (s, i) {
    var t = template[i] || {};
    var num = (i + 1 < 10 ? '0' : '') + (i + 1);
    var field = 'story › block ' + (i + 1) + ' › ';
    var guide = t.text ? t.text.replace(/^\[|\]$/g, '') : 'The paragraph for this chapter';
    var figure = s.photo === false ? '' :
      '<figure>' +
      P.media({
        src: s.src || P.photo(p, 'chapter-' + (i + 1)),
        alt: s.caption || t.figure || s.title || p.name,
        label: ((!s.step || s.step === t.step) && t.figure ? t.figure : 'Photo for ' + (s.title || 'this chapter')) + ' · 2:1',
        path: base + 'chapter-' + (i + 1) + '.jpg',
        tone: t.tone || tones[i % tones.length],
        cls: 'wipe'
      }) +
      '<figcaption>' + text(s.caption, 'Caption for this photo', field + 'caption') + '</figcaption>' +
      '</figure>';
    return '<section class="container chapter" aria-labelledby="ch-' + num + '">' +
      '<div class="split rule-top">' +
      '<div class="chapter__text rv">' +
      '<span class="outline-num" data-parallax="60" aria-hidden="true">' + num + '</span>' +
      '<p class="tiny muted" style="margin-bottom: 10px">' + num + '&nbsp;&nbsp;' + text(s.step || t.step, 'Step name', field + 'step') + '</p>' +
      '<h2 class="h3" id="ch-' + num + '"><span class="mask"><span>' + text(s.title || t.title, 'Chapter heading', field + 'title') + '</span></span></h2>' +
      '</div>' +
      '<p class="rv">' + text(s.text, guide, field + 'text') + '</p>' +
      '</div>' +
      figure +
      '</section>';
  }).join('');

  /* Gallery */
  var gallery = (imgs.gallery && imgs.gallery.length) ? imgs.gallery : (window.P51_GALLERY || []).map(function (g) {
    var name = g.file.replace('.jpg', '');
    return {
      src: P.photo(p, name),
      label: g.label,
      caption: (p.captions && p.captions[name]) || '',
      field: "captions › '" + name + "'",
      tone: g.tone,
      path: base + g.file
    };
  });
  var stage = P.qs('#g-stage');
  var caption = P.qs('#g-caption');
  var pos = P.qs('#g-pos');
  var thumbs = P.qs('#g-thumbs');
  var cur = 0;

  thumbs.innerHTML = gallery.map(function (g, i) {
    var inner = g.src ? '<img src="' + esc(g.src) + '" alt="" loading="lazy" onerror="this.remove()">' : '';
    var tone = g.tone && g.tone !== '1' ? (g.tone === 'alt' || g.tone === 'tile' ? 'var(--' + g.tone + ')' : 'var(--ph' + g.tone + ')') : 'var(--ph)';
    return '<button type="button" data-i="' + i + '" aria-label="Show image ' + (i + 1) + ': ' + esc(g.label) + '" style="background: ' + tone + '">' + inner + '</button>';
  }).join('');
  var thumbBtns = P.qsa('button', thumbs);

  function show(i, animate) {
    cur = (i + gallery.length) % gallery.length;
    var g = gallery[cur];
    stage.innerHTML = P.media({ src: g.src, alt: g.alt || g.label, label: g.label, path: g.path, tone: g.tone, cls: animate ? 'swap' : '' });
    caption.innerHTML = g.caption ? esc(g.caption) : (g.field ? hint('Caption: ' + g.label, g.field) : esc(g.label));
    pos.textContent = (cur + 1) + ' / ' + gallery.length;
    thumbBtns.forEach(function (b, k) { b.setAttribute('aria-current', String(k === cur)); });
  }

  P.qs('#g-prev').addEventListener('click', function () { show(cur - 1, true); });
  P.qs('#g-next').addEventListener('click', function () { show(cur + 1, true); });
  thumbs.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-i]');
    if (b) show(parseInt(b.getAttribute('data-i'), 10), true);
  });
  P.qs('#gallery').addEventListener('keydown', function (e) {
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowLeft') { show(cur - 1, true); e.preventDefault(); }
    if (e.key === 'ArrowRight') { show(cur + 1, true); e.preventDefault(); }
  });

  /* Swipe on touch screens */
  var startX = null, startY = null;
  stage.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(cur + (dx < 0 ? 1 : -1), true);
    startX = null;
  });

  show(0, false);

  /* Previous / next */
  var prev = list[(idx - 1 + list.length) % list.length];
  var next = list[(idx + 1) % list.length];
  P.qs('#p-pager').innerHTML =
    '<a class="rv" href="project.html?p=' + encodeURIComponent(prev.slug) + '"><span class="small muted">← Previous, ' + esc(prev.n) + '</span><span class="pager__title">' + esc(prev.name) + '</span></a>' +
    '<a class="rv" href="project.html?p=' + encodeURIComponent(next.slug) + '"><span class="small muted">Next, ' + esc(next.n) + ' →</span><span class="pager__title">' + esc(next.name) + '</span></a>';
})();
