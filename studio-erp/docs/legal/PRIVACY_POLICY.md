# 🔒 Informativa sulla Privacy
## Studio ERP - Piattaforma E-Commerce Servizi Tecnici

**Ultimo aggiornamento**: 27 dicembre 2025
**Versione**: 1.0
**Conforme a**: GDPR (UE 2016/679), D.Lgs. 196/2003 (Codice Privacy IT)

---

## 1. Introduzione

La presente Informativa sulla Privacy descrive come **Studio Romano Engineering S.r.l.** (di seguito "Studio Romano", "noi", "nostro") raccoglie, utilizza e protegge i Suoi dati personali quando utilizza la piattaforma **Studio ERP** disponibile su **studio-erp.studio-romano.it** (di seguito "Piattaforma").

La protezione dei Suoi dati personali è per noi di massima importanza. Trattiamo i Suoi dati in conformità con il Regolamento Generale sulla Protezione dei Dati (GDPR - UE 2016/679) e il Codice Privacy italiano (D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018).

**La invitiamo a leggere attentamente questa informativa prima di utilizzare la Piattaforma.**

---

## 2. Titolare del Trattamento e Responsabile della Protezione dei Dati (DPO)

### Titolare del Trattamento

**Denominazione**: Studio Romano Engineering S.r.l.
**Sede legale**: Via Roma 123, 00100 Roma RM, Italia
**P.IVA**: IT12345678901
**Email**: privacy@studio-romano.it
**PEC**: studio.romano@pec.it
**Telefono**: +39 06 1234567

### Responsabile della Protezione dei Dati (DPO)

**Nome**: [Nome DPO o "Funzione interna al Titolare"]
**Email**: dpo@studio-romano.it
**Contatto**: È possibile contattare il DPO per qualsiasi questione relativa al trattamento dei Suoi dati personali e all'esercizio dei Suoi diritti.

---

## 3. Dati Personali Raccolti

### 3.1 Dati forniti dall'utente

**Registrazione account**:
- Nome e Cognome
- Email (indirizzo di posta elettronica)
- Telefono (facoltativo ma raccomandato)
- Password (memorizzata criptata con bcrypt, mai in chiaro)
- Tipo utente (Privato, Azienda, Professionista, Pubblica Amministrazione)

**Dati aziendali** (se utente Azienda/Professionista/PA):
- Ragione sociale / Denominazione
- Partita IVA / Codice Fiscale
- Indirizzo sede legale
- Codice Destinatario SDI / PEC (per fatturazione elettronica)
- Nome referente / Legale rappresentante

**Richiesta preventivo e gestione incarichi**:
- Oggetto incarico (descrizione servizio richiesto)
- Ubicazione immobile / cantiere
- Superficie (mq) / Parametri tecnici
- Note e richieste specifiche
- Documenti allegati (planimetrie, foto, relazioni tecniche, etc.)

**Messaggi in piattaforma**:
- Contenuto messaggi scambiati con Studio Romano
- Timestamp comunicazioni

### 3.2 Dati di pagamento

**Pagamenti tramite Stripe**:
- **NON conserviamo** dati carte di credito/debito (numero PAN, CVV, scadenza)
- Conserviamo solo:
  - Stripe Customer ID (identificativo anonimo)
  - Stripe Payment Intent ID (riferimento transazione)
  - Importo e data pagamento
  - Metodo pagamento generico (es. "Visa ****1234", "SEPA Direct Debit")

**Fatturazione**:
- Dati fiscali (P.IVA, Codice Fiscale, Indirizzo)
- Codice Destinatario SDI / PEC
- Storico fatture emesse

### 3.3 Dati raccolti automaticamente

**Dati di navigazione** (log tecnici):
- Indirizzo IP (anonimizzato dopo 7 giorni)
- User agent (browser e sistema operativo)
- Pagine visitate e timestamp
- Durata sessione
- Referrer (sito da cui proviene)

**Cookie tecnici**:
- `next-auth.session-token`: Token sessione autenticazione
- `next-auth.csrf-token`: Protezione Cross-Site Request Forgery (CSRF)

**Audit log** (sicurezza e compliance ISO 27001):
- Azioni compiute in piattaforma (login, creazione incarico, upload documento, etc.)
- Timestamp azione
- Indirizzo IP
- User ID
- Esito operazione (successo/errore)

---

## 4. Finalità del Trattamento e Base Giuridica

Trattiamo i Suoi dati personali per le seguenti finalità:

### A) Gestione contrattuale (Base giuridica: Contratto - Art. 6.1.b GDPR)

**Finalità**:
- Registrazione account e autenticazione utente
- Gestione richieste preventivo
- Elaborazione contratti di servizi professionali
- Erogazione servizi tecnici (ingegneria, architettura, geologia)
- Comunicazioni relative agli incarichi in corso
- Gestione documenti tecnici e consegne
- Supporto clienti

**Conseguenze del rifiuto**: Senza questi dati non possiamo erogare i servizi richiesti.

### B) Adempimento obblighi di legge (Base giuridica: Obbligo legale - Art. 6.1.c GDPR)

**Finalità**:
- Emissione fatture elettroniche (D.L. 119/2018)
- Conservazione documenti fiscali e contabili (10 anni - D.P.R. 633/1972)
- Adempimenti tributari e previdenziali
- Conservazione audit log (7 anni - ISO 27001 compliance)
- Risposta a richieste autorità competenti

**Conseguenze del rifiuto**: Non è possibile rifiutare, trattandosi di obblighi di legge.

### C) Pagamenti e gestione transazioni (Base giuridica: Contratto - Art. 6.1.b GDPR)

**Finalità**:
- Elaborazione pagamenti tramite Stripe
- Gestione milestone e Stati Avanzamento Lavori (SAL)
- Emissione fatture e note di credito
- Gestione rimborsi e diritto di recesso

**Dati condivisi**: Stripe (Payment Service Provider - PCI-DSS Level 1)

**Conseguenze del rifiuto**: Senza autorizzare il trattamento dei dati di pagamento, non possiamo ricevere compensi per i servizi erogati.

### D) Marketing e newsletter (Base giuridica: Consenso - Art. 6.1.a GDPR)

**Finalità** (solo se ha espresso consenso):
- Invio newsletter informative su nuovi servizi
- Comunicazioni commerciali su offerte e promozioni
- Inviti a eventi e webinar

**Consenso**: Opt-in esplicito richiesto (checkbox non pre-selezionato)

**Revoca**: Può revocare il consenso in qualsiasi momento cliccando "Unsubscribe" nelle email o scrivendo a privacy@studio-romano.it.

**Conseguenze del rifiuto**: Nessuna conseguenza sui servizi erogati. Non riceverà comunicazioni commerciali.

### E) Miglioramento servizi e sicurezza (Base giuridica: Legittimo interesse - Art. 6.1.f GDPR)

**Finalità**:
- Analisi statistiche aggregate (miglioramento UX)
- Monitoraggio sicurezza e prevenzione frodi
- Rilevamento e risposta a incident di sicurezza
- Ottimizzazione performance piattaforma

**Bilanciamento interessi**: Il nostro legittimo interesse a migliorare i servizi e garantire la sicurezza prevale sul diritto alla privacy, essendo il trattamento limitato a dati aggregati/anonimizzati e log di sicurezza indispensabili per ISO 27001.

**Diritto di opposizione**: Può opporsi a questo trattamento scrivendo a privacy@studio-romano.it (valuteremo caso per caso).

---

## 5. Destinatari dei Dati (Responsabili del Trattamento)

I Suoi dati personali possono essere comunicati ai seguenti soggetti terzi, nominati Responsabili del Trattamento ai sensi dell'Art. 28 GDPR:

### Fornitori di servizi essenziali

| Destinatario | Servizio | Dati condivisi | Ubicazione | Garanzie |
|--------------|----------|----------------|------------|----------|
| **Stripe Payments Europe Ltd.** | Elaborazione pagamenti | Nome, email, importo, metodo pagamento | Irlanda (UE) | PCI-DSS Level 1, Clausole Contrattuali Standard |
| **Hetzner Online GmbH** | Hosting server e database | Tutti i dati in piattaforma | Germania (UE) | ISO 27001, GDPR-compliant, DPA firmato |
| **Sendgrid Inc. (Twilio)** | Invio email transazionali | Email, nome, contenuto email | USA | Standard Contractual Clauses (SCC), Privacy Shield |
| **Upstash Inc.** | Cache Redis (rate limiting) | Indirizzi IP, session tokens | EU (Frankfurt) | GDPR-compliant, DPA disponibile |
| **Sentry** | Error tracking e monitoring | Stack traces (sanitizzati), IP | UE | GDPR-compliant, DPA firmato |
| **OpenAI** | Assistenza AI (opzionale) | Template messaggi (NO dati personali) | USA | DPA firmato, data minimization |

### Ulteriori destinatari

- **Commercialista / Consulente fiscale**: Dati fiscali per adempimenti tributari
- **Avvocato**: Dati necessari in caso di controversie legali
- **Assicurazione RC Professionale**: Dati claim in caso di sinistri
- **Autorità competenti**: Su richiesta legale (Agenzia Entrate, Garante Privacy, Autorità Giudiziaria)

---

## 6. Trasferimenti Extra-UE

Alcuni fornitori di servizi hanno server ubicati fuori dall'Unione Europea:

### SendGrid (USA)

- **Garanzie**: Standard Contractual Clauses (SCC) approvate dalla Commissione UE
- **Privacy Shield**: Certificazione US-EU Privacy Shield (valutare aggiornamenti post-Schrems II)
- **Minimizzazione**: Condividiamo solo email destinatario e corpo messaggio (no dati sensibili)

### OpenAI (USA)

- **Garanzie**: Data Processing Addendum (DPA) firmato
- **Minimizzazione**: NON condividiamo dati personali clienti (solo template messaggi generici)
- **Uso**: Assistenza AI per draft comunicazioni (contenuto verificato da operatore umano)

**Diritti**: Può opporsi al trasferimento extra-UE scrivendo a privacy@studio-romano.it. Valuteremo alternative UE-based.

---

## 7. Periodo di Conservazione

I Suoi dati personali saranno conservati per i seguenti periodi:

| Categoria Dati | Periodo Conservazione | Motivazione |
|----------------|----------------------|-------------|
| **Account attivi** | Durata rapporto contrattuale + 10 anni | Obbligo fiscale (D.P.R. 633/1972) |
| **Account inattivi** (no incarichi) | 3 anni dall'ultimo accesso | Legittimo interesse (re-engagement) |
| **Documenti tecnici** | 10 anni dalla consegna | Obbligo professionale (NTC 2018, responsabilità decennale) |
| **Fatture e documenti fiscali** | 10 anni dall'emissione | Obbligo fiscale (Art. 2220 C.C.) |
| **Audit log sicurezza** | 7 anni | ISO 27001 compliance, obbligo legale anti-riciclaggio |
| **Dati pagamento Stripe** | Durata contratto + 10 anni | Gestione contestazioni, obbligo fiscale |
| **Consenso marketing** | Fino a revoca o 2 anni inattività | GDPR Best Practice |
| **Cookie tecnici** | Durata sessione (max 30 giorni) | Necessità tecnica autenticazione |
| **Log IP anonimizzati** | 7 giorni (poi anonimizzati permanentemente) | Sicurezza e fraud prevention |

**Cancellazione automatica**: Al termine dei periodi sopra indicati, i dati vengono cancellati in modo sicuro (overwrite digitale) o anonimizzati (non più associabili a persona fisica).

---

## 8. Diritti dell'Interessato

Ai sensi degli Artt. 15-22 GDPR, Lei ha i seguenti diritti:

### 8.1 Diritto di Accesso (Art. 15)

**Cosa può fare**: Ottenere conferma che stiamo trattando Suoi dati personali e riceverne copia.

**Come esercitarlo**: Email a privacy@studio-romano.it con oggetto "Richiesta Accesso Dati".

**Tempi**: Risposta entro 30 giorni dalla richiesta.

**Formato**: Export dati in formato JSON strutturato + PDF documenti.

### 8.2 Diritto di Rettifica (Art. 16)

**Cosa può fare**: Correggere dati inesatti o incompleti.

**Come esercitarlo**:
- **Self-service**: Dashboard profilo → Modifica dati anagrafici
- **Email**: privacy@studio-romano.it per dati non modificabili via UI

**Tempi**: Rettifica immediata (self-service) o entro 30 giorni (via email).

### 8.3 Diritto alla Cancellazione ("Diritto all'Oblio") (Art. 17)

**Cosa può fare**: Chiedere la cancellazione dei Suoi dati personali.

**Limitazioni**:
- ❌ Non possiamo cancellare dati necessari per obblighi legali (fatture, audit log fiscali)
- ❌ Non possiamo cancellare dati necessari per difesa in giudizio
- ✅ Possiamo cancellare dati non più necessari (es. account senza incarichi dopo 3 anni)

**Come esercitarlo**: Email a privacy@studio-romano.it con oggetto "Richiesta Cancellazione Account".

**Tempi**: Valutazione entro 15 giorni, cancellazione entro 30 giorni (se ammissibile).

### 8.4 Diritto di Limitazione (Art. 18)

**Cosa può fare**: Chiedere di limitare il trattamento (es. durante contestazione esattezza dati).

**Effetto**: Dati conservati ma non utilizzati (tranne per difesa legale).

**Come esercitarlo**: Email a privacy@studio-romano.it.

### 8.5 Diritto alla Portabilità (Art. 20)

**Cosa può fare**: Ricevere i dati in formato strutturato e trasmetterli a altro titolare.

**Formato**: JSON machine-readable + CSV per dati tabulari.

**Ambito**: Solo dati forniti attivamente da Lei e trattati con consenso o contratto.

**Come esercitarlo**: Dashboard → "Esporta dati personali" o email a privacy@studio-romano.it.

### 8.6 Diritto di Opposizione (Art. 21)

**Cosa può fare**: Opporsi al trattamento basato su legittimo interesse (es. marketing, profilazione).

**Effetto**: Cessazione immediata trattamento (salvo motivi legittimi cogenti).

**Come esercitarlo**: Email a privacy@studio-romano.it o click "Unsubscribe" in newsletter.

### 8.7 Diritto di Revocare il Consenso (Art. 7.3)

**Cosa può fare**: Revocare consenso marketing/newsletter in qualsiasi momento.

**Effetto**: Nessuna conseguenza su servizi contrattuali. Cessazione invio comunicazioni commerciali.

**Come esercitarlo**:
- Click "Unsubscribe" nelle email
- Dashboard → Impostazioni → Privacy → "Revoca consenso marketing"
- Email a privacy@studio-romano.it

### 8.8 Diritto di Reclamo all'Autorità Garante (Art. 77)

**Cosa può fare**: Presentare reclamo al Garante Privacy se ritiene violati i Suoi diritti.

**Autorità competente**:
**Garante per la Protezione dei Dati Personali**
Piazza Venezia 11, 00187 Roma RM
Email: garante@gpdp.it
PEC: protocollo@pec.gpdp.it
Telefono: +39 06 696771
Web: https://www.garanteprivacy.it

**Nota**: Prima di ricorrere al Garante, La invitiamo a contattarci per risolvere amichevolmente la questione.

---

## 9. Sicurezza dei Dati

Adottiamo misure tecniche e organizzative adeguate per proteggere i Suoi dati personali, conformemente a **ISO/IEC 27001:2022**:

### Misure tecniche

- **Encryption at rest**: Database e filesystem criptati (AES-256)
- **Encryption in transit**: HTTPS/TLS 1.3 su tutte le comunicazioni
- **Password hashing**: bcrypt (cost factor 10, salting automatico)
- **Firewall**: UFW + Hetzner Cloud Firewall (whitelist IP)
- **Intrusion detection**: Fail2ban (ban automatico tentativi accesso)
- **Antivirus**: ClamAV scan documenti upload
- **Backup encrypted**: Backup giornalieri criptati GPG (AES-256)
- **Audit logging**: Log completo azioni utenti (7 anni retention)

### Misure organizzative

- **Access control**: RBAC (Role-Based Access Control) con Row-Level Security
- **Least privilege**: Accesso minimo necessario per ruolo
- **2FA**: Two-Factor Authentication per account amministrativi
- **Security awareness**: Formazione annuale staff su GDPR e security
- **Incident response**: Procedure documentate per data breach (notifica 72h)
- **Penetration testing**: Test sicurezza annuali da terze parti
- **ISO 27001**: Sistema di gestione sicurezza informazioni certificabile

### Data Breach

In caso di violazione dati personali:
1. **Notifica al Garante Privacy** entro 72 ore (se alto rischio)
2. **Notifica agli interessati** senza ritardo (se alto rischio per diritti e libertà)
3. **Documentazione incident** completa (audit trail, impatto, remediation)

---

## 10. Cookie Policy

### Cookie Tecnici (Nessun Consenso Richiesto)

La piattaforma utilizza **SOLO cookie tecnici** strettamente necessari per il funzionamento:

| Cookie | Scopo | Durata | Tipo |
|--------|-------|--------|------|
| `next-auth.session-token` | Autenticazione utente, gestione sessione | 30 giorni | Tecnico necessario |
| `next-auth.csrf-token` | Protezione CSRF (Cross-Site Request Forgery) | Sessione | Tecnico sicurezza |

**Questi cookie sono essenziali** per l'erogazione del servizio e non richiedono consenso preventivo (Provv. Garante 229/2021).

### Cookie Analytics/Marketing (Attualmente NON utilizzati)

**Attualmente NON utilizziamo**:
- ❌ Google Analytics
- ❌ Facebook Pixel
- ❌ Cookie di profilazione
- ❌ Cookie di terze parti

**Se in futuro implementeremo analytics**:
- Cookie banner con opt-in esplicito sarà mostrato
- Possibilità di accettare/rifiutare granularmente
- IP address anonimizzato (Google Analytics anonymizeIP)

**Gestione cookie**: Può eliminare i cookie tramite impostazioni del Suo browser:
- Chrome: Settings → Privacy → Cookies
- Firefox: Options → Privacy → Cookies
- Safari: Preferences → Privacy → Cookies

---

## 11. Minori (Età Minima 18 Anni)

La Piattaforma è rivolta a **professionisti, aziende e maggiorenni**.

**Non raccogliamo intenzionalmente dati di minori di 18 anni**.

Se scopriamo di aver raccolto dati di minori senza consenso genitoriale, li cancelleremo immediatamente.

**Se è un genitore** e ritiene che Suo figlio ci abbia fornito dati personali, contatti privacy@studio-romano.it.

---

## 12. Link a Siti Terzi

La Piattaforma può contenere link a siti web di terze parti (es. Stripe checkout, social media).

**Non siamo responsabili** per le pratiche privacy di questi siti terzi.

**Raccomandiamo** di leggere le privacy policy di ogni sito visitato.

---

## 13. Modifiche alla Privacy Policy

Potremmo aggiornare questa Privacy Policy per:
- Conformità a nuove normative
- Miglioramenti funzionalità piattaforma
- Nuovi fornitori di servizi

**Notifica modifiche**:
- **Modifiche sostanziali**: Notifica via email 30 giorni prima dell'entrata in vigore
- **Modifiche minori**: Pubblicazione su questa pagina (verificare "Ultimo aggiornamento")

**Continuando a utilizzare** la Piattaforma dopo le modifiche, accetta la nuova Privacy Policy.

**Se non accetta** le modifiche, può chiudere l'account scrivendo a privacy@studio-romano.it.

---

## 14. Contatti

Per qualsiasi domanda o richiesta relativa al trattamento dei Suoi dati personali:

**Email**: privacy@studio-romano.it
**PEC**: studio.romano@pec.it
**Telefono**: +39 06 1234567
**Posta ordinaria**:
Studio Romano Engineering S.r.l.
Ufficio Privacy
Via Roma 123
00100 Roma RM
Italia

**Risponderemo entro 30 giorni** dalla ricezione della richiesta.

---

## 15. Dichiarazione di Consenso

**Per servizi contrattuali**: Il consenso non è richiesto (base giuridica: contratto ed obblighi legali).

**Per marketing/newsletter**: Al momento della registrazione, potrà scegliere se acconsentire a ricevere comunicazioni commerciali tramite checkbox esplicito (opt-in).

**Conservazione consenso**: Registriamo timestamp e IP del consenso per prova (audit log GDPR-compliant).

---

**Ultimo aggiornamento**: 27 dicembre 2025
**Versione**: 1.0

**Studio Romano Engineering S.r.l.**
P.IVA IT12345678901

---

**Document Control**:
- **Language**: Italiano (versione ufficiale)
- **English version**: Available upon request (translation for EU users)
- **Storage**: `/docs/legal/PRIVACY_POLICY.md` + Published on website footer
- **Review**: Annual (next review: 27 dicembre 2026)

**End of Document**
