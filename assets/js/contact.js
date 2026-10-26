/* ==========================================================================
   Contact: inquiry form.
   Checks the required fields, then opens the visitor's email app with the
   inquiry filled in. There is no server yet: to receive inquiries directly,
   point the form at a form service or the studio's own endpoint and replace
   the mailto step below.
   ========================================================================== */

(function () {
  'use strict';

  var P = window.P51;
  var form = P.qs('#inquiry-form');
  if (!form) return;
  var status = P.qs('#form-status');

  /* contact.html?type=Interiors preselects the project type */
  var type = new URLSearchParams(window.location.search).get('type');
  if (type) {
    P.qsa('option', form.type).forEach(function (o) { if (o.textContent === type) o.selected = true; });
  }

  var rules = {
    name: function (v) { return v ? '' : 'Please add your name.'; },
    contact: function (v) {
      if (!v) return 'Please add a phone number or email.';
      var email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      var phone = /^[+\d][\d\s-]{7,}$/.test(v);
      return email || phone ? '' : 'Please check the phone number or email.';
    },
    message: function (v) { return v ? '' : 'Please tell us a little about the project.'; }
  };

  function check(field) {
    var rule = rules[field.name];
    if (!rule) return true;
    var msg = rule(field.value.trim());
    var err = field.parentElement.querySelector('.field__error');
    field.setAttribute('aria-invalid', String(!!msg));
    if (err) err.textContent = msg;
    return !msg;
  }

  Object.keys(rules).forEach(function (name) {
    var f = form.elements[name];
    f.addEventListener('blur', function () { if (f.value) check(f); });
    f.addEventListener('input', function () { if (f.getAttribute('aria-invalid') === 'true') check(f); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = null;
    Object.keys(rules).forEach(function (name) {
      var f = form.elements[name];
      if (!check(f) && !firstBad) firstBad = f;
    });
    if (firstBad) {
      firstBad.focus();
      status.textContent = 'A few details are missing.';
      return;
    }

    var d = form.elements;
    var body = [
      'Name: ' + d.name.value.trim(),
      'Contact: ' + d.contact.value.trim(),
      'Site location: ' + (d.site.value.trim() || '-'),
      'Type of project: ' + d.type.value,
      '',
      d.message.value.trim()
    ].join('\n');
    var href = 'mailto:' + P.STUDIO_EMAIL +
      '?subject=' + encodeURIComponent('Inquiry: ' + d.type.value + ', ' + d.name.value.trim()) +
      '&body=' + encodeURIComponent(body);

    status.textContent = 'Opening your email app with the inquiry filled in.';
    window.location.href = href;
  });
})();
