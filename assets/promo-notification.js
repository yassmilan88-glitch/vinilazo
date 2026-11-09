/* VINILAZO — discreet launch promotion notification */
(function () {
  "use strict";
  var dataNode = document.getElementById("data");
  if (!dataNode) return;
  var data;
  try { data = JSON.parse(dataNode.textContent); } catch (e) { return; }
  var lang = data.lang || "it";
  var copy = {
    it: { title: "VINILAZO · PROMO LANCIO", ship: "Spedizione inclusa", time: "ora", close: "Chiudi promo" },
    en: { title: "VINILAZO · LAUNCH OFFER", ship: "Shipping included", time: "now", close: "Close offer" },
    es: { title: "VINILAZO · PROMO DE LANZAMIENTO", ship: "Envío incluido", time: "ahora", close: "Cerrar promo" },
    fr: { title: "VINILAZO · OFFRE DE LANCEMENT", ship: "Livraison incluse", time: "maintenant", close: "Fermer l’offre" },
    de: { title: "VINILAZO · STARTANGEBOT", ship: "Versand inklusive", time: "jetzt", close: "Angebot schließen" }
  }[lang] || { title: "VINILAZO · PROMO LANCIO", ship: "Spedizione inclusa", time: "ora", close: "Chiudi promo" };
  var KEY_COUNT = "vz-promo-notice-count";
  var KEY_LAST = "vz-promo-notice-last";
  var KEY_STOP = "vz-promo-notice-dismissed";
  var count = 0, last = 0, dismissed = false;
  try {
    count = Math.max(0, parseInt(sessionStorage.getItem(KEY_COUNT) || "0", 10) || 0);
    last = parseInt(sessionStorage.getItem(KEY_LAST) || "0", 10) || 0;
    dismissed = sessionStorage.getItem(KEY_STOP) === "1";
  } catch (e) {}
  if (count >= 3 || dismissed) return;

  function init() {
    if (document.getElementById("vz-promo-notice")) return;
    var params = new URLSearchParams(location.search);
    var selected = params.get("team");
    var validTeam = (data.teams || []).some(function (team) { return team.id === selected; });
    var href = validTeam
      ? location.pathname + location.search + "#ordina"
      : location.pathname + "?team=" + encodeURIComponent(data.def_team || "argentina");

    var card = document.createElement("aside");
    card.id = "vz-promo-notice";
    card.className = "vz-promo-notice";
    card.setAttribute("role", "status");
    card.setAttribute("aria-live", "polite");
    card.setAttribute("aria-hidden", "true");

    var link = document.createElement("a");
    link.className = "vz-promo-notice-link";
    link.href = href;
    link.setAttribute("aria-label", copy.title + ", 69 euro barrati, 49 euro, " + copy.ship);
    link.innerHTML =
      '<svg class="vz-promo-notice-icon" viewBox="0 0 48 48" aria-hidden="true">' +
        '<rect x="1" y="1" width="46" height="46" rx="13" fill="#6fa9dc"/>' +
        '<circle cx="24" cy="24" r="18.5" fill="#081426" stroke="#d8e8f6" stroke-opacity=".65" stroke-width="1"/>' +
        '<circle cx="24" cy="24" r="14.2" fill="none" stroke="#54708d" stroke-width=".7"/>' +
        '<circle cx="24" cy="24" r="10.5" fill="none" stroke="#54708d" stroke-width=".7"/>' +
        '<circle cx="24" cy="24" r="6.3" fill="#edf2f5"/>' +
        '<circle cx="24" cy="24" r="2.5" fill="#e7895e"/>' +
      '</svg>' +
      '<span class="vz-promo-notice-copy">' +
        '<span class="vz-promo-notice-top"><strong class="vz-promo-notice-title"></strong><span class="vz-promo-notice-time"></span></span>' +
        '<span class="vz-promo-notice-price"><del>69 €</del><strong>49 €</strong></span>' +
        '<span class="vz-promo-notice-shipping"></span>' +
      '</span>';
    link.querySelector(".vz-promo-notice-title").textContent = copy.title;
    link.querySelector(".vz-promo-notice-time").textContent = copy.time;
    link.querySelector(".vz-promo-notice-shipping").textContent = copy.ship;

    var close = document.createElement("button");
    close.className = "vz-promo-notice-close";
    close.type = "button";
    close.setAttribute("aria-label", copy.close);
    close.textContent = "×";

    card.append(link, close);
    document.body.appendChild(card);

    var hideTimer = 0, nextTimer = 0;
    function storeState() {
      try {
        sessionStorage.setItem(KEY_COUNT, String(count));
        sessionStorage.setItem(KEY_LAST, String(last));
      } catch (e) {}
    }
    function hide() {
      card.classList.remove("is-visible");
      card.setAttribute("aria-hidden", "true");
      if (count < 3 && !dismissed) {
        var wait = Math.max(7000, 26000 - (Date.now() - last));
        nextTimer = window.setTimeout(show, wait);
      }
    }
    function show() {
      if (dismissed || count >= 3 || document.hidden) return;
      count += 1;
      last = Date.now();
      storeState();
      card.setAttribute("aria-hidden", "false");
      card.classList.add("is-visible");
      hideTimer = window.setTimeout(hide, 4800);
    }
    function stopForSession() {
      dismissed = true;
      try { sessionStorage.setItem(KEY_STOP, "1"); } catch (e) {}
      window.clearTimeout(hideTimer);
      window.clearTimeout(nextTimer);
      card.classList.remove("is-visible");
      card.setAttribute("aria-hidden", "true");
    }
    close.addEventListener("click", stopForSession);
    link.addEventListener("click", function () {
      dismissed = true;
      try { sessionStorage.setItem(KEY_STOP, "1"); } catch (e) {}
    });

    var delay = count === 0 ? 7000 : Math.max(7000, 26000 - (Date.now() - last));
    window.setTimeout(show, delay);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
