/*
  AUREON — faixas que descem com a rolagem
  Uma fita larga e torcida, desenhada em canvas 2D, que vai se estendendo conforme a pessoa rola
  a seção onde está presa. Frente laranja, verso grafite, com luz e brilho calculados pela torção.
  Uso: AUREON_RIBBON.attach(elementoDaSecao, 'a' | 'b')  -> devolve uma função para remover.
  Caminhos em unidades de projeto: 1440 de largura no computador (d) e 390 no celular (m),
  y medido a partir do topo da seção.
*/
window.AUREON_RIBBON = (function () {
  'use strict';
  var cv = document.getElementById('ribbon');
  var none = { attach: function () { return function () {}; } };
  if (!cv || !cv.getContext) return none;
  var ctx = cv.getContext('2d'), reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2), VW = 0, VH = 0, list = [], raf = 0, dirty = true;
  var L = (function () { var x = -0.3, y = -0.7, z = 1, m = Math.hypot(x, y, z); return [x / m, y / m, z / m]; })();
  var ORANGE = [255, 90, 31], INK = [132, 40, 12]; // verso laranja queimado: o texto claro continua legível por cima

  var PATHS = {
    a: { w: 74, flips: [0.28, 0.7], cols: [ORANGE, INK],
      d: [[1620, 40], [1340, 110], [1090, 250], [960, 420], [1010, 580], [1180, 620], [1250, 500], [1130, 400], [900, 430], [680, 540], [440, 620], [180, 660], [-140, 690]],
      m: [[470, 20], [330, 60], [250, 140], [262, 230], [330, 270], [400, 250], [480, 190]] },
    b: { w: 56, flips: [0.4, 0.8], cols: [INK, ORANGE],
      d: [[-160, 60], [180, 40], [430, 130], [560, 330], [700, 500], [960, 540], [1180, 450], [1320, 560], [1400, 760], [1640, 820]],
      m: [[-60, 20], [110, 50], [230, 130], [250, 240], [330, 300], [480, 320]] }
  };

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function smooth(a, b, v) { var t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); }

  // Catmull-Rom uniforme: pontos densos ao longo do caminho
  function catmull(pts, per) {
    var out = [], n = pts.length;
    for (var i = 0; i < n - 1; i++) {
      var p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, n - 1)];
      for (var k = 0; k < per; k++) {
        var t = k / per, t2 = t * t, t3 = t2 * t;
        out.push([
          0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
        ]);
      }
    }
    out.push(pts[n - 1].slice());
    return out;
  }

  function build(r) {
    var def = r.def, phone = VW < 760, s = VW / (phone ? 390 : 1440), SEG = 360;
    var dense = catmull((phone ? def.m : def.d).map(function (p) { return [p[0] * s, p[1] * s]; }), 40);
    var acc = [0];
    for (var i = 1; i < dense.length; i++) acc.push(acc[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
    var total = acc[acc.length - 1], pts = [], j = 0;
    for (i = 0; i <= SEG; i++) { // reamostra por comprimento de arco
      var target = total * i / SEG;
      while (j < acc.length - 2 && acc[j + 1] < target) j++;
      var f = (target - acc[j]) / ((acc[j + 1] - acc[j]) || 1);
      pts.push([dense[j][0] + (dense[j + 1][0] - dense[j][0]) * f, dense[j][1] + (dense[j + 1][1] - dense[j][1]) * f]);
    }
    var hw = def.w * 0.5 * (phone ? 0.42 : Math.max(0.62, Math.min(1, s)));
    r.s = [];
    for (i = 0; i <= SEG; i++) {
      var a = pts[Math.max(i - 1, 0)], b = pts[Math.min(i + 1, SEG)], tx = b[0] - a[0], ty = b[1] - a[1], tm = Math.hypot(tx, ty) || 1; tx /= tm; ty /= tm;
      var u = i / SEG, th = Math.PI * (smooth(def.flips[0], def.flips[0] + 0.1, u) + smooth(def.flips[1], def.flips[1] + 0.1, u)) + Math.sin(u * 13 + 1.7) * 0.32;
      var c = Math.cos(th), sn = Math.sin(th);
      var nx = sn * ty, ny = -sn * tx, nz = c, side = c >= 0 ? 1 : -1;            // normal da fita (virada para quem olha)
      var dot = Math.max(0, (nx * L[0] + ny * L[1] + nz * L[2]) * side);
      var lum = 0.5 + 0.62 * dot, spec = Math.pow(dot, 22) * 0.55, base = def.cols[c >= 0 ? 0 : 1];
      var col = 'rgb(' + [0, 1, 2].map(function (k) { return Math.min(255, Math.round(base[k] * lum + 255 * spec)); }).join(',') + ')';
      var taper = 1 - smooth(0.985, 1, u) * 0.35;
      r.s.push({ x: pts[i][0], y: pts[i][1], bx: -ty * hw * c * taper, by: tx * hw * c * taper, col: col });
    }
  }

  function resize() {
    VW = window.innerWidth; VH = window.innerHeight;
    cv.width = Math.round(VW * dpr); cv.height = Math.round(VH * dpr);
    list.forEach(build); dirty = true;
  }

  function frame() {
    raf = list.length ? requestAnimationFrame(frame) : 0;
    var moved = false;
    list.forEach(function (r) {
      var top = r.el.getBoundingClientRect().top, phone = VW < 760;
      var p = clamp((VH * (phone ? 0.8 : 0.85) - top) / (VH * (phone ? 0.8 : 0.95)));
      if (reduce) p = 1;
      var np = r.p + (p - r.p) * 0.2; if (Math.abs(np - p) < 0.0005) np = p;
      if (np !== r.p || top !== r.top) moved = true;
      r.p = np; r.top = top;
    });
    if (!moved && !dirty) return;
    dirty = false;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, VW, VH);
    list.forEach(function (r) {
      var cnt = Math.floor((r.s.length - 1) * r.p); if (cnt < 1) return;
      if (r.top > VH + 40 || r.top + r.el.offsetHeight + 900 < 0) return;
      var oy = r.top;
      ctx.lineJoin = 'round'; ctx.lineWidth = 0.8;
      for (var i = 0; i < cnt; i++) {
        var a = r.s[i], b = r.s[i + 1];
        ctx.beginPath();
        ctx.moveTo(a.x + a.bx, oy + a.y + a.by); ctx.lineTo(a.x - a.bx, oy + a.y - a.by);
        ctx.lineTo(b.x - b.bx, oy + b.y - b.by); ctx.lineTo(b.x + b.bx, oy + b.y + b.by); ctx.closePath();
        ctx.fillStyle = a.col; ctx.strokeStyle = a.col; ctx.fill(); ctx.stroke();
      }
    });
  }

  window.addEventListener('resize', resize);
  resize();

  return {
    attach: function (el, key) {
      if (!el || !PATHS[key]) return function () {};
      var r = { el: el, def: PATHS[key], p: 0, top: 0 };
      build(r); list.push(r); dirty = true;
      if (!raf) raf = requestAnimationFrame(frame);
      return function () { var i = list.indexOf(r); if (i >= 0) list.splice(i, 1); dirty = true; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); if (list.length && !raf) raf = requestAnimationFrame(frame); };
    }
  };
})();
