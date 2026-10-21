/* VINILAZO — Anteprime audio Argentina */
(function () {
  "use strict";
  var root = document.getElementById("data");
  if (!root) return;
  var data;
  try { data = JSON.parse(root.textContent); } catch (_) { return; }
  if (!data.team || data.team.id !== "argentina") return;
  var files = [
    "maradona-mano-de-dios.mp3", "burruchaga-1986.mp3",
    "messi-getafe-2007.mp3", "montiel-2022.mp3",
    "messi-copa-america-2007.mp3", "maradona-gol-del-siglo.mp3",
    "kempes-1978.mp3", "di-maria-2022.mp3", "messi-brasile-2012.mp3"
  ];
  var labels = {
    es: ["Escuchar el gol", "Pausar", "Reproducir", "Audio del disco", "Cargando audio…", "No se pudo reproducir el audio"],
    it: ["Ascolta il gol", "Pausa", "Riprendi", "Audio del disco", "Caricamento audio…", "Impossibile riprodurre l'audio"],
    en: ["Hear the goal", "Pause", "Resume", "Disc audio", "Loading audio…", "Unable to play audio"],
    fr: ["Écouter le but", "Pause", "Reprendre", "Audio du disque", "Chargement audio…", "Lecture impossible"],
    de: ["Tor anhören", "Pause", "Fortsetzen", "Audio der Schallplatte", "Audio wird geladen…", "Audio kann nicht abgespielt werden"]
  };
  var L = labels[data.lang] || labels.es;
  var player = new Audio();
  player.preload = "none";
  var current = 0;
  var controls = {};
  function clock(seconds) {
    seconds = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
    return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
  }
  function refresh() {
    Object.keys(controls).forEach(function (key) {
      var id = +key, item = controls[id], active = current === id;
      var playing = active && !player.paused && !player.ended;
      item.section.classList.toggle("audio-active", playing);
      item.button.textContent = playing ? "Ⅱ " + L[1] : "▶ " + (active && player.currentTime ? L[2] : L[0]);
      item.button.setAttribute("aria-pressed", String(playing));
      item.seek.value = active && Number.isFinite(player.duration) ? player.currentTime / player.duration * 100 : 0;
      item.seek.disabled = !active || !Number.isFinite(player.duration);
      item.time.textContent = active ? clock(player.currentTime) + " / " + clock(player.duration) : "0:00";
    });
  }
  function toggle(id) {
    if (!controls[id]) return;
    if (current !== id) {
      player.pause();
      current = id;
      player.src = "../../assets/audio/argentina/" + files[id - 1];
      player.load();
    }
    if (player.paused) {
      controls[id].status.textContent = L[4];
      var promise = player.play();
      if (promise && promise.catch) promise.catch(function () { controls[id].status.textContent = L[5]; refresh(); });
    } else {
      player.pause();
    }
    refresh();
  }
  Array.prototype.forEach.call(document.querySelectorAll(".pp-disc"), function (section) {
    var id = +(section.id || "").replace("disco-", "");
    if (!(id >= 1 && id <= 9)) return;
    var host = section.querySelector(".pp-text");
    var nav = host && host.querySelector(".pp-nav");
    if (!host || !nav) return;
    var panel = document.createElement("div");
    panel.className = "vin-audio";
    panel.innerHTML = '<div class="vin-audio-top"><span class="vin-audio-kicker">♫ ' + L[3] + '</span><span class="vin-audio-time">0:00</span></div>' +
      '<div class="vin-audio-bar"><button type="button" class="vin-audio-btn" aria-pressed="false">▶ ' + L[0] + '</button>' +
      '<input class="vin-audio-seek" type="range" min="0" max="100" step="0.1" value="0" disabled></div>' +
      '<span class="vin-audio-status" role="status" aria-live="polite"></span>';
    host.insertBefore(panel, nav);
    var item = {
      section: section, button: panel.querySelector("button"), seek: panel.querySelector("input"),
      time: panel.querySelector(".vin-audio-time"), status: panel.querySelector(".vin-audio-status")
    };
    item.seek.setAttribute("aria-label", L[3]);
    controls[id] = item;
    item.button.addEventListener("click", function () { toggle(id); });
    item.seek.addEventListener("input", function () {
      if (current === id && Number.isFinite(player.duration)) player.currentTime = +item.seek.value / 100 * player.duration;
      refresh();
    });
    var disc = section.querySelector(".pp-big");
    if (disc) {
      disc.setAttribute("role", "button");
      disc.setAttribute("tabindex", "0");
      disc.setAttribute("aria-label", L[0] + ": " + section.querySelector("h2").textContent.trim());
      disc.addEventListener("click", function () { toggle(id); });
      disc.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(id); }
      });
    }
  });
  Array.prototype.forEach.call(document.querySelectorAll(".ix-list a[href^='#disco-']"), function (link) {
    link.addEventListener("click", function () {
      var id = +link.getAttribute("href").replace("#disco-", "");
      toggle(id);
    });
  });
  ["timeupdate", "loadedmetadata", "pause", "play", "ended"].forEach(function (event) {
    player.addEventListener(event, function () {
      if (event === "play" && controls[current]) controls[current].status.textContent = "";
      refresh();
    });
  });
  player.addEventListener("error", function () {
    if (controls[current]) controls[current].status.textContent = L[5];
    refresh();
  });
  window.addEventListener("pagehide", function () { player.pause(); });
})();