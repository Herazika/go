/* 京大おおきに先生×ヤルッキャ LP・申込フォームの計測（GA4 本体プロパティ 352516582、ストリーム G-DRLSHF02JK）
   2026-11-28 追加。読み込むページ: 新規LP / 既存LP（herazika.com の iframe の中身）、申込フォーム、継続フォーム。

   GA4 で見るときは hostName = herazika.github.io かつ pagePath が /go/ookini-lp/ で始まるもので絞る。
     /go/ookini-lp/          新規LP（herazika.com/ookini の中身）
     /go/ookini-lp/yarukya/  既存LP（herazika.com/ookini-yarukya の中身）
     /go/ookini-lp/apply/    申込フォーム（既存）
     /go/ookini-lp/continue/ 継続フォーム

   イベント名（パラメータを使わず名前だけで集計できるようにしている。カスタムディメンションの登録が要らない）:
     ookini_sec_<区画>         その区画が画面の上6割に入った（1回の表示で各1回）。区画は各 section の data-ga
     ookini_cta_<区画>         その区画の申込／登録ボタンを押した（追従ボタンは ookini_cta_sticky）
     ookini_video_play_<k|t|y> 体験談の動画を再生した／ookini_video_end_<k|t|y> 最後まで見た
     ookini_apply_nocode       申込フォームを ?k= なしで開いた（「お届けしたリンクから開いてください」画面）
     ookini_form_start         フォームに初めて触れた
     ookini_form_invalid       送信したが入力に不備があった
     ookini_form_done          受付まで届いた（台帳の受付タブに1行入った）
     ookini_form_fail          通信などで送れなかった

   個人情報を送らない: ?k=（友達招待コード）は page_location / page_referrer から外す。入力内容は送らない。
   iframe の中なので Cookie は SameSite=None;Secure。Safari などは iframe の中の Cookie を拒むので、人数は多めに出る（回数は正しい）。 */
(function () {
  var ID = 'G-DRLSHF02JK';
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.appendChild(s);

  function strip(u) { return (u || '').split('?')[0].split('#')[0]; }
  gtag('js', new Date());
  gtag('config', ID, {
    page_location: strip(location.href),
    page_referrer: strip(document.referrer),
    cookie_flags: 'SameSite=None;Secure'
  });

  var sent = {};
  function track(name, once) {
    if (once && sent[name]) return;
    sent[name] = true;
    gtag('event', name, { transport_type: 'beacon' });
  }
  window.ookiniTrack = track;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    // 区画の表示
    var secs = document.querySelectorAll('section[data-ga]');
    if (secs.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          track('ookini_sec_' + e.target.getAttribute('data-ga'), true);
          io.unobserve(e.target);
        });
      }, { rootMargin: '0px 0px -40% 0px', threshold: 0 });
      Array.prototype.forEach.call(secs, function (x) { io.observe(x); });
    }

    // 申込／登録ボタン
    Array.prototype.forEach.call(document.querySelectorAll('a.btn'), function (a) {
      a.addEventListener('click', function () {
        var sec = a.closest('section[data-ga]');
        var where = a.closest('#sticky') ? 'sticky' : (sec ? sec.getAttribute('data-ga') : 'other');
        track('ookini_cta_' + where, false);
      });
    });

    // 体験談の動画
    function vid(src) { var m = /([a-z0-9]+)\.mp4/i.exec(src || ''); return m ? m[1] : 'x'; }
    Array.prototype.forEach.call(document.querySelectorAll('.vbtn[data-v]'), function (b) {
      b.addEventListener('click', function () { track('ookini_video_play_' + vid(b.getAttribute('data-v')), false); });
    });
    var v = document.querySelector('#vd video');
    if (v) v.addEventListener('ended', function () { track('ookini_video_end_' + vid(v.currentSrc || v.src), false); });

    // フォームに初めて触れた
    var f = document.getElementById('f');
    if (f) {
      var start = function () { track('ookini_form_start', true); };
      f.addEventListener('focusin', start);
      f.addEventListener('change', start);
    }
  });
})();
