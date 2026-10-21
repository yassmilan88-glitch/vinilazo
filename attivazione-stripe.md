# VINILAZO — attivazione checkout

Preparato: pagamento diretto Stripe; 1 prodotto 69 €, 2 prodotti 124,20 € (10% su 138 €), anche due squadre diverse. Scelta regalo e squadre associate al riferimento ordine. Nessun pagamento è stato eseguito durante i test.

## Cosa funziona con il solo caricamento statico
Il prodotto singolo usa il Payment Link live già fornito. I dati vengono prima registrati nel modulo Netlify, poi si apre Stripe. Verificare che Netlify rilevi il modulo `ordine` nel nuovo deploy e che il link non aggiunga tasse al prezzo pubblicizzato: nel controllo precedente risultava il calcolo tasse dopo l'indirizzo.

## Attivare anche la coppia
Il trascinamento del normale ZIP in Netlify Drop non distribuisce la funzione server. Serve un deploy con Netlify CLI o da repository del progetto esistente `vinilazo`, senza creare un nuovo sito.

1. Estrarre l'archivio. Collegare la cartella al progetto Netlify `vinilazo` con `netlify link`.
2. Nel pannello Netlify, Environment variables, aggiungere `STRIPE_SECRET_KEY` usando la chiave live dell'account corretto, accessibile solo alle Functions. Inserirla direttamente nel pannello, mai nei file, nel codice pubblico o in chat. Verificare sul proprio account Stripe autorizzazioni e metodi di pagamento.
3. Aggiungere `VINILAZO_CHECKOUT_ENABLED` con valore `true` solo quando pronti al collaudo live. Non condividere credenziali in chat.
4. Dalla cartella del progetto distribuire con `netlify deploy --prod --dir . --functions netlify/functions` usando Netlify CLI ufficiale. Effettuare l'accesso Netlify direttamente sul proprio dispositivo quando richiesto.
5. Verificare che `/.netlify/functions/create-checkout` risponda `{ "ready": true }`. Se la funzione non è pronta, il sito mantiene il singolo e nasconde la coppia per evitare importi sbagliati.
6. Provare una selezione singola e una coppia, anche con due squadre diverse: Stripe deve mostrare esattamente 69 € e 124,20 €. Nella coppia ogni prodotto costa 62,10 € dopo lo sconto. Non completare pagamenti reali per una semplice prova di navigazione.

La funzione calcola gli importi sul server e ignora eventuali prezzi modificati dal browser. Registra riferimento e squadre nei metadati Stripe. Spedizione inclusa e nessuna maggiorazione fiscale automatica nel nuovo checkout: verificare regime fiscale, dati del venditore e documentazione prima dell'attivazione commerciale. Il precedente Payment Link singolo conserva le sue impostazioni fiscali Stripe.

Il ritorno al sito non marca l'ordine come pagato. Per spedire verificare il pagamento in Stripe: il riferimento ordine collega pagamento e modulo Netlify. La conferma automatica dell'ordine tramite webhook, le email cliente personalizzate e il tracking automatico restano da configurare separatamente. La ricevuta Stripe va abilitata nell'account.

Il sito attuale usa https://vinilazo.netlify.app come origine consentita. Se si cambia dominio, aggiornare SITE nella funzione prima del deploy.
