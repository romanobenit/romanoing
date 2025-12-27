# Setup ClamAV Antivirus - Studio ERP

**Versione**: 1.0
**Data**: 2025-12-27
**Requisito**: Sprint 8 - Antivirus Integration

---

## 📋 Panoramica

ClamAV è un antivirus open-source utilizzato per la scansione dei file caricati dagli utenti.
Questo documento spiega come installare e configurare ClamAV per Studio ERP.

**Funzionalità**:
- Scansione automatica di ogni file caricato
- Rimozione automatica file infetti
- Audit log degli attacchi
- Modalità fallback (development vs production)

---

## 🖥️ Installazione

### Ubuntu / Debian

```bash
# Installa ClamAV e daemon
sudo apt-get update
sudo apt-get install -y clamav clamav-daemon

# Ferma il daemon per permettere l'aggiornamento DB
sudo systemctl stop clamav-freshclam
sudo systemctl stop clamav-daemon

# Aggiorna database virus (può richiedere alcuni minuti)
sudo freshclam

# Avvia servizi
sudo systemctl start clamav-daemon
sudo systemctl start clamav-freshclam

# Abilita avvio automatico
sudo systemctl enable clamav-daemon
sudo systemctl enable clamav-freshclam

# Verifica status
sudo systemctl status clamav-daemon
```

### macOS

```bash
# Installa con Homebrew
brew install clamav

# Crea directory log
sudo mkdir -p /var/log/clamav
sudo chown $(whoami) /var/log/clamav

# Copia configurazione esempio
sudo cp /usr/local/etc/clamav/freshclam.conf.sample /usr/local/etc/clamav/freshclam.conf
sudo cp /usr/local/etc/clamav/clamd.conf.sample /usr/local/etc/clamav/clamd.conf

# Rimuovi riga "Example" dai file di config (obbligatorio)
sudo sed -i '' '/^Example/d' /usr/local/etc/clamav/freshclam.conf
sudo sed -i '' '/^Example/d' /usr/local/etc/clamav/clamd.conf

# Aggiorna database virus
freshclam

# Avvia daemon
clamd

# (Opzionale) Crea servizio launchd per avvio automatico
# Vedi: https://formulae.brew.sh/formula/clamav
```

### Docker (Opzionale)

```yaml
# docker-compose.yml
version: '3.8'
services:
  clamav:
    image: clamav/clamav:latest
    ports:
      - "3310:3310"
    volumes:
      - clamav-data:/var/lib/clamav
    environment:
      - CLAMAV_NO_FRESHCLAM=false
    healthcheck:
      test: ["CMD", "clamdscan", "--ping"]
      interval: 60s
      timeout: 10s
      retries: 3

volumes:
  clamav-data:
```

---

## ⚙️ Configurazione

### 1. Variabili Ambiente (.env)

Aggiungi al file `.env`:

```bash
# ClamAV Configuration
CLAMAV_SOCKET=/var/run/clamav/clamd.ctl  # Linux
# CLAMAV_SOCKET=/usr/local/var/run/clamav/clamd.sock  # macOS
CLAMAV_HOST=localhost
CLAMAV_PORT=3310
CLAMAV_SCAN_LOG=/var/log/clamav/scan.log
# CLAMAV_CONFIG=/etc/clamav/clamd.conf  # Opzionale
# CLAMAV_DB=/var/lib/clamav  # Opzionale
```

### 2. Permessi File System

Assicurati che l'utente Node.js abbia accesso al socket ClamAV:

```bash
# Ubuntu/Debian - Aggiungi utente al gruppo clamav
sudo usermod -aG clamav $USER

# oppure cambia permessi socket (meno sicuro)
sudo chmod 666 /var/run/clamav/clamd.ctl
```

### 3. Verifica Installazione

```bash
# Test con file EICAR (file di test non dannoso rilevato da tutti gli antivirus)
echo 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > eicar.txt

# Scansiona con clamdscan (daemon - veloce)
clamdscan eicar.txt
# Output atteso: eicar.txt: Win.Test.EICAR_HDB-1 FOUND

# Scansiona con clamscan (CLI - lento)
clamscan eicar.txt

# Pulisci
rm eicar.txt
```

---

## 🧪 Test Integrazione

### 1. Health Check API

Crea endpoint per verificare status ClamAV:

```bash
# Test health check
curl http://localhost:3000/api/health/antivirus
```

Risposta attesa:
```json
{
  "available": true,
  "version": "ClamAV 1.0.0",
  "daemonActive": true,
  "mode": "daemon",
  "lastDbUpdate": "2025-12-27T10:00:00.000Z"
}
```

### 2. Test Upload File Pulito

```bash
# Crea file di test
echo "Questo è un file di test pulito" > test-clean.txt

# Upload via API
curl -X POST http://localhost:3000/api/documenti/upload \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -F "file=@test-clean.txt" \
  -F "incaricoId=1" \
  -F "categoria=Test" \
  -F "visibileCliente=false"

# Output atteso:
# {
#   "success": true,
#   "data": {
#     "id": 123,
#     "nomeFile": "test-clean.txt",
#     "antivirusScanned": true,
#     "antivirusStatus": "clean"
#   }
# }

rm test-clean.txt
```

### 3. Test Upload File Infetto (EICAR)

```bash
# Crea file EICAR
echo 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > eicar.txt

# Tentativo upload
curl -X POST http://localhost:3000/api/documenti/upload \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -F "file=@eicar.txt" \
  -F "incaricoId=1" \
  -F "categoria=Test" \
  -F "visibileCliente=false"

# Output atteso:
# {
#   "success": false,
#   "error": "Virus rilevato nel file caricato",
#   "details": "Win.Test.EICAR_HDB-1",
#   "virusDetected": true
# }

rm eicar.txt
```

### 4. Test Programmatico

```typescript
// scripts/test-clamav.ts
import { scanFile, testEICAR, getClamAVStatus } from '@/lib/antivirus'

async function main() {
  // 1. Verifica status
  const status = await getClamAVStatus()
  console.log('ClamAV Status:', status)

  if (!status.available) {
    console.error('❌ ClamAV non disponibile:', status.error)
    return
  }

  // 2. Test EICAR
  const eicarWorks = await testEICAR()
  console.log('EICAR test:', eicarWorks ? '✅ PASSED' : '❌ FAILED')

  // 3. Scansiona file esistente
  const result = await scanFile('./test-file.pdf')
  console.log('Scan result:', result)
}

main()
```

---

## 🚨 Troubleshooting

### Errore: "No such file or directory: /var/run/clamav/clamd.ctl"

**Causa**: Daemon ClamAV non in esecuzione o socket path errato.

**Soluzione**:
```bash
# Verifica daemon attivo
sudo systemctl status clamav-daemon

# Se inattivo, avvia
sudo systemctl start clamav-daemon

# Verifica path socket (Ubuntu)
ls -la /var/run/clamav/
# Output atteso: clamd.ctl (socket)

# macOS - path diverso
ls -la /usr/local/var/run/clamav/
```

### Errore: "Permission denied" su socket

**Causa**: Utente Node.js non ha permessi su socket ClamAV.

**Soluzione**:
```bash
# Aggiungi utente al gruppo clamav
sudo usermod -aG clamav node_user

# oppure usa TCP invece di socket Unix
# In .env: CLAMAV_HOST=localhost, CLAMAV_PORT=3310
```

### Errore: "Database not found"

**Causa**: Database virus non aggiornato.

**Soluzione**:
```bash
# Ferma daemon
sudo systemctl stop clamav-freshclam

# Aggiorna manualmente
sudo freshclam

# Riavvia
sudo systemctl start clamav-freshclam
sudo systemctl start clamav-daemon
```

### Warning: "ClamAV non disponibile, file NON scansionati"

**Causa**: ClamAV non installato/configurato in ambiente development.

**Impatto**:
- ✅ **Development**: File caricati senza scansione (solo warning)
- ❌ **Production**: Upload BLOCCATI se ClamAV non disponibile (fail-safe)

**Soluzione**:
- Development: Installa ClamAV o ignora warning (testing)
- Production: ClamAV è OBBLIGATORIO

### Scansioni Lente

**Causa**: Uso di `clamscan` CLI invece di daemon.

**Soluzione**:
```bash
# Verifica modalità attiva
curl http://localhost:3000/api/health/antivirus | jq '.mode'
# Output atteso: "daemon" (veloce)
# Se "cli" → installa/avvia daemon

# Benchmark
clamdscan file.pdf  # ~10-50ms
clamscan file.pdf   # ~2-5 secondi
```

---

## 📊 Monitoring & Maintenance

### 1. Log Scansioni

```bash
# Visualizza log scansioni ClamAV
tail -f /var/log/clamav/scan.log

# Cerca virus rilevati
grep FOUND /var/log/clamav/scan.log

# Statistiche
grep -c "FOUND" /var/log/clamav/scan.log  # Totale virus
grep -c "OK" /var/log/clamav/scan.log     # Totale file puliti
```

### 2. Update Automatico Database

Il servizio `clamav-freshclam` aggiorna automaticamente il database ogni ora.

Verifica:
```bash
# Status servizio update
sudo systemctl status clamav-freshclam

# Log update
tail -f /var/log/clamav/freshclam.log

# Ultima update
stat /var/lib/clamav/daily.cvd
```

### 3. Performance Monitoring

```sql
-- Statistiche upload con antivirus
SELECT
  antivirus_status,
  COUNT(*) as count,
  AVG(dimensione) as avg_size_bytes
FROM documenti
WHERE "createdAt" > NOW() - INTERVAL '7 days'
GROUP BY antivirus_status;
```

### 4. Alert Virus Rilevati

```sql
-- Query audit log per virus detection
SELECT
  al.created_at,
  al.utente_id,
  al.ip_address,
  al.dettagli->>'nomeFile' as file_name,
  al.dettagli->>'virus' as virus_name
FROM audit_log al
WHERE
  al.azione = 'UPLOAD'
  AND al.dettagli->>'status' = 'VIRUS_DETECTED'
ORDER BY al.created_at DESC
LIMIT 50;
```

---

## 🔒 Best Practices Security

1. **Production Mode**:
   - ClamAV OBBLIGATORIO (upload bloccati se non disponibile)
   - Database aggiornato automaticamente ogni ora
   - Log centralizzati per audit

2. **Fail-Safe Strategy**:
   - Scan fallito → Upload RIFIUTATO (non permesso passthrough)
   - File infetto → Rimozione automatica + audit log
   - Timeout scan (60s) → Upload RIFIUTATO

3. **Defense in Depth**:
   - ✅ Validazione MIME type (prima linea)
   - ✅ Scansione ClamAV (seconda linea)
   - ✅ Rate limiting upload (prevenzione abuse)
   - ✅ Audit logging (forensics)

4. **Update Schedule**:
   - Database virus: Automatico ogni ora
   - ClamAV engine: Mensile con package manager
   - Monitoring: Verifica weekly che update funzioni

---

## 📚 Riferimenti

- **ClamAV Documentation**: https://docs.clamav.net/
- **EICAR Test File**: https://www.eicar.org/download-anti-malware-testfile/
- **clamscan npm**: https://github.com/kylefarris/clamscan
- **Roadmap Studio ERP**: `claude.md` - Sprint 1.4 (File Upload sicuri)

---

## ✅ Checklist Deployment

### Development
- [ ] ClamAV installato localmente
- [ ] Daemon in esecuzione
- [ ] Test EICAR passa
- [ ] Health check API funzionante
- [ ] Upload file pulito OK
- [ ] Upload file infetto BLOCCATO

### Staging
- [ ] ClamAV installato su VPS staging
- [ ] Daemon in esecuzione (systemd)
- [ ] Database auto-update attivo
- [ ] Log path configurati
- [ ] Permessi socket corretti
- [ ] Test E2E upload

### Production
- [ ] ClamAV installato su VPS production
- [ ] Daemon HA setup (supervisord/systemd)
- [ ] Database update ogni ora verificato
- [ ] Log rotation configurato
- [ ] Monitoring alert su virus detection
- [ ] Backup log configurato
- [ ] Documentazione ops aggiornata

---

**Prossimo Step**: Implementare endpoint `/api/health/antivirus` per monitoring
