/* ============================================================
   VINILAZO — IMPOSTAZIONI (valgono per tutte e 5 le lingue)
   Modifica solo i valori tra virgolette.
   ============================================================ */
window.VINILAZO_CONFIG = {
  // Prezzo in euro, spedizione inclusa in tutto il mondo
  PRICE: 69,

  // Due prodotti: 69 × 2 meno 10%, anche squadre diverse.
  PAIR_PRICE: 124.20,

  // Link di pagamento Stripe (Payment Link). Se è vuoto, l'ordine arriva su Netlify e mandi tu il link di pagamento su WhatsApp.
  // Se lo inserisci, dopo il modulo il cliente va dritto al pagamento (il riferimento ordine arriva in Stripe come "client_reference_id").
  STRIPE_LINK: "https://buy.stripe.com/dRmbJ15uD80f1O95zIgrS00",

  // Il link verificato vende un solo prodotto da 69 euro.
  STRIPE_MAX_QTY: 1,
  CHECKOUT_ENDPOINT: "/.netlify/functions/create-checkout",

  // Solo se riaccendiamo il disco personalizzato (+10 €): link Stripe con il prezzo più alto. Ora non serve.
  STRIPE_LINK_CUSTOM: "",

  // Numero WhatsApp per il bottone verde (con prefisso, senza + e senza spazi)
  WHATSAPP: "393295865883",

  // ID del Pixel Meta per misurare le pubblicità (lascia vuoto se non lo usi)
  META_PIXEL_ID: "1621265198920991",

  // Dati di chi vende: obbligatori per vendere online (in Germania si chiama "Impressum").
  // Esempio: "Nome Società S.r.l. – Via ..., 12100 Cuneo (CN), Italia – P.IVA 01234567890 – email@esempio.it"
  SELLER: ""
};
