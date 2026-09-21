/* TRYCAT — script.js
   1) config.js 값 채우기  2) 불 켜기/끄기  3) 고양이 눈 따라가기  4) 문의 창(메일 앱 열기) */
(function () {
  'use strict';

  var S = window.SITE || {};
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- 1) config 값 채우기 ---------- */
  $$('[data-site-row]').forEach(function (row) {
    if (!S[row.getAttribute('data-site-row')]) row.hidden = true;
  });
  $$('[data-site]').forEach(function (el) {
    var key = el.getAttribute('data-site');
    var val = S[key];
    if (!val) return;
    if (key === 'email') {
      el.textContent = val;
      if (el.tagName === 'A') el.href = 'mailto:' + val;
    } else if (key === 'picmedicUrl') {
      el.textContent = String(val).replace(/^https?:\/\//, '').replace(/\/$/, '');
      el.href = val;
    } else {
      el.textContent = val;
    }
  });

  /* ---------- 2) 불 켜기 / 끄기 ---------- */
  var root = document.documentElement;
  var lamp = $('#lamp');
  var themeMeta = $('meta[name="theme-color"]');

  function setTheme(theme, save) {
    root.setAttribute('data-theme', theme);
    var on = theme === 'light';
    if (lamp) {
      lamp.setAttribute('aria-pressed', on ? 'true' : 'false');
      lamp.setAttribute('aria-label', on ? '불 끄기' : '불 켜기');
    }
    if (themeMeta) themeMeta.setAttribute('content', on ? '#F1E3A4' : '#1A1A1A');
    if (save) { try { localStorage.setItem('trycat-theme', theme); } catch (e) {} }
  }
  setTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark', false);
  if (lamp) {
    lamp.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light', true);
    });
  }

  /* ---------- 3) 고양이 눈 따라가기 ---------- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cat = $('#cat');
  var thin = $('.pupils-thin');
  var round = $('.pupils-round');
  function move(el, x, y) {
    if (el) el.style.transform = 'translate(' + x.toFixed(2) + 'px, ' + y.toFixed(2) + 'px)';
  }
  if (cat && !reduce) {
    var raf = 0;
    var look = function (e) {
      if (raf) return;
      var x = e.clientX, y = e.clientY;
      raf = window.requestAnimationFrame(function () {
        raf = 0;
        var r = cat.getBoundingClientRect();
        var vx = x - (r.left + r.width * 0.5);
        var vy = y - (r.top + r.height * 0.6);
        var d = Math.hypot(vx, vy) || 1;
        var m = Math.min(1, d / 260);
        var px = (vx / d) * m, py = (vy / d) * m;
        move(thin, px * 7, py * 4.5);
        move(round, px * 6, py * 4);
      });
    };
    window.addEventListener('pointermove', look);
    window.addEventListener('pointerdown', look);
  }

  /* ---------- 4) 문의 창: 메일 앱 열기 ---------- */
  var send = $('#send');
  if (send) {
    var fName = $('#f-name'), fEmail = $('#f-email'), fIdea = $('#f-idea');
    var statusText = $('#status-text'), reset = $('#reset');

    var show = function (text, canReset) {
      statusText.textContent = text;
      reset.hidden = !canReset;
    };

    send.addEventListener('click', function () {
      var name = fName.value.trim();
      var email = fEmail.value.trim();
      var idea = fIdea.value.trim();
      var err = '';
      if (!name) err = 'name이 비어 있어요';
      else if (!/^\S+@\S+\.\S+$/.test(email)) err = 'email 형식을 확인해주세요';
      else if (!idea) err = 'idea를 조금만 적어주세요';
      if (err) { show('catch (e) → ' + err, false); return; }
      if (!S.email) { show('catch (e) → 받는 이메일이 아직 설정되지 않았어요', false); return; }

      var subject = '[TRYCAT 문의] ' + name;
      var body = '이름: ' + name + '\n이메일: ' + email + '\n\n' + idea.slice(0, 1500);
      var url = 'mailto:' + S.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      if (typeof window.__openMail === 'function') window.__openMail(url); else window.location.href = url;
      show('// 메일 앱이 열렸어요. 보내기를 눌러주세요.', true);
    });

    reset.addEventListener('click', function () {
      fName.value = ''; fEmail.value = ''; fIdea.value = '';
      show('', false);
    });
  }
})();
