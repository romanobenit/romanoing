# 📋 Studio ERP - Roadmap

**Ultimo aggiornamento**: 4 Gennaio 2025

---

## 🎯 Sprint Corrente (6-19 Gennaio 2025)

**Sprint Goal**: Stabilizzare piattaforma e migliorare UX configuratori

### In Corso
- [ ] Task esempio (Romano) - Descrizione breve
- [ ] Task esempio (Collaboratore) - Descrizione breve

### Review/Testing
- [ ] Task in review (in attesa approval)

---

## 📅 Prossimi (Backlog)

### Alta Priorità (P1)
- [ ] Dashboard clienti con grafici interattivi
- [ ] Sistema notifiche email milestone pagamenti
- [ ] Export PDF preventivi

### Media Priorità (P2)
- [ ] Miglioramenti mobile responsive
- [ ] Ottimizzazione performance caricamento
- [ ] Integrazione calendario Google per appuntamenti

### Bassa Priorità (P3)
- [ ] Aggiunta altre lingue (EN)
- [ ] Dark mode
- [ ] Advanced analytics dashboard

---

## ✅ Completati (Ultime 2 Settimane)

### Settimana 23-29 Dic
- [x] Deploy produzione server Hetzner ✅
- [x] Configurazione SSL/TLS Let's Encrypt ✅
- [x] Setup database PostgreSQL produzione ✅
- [x] Configurazione Nginx reverse proxy ✅

### Settimana 30 Dic - 5 Gen
- [x] Rimozione portale cliente incompleto ✅
- [x] Fix build errors (import Link) ✅
- [x] Configuratori sismica, antincendio, ampliamento live ✅
- [x] Pagine legal (Privacy, Terms, Garanzia) ✅
- [x] Setup workflow Git (production + develop) ✅

---

## 🐛 Bug da Fixare

### P0 - Critici (Produzione Rotta)
- Nessuno al momento 🎉

### P1 - Urgenti (Impatto Alto)
- [ ] Webhook Stripe timeout per ordini >€1000
- [ ] Mobile menu non si chiude dopo click link

### P2 - Importanti (Impatto Medio)
- [ ] Validazione form configuratore sismica permissiva
- [ ] Loading state mancante durante fetch API

### P3 - Minor (Impatto Basso)
- [ ] Typo in homepage "Technical Advisory"
- [ ] Footer link colori inconsistenti

---

## 🔧 Debito Tecnico

- [ ] Aggiungere test Jest per componenti critici
- [ ] Setup GitHub Actions CI/CD
- [ ] Refactoring duplicazione codice configuratori
- [ ] Documentazione API Swagger/OpenAPI
- [ ] Ottimizzazione query database (indici mancanti)
- [ ] Aggiornamento dipendenze obsolete

---

## 💡 Idee / Ricerca

- [ ] Spike: Integrazione AI per stima preventivi automatica
- [ ] Ricerca: Blockchain per certificati digitali immobiliari
- [ ] Valutazione: Passare da Stripe a soluzione multi-payment
- [ ] Studio: Progressive Web App (PWA) per mobile

---

## 📝 Note

### Convenzioni
- **Formato task**: `[x] Descrizione (Assegnato) - Note opzionali`
- **Priorità**: P0 (critico) > P1 (urgente) > P2 (importante) > P3 (minor)
- **Update**: Aggiornare TODO.md ad ogni modifica via commit

### Workflow
1. Scegli task da "Prossimi"
2. Sposta in "In Corso" con tuo nome
3. Crea feature branch
4. Lavora e fai PR
5. Dopo merge, sposta in "Completati"

### Deploy Schedule
- **Venerdì 16:00**: Deploy settimanale (se modifiche pronte)
- **Hotfix**: Qualsiasi momento per bug critici

### Comunicazione
- Gruppo WhatsApp/Slack per coordinamento
- GitHub PR per review codice
- Call settimanale venerdì (opzionale)

---

## 🎯 Obiettivi Q1 2025

- [ ] Piattaforma stabile 99.9% uptime
- [ ] 3 configuratori completi e testati (sismica, antincendio, ampliamento)
- [ ] Sistema pagamenti Stripe funzionante end-to-end
- [ ] Dashboard clienti operativa
- [ ] 50+ test automatici coverage >70%
- [ ] Documentazione completa API e workflow

---

**Aggiornato da**: [tuo nome]
**Data**: [data aggiornamento]
