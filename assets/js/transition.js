/*
  AUREON — transição de página (adaptada da "Transição Tinta Sumi")
  Ao clicar num link interno, uma mancha escura nasce no ponto do clique e cobre a tela.
  No escuro aparece o nome da página e o selo dourado com a inicial. A página nova é montada
  por baixo e três pinceladas largas apagam a tinta, revelando o conteúdo.
  Com "reduzir movimento" ligado no aparelho, a troca acontece sem animação.
*/
window.AUREON_INK = (function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches, NS = 'http://www.w3.org/2000/svg';
  var layer = document.querySelector('.ink');
  if (!layer) return { go: function (o) { if (o && o.swap) o.swap(); }, intro: function () {}, isBusy: function () { return false; } };

  var svg = layer.querySelector('.ink__svg'), nameEl = layer.querySelector('.ink__name'), seal = layer.querySelector('.ink__seal'), numEl = layer.querySelector('[data-ink-n]');
  var INK = '#ECEAE4', uid = 'ink' + Math.random().toString(36).slice(2, 7);
  var timers = [], anims = [], raf = 0, safety = 0, W = 0, H = 0, busy = false;

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function stop() {
    timers.forEach(clearTimeout); timers = [];
    anims.forEach(function (a) { try { a.cancel(); } catch (e) {} }); anims = [];
    if (raf) cancelAnimationFrame(raf); raf = 0;
  }
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function setup() { W = window.innerWidth; H = window.innerHeight; svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = ''; }

  // mancha orgânica: raio com ondulações em várias frequências
  function blotPath(seed) {
    var pts = [], n = 56, a1 = seed * 7.1, a2 = seed * 3.3, a3 = seed * 11.7, i;
    for (i = 0; i < n; i++) {
      var t = i / n * Math.PI * 2, r = 100 * (1 + 0.09 * Math.sin(5 * t + a1) + 0.06 * Math.sin(9 * t + a2) + 0.035 * Math.sin(17 * t + a3) + (Math.random() < 0.12 ? 0.08 : 0));
      pts.push([Math.cos(t) * r, Math.sin(t) * r]);
    }
    var d = 'M' + ((pts[0][0] + pts[n - 1][0]) / 2).toFixed(1) + ' ' + ((pts[0][1] + pts[n - 1][1]) / 2).toFixed(1);
    for (i = 0; i < n; i++) { var p = pts[i], nx = pts[(i + 1) % n]; d += 'Q' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ' ' + ((p[0] + nx[0]) / 2).toFixed(1) + ' ' + ((p[1] + nx[1]) / 2).toFixed(1); }
    return d + 'Z';
  }

  function title(label, n) {
    label = String(label || 'AUREON').replace(/\s+/g, ' ').trim().slice(0, 22) || 'AUREON';
    nameEl.textContent = '';
    Array.from(label).forEach(function (ch, i) {
      var s = document.createElement('span'); s.textContent = ch === ' ' ? ' ' : ch; s.style.setProperty('--i', i); nameEl.appendChild(s);
    });
    nameEl.style.setProperty('--len', Math.max(6, label.length));
    seal.textContent = label.charAt(0).toUpperCase();
    numEl.textContent = n || '01';
  }

  function off() { stop(); clearTimeout(safety); busy = false; layer.className = 'ink'; svg.innerHTML = ''; }

  // tinta cobrindo tudo -> três pinceladas apagam
  function wipe() {
    stop(); setup();
    var m = el('mask', { id: uid + '-m', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }, el('defs', {}, svg));
    el('rect', { width: W, height: H, fill: '#fff' }, m);
    var g = el('g', { stroke: '#000', fill: 'none', 'stroke-linecap': 'round' }, m);
    el('rect', { width: W, height: H, fill: INK, mask: 'url(#' + uid + '-m)' }, svg);
    var sw = H * 0.5, rows = [[0.18, -1], [0.52, 1], [0.86, -1]], strokes = [];
    rows.forEach(function (r, i) {
      var y = H * r[0], x0 = r[1] > 0 ? -W * 0.12 : W * 1.12, x1 = r[1] > 0 ? W * 1.12 : -W * 0.12, bend = (i % 2 ? -1 : 1) * H * 0.05;
      var d = 'M' + x0.toFixed(0) + ' ' + (y + bend).toFixed(0) + 'Q' + (W / 2).toFixed(0) + ' ' + (y - bend * 2).toFixed(0) + ' ' + x1.toFixed(0) + ' ' + (y + bend * 0.5).toFixed(0);
      var main = el('path', { d: d, 'stroke-width': sw.toFixed(0) }, g), L0 = main.getTotalLength ? main.getTotalLength() : W * 1.4;
      main.style.strokeDasharray = L0 + ' ' + L0; main.style.strokeDashoffset = L0;
      strokes.push([main, i * 200, 420, L0]);
      [-0.56, -0.5, 0.5, 0.57].forEach(function (o, k) { // cerdas nas bordas da pincelada
        var p = el('path', { d: d, 'stroke-width': (H * (0.012 + k % 2 * 0.01)).toFixed(1), transform: 'translate(0 ' + (sw * o).toFixed(0) + ')', 'stroke-dasharray': (W * 0.06).toFixed(0) + ' ' + (W * (0.02 + k * 0.01)).toFixed(0) }, g);
        p.style.opacity = 0; strokes.push([p, i * 200 + 60 + k * 25, 420, 0]);
      });
    });
    layer.classList.add('is-wipe');
    strokes.forEach(function (s) {
      if (!s[3]) { if (s[0].animate) anims.push(s[0].animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, delay: s[1] + 120, fill: 'both' })); else s[0].style.opacity = 1; return; }
      if (s[0].animate) anims.push(s[0].animate([{ strokeDashoffset: s[3] }, { strokeDashoffset: 0 }], { duration: s[2], delay: s[1], easing: 'cubic-bezier(.55, 0, .25, 1)', fill: 'forwards' }));
      else s[0].style.strokeDashoffset = 0;
    });
    later(off, 200 * 2 + 420 + 160);
  }

  // a mancha nasce no ponto do clique e se espalha até cobrir a tela
  function cover(x, y, done) {
    stop(); setup();
    layer.classList.add('is-on'); layer.classList.remove('is-title', 'is-seal', 'is-wipe');
    var far = Math.max(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y));
    var blots = [], drops = [], seed = Math.random() * 10, i;
    for (i = 0; i < 3; i++) blots.push({ e: el('path', { d: blotPath(seed + i * 1.7), fill: INK }, svg), s: far / 100 / 0.8 * (1 + i * 0.08), r: (i - 1) * 24 + Math.random() * 20, d: i * 70 });
    for (i = 0; i < 9; i++) {
      var ang = Math.random() * 6.283, dist = 18 + Math.random() * 90;
      drops.push({ e: el('circle', { cx: (x + Math.cos(ang) * dist).toFixed(1), cy: (y + Math.sin(ang) * dist).toFixed(1), r: 0, fill: INK }, svg), r: 2 + Math.random() * 7, d: 30 + Math.random() * 120 });
    }
    var t1 = performance.now(), D = 680;
    (function grow(now) {
      var t = now - t1, finished = true;
      blots.forEach(function (b) {
        var p = Math.max(0, Math.min(1, (t - b.d) / D)); if (p < 1) finished = false;
        var e = p < 0.18 ? p / 0.18 * 0.05 : 0.05 + Math.pow((p - 0.18) / 0.82, 1.6) * 0.95;
        b.e.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + (b.r * p).toFixed(1) + ') scale(' + Math.max(0.001, e * b.s).toFixed(4) + ')');
      });
      drops.forEach(function (o) { var p = Math.max(0, Math.min(1, (t - o.d) / 140)); o.e.setAttribute('r', (o.r * (1 - Math.pow(1 - p, 3))).toFixed(1)); });
      raf = finished ? 0 : requestAnimationFrame(grow);
    })(t1);
    later(function () { layer.classList.add('is-title'); }, D + 60);
    later(function () { layer.classList.add('is-seal'); }, D + 300);
    later(done, D + 660);
  }

  // o.label: nome mostrado · o.n: número da página · o.x/o.y: ponto do clique · o.swap: monta a página nova
  function go(o) {
    if (reduce) { o.swap(); return; }
    if (busy) return;
    busy = true; title(o.label, o.n);
    clearTimeout(safety); safety = setTimeout(off, 6000); // segurança: nunca prende a tela
    var x = o.x == null ? window.innerWidth / 2 : o.x, y = o.y == null ? window.innerHeight / 2 : o.y;
    cover(x, y, function () {
      try { o.swap(); } catch (e) { if (window.console) console.error(e); }
      later(wipe, 260);
    });
  }

  // abertura do site: a tela já começa coberta com a marca, e as pinceladas revelam o site
  function intro(label) {
    document.documentElement.classList.remove('is-intro');
    if (reduce) return;
    busy = true; title(label, '01'); setup();
    el('rect', { width: W, height: H, fill: INK }, svg);
    layer.className = 'ink is-on';
    later(function () { layer.classList.add('is-title'); }, 40);
    later(function () { layer.classList.add('is-seal'); }, 420);
    later(wipe, 1500);
    clearTimeout(safety); safety = setTimeout(off, 5000);
  }

  window.addEventListener('pageshow', function (e) { if (e.persisted) off(); });

  return { go: go, intro: intro, isBusy: function () { return busy; } };
})();
