/* VINILAZO – pagina prodotto (per ora Argentina): dischi disegnati, prima pagina d'epoca, animazioni, tasti indietro */
(function () {
  "use strict";
  var DATA = JSON.parse(document.getElementById("data").textContent);
  var CFG = window.VINILAZO_CONFIG || {};
  var PRICE = CFG.PRICE || 69;
  var t = DATA.team;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var uid = 0;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(n) {
    try { return new Intl.NumberFormat(DATA.lang, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n); }
    catch (e) { return n + " €"; }
  }

  /* ---------- dischi (stesso disegno della home) ---------- */
  function labelPattern(t) {
    var c = t.cols, p = t.p, s = "", i, L = 42, W = 116;
    if (p === "stripes") {
      for (i = -1; i < 9; i++) s += '<rect x="' + (L + i * 14.5) + '" y="' + L + '" width="14.6" height="' + W + '" fill="' + c[(i + 10) % 2] + '"/>';
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
    var id = "p" + (++uid), grooves = "";
    for (var r = 63; r < 97; r += 3.4) grooves += '<circle cx="100" cy="100" r="' + r.toFixed(1) + '" fill="none" stroke="#2a2a2a" stroke-width=".7"/>';
    var s = '<defs><clipPath id="' + id + '"><circle cx="100" cy="100" r="58"/></clipPath>' +
      '<linearGradient id="' + id + 's" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".12"/></linearGradient></defs>' +
      '<circle cx="100" cy="100" r="99" fill="#141414"/>' + grooves + '<circle cx="100" cy="100" r="98" fill="url(#' + id + 's)"/>' +
      (t.ls === "arg" ? argLabel(opts, id) : '<g clip-path="url(#' + id + ')">' + labelPattern(t) + "</g>");
    if (!opts.plain && t.ls !== "arg") {
      var ink = t.th.ink || "#111", halo = t.th.halo;
      var deco = halo ? ' stroke="' + halo + '" stroke-width="2.6" stroke-linejoin="round" paint-order="stroke"' : "";
      var top = (opts.top || t.name).toUpperCase(), fsT = opts.minute ? 24 : fit(top, 70, 12.5);
      var big = (opts.big || "VINILAZO").toUpperCase(), small = (opts.small || "").toUpperCase();
      var fsB = fit(big, 90, 21), fsS = Math.min(8.4, 84 / (Math.max(1, small.length) * 0.66));
      s += '<g fill="' + ink + '"' + deco + ' text-anchor="middle">' +
           '<text x="100" y="' + (opts.minute ? 92 : 86) + '" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="' + fsT.toFixed(1) + '">' + esc(top) + "</text>" +
           '<text x="100" y="' + (small ? 124 : 128) + '" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="' + fsB.toFixed(1) + '">' + esc(big) + "</text>" +
           (small ? '<text x="100" y="136.5" font-family="Atkinson Hyperlegible Next, sans-serif" font-weight="800" font-size="' + fsS.toFixed(1) + '">' + esc(small) + "</text>" : "") + "</g>";
    }
    return s + '<circle cx="100" cy="100" r="3.6" fill="#141414" stroke="#fff" stroke-width="1.6"/>';
  }
  function gOpts(g) {
    var m = /^(\d+'|\d+-\d+)\s+(.*)$/.exec(g[1]);
    return m ? { top: m[1], minute: true, big: g[0], small: m[2] } : { big: g[0], small: g[1] };
  }
  var byN = {};
  DATA.discs.forEach(function (d) { byN[d.n] = d; });
  $$("svg[data-disc]").forEach(function (svg) { var d = byN[svg.getAttribute("data-disc")]; if (d) svg.innerHTML = discSVG(t, gOpts(d.g)); });
  $$(".hero-disc").forEach(function (svg) { svg.innerHTML = discSVG(t, gOpts(DATA.discs[0].g)); });
  $$(".ed-disc,.sticky-disc").forEach(function (svg) { svg.innerHTML = discSVG(t, { plain: true }); });
  $$(".wm-disc").forEach(function (svg) {
    svg.innerHTML = '<circle cx="100" cy="100" r="92" fill="#141414" stroke="currentColor" stroke-width="10"/><circle cx="100" cy="100" r="44" fill="' + t.cols[0] + '" stroke="' + t.cols[1] + '" stroke-width="10"/><circle cx="100" cy="100" r="9" fill="#141414"/>';
  });
  $$("[data-price]").forEach(function (el) { el.textContent = fmt(PRICE); });

  /* ---------- animazioni allo scorrimento ---------- */
  var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }) : null;
  $$(".rv").forEach(function (el) { if (io) io.observe(el); else el.classList.add("in"); });

  /* tocco: il disco fa un giro */
  document.addEventListener("click", function (e) {
    var d = e.target.closest && e.target.closest(".pp-big, .ix-disc");
    if (!d || reduce) return;
    d.classList.remove("tap"); void d.offsetWidth; d.classList.add("tap");
  });

  /* ---------- "Torna": se si arriva dalla home, si torna esattamente dove si era ---------- */
  $$("[data-back]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      try {
        if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) { e.preventDefault(); history.back(); }
      } catch (err) {}
    });
  });

  /* ---------- lingua: stessa pagina prodotto nell'altra lingua ---------- */
  $("#lang-select").addEventListener("change", function (e) {
    var href = DATA.langHref[e.target.value];
    if (href) location.href = href + location.hash;
  });

  /* ---------- se si arriva con #disco-N il disco si evidenzia ---------- */
  function flash() {
    var el = location.hash && document.getElementById(location.hash.slice(1));
    if (!el || !el.classList.contains("pp-disc")) return;
    el.classList.add("in");
    el.classList.remove("hl"); void el.offsetWidth; el.classList.add("hl");
  }
  window.addEventListener("hashchange", flash);
  flash();
})();
