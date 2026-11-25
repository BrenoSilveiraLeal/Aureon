/*
  AUREON — aplicação
  Site de página única com rotas por # (funciona abrindo o index.html direto, sem servidor):
    #/                    início
    #/colecao[/categoria] coleção (filtro por categoria)
    #/veiculo/<id>        página do veículo
    #/concierge[/contato] serviços e contato
*/
(function () {
  'use strict';
  var D = window.AUREON_DATA, ART = window.AUREON_ART, INK = window.AUREON_INK;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var html = document.documentElement, view = document.getElementById('view');

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function clamp(v, a, b) { return Math.max(a == null ? 0 : a, Math.min(b == null ? 1 : b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function seg(v, a, b) { return clamp((v - a) / (b - a)); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function eo(t) { return 1 - Math.pow(1 - t, 3); }
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  var CAT = {}, VEH = {};
  D.categories.forEach(function (c) { CAT[c.id] = c; });
  D.vehicles.forEach(function (v) { VEH[v.id] = v; });
  function inCat(id) { return D.vehicles.filter(function (v) { return v.cat === id; }); }
  function minPrice(id) { return Math.min.apply(null, inCat(id).map(function (v) { return v.price; })); }
  function catLead(c) { var vs = inCat(c.id); return vs.filter(function (v) { return v.featured && v.img; })[0] || vs.filter(function (v) { return v.img; })[0] || vs[0]; }
  // filmes do topo e da cena "Em movimento": só categorias que têm vídeo
  var STARS = D.categories.map(function (c) { return inCat(c.id).filter(function (v) { return v.video; })[0]; }).filter(Boolean);
  // fotos da "garagem" do final: até 24, alternando as categorias
  var GARAGE = (function () {
    var out = [], lists = D.categories.map(function (c) { return inCat(c.id).filter(function (v) { return v.img; }); });
    for (var r = 0; out.length < 24 && r < 12; r++) lists.forEach(function (l) { if (l[r] && out.length < 24) out.push(l[r]); });
    return out;
  })();
  // vitrine do topo: uma foto por categoria, de um modelo diferente dos que aparecem nos filmes
  var SHOW = D.categories.map(function (c) { var vs = inCat(c.id); return vs.filter(function (v) { return v.img && !v.video; })[0] || catLead(c); }).filter(function (v) { return v && v.img; });
  var NUMS = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze'];

  var BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  function money(n) { return BRL.format(n); }
  function short(n) {
    if (n >= 1e6) { var v = n / 1e6; return 'R$ ' + v.toLocaleString('pt-BR', { maximumFractionDigits: v >= 100 ? 0 : v >= 10 ? 1 : 2 }) + ' mi'; }
    return 'R$ ' + Math.round(n / 1e3).toLocaleString('pt-BR') + ' mil';
  }
  function pmt(price, dpPct, months) { var F = price * (1 - dpPct / 100), i = 0.0089; return F * i / (1 - Math.pow(1 + i, -months)); }

  var ICON = {
    arrow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
    left: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 8H3M7 4 3 8l4 4"/></svg>',
    close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7.5-4.6-9.3-9.2C1.5 7.6 3.6 4.5 6.9 4.5c2 0 3.5 1.1 5.1 3 1.6-1.9 3.1-3 5.1-3 3.3 0 5.4 3.1 4.2 6.3C19.5 15.4 12 20 12 20z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>'
  };
  // WhatsApp da loja (troque pelo número real, só dígitos com DDI e DDD)
  var WA = '5511900000000';
  function waLink(text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }
  var RIB = window.AUREON_RIBBON || { attach: function () { return function () {}; } };
  function vStyle(v, fi) { var c = CAT[v.cat]; return '--s1:' + c.theme[0] + ';--s2:' + c.theme[1] + ';--body:' + v.finishes[fi || 0].color; }
  function vImg(v, lazy) { return v.img ? '<img ' + (lazy === false ? '' : 'loading="lazy" ') + 'src="' + esc(v.img) + '" alt="' + esc(v.brand + ' ' + v.model) + '">' : ART.svg(CAT[v.cat].art, {}); }
  function poster(v) { return v.video ? v.video.replace(/\.mp4$/i, '.jpg') : (v.img || ''); }

  /* ---------------- rolagem suave (Lenis) ---------------- */
  var lenis = null;
  if (window.Lenis && !reduce) {
    try { lenis = new window.Lenis({ lerp: 0.1 }); (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now()); } catch (e) { lenis = null; }
  }
  function toY(y, smooth) { if (lenis) lenis.scrollTo(y, { immediate: !smooth, force: true }); else window.scrollTo({ top: y, behavior: smooth && !reduce ? 'smooth' : 'auto' }); }
  function toEl(el, smooth) { toY(el.getBoundingClientRect().top + window.pageYOffset - 90, smooth); }
  function lock(on) { if (lenis) { if (on) lenis.stop(); else lenis.start(); } document.body.style.overflow = on ? 'hidden' : ''; }

  /* ---------------- seleção (lista de interesse) ---------------- */
  var SEL_KEY = 'aureon-selecao', sel = [];
  try { sel = JSON.parse(localStorage.getItem(SEL_KEY) || '[]'); if (!Array.isArray(sel)) sel = []; } catch (e) { sel = []; }
  sel = sel.filter(function (id) { return VEH[id]; });
  function saveSel() { try { localStorage.setItem(SEL_KEY, JSON.stringify(sel)); } catch (e) {} updateSelUI(); }
  function toggleSel(id) {
    var i = sel.indexOf(id);
    if (i < 0) { sel.push(id); toast('Adicionado à sua visita'); bump(); } else { sel.splice(i, 1); toast('Removido da visita'); }
    saveSel();
  }
  function bump() { $$('[data-open-sel].rbtn').forEach(function (b) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); setTimeout(function () { b.classList.remove('bump'); }, 450); }); }
  function updateSelUI() {
    $$('[data-sel-count]').forEach(function (e) { e.textContent = sel.length; e.classList.toggle('z', !sel.length); });
    $$('[data-fav]').forEach(function (b) {
      var on = sel.indexOf(b.getAttribute('data-fav')) >= 0;
      b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.classList.toggle('is-on', on);
      var t = $('[data-fav-txt]', b); if (t) t.textContent = on ? 'Na sua visita' : 'Adicionar à visita';
    });
    renderDrawer();
  }
  function favBtn(id) { var on = sel.indexOf(id) >= 0; return '<button class="fav' + (on ? ' is-on' : '') + '" type="button" data-fav="' + id + '" aria-pressed="' + on + '" aria-label="Quero ver ' + esc(VEH[id].model) + ' na visita">' + ICON.heart + '</button>'; }

  /* ---------------- peças reutilizáveis ---------------- */
  function pcCard(v, i, n) {
    var c = CAT[v.cat], href = '#/veiculo/' + v.id;
    return '<article class="pc">' +
      '<div class="imw"><a class="im' + (v.img ? '' : ' dark') + '" href="' + href + '" data-title="' + esc(v.model) + '" tabindex="-1" aria-hidden="true" style="' + vStyle(v) + '">' + vImg(v) +
        '<span class="idx mono">' + pad(i + 1) + ' / ' + pad(n) + '</span><span class="chip">↗</span></a>' + favBtn(v.id) + '</div>' +
      '<a class="pc-t" href="' + href + '" data-title="' + esc(v.model) + '">' +
        '<div class="tags mono"><span>' + esc(c.singular) + ' · ' + esc(v.specs[0][1]) + ' · ' + v.year + '</span><span>' + short(v.price) + '</span></div>' +
        '<h3><span class="ar">→</span>' + esc(v.brand + ' ' + v.model) + '</h3>' +
      '</a>' +
    '</article>';
  }
  function irowV(v, i) {
    var c = CAT[v.cat];
    return '<a class="irow" href="#/veiculo/' + v.id + '" data-title="' + esc(v.model) + '"' + (v.img ? ' data-peek="' + esc(v.img) + '"' : '') + '>' +
      '<span class="mono">' + pad(i + 1) + '</span><b>' + esc(v.brand + ' ' + v.model) + '</b>' +
      '<span class="mono disc">' + esc(c.singular + ' · ' + v.specs[0][1] + ' · ' + v.year) + '</span><span class="mono">' + short(v.price) + '</span></a>';
  }
  function togHTML(attr, items, onVal) {
    return '<div class="tog" ' + attr + '><span class="kn"></span>' + items.map(function (it) {
      return '<button type="button" data-v="' + it[0] + '"' + (it[0] === onVal ? ' class="on" aria-pressed="true"' : ' aria-pressed="false"') + '>' + it[1] + (it[2] != null ? '<small>' + it[2] + '</small>' : '') + '</button>';
    }).join('') + '</div>';
  }
  function setupTog(tog, cb) {
    if (!tog) return;
    var kn = $('.kn', tog), btns = $$('button', tog);
    function place() { var on = $('button.on', tog); if (on && kn) { kn.style.width = on.offsetWidth + 'px'; kn.style.transform = 'translateX(' + on.offsetLeft + 'px)'; } }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        place();
        if (tog.scrollWidth > tog.clientWidth) tog.scrollTo({ left: b.offsetLeft - 40, behavior: 'smooth' });
        if (cb) cb(b.getAttribute('data-v'));
      });
    });
    place(); requestAnimationFrame(place);
    var on0 = $('button.on', tog); if (on0 && tog.scrollWidth > tog.clientWidth) tog.scrollLeft = Math.max(0, on0.offsetLeft - 40);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    window.addEventListener('resize', place); onCleanup(function () { window.removeEventListener('resize', place); });
  }
  function processSteps() {
    return [
      ['Escolha', 'Navegue pela coleção e monte a sua lista do que quer ver — ou peça algo fora do catálogo.'],
      ['Visita', 'Agende um horário no showroom, hangar ou marina. Test drive, voo ou passeio de demonstração.'],
      ['Negociação', 'Na loja, com calma: financiamento, leasing ou troca do seu veículo atual.'],
      ['Entrega', 'Na sua garagem, hangar ou marina — no Brasil ou no mundo.']
    ];
  }

  /* imagem que segue o cursor (lista e palavras) */
  function follower(el, opts) {
    var img = $('img', el), lab = $('.mono', el), x = 0, y = 0, cx = 0, cy = 0, vx = 0, on = false, raf = 0;
    function loop() {
      cancelAnimationFrame(raf);
      (function f() {
        var nx = cx + (x - cx) * 0.18; vx = nx - cx; cx = nx; cy += (y - cy) * 0.18;
        el.style.transform = 'translate3d(' + (cx + opts.dx).toFixed(1) + 'px,' + (cy + opts.dy).toFixed(1) + 'px,0)' + (opts.tilt ? ' rotate(' + clamp(vx * 0.01, -0.3, 0.3).toFixed(3) + 'rad)' : '');
        if (on || Math.abs(x - cx) > 0.5) raf = requestAnimationFrame(f);
      })();
    }
    return {
      show: function (src, label, e) { if (!fine) return; if (img.getAttribute('src') !== src) img.src = src; if (lab) lab.textContent = label || ''; if (!on) { cx = x = e.clientX; cy = y = e.clientY; } on = true; el.classList.add('on'); loop(); },
      move: function (e) { x = e.clientX; y = e.clientY; },
      hide: function () { on = false; el.classList.remove('on'); }
    };
  }
  var RIDER = follower($('#rider'), { dx: 24, dy: 24, tilt: true });
  var PEEK = follower($('#peek'), { dx: 26, dy: -120, tilt: false });
  function bindPeek(box) {
    if (!fine || !box) return;
    box.addEventListener('pointermove', function (e) { PEEK.move(e); var r = e.target.closest && e.target.closest('[data-peek]'); if (r) PEEK.show(r.getAttribute('data-peek'), '', e); else PEEK.hide(); });
    box.addEventListener('pointerleave', PEEK.hide);
    onCleanup(PEEK.hide);
  }

  /* janela com recorte para o título (o "tab" morde o canto da janela) */
  function notch(win, tab) {
    function apply() {
      var wr = win.getBoundingClientRect(), tr = tab.getBoundingClientRect(), W = wr.width, H = wr.height;
      var r = parseFloat(getComputedStyle(html).getPropertyValue('--r')) || 20;
      var tw = Math.round(tr.right - wr.left), th = Math.round(wr.bottom - tr.top);
      win.style.setProperty('--tabw', tw + 'px');
      if (tw < r * 3 || th < r * 3 || tw > W - r * 3 || th > H - r * 3) { win.style.clipPath = ''; win.style.borderRadius = ''; return; }
      var d = 'M ' + r + ' 0 H ' + (W - r) + ' A ' + r + ' ' + r + ' 0 0 1 ' + W + ' ' + r + ' V ' + (H - r) + ' A ' + r + ' ' + r + ' 0 0 1 ' + (W - r) + ' ' + H +
        ' H ' + (tw + r) + ' A ' + r + ' ' + r + ' 0 0 1 ' + tw + ' ' + (H - r) + ' V ' + (H - th + r) + ' A ' + r + ' ' + r + ' 0 0 0 ' + (tw - r) + ' ' + (H - th) +
        ' H ' + r + ' A ' + r + ' ' + r + ' 0 0 1 0 ' + (H - th - r) + ' V ' + r + ' A ' + r + ' ' + r + ' 0 0 1 ' + r + ' 0 Z';
      win.style.clipPath = 'path("' + d + '")'; win.style.borderRadius = '0';
    }
    apply(); setTimeout(apply, 300);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(apply);
    window.addEventListener('resize', apply); onCleanup(function () { window.removeEventListener('resize', apply); });
  }

  /* ================================================================
     PÁGINA: INÍCIO
     ================================================================ */
  function pageHome() {
    var list = STARS, feat = D.vehicles.filter(function (v) { return v.featured; });
    var h =
      '<section class="hero" data-hero>' +
        '<div class="win" data-win>' +
          '<img class="still" alt=""><img class="still" alt="">' +
          '<div class="corner mono" data-corner></div>' +
          '<a class="go mono" data-go href="#/colecao" data-title="Coleção">Ver veículo ↗</a>' +
          '<div class="hint mono" role="group" aria-label="Escolher categoria">' + SHOW.map(function (v, i) { return '<button type="button" data-hchip="' + i + '" aria-pressed="false">' + esc(CAT[v.cat].name) + '<i></i></button>'; }).join('') + '</div>' +
        '</div>' +
        '<div class="tab" data-tab><h1 data-h1><span class="ln"><span>Tudo o que se move,</span></span><span class="ln"><span><em>com assinatura.</em></span></span></h1></div>' +
        '<div class="hrow mono"><div><span class="sq o"></span>São Paulo / Miami</div><div><span class="sq"></span>Desde 2011</div><div><span class="sq"></span>Terra · Mar · Ar</div><div class="scroll">Role <i></i></div></div>' +
      '</section>' +

      '<section class="stmt">' +
        '<h2 class="big rv"><span class="ln"><span><span class="hw" data-rider="carros">Terra</span>, <span class="hw" data-rider="iates">mar</span> e <span class="hw" data-rider="avioes">ar.</span></span></span><span class="ln"><span>Um só endereço.</span></span></h2>' +
        '<div class="cols"><div class="spacer"></div><div class="txt rv">' +
          '<p class="lead fade">Somos uma casa pequena de curadores, engenheiros e pilotos. Selecionamos carros, clássicos, motos, motorhomes, aviões, helicópteros, iates e jet skis um a um. Aqui você escolhe; ao vivo você conhece: agende uma visita ao showroom, ao hangar ou à marina, com test drive, voo ou passeio de demonstração.</p>' +
          '<a href="#/colecao" data-title="Coleção" class="pill fade"><i></i>Escolher o que ver</a>' +
        '</div></div>' +
      '</section>' +

      reelHTML(list) +

      '<section class="work" data-work>' +
        '<div class="whead"><h2 class="rv"><span class="ln"><span>Destaques<sup>(' + pad(feat.length) + ')</sup></span></span></h2>' +
          '<div class="r"><p class="blurb mono fade">Escolhidos a dedo e prontos para você ver de perto.</p>' + togHTML('data-view', [['grid', 'Grade'], ['list', 'Índice']], 'grid') + '</div></div>' +
        '<div class="grid">' + feat.map(function (v, i) { return pcCard(v, i, feat.length); }).join('') + '</div>' +
        '<div class="index">' + feat.map(irowV).join('') + '</div>' +
        '<div class="wfoot"><a href="#/colecao" data-title="Coleção" class="pill"><i></i>Ver os ' + D.vehicles.length + ' veículos</a></div>' +
      '</section>' +

      '<section class="work" style="padding-top:0">' +
        '<div class="whead"><h2 class="rv"><span class="ln"><span>' + (NUMS[D.categories.length] || D.categories.length).replace(/^./, function (m) { return m.toUpperCase(); }) + ' universos<sup>(' + pad(D.categories.length) + ')</sup></span></span></h2><p class="blurb mono fade">Clique num bloco · ← → trocam · Esc fecha</p></div>' +
        '<div class="bx" data-bx>' + D.categories.map(function (c) {
          var v = catLead(c);
          return '<button class="bx__tile" type="button" aria-label="Abrir ' + esc(c.name) + '" style="--s1:' + c.theme[0] + ';--s2:' + c.theme[1] + ';--body:' + c.body + '">' +
            '<span class="bx__art">' + (v && v.img ? '<img loading="lazy" src="' + esc(v.img) + '" alt="">' : ART.svg(c.art, {})) + '</span>' +
            '<span class="bx__name">' + esc(c.name) + '</span>' +
            '<span class="bx__lab mono"><i></i>' + pad(inCat(c.id).length) + ' modelos<small>· desde ' + short(minPrice(c.id)) + '</small></span></button>';
        }).join('') + '</div>' +
      '</section>' +

      '<section class="stmt2">' +
        '<h2 class="big rv"><span class="ln"><span>Feito para</span></span><span class="ln"><span>dirigir, pilotar</span></span><span class="ln"><span>e <em>navegar.</em></span></span></h2>' +
        '<div class="cols"><div><div class="minicard fade"><img loading="lazy" src="' + esc((VEH['solace-42'] || feat[0]).img) + '" alt="Lancha de madeira na água"><span class="mono">Nota de entrega 42: Angra dos Reis</span></div></div>' +
          '<div class="txt rv" style="padding-top:60px">' +
            '<p class="lead fade">Um único concierge cuida do crédito, da troca do seu veículo atual, do registro no Detran, na ANAC ou na Marinha e do transporte até onde você estiver.</p>' +
            '<p class="lead fade">Do primeiro café no showroom à primeira viagem, você fala com uma pessoa só.</p>' +
            '<a href="#/concierge" data-title="Concierge" class="pill fade"><i></i>Conheça o concierge</a>' +
          '</div></div>' +
      '</section>' +

      finHTML();

    return {
      title: '', html: h,
      mount: function (root) { onCleanup(RIB.attach($('.stmt', root), 'a')); onCleanup(RIB.attach($('.stmt2', root), 'b')); mountHero(root, SHOW); mountRiderWords(root); mountReel(root, list); mountWork($('[data-work]', root)); mountBento(root); mountFin(root); }
    };
  }

  /* ---------- herói: vitrine de fotos na janela (cortina + zoom lento), troca sozinha ---------- */
  function mountHero(root, list) {
    var hero = $('[data-hero]', root), win = $('[data-win]', root), imgs = $$('img.still', win), chips = $$('[data-hchip]', root);
    var corner = $('[data-corner]', root), go = $('[data-go]', root), h1 = $('[data-h1]', root);
    var cur = -1, front = 1, timer = 0, DUR = 6000, manual = false, visible = true;
    hero.style.setProperty('--dur', DUR + 'ms');
    notch(win, $('[data-tab]', root));
    setTimeout(function () { h1.classList.add('in'); }, html.classList.contains('is-intro') ? 1900 : 120);
    list.forEach(function (v) { var im = new Image(); im.src = v.img; }); // pré-carrega a vitrine
    function show(k) {
      if (k === cur) return;
      var dir = cur < 0 || k > cur ? 1 : -1; cur = k;
      var v = list[k], c = CAT[v.cat], nv = imgs[1 - front], ov = imgs[front];
      nv.src = v.img; nv.alt = v.brand + ' ' + v.model;
      ov.style.zIndex = -1; nv.style.zIndex = 0;
      nv.classList.remove('kb'); void nv.offsetWidth; nv.classList.add('kb');
      nv.style.transition = 'none';
      nv.style.clipPath = reduce || front === 1 && cur === k && !ov.getAttribute('src') ? 'inset(0)' : (dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)');
      void nv.offsetWidth;
      nv.style.transition = 'clip-path 1.1s cubic-bezier(.7,0,.2,1)'; nv.style.clipPath = 'inset(0 0 0 0)';
      front = 1 - front;
      corner.innerHTML = 'Fig. ' + pad(k + 1) + ' — ' + esc(c.name) + ': <b>' + esc(v.brand + ' ' + v.model) + '</b>';
      go.setAttribute('href', '#/veiculo/' + v.id); go.setAttribute('data-title', v.model);
      chips.forEach(function (b, j) { b.setAttribute('aria-pressed', j === k ? 'true' : 'false'); });
    }
    function loop() { clearTimeout(timer); if (manual || reduce) return; timer = setTimeout(function () { if (visible && !document.hidden) show((cur + 1) % list.length); loop(); }, DUR); }
    chips.forEach(function (b, j) { b.addEventListener('click', function () { manual = true; hero.classList.add('manual'); clearTimeout(timer); show(j); }); });
    var io2 = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; });
    io2.observe(win);
    show(0); loop();
    onCleanup(function () { clearTimeout(timer); io2.disconnect(); });
  }

  /* ---------- palavras que mostram uma foto que segue o cursor ---------- */
  function mountRiderWords(root) {
    $$('[data-rider]', root).forEach(function (w) {
      var v = catLead(CAT[w.getAttribute('data-rider')]);
      if (!v || !v.img) return;
      w.addEventListener('pointerenter', function (e) { RIDER.show(v.img, 'Em destaque: ' + v.brand + ' ' + v.model, e); });
      w.addEventListener('pointermove', RIDER.move);
      w.addEventListener('pointerleave', RIDER.hide);
    });
    onCleanup(RIDER.hide);
  }

  /* ---------- EM MOVIMENTO: o vídeo cresce do centro e a rolagem conduz os 6 filmes ---------- */
  function reelHTML(list) {
    var words = '<span class="wd" data-w="l">Em</span><span class="wd" data-w="r">movimento</span>';
    return '<section class="reel" data-reel>' +
      '<div class="stick" data-rstick>' +
        '<div class="words" data-wk aria-hidden="true">' + words + '</div>' +
        '<a class="card" data-rcard href="#/colecao" data-title="Coleção" aria-label="Ver o veículo deste filme">' +
          list.map(function (v, i) { return v.video ? '<video muted playsinline preload="' + (i ? 'metadata' : 'auto') + '" src="' + esc(v.video) + '" poster="' + esc(poster(v)) + '" aria-hidden="true"></video>' : '<video poster="' + esc(poster(v)) + '" aria-hidden="true"></video>'; }).join('') +
        '</a>' +
        '<div class="words w" data-ww aria-hidden="true">' + words + '</div>' +
        '<i class="tmark"></i><i class="tmark"></i><i class="tmark"></i><i class="tmark"></i>' +
        '<div class="ov" data-rov><div class="cat" data-rcat></div><div class="side"><b data-rmodel></b><p data-rin></p></div></div>' +
        '<div class="meta mono" data-rmeta><span data-rfig></span><span class="segs">' + list.map(function () { return '<i><b></b></i>'; }).join('') + '</span><span data-rtc>00:00</span></div>' +
        '<div class="playb mono" data-playb aria-hidden="true">Ver ↗</div>' +
      '</div>' +
    '</section>';
  }
  function mountReel(root, list) {
    var sec = $('[data-reel]', root); if (!sec) return;
    var stick = $('[data-rstick]', sec), card = $('[data-rcard]', sec), vids = $$('video', card), wk = $('[data-wk]', sec), ww = $('[data-ww]', sec);
    var marks = $$('.tmark', sec), ov = $('[data-rov]', sec), meta = $('[data-rmeta]', sec), segs = $$('.segs b', sec), playb = $('[data-playb]', sec);
    var N = list.length, cur = -1, queued = false, wl = 0, wr = 0, tall = false, cw = 0, ch = 0;
    // enquadramento no celular: centraliza o corte onde o veículo está naquele segundo do filme (vfocus)
    function focusAt(tr, t) {
      if (t <= tr[0][0]) return tr[0][1];
      for (var k = 1; k < tr.length; k++) if (t <= tr[k][0]) return lerp(tr[k - 1][1], tr[k][1], seg(t, tr[k - 1][0], tr[k][0]));
      return tr[tr.length - 1][1];
    }
    function frame(v, j) {
      var tr = list[j].vfocus, vw = v.videoWidth, vh = v.videoHeight;
      if (!tall || !tr || !tr.length || !vw || !cw) { if (v.style.objectPosition) v.style.objectPosition = ''; return; }
      var f = Math.min(1, cw / (vw * Math.max(cw / vw, ch / vh))); // fração da largura do quadro que aparece
      var x = f >= 1 ? 0.5 : clamp((focusAt(tr, v.currentTime) - f / 2) / (1 - f));
      v.style.objectPosition = (x * 100).toFixed(2) + '% 50%';
    }
    function measure() { var l = $('[data-w="l"]', wk), r = $('[data-w="r"]', wk); wl = l.offsetWidth; wr = r.offsetWidth; }
    function chapter(i) {
      cur = i; var v = list[i], c = CAT[v.cat];
      $('[data-rcat]', sec).textContent = c.name;
      $('[data-rmodel]', sec).textContent = v.brand + ' ' + v.model;
      $('[data-rin]', sec).textContent = (c.inside && c.inside[0] ? c.inside[0] + '. ' : '') + short(v.price);
      $('[data-rfig]', sec).textContent = 'Fig. ' + pad(i + 1) + ' / ' + pad(N) + ' — ' + c.name;
      card.setAttribute('href', '#/veiculo/' + v.id); card.setAttribute('data-title', v.model);
    }
    function update() {
      queued = false;
      var r = sec.getBoundingClientRect(), VW = stick.clientWidth, VH = stick.clientHeight, total = sec.offsetHeight - VH;
      if (r.bottom < -50 || r.top > VH + 50) return;
      var p = clamp(-r.top / total);
      // fase 1 (≈ 1,1 tela de rolagem): o cartão cresce do centro até cobrir a tela; as palavras se afastam
      var aEnd = Math.min(0.3, VH * 1.1 / total), bStart = Math.min(0.32, VH * 1.25 / total);
      // celular em pé: o filme (16:9) não ocupa a tela toda, senão sobra só o miolo do quadro; ele para num
      // formato quase quadrado, um pouco acima do centro, e o texto vai para baixo dele
      var a = ease(seg(p, 0, aEnd)), w0 = Math.min(320, VW * 0.42), h0 = w0 * 0.62, narrow = VW < 760;
      tall = narrow && VH > VW * 1.2;
      var hF = tall ? Math.min(VH, VW * 0.9) : VH, dy = tall ? lerp(0, VH * 0.42 - VH / 2, a) : 0;
      var w = lerp(w0, VW, a), h = lerp(h0, hF, a), rad = lerp(26, 0, a), L = (VW - w) / 2, T = (VH - h) / 2 + dy;
      cw = w; ch = h;
      card.style.width = w.toFixed(1) + 'px'; card.style.height = h.toFixed(1) + 'px'; card.style.transform = 'translate(-50%,calc(-50% + ' + dy.toFixed(1) + 'px))'; card.style.borderRadius = rad.toFixed(1) + 'px';
      ov.style.top = tall ? (VH * 0.42 + hF / 2 + 22).toFixed(1) + 'px' : ''; ov.style.bottom = tall ? 'auto' : '';
      var s = lerp(0.78, 1, a), gap = 24;
      [wk, ww].forEach(function (box) {
        var l = $('[data-w="l"]', box), rr = $('[data-w="r"]', box);
        if (narrow) { // celular: uma palavra acima e outra abaixo do vídeo
          l.style.transformOrigin = '50% 100%'; rr.style.transformOrigin = '50% 0';
          l.style.transform = 'translate(' + ((VW - wl) / 2).toFixed(1) + 'px,' + (T - VH / 2 - gap).toFixed(1) + 'px) translateY(-100%) scale(' + s.toFixed(3) + ')';
          rr.style.transform = 'translate(' + ((VW - wr) / 2).toFixed(1) + 'px,' + (T + h - VH / 2 + gap).toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
        } else {
          l.style.transformOrigin = '100% 50%'; rr.style.transformOrigin = '0 50%';
          l.style.transform = 'translate(' + (L - gap - wl).toFixed(1) + 'px,-52%) scale(' + s.toFixed(3) + ')';
          rr.style.transform = 'translate(' + (L + w + gap).toFixed(1) + 'px,-52%) scale(' + s.toFixed(3) + ')';
        }
        box.style.opacity = (1 - seg(p, aEnd * 0.8, aEnd)).toFixed(3);
      });
      ww.style.clipPath = 'inset(' + T.toFixed(1) + 'px ' + (VW - L - w).toFixed(1) + 'px ' + (VH - T - h).toFixed(1) + 'px ' + L.toFixed(1) + 'px round ' + rad.toFixed(1) + 'px)';
      var mk = a > 0.005 && a < 0.95 ? 1 : 0;
      [[L - 16, T - 16], [L + w + 5, T - 16], [L - 16, T + h + 5], [L + w + 5, T + h + 5]].forEach(function (q, j) { marks[j].style.transform = 'translate(' + q[0].toFixed(1) + 'px,' + q[1].toFixed(1) + 'px)'; marks[j].style.opacity = mk; });
      stick.setAttribute('data-dark', a > 0.85 ? '1' : '0');
      // fase 2: cada filme avança/volta com a rolagem (≈ 2 telas por filme, com pausa no começo)
      var b = seg(p, bStart, 1), f = b * N, i = Math.min(N - 1, Math.floor(f)), t = b >= 1 ? 1 : f - i;
      if (i !== cur) chapter(i);
      vids.forEach(function (v, j) {
        var o = j === i ? 1 : (j === i + 1 ? ease(seg(t, 0.86, 1)) : 0);
        v.style.opacity = o > 0 ? 1 : 0; v.style.zIndex = j === i + 1 ? 1 : 0; // o próximo filme sobe como uma cortina
        v.style.clipPath = j === i + 1 ? 'inset(' + ((1 - o) * 100).toFixed(2) + '% 0 0 0)' : '';
        // a rolagem só define o ALVO; quem anda até ele é o laço abaixo, no máximo em tempo real
        targets[j] = j === i ? seg(t, 0.05, 0.86) * Math.max(0, (v.duration || 0) - 0.05) : (j === i + 1 ? 0 : null);
      });
      if (vids[i + 1] && vids[i + 1].preload !== 'auto' && t > 0.5) vids[i + 1].preload = 'auto';
      var on = seg(p, bStart, bStart + 0.025), fadeIn = i > 0 ? seg(t, 0, 0.1) : 1, fadeOut = i < N - 1 ? 1 - seg(t, 0.88, 0.98) : 1;
      ov.style.opacity = (on * fadeIn * fadeOut).toFixed(3); ov.style.transform = 'translateY(' + ((1 - fadeIn) * 30).toFixed(1) + 'px)';
      meta.style.opacity = on.toFixed(3);
      segs.forEach(function (sg, j) { sg.style.transform = 'scaleX(' + (j < i ? 1 : j === i ? t : 0).toFixed(3) + ')'; });
    }
    function req() { if (!queued) { queued = true; requestAnimationFrame(update); } }
    // laço do "tocador": aproxima o vídeo do alvo no máximo a 1× (para trás até 2×). Se a pessoa rolar rápido,
    // o filme continua tocando sozinho até alcançar a rolagem; nunca dispara acelerado.
    var targets = [], shown = vids.map(function () { return 0; }), running = false, lastTs = 0, loopRaf = 0, SPEED = 1;
    function loop(ts) {
      if (!running) { loopRaf = 0; return; }
      var dt = lastTs ? Math.min(0.1, (ts - lastTs) / 1000) : 0.016; lastTs = ts;
      vids.forEach(function (v, j) {
        var tg = targets[j]; if (tg == null) return;
        shown[j] = tg;
        if (v.readyState >= 1 && v.duration && !v.seeking && Math.abs(v.currentTime - shown[j]) > 0.03) v.currentTime = shown[j];
        frame(v, j);
      });
      $('[data-rtc]', sec).textContent = '00:' + pad(Math.floor(shown[cur] || 0));
      loopRaf = requestAnimationFrame(loop);
    }
    var vis = new IntersectionObserver(function (es) {
      running = es[0].isIntersecting;
      if (running && !loopRaf) { lastTs = 0; loopRaf = requestAnimationFrame(loop); }
    });
    vis.observe(sec);
    onCleanup(function () { running = false; vis.disconnect(); cancelAnimationFrame(loopRaf); });
    function move(e) { var r = stick.getBoundingClientRect(); playb.style.left = (e.clientX - r.left) + 'px'; playb.style.top = (e.clientY - r.top) + 'px'; playb.classList.add('on'); }
    if (fine) { card.addEventListener('pointermove', move); card.addEventListener('pointerleave', function () { playb.classList.remove('on'); }); }
    function rs() { measure(); req(); }
    window.addEventListener('scroll', req, { passive: true }); window.addEventListener('resize', rs);
    measure(); chapter(0); update();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rs);
    onCleanup(function () { window.removeEventListener('scroll', req); window.removeEventListener('resize', rs); vids.forEach(function (v) { v.removeAttribute('src'); v.load(); }); });
  }

  /* ---------- grade/índice com troca e prévia no índice ---------- */
  function mountWork(box, togEl) {
    if (!box) return;
    setupTog(togEl || $('[data-view]', box), function (v) { box.classList.toggle('list', v === 'list'); PEEK.hide(); });
    bindPeek($('.index', box));
  }

  /* ---------- seis universos: grade que expande ---------- */
  function mountBento(root) {
    var grid = $('[data-bx]', root); if (!grid) return;
    var tiles = $$('.bx__tile', grid), N = tiles.length, mq = window.matchMedia('(max-width: 800px)');
    var cs = document.createElement('div');
    cs.className = 'bx__case'; cs.setAttribute('role', 'dialog'); cs.setAttribute('aria-label', 'Categoria aberta');
    cs.innerHTML = '<div class="bx__box"></div><button class="nb bx__close" type="button" aria-label="Fechar">' + ICON.close + '</button>' +
      '<div class="bx__panel"><div class="bx__ptop mono"><span data-k="num"></span><span>Coleção 2026</span></div>' +
        '<h3 class="bx__pt" data-k="name"></h3><p class="bx__tag" data-k="tag"></p><p class="bx__desc" data-k="desc"></p><div class="bx__res" data-k="res"></div>' +
        '<div class="bx__acts"><a class="pill dk" href="#/colecao" data-k="more"><i></i>Explorar</a>' +
        '<button class="nb" type="button" data-k="prev" aria-label="Categoria anterior">' + ICON.left + '</button>' +
        '<button class="nb" type="button" data-k="next" aria-label="Próxima categoria">' + ICON.arrow + '</button></div></div>';
    grid.appendChild(cs);
    var box = $('.bx__box', cs), K = function (k) { return $('[data-k="' + k + '"]', cs); }, open = -1, busy = false, raf = 0;
    function rectOf(el) { var g = grid.getBoundingClientRect(), r = el.getBoundingClientRect(); return [r.left - g.left, r.top - g.top, r.width, r.height]; }
    function target() { var W = grid.clientWidth, H = grid.clientHeight; return mq.matches ? [0, 0, W, H * 0.38] : [0, 0, W * 0.64 - 6, H]; }
    function place(r) { box.style.left = r[0] + 'px'; box.style.top = r[1] + 'px'; box.style.width = r[2] + 'px'; box.style.height = r[3] + 'px'; }
    function tween(a, b, dur, done) {
      cancelAnimationFrame(raf); var t0 = performance.now(); dur = reduce ? 1 : dur;
      (function tick(t) { var p = Math.min(1, (t - t0) / dur), e = ease(p); place(a.map(function (v, k) { return v + (b[k] - v) * e; })); if (p < 1) raf = requestAnimationFrame(tick); else if (done) done(); })(t0);
    }
    function artClone(i) { var a = $('.bx__art', tiles[i]).cloneNode(true); a.setAttribute('style', tiles[i].getAttribute('style')); return a; }
    function fill(i) {
      var c = D.categories[i], vs = inCat(c.id);
      K('num').innerHTML = '<b>' + pad(i + 1) + '</b> / ' + pad(N);
      K('name').textContent = c.name; K('tag').textContent = c.tagline; K('desc').textContent = c.desc;
      K('res').innerHTML = '<div><b>' + pad(vs.length) + '</b>modelos</div><div><b>' + short(minPrice(c.id)) + '</b>a partir de</div><div><b>' + esc(c.perk[0]) + '</b>' + esc(c.perk[1]) + '</div>';
      var m = K('more'); m.setAttribute('href', '#/colecao/' + c.id); m.setAttribute('data-title', c.name); m.innerHTML = '<i></i>Explorar ' + esc(c.name);
    }
    function show(i) {
      if (busy || open >= 0) return; busy = true; open = i;
      box.innerHTML = ''; box.appendChild(artClone(i)); fill(i);
      var from = rectOf(tiles[i]); place(from); grid.classList.add('is-open');
      tween(from, target(), 760, function () { busy = false; grid.classList.add('is-panel'); setTimeout(function () { $('.bx__close', cs).focus({ preventScroll: true }); }, 60); });
      setTimeout(function () { grid.classList.add('is-panel'); }, reduce ? 0 : 420);
    }
    function hide() {
      if (busy || open < 0) return; busy = true; var i = open; grid.classList.remove('is-panel');
      tween(target(), rectOf(tiles[i]), 640, function () { grid.classList.remove('is-open'); open = -1; busy = false; tiles[i].focus({ preventScroll: true }); });
    }
    function go(d) {
      if (busy || open < 0) return; var i = (open + d + N) % N; open = i; busy = true;
      var old = box.firstChild, nu = artClone(i);
      grid.classList.remove('is-panel');
      nu.style.clipPath = d > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'; nu.style.transition = reduce ? 'none' : 'clip-path .7s cubic-bezier(.7,0,.2,1)';
      box.appendChild(nu); void nu.offsetWidth; nu.style.clipPath = 'inset(0 0 0 0)';
      setTimeout(function () { if (old && old.parentNode === box) box.removeChild(old); nu.style.clipPath = ''; nu.style.transition = ''; fill(i); grid.classList.add('is-panel'); busy = false; }, reduce ? 0 : 720);
    }
    tiles.forEach(function (t, i) { t.addEventListener('click', function () { show(i); }); });
    $('.bx__close', cs).addEventListener('click', hide);
    K('next').addEventListener('click', function () { go(1); });
    K('prev').addEventListener('click', function () { go(-1); });
    box.addEventListener('click', hide);
    function key(e) { if (open < 0) return; if (e.key === 'Escape') { e.preventDefault(); hide(); } else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } }
    function rs() { if (open >= 0 && !busy) place(target()); }
    document.addEventListener('keydown', key); window.addEventListener('resize', rs);
    onCleanup(function () { document.removeEventListener('keydown', key); window.removeEventListener('resize', rs); cancelAnimationFrame(raf); });
  }

  /* ---------- final escuro: as fotos se encaixam como uma garagem ---------- */
  function finHTML() {
    var words = ['Cada', 'quilômetro', '\n', 'começa', 'com', 'uma', '\n', 'escolha', 'certa.'];
    return '<section class="fin" data-fin>' +
      '<div class="stick" data-fstick>' +
        '<div class="tiles" data-ftiles aria-hidden="true">' + GARAGE.map(function (v) { return '<span class="tl">' + (v.img ? '<img loading="lazy" src="' + esc(v.img) + '" alt="">' : '') + '</span>'; }).join('') + '</div>' +
        '<div class="vig"></div>' +
        '<div class="kin"><div class="blk" data-kin>' + words.map(function (w) { return w === '\n' ? '<br>' : '<span class="kw">' + w + '</span> '; }).join('') + '</div></div>' +
        '<div class="end" data-fend><h3>' + D.vehicles.length + ' veículos.<br>Nenhum <em>igual.</em></h3><p class="mono">Terra, mar e ar: inspecionados, documentados e prontos para a entrega.</p></div>' +
        '<div class="cap mono"><span><b>■</b> Fig. 07: a garagem</span><span data-fcount>00 / ' + pad(D.vehicles.length) + ' na garagem</span></div>' +
        '<div class="grain"></div><div class="flood" data-flood></div>' +
      '</div>' +
    '</section>';
  }
  function mountFin(root) {
    var sec = $('[data-fin]', root); if (!sec) return;
    var stick = $('[data-fstick]', sec), tls = $$('.tl', sec), kws = $$('.kw', sec), end = $('[data-fend]', sec), flood = $('[data-flood]', sec), cnt = $('[data-fcount]', sec);
    var N = tls.length, queued = false;
    function rnd(i, k) { var x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); }
    function update() {
      queued = false;
      var r = sec.getBoundingClientRect(), VW = stick.clientWidth, VH = stick.clientHeight, total = sec.offsetHeight - VH;
      if (r.bottom < -50 || r.top > VH + 50) return;
      var p = clamp(-r.top / total);
      var cols = VW < 760 ? 3 : 6, rows = Math.ceil(N / cols), tw = Math.min(VW * (VW < 760 ? 0.28 : 0.13), 200), th = tw * 0.7, gp = 10;
      var gw = cols * tw + (cols - 1) * gp, gh = rows * th + (rows - 1) * gp, done = 0;
      tls.forEach(function (el, i) {
        var k = eo(seg(p, 0.04 + i * 0.016, 0.34 + i * 0.016)); if (k > 0.98) done++;
        var cx = -gw / 2 + (i % cols) * (tw + gp), cy = -gh / 2 + Math.floor(i / cols) * (th + gp);
        var sx = (rnd(i, 1) - 0.5) * VW * 1.8, sy = (rnd(i, 2) - 0.5) * VH * 2 + (rnd(i, 3) > 0.5 ? VH : -VH) * 0.6, sr = (rnd(i, 4) - 0.5) * 70;
        el.style.width = tw + 'px'; el.style.height = th + 'px';
        el.style.transform = 'translate(' + lerp(sx, cx, k).toFixed(1) + 'px,' + lerp(sy, cy, k).toFixed(1) + 'px) rotate(' + lerp(sr, 0, k).toFixed(2) + 'deg) scale(' + lerp(1.7, 1, k).toFixed(3) + ')';
        el.style.opacity = (Math.min(1, k * 1.4) * (lerp(0.9, 0.22, seg(p, 0.16, 0.3)) + seg(p, 0.58, 0.7) * 0.3)).toFixed(3);
      });
      cnt.textContent = pad(done) + ' / ' + pad(N) + ' na garagem';
      kws.forEach(function (el, i) {
        var k = eo(seg(p, 0.08 + i * 0.025, 0.36 + i * 0.025)), out = seg(p, 0.52, 0.62);
        var dx = (rnd(i, 7) - 0.5) * VW * 0.8, dy = (rnd(i, 8) - 0.5) * VH * 0.7, dr = (rnd(i, 9) - 0.5) * 50;
        el.style.transform = 'translate(' + lerp(dx, 0, k).toFixed(1) + 'px,' + (lerp(dy, 0, k) - out * 40).toFixed(1) + 'px) rotate(' + lerp(dr, 0, k).toFixed(2) + 'deg)';
        el.style.opacity = (k * (1 - out)).toFixed(3);
      });
      var e = seg(p, 0.6, 0.7); end.style.opacity = e.toFixed(3); end.style.transform = 'translateY(' + ((1 - e) * 30).toFixed(1) + 'px)';
      var fl = ease(seg(p, 0.82, 1)); flood.style.clipPath = 'circle(' + (fl * 120).toFixed(2) + '% at 50% 46%)';
      stick.setAttribute('data-dark', fl < 0.45 ? '1' : '0');
    }
    function req() { if (!queued) { queued = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', req, { passive: true }); window.addEventListener('resize', req);
    update();
    onCleanup(function () { window.removeEventListener('scroll', req); window.removeEventListener('resize', req); });
  }

  /* ================================================================
     PÁGINA: COLEÇÃO
     ================================================================ */
  function pageCollection(catId) {
    var st = { cat: CAT[catId] ? catId : 'todos', q: '', sort: 'destaque' };
    var tabs = [['todos', 'Todos', pad(D.vehicles.length)]].concat(D.categories.map(function (c) { return [c.id, c.name, pad(inCat(c.id).length)]; }));
    function title() { return st.cat === 'todos' ? 'Coleção' : CAT[st.cat].name; }
    function blurb() { return st.cat === 'todos' ? 'Terra, mar e ar: veículos selecionados e inspecionados. Escolha aqui e agende para ver de perto.' : CAT[st.cat].tagline; }
    var h =
      '<section class="phead"><div class="row">' +
        '<div><p class="mono" style="display:flex;align-items:center;gap:10px"><span class="sq o"></span>A coleção AUREON</p>' +
          '<h1 class="big rv"><span class="ln"><span><span data-ptitle>' + esc(title()) + '</span><sup data-pcount></sup></span></span></h1></div>' +
        '<div class="r"><p class="blurb mono fade" data-pblurb>' + esc(blurb()) + '</p>' + togHTML('data-view', [['grid', 'Grade'], ['list', 'Índice']], 'grid') + '</div>' +
      '</div></section>' +
      '<div class="bar">' + togHTML('data-cats', tabs, st.cat) +
        '<div class="r"><label class="search">' + ICON.search + '<span class="sr">Buscar</span><input type="search" data-q placeholder="Buscar modelo ou marca"></label>' +
        '<div class="sort-control" data-sort-control>' +
          '<button class="sort-trigger" type="button" data-sort-trigger aria-label="Ordenar veículos" aria-haspopup="listbox" aria-expanded="false" aria-controls="sort-options"><span data-sort-label>Destaques</span><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></button>' +
          '<div class="sort-menu" id="sort-options" data-sort-menu role="listbox" aria-label="Ordenar veículos" hidden>' +
            '<button class="sort-option" type="button" role="option" data-sort-value="destaque" aria-selected="true">Destaques</button>' +
            '<button class="sort-option" type="button" role="option" data-sort-value="asc" aria-selected="false">Menor preço</button>' +
            '<button class="sort-option" type="button" role="option" data-sort-value="desc" aria-selected="false">Maior preço</button>' +
            '<button class="sort-option" type="button" role="option" data-sort-value="ano" aria-selected="false">Mais recentes</button>' +
          '</div>' +
        '</div></div>' +
      '</div>' +
      '<section class="sect" data-work><div class="grid even" data-grid></div><div class="index" data-index></div></section>';
    return {
      title: title(), html: h,
      mount: function (root) {
        var work = $('[data-work]', root), grid = $('[data-grid]', root), index = $('[data-index]', root);
        function draw() {
          var q = norm(st.q.trim());
          var list = D.vehicles.filter(function (v) { return (st.cat === 'todos' || v.cat === st.cat) && (!q || norm(v.brand + ' ' + v.model + ' ' + CAT[v.cat].name + ' ' + v.tag).indexOf(q) >= 0); });
          if (st.sort === 'asc') list.sort(function (a, b) { return a.price - b.price; });
          else if (st.sort === 'desc') list.sort(function (a, b) { return b.price - a.price; });
          else if (st.sort === 'ano') list.sort(function (a, b) { return b.year - a.year; });
          else list.sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); });
          var empty = '<div class="empty" style="grid-column:1/-1"><p>Nada com esse filtro.</p><a class="pill dk" href="#/concierge/contato" data-title="Concierge"><i></i>Peça ao concierge: buscamos fora do catálogo</a></div>';
          grid.innerHTML = list.length ? list.map(function (v, i) { return pcCard(v, i, list.length); }).join('') : empty;
          index.innerHTML = list.length ? list.map(irowV).join('') : empty;
          $('[data-pcount]', root).textContent = '(' + pad(list.length) + ')';
          reveal(work);
        }
        mountWork(work, $('[data-view]', root));
        setupTog($('[data-cats]', root), function (v) {
          st.cat = v;
          $('[data-ptitle]', root).textContent = title(); $('[data-pblurb]', root).textContent = blurb();
          var hh = v === 'todos' ? '#/colecao' : '#/colecao/' + v;
          current = hh.slice(1); try { history.replaceState(null, '', hh); } catch (e) {}
          document.title = title() + ' — AUREON';
          draw();
        });
        var qi = $('[data-q]', root), qt = 0;
        qi.addEventListener('input', function () { clearTimeout(qt); qt = setTimeout(function () { st.q = qi.value; draw(); }, 140); });
        var sortControl = $('[data-sort-control]', root), sortTrigger = $('[data-sort-trigger]', sortControl);
        var sortMenu = $('[data-sort-menu]', sortControl), sortOptions = $$('.sort-option', sortMenu), sortLabel = $('[data-sort-label]', sortTrigger);
        function closeSort(restoreFocus) {
          sortMenu.hidden = true; sortTrigger.setAttribute('aria-expanded', 'false'); sortTrigger.classList.remove('is-open');
          if (restoreFocus) sortTrigger.focus({ preventScroll: true });
        }
        function openSort(index) {
          sortMenu.hidden = false; sortTrigger.setAttribute('aria-expanded', 'true'); sortTrigger.classList.add('is-open');
          var active = index == null ? sortOptions.findIndex(function (o) { return o.getAttribute('aria-selected') === 'true'; }) : index;
          sortOptions[Math.max(0, active)].focus({ preventScroll: true });
        }
        function chooseSort(option) {
          st.sort = option.getAttribute('data-sort-value'); sortLabel.textContent = option.textContent;
          sortOptions.forEach(function (o) { o.setAttribute('aria-selected', o === option ? 'true' : 'false'); });
          closeSort(true); draw();
        }
        function sortOutside(e) { if (!sortControl.contains(e.target) && !sortMenu.hidden) closeSort(false); }
        function sortFocusOut() { setTimeout(function () { if (!sortControl.contains(document.activeElement)) closeSort(false); }, 0); }
        sortTrigger.addEventListener('click', function () { if (sortMenu.hidden) openSort(); else closeSort(false); });
        sortTrigger.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSort(e.key === 'ArrowUp' ? sortOptions.length - 1 : null); }
        });
        sortMenu.addEventListener('click', function (e) { var option = e.target.closest('[data-sort-value]'); if (option) chooseSort(option); });
        sortMenu.addEventListener('keydown', function (e) {
          var active = sortOptions.indexOf(document.activeElement);
          if (e.key === 'Escape') { e.preventDefault(); closeSort(true); }
          else if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End') {
            e.preventDefault();
            var next = e.key === 'Home' ? 0 : e.key === 'End' ? sortOptions.length - 1 : (active + (e.key === 'ArrowDown' ? 1 : -1) + sortOptions.length) % sortOptions.length;
            sortOptions[next].focus();
          }
        });
        sortControl.addEventListener('focusout', sortFocusOut); document.addEventListener('click', sortOutside);
        onCleanup(function () { sortControl.removeEventListener('focusout', sortFocusOut); document.removeEventListener('click', sortOutside); });
        draw();
      }
    };
  }

  /* ================================================================
     PÁGINA: VEÍCULO
     ================================================================ */
  function pageDetail(v) {
    var c = CAT[v.cat];
    var rel = inCat(v.cat).filter(function (x) { return x.id !== v.id; });
    D.vehicles.forEach(function (x) { if (rel.length < 3 && x.cat !== v.cat && x.featured) rel.push(x); });
    rel = rel.slice(0, 3);
    var dp = 30, n = 48;
    var h =
      '<div class="vd">' +
      '<section class="hero">' +
        '<div class="win" data-win style="' + vStyle(v) + '">' +
          (v.img ? '<img class="still" src="' + esc(v.img) + '" alt="' + esc(v.brand + ' ' + v.model) + '">' : '<div class="still" style="position:absolute;inset:15% 8%">' + ART.svg(c.art, {}) + '</div>') +
          '<div class="corner mono">Fig. — ' + esc(c.name) + ': <b>' + esc(v.tag) + '</b></div>' +
          '<button class="go mono" type="button" data-propose="' + v.id + '">Agendar visita ↗</button>' +
        '</div>' +
        '<div class="tab" data-tab><h1 data-h1><span class="mono">' + esc(v.brand) + ' · ' + v.year + '</span><span class="ln"><span class="h1">' + esc(v.model) + '</span></span></h1></div>' +
        '<div class="hrow mono"><div><span class="sq o"></span>' + esc(c.singular) + ' · ' + v.year + '</div><div><span class="sq"></span>' + esc(v.specs[0][0] + ': ' + v.specs[0][1]) + '</div><div><span class="sq"></span>' + short(v.price) + '</div><div class="scroll">Role <i></i></div></div>' +
      '</section>' +
      '<section class="vgrid">' +
        '<div class="rv"><p class="mono" style="color:var(--mute)">Sobre</p><p class="lead fade" style="margin-top:16px">' + esc(v.desc) + '</p>' +
          '<p class="mono" style="margin-top:34px;color:var(--mute)">Acabamento · <b data-fin-name style="color:var(--ink);font-weight:500">' + esc(v.finishes[0].name) + '</b></p>' +
          '<div class="fins fade" role="group" aria-label="Acabamentos">' + v.finishes.map(function (f, i) { return '<button class="fin-b" type="button" data-fin="' + i + '" aria-pressed="' + (i === 0) + '" style="--c:' + f.color + '"><i></i>' + esc(f.name) + '</button>'; }).join('') + '</div>' +
        '</div>' +
        '<div class="rv"><p class="mono" style="color:var(--mute)">Valor de referência</p><p class="price fade" style="margin-top:12px">' + money(v.price) + '</p><p class="fade">Venda feita pessoalmente, na loja. Veja de perto em: <b style="font-weight:500">' + esc(c.local) + '</b></p>' +
          '<div class="acts fade"><button class="pill dk" type="button" data-propose="' + v.id + '"><i></i>Agendar visita</button>' +
            '<a class="pill" href="' + esc(waLink('Olá! Quero agendar uma visita para ver o ' + v.brand + ' ' + v.model + '.')) + '" target="_blank" rel="noopener"><i></i>Chamar no WhatsApp</a>' +
            '<button class="pill" type="button" data-fav="' + v.id + '" aria-pressed="false">' + ICON.heart + '<span data-fav-txt>Adicionar à visita</span></button></div>' +
          '<ul class="incl">' + [c.teste, 'Onde ver: ' + c.local, 'Inspeção independente de 240 pontos', 'Documentação e transferência feitas pela loja'].map(function (t) { return '<li class="fade"><span class="sq o"></span>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        '</div>' +
      '</section>' +
      '<section class="specs"><div class="whead" style="margin-bottom:40px"><h2 class="rv"><span class="ln"><span>Ficha técnica<sup>(' + pad(v.specs.length) + ')</sup></span></span></h2></div>' +
        '<div class="index" style="display:block">' + v.specs.map(function (s, i) { return '<div class="irow"><span class="mono">' + pad(i + 1) + '</span><span class="mono">' + esc(s[0]) + '</span><b>' + esc(s[1]) + '</b></div>'; }).join('') + '</div>' +
      '</section>' +
      '<section class="sim" aria-label="Simulador de financiamento">' +
        '<div class="a"><p class="mono" style="display:flex;align-items:center;gap:10px"><span class="sq o"></span>Simulador</p><h2>Planeje antes da visita</h2><p>Uma simulação para você chegar à loja já com uma ideia. Na visita, o concierge refina com as melhores taxas do mercado.</p>' +
          '<div class="f"><span class="mono">Entrada <b data-sim-dpv></b></span><input type="range" min="20" max="80" step="5" value="' + dp + '" data-sim-dp aria-label="Percentual de entrada"></div>' +
          '<div class="f"><span class="mono">Prazo</span>' + togHTML('data-sim-n', [['24', '24x'], ['36', '36x'], ['48', '48x'], ['60', '60x']], String(n)) + '</div>' +
        '</div>' +
        '<div class="b"><div><p class="mono" style="color:rgba(248,247,243,.6)">Parcela estimada</p><b class="pmt" data-sim-pmt></b>' +
          '<dl><div><dt>Valor financiado</dt><dd data-sim-fin></dd></div><div><dt>Taxa de referência</dt><dd>0,89% a.m.</dd></div><div><dt>Total ao final</dt><dd data-sim-tot></dd></div></dl></div>' +
          '<div><button class="pill bl" type="button" data-propose="' + v.id + '"><i></i>Agendar visita para conversar</button><p class="note">*Simulação ilustrativa, sujeita a análise de crédito.</p></div>' +
        '</div>' +
      '</section>' +
      '<section class="work" style="padding-top:0"><div class="whead"><h2 class="rv"><span class="ln"><span>Da mesma linhagem<sup>(' + pad(rel.length) + ')</sup></span></span></h2><a class="pill" href="#/colecao/' + c.id + '" data-title="' + esc(c.name) + '"><i></i>Todos em ' + esc(c.name) + '</a></div>' +
        '<div class="grid even">' + rel.map(function (x, i) { return pcCard(x, i, rel.length); }).join('') + '</div></section>' +
      '</div>';
    return {
      title: v.brand + ' ' + v.model, html: h,
      mount: function (root) {
        notch($('[data-win]', root), $('[data-tab]', root));
        onCleanup(RIB.attach($('.vgrid', root), 'b'));
        setTimeout(function () { $('[data-h1]', root).classList.add('in'); }, 120);
        var nm = $('[data-fin-name]', root), fb = $$('[data-fin]', root), win = $('[data-win]', root);
        fb.forEach(function (b) {
          b.addEventListener('click', function () {
            var f = v.finishes[+b.getAttribute('data-fin')]; nm.textContent = f.name; win.style.setProperty('--body', f.color);
            fb.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
          });
        });
        var rng = $('[data-sim-dp]', root), m = n;
        function calc() {
          var d = +rng.value, p = pmt(v.price, d, m);
          $('[data-sim-dpv]', root).textContent = d + '% · ' + money(v.price * d / 100);
          $('[data-sim-pmt]', root).textContent = money(p);
          $('[data-sim-fin]', root).textContent = money(v.price * (1 - d / 100));
          $('[data-sim-tot]', root).textContent = money(p * m + v.price * d / 100);
        }
        rng.addEventListener('input', calc);
        setupTog($('[data-sim-n]', root), function (val) { m = +val; calc(); });
        calc();
      }
    };
  }

  /* ================================================================
     PÁGINA: CONCIERGE
     ================================================================ */
  function pageConcierge() {
    var svc = [
      ['Financiamento & leasing', 'Crédito com bancos parceiros, leasing para empresas e compra compartilhada de aeronaves e iates.'],
      ['Troca (trade-in)', 'Avaliamos o seu veículo atual — de um carro a um jato — e abatemos o valor na negociação, no mesmo dia da visita.'],
      ['Entrega global', 'Transporte fechado, traslado aéreo ou travessia por mar até a sua garagem, hangar ou marina.'],
      ['Hangar & marina', 'Vagas em hangares e marinas parceiras, com gestão de manutenção, limpeza e seguro.'],
      ['Documentação', 'Detran, ANAC e Marinha do Brasil: transferência, registro e licenças resolvidos pela nossa equipe.'],
      ['Tripulação', 'Seleção de pilotos, comandantes e marinheiros, e treinamento para você assumir os controles.']
    ];
    var h =
      '<section class="phead"><div class="row"><div><p class="mono" style="display:flex;align-items:center;gap:10px"><span class="sq o"></span>Concierge AUREON · 24/7</p>' +
        '<h1 class="big rv"><span class="ln"><span>Um só contato.</span></span><span class="ln"><span><em style="color:var(--acc-t)">Para tudo.</em></span></span></h1></div>' +
        '<div class="r"><p class="blurb mono fade">Da primeira conversa à primeira viagem: crédito, documentação, entrega e o que mais vier.</p><a class="pill dk fade" href="#/concierge/contato" data-title="Concierge"><i></i>Agendar visita</a></div></div></section>' +
      '<section class="svc"><div class="whead" style="margin-bottom:40px"><h2 class="rv"><span class="ln"><span>Serviços<sup>(06)</sup></span></span></h2></div>' +
        '<div class="index" style="display:block">' + svc.map(function (s, i) { return '<div class="irow"><span class="mono">' + pad(i + 1) + '</span><b>' + s[0] + '</b><p>' + s[1] + '</p><span>↗</span></div>'; }).join('') + '</div></section>' +
      '<div class="steps">' + processSteps().map(function (s, i) { return '<div class="step fade" style="--d:' + i * 0.08 + 's"><span class="mono">' + pad(i + 1) + ' / Processo</span><div><b>' + s[0] + '</b><p>' + s[1] + '</p></div></div>'; }).join('') + '</div>' +
      '<section class="quote"><blockquote class="rv"><span class="ln"><span>“Comprei o carro, o helicóptero</span></span><span class="ln"><span>e a lancha com a mesma pessoa.”</span></span></blockquote><cite class="mono fade">Cliente AUREON desde 2019 · depoimento ilustrativo</cite></section>' +
      '<section class="contact" id="contato">' +
        '<div class="rv"><p class="mono" style="display:flex;align-items:center;gap:10px"><span class="sq o"></span>Agende uma visita</p>' +
          '<h2 class="big" style="font-size:clamp(46px,6vw,92px);margin-top:16px"><span class="ln"><span>Showroom</span></span><span class="ln"><span>com hora marcada.</span></span></h2>' +
          '<dl><div class="fade"><dt class="mono">Showroom</dt><dd>Jardins, São Paulo</dd></div><div class="fade"><dt class="mono">Atendimento</dt><dd>Seg a sáb · 10h às 20h</dd></div>' +
          '<div class="fade"><dt class="mono">WhatsApp</dt><dd><a href="https://wa.me/5511900000000" target="_blank" rel="noopener">+55 11 90000-0000</a></dd></div>' +
          '<div class="fade"><dt class="mono">E-mail</dt><dd><a href="mailto:concierge@aureon.com.br">concierge@aureon.com.br</a></dd></div></dl>' +
        '</div>' +
        '<form class="form fade" data-demo-form="contato">' +
          '<div class="field-row"><div class="field"><label class="mono" for="c-nome">Nome</label><input id="c-nome" name="nome" required autocomplete="name"></div>' +
          '<div class="field"><label class="mono" for="c-tel">WhatsApp</label><input id="c-tel" name="tel" type="tel" required autocomplete="tel" placeholder="(11) 90000-0000"></div></div>' +
          '<fieldset class="field"><legend class="mono" style="margin-bottom:8px">Onde quer visitar</legend><div class="chips">' +
            D.categories.map(function (c) { return c.local; }).filter(function (l, i, a) { return a.indexOf(l) === i; }).map(function (l, i) { return '<label><input type="radio" name="local" value="' + esc(l) + '"' + (i === 0 ? ' checked' : '') + '><span>' + esc(l.split(' · ')[0]) + '</span></label>'; }).join('') +
          '</div></fieldset>' +
          '<div class="field-row"><div class="field"><label class="mono" for="c-data">Dia preferido</label><input id="c-data" name="data" type="date" required data-min-today></div>' +
          '<div class="field"><label class="mono" for="c-per">Período</label><select id="c-per" name="periodo"><option>Manhã (10h–12h)</option><option>Tarde (13h–17h)</option><option>Fim de tarde (17h–20h)</option></select></div></div>' +
          '<div class="field"><label class="mono" for="c-msg">O que você quer ver</label><textarea id="c-msg" name="msg" placeholder="Modelos, test drive, voo de demonstração, passeio de teste…"></textarea></div>' +
          '<button class="pill dk bl" type="submit"><i></i>Pedir horário</button>' +
          '<p class="note-s">Nada é vendido pelo site. Confirmamos o horário pelo WhatsApp em até 2 horas.</p>' +
        '</form>' +
      '</section>';
    return { title: 'Concierge', html: h, mount: function (root) { onCleanup(RIB.attach($('.phead', root), 'a')); minToday(root); } };
  }

  function pageNotFound() {
    return { title: 'Página não encontrada', html: '<section class="nf"><div><p class="mono">Erro 404</p><h1 class="big rv"><span class="ln"><span>Fora do mapa.</span></span></h1><a class="pill dk" href="#/" data-title="Início"><i></i>Voltar ao início</a></div></section>' };
  }

  /* ================================================================
     ROTEADOR
     ================================================================ */
  var current = null, cleanups = [];
  function onCleanup(fn) { cleanups.push(fn); }
  function teardown() { cleanups.forEach(function (f) { try { f(); } catch (e) {} }); cleanups = []; }
  function parse(h) {
    h = String(h == null ? location.hash : h).replace(/^#/, '');
    if (h.charAt(0) !== '/') h = '/';
    var parts = h.split('/').filter(Boolean);
    return { path: '/' + parts.join('/'), parts: parts };
  }
  var PAGE_N = { '': '01', colecao: '02', veiculo: '03', concierge: '04' };

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }) : null;
  function reveal(root) { $$('.rv:not(.in), .fade:not(.in), .pc:not(.in)', root).forEach(function (el) { if (io && !reduce) io.observe(el); else el.classList.add('in'); }); }

  function render(hash) {
    var r = parse(hash);
    if (r.path === current) return;
    current = r.path; teardown(); closeAll();
    var p = r.parts, page;
    if (!p.length) page = pageHome();
    else if (p[0] === 'colecao') page = pageCollection(p[1]);
    else if (p[0] === 'veiculo' && VEH[p[1]]) page = pageDetail(VEH[p[1]]);
    else if (p[0] === 'concierge') page = pageConcierge();
    else page = pageNotFound();
    view.innerHTML = page.html;
    document.title = page.title ? page.title + ' — AUREON' : 'AUREON — Veículos de alto padrão';
    toY(0, false);
    setNav(p[0] || '');
    if (page.mount) page.mount(view);
    reveal(view);
    updateSelUI();
    if (p[0] === 'concierge' && p[1]) { var t = document.getElementById(p[1]); if (t) setTimeout(function () { toEl(t, false); }, 30); }
    chromeShow(); onScroll();
    try { view.focus({ preventScroll: true }); } catch (e) {}
  }
  function setNav(base) {
    var b = base === 'veiculo' ? 'colecao' : base;
    $$('#menu [data-nav]').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-nav') === b); });
  }

  // links internos (#/...) passam pela transição de tinta
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest('a[href^="#/"]') : null; if (!a) return;
    e.preventDefault();
    var href = a.getAttribute('href'), tp = parse(href), cp = parse('#' + (current || '/'));
    closeAll();
    if (tp.parts[0] === 'concierge' && cp.parts[0] === 'concierge') { var t = tp.parts[1] && document.getElementById(tp.parts[1]); if (t) toEl(t, true); else toY(0, true); return; }
    if (tp.path === current) { toY(0, true); return; }
    var label = a.getAttribute('data-title') || a.textContent.replace(/\s+/g, ' ').trim() || 'AUREON';
    var x = e.clientX, y = e.clientY;
    if (!x && !y) { var rr = a.getBoundingClientRect(); x = rr.left + rr.width / 2; y = rr.top + rr.height / 2; }
    INK.go({ label: label, n: PAGE_N[tp.parts[0] || ''] || '01', x: x, y: y, swap: function () {
      render(href);
      try { history.pushState(null, '', href); } catch (err) { location.hash = href; }
    } });
  });
  window.addEventListener('popstate', function () { render(location.hash); });
  window.addEventListener('hashchange', function () { render(location.hash); });

  /* ================================================================
     CABEÇALHO, MENU, INDICADOR, GAVETA, AVISOS
     ================================================================ */
  var chrome = $('#chrome'), mbtn = $('#mbtn'), menu = $('#menu'), gauge = $('#gauge'), gnum = $('#gnum'), gbar = $('#gbar');
  var drawer = $('[data-drawer]'), scrim = $('[data-scrim]'), lastY = 0;
  function chromeShow() { chrome.classList.remove('hid'); document.body.classList.remove('chrome-hid'); }
  function darkAt(y) {
    return $$('[data-dark="1"]').some(function (el) { var r = el.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
  }
  function onScroll() {
    var y = window.pageYOffset, max = document.documentElement.scrollHeight - window.innerHeight, p = max > 0 ? clamp(y / max) : 0;
    gnum.textContent = ('00' + Math.round(p * 100)).slice(-3); gbar.style.transform = 'scaleY(' + p.toFixed(4) + ')';
    gauge.style.opacity = y > 80 ? 1 : 0;
    if (!document.body.classList.contains('menu-open')) {
      if (y > lastY + 4 && y > 220) { chrome.classList.add('hid'); document.body.classList.add('chrome-hid'); }
      else if (y < lastY - 4) chromeShow();
    }
    lastY = y;
    // espera as cenas atualizarem (elas também rodam no próximo quadro) antes de decidir a cor do cabeçalho
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      chrome.classList.toggle('dark', darkAt(62));
      gauge.classList.toggle('dark', darkAt(window.innerHeight - 50));
    }); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // letreiro do topo
  var tickMsgs = function () {
    var d = new Date(), hh = pad(d.getHours()) + ':' + pad(d.getMinutes());
    return [hh + ' em São Paulo', D.vehicles.length + ' veículos em estoque', 'Entrega recente: Valmare 38 em Angra', 'Novo na garagem: Lindqvist Aero S'];
  };
  var tickEl = $('[data-tick]'), tickI = 0;
  function tick() {
    var msgs = tickMsgs(), old = tickEl.firstElementChild, s = document.createElement('span');
    s.textContent = msgs[tickI++ % msgs.length]; s.style.transform = 'translateY(110%)'; tickEl.appendChild(s);
    void s.offsetWidth; s.style.transform = 'none';
    if (old) { old.style.transform = 'translateY(-110%)'; setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 900); }
  }
  tick(); setInterval(tick, 3200);

  // menu em blocos
  $('[data-menu-cats]').outerHTML = D.categories.map(function (c) { return '<a href="#/colecao/' + c.id + '" data-title="' + esc(c.name) + '"><span class="sq o"></span>' + esc(c.name) + '</a>'; }).join('');
  function menuOpen(on) { document.body.classList.toggle('menu-open', on); mbtn.setAttribute('aria-expanded', on ? 'true' : 'false'); if (on) chromeShow(); }
  mbtn.addEventListener('click', function () { menuOpen(!document.body.classList.contains('menu-open')); });
  document.addEventListener('click', function (e) { if (document.body.classList.contains('menu-open') && !menu.contains(e.target) && !mbtn.contains(e.target)) menuOpen(false); });

  $('[data-ftr-cats]').outerHTML = D.categories.map(function (c) { return '<a href="#/colecao/' + c.id + '" data-title="' + esc(c.name) + '">' + esc(c.name) + '</a>'; }).join('');

  function openDrawer() {
    menuOpen(false);
    $$('.form-ok', drawer).forEach(function (x) { x.remove(); });
    var f = $('form', drawer); if (f) f.hidden = false;
    drawer.classList.add('is-open'); scrim.classList.add('is-on'); drawer.setAttribute('aria-hidden', 'false'); lock(true);
    setTimeout(function () { var c = $('[data-close-sel]', drawer); if (c) c.focus({ preventScroll: true }); }, 80);
  }
  function closeDrawer() { if (!drawer.classList.contains('is-open')) return; drawer.classList.remove('is-open'); scrim.classList.remove('is-on'); drawer.setAttribute('aria-hidden', 'true'); lock(false); }
  function closeAll() { menuOpen(false); closeDrawer(); RIDER.hide(); PEEK.hide(); }
  function renderDrawer() {
    var list = $('[data-sel-list]'), ft = $('[data-sel-ft]');
    if (!sel.length) { list.innerHTML = '<div class="dr__empty"><p>Escolha o que você quer ver de perto.</p><a class="pill dk" href="#/colecao" data-title="Coleção"><i></i>Explorar a coleção</a></div>'; ft.hidden = true; return; }
    ft.hidden = false;
    list.innerHTML = sel.map(function (id) {
      var v = VEH[id];
      return '<div class="dr__item"><a class="dr__thumb" href="#/veiculo/' + id + '" data-title="' + esc(v.model) + '" style="' + vStyle(v) + '" aria-label="' + esc(v.model) + '">' + vImg(v) + '</a>' +
        '<div><span class="mono">' + esc(v.brand) + ' · ' + esc(CAT[v.cat].singular) + '</span><a class="dr__name" href="#/veiculo/' + id + '" data-title="' + esc(v.model) + '">' + esc(v.model) + '</a><span class="mono">' + esc(CAT[v.cat].local.split(' · ')[0]) + '</span></div>' +
        '<button class="nb" type="button" data-fav="' + id + '" aria-label="Tirar ' + esc(v.model) + ' da visita">' + ICON.close + '</button></div>';
    }).join('');
    $('[data-sel-total]').textContent = sel.length + (sel.length === 1 ? ' veículo' : ' veículos');
  }

  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var fav = t.closest('[data-fav]'); if (fav) { e.preventDefault(); toggleSel(fav.getAttribute('data-fav')); return; }
    var pr = t.closest('[data-propose]');
    if (pr) { var id = pr.getAttribute('data-propose'); if (sel.indexOf(id) < 0) { sel.push(id); saveSel(); bump(); } openDrawer(); return; }
    if (t.closest('[data-open-sel]')) { renderDrawer(); openDrawer(); return; }
    if (t.closest('[data-close-sel]') || t.closest('[data-scrim]')) { closeDrawer(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeDrawer(); menuOpen(false); } });

  // formulários de demonstração — AQUI: ligue ao seu backend, e-mail, CRM ou WhatsApp
  document.addEventListener('submit', function (e) {
    var f = e.target; if (!f.matches || !f.matches('[data-demo-form]')) return;
    e.preventDefault(); if (!f.reportValidity()) return;
    var kind = f.getAttribute('data-demo-form');
    if (kind === 'sel' && f.elements.data && !f.elements.data.value) {
      var dateField = $('[data-date-picker]', f), dateDisplay = dateField && $('[data-date-display]', dateField);
      if (dateDisplay) { dateDisplay.setAttribute('aria-invalid', 'true'); $('[data-date-error]', dateField).hidden = false; dateDisplay.focus({ preventScroll: true }); dateDisplay.openDatePicker(); return; }
    }
    var nome = f.elements.nome ? f.elements.nome.value.trim().split(' ')[0] : '';
    var dia = f.elements.data && f.elements.data.value ? f.elements.data.value.split('-').reverse().join('/') : '', per = f.elements.periodo ? f.elements.periodo.value.split(' (')[0].toLowerCase() : '';
    var quando = dia ? ' para ' + dia + (per ? ', ' + per : '') : '';
    var msg = kind === 'news' ? 'Pronto. A coleção privada chega no seu e-mail.'
      : 'Pedido de visita recebido' + (nome ? ', ' + nome : '') + quando + (kind === 'sel' ? ' (' + sel.length + (sel.length === 1 ? ' veículo' : ' veículos') + ')' : '') + '. Confirmamos o horário pelo WhatsApp em até 2 horas.';
    var ok = document.createElement('div'); ok.className = 'form-ok'; ok.setAttribute('role', 'status');
    ok.innerHTML = '<span class="sq o"></span><p>' + esc(msg) + '</p>';
    f.reset(); f.hidden = true; f.parentNode.insertBefore(ok, f.nextSibling);
  });

  // datas de visita: só a partir de amanhã
  function mountDrawerDatePicker(root) {
    var field = $('[data-date-picker]', root);
    if (!field) return;
    var trigger = $('[data-date-display]', field), value = $('input[name="data"]', field);
    var calendar = $('[data-date-calendar]', field), title = $('[data-date-month]', field), days = $('[data-date-days]', field);
    var prev = $('[data-date-prev]', field), next = $('[data-date-next]', field), form = field.closest('form');
    var month = new Date(); month.setDate(1);
    var minDate = fromISO(value.getAttribute('data-min-date')) || new Date(); minDate.setHours(0, 0, 0, 0);

    function fromISO(iso) {
      var parts = (iso || '').split('-').map(Number);
      return parts.length === 3 && parts[0] ? new Date(parts[0], parts[1] - 1, parts[2]) : null;
    }
    function toISO(date) { return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()); }
    function sameDay(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
    function syncTypedDate() {
      var match = trigger.value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (!match) { value.value = ''; return false; }
      var date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
      if (date.getFullYear() !== Number(match[3]) || date.getMonth() !== Number(match[2]) - 1 || date.getDate() !== Number(match[1]) || date < minDate) { value.value = ''; return false; }
      value.value = toISO(date);
      month = new Date(date.getFullYear(), date.getMonth(), 1);
      trigger.setAttribute('aria-invalid', 'false');
      $('[data-date-error]', field).hidden = true;
      render();
      return true;
    }
    function render() {
      title.textContent = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(month);
      var first = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
      var count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      var selected = fromISO(value.value), today = new Date(); today.setHours(0, 0, 0, 0);
      var html = '';
      for (var blank = 0; blank < first; blank++) html += '<span class="is-empty" aria-hidden="true"></span>';
      for (var day = 1; day <= count; day++) {
        var date = new Date(month.getFullYear(), month.getMonth(), day), iso = toISO(date);
        var classes = [sameDay(date, selected) ? 'is-selected' : '', sameDay(date, today) ? 'is-today' : ''].filter(Boolean).join(' ');
        var disabled = date < minDate ? ' disabled' : '';
        html += '<button type="button" data-date-value="' + iso + '" class="' + classes + '" aria-pressed="' + (sameDay(date, selected) ? 'true' : 'false') + '"' + disabled + '>' + day + '</button>';
      }
      days.innerHTML = html;
      prev.disabled = month.getFullYear() < minDate.getFullYear() || (month.getFullYear() === minDate.getFullYear() && month.getMonth() <= minDate.getMonth());
    }
    function close(focus) {
      calendar.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      if (focus) trigger.focus();
    }
    function open() {
      var floor = fromISO(value.getAttribute('data-min-date')) || minDate;
      minDate = floor;
      var selected = fromISO(value.value);
      month = new Date((selected || floor).getFullYear(), (selected || floor).getMonth(), 1);
      render(); calendar.hidden = false; trigger.setAttribute('aria-expanded', 'true');
    }
    trigger.openDatePicker = open;

    trigger.addEventListener('click', function () { if (calendar.hidden) open(); else close(false); });
    trigger.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    trigger.addEventListener('input', function () {
      syncTypedDate();
      trigger.setAttribute('aria-invalid', 'false');
      $('[data-date-error]', field).hidden = true;
    });
    trigger.addEventListener('change', syncTypedDate);
    trigger.addEventListener('blur', function (e) {
      if (calendar.contains(e.relatedTarget) || !trigger.value.trim()) return;
      if (!syncTypedDate()) { trigger.setAttribute('aria-invalid', 'true'); $('[data-date-error]', field).hidden = false; }
    });
    prev.addEventListener('click', function () { if (!prev.disabled) { month.setMonth(month.getMonth() - 1); render(); } });
    next.addEventListener('click', function () { month.setMonth(month.getMonth() + 1); render(); });
    days.addEventListener('click', function (e) {
      var button = e.target.closest('[data-date-value]'); if (!button || button.disabled) return;
      value.value = button.getAttribute('data-date-value');
      var chosen = fromISO(value.value);
      trigger.value = pad(chosen.getDate()) + '/' + pad(chosen.getMonth() + 1) + '/' + chosen.getFullYear();
      trigger.setAttribute('aria-invalid', 'false');
      $('[data-date-error]', field).hidden = true;
      value.dispatchEvent(new Event('change', { bubbles: true }));
      close(false);
    });
    document.addEventListener('click', function (e) { if (!field.contains(e.target) && !calendar.hidden) close(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !calendar.hidden) close(true); });
    if (form) form.addEventListener('reset', function () { setTimeout(function () { value.value = ''; trigger.value = ''; trigger.removeAttribute('aria-invalid'); $('[data-date-error]', field).hidden = true; close(false); render(); }, 0); });
    render();
  }

  function minToday(root) {
    var d = new Date(); d.setDate(d.getDate() + 1);
    var iso = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    $$('[data-min-today]', root).forEach(function (i) { i.min = iso; i.setAttribute('data-min-date', iso); });
  }
  minToday(document);
  mountDrawerDatePicker(drawer);

  var toastEl = $('[data-toast]'), toastT = 0;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2200); }

  /* ---------------- abertura: contador 000 → 100 e cortina laranja ---------------- */
  function runLoader() {
    var L = $('#loader'); if (!html.classList.contains('is-intro') || !L.animate) { html.classList.remove('is-intro'); return; }
    try { sessionStorage.setItem('aureon-intro', '1'); } catch (e) {}
    lock(true);
    var ring = $('.lg i', L), dot = $('.lg b', L), cnt = $('[data-lcount]', L), wipe = $('.lwipe', L), t0 = performance.now(), D1 = 1300;
    ring.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
    dot.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 600, delay: 650, easing: 'cubic-bezier(.3,1.6,.5,1)', fill: 'forwards' });
    (function f(t) { var p = Math.min(1, (t - t0) / D1); cnt.textContent = ('00' + Math.round(eo(p) * 100)).slice(-3); if (p < 1) requestAnimationFrame(f); })(t0);
    setTimeout(function () {
      wipe.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 520, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }).onfinish = function () {
        $$('.lg, .lnote, .lcount', L).forEach(function (x) { x.style.opacity = 0; });
        L.style.background = 'transparent'; wipe.style.transformOrigin = '50% 0';
        wipe.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 620, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }).onfinish = function () {
          html.classList.remove('is-intro'); L.style.display = 'none'; lock(false);
        };
      };
    }, D1 + 120);
    setTimeout(function () { if (html.classList.contains('is-intro')) { html.classList.remove('is-intro'); L.style.display = 'none'; lock(false); } }, 6000); // segurança
  }

  updateSelUI();
  runLoader();
  render(location.hash);
})();

