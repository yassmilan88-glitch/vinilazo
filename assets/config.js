/* ============================================================
   VINILAZO — IMPOSTAZIONI (valgono per tutte e 5 le lingue)
   Modifica solo i valori tra virgolette.
   ============================================================ */
window.VINILAZO_CONFIG = {
  // Prezzo in euro, spedizione inclusa in tutto il mondo
  PRICE: 49,

  // Set only after verifying the official VINILAZO business profile.
  TRUSTPILOT_URL: "",

  // Due prodotti a 39 euro ciascuno, anche squadre diverse.
  PAIR_PRICE: 78,

  // Link di pagamento Stripe (Payment Link). Se è vuoto, l'ordine arriva su Netlify e mandi tu il link di pagamento su WhatsApp.
  // Se lo inserisci, dopo il modulo il cliente va dritto al pagamento (il riferimento ordine arriva in Stripe come "client_reference_id").
  STRIPE_LINK: "https://buy.stripe.com/dRmbJ15uD80f1O95zIgrS00",

  // Link legacy: il checkout dinamico deve usare i prezzi aggiornati.
  STRIPE_MAX_QTY: 1,
  CHECKOUT_ENDPOINT: "/.netlify/functions/create-checkout",

  // Solo se riaccendiamo il disco personalizzato (+10 €): link Stripe con il prezzo più alto. Ora non serve.
  STRIPE_LINK_CUSTOM: "",

  // Numero WhatsApp (per ora NON usato sul sito: i contatti vanno nei DM di Instagram)
  WHATSAPP: "393295865883",

  // Account Instagram dove arrivano i messaggi dei clienti (senza @)
  INSTAGRAM: "vinilazoo",

  // ID del Pixel Meta per misurare le pubblicità (lascia vuoto se non lo usi)
  META_PIXEL_ID: "1621265198920991",

  // Dati di chi vende: obbligatori per vendere online (in Germania si chiama "Impressum").
  // Esempio: "Nome Società S.r.l. – Via ..., 12100 Cuneo (CN), Italia – P.IVA 01234567890 – email@esempio.it"
  SELLER: ""
};

/* Contatti su Instagram: il DM non accetta testo già scritto, quindi al clic
   copiamo il messaggio (squadra, riferimento ordine…) e il cliente lo incolla. */
(function () {
  var TOAST = {
    it: "Messaggio copiato: incollalo nella chat di Instagram",
    es: "Mensaje copiado: pegalo en el chat de Instagram",
    fr: "Message copié : collez-le dans la discussion Instagram",
    en: "Message copied: paste it into the Instagram chat",
    de: "Nachricht kopiert: füge sie im Instagram-Chat ein"
  };
  function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).catch(function () {});
        return;
      }
    } catch (e) {}
    try {
      var t = document.createElement("textarea");
      t.value = text; t.setAttribute("readonly", "");
      t.style.cssText = "position:fixed;top:-1000px;left:0;opacity:0";
      document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove();
    } catch (e) {}
  }
  function toast(msg) {
    try {
      var old = document.getElementById("vz-copy-toast");
      if (old) old.remove();
      var el = document.createElement("div");
      el.id = "vz-copy-toast"; el.setAttribute("role", "status"); el.textContent = msg;
      el.style.cssText = "position:fixed;left:50%;bottom:96px;transform:translateX(-50%);z-index:9999;max-width:calc(100% - 32px);" +
        "padding:12px 18px;border-radius:12px;background:#0b1730;color:#fff;font:600 15px/1.3 system-ui,sans-serif;" +
        "box-shadow:0 8px 24px rgba(0,0,0,.45);text-align:center";
      document.body.appendChild(el);
      setTimeout(function () { el.remove(); }, 3500);
    } catch (e) {}
  }
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href^="https://ig.me/"]');
    if (!a) return;
    var msg = a.getAttribute("data-msg");
    if (!msg) return;
    copyText(msg);
    var lang = (document.documentElement.lang || "it").slice(0, 2);
    toast(TOAST[lang] || TOAST.en);
  }, true);
})();
