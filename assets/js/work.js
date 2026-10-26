/* ==========================================================================
   Work: filter by method and switch between grid and list.
   The current filter and view are kept in the address (?m=Reuse&view=list)
   so a filtered list can be shared.
   ========================================================================== */

(function () {
  'use strict';

  var P = window.P51;
  var esc = P.esc;
  var all = window.P51_PROJECTS || [];
  var methods = ['All'].concat(window.P51_METHODS || []);

  var filtersEl = P.qs('#filters');
  var results = P.qs('#work-results');
  var countEl = P.qs('#work-count');
  var viewBtns = P.qsa('[data-view]');
  if (!filtersEl || !results) return;

  var params = new URLSearchParams(window.location.search);
  var state = {
    m: methods.indexOf(params.get('m')) > -1 ? params.get('m') : 'All',
    view: params.get('view') === 'list' ? 'list' : 'grid'
  };

  function shown() {
    return state.m === 'All' ? all : all.filter(function (p) { return p.method === state.m; });
  }

  function href(p) { return 'project.html?p=' + encodeURIComponent(p.slug); }

  function renderFilters() {
    filtersEl.innerHTML = methods.map(function (m) {
      var n = m === 'All' ? all.length : all.filter(function (p) { return p.method === m; }).length;
      return '<button type="button" data-m="' + esc(m) + '" aria-pressed="' + (m === state.m) + '">' +
        esc(m) + ' <sup>' + n + '</sup></button>';
    }).join('');
  }

  function renderGrid(list) {
    return '<div class="project-grid">' + list.map(function (p, i) {
      return '<a class="project-tile" href="' + href(p) + '">' +
        P.media({
          src: P.photo(p, 'cover'),
          alt: p.name,
          label: 'Cover photo, exterior · 16:9',
          path: 'assets/images/projects/' + p.slug + '/cover.jpg',
          ar: '16 / 9',
          tone: p.tone,
          cls: 'zoom wipe',
          style: '--delay: ' + ((i % 2) * 150) + 'ms'
        }) +
        '<span class="project-tile__meta"><span>' + esc(p.name) +
        '<span class="muted"> · ' + esc(p.place) + ', ' + esc(p.year) + '</span></span>' +
        '<span>' + esc(p.n) + '</span></span></a>';
    }).join('') + '</div>';
  }

  function renderList(list) {
    return '<div class="table-wrap"><table class="project-table">' +
      '<thead><tr><th scope="col">No.</th><th scope="col">Project</th><th scope="col">Place</th>' +
      '<th scope="col">Method</th><th scope="col">Area</th><th scope="col">Phase</th><th scope="col">Year</th></tr></thead><tbody>' +
      list.map(function (p, i) {
        return '<tr class="rv" style="--delay: ' + Math.min(i * 80, 480) + 'ms">' +
          '<td>' + esc(p.n) + '</td>' +
          '<td class="name"><a class="ul" href="' + href(p) + '">' + esc(p.name) + '</a></td>' +
          '<td class="place">' + esc(p.place) + '</td>' +
          '<td class="hide-sm">' + esc(p.method) + '</td>' +
          '<td class="hide-sm">' + esc(p.area) + '</td>' +
          '<td class="hide-sm">' + esc(p.phase) + '</td>' +
          '<td>' + esc(p.year) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function render() {
    var list = shown();
    results.innerHTML = list.length
      ? (state.view === 'grid' ? renderGrid(list) : renderList(list))
      : '<p class="empty-state">No projects in this group yet.</p>';
    countEl.textContent = list.length + (list.length === 1 ? ' project' : ' projects') +
      (state.m === 'All' ? ', 2021 to now' : ', ' + state.m.toLowerCase());
    viewBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-view') === state.view)); });
    P.qsa('button', filtersEl).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-m') === state.m)); });
    P.reveal(results);
  }

  function syncUrl() {
    var q = new URLSearchParams();
    if (state.m !== 'All') q.set('m', state.m);
    if (state.view !== 'grid') q.set('view', state.view);
    var s = q.toString();
    history.replaceState(null, '', window.location.pathname + (s ? '?' + s : ''));
  }

  filtersEl.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-m]');
    if (!b) return;
    state.m = b.getAttribute('data-m');
    syncUrl();
    render();
  });
  viewBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      state.view = b.getAttribute('data-view');
      syncUrl();
      render();
    });
  });

  renderFilters();
  render();
})();
