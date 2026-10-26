/* ==========================================================================
   Practice: the four values of Article 51A(h) as accessible tabs.
   Click, or use the arrow keys, Home and End when a tab has focus.
   ========================================================================== */

(function () {
  'use strict';

  var P = window.P51;

  P.qsa('[data-tabs]').forEach(function (root) {
    var tabs = P.qsa('[role="tab"]', root);

    function select(i, focus) {
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (!panel) return;
        panel.hidden = !on;
        if (on) {
          panel.classList.remove('fade-swap');
          void panel.offsetWidth; /* restart the fade */
          panel.classList.add('fade-swap');
        }
      });
      if (focus) tabs[i].focus();
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false); });
      t.addEventListener('keydown', function (e) {
        var n = tabs.length;
        var k = null;
        if (e.key === 'ArrowRight') k = (i + 1) % n;
        if (e.key === 'ArrowLeft') k = (i - 1 + n) % n;
        if (e.key === 'Home') k = 0;
        if (e.key === 'End') k = n - 1;
        if (k !== null) { e.preventDefault(); select(k, true); }
      });
    });
  });
})();
