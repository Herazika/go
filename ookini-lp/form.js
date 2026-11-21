/* 申込フォーム・継続フォーム共通の送信処理。
   送信先は Apps Script（社内用台帳の「受付」タブに1行追記するだけ）。
   台帳本体・DB照合・案内メールは Air の ookini_intake.py が1分ごとに処理する。 */
(function () {
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbykq_EJ65v_cjqFDzcfMopdJRg_vv6kZ7BPW9W2ueYcmjC8rwcCV8ELHKC2Cgvl8Zv48A/exec';
  var EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

  function fieldOf(el) { return el.closest('.field'); }
  function setErr(el, on) { var f = fieldOf(el); if (f) f.classList.toggle('err', !!on); }

  window.OokiniForm = {
    validEmail: function (v) { return v.length <= 254 && EMAIL_RE.test(v); },
    setErr: setErr,
    clearErrors: function (form) {
      Array.prototype.forEach.call(form.querySelectorAll('.field.err'), function (f) { f.classList.remove('err'); });
    },
    send: function (payload) {
      var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
      return fetch(ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload),   // text/plain のまま送る（プリフライトを起こさない）
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (r) { return r.json(); })
        .finally(function () { clearTimeout(timer); });
    }
  };
})();
