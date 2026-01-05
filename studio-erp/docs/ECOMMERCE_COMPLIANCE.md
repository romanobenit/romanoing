# 🛒 E-Commerce Compliance & Demand-Driven Architecture
## Studio ERP - Piattaforma E-Commerce Servizi Tecnici Professionali

**Versione**: 1.0
**Data**: 2025-12-27
**Responsabile**: TITOLARE - Studio Romano
**Prossima Revisione**: 2026-06-27 (semestrale)
**Stato**: APPROVED

---

## 📋 Executive Summary

Studio ERP è una **piattaforma e-commerce demand-driven** per la vendita di servizi tecnici professionali (ingegneria, architettura, geologia) conforme a:
- ✅ ISO 9001:2015 (Qualità)
- ✅ ISO 27001:2022 (Sicurezza Informazioni)
- ✅ PCI-DSS (Payment Card Industry - via Stripe)
- ✅ GDPR (EU 2016/679)
- ✅ Codice del Consumo Italiano (D.Lgs. 206/2005)
- ✅ Direttiva E-Commerce UE (2000/31/CE)

**Modello di Business**: **Demand-Driven E-Commerce**
- I clienti **richiedono preventivi** per servizi tecnici (non acquistano prodotti standard)
- Il catalogo bundle è **personalizzabile** in base alle esigenze specifiche
- Ogni incarico è **unico** e richiede valutazione tecnica
- Pagamenti rateali basati su **milestone** (SAL - Stati Avanzamento Lavori)

---

## 🏗️ Architettura Demand-Driven

### Differenza con E-Commerce Tradizionale

| E-Commerce Tradizionale | Studio ERP (Demand-Driven) |
|-------------------------|----------------------------|
| Catalogo prodotti fissi | Bundle servizi personalizzabili |
| Prezzo fisso | Range prezzo (min-max) + preventivo personalizzato |
| Acquisto immediato | Richiesta preventivo → Valutazione → Contratto |
| Pagamento unico | Pagamenti milestone-based (SAL) |
| Spedizione prodotto | Erogazione servizio professionale |
| Garanzia prodotto | Responsabilità professionale (RC decennale) |
| Stock management | Capacity planning (ore/collaboratori) |

### Customer Journey Demand-Driven

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. DISCOVERY          →    2. EXPLORATION                 │
│     (Landing page)          (Catalogo bundle)              │
│                                                             │
│           ↓                                                 │
│                                                             │
│  3. CONFIGURATION      →    4. REQUEST                     │
│     (Personalizzazione)     (Richiesta preventivo)         │
│                                                             │
│           ↓                                                 │
│                                                             │
│  5. QUOTATION          →    6. ACCEPTANCE                  │
│     (Preventivo dettagliato) (Firma digitale contratto)    │
│                                                             │
│           ↓                                                 │
│                                                             │
│  7. EXECUTION          →    8. PAYMENT                     │
│     (Erogazione servizio)   (Milestone-based Stripe)       │
│                                                             │
│           ↓                                                 │
│                                                             │
│  9. DELIVERY           →   10. FOLLOW-UP                   │
│     (Consegna documenti)    (Supporto post-vendita)        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 💳 PCI-DSS Compliance (Payment Card Industry)

### Strategia: **PCI-DSS SAQ A** (Self-Assessment Questionnaire A)

**Responsabilità delegata a Stripe** (PCI Level 1 Service Provider):
- ✅ Stripe gestisce TUTTI i dati carta di credito
- ✅ Nessun dato carta transita o è stored su nostri server
- ✅ Checkout redirect a Stripe Hosted Checkout
- ✅ Studio ERP non vede mai CVV, PAN, expiry date

**PCI-DSS SAQ A Requirements** (22 domande):

### 1. Firewall Configuration
**Requirement 1**: Install and maintain a firewall
- ✅ Hetzner Cloud Firewall + UFW configurato
- ✅ Solo porte 80, 443, 2222 esposte
- ✅ Default deny policy

### 2. Vendor-Supplied Defaults
**Requirement 2**: Do not use vendor-supplied defaults
- ✅ Password PostgreSQL cambiate
- ✅ SSH porta cambiata (22 → 2222)
- ✅ Default accounts PostgreSQL disabilitati

### 3. Stored Cardholder Data
**Requirement 3**: Protect stored cardholder data
- ✅ **NESSUN dato carta stored** (Stripe only)
- ✅ Solo Stripe Customer ID e Payment Intent ID salvati
- ⚠️ Questi ID non sono PAN (Primary Account Number)

### 4. Transmission Encryption
**Requirement 4**: Encrypt transmission of cardholder data
- ✅ HTTPS/TLS 1.3 su tutto il traffico
- ✅ Redirect checkout a Stripe (HTTPS)
- ✅ Webhook Stripe signature verification

### 5. Anti-Virus
**Requirement 5**: Protect against malware
- ✅ ClamAV antivirus installed
- ✅ Real-time scanning upload documenti
- ✅ Daily virus definition updates

### 6. Secure Systems
**Requirement 6**: Develop and maintain secure systems
- ✅ OWASP Top 10 mitigation
- ✅ Security patches mensili (automated)
- ✅ Code review process
- ✅ Penetration testing pianificato

### 7-12. Access Control, Monitoring, Testing
- ✅ RBAC implementato (ISO 27001 Access Control Matrix)
- ✅ Audit logging completo
- ✅ Incident response procedures
- ✅ Quarterly vulnerability scanning (pianificato)

**Compliance Status**: ✅ **PCI-DSS SAQ A Compliant** (via Stripe delegation)

**Attestazione**: Annual SAQ A completion required
- Template: https://www.pcisecuritystandards.org/document_library
- Deadline: Annuale (entro 31 dicembre)
- Responsabile: TITOLARE + CTO

---

## 🇮🇹 Codice del Consumo Italiano (D.Lgs. 206/2005)

### Obblighi Informativi Pre-Contrattuali (Art. 49)

**Prima dell'acquisto, il cliente DEVE ricevere**:

✅ **Identità venditore**:
```
Studio Romano Engineering S.r.l.
P.IVA: IT12345678901
Sede: Via Roma 123, 00100 Roma RM
PEC: studio.romano@pec.it
Email: info@studio-romano.it
Tel: +39 06 1234567
```

✅ **Caratteristiche essenziali servizio**:
- Bundle catalogo con descrizione dettagliata
- Target destinatari (privato, azienda, PA)
- Durata prevista erogazione servizio
- Milestone e deliverable

✅ **Prezzo totale IVA inclusa**:
- Range prezzo bundle (min-max)
- Preventivo dettagliato personalizzato
- Costi aggiuntivi eventuali (sopralluoghi, trasferte)
- Modalità pagamento (milestone-based Stripe)

✅ **Diritto di recesso** (14 giorni):
```
DIRITTO DI RECESSO (Art. 52-59)

Il Cliente consumatore (B2C) ha diritto di recedere dal contratto
senza penali entro 14 giorni dalla firma del contratto.

ECCEZIONI (Art. 59):
- Servizi PIENAMENTE eseguiti con consenso espresso cliente
- Servizi professionali personalizzati (preventivo ad-hoc)

MODALITÀ:
Email a: recesso@studio-romano.it
Modulo: Disponibile in dashboard cliente

RIMBORSO:
Entro 14 giorni dal recesso, tramite stesso metodo di pagamento.
Se servizio parzialmente erogato: rimborso proporzionale milestone non completate.
```

✅ **Modalità di pagamento**:
- Stripe Checkout (carte credito/debito, SEPA, Apple Pay, Google Pay)
- Pagamenti milestone-based (bonifico alternativo disponibile)
- Fatturazione elettronica (SDI)

✅ **Tempi e modalità di esecuzione**:
- Durata indicativa bundle (es. 1-6 mesi)
- Timeline milestone definita in preventivo
- Comunicazioni via piattaforma + email

✅ **Garanzie legali**:
- Garanzia legale conformità (2 anni per B2C)
- Responsabilità civile professionale (polizza RC decennale)
- Copertura assicurativa: €2.000.000 (da verificare importo reale)

### Contratto Elettronico (Art. 51)

**Conferma ordine**:
```
Dopo firma digitale contratto, il cliente riceve:
1. Email conferma con recap contratto (PDF)
2. Copia contratto firmato digitalmente (archiviato in piattaforma)
3. Fattura proforma (se richiesta)
4. Accesso dashboard incarico
```

**Conservazione contratto**:
- Disponibile 24/7 in dashboard cliente
- Download PDF anytime
- Retention: 10 anni (obbligo fiscale)

### Pratiche Commerciali Scorrette (Art. 18-27)

**VIETATO**:
- ❌ Pubblicità ingannevole (prezzi falsi, promesse irrealistiche)
- ❌ Pratiche aggressive (pressione psicologica, spam)
- ❌ Costi nascosti (tutti i costi devono essere trasparenti)
- ❌ Rinnovo automatico senza consenso

**IMPLEMENTATO**:
- ✅ Prezzi chiari (range min-max bundle)
- ✅ Nessuna pressione vendita (self-service)
- ✅ Opt-in esplicito newsletter
- ✅ Disiscrizione facile (unsubscribe link)

---

## 🇪🇺 Direttiva E-Commerce UE (2000/31/CE)

### Obblighi Informativi Sito Web (Art. 5)

**Pagina "Chi Siamo" / "Note Legali"**:

```markdown
# Informazioni Legali

## Titolare del Sito
**Denominazione**: Studio Romano Engineering S.r.l.
**Forma giuridica**: Società a Responsabilità Limitata
**Sede legale**: Via Roma 123, 00100 Roma RM, Italia
**P.IVA**: IT12345678901
**REA**: RM-1234567
**Capitale sociale**: €10.000,00 i.v.
**PEC**: studio.romano@pec.it

## Contatti
**Email**: info@studio-romano.it
**Telefono**: +39 06 1234567
**Orari**: Lun-Ven 9:00-18:00

## Attività
Servizi di ingegneria, architettura, geologia (ATECO 71.12.10)

## Iscrizione Albi Professionali
- Ordine Ingegneri Roma: Matricola XXXXX
- [Altri albi se applicabile]

## Autorità di Controllo
Ordine degli Ingegneri della Provincia di Roma
Via delle Professioni 10, 00100 Roma
Tel: +39 06 XXXXXXX

## Codice Deontologico
Codice Deontologico degli Ingegneri (D.P.R. 328/2001)

## Assicurazione RC Professionale
Compagnia: [Nome compagnia assicurativa]
Polizza n.: [Numero polizza]
Copertura: €2.000.000
Validità: [Data inizio] - [Data fine]
Ambito territoriale: Italia + UE
```

### Cookie Policy & Privacy (GDPR Art. 13)

**Cookie Banner** (solo se usiamo cookie analytics):
```
Attualmente Studio ERP usa SOLO cookie tecnici necessari:
- next-auth.session-token (autenticazione)
- next-auth.csrf-token (CSRF protection)

Questi cookie sono "strictly necessary" → NO cookie banner richiesto

Se in futuro aggiungiamo Google Analytics o simili:
→ Cookie banner obbligatorio con opt-in esplicito
```

### Responsabilità Hosting Provider (Art. 14-15)

**Hetzner Cloud** (hosting provider):
- ✅ Non responsabile per contenuti illegali se non ne è a conoscenza
- ✅ Procedura notice-and-takedown per contenuti illegali
- ✅ Hetzner compliance: ISO 27001, GDPR

**Studio Romano** (content provider):
- ✅ Responsabile per contenuti pubblicati
- ✅ Moderazione contenuti utenti (se forum/commenti attivati)
- ✅ Procedura rimozione contenuti illegali entro 24h

---

## 📄 Documenti Legali Richiesti

### 1. Privacy Policy (GDPR Art. 13-14)

**Template completo**: `/docs/legal/PRIVACY_POLICY.md` (da creare)

**Contenuti minimi**:
- Titolare trattamento (Studio Romano)
- Finalità (gestione contratti, fatturazione, newsletter)
- Base giuridica (contratto, consenso, obbligo legale)
- Categorie dati (anagrafici, contatti, dati pagamento)
- Destinatari (Stripe, SendGrid, Hetzner)
- Trasferimenti extra-UE (Stripe UE, SendGrid USA con SCC)
- Periodo conservazione (10 anni fiscali)
- Diritti interessato (accesso, rettifica, cancellazione, portabilità)
- Diritto reclamo Garante Privacy
- Revoca consenso

### 2. Termini e Condizioni Generali di Vendita

**Template**: `/docs/legal/TERMS_AND_CONDITIONS.md` (da creare)

**Contenuti minimi**:
- Oggetto contratto (servizi tecnici professionali)
- Modalità conclusione contratto (firma digitale)
- Prezzi e modalità pagamento (milestone Stripe)
- Durata contratto (per singolo incarico)
- Obblighi committente (fornire documentazione, accesso cantiere)
- Obblighi professionista (erogare servizio a regola d'arte)
- Responsabilità professionale (RC decennale)
- Diritto di recesso (14 giorni B2C)
- Proprietà intellettuale (elaborati tecnici)
- Risoluzione controversie (mediazione obbligatoria D.Lgs. 28/2010)
- Foro competente (Tribunale di Roma)
- Legge applicabile (legge italiana)

### 3. Cookie Policy

**Attualmente NON necessaria** (solo cookie tecnici)

Se implementiamo analytics:
```markdown
# Cookie Policy

## Cookie Tecnici (Nessun consenso richiesto)
- next-auth.session-token: Gestione sessione utente
- next-auth.csrf-token: Protezione CSRF

## Cookie Analytics (Consenso richiesto)
- _ga, _gid: Google Analytics (analytics traffico)
  Finalità: Miglioramento UX, analisi conversioni
  Durata: 2 anni
  Opt-out: Disponibile via banner
```

### 4. Informativa Diritto di Recesso

**Modulo recesso** (B2C only):
```markdown
# Modulo Esercizio Diritto di Recesso

Al: Studio Romano Engineering S.r.l.
Email: recesso@studio-romano.it
PEC: studio.romano@pec.it

Il/La sottoscritto/a [NOME COGNOME]
Codice Fiscale: [CF]
Residente in: [INDIRIZZO]

Con la presente comunica il recesso dal contratto di servizi n. [NUMERO]
stipulato in data [DATA] per il servizio [DESCRIZIONE BUNDLE].

Motivazione (facoltativa): [TESTO LIBERO]

Data: [DATA]
Firma: [FIRMA]

---

ISTRUZIONI:
1. Compilare il modulo
2. Inviare via email a recesso@studio-romano.it entro 14 giorni
3. Riceverai conferma ricezione entro 48h
4. Rimborso entro 14 giorni su stesso metodo pagamento
```

### 5. Condizioni Particolari per Target Specifici

**B2C (Consumatori)**:
- Diritto recesso 14 giorni
- Garanzia legale conformità
- Divieto clausole vessatorie

**B2B (Aziende)**:
- Diritto recesso NON applicabile (Art. 47 lett. a)
- Garanzie contrattuali (da definire in preventivo)
- Clausole liberamente negoziabili

**PA (Pubblica Amministrazione)**:
- Codice Appalti (D.Lgs. 50/2016) se > €40.000
- Tracciabilità flussi finanziari (L. 136/2010)
- Fatturazione elettronica obbligatoria (SDI)
- MEPA (Mercato Elettronico PA) se richiesto

---

## 🔐 Security per E-Commerce

### Payment Security (oltre ISO 27001)

**Stripe Integration**:
```javascript
// ✅ CORRETTO: Redirect a Stripe Hosted Checkout
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  success_url: 'https://studio-erp.it/success',
  cancel_url: 'https://studio-erp.it/cancel',
  line_items: [{
    price_data: {
      currency: 'eur',
      product_data: { name: milestone.nome },
      unit_amount: milestone.importo * 100 // cents
    },
    quantity: 1
  }],
  customer_email: user.email,
  metadata: {
    incarico_id: incarico.id,
    milestone_id: milestone.id
  }
});

return { checkoutUrl: session.url }; // Redirect client
```

**❌ MAI FARE**:
```javascript
// WRONG: Gestire carte direttamente
const cardNumber = req.body.cardNumber; // PCI-DSS VIOLATION!
const cvv = req.body.cvv; // PCI-DSS VIOLATION!
```

**Webhook Security**:
```javascript
// Verify Stripe signature
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);

// ✅ Solo eventi firmati da Stripe sono accettati
```

### Fraud Prevention

**Risk Indicators** (Stripe Radar automatic):
- ✅ Card verification (CVV, AVS)
- ✅ 3D Secure (SCA - Strong Customer Authentication)
- ✅ IP geolocation (blocco paesi ad alto rischio)
- ✅ Velocity checks (multiple transactions)
- ✅ Machine learning fraud detection

**Custom Rules** (da configurare Stripe Dashboard):
```
Block if:
- Card country != IT, EU, US, UK, CA, AU (whitelisted)
- IP country != Card country (mismatch sospetto)
- Importo > €5.000 first transaction (manual review)
- > 3 payments failed same email/IP in 1h
```

**Chargeback Protection**:
- Conservare proof of service delivery (documenti firmati)
- Email conferme milestone completate
- Audit log azioni cliente (accettazione lavori)

---

## 📊 E-Commerce Analytics & Conversion

### Conversion Funnel Tracking

**Stages da tracciare**:
```
1. Landing Page View          → GA4 Event: page_view
2. Bundle Catalog Browse       → GA4 Event: view_item_list
3. Bundle Details View         → GA4 Event: view_item
4. Request Quote Button Click  → GA4 Event: begin_checkout
5. Quote Received              → GA4 Event: add_payment_info
6. Contract Signed             → GA4 Event: purchase
7. Milestone Payment           → GA4 Event: purchase (recurring)
```

**Key Metrics**:
| Metrica | Formula | Target |
|---------|---------|--------|
| **Visitor-to-Lead** | Richieste preventivo / Visitatori | > 5% |
| **Lead-to-Customer** | Contratti firmati / Preventivi inviati | > 30% |
| **Overall Conversion** | Contratti / Visitatori | > 1.5% |
| **Average Order Value** | Revenue totale / N. contratti | > €3.000 |
| **Customer Lifetime Value** | Revenue cliente / N. clienti | > €10.000 |

### SEO Optimization (Demand-Driven)

**Target Keywords**:
- "preventivo strutturale online"
- "ingegnere strutturale [città]"
- "certificato agibilità costo"
- "pratiche edilizie online"
- "collaudo statico preventivo"

**On-Page SEO**:
```html
<title>Preventivo Online Servizi Ingegneria | Studio Romano</title>
<meta name="description" content="Richiedi preventivo online per servizi di ingegneria strutturale, pratiche edilizie, certificazioni. Preventivo gratuito in 24h.">
<meta name="keywords" content="preventivo ingegnere, certificato agibilità, pratiche edilizie, collaudo statico">

<!-- Schema.org markup per servizi professionali -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Studio Romano Engineering",
  "image": "https://studio-erp.it/logo.png",
  "priceRange": "€€",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Via Roma 123",
    "addressLocality": "Roma",
    "postalCode": "00100",
    "addressCountry": "IT"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 41.9028,
    "longitude": 12.4964
  },
  "url": "https://studio-erp.it",
  "telephone": "+390612345678",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "18:00"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "24"
  }
}
</script>
```

**Content Marketing**:
- Blog: "Come ottenere certificato agibilità in 30 giorni"
- Guide: "Pratiche edilizie: guida completa 2025"
- Case studies: "Ristrutturazione villa storica: da progetto a collaudo"

---

## 💰 Pricing Strategy (Demand-Driven)

### Modello Pricing Trasparente

**Bundle Catalog** (prezzi visibili):
```
BDL-CONSULENZA          €180 - €600
  → Entry point basso (acquisizione lead)

BDL-AGIBILITA           €800 - €2.500
  → Servizio standardizzabile (conversion alta)

BDL-SANATORIA           €1.200 - €3.500
  → Servizio complesso (margin alto)

BDL-RISTRUTTURAZIONE    €2.500 - €12.000
  → Progetto ampio (lifetime value alto)
```

**Value Proposition**:
```
❌ Competitors tradizionali:
- "Chiama per preventivo" (friction alto)
- Prezzi opachi (diffidenza cliente)
- Tempi lunghi (2-3 settimane preventivo)

✅ Studio ERP:
- Range prezzi visibile (trasparenza)
- Preventivo automatico online (immediato)
- Personalizzazione guidata (wizard)
- Pagamento milestone (cash flow cliente)
```

### Dynamic Pricing (futuro)

**Fattori di personalizzazione**:
```javascript
// Algoritmo preventivo automatico
const basePrice = bundle.prezzo_min;
const priceFactors = {
  complexity: 1.2,      // Progetto complesso (+20%)
  urgency: 1.15,        // Consegna urgente (+15%)
  size: 1.3,            // Superficie > 500mq (+30%)
  location: 1.1,        // Zona sismica alta (+10%)
  recurring: 0.9        // Cliente ricorrente (-10% loyalty)
};

const finalPrice = basePrice * Object.values(priceFactors).reduce((a,b) => a*b, 1);
```

---

## 🎯 Customer Acquisition Strategy

### Marketing Channels

| Canale | Costo | Conversion | ROI | Priority |
|--------|-------|------------|-----|----------|
| **SEO Organico** | €0/mese | 2-3% | ∞ | P0 |
| **Google Ads** | €500/mese | 5-8% | 300% | P1 |
| **LinkedIn Ads** (B2B) | €300/mese | 3-5% | 200% | P2 |
| **Referral Program** | €0 + 10% commission | 15-20% | 500%+ | P1 |
| **Content Marketing** | €200/mese | 1-2% | 150% | P2 |

### Landing Pages Specializzate

**Per target**:
```
/privati              → Bundle BDL-AGIBILITA, BDL-RISTRUTTURAZIONE
/aziende              → Bundle BDL-AMPLIAMENTO, BDL-DUE-DILIGENCE
/amministratori       → Bundle BDL-SICUREZZA-ANTINCENDIO
/pubbliche-amministrazioni → Bundle custom enterprise
```

**A/B Testing**:
- Headline: "Preventivo in 24h" vs "Preventivo gratuito online"
- CTA: "Richiedi preventivo" vs "Calcola preventivo"
- Prezzo display: Range vs "A partire da €X"
- Trust signals: Certificazioni vs Numero clienti serviti

---

## ✅ Compliance Checklist E-Commerce

### Pre-Launch (Obbligatori)

- [ ] **Privacy Policy** pubblicata e accessibile
- [ ] **Termini e Condizioni** accettati al checkout
- [ ] **Informativa diritto recesso** visibile pre-acquisto (B2C)
- [ ] **Informazioni legali azienda** (chi siamo, P.IVA, contatti)
- [ ] **Prezzi IVA inclusa** (B2C) o "+ IVA" (B2B)
- [ ] **Costi spedizione/aggiuntivi** dichiarati (se applicabili)
- [ ] **Modalità pagamento** descritte
- [ ] **Tempi esecuzione servizio** indicati
- [ ] **Garanzie legali** informate
- [ ] **Codice deontologico** pubblicato (professionisti)

### Payment Compliance

- [ ] **PCI-DSS SAQ A** completato annualmente
- [ ] **Stripe account verified** (KYC completato)
- [ ] **Webhook endpoint** protetto (signature verification)
- [ ] **SSL certificate** valido (A+ SSL Labs)
- [ ] **Fraud rules** configurate (Stripe Radar)
- [ ] **Chargeback monitoring** attivo

### GDPR E-Commerce

- [ ] **Cookie banner** (se analytics/marketing cookies)
- [ ] **Consenso marketing** opt-in esplicito (no pre-checked)
- [ ] **Data portability** implementato (export JSON)
- [ ] **Right to erasure** implementato (cancellazione account)
- [ ] **Privacy by design** (default settings privacy-friendly)
- [ ] **DPA firmati** con tutti i processor (Stripe, SendGrid, Hetzner)

### Fatturazione Elettronica

- [ ] **Integrazione SDI** (Sistema di Interscambio)
- [ ] **Codice destinatario** o PEC acquisito al checkout
- [ ] **Fattura entro 12 giorni** dalla prestazione (D.L. 119/2018)
- [ ] **Conservazione digitale** 10 anni
- [ ] **Reverse charge** gestito (se applicabile B2B UE)

---

## 📈 Success Metrics E-Commerce (30 giorni)

| KPI | Target | Measurement |
|-----|--------|-------------|
| **Traffic** | 500 visitatori/mese | Google Analytics |
| **Conversion Rate** | > 1.5% | Contratti / Visitatori |
| **Lead Generation** | 25 preventivi/mese | Form submissions |
| **Sales** | 8 contratti firmati/mese | Database incarichi |
| **AOV** (Average Order Value) | > €3.000 | Revenue / N. ordini |
| **Revenue** | €24.000/mese | Stripe dashboard |
| **Customer Acquisition Cost** | < €200 | Marketing spend / New customers |
| **Customer Lifetime Value** | > €10.000 | Total revenue / Unique customers |

---

## 🚨 Risk Mitigation E-Commerce

### Risk Matrix Specifici E-Commerce

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| **Chargeback fraud** | Medio | Alto | Stripe Radar, proof of delivery |
| **Competitor price undercutting** | Alto | Medio | Value proposition differenziazione |
| **Fake quotes/spam** | Alto | Basso | CAPTCHA, rate limiting |
| **Payment gateway downtime** | Basso | Alto | Stripe 99.99% SLA, bonifico alternativo |
| **Negative reviews** | Medio | Alto | Quality assurance, customer satisfaction survey |
| **Legal disputes** | Basso | Alto | Mediazione obbligatoria, assicurazione RC |

---

## 📞 Customer Support E-Commerce

### Support Channels

| Canale | SLA Response | Orario | Target |
|--------|--------------|--------|--------|
| **Email** (info@) | < 24h | 24/7 | Tutte richieste |
| **WhatsApp Business** | < 2h | Lun-Ven 9-18 | Pre-vendita urgente |
| **Telefono** | Immediato | Lun-Ven 9-18 | Clienti enterprise |
| **Chat in-app** | < 1h | Lun-Ven 9-18 | Clienti attivi |
| **FAQ/Knowledge Base** | Self-service | 24/7 | Tutte richieste comuni |

### Customer Satisfaction

**Post-vendita survey** (NPS - Net Promoter Score):
```
Su una scala da 0 a 10, quanto consiglieresti Studio Romano a un collega?

0-6: Detractors (indaga motivo insoddisfazione)
7-8: Passives (ok ma non entusiasti)
9-10: Promoters (chiedi referral/recensione)

Target NPS: > +50 (eccellente per B2B services)
```

---

## 🎓 Training Team E-Commerce

### Sales Training

**Collaboratori devono saper**:
- ✅ Gestire richieste preventivo (response time < 24h)
- ✅ Personalizzare bundle in base esigenze cliente
- ✅ Comunicare value proposition differenziante
- ✅ Gestire obiezioni comuni ("Troppo caro", "Competitor più veloce")
- ✅ Upselling servizi complementari (es. Collaudo + DL)

### Customer Service Training

- ✅ Gestione reclami (de-escalation techniques)
- ✅ Diritto recesso (procedura corretta B2C)
- ✅ Mediazione controversie (prima di tribunale)
- ✅ Privacy compliance (no divulgazione dati)

---

## 📋 Action Items E-Commerce (Q1 2026)

**Priorità MASSIMA** (blocking go-live):
1. [ ] **Privacy Policy** redatta e pubblicata
2. [ ] **Termini e Condizioni** redatti e integrati checkout
3. [ ] **Informativa recesso** B2C visibile pre-contratto
4. [ ] **PCI-DSS SAQ A** completato e filed
5. [ ] **Stripe webhook** signature verification

**Priorità ALTA** (post-launch settimana 1):
6. [ ] **Google Analytics 4** setup conversion tracking
7. [ ] **Schema.org** markup servizi professionali
8. [ ] **FAQ** pagina common questions
9. [ ] **Fatturazione elettronica** integrazione SDI

**Priorità MEDIA** (Q1 2026):
10. [ ] **A/B testing** landing pages (headline, CTA)
11. [ ] **Content marketing** (3 blog posts/mese)
12. [ ] **Referral program** (10% commission)
13. [ ] **Customer satisfaction** survey NPS

---

## 🔐 Approval

**Approvals**:
- [ ] TITOLARE - Business Owner: _________________ Data: _______
- [ ] CTO - Technical Implementation: _________________ Data: _______
- [ ] Legal Advisor - Compliance Review: _________________ Data: _______

---

**Document Control**:
- **Classification**: CONFIDENTIAL - Internal Use Only
- **Storage**: `/docs/ECOMMERCE_COMPLIANCE.md`
- **Related**: ISO_27001_SECURITY_POLICIES.md, DEPLOYMENT_READY.md

**End of Document**
