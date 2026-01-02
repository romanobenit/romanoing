# 🚀 GUIDA DEPLOYMENT - Technical Advisory Ing. Domenico Romano

## 📋 Setup Infrastruttura Hetzner (COMPLETATO ✅)

```
✅ Server: RomanoServer CPX32 (Nuremberg)
✅ IP Pubblico: 116.203.109.249
✅ Floating IP: 116.203.10.59
✅ Object Storage: studio-erp-backups (250GB)
✅ Backup automatici: Attivi
✅ Firewall: Configurato
✅ SSH Key: Associata
```

---

## 🎯 ROADMAP DEPLOYMENT

### FASE 1: Preparazione Locale ✅ (GIÀ FATTO)
- [x] File `.env.production` creato
- [x] Credenziali Hetzner configurate
- [x] SSH Key verificata

### FASE 2: Connessione e Setup Server (PROSSIMO STEP)
- [ ] Test connessione SSH
- [ ] Aggiornamento sistema Ubuntu
- [ ] Installazione Node.js 20 LTS
- [ ] Installazione PostgreSQL 16
- [ ] Installazione PM2
- [ ] Installazione Nginx

### FASE 3: Deploy Applicazione
- [ ] Clone repository Git
- [ ] Setup database PostgreSQL
- [ ] Configurazione variabili ambiente
- [ ] Build Next.js
- [ ] Avvio con PM2

### FASE 4: Web Server & SSL
- [ ] Configurazione Nginx reverse proxy
- [ ] (Opzionale) Setup dominio
- [ ] (Opzionale) SSL/TLS con Let's Encrypt

### FASE 5: Backup e Monitoring
- [ ] Configurazione backup database su Object Storage
- [ ] Setup monitoring base

---

## 📝 AZIONI DA COMPLETARE PRIMA DI PROCEDERE

### 1. Genera NEXTAUTH_SECRET

Apri **Git Bash** su Windows (o PowerShell con OpenSSL installato):

```bash
openssl rand -base64 32
```

Copia il risultato e sostituiscilo in `.env.production` alla riga:
```
NEXTAUTH_SECRET="QUI_METTI_IL_RISULTATO"
```

### 2. Password Database PostgreSQL

Scegli una password sicura per il database PostgreSQL.

Sostituisci in `.env.production`:
```
DATABASE_URL="postgresql://studio_erp:TUA_PASSWORD_SICURA@localhost:5432/studio_erp?schema=public"
```

**Suggerimento:** Genera una password sicura con:
```bash
openssl rand -base64 24
```

### 3. Chiavi Stripe LIVE

Vai su [Stripe Dashboard](https://dashboard.stripe.com/):
1. Disattiva "Test mode" (switch in alto a destra)
2. Vai su **Developers → API Keys**
3. Copia:
   - **Publishable key** (pk_live_...)
   - **Secret key** (sk_live_...) - clicca "Reveal live key"
4. Vai su **Developers → Webhooks**
5. Crea webhook endpoint: `http://116.203.10.59/api/webhooks/stripe`
6. Copia il **Signing secret** (whsec_...)

Aggiorna `.env.production` con queste chiavi.

### 4. API Key SendGrid (Email)

Se hai già account SendGrid:
1. Vai su [SendGrid Dashboard](https://app.sendgrid.com/)
2. **Settings → API Keys → Create API Key**
3. Nome: `studio-erp-production`
4. Permission: **Full Access**
5. Copia la chiave e aggiornala in `.env.production`

**Se NON hai SendGrid:** Possiamo saltare questo step e configurarlo dopo.

---

## 🔌 FASE 2: CONNESSIONE SSH E SETUP SERVER

### Step 2.1: Test Connessione SSH

Apri **PowerShell** su Windows 10:

```powershell
# Vai nella cartella del progetto
cd C:\path\to\romanoing\studio-erp

# Testa connessione SSH
ssh -i C:\Users\Romano\.ssh\key.txt root@116.203.10.59
```

**Se vedi un messaggio tipo:**
```
The authenticity of host '116.203.10.59' can't be established.
Are you sure you want to continue connecting (yes/no)?
```

Digita: **yes** e premi INVIO.

**Se la connessione funziona** vedrai:
```
Welcome to Ubuntu 22.04.X LTS
root@RomanoServer:~#
```

✅ **Successo!** Sei connesso al server.

❌ **Se dà errore "Permission denied":**
Prova con:
```powershell
ssh -i C:\Users\Romano\.ssh\key.txt.pub root@116.203.10.59
```

Oppure verifica che la chiave sia stata aggiunta correttamente su Hetzner.

---

### Step 2.2: Aggiornamento Sistema

**Una volta connesso via SSH**, esegui questi comandi:

```bash
# Aggiorna lista pacchetti
apt update

# Upgrade sistema
apt upgrade -y

# Installa utility essenziali
apt install -y curl wget git build-essential ufw
```

Tempo stimato: 3-5 minuti.

---

### Step 2.3: Installazione Node.js 20 LTS

```bash
# Aggiungi repository Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Installa Node.js
apt install -y nodejs

# Verifica installazione
node -v   # Dovrebbe mostrare v20.x.x
npm -v    # Dovrebbe mostrare 10.x.x
```

✅ **Checkpoint:** `node -v` mostra versione 20.x.x

---

### Step 2.4: Installazione PostgreSQL 16

```bash
# Aggiungi repository PostgreSQL ufficiale
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

# Aggiungi chiave GPG
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -

# Aggiorna lista pacchetti
apt update

# Installa PostgreSQL 16
apt install -y postgresql-16 postgresql-contrib-16

# Verifica installazione
systemctl status postgresql
# Premi 'q' per uscire

# Verifica versione
psql --version  # Dovrebbe mostrare 16.x
```

✅ **Checkpoint:** PostgreSQL installato e running.

---

### Step 2.5: Configurazione Database

```bash
# Accedi come utente postgres
sudo -u postgres psql

# Dentro PostgreSQL, esegui questi comandi:
```

```sql
-- Crea database
CREATE DATABASE studio_erp;

-- Crea utente (SOSTITUISCI 'TUA_PASSWORD_SICURA' con quella scelta prima)
CREATE USER studio_erp WITH ENCRYPTED PASSWORD 'TUA_PASSWORD_SICURA';

-- Assegna permessi
GRANT ALL PRIVILEGES ON DATABASE studio_erp TO studio_erp;

-- Esci
\q
```

✅ **Checkpoint:** Database `studio_erp` creato.

---

### Step 2.6: Installazione PM2

```bash
# Installa PM2 globalmente
npm install -g pm2

# Verifica installazione
pm2 -v

# Setup PM2 per avvio automatico al boot
pm2 startup systemd
# Esegui il comando che PM2 ti suggerisce (copia-incolla l'output)
```

✅ **Checkpoint:** PM2 installato.

---

### Step 2.7: Installazione Nginx

```bash
# Installa Nginx
apt install -y nginx

# Avvia Nginx
systemctl start nginx

# Abilita avvio automatico
systemctl enable nginx

# Verifica status
systemctl status nginx
# Premi 'q' per uscire
```

**Test:** Apri browser su Windows e vai a `http://116.203.10.59`

Dovresti vedere la pagina di benvenuto di Nginx.

✅ **Checkpoint:** Nginx funzionante.

---

## 📦 FASE 3: DEPLOY APPLICAZIONE

### Step 3.1: Configurazione Git

Sul server, configura Git (se non già fatto):

```bash
# Configura nome utente Git
git config --global user.name "Domenico Romano"
git config --global user.email "info@studio-romano.it"
```

### Step 3.2: Clone Repository

```bash
# Vai nella home
cd /root

# Clone repository (SOSTITUISCI con URL del tuo repository)
git clone https://github.com/TUO_USERNAME/romanoing.git

# Vai nella cartella app
cd romanoing/studio-erp
```

**Se il repository è privato:**
```bash
# Ti chiederà username e password/token GitHub
# Usa un Personal Access Token come password
```

---

### Step 3.3: Configurazione Variabili Ambiente

Sul server, crea il file `.env.production`:

```bash
# Vai nella cartella app
cd /root/romanoing/studio-erp

# Crea file .env.production
nano .env.production
```

**Copia TUTTO il contenuto del file `.env.production` dal tuo computer locale** (quello che abbiamo creato prima) e incollalo nell'editor nano.

**Per salvare:**
1. Premi `CTRL + O` (save)
2. Premi `INVIO` (conferma nome file)
3. Premi `CTRL + X` (esci)

✅ **Checkpoint:** File `.env.production` creato sul server.

---

### Step 3.4: Installazione Dipendenze

```bash
# Assicurati di essere in /root/romanoing/studio-erp
cd /root/romanoing/studio-erp

# Installa dipendenze
npm install --production

# Questo installerà tutti i pacchetti necessari (può richiedere 2-3 minuti)
```

✅ **Checkpoint:** Dipendenze installate.

---

### Step 3.5: Setup Database con Prisma

```bash
# Genera Prisma Client
npx prisma generate

# Esegui migrazioni database
npx prisma migrate deploy

# (Opzionale) Seed database con dati iniziali
npx prisma db seed
```

✅ **Checkpoint:** Database popolato con schema.

---

### Step 3.6: Build Next.js

```bash
# Build applicazione per produzione
npm run build

# Questo crea la cartella .next/ ottimizzata
```

**Se il build fallisce:** Controlla errori e risolvi (possiamo debuggare insieme).

✅ **Checkpoint:** Build completato senza errori.

---

### Step 3.7: Avvio con PM2

```bash
# Avvia applicazione con PM2
pm2 start npm --name "studio-erp" -- start

# Verifica status
pm2 status

# Visualizza logs
pm2 logs studio-erp

# Salva configurazione PM2
pm2 save
```

L'app ora gira su `http://localhost:3000` sul server.

✅ **Checkpoint:** App in esecuzione con PM2.

---

## 🌐 FASE 4: CONFIGURAZIONE NGINX REVERSE PROXY

### Step 4.1: Configurazione Nginx

```bash
# Crea configurazione sito
nano /etc/nginx/sites-available/studio-erp
```

Incolla questa configurazione:

```nginx
server {
    listen 80;
    server_name 116.203.10.59;

    # Limite upload file (per configuratori)
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Salva: `CTRL+O`, `INVIO`, `CTRL+X`

---

### Step 4.2: Abilita Sito

```bash
# Crea link simbolico
ln -s /etc/nginx/sites-available/studio-erp /etc/nginx/sites-enabled/

# Rimuovi configurazione default
rm /etc/nginx/sites-enabled/default

# Testa configurazione
nginx -t

# Riavvia Nginx
systemctl reload nginx
```

✅ **Checkpoint:** Nginx configurato come reverse proxy.

---

### Step 4.3: Test Finale

Apri browser su Windows e vai a:

```
http://116.203.10.59
```

**Dovresti vedere la tua applicazione Next.js in funzione!** 🎉

---

## 🔒 FASE 4.5: SSL/TLS (OPZIONALE - Solo con Dominio)

**Se in futuro acquisti un dominio** (es. `studio-romano.it`), puoi configurare SSL gratuito:

```bash
# Installa Certbot
apt install -y certbot python3-certbot-nginx

# Ottieni certificato (SOSTITUISCI con tuo dominio)
certbot --nginx -d studio-romano.it -d www.studio-romano.it

# Rinnovo automatico già configurato
```

Per ora, con solo IP, **saltiamo questo step**.

---

## 💾 FASE 5: BACKUP AUTOMATICI

### Step 5.1: Script Backup Database

```bash
# Crea cartella per script
mkdir -p /root/scripts

# Crea script backup
nano /root/scripts/backup-db.sh
```

Incolla:

```bash
#!/bin/bash
# Backup Database PostgreSQL su Hetzner Object Storage

# Configurazione
DB_NAME="studio_erp"
DB_USER="studio_erp"
BACKUP_DIR="/tmp/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="studio_erp_${DATE}.sql.gz"

# Crea directory temporanea
mkdir -p $BACKUP_DIR

# Backup database
PGPASSWORD="TUA_PASSWORD_DB" pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/$FILENAME

# Upload su Hetzner Object Storage (usando s3cmd)
s3cmd put $BACKUP_DIR/$FILENAME s3://studio-erp-backups/db-backups/

# Pulizia file temporanei
rm $BACKUP_DIR/$FILENAME

echo "Backup completato: $FILENAME"
```

**SOSTITUISCI `TUA_PASSWORD_DB`** con la password del database.

Salva e rendi eseguibile:

```bash
chmod +x /root/scripts/backup-db.sh
```

---

### Step 5.2: Installazione s3cmd

```bash
# Installa s3cmd
apt install -y s3cmd

# Configura s3cmd
s3cmd --configure
```

**Durante la configurazione:**
- **Access Key:** `1XSJI8BN19JGVIQXSE2P`
- **Secret Key:** `wM0E6fsF3ZpkLXGgOiZAEPBqti45scdXkrclSc6r`
- **S3 Endpoint:** `nbg1.your-objectstorage.com`
- **DNS-style bucket:** No
- **Encryption password:** (lascia vuoto)
- **Use HTTPS:** Yes
- **Test access:** Yes

---

### Step 5.3: Cron Job per Backup Automatici

```bash
# Apri crontab
crontab -e

# Scegli editor (nano = 1)
```

Aggiungi questa riga alla fine:

```cron
# Backup database ogni giorno alle 3:00 AM
0 3 * * * /root/scripts/backup-db.sh >> /var/log/backup.log 2>&1
```

Salva e esci.

✅ **Checkpoint:** Backup automatici configurati.

---

## 📊 MONITORING BASE

### Step 5.4: Setup PM2 Monitoring

```bash
# Visualizza dashboard PM2
pm2 monit

# Oppure status
pm2 status

# Logs in tempo reale
pm2 logs studio-erp --lines 100
```

---

## ✅ DEPLOYMENT COMPLETATO!

### 🎯 Checklist Finale

- [x] Server configurato e aggiornato
- [x] Node.js 20 LTS installato
- [x] PostgreSQL 16 configurato
- [x] PM2 installato e configurato
- [x] Nginx reverse proxy attivo
- [x] Applicazione Next.js deployata
- [x] Database popolato con schema
- [x] Backup automatici configurati
- [x] Object Storage integrato

### 🌐 Accesso Applicazione

**URL:** http://116.203.10.59

---

## 🆘 COMANDI UTILI

### Gestione Applicazione

```bash
# Riavvia app
pm2 restart studio-erp

# Stop app
pm2 stop studio-erp

# Visualizza logs
pm2 logs studio-erp

# Visualizza errori
pm2 logs studio-erp --err
```

### Gestione Nginx

```bash
# Riavvia Nginx
systemctl restart nginx

# Verifica configurazione
nginx -t

# Visualizza logs
tail -f /var/log/nginx/error.log
```

### Gestione Database

```bash
# Accedi a PostgreSQL
sudo -u postgres psql studio_erp

# Backup manuale
pg_dump -U studio_erp studio_erp > backup.sql
```

### Update Applicazione (dopo modifiche)

```bash
cd /root/romanoing/studio-erp

# Pull ultime modifiche da Git
git pull origin claude/code-review-planning-2gHP2

# Reinstalla dipendenze (se package.json cambiato)
npm install

# Rebuild
npm run build

# Riavvia app
pm2 restart studio-erp
```

---

## 📞 PROSSIMI STEP (OPZIONALI)

1. **Dominio personalizzato** - Acquistare `studio-romano.it` e configurare DNS
2. **SSL/TLS** - Certificato Let's Encrypt gratuito (richiede dominio)
3. **Redis Cache** - Per performance migliori
4. **Uptime Monitoring** - UptimeRobot o servizio simile
5. **ClamAV Antivirus** - Per scansione upload files
6. **Firewall avanzato** - Configurazione UFW dettagliata

---

**Fine guida deployment.** 🚀
