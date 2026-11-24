/*
  AUREON — artes vetoriais dos veículos (perfil lateral, traço dourado)
  Cada arte se "desenha" ao aparecer (stroke) e depois ganha a cor da pintura (--body).
  Usadas enquanto não houver fotos reais (campo img em data.js).
*/
window.AUREON_ART = (function () {
  'use strict';
  var k = 0; // índice de cada traço, para o desenho acontecer em sequência

  function st() { return ' style="--i:' + (k++) + '"'; }
  function B(d) { return '<path class="b" pathLength="1" fill="url(#G)" d="' + d + '"' + st() + '/>'; } // carroceria
  function K(d) { return '<path class="k" pathLength="1" d="' + d + '"' + st() + '/>'; }                // vidros
  function L(d, c) { return '<path class="l' + (c ? ' ' + c : '') + '" pathLength="1" d="' + d + '"' + st() + '/>'; }
  function O(cx, cy, r, c) { return '<circle class="' + c + '" pathLength="1" cx="' + cx + '" cy="' + cy + '" r="' + r + '"' + st() + '/>'; }
  function S(cx, cy, rx) { return '<ellipse class="sh" cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="5"/>'; }
  function wheel(cx, cy, r) {
    var s = O(cx, cy, r, 't') + O(cx, cy, +(r * 0.68).toFixed(1), 'l') + O(cx, cy, +(r * 0.18).toFixed(1), 'l');
    for (var i = 0; i < 5; i++) {
      var a = i / 5 * Math.PI * 2 - Math.PI / 2;
      s += L('M' + (cx + Math.cos(a) * r * 0.22).toFixed(1) + ' ' + (cy + Math.sin(a) * r * 0.22).toFixed(1) + 'L' + (cx + Math.cos(a) * r * 0.64).toFixed(1) + ' ' + (cy + Math.sin(a) * r * 0.64).toFixed(1), 'thin');
    }
    return s;
  }

  var BUILD = {
    car: function () {
      return S(205, 139, 170) +
        B('M22 112C20 100 24 90 38 86L78 78C104 72 128 52 164 42C196 33 236 33 262 45C282 54 296 64 318 70L362 79C378 83 386 92 386 102L384 112L340 112A30 30 0 0 0 280 112L130 112A30 30 0 0 0 70 112Z') +
        K('M146 68C166 54 196 46 230 46C250 46 266 53 284 66Z') +
        L('M222 47L218 67') +
        K('M290 63L301 61L303 67L293 68Z') +
        L('M50 92C150 84 270 84 372 90', 'hl') +
        L('M158 71C162 84 162 96 160 108', 'thin') + L('M244 69C248 84 248 96 246 108', 'thin') +
        L('M252 80L264 80') +
        L('M360 84C370 86 378 90 382 95') + L('M26 97L44 92') +
        wheel(310, 112, 25) + wheel(100, 112, 25);
    },
    jet: function () {
      return L('M0 58L70 58', 'fx') + L('M10 104L130 104', 'fx') + L('M0 82L24 82', 'fx') +
        B('M44 72L22 22L44 22L96 67Z') +
        B('M28 78C40 70 60 67 90 67L296 66C336 66 368 72 390 82C370 91 336 94 296 94L110 94C80 94 50 90 28 78Z') +
        B('M12 21L64 21L66 25L16 25Z') +
        B('M168 92L250 90L214 112L194 112Z') +
        B('M84 52L128 52C134 52 138 56 138 60C138 64 134 68 128 68L84 68C80 68 78 64 78 60C78 56 80 52 84 52Z') +
        L('M128 53L128 67', 'thin') +
        K('M336 71L362 74L357 79L333 78Z') +
        O(150, 77, 3.4, 'k') + O(170, 77, 3.4, 'k') + O(190, 77, 3.4, 'k') + O(210, 77, 3.4, 'k') + O(230, 77, 3.4, 'k') + O(250, 77, 3.4, 'k') + O(270, 77, 3.4, 'k') +
        L('M292 70L292 90', 'thin') +
        L('M60 86L384 84', 'hl');
    },
    heli: function () {
      return S(222, 146, 120) +
        L('M28 30L376 26', 'rotor') +
        B('M132 78L44 69L42 77L132 96Z') +
        B('M32 42L50 45L52 82L38 84Z') +
        O(44, 60, 15, 'l thin') + L('M44 45L44 75', 'thin') +
        L('M198 34L198 46M206 34L206 46') +
        '<ellipse class="b" pathLength="1" fill="url(#G)" cx="202" cy="30" rx="16" ry="4"' + st() + '/>' +
        B('M168 47C176 37 232 37 246 47Z') +
        B('M128 74C136 54 172 46 222 46L252 48C292 52 318 70 322 90C324 106 304 114 274 114L168 114C138 114 122 100 128 74Z') +
        K('M264 54C290 60 308 74 313 92L264 92Z') +
        K('M172 60L206 59L206 85L172 86Z') + K('M212 59L246 58L246 84L212 85Z') +
        L('M254 56L256 112', 'thin') +
        L('M150 100L300 98', 'hl') +
        L('M172 114L164 132') + L('M270 114L278 132') +
        L('M140 132L306 132C316 132 322 128 324 122');
    },
    yacht: function () {
      return L('M0 128C40 124 80 132 120 128S200 124 240 128S320 132 400 126', 'fx') +
        L('M30 140C80 136 130 142 180 139S280 136 360 141', 'fx') +
        B('M18 94L368 88C380 87 390 84 398 78L378 112C372 119 360 122 344 122L50 122C36 122 26 114 18 94Z') +
        B('M64 92L66 74L296 70C316 70 330 78 338 89Z') +
        K('M80 79L300 76C312 77 320 81 324 86L80 88Z') +
        B('M104 73L110 56L252 54C268 54 280 60 286 70Z') +
        K('M120 61L252 59C262 60 270 63 274 67L118 68Z') +
        B('M148 55L156 42L214 42L226 54Z') +
        K('M162 46L210 46L216 51L158 52Z') +
        L('M184 42L186 20M178 24L196 22') +
        L('M30 106L386 99', 'hl') +
        O(110, 111, 2.2, 'k') + O(138, 111, 2.2, 'k') + O(166, 110, 2.2, 'k') + O(194, 110, 2.2, 'k') + O(222, 109, 2.2, 'k') + O(250, 109, 2.2, 'k');
    },
    jetski: function () {
      return L('M44 110C26 102 14 92 8 76', 'fx') + L('M40 116C22 112 8 106 0 96', 'fx') + L('M52 104C40 94 34 84 32 70', 'fx') +
        L('M0 124C60 120 120 128 200 124S320 120 400 126', 'fx') +
        B('M40 104C40 96 52 92 72 92L246 88C290 86 330 82 362 74C354 96 334 110 304 114L64 114C48 114 40 110 40 104Z') +
        B('M236 89C258 70 312 64 360 73C334 82 292 87 236 89Z') +
        B('M96 90C104 76 176 72 204 80L208 89Z') +
        B('M214 88L242 60L256 60L250 87Z') +
        L('M234 58L278 52') +
        L('M60 104L330 100', 'hl');
    },
    moto: function () {
      return S(200, 150, 150) +
        wheel(96, 112, 34) + wheel(304, 112, 34) +
        L('M190 108L96 112', 'bold') +
        L('M182 118L118 104', 'bold') +
        B('M70 58L100 64L98 72L76 66Z') +
        B('M96 66L170 64L174 78L124 80C110 80 100 76 96 66Z') +
        K('M172 80L240 78L232 116L184 116Z') +
        L('M186 90L230 88M188 100L228 98', 'thin') +
        B('M170 62C186 48 230 46 248 56L244 76L176 80Z') +
        L('M304 112L262 50', 'bold') +
        B('M246 46C272 40 296 52 302 72L276 84L248 70Z') +
        K('M250 46C258 34 274 32 282 40L262 48Z') +
        L('M256 44L236 40') +
        L('M296 64L302 74') +
        L('M110 72L240 60', 'hl');
    }
  };

  var CACHE = {};
  Object.keys(BUILD).forEach(function (key) { k = 0; CACHE[key] = BUILD[key](); });

  var n = 0;
  function svg(kind, o) {
    o = o || {};
    var id = 'aurg' + (++n), body = (CACHE[kind] || CACHE.car).replace(/url\(#G\)/g, 'url(#' + id + ')');
    return '<svg class="art art--' + kind + (o.draw ? ' art--draw' : '') + '" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="st1"/><stop offset=".55" class="st2"/><stop offset="1" class="st3"/></linearGradient></defs>' +
      body + '</svg>';
  }

  return { svg: svg, kinds: Object.keys(BUILD) };
})();
