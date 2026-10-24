/* VINILAZO — scelta squadra, colori della squadra come accenti, grande vinile di transizione, dischi, modulo d'ordine */
(function () {
  "use strict";
  var DATA = JSON.parse(document.getElementById("data").textContent);
  var CFG = window.VINILAZO_CONFIG || {};
  var PRICE = CFG.PRICE || 69;
  var T = DATA.t;
  var CHECKOUT = DATA.checkout;
  var STORE = DATA.store;
  var PAIR_PRICE = Number(CFG.PAIR_PRICE) > 0 && Number(CFG.PAIR_PRICE) < PRICE * 2 ? Number(CFG.PAIR_PRICE) : PRICE * 2;
  var checkoutReady = false;
  var MAX_QTY = CFG.STRIPE_LINK ? Math.max(1, Math.min(10, Number(CFG.STRIPE_MAX_QTY) || 1)) : 10;
  var TEAMS = DATA.teams;
  var BY_ID = {};
  TEAMS.forEach(function (t) { BY_ID[t.id] = t; });
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var current = null;
  var qty = 1;
  var uid = 0;
  var busy = false;
  var submitting = false;

  function fmt(n) {
    try { return new Intl.NumberFormat(DATA.lang, { style: "currency", currency: "EUR", minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }).format(n); }
    catch (e) { return n + " €"; }
  }
  function fill(s, map) { return s.replace(/\{(\w+)\}/g, function (_, k) { return map[k] != null ? map[k] : ""; }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- disegno del disco (stesso stile dei dischi veri) ---------- */
  function labelPattern(t) {
    var c = t.cols, p = t.p, s = "", i;
    var L = 42, W = 116;
    if (p === "stripes") {
      for (i = -1; i < 9; i++) s += '<rect x="' + (L + i * 14.5) + '" y="' + L + '" width="14.6" height="' + W + '" fill="' + c[(i + 10) % 2] + '"/>';
    } else if (p === "hoops") {
      for (i = -1; i < 9; i++) s += '<rect x="' + L + '" y="' + (L + i * 14.5) + '" width="' + W + '" height="14.6" fill="' + c[(i + 10) % 2] + '"/>';
    } else if (p === "halves") {
      s = '<rect x="' + L + '" y="' + L + '" width="58" height="' + W + '" fill="' + c[0] + '"/><rect x="100" y="' + L + '" width="58" height="' + W + '" fill="' + c[1] + '"/>';
    } else if (p === "band") {
      s = '<rect x="' + L + '" y="' + L + '" width="' + W + '" height="' + W + '" fill="' + c[0] + '"/><rect x="82" y="' + L + '" width="36" height="' + W + '" fill="' + c[2] + '"/><rect x="86" y="' + L + '" width="28" height="' + W + '" fill="' + c[1] + '"/>';
    } else if (p === "checker") {
      for (var r = 0; r < 8; r++) for (i = 0; i < 8; i++) s += '<rect x="' + (L + i * 14.5) + '" y="' + (L + r * 14.5) + '" width="14.6" height="14.6" fill="' + c[(r + i) % 2] + '"/>';
    } else {
      var bands = t.tri || [c[1], c[2], c[1]];
      s = '<rect x="' + L + '" y="' + L + '" width="' + W + '" height="' + W + '" fill="' + c[0] + '"/>' +
          '<rect x="' + L + '" y="141" width="' + W + '" height="5" fill="' + bands[0] + '"/>' +
          '<rect x="' + L + '" y="146" width="' + W + '" height="5" fill="' + bands[1] + '"/>' +
          '<rect x="' + L + '" y="151" width="' + W + '" height="7" fill="' + bands[2] + '"/>';
    }
    return s;
  }
  function fit(text, max, size) { return Math.max(7, Math.min(size, max / Math.max(1, text.length) * 1.9)); }
  /* opts: {top: testo piccolo in alto, big: testo grande, small: riga sotto, plain: solo etichetta} */
  /* Argentina: etichetta come i dischi veri (bianca con due strisce celesti, minuto grande, nome e sottotitolo) – vettoriale, sempre nitida */
  function argLabel(opts, id) {
    var s = '<g clip-path="url(#' + id + ')"><rect x="42" y="42" width="116" height="116" fill="#fff"/>' +
            '<rect x="65" y="42" width="25" height="116" fill="#75AADB"/><rect x="110" y="42" width="25" height="116" fill="#75AADB"/>';
    if (!opts.plain) s += '<rect x="42" y="106" width="116" height="33" fill="#fff"/>';
    s += "</g>";
    if (opts.plain) return s;
    var F = "Atkinson Hyperlegible Next, Arial, sans-serif";
    var top = (opts.top || "").toUpperCase(), big = (opts.big || "").toUpperCase(), small = (opts.small || "").toUpperCase();
    var fsB = Math.min(16, 100 / (Math.max(1, big.length) * 0.66));
    var fsS = Math.min(7.6, 84 / (Math.max(1, small.length) * 0.62));
    return s + '<g fill="#13213B" text-anchor="middle" font-family="' + F + '" font-weight="800">' +
      (top ? '<text x="100" y="91" font-size="' + (top.length > 3 ? 24 : 29) + '">' + esc(top) + "</text>" : "") +
      '<text x="100" y="122" font-size="' + fsB.toFixed(1) + '">' + esc(big) + "</text>" +
      (small ? '<text x="100" y="133.5" font-size="' + fsS.toFixed(1) + '">' + esc(small) + "</text>" : "") + "</g>";
  }
  function discSVG(t, opts) {
    opts = opts || {};
    var id = "d" + (++uid);
    var ink = t.th.labelInk;
    var grooves = "";
    for (var r = 63; r < 97; r += 3.4) grooves += '<circle cx="100" cy="100" r="' + r.toFixed(1) + '" fill="none" stroke="#2a2a2a" stroke-width=".7"/>';
    var s = '<defs><clipPath id="' + id + '"><circle cx="100" cy="100" r="58"/></clipPath>' +
      '<filter id="' + id + 't" x="-10%" y="-30%" width="120%" height="160%"><feDropShadow dx="0" dy=".7" stdDeviation=".6" flood-color="#000" flood-opacity=".45"/></filter>' +
      '<linearGradient id="' + id + 's" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".12"/></linearGradient></defs>' +
      '<circle cx="100" cy="100" r="99" fill="#141414"/>' + grooves +
      '<circle cx="100" cy="100" r="98" fill="url(#' + id + 's)"/>' +
      '<circle cx="100" cy="100" r="98.3" fill="none" stroke="#3a3a3a" stroke-width="1.4"/>' +
      (t.ls === "arg" ? argLabel(opts, id) : '<g clip-path="url(#' + id + ')">' + labelPattern(t) + "</g>") +
      '<circle cx="100" cy="100" r="58" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1"/>';
    if (!opts.plain && t.ls !== "arg") {
      var ink = t.th.ink || ink, halo = t.th.halo;
      var deco = halo ? ' stroke="' + halo + '" stroke-width="2.6" stroke-linejoin="round" paint-order="stroke"' :
                 (ink.toUpperCase() === "#FFFFFF" ? ' filter="url(#' + id + 't)"' : "");
      var top = (opts.top || t.name).toUpperCase();
      var fsT = opts.minute ? 24 : fit(top, 70, 12.5);
      var big = (opts.big || "VINILAZO").toUpperCase(), small = (opts.small || "").toUpperCase();
      var fsB = fit(big, 90, opts.big ? 21 : 12), fsS = Math.min(8.4, 84 / (Math.max(1, small.length) * 0.66));
      var yB = small ? 124 : 128;
      s += '<g fill="' + ink + '"' + deco + ' text-anchor="middle">' +
           '<text x="100" y="' + (opts.minute ? 92 : 86) + '" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="' + fsT.toFixed(1) + '">' + esc(top) + "</text>" +
           '<text x="100" y="' + yB + '" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="' + fsB.toFixed(1) + '">' + esc(big) + "</text>" +
           (small ? '<text x="100" y="136.5" font-family="Atkinson Hyperlegible Next, sans-serif" font-weight="800" font-size="' + fsS.toFixed(1) + '">' + esc(small) + "</text>" : "") +
           "</g>";
    }
    return s + '<circle cx="100" cy="100" r="3.6" fill="#141414" stroke="#fff" stroke-width="1.6"/>';
  }
  function gOpts(t, g) {
    var m = t.real && /^(\d+'|\d+-\d+)\s+(.*)$/.exec(g[1]);
    return m ? { top: m[1], minute: true, big: g[0], small: m[2] } : { big: g[0], small: g[1] };
  }
  function heroOpts(t) { return gOpts(t, t.goals[0]); }
  function drawDiscs(t) {
    $$("svg.disc").forEach(function (svg) {
      if (svg.classList.contains("tdisc") || svg.classList.contains("sdisc")) return;
      svg.innerHTML = svg.classList.contains("hero-disc") ? discSVG(t, heroOpts(t)) :
        svg.classList.contains("addon-disc") ? discSVG(t, { big: T.your_goal, small: T.your_goal_sub }) :
        (svg.classList.contains("done-disc") ? discSVG(t) : discSVG(t, { plain: true }));
    });
    $$(".wm-disc").forEach(function (svg) {
      svg.innerHTML = '<circle cx="100" cy="100" r="92" fill="#141414" stroke="currentColor" stroke-width="10"/><circle cx="100" cy="100" r="44" fill="' + t.cols[0] + '" stroke="' + t.cols[1] + '" stroke-width="10"/><circle cx="100" cy="100" r="9" fill="#141414"/>';
    });
    var box = $("#discs"), html = "", cards = "", hd = "";
    var A = DATA.assets || "../assets/";
    var nSt = (t.st || []).length;
    var pp = (DATA.pp || {})[t.id];          // pagina prodotto della squadra (per ora solo Argentina)
    var press = (DATA.press || {})[t.id] || {};
    t.goals.forEach(function (g, i) {
      var pic = '<svg viewBox="0 0 200 200" aria-hidden="true">' + discSVG(t, gOpts(t, g)) + "</svg>";
      var label = esc(g[0] + " · " + g[1]);
      html += pp ? '<a class="d" style="--i:' + i + '" href="' + pp + "#disco-" + (i + 1) + '" title="' + label + '" aria-label="' + label + " – " + esc(T.details) + '">' + pic + "</a>"
                 : '<div class="d" style="--i:' + i + '" title="' + label + '">' + pic + "</div>";
      var href = pp ? pp + "#disco-" + (i + 1) : (i < nSt ? "#storia-" + (i + 1) : "#cosa");
      if (i < 9) hd += '<li style="--i:' + i + '"><a data-preview-disc="' + (i + 1) + '" href="' + href + '"' + (!pp && i < nSt ? ' data-story="' + (i + 1) + '"' : "") + ' aria-label="' + label + '">' +
            '<span class="hd-disc">' + pic + "</span>" + '<span class="hd-name">' + esc(g[0]) + "</span>" +
            (pp ? '<span class="hd-more">' + esc(T.details) + " ▸</span>" : "") + "</a></li>";
      var shot = ((DATA.celebrations || {})[t.id] || {})[i + 1];
      var shotImg = shot ? '<img class="story-goal-photo" src="' + esc(shot.src) + '" alt="" loading="lazy" decoding="async">' : "";
      var shotCredit = shot ? '<a class="story-goal-credit" href="' + esc(shot.page) + '" target="_blank" rel="noopener">' + esc(shot.credit) + ' ↗</a>' : "";
      var st = (t.st || [])[i], q = "";
      if (!st) return;
      if (st.q) {
        q = '<blockquote class="press"><p lang="' + st.q.ql + '">«' + esc(st.q.q) + '»</p><footer>— ' + esc(st.q.by) +
            (st.q.tr ? ' <span class="tr">«' + esc(st.q.tr) + "»</span>" : "") + "</footer></blockquote>";
      }
      // prima pagina vera (o foto d'epoca) del giorno dopo, quando ce l'abbiamo
      var cl = press[i + 1], clip = cl ? '<figure class="s-clip"><img src="' + cl.src + '" width="' + cl.w + '" height="' + cl.h + '" alt="' + esc(cl.cap) + '" loading="lazy" decoding="async">' +
               "<figcaption>" + esc(cl.cap) + " · " + (cl.page ? '<a href="' + cl.page + '" target="_blank" rel="noopener">' : "<span>") + esc(cl.credit + " – " + cl.lic) + (cl.page ? "</a>" : "</span>") + "</figcaption></figure>" : "";
      cards += '<article class="story rv' + (clip ? " has-clip" : "") + (shot ? " has-goal-photo" : "") + '" id="storia-' + (i + 1) + '">' + shotImg + '<div class="sdisc">' + pic + "</div><div>" +
               '<h3><span class="s-n">' + (i + 1) + "</span>" + esc(g[0]) + " <small>" + esc(g[1]) + "</small></h3>" +
               (st.m ? '<p class="memory"><span class="memory-k">' + esc(T.memory_word) + "</span>" + esc(st.m) + "</p>" : "") +
               "<p>" + esc(st.s) + "</p>" + clip + '<p class="fact"><b>' + esc(pp ? T.fact_curio : T.fact_label) + "</b> " + esc(st.f) + "</p>" + shotCredit + q +
               (pp ? '<a class="read-more" href="' + pp + "#disco-" + (i + 1) + '">' + esc(T.read_more) + " ▸</a>" : "") + "</div></article>";
    });
    var cta = $("#hd-cta");
    if (cta) { cta.href = pp || "#storie"; cta.textContent = pp ? T.discover + " ▸" : T.stories_link + " ↓"; }
    var bx = $("#box-more");
    if (bx) { bx.hidden = !pp; if (pp) bx.href = pp; }
    if (DATA.custom) {
      var mine = '<svg viewBox="0 0 200 200" aria-hidden="true">' + discSVG(t, { big: T.your_goal, small: T.your_goal_sub }) + "</svg>";
      html += '<div class="d mine" style="--i:' + t.goals.length + '">' + mine + '<span class="badge">' + esc(T.your_goal_sub) + "</span></div>";
      cards += '<article class="story mine rv"><div class="sdisc">' + mine + '</div><div><h3><span class="s-n">+</span>' + esc(T.your_goal_title) +
               "</h3><p>" + esc(T.your_story) + "</p></div></article>";
    }
    box.innerHTML = html;
    $("#story-grid").innerHTML = cards;
    $("#hd-list").innerHTML = hd;
    var previewCaption = $("#vz-preview-caption");
    if (!previewCaption) {
      previewCaption = document.createElement("p");
      previewCaption.id = "vz-preview-caption";
      previewCaption.className = "vz-preview-caption";
      $("#hd-list").parentNode.insertBefore(previewCaption, $("#hd-list"));
    }
    previewCaption.textContent = ({it:"🎧 Tocca e rivivi il gol",es:"🎧 Tocá y volvé a sentir el gol",fr:"🎧 Touchez et revivez le but",en:"🎧 Tap to relive the goal",de:"🎧 Tippe und erlebe das Tor erneut"})[DATA.lang] || "🎧 Tocca e rivivi il gol";
    var heroDisc = $(".hero-disc");
    if (heroDisc) heroDisc.dataset.currentDisc = "1";

    $("#discs-cap").textContent = t.real ? T.discs_real : fill(T.discs_cap, { team: t.name });
    drawPaper(t);
    reveal();
  }

  /* ---------- prime pagine vere a ventaglio dietro alla frase (per ora solo Argentina) ---------- */
  var paperFor = null;
  function drawPaper(t) {
    var sheet = $("#sheet"); if (!sheet) return;
    var paper = sheet.parentNode, cr = $("#cover-credit"), list = (DATA.covers || {})[t.id];
    $(".hero").classList.toggle("has-press", !!(list && list.length));
    if (!list || !list.length) { paper.hidden = true; sheet.innerHTML = ""; paperFor = null; if (cr) cr.hidden = true; return; }
    paper.hidden = false; paper.classList.add("paper-real");
    if (paperFor !== t.id) {
      paperFor = t.id;
      sheet.innerHTML = list.map(function (c, i) {
        return '<figure class="cv cv-' + (i + 1) + '"><img src="' + c.src + '" width="' + c.w + '" height="' + c.h + '" alt="" decoding="async">' +
               (c.year ? '<span class="cv-year">' + esc(c.year) + "</span>" : "") + "</figure>";
      }).join("");
      // se un'immagine non arriva, niente cornice vuota
      $$("img", sheet).forEach(function (im) { im.addEventListener("error", function () { im.parentNode.hidden = true; }); });
    }
    if (cr) {
      cr.hidden = false;
      cr.innerHTML = esc(T.covers_word) + ": " + list.map(function (c) {
        var tx = esc(c.credit + " – " + c.lic);
        return c.page ? '<a href="' + c.page + '" target="_blank" rel="noopener">' + tx + "</a>" : "<span>" + tx + "</span>";
      }).join(" · ");
    }
  }
  /* ---------- bandiere a tema: nazionali con la loro bandiera, club con i colori della curva (niente stemmi) ---------- */
  function star(cx, cy, r, fill, rot) {
    var p = [], a0 = (rot || -90) * Math.PI / 180;
    for (var k = 0; k < 10; k++) {
      var rr = k % 2 ? r * 0.42 : r, a = a0 + k * Math.PI / 5;
      p.push((cx + rr * Math.cos(a)).toFixed(2) + "," + (cy + rr * Math.sin(a)).toFixed(2));
    }
    return '<polygon points="' + p.join(" ") + '" fill="' + fill + '"/>';
  }
  function bands(cols, vertical, weights) {
    var w = weights || cols.map(function () { return 1; }), tot = w.reduce(function (a, b) { return a + b; }, 0), pos = 0, s = "";
    cols.forEach(function (c, i) {
      var len = (vertical ? 60 : 40) * w[i] / tot;
      s += vertical ? '<rect x="' + pos.toFixed(2) + '" y="0" width="' + (len + 0.3).toFixed(2) + '" height="40" fill="' + c + '"/>'
                    : '<rect x="0" y="' + pos.toFixed(2) + '" width="60" height="' + (len + 0.3).toFixed(2) + '" fill="' + c + '"/>';
      pos += len;
    });
    return s;
  }
  function stripes(n, a, b, vertical) {
    var c = []; for (var i = 0; i < n; i++) c.push(i % 2 ? b : a);
    return bands(c, vertical);
  }
  var NATION_FLAGS = {
    argentina: function () { return bands(["#74ACDF", "#FFFFFF", "#74ACDF"]) + '<circle cx="30" cy="20" r="4.4" fill="#F6B40E"/>'; },
    francia: function () { return bands(["#002654", "#FFFFFF", "#ED2939"], true); },
    brasile: function () { return '<rect width="60" height="40" fill="#009C3B"/><polygon points="5,20 30,4.5 55,20 30,35.5" fill="#FFDF00"/><circle cx="30" cy="20" r="8.2" fill="#002776"/><path d="M22.3 18.6c5-1.6 10.6-.9 15.2 1.9" stroke="#fff" stroke-width="1.3" fill="none"/>'; },
    portogallo: function () { return '<rect width="24" height="40" fill="#046A38"/><rect x="24" width="36" height="40" fill="#DA291C"/><circle cx="24" cy="20" r="7" fill="#FFD700"/><circle cx="24" cy="20" r="4.4" fill="#fff"/><circle cx="24" cy="20" r="3.2" fill="#DA291C"/>'; },
    spagna: function () { return bands(["#AA151B", "#F1BF00", "#AA151B"], false, [1, 2, 1]) + '<rect x="15" y="15" width="7" height="10" rx="1.5" fill="#AA151B" opacity=".85"/>'; },
    inghilterra: function () { return '<rect width="60" height="40" fill="#fff"/><rect x="26" width="8" height="40" fill="#CE1124"/><rect y="16" width="60" height="8" fill="#CE1124"/>'; },
    germania: function () { return bands(["#111111", "#DD0000", "#FFCE00"]); },
    messico: function () { return bands(["#006847", "#FFFFFF", "#CE1126"], true) + '<circle cx="30" cy="20" r="4" fill="#8C5A2B"/><path d="M26 23.5q4 3 8 0" stroke="#006847" stroke-width="1.2" fill="none"/>'; },
    colombia: function () { return bands(["#FCD116", "#003893", "#CE1126"], false, [2, 1, 1]); },
    marocco: function () { return '<rect width="60" height="40" fill="#C1272D"/>' + star(30, 21, 9, "none").replace('fill="none"', 'fill="none" stroke="#006233" stroke-width="1.6" stroke-linejoin="round"'); },
    italia: function () { return bands(["#009246", "#FFFFFF", "#CE2B37"], true); },
    olanda: function () { return bands(["#AE1C28", "#FFFFFF", "#21468B"]); },
    belgio: function () { return bands(["#111111", "#FDDA24", "#EF3340"], true); },
    croazia: function () {
      var s = bands(["#FF0000", "#FFFFFF", "#171796"]) + '<rect x="23.5" y="10.5" width="13" height="15" rx="2" fill="#fff"/>';
      for (var r = 0; r < 5; r++) for (var c = 0; c < 5; c++) if ((r + c) % 2 === 0) s += '<rect x="' + (24 + c * 2.4).toFixed(1) + '" y="' + (11 + r * 2.8).toFixed(1) + '" width="2.4" height="2.8" fill="#FF0000"/>';
      return s;
    },
    uruguay: function () { return stripes(9, "#FFFFFF", "#0038A8") + '<rect width="22" height="22.3" fill="#fff"/><circle cx="11" cy="11" r="5.4" fill="#FCD116"/><circle cx="11" cy="11" r="7.6" fill="none" stroke="#FCD116" stroke-width="1.2" stroke-dasharray="1.6 1.4"/>'; },
    usa: function () {
      var s = stripes(13, "#B31942", "#FFFFFF") + '<rect width="26" height="21.6" fill="#0A3161"/>';
      for (var r = 0; r < 4; r++) for (var c = 0; c < 5; c++) s += '<circle cx="' + (3 + c * 5).toFixed(1) + '" cy="' + (3 + r * 5.1).toFixed(1) + '" r="1" fill="#fff"/>';
      return s;
    },
    giappone: function () { return '<rect width="60" height="40" fill="#fff"/><circle cx="30" cy="20" r="11" fill="#BC002D"/>'; },
    egitto: function () { return bands(["#CE1126", "#FFFFFF", "#111111"]) + '<circle cx="30" cy="20" r="3.6" fill="#C09300"/>'; },
    senegal: function () { return bands(["#00853F", "#FDEF42", "#E31B23"], true) + star(30, 20.5, 5.2, "#00853F"); },
    turchia: function () { return '<rect width="60" height="40" fill="#E30A17"/><circle cx="24" cy="20" r="10" fill="#fff"/><circle cx="26.6" cy="20" r="8" fill="#E30A17"/>' + star(37.5, 20, 4.6, "#fff", 180); }
  };
  function clubFlag(t) {
    var c = t.cols, p = t.p || t.pattern;
    if (p === "stripes") return stripes(7, c[0], c[1], true);
    if (p === "hoops") return stripes(6, c[0], c[1], false);
    if (p === "halves") return bands([c[0], c[1]], true);
    if (p === "band") return '<rect width="60" height="40" fill="' + c[0] + '"/><rect x="20" width="20" height="40" fill="' + c[2] + '"/><rect x="23" width="14" height="40" fill="' + c[1] + '"/>';
    // tinta unita: fascia diagonale da curva, con bordini del terzo colore
    var edge = (c[2] && c[2] !== c[0] && c[2] !== c[1]) ? '<polygon points="-4,31 -4,44 13,44 64,9 64,-4 49,-4" fill="' + c[2] + '"/>' : "";
    return '<rect width="60" height="40" fill="' + c[0] + '"/>' + edge + '<polygon points="-4,34 -4,44 9,44 64,6 64,-4 53,-4" fill="' + c[1] + '"/>';
  }
  /* club: scudetto a tema con i colori della maglia e la sigla da tabellone (non lo stemma ufficiale, che è un marchio) */
  function lumi(h) {
    var c = h.replace("#", ""), v = [0, 2, 4].map(function (i) { var x = parseInt(c.substr(i, 2), 16) / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }
  function badgeSVG(t) {
    var id = "b" + (++uid), c = t.cols, band = (c[2] && c[2] !== c[0] && c[2] !== c[1]) ? c[2] : c[1];
    var ink = lumi(band) > 0.3 ? "#0B1530" : "#FFFFFF", rim = lumi(band) > 0.75 ? "#C9A227" : band;
    var shield = "M0 0H40V22C40 36 31 44 20 48C9 44 0 36 0 22Z";
    var body = '<g transform="translate(-10 13) scale(1 0.9)">' + clubFlag(t) + "</g>";
    return '<defs><clipPath id="' + id + '"><path d="' + shield + '"/></clipPath>' +
      '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient></defs>' +
      '<g transform="translate(16 2)"><path d="' + shield + '" transform="translate(0 1.6)" fill="rgba(0,0,0,.35)"/>' +
      '<g clip-path="url(#' + id + ')"><rect width="40" height="48" fill="' + c[0] + '"/>' + body +
      '<rect width="40" height="14" fill="' + band + '"/><rect y="14" width="40" height="1.6" fill="rgba(0,0,0,.25)"/>' +
      '<text x="20" y="11.2" text-anchor="middle" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="11.5" letter-spacing=".6" fill="' + ink + '">' + esc(t.code || "") + "</text>" +
      '<rect width="40" height="48" fill="url(#' + id + 'g)"/></g>' +
      '<path d="' + shield + '" fill="none" stroke="' + rim + '" stroke-width="2.4"/><path d="' + shield + '" fill="none" stroke="rgba(255,255,255,.55)" stroke-width=".7" transform="translate(2.2 2.2) scale(.89)"/></g>';
  }
  function flagSVG(t) {
    if (t.g === "club") return badgeSVG(t);
    var id = "f" + (++uid), art = NATION_FLAGS[t.id] ? NATION_FLAGS[t.id]() : clubFlag(t);
    var wave = "M0 2.5C10 -1 20 6 30 2.5S50 -1 60 2.5V40.5C50 44 40 37 30 40.5S10 44 0 40.5Z";
    return '<defs><clipPath id="' + id + '"><path d="' + wave + '"/></clipPath>' +
      '<linearGradient id="' + id + 'g" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".22" stop-color="#fff" stop-opacity=".22"/>' +
      '<stop offset=".48" stop-color="#000" stop-opacity=".16"/><stop offset=".74" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient></defs>' +
      '<rect x="2.6" y="2" width="2.6" height="49" rx="1.3" fill="#D9DEE6"/><circle cx="3.9" cy="2.6" r="2.6" fill="#E8C35A"/>' +
      '<g transform="translate(9 4)"><g clip-path="url(#' + id + ')"><rect x="-1" y="-2" width="62" height="47" fill="#fff"/>' + art +
      '<rect x="-1" y="-2" width="62" height="47" fill="url(#' + id + 'g)"/></g>' +
      '<path d="' + wave + '" fill="none" stroke="rgba(0,0,0,.25)" stroke-width=".8"/></g>';
  }
  function drawTeamGrid() {
    $$(".team").forEach(function (b) {
      var t = BY_ID[b.dataset.team];
      var f = $(".tflag", b); if (f) f.innerHTML = flagSVG(t);
    });
  }

  /* ---------- tema della squadra ---------- */
  function stripe(t) {
    var c = t.cols, b = t.tri || c;
    return "linear-gradient(90deg," + c[0] + " 0 33.3%," + c[1] + " 33.3% 66.6%," + (b[2] || c[0]) + " 66.6%)";
  }
  function setVars(t) {
    root.style.setProperty("--acc", t.th.acc);
    root.style.setProperty("--onAcc", t.th.onAcc);
    root.style.setProperty("--c0", t.cols[0]);
    root.style.setProperty("--c1", t.cols[1]);
    root.style.setProperty("--c2", t.cols[2]);
    root.style.setProperty("--stripe", stripe(t));
  }
  function setTexts(t) {
    // Solo le edizioni con audio sul sito (per ora Argentina) mostrano i dischi che girano.
    root.classList.toggle("vz-no-audio", t.id !== "argentina");
    if (vzPreviewAudio) { vzPreviewAudio.pause(); vzPreviewAudio = null; }
    $$("[data-team-name]").forEach(function (el) { el.textContent = t.name; });
    $$("[data-edition]").forEach(function (el) { el.textContent = T.edition + " " + t.name; });
    $$("[data-eta]").forEach(function (el) { el.textContent = t.ready ? T.price_ready : T.price_note; });
    $$("[data-ready]").forEach(function (el) { el.hidden = !t.ready; });
    var h1 = $("#h1");
    h1.innerHTML = t.q.q.replace(/([!?.…])\s+/g, "$1\u0001").split("\u0001").map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("");
    h1.className = "quote" + (t.q.q.length > 70 ? " q-long" : (t.q.q.length > 30 ? " q-mid" : ""));
    h1.setAttribute("lang", t.q.ql);
    $("[data-quote-by]").textContent = t.q.by;
    var tr = $(".quote-tr");
    if (t.q.tr) { tr.textContent = "«" + t.q.tr + "»"; tr.hidden = false; } else tr.hidden = true;
    var f = $("#order-form");
    f.elements.squadra.value = t.name;
    f.elements.squadra_id.value = t.id;
    f.elements.dischi_storici.value = t.goals.map(function (g) { return g[0] + " (" + g[1] + ")"; }).join("; ");
    $$(".team").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.team === t.id)); });
    var pf = $(".pick-flag"); if (pf) pf.innerHTML = flagSVG(t);
    var mh = $("[data-moment]");
    if (mh) {
      var lang = DATA.lang || "it", scorer = t.goals[0][0];
      var headlines = {
        it: { argentina:"Messico 1986. Maradona danza tra gli inglesi. Il mondo trattiene il fiato.", italia:"Madrid 1982. Rossi accende una nazione. L'Italia esplode di gioia.", francia:"Saint-Denis 1998. Zidane vola più in alto di tutti. La Francia entra nella storia." },
        es: { argentina:"México 1986. Maradona deja rivales atrás. El mundo contiene la respiración.", italia:"Madrid 1982. Italia estalla de emoción.", francia:"Saint-Denis 1998. Zidane hace historia." },
        fr: { argentina:"Mexico 1986. Maradona traverse la défense. Le monde retient son souffle.", francia:"Saint-Denis 1998. Zidane s'élève. La France entre dans l'histoire." },
        en: { argentina:"Mexico 1986. Maradona glides past defenders. The world holds its breath.", italia:"Madrid 1982. Italy erupts in joy.", francia:"Saint-Denis 1998. Zidane rises. History is made." },
        de: { argentina:"Mexiko 1986. Maradona tanzt durch die Abwehr. Die Welt hält den Atem an.", italia:"Madrid 1982. Italien jubelt.", francia:"Saint-Denis 1998. Zidane schreibt Geschichte." }
      };
      var fallbacks = {
        it:"Il gol di {scorer}. Un istante che entra nella storia.",
        es:"El gol de {scorer}. Un instante que ya es historia.",
        fr:"Le but de {scorer}. Un instant entré dans l'histoire.",
        en:"{scorer}'s goal. One moment that became history.",
        de:"Das Tor von {scorer}. Ein Moment für die Ewigkeit."
      };
      mh.textContent = fill((headlines[lang] && headlines[lang][t.id]) || fallbacks[lang] || fallbacks.it, {scorer:scorer});
    }
    var contactMsg = fill(T.wa, { team: t.name });
    $("#wa").href = "https://ig.me/m/" + (CFG.INSTAGRAM || "vinilazoo");
    $("#wa").setAttribute("data-msg", contactMsg);
    $$("[data-checkout-wa]").forEach(function (a) { a.href = $("#wa").href; a.setAttribute("data-msg", contactMsg); a.target = "_blank"; a.rel = "noopener"; });
    updateSummary();
  }
  function swapTo(t) {
    current = t;
    // Meta Pixel: prodotto visto anche al primo caricamento della pagina (?team=...), non solo cambiando squadra
    window.VINILAZO_CURRENT_PRODUCT = { content_name: t.name, content_ids: [t.id], content_type: "product", value: PRICE, currency: "EUR" };
    window.dispatchEvent(new CustomEvent("vinilazo:product"));
    setVars(t);
    setTexts(t);
    drawDiscs(t);
    setLoops(t);
  }
  function setLoops(t) {
    var A = DATA.assets || "../assets/";
    $$("video.loop").forEach(function (v) {
      var n = v.dataset.loop, src = A + "loops/" + t.id + "/" + n + ".mp4";
      if (v.getAttribute("src") === src) return;
      var was = !v.paused;
      v.poster = A + "loops/" + t.id + "/" + n + ".jpg";
      v.setAttribute("src", src);
      if (was) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    });
  }

  /* ---------- animazioni allo scorrimento (anche su telefono, dove non c'è il mouse) ---------- */
  var rvIO = ("IntersectionObserver" in window) ? new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rvIO.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }) : null;
  function reveal() {
    $$(".rv:not(.in)").forEach(function (el) { if (rvIO) rvIO.observe(el); else el.classList.add("in"); });
  }
  function remember(t) {
    try { localStorage.setItem("vinilazo-team", t.id); } catch (e) {}
    try {
      var u = new URL(location.href);
      u.searchParams.set("team", t.id);
      history.replaceState(null, "", u.pathname + u.search + u.hash);
    } catch (e) {}
  }

  /* ---------- il grande vinile: buio, il disco entra, 4 giri con flash e raggi, poi si rimpicciolisce nel quadro ---------- */
  function transition(t, opts) {
    opts = opts || {};
    var xf = $("#xf");
    if (reduce || !xf.animate || busy) {
      swapTo(t);
      if (opts.toHero) $(".hero").scrollIntoView({ block: "start" });
      return;
    }
    busy = true;
    var disc = $(".xf-disc"), move = $(".xf-move"), rays = $(".xf-rays"), flash = $(".xf-flash");
    disc.innerHTML = discSVG(t, heroOpts(t));
    var c = t.cols;
    rays.style.background = "repeating-conic-gradient(from 0deg, transparent 0 9deg, " + t.th.acc + " 9deg 12deg, transparent 12deg 24deg, " + (c[1] === c[0] ? "#fff" : c[1]) + " 24deg 26deg, transparent 26deg 36deg)";
    xf.style.visibility = "visible";
    var ease = "cubic-bezier(.2,.8,.2,1)";
    xf.animate([{ backgroundColor: "rgba(3,8,18,0)" }, { backgroundColor: "rgba(3,8,18,.94)", offset: 0.16 },
                { backgroundColor: "rgba(3,8,18,.94)", offset: 0.74 }, { backgroundColor: "rgba(3,8,18,0)" }], { duration: 1500, fill: "forwards" });
    rays.animate([{ opacity: 0, transform: "rotate(0deg) scale(.6)" }, { opacity: .75, transform: "rotate(40deg) scale(1)", offset: 0.25 },
                  { opacity: .55, transform: "rotate(160deg) scale(1.08)", offset: 0.7 }, { opacity: 0, transform: "rotate(200deg) scale(1.2)" }],
                 { duration: 1500, easing: "linear", fill: "forwards" });
    flash.animate([{ opacity: 0 }, { opacity: 0, offset: 0.22 }, { opacity: .8, offset: 0.25 }, { opacity: 0, offset: 0.31 },
                   { opacity: .6, offset: 0.40 }, { opacity: 0, offset: 0.46 }, { opacity: .7, offset: 0.55 }, { opacity: 0, offset: 0.61 },
                   { opacity: .9, offset: 0.70 }, { opacity: 0, offset: 0.78 }, { opacity: 0 }], { duration: 1500, fill: "forwards" });
    move.animate([{ transform: "translateY(70vh) scale(.35)", opacity: 0 }, { transform: "translateY(0) scale(1)", opacity: 1 }],
                 { duration: 320, easing: ease, fill: "forwards" });
    disc.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(1440deg)" }],
                 { duration: 1100, easing: "cubic-bezier(.35,0,.25,1)", fill: "forwards" });
    setTimeout(function () {
      swapTo(t);
      if (opts.toHero) window.scrollTo(0, 0);
    }, 330);
    setTimeout(function () {
      var target = $(".hero-disc").getBoundingClientRect();
      var me = move.getBoundingClientRect();
      var dx = target.left + target.width / 2 - (me.left + me.width / 2);
      var dy = target.top + target.height / 2 - (me.top + me.height / 2);
      var s = target.width / me.width;
      var a = move.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: "translate(" + dx + "px," + dy + "px) scale(" + s + ")", opacity: 1, offset: .85 },
                            { transform: "translate(" + dx + "px," + dy + "px) scale(" + s + ")", opacity: 0 }],
                           { duration: 420, easing: "cubic-bezier(.6,0,.3,1)", fill: "forwards" });
      a.onfinish = function () {
        xf.style.visibility = "hidden";
        xf.getAnimations({ subtree: true }).forEach(function (an) { an.cancel(); });
        busy = false;
        var hd = $(".hero-disc");
        hd.classList.remove("boost"); void hd.getBoundingClientRect(); hd.classList.add("boost");
      };
    }, 1080);
  }
  function applyTeam(t, opts) {
    opts = opts || {};
    if (!t || submitting) return;
    if (opts.animate) transition(t, opts); else swapTo(t);
    if (opts.save) remember(t);
    var lr = $("#live"); if (lr && opts.animate) lr.textContent = T.edition + " " + t.name;
  }

  /* ---------- "Cambia bandiera": porta alla fila delle bandiere, con la propria già in vista ---------- */
  /* ---------- cambio squadra in alto: il tasto con la bandiera apre la fila di bandiere sotto al menu ---------- */
  var picker = $("#squadre"), pickBtn = $("#team-pick"), pickerAnchor = null, pickerFromOrder = false;
  function openPicker() {
    if (!picker || submitting) return;
    pickerAnchor = document.activeElement;
    var orderRect = $("#ordina").getBoundingClientRect();
    pickerFromOrder = !!(pickerAnchor && pickerAnchor.closest("#order-form")) ||
      (orderRect.top < innerHeight && orderRect.bottom > $(".top").getBoundingClientRect().bottom);
    var top = $(".top").getBoundingClientRect().bottom;
    picker.style.top = Math.max(0, top) + "px";
    picker.hidden = false;
    pickBtn.setAttribute("aria-expanded", "true");
    var b = $('.team[aria-pressed="true"]') || $(".team");
    if (b) b.focus({ preventScroll: true });
  }
  function closePicker(back) {
    if (!picker || picker.hidden) return;
    picker.hidden = true;
    pickBtn.setAttribute("aria-expanded", "false");
    if (back) (pickerAnchor || pickBtn).focus({ preventScroll: true });
  }
  if (pickBtn) pickBtn.addEventListener("click", function () { if (picker.hidden) openPicker(); else closePicker(true); });
  var pc = $("#picker-close"); if (pc) pc.addEventListener("click", function () { closePicker(true); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePicker(true); });
  document.addEventListener("click", function (e) {
    if (picker && !picker.hidden && !picker.contains(e.target) && !pickBtn.contains(e.target) && !e.target.closest('a.change[href="#squadre"]')) closePicker(false);
  });
  window.addEventListener("resize", function () { if (picker && !picker.hidden) picker.style.top = Math.max(0, $(".top").getBoundingClientRect().bottom) + "px"; });
  window.addEventListener("scroll", function () { if (picker && !picker.hidden) picker.style.top = Math.max(0, $(".top").getBoundingClientRect().bottom) + "px"; }, { passive: true });
  $$('a.change[href="#squadre"]').forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); openPicker(); });
  });
  /* ---------- bandiere: un tocco e il sito cambia squadra ---------- */
  drawTeamGrid();
  $$(".team").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = BY_ID[b.dataset.team];
      b.classList.remove("spin"); void b.offsetWidth; b.classList.add("spin");
      closePicker(false);
      if (pickerFromOrder) {
        applyTeam(t, { animate: false, save: true });
        $("#ordina").scrollIntoView({ block: "start", behavior: "instant" });
        $("#order-form .change").focus({ preventScroll: true });
      } else applyTeam(t, { animate: true, save: true, toHero: true });
    });
  });

  $("#hd-list").addEventListener("click", function (e) {
    var a = e.target.closest("a[data-story]"); if (!a) return;
    var card = $("#storia-" + a.dataset.story); if (!card) return;
    card.classList.remove("hl"); void card.offsetWidth; card.classList.add("hl");
  });

  /* ---------- lingua: la squadra scelta resta, all'arrivo riparte il vinile ---------- */
  $("#lang-select").addEventListener("change", function (e) {
    var href = (DATA.langHref && DATA.langHref[e.target.value]) || ("/" + e.target.value + "/");
    var chosen = null;
    try { chosen = localStorage.getItem("vinilazo-team"); sessionStorage.setItem("vz-xf", "1"); } catch (err) {}
    location.href = href + (chosen && !CFG.PREVIEW ? "?team=" + chosen : "");
  });

  /* ---------- video in loop ---------- */
  var loops = $$("video.loop");
  if (!reduce && "IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { if (v.dataset.user === "paused") return; if (v.preload === "none") v.preload = "auto"; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.35 });
    loops.forEach(function (v) { vio.observe(v); });
  }
  loops.forEach(function (v) {
    var box = v.parentNode;
    v.addEventListener("click", function () { if (v.paused) { v.dataset.user = ""; v.play(); } else { v.dataset.user = "paused"; v.pause(); } });
    v.addEventListener("playing", function () { box.classList.add("playing"); });
    v.addEventListener("pause", function () { box.classList.remove("playing"); });
    var pb = $(".play", box); if (pb) pb.addEventListener("click", function () { v.dataset.user = ""; if (v.preload === "none") v.preload = "auto"; v.play(); });
  });
  /* tocco: il disco fa un giro (sul telefono non c'è il passaggio del mouse) */
  document.addEventListener("click", function (e) {
    var d = e.target.closest && e.target.closest(".discs .d, .sdisc, .hd-disc");
    if (!d || reduce) return;
    d.classList.remove("tap"); void d.offsetWidth; d.classList.add("tap");
  });

  /* ---------- paesi: tutto il mondo, nella lingua della pagina ---------- */
  var ISO = "AF AX AL DZ AS AD AO AI AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BA BW BR VG BN BG BF BI KH CM CA CV KY CF TD CL CN CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI XK KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG MK NO OM PK PW PS PA PG PY PE PH PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TC TV UG UA AE GB US UY UZ VU VA VE VN WF EH YE ZM ZW".split(" ");
  (function () {
    var sel = $("#f-country");
    var dn;
    try { dn = new Intl.DisplayNames([DATA.lang], { type: "region" }); } catch (e) { return; }
    var list = ISO.map(function (c) { return { c: c, n: dn.of(c) }; }).filter(function (x) { return x.n && x.n !== x.c; });
    list.sort(function (a, b) { return a.n.localeCompare(b.n, DATA.lang); });
    var def = T.country_default;
    var html = list.map(function (x) { return '<option data-iso="' + x.c + '" value="' + esc(x.n) + '"' + (x.c === def ? " selected" : "") + ">" + esc(x.n) + "</option>"; }).join("");
    sel.innerHTML = html + '<option value="' + esc(T.country_other) + '">' + esc(T.country_other) + "</option>";
  })();

  /* ---------- quantità ---------- */
  function setQty(n) {
    qty = Math.max(1, Math.min(MAX_QTY, n));
    $("#qty-out").textContent = qty;
    var f = $("#order-form");
    f.elements.quantita.value = qty;
    f.elements.totale.value = fmt(total());
    $("#submit").textContent = fill(T.submit, { total: fmt(total()) });
    $$("[data-qty]").forEach(function (b) { b.disabled = submitting || (Number(b.dataset.qty) < 0 ? qty === 1 : qty === MAX_QTY); });
    updateSummary();
  }
  function updateSummary() {
    if (!CHECKOUT || !current) return;
    if (cart) { cartSummary(); return; }
    $("#summary-product").textContent = fill(CHECKOUT.product, { team: current.name });
    $("#summary-unit").textContent = fmt(PRICE);
    $("#summary-qty").textContent = qty;
    $("#summary-total").textContent = fmt(total());
    var second = secondTeam(), secondQty = second ? Math.floor(qty / 2) : 0;
    var saving = qty * PRICE - baseTotal();
    $("#summary-discount-row").hidden = saving <= 0;
    $("#summary-discount").textContent = "−" + fmt(saving);
    $("#summary-editions").textContent = STORE.sum_editions + ": " + current.name + " × " + (qty - secondQty) + (second ? " · " + second.name + " × " + secondQty : "");
    $("#second-team-field").hidden = qty < 2;
    var f = $("#order-form");
    f.elements.seconda_squadra.value = second ? second.name : "";
    f.elements.squadra_id_2.value = second ? second.id : "";
    f.elements.quantita_seconda_squadra.value = secondQty;
    f.elements.regalo.value = $("#f-gift").checked ? "yes" : "no";
    var eta = current.ready && (!second || second.ready) ? T.price_ready : T.price_note;
    $$("[data-eta]", f).forEach(function (el) { el.textContent = eta; });
  }
  function secondTeam() {
    var id = $("#f-second-team").value;
    return qty >= 2 && id && current && id !== current.id ? BY_ID[id] : null;
  }
  function baseTotal() { return Math.floor(qty / 2) * PAIR_PRICE + (qty % 2) * PRICE; }
  var ADDON = CFG.CUSTOM_PRICE || 10;
  function custom() { var c = $("#f-custom"); return !!(c && c.checked); }
  function total() { return cart ? cartTotal(cartCount()) : baseTotal() + (custom() ? ADDON : 0); }

  /* ---------- carrello: ordine con più squadre (gestito da vz-cart.js) ---------- */
  var cart = null, cartWords = {}, CART_MAX = 6;
  function cartCount() { return cart ? cart.reduce(function (a, i) { return a + i.qty; }, 0) : 0; }
  function cartTotal(n) { return Math.round((Math.floor(n / 2) * PAIR_PRICE + (n % 2) * PRICE) * 100) / 100; }
  function cartLabel() { return cart.map(function (i) { return BY_ID[i.id].name + " × " + i.qty; }).join(" · "); }
  function cartSummary() {
    var n = cartCount(), f = $("#order-form"), sum = cartTotal(n), saving = Math.round((n * PRICE - sum) * 100) / 100;
    $("#summary-product").textContent = fill(CHECKOUT.product, { team: cart.length === 1 ? BY_ID[cart[0].id].name : cart.map(function (i) { return BY_ID[i.id].name; }).join(" + ") });
    $("#summary-unit").textContent = fmt(PRICE);
    $("#summary-qty").textContent = n;
    $("#summary-total").textContent = fmt(sum);
    $("#summary-discount-row").hidden = saving <= 0;
    $("#summary-discount").textContent = "−" + fmt(saving);
    $("#summary-editions").textContent = STORE.sum_editions + ": " + cartLabel();
    f.elements.squadra.value = cartLabel();
    f.elements.squadra_id.value = cart.map(function (i) { return i.id + ":" + i.qty; }).join(",");
    f.elements.dischi_storici.value = "";
    f.elements.quantita.value = n;
    f.elements.totale.value = fmt(sum);
    f.elements.seconda_squadra.value = ""; f.elements.squadra_id_2.value = ""; f.elements.quantita_seconda_squadra.value = 0;
    f.elements.regalo.value = $("#f-gift").checked ? "yes" : "no";
    var eta = cart.every(function (i) { return BY_ID[i.id].ready; }) ? T.price_ready : T.price_note;
    $$("[data-eta]", f).forEach(function (el) { el.textContent = eta; });
    var review = $("#vz-cart-review");
    if (review) {
      var list = $("ul", review); list.replaceChildren();
      cart.forEach(function (i) { var li = document.createElement("li"); var b = document.createElement("b"); b.textContent = BY_ID[i.id].name; li.append(b, document.createTextNode(" × " + i.qty)); list.appendChild(li); });
    }
    $("#submit").textContent = fill(T.submit, { total: fmt(sum) });
  }
  function applyCart() {
    var f = $("#order-form"), fs = $(".chosen", f) && $(".chosen", f).closest("fieldset");
    f.classList.toggle("vz-cart-mode", !!cart);
    if (fs) {
      var legend = $("legend", fs), text = legend && legend.lastChild;
      if (text && text.nodeType === 3) { if (!legend.dataset.vzLabel) legend.dataset.vzLabel = text.textContent; text.textContent = cart && cartWords.legend ? cartWords.legend : legend.dataset.vzLabel; }
      var review = $("#vz-cart-review");
      if (!review) {
        review = document.createElement("div"); review.id = "vz-cart-review"; review.className = "vz-cart-review";
        review.appendChild(document.createElement("ul"));
        var edit = document.createElement("button"); edit.type = "button"; edit.className = "vz-cart-edit"; edit.dataset.vzCartEdit = "";
        review.appendChild(edit);
        legend.after(review);
      }
      $(".vz-cart-edit", review).textContent = cartWords.edit || "";
    }
    if (cart) cartSummary(); else setQty(qty);
  }
  window.vzShop = {
    price: PRICE, pairPrice: PAIR_PRICE, max: CART_MAX, fmt: fmt, teams: BY_ID,
    total: cartTotal,
    current: function () { return current ? current.id : null; },
    busy: function () { return submitting; },
    orderCart: function (items, words) {
      if (submitting) return false;
      if (words) cartWords = words;
      var clean = (items || []).filter(function (i) { return i && BY_ID[i.id] && i.qty > 0; }).map(function (i) { return { id: i.id, qty: Math.min(CART_MAX, Math.floor(i.qty)) }; });
      cart = clean.length ? clean : null;
      applyCart();
      return true;
    }
  };
  if ($("#f-custom")) $("#f-custom").addEventListener("change", function () {
    var on = custom();
    $("#custom-field").hidden = !on;
    $("#mio-disco").required = on;
    if (on) $("#mio-disco").focus(); else setErr($("#mio-disco"), "");
    this.closest(".addon").classList.toggle("on", on);
    setQty(qty);
  });
  /* prezzo da config.js (spedizione inclusa) */
  $$("[data-price]").forEach(function (el) { el.textContent = fmt(PRICE); });
  $$("[data-price-cta]").forEach(function (el) { el.textContent = T.cta.replace(/\d+\s?€|€\s?\d+/, fmt(PRICE)); });
  $$("[data-qty]").forEach(function (b) { b.addEventListener("click", function () { setQty(qty + Number(b.dataset.qty)); }); });

  /* ---------- pacchetto, idea regalo e assistenza ordini ---------- */
  var secondSelect = $("#f-second-team");
  TEAMS.slice().sort(function (a, b) { return a.name.localeCompare(b.name, DATA.lang); }).forEach(function (team) {
    var option = document.createElement("option"); option.value = team.id; option.textContent = team.name; secondSelect.appendChild(option);
  });
  secondSelect.addEventListener("change", updateSummary);
  $("#f-gift").addEventListener("change", updateSummary);
  $$("[data-pair-price]").forEach(function (el) { el.textContent = fmt(PAIR_PRICE); });
  $$("[data-pair-copy]").forEach(function (el) { el.textContent = fill(STORE.gift_pair, { pair: fmt(PAIR_PRICE), saving: fmt(PRICE * 2 - PAIR_PRICE), unit: fmt(PRICE) }); });
  $$("[data-pair-terms]").forEach(function (el) { el.textContent = fill(STORE.pair_terms, { unit: fmt(PRICE) }); });
  $$("[data-select-pair]").forEach(function (el) { el.addEventListener("click", function (event) {
    event.preventDefault(); if (submitting) return;
    if (el.closest(".gift-section")) $("#f-gift").checked = true;
    setQty(2); $("#ordina").scrollIntoView({ block: "start", behavior: reduce ? "instant" : "smooth" });
  }); });
  $$("[data-gift-order]").forEach(function (el) { el.addEventListener("click", function () {
    if (!submitting) { $("#f-gift").checked = true; updateSummary(); }
  }); });
  var statusReference = $("#order-reference");
  function statusLink() {
    var value = statusReference.value.trim();
    var statusBtn = $("#order-status-wa");
    statusBtn.href = "https://ig.me/m/" + (CFG.INSTAGRAM || "vinilazoo");
    statusBtn.setAttribute("data-msg", fill(STORE.order_wa, { reference: value || "—" }));
    statusBtn.target = "_blank"; statusBtn.rel = "noopener";
  }
  try { statusReference.value = sessionStorage.getItem("vinilazo-last-ref") || ""; } catch (err) {}
  statusReference.addEventListener("input", statusLink); statusLink();

  /* ---------- pagamento e venditore ---------- */
  if (CFG.STRIPE_LINK) {
    if (MAX_QTY === 1) {
      $$(".bundle-offer, .gift-pair").forEach(function (el) { el.hidden = true; });
      var quantityControl = $("#qty-out").parentElement; quantityControl.hidden = true;
    }
    $("#pay-note").textContent = T.pay_stripe;
    $("#checkout-intro").textContent = T.pay_stripe;
    $("#checkout-next-p").textContent = T.pay_stripe;
    var pf = $("[data-pay-faq]"); if (pf) pf.textContent = T.pay_faq_stripe;
  }
  if (CFG.CHECKOUT_ENDPOINT && typeof fetch === "function") {
    fetch(CFG.CHECKOUT_ENDPOINT, typeof AbortSignal.timeout === "function" ? {signal:AbortSignal.timeout(5000)} : {}).then(function (r) { if (!r.ok) throw new Error("unavailable"); return r.json(); }).then(function (state) {
      if (state.ready !== true || submitting) return;
      checkoutReady = true; MAX_QTY = 2;
      $$(".bundle-offer, .gift-pair").forEach(function (el) { el.hidden = false; });
      $("#qty-out").parentElement.hidden = false; setQty(qty);
    }).catch(function () {});
  }
  if (CFG.SELLER) { $("#seller").hidden = false; $("#seller-p").textContent = CFG.SELLER; }

  /* ---------- modulo ---------- */
  var form = $("#order-form");
  $("#checkout-privacy-link").addEventListener("click", function () {
    var details = $("#privacy-details");
    details.open = true;
    $("summary", details).focus();
  });
  function setErr(input, msg) {
    var f = input.closest(".field");
    if (!f) return;
    f.classList.toggle("bad", !!msg);
    var s = $(".err", f); if (s) {
      if (!s.id) s.id = input.id + "-err";
      s.textContent = msg || "";
      var ids = (input.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
      if (ids.indexOf(s.id) < 0) ids.push(s.id);
      input.setAttribute("aria-describedby", ids.join(" "));
    }
    input.setAttribute("aria-invalid", msg ? "true" : "false");
  }
  function check(input) {
    var v = input.value.trim();
    if (input.required && !v) {
      var label = $("label", input.closest(".field"));
      setErr(input, input.id === "mio-disco" ? T.err_custom : fill(CHECKOUT.required, { label: label ? label.textContent : input.name })); return false;
    }
    if (input.name === "telefono" && v && (!/^\+?[\d\s().-]+$/.test(v) || v.replace(/\D/g, "").length < 7 || v.replace(/\D/g, "").length > 15)) { setErr(input, CHECKOUT.phone); return false; }
    if (input.type === "email" && v && (!input.validity.valid || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))) { setErr(input, CHECKOUT.email); return false; }
    var country = $("#f-country"), selected = country.options[country.selectedIndex];
    if (input.name === "cap" && v && selected && selected.dataset.iso === "IT" && !/^\d{5}$/.test(v)) { setErr(input, CHECKOUT.postcode); return false; }
    setErr(input, ""); return true;
  }
  $$(".field input", form).forEach(function (i) {
    i.addEventListener("blur", function () { if (i.value || i.getAttribute("aria-invalid") === "true") check(i); });
    i.addEventListener("input", function () {
      if (i.getAttribute("aria-invalid") === "true") check(i);
      if (!$(".field.bad", form)) $("#form-err").hidden = true;
    });
  });
  $("#f-country").addEventListener("change", function () { if ($("#f-cap").value) check($("#f-cap")); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (submitting) return;
    var bad = $$(".field input, #mio-disco", form).filter(function (i) { return (i.id !== "mio-disco" || custom()) && !check(i); });
    if (bad.length) {
      var err = $("#form-err"); err.textContent = CHECKOUT.errors; err.hidden = false;
      bad[0].focus({ preventScroll: true });
      bad[0].scrollIntoView({ block: "center", behavior: reduce ? "instant" : "smooth" });
      return;
    }
    if (cart && cartCount() > 1 && !checkoutReady) { var ce = $("#form-err"); ce.textContent = T.err_send; ce.hidden = false; return; }
    if (!cart && qty === 2 && !checkoutReady) return;
    var order = { secondTeamId: secondTeam() ? secondTeam().id : current.id, gift: $("#f-gift").checked, name: form.elements.nome.value.trim().split(/\s+/)[0], team: current.name, teamId: current.id, qty: qty, total: total(), custom: custom(), email: form.elements.email.value.trim() };
    if (cart) {
      order.items = cart.map(function (i) { return { teamId: i.id, qty: i.qty }; });
      order.teamId = cart[0].id; order.secondTeamId = cart[1] ? cart[1].id : cart[0].id;
      order.team = cart.map(function (i) { return BY_ID[i.id].name + (i.qty > 1 ? " ×" + i.qty : ""); }).join(" + ");
      order.qty = cartCount(); order.total = cartTotal(order.qty); order.custom = false;
    }
    updateSummary();
    if (!form.elements.riferimento_ordine.value) {
      var random = new Uint8Array(8); crypto.getRandomValues(random);
      form.elements.riferimento_ordine.value = "VZ-" + Array.from(random, function (n) { return n.toString(16).padStart(2, "0"); }).join("").toUpperCase();
    }
    order.reference = form.elements.riferimento_ordine.value;
    order.editions = $("#summary-editions").textContent;
    var countrySel = $("#f-country"), countryOpt = countrySel.options[countrySel.selectedIndex];
    order.customer = { name: form.elements.nome.value.trim(), phone: form.elements.telefono.value.trim(), address: form.elements.indirizzo.value.trim(), cap: form.elements.cap.value.trim(), city: form.elements.citta.value.trim(), country: countryOpt ? countryOpt.value : "", iso: countryOpt && countryOpt.dataset.iso || "" };
    var body = new URLSearchParams(new FormData(form)).toString();
    submitting = true;
    form.setAttribute("aria-busy", "true");
    var locked = $$("input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled)", form);
    locked.forEach(function (el) { el.disabled = true; });
    $("#lang-select").disabled = true; pickBtn.disabled = true;
    var btn = $("#submit");
    btn.disabled = true; btn.textContent = T.sending;
    $("#form-err").hidden = true;
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 20000);
    var send = CFG.PREVIEW ? Promise.resolve({ ok: true }) :
      fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body, signal: controller.signal });
    send
      .then(function (r) { if (!r.ok) throw new Error(r.status); })
      .then(async function () {
        if (!checkoutReady) return;
        var response = await fetch(CFG.CHECKOUT_ENDPOINT, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({items:order.items,qty:order.qty,teamId:order.teamId,secondTeamId:order.secondTeamId,reference:order.reference,lang:DATA.lang,gift:order.gift,email:order.email,customer:order.customer}),signal:controller.signal});
        if (!response.ok) throw new Error("payment_unavailable");
        var session = await response.json();
        if (!/^https:\/\/checkout\.stripe\.com\//.test(session.url || "")) throw new Error("invalid_payment_url");
        order.paymentUrl = session.url;
      })
      .then(function () {
        clearTimeout(timeout);
        form.removeAttribute("aria-busy");
        form.hidden = true;
        var d = $("#done");
        $("#done-p").textContent = (CFG.STRIPE_LINK ? T.done_stripe : fill(T.done_p, { name: order.name, team: order.team })) +
          (CFG.PREVIEW ? " (Anteprima: l'ordine non è stato inviato.)" : "");
        $("#done-summary").textContent = fill(CHECKOUT.product, { team: order.team }) + " · " + CHECKOUT.quantity + ": " + order.qty + " · " + CHECKOUT.total + ": " + fmt(order.total);
        $("#done-summary").textContent += " · " + order.editions;
        $("#done-reference").textContent = order.reference;
        try { sessionStorage.setItem("vinilazo-last-ref", order.reference); } catch (err) {}
        statusReference.value = order.reference; statusLink();
        $("#done-unpaid").hidden = false;
        submitting = false; $("#lang-select").disabled = false; pickBtn.disabled = false;
        d.hidden = false; d.focus();
        d.scrollIntoView({ block: "center", behavior: reduce ? "instant" : "smooth" });
        track("InitiateCheckout", { value: order.total, currency: "EUR", content_ids: order.items ? order.items.map(function (i) { return i.teamId; }) : (order.qty === 2 ? [order.teamId, order.secondTeamId] : [order.teamId]), content_type: "product", num_items: order.qty });
        var link = order.paymentUrl || ((order.custom && CFG.STRIPE_LINK_CUSTOM) ? CFG.STRIPE_LINK_CUSTOM : CFG.STRIPE_LINK);
        if (link) {
          var paymentUrl = new URL(link);
          if (!order.paymentUrl) paymentUrl.searchParams.set("client_reference_id", order.reference);
          var u = paymentUrl.toString();
          var payAgain = document.createElement("a");
          payAgain.className = "btn btn-acc"; payAgain.id = "continue-payment";
          payAgain.href = u; payAgain.textContent = fill(T.submit, { total: fmt(order.total) });
          d.appendChild(payAgain);
          setTimeout(function () { location.href = u; }, 300);

        }
      })
      .catch(function () {
        clearTimeout(timeout);
        submitting = false; form.removeAttribute("aria-busy");
        locked.forEach(function (el) { el.disabled = false; });
        $("#lang-select").disabled = false; pickBtn.disabled = false;
        btn.disabled = false; setQty(qty);
        var fe = $("#form-err"); fe.textContent = T.err_send; fe.hidden = false;
      });
  });

  /* ---------- barra fissa ---------- */
  var sticky = $("#sticky");
  if ("IntersectionObserver" in window) {
    var heroIn = true, orderIn = false;
    var upd = function () { sticky.classList.toggle("show", !heroIn && !orderIn); };
    new IntersectionObserver(function (en) { heroIn = en[0].isIntersecting; upd(); }, { threshold: 0 }).observe($(".hero .buy"));
    new IntersectionObserver(function (en) { orderIn = en[0].isIntersecting; upd(); }, { threshold: 0.05 }).observe($("#ordina"));
  }

  /* ---------- Pixel Meta ---------- */
  function track(ev, params) { if (window.vzTrack) window.vzTrack(ev, params); }


  /* L'anteprima in home è interattiva: scambio disco e telecronaca Argentina. */
  var vzPreviewAudio = null;
  var vzPreviewFiles = ["maradona-mano-de-dios.mp3","burruchaga-1986.mp3","messi-getafe-2007.mp3","montiel-2022.mp3","messi-copa-america-2007.mp3","maradona-gol-del-siglo.mp3","kempes-1978.mp3","di-maria-2022.mp3","messi-brasile-2012.mp3"];
  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("[data-preview-disc]");
    if (!link) return;
    var team = BY_ID[document.querySelector('.team[aria-pressed="true"]')?.dataset.team] || BY_ID[DATA.def_team];
    if (!team) return;
    event.preventDefault();
    var index = Number(link.getAttribute("data-preview-disc")) - 1;
    var hero = $(".hero-disc"), thumb = link.querySelector(".hd-disc");
    if (!hero || !team.goals[index]) return;
    var former = Math.max(0, Number(hero.dataset.currentDisc || "1")-1);
    var oldMarkup = hero.innerHTML;
    var nextMarkup = discSVG(team, gOpts(team, team.goals[index]));
    var canMove = team.id === "argentina" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && thumb && hero.animate;
    if (canMove) {
      var from = thumb.getBoundingClientRect(), to = hero.getBoundingClientRect();
      function flight(markup, start, finish, reverse) {
        var ghost = document.createElement("div");
        ghost.className = "vz-disc-flight";
        ghost.innerHTML = '<svg viewBox="0 0 200 200" aria-hidden="true">'+markup+'</svg>';
        ghost.style.cssText="position:fixed;left:"+start.left+"px;top:"+start.top+"px;width:"+start.width+"px;height:"+start.height+"px;z-index:130;pointer-events:none";
        document.body.appendChild(ghost);
        var anim=ghost.animate([{transform:"translate(0,0) scale(1)",opacity:.98},{transform:"translate("+(finish.left-start.left)+"px,"+(finish.top-start.top)+"px) scale("+(finish.width/start.width)+") rotate("+(reverse?-240:240)+"deg)",opacity:.9}],{duration:580,easing:"cubic-bezier(.3,.7,.2,1)",fill:"forwards"});
        anim.onfinish=function(){ghost.remove()};
        anim.oncancel=function(){ghost.remove()};
      }
      if(index!==former) flight(oldMarkup,to,from,true);
      flight(nextMarkup,from,to,false);
    }
    hero.innerHTML=nextMarkup;
    hero.dataset.currentDisc=String(index+1);
    document.querySelectorAll("[data-preview-disc]").forEach(function(a){a.classList.toggle("vz-active-disc",a===link)});
    if (vzPreviewAudio) { vzPreviewAudio.pause(); vzPreviewAudio=null; }
    if (team.id==="argentina") {
      vzPreviewAudio = new Audio("../assets/audio/argentina/"+vzPreviewFiles[index]);
      vzPreviewAudio.play().catch(function(){});
    }
  });

  /* ---------- avvio: squadra dal link, poi quella già scelta, altrimenti la nazionale della lingua ---------- */
  var start = null, fromLink = false;
  try {
    var q = new URLSearchParams(location.search).get("team") || location.hash.replace("#", "");
    if (BY_ID[q]) { start = BY_ID[q]; fromLink = true; }
  } catch (e) {}
  if (!start) { try { var s = localStorage.getItem("vinilazo-team"); if (BY_ID[s]) start = BY_ID[s]; } catch (e) {} }
  start = start || BY_ID[DATA.def_team] || BY_ID.argentina;
  var intro = false;
  try { intro = sessionStorage.getItem("vz-xf") === "1"; sessionStorage.removeItem("vz-xf"); } catch (e) {}
  swapTo(start);
  if (fromLink) remember(start);
  if (intro) setTimeout(function () { transition(start, {}); }, 60);
  setQty(1);
  // dalla pagina prodotto "Cambia bandiera" porta qui con #squadre: si apre subito la fila di bandiere
  if (location.hash === "#squadre") setTimeout(function () { window.scrollTo(0, 0); openPicker(); }, 80);

  /* ---------- modalità vetrina: ?demo=1 cambia squadra da sola (video e schermi in negozio) ---------- */
  try {
    if (new URLSearchParams(location.search).get("demo")) {
      var seq = ["argentina", "real-madrid", "juventus", "brasile", "milan", "barcelona", "italia", "liverpool", "inter", "francia"], k = 0;
      setInterval(function () { k = (k + 1) % seq.length; applyTeam(BY_ID[seq[k]], { animate: true }); }, 2600);
    }
  } catch (e) {}
})();
