/* ==========================================================================
   Home: Selected Work as sticky stacking cards, with a sticky index that
   highlights the card currently on top. Projects marked `featured: true`
   in projects-data.js are shown (up to four).
   ========================================================================== */

(function () {
  'use strict';

  var P = window.P51;
  var esc = P.esc;
  var list = (window.P51_PROJECTS || []).filter(function (p) { return p.featured; }).slice(0, 4);
  var wrap = P.qs('.stack-work');
  var index = P.qs('#stack-index');
  var cards = P.qs('#stack-cards');
  if (!wrap || !index || !cards || !list.length) return;

  var arrow = '<svg class="arrow" aria-hidden="true" width="28" height="10" viewBox="0 0 28 10" fill="none" stroke="var(--accent)" stroke-width="1.2"><path d="M0 5 H26 M21 1 L26 5 L21 9"></path></svg>';

  index.innerHTML = list.map(function (p, i) {
    return '<a href="#card-' + i + '" data-i="' + i + '"' + (i === 0 ? ' class="is-active"' : '') + '>' +
      '<span>' + esc(p.n) + '</span><span>' + esc(p.name) + '</span></a>';
  }).join('') + '<a class="ul" href="work.html">All projects →</a>';

  cards.innerHTML = list.map(function (p, i) {
    var img = P.media({
      src: P.photo(p, 'card'),
      alt: p.name,
      label: p.cardShot + ' · fills the card, landscape 3:2, at least 2000 px wide',
      path: 'assets/images/projects/' + p.slug + '/card.jpg',
      tone: p.tone,
      cls: 'zoom'
    });
    return '<span class="stack-sentinel" aria-hidden="true" style="display:block;height:0"></span>' +
      '<a id="card-' + i + '" class="stack-card" href="project.html?p=' + encodeURIComponent(p.slug) + '" style="--i: ' + i + '">' +
      img +
      '<span class="outline-num" aria-hidden="true">' + esc(p.n) + '</span>' +
      '<span class="stack-card__bar">' +
      '<span><span class="stack-card__title">' + esc(p.name) + '</span>' +
      '<span class="stack-card__meta">' + esc(p.place) + ' · ' + esc(p.year) + ' · ' + esc(p.method) + '</span></span>' +
      '<span class="stack-card__cta">View project' + arrow + '</span>' +
      '</span></a>';
  }).join('');

  var links = P.qsa('a[data-i]', index);
  var sentinels = P.qsa('.stack-sentinel', cards);
  var cardEls = P.qsa('.stack-card', cards);

  function stickTop(i) {
    var base = parseFloat(getComputedStyle(wrap).getPropertyValue('--stick')) || 96;
    var step = window.innerWidth <= 760 ? 12 : 16;
    return base + i * step;
  }

  /* The card whose natural position has scrolled up past half its height
     over the previous card counts as the current one. */
  var current = 0;
  P.onScroll(function () {
    var h = cardEls[0].offsetHeight;
    var active = 0;
    sentinels.forEach(function (s, i) {
      if (s.getBoundingClientRect().top <= stickTop(i) + h * 0.5) active = i;
    });
    if (active === current) return;
    current = active;
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === active); });
  });

  /* Index links scroll to where each card settles, not to its stuck position */
  links.forEach(function (a, i) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var y = window.scrollY + sentinels[i].getBoundingClientRect().top - stickTop(i);
      window.scrollTo({ top: y, behavior: P.reduceMotion.matches ? 'auto' : 'smooth' });
      cardEls[i].focus({ preventScroll: true });
    });
  });
})();
