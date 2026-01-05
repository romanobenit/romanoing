# 🔐 Setup Accesso Server Produzione - Collaboratore

Guida per configurare accesso SSH sicuro al server produzione romanoing.com.

---

## 🎯 Obiettivo

Dare al collaboratore accesso server per deployare autonomamente, mantenendo:
- ✅ Separazione utenti (audit trail ISO 27001)
- ✅ Permessi limitati (sudo solo comandi necessari)
- ✅ Tracciabilità operazioni (log per utente)
- ✅ Possibilità revoca accesso

---

## 📊 Configurazione Consigliata

```
Server: 116.203.109.249 (RomanoServer)

User root (Romano):
├─ Accesso completo
├─ Deploy script
└─ Configurazione sistema

User deploy (Collaboratore):
├─ Accesso limitato
├─ Può deployare (sudo /root/deploy-production.sh)
├─ Può vedere logs (pm2, nginx)
└─ NO accesso root diretto
```

---

## 🛠️ Setup (Esegui Come Root)

### Step 1: Crea User Deploy sul Server

```bash
# SSH come root
ssh -i ~/.ssh/key.txt root@116.203.109.249

# Crea user deploy
adduser deploy
# Inserisci password sicura (es. genera con: openssl rand -base64 24)
# Compila info richieste (opzionali)

# Aggiungi a gruppo sudo
usermod -aG sudo deploy

# Verifica
id deploy
# Output: uid=1001(deploy) gid=1001(deploy) groups=1001(deploy),27(sudo)
```

### Step 2: Configura Sudo Limitato

```bash
# Modifica sudoers
sudo visudo

# Aggiungi alla fine del file:
# ════════════════════════════════════════════
# User deploy - Limited sudo for deployment
deploy ALL=(ALL) NOPASSWD: /usr/bin/pm2
deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload nginx
deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl status nginx
deploy ALL=(ALL) NOPASSWD: /root/deploy-production.sh
deploy ALL=(ALL) NOPASSWD: /root/rollback-production.sh
# ════════════════════════════════════════════

# Salva: CTRL+O, ENTER, CTRL+X

# Test (da user deploy)
su - deploy
sudo pm2 status
# Deve funzionare senza chiedere password ✅
```

### Step 3: Permessi Directory Applicazione

```bash
# Come root

# Deploy user deve leggere codice e eseguire deploy
cd /root/romanoing/studio-erp

# Opzione A: Mantieni ownership root (più sicuro)
# deploy può solo eseguire script, non modificare codice
chown -R root:root /root/romanoing
chmod -R 755 /root/romanoing

# Opzione B: Directory condivisa (più flessibile)
# deploy può anche modificare codice
# groupadd developers
# usermod -aG developers deploy
# usermod -aG developers root
# chown -R root:developers /root/romanoing
# chmod -R 775 /root/romanoing

# Consiglio: Opzione A (più sicuro ISO)
```

### Step 4: Script Deploy Eseguibile da Deploy User

```bash
# Verifica permessi script
ls -la /root/deploy-production.sh /root/rollback-production.sh

# Devono essere:
# -rwxr-xr-x root root deploy-production.sh
# -rwxr-xr-x root root rollback-production.sh

# Se no:
chmod 755 /root/deploy-production.sh
chmod 755 /root/rollback-production.sh

# Test esecuzione come deploy
su - deploy
sudo /root/deploy-production.sh
# Deve partire (poi CTRL+C per interrompere) ✅
```

---

## 👤 Setup Lato Collaboratore

### Step 1: Genera SSH Key (Sul suo PC)

```bash
# Sul computer del collaboratore (Windows/Mac/Linux)

# Apri terminale/Git Bash

# Genera chiave ED25519 (più sicura)
ssh-keygen -t ed25519 -C "collaboratore@studio-romano.it" -f ~/.ssh/romanoing_deploy

# Quando chiede passphrase:
# Opzione A: Lascia vuota (comodo ma meno sicuro)
# Opzione B: Inserisci passphrase (più sicuro)

# Output:
# ~/.ssh/romanoing_deploy (chiave privata - SEGRETA!)
# ~/.ssh/romanoing_deploy.pub (chiave pubblica - condivisibile)

# Visualizza chiave pubblica
cat ~/.ssh/romanoing_deploy.pub
# Copia tutto l'output (ssh-ed25519 AAAA....... email)
```

### Step 2: Invia Chiave Pubblica a Romano

```
Collaboratore invia a Romano via WhatsApp/Email:

Contenuto file: ~/.ssh/romanoing_deploy.pub

Esempio:
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGq... collaboratore@studio-romano.it

⚠️ IMPORTANTE: Inviare SOLO chiave PUBBLICA (.pub)
   MAI inviare chiave PRIVATA (senza .pub)!
```

---

## 🔑 Romano: Autorizza Chiave Pubblica Collaboratore

### Sul Server (Come Root):

```bash
# SSH come root
ssh -i ~/.ssh/key.txt root@116.203.109.249

# Passa a user deploy
su - deploy

# Crea directory SSH
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Aggiungi chiave pubblica collaboratore
nano ~/.ssh/authorized_keys

# Incolla la chiave pubblica che ti ha inviato
# ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGq... collaboratore@studio-romano.it

# Salva: CTRL+O, ENTER, CTRL+X

# Imposta permessi corretti
chmod 600 ~/.ssh/authorized_keys

# Verifica
cat ~/.ssh/authorized_keys
# Deve mostrare la chiave

# Torna a root
exit
```

---

## ✅ Collaboratore: Test Connessione

### Sul PC Collaboratore:

```bash
# Test connessione SSH
ssh -i ~/.ssh/romanoing_deploy deploy@116.203.109.249

# Prima volta chiede conferma fingerprint:
# The authenticity of host '116.203.109.249'...
# Are you sure you want to continue connecting (yes/no)?
# Digita: yes

# Se tutto OK, vedrai:
# Welcome to Ubuntu...
# deploy@RomanoServer:~$

# ✅ CONNESSO! Sei sul server come user deploy

# Test deploy
sudo /root/deploy-production.sh
# Dovrebbe partire senza chiedere password

# CTRL+C per interrompere
# exit per uscire
```

### Configurazione SSH Client (Opzionale - Comodo):

```bash
# Sul PC collaboratore
nano ~/.ssh/config

# Aggiungi:
Host romanoing
    HostName 116.203.109.249
    User deploy
    IdentityFile ~/.ssh/romanoing_deploy
    ServerAliveInterval 60

# Salva: CTRL+O, ENTER, CTRL+X

# Ora puoi connetterti con:
ssh romanoing
# Invece di: ssh -i ~/.ssh/romanoing_deploy deploy@116.203.109.249
```

---

## 🚀 Workflow Deploy Collaboratore

### Scenario: Collaboratore Deploya Autonomamente

```bash
# 1. PR mergata su production (su GitHub)

# 2. Collaboratore connette a server
ssh romanoing
# (o: ssh -i ~/.ssh/romanoing_deploy deploy@116.203.109.249)

# 3. Esegue deploy
sudo /root/deploy-production.sh

# 4. Script esegue automaticamente:
#    - Backup database
#    - Pull codice da production
#    - npm install
#    - npm run build
#    - pm2 restart
#    - Verifica

# 5. Verifica manuale
curl -I https://romanoing.com
# HTTP/2 200 ✅

# 6. Monitor logs
sudo pm2 logs studio-erp --lines 50

# 7. Se tutto OK, exit
exit

# 8. Notifica team
# WhatsApp: "✅ Deploy v1.3 completato da Collaboratore"
```

---

## 🔥 Rollback Emergenza

```bash
# Se deploy causa problemi

# 1. Connetti server
ssh romanoing

# 2. Esegui rollback
sudo /root/rollback-production.sh

# 3. Script chiede commit hash precedente
# Vedi commit su GitHub o:
cd /root/romanoing/studio-erp
git log --oneline -10
# Copia hash commit funzionante (es. abc123def)

# 4. Inserisci hash quando richiesto
# Enter commit hash to rollback to: abc123def

# 5. Script automaticamente:
#    - Checkout commit precedente
#    - Rebuild
#    - Restart PM2

# 6. Verifica
curl -I https://romanoing.com

# 7. Notifica team
# "🔄 Rollback eseguito a commit abc123def"
```

---

## 📊 Comandi Utili Deploy User

### Monitor Applicazione:

```bash
# Stato PM2
sudo pm2 status

# Logs real-time
sudo pm2 logs studio-erp

# Logs ultimi 100 righe
sudo pm2 logs studio-erp --lines 100

# Solo errori
sudo pm2 logs studio-erp --err

# Monitor CPU/RAM
sudo pm2 monit
```

### Nginx:

```bash
# Stato Nginx
sudo systemctl status nginx

# Reload config (dopo modifica)
sudo systemctl reload nginx

# Restart (se reload non basta)
sudo systemctl restart nginx

# Test config
sudo nginx -t
```

### Repository:

```bash
# Stato Git (solo lettura)
cd /root/romanoing/studio-erp
git status
git log --oneline -10
git branch -a
```

### Sistema:

```bash
# Spazio disco
df -h

# Memoria RAM
free -h

# Processi
top
# (q per uscire)

# Uptime server
uptime
```

---

## 🚨 Limitazioni User Deploy

### ❌ CANNOT (per design):

- Modificare file codice direttamente su server
- Installare pacchetti sistema (apt install)
- Modificare configurazione Nginx (file /etc/nginx/*)
- Accedere a user root
- Leggere/modificare file .env.production
- Cancellare database
- Modificare firewall
- Creare nuovi user

### ✅ CAN:

- Eseguire deploy via script
- Rollback via script
- Vedere logs applicazione
- Monitorare PM2
- Reload/restart Nginx
- Leggere codice repository
- Eseguire comandi Git (read-only)

**Motivo**: Separazione duties ISO 27001 e sicurezza.

Se serve operazione non permessa → Chiedi a Romano (user root).

---

## 🔐 Sicurezza e Best Practices

### 🔒 Protezione Chiave Privata:

```bash
# Sul PC collaboratore

# Verifica permessi chiave privata
ls -la ~/.ssh/romanoing_deploy
# Deve essere: -rw------- (600)

# Se no:
chmod 600 ~/.ssh/romanoing_deploy

# ⚠️ MAI:
# - Committare chiave privata su Git
# - Inviarla via email/WhatsApp
# - Copiarla su USB/cloud non criptato
# - Condividerla con terzi
```

### 📝 Audit Trail:

```bash
# Ogni comando eseguito da user deploy è loggato

# Romano può vedere chi ha fatto cosa:
# Sul server come root:
sudo tail -f /var/log/auth.log
# Mostra login SSH e comandi sudo per user

# Log deploy:
sudo tail -f /root/deploy.log
# Mostra chi ha deployato e quando
```

### 🔄 Rotazione Chiavi (Consigliato Annuale):

```bash
# 1 volta all'anno, cambia chiave SSH

# Collaboratore genera nuova chiave
ssh-keygen -t ed25519 -C "collaboratore@studio-romano.it" -f ~/.ssh/romanoing_deploy_2026

# Invia nuova chiave pubblica a Romano

# Romano aggiunge nuova chiave (non sostituisce vecchia)
# Testa con nuova chiave

# Se funziona, rimuovi vecchia chiave
# Romano: rimuovi vecchia riga da ~/.ssh/authorized_keys

# Sicurezza: chiave compromessa ha vita limitata
```

---

## ❓ Troubleshooting

### "Permission denied (publickey)"

```bash
# Verifica chiave usata
ssh -i ~/.ssh/romanoing_deploy -v deploy@116.203.109.249
# Flag -v mostra debug

# Verifica:
1. Chiave pubblica copiata correttamente su server
2. Permessi ~/.ssh/authorized_keys = 600 su server
3. Permessi chiave privata = 600 su client
4. Path chiave corretto (-i flag)
```

### "sudo: a password is required"

```bash
# Se sudo chiede password:
1. Verifica sudoers configurato correttamente (Romano)
2. User deploy in gruppo sudo
3. NOPASSWD presente in sudoers per comando specifico
```

### "deploy-production.sh: Permission denied"

```bash
# Script non eseguibile
# Romano esegue su server:
chmod +x /root/deploy-production.sh
```

### "fatal: could not read Username for GitHub"

```bash
# Se git pull fallisce durante deploy:
# Romano verifica su server che git usa HTTPS o SSH key
cd /root/romanoing/studio-erp
git remote -v
# Deve mostrare URL corretto
```

---

## 📋 Checklist Setup Completo

### Romano (Server Setup):
- [ ] User deploy creato
- [ ] Sudoers configurato (NOPASSWD per deploy script)
- [ ] Permessi /root/romanoing corretti
- [ ] Script deploy/rollback eseguibili
- [ ] Chiave pubblica collaboratore aggiunta a ~/.ssh/authorized_keys
- [ ] Test sudo funzionante per deploy user
- [ ] Documentazione condivisa con collaboratore

### Collaboratore (Client Setup):
- [ ] SSH key generata (ED25519)
- [ ] Chiave pubblica inviata a Romano
- [ ] Test connessione SSH riuscito
- [ ] ~/.ssh/config configurato (opzionale)
- [ ] Test deploy script funzionante
- [ ] Letto questa guida completa
- [ ] Salvato comandi utili (bookmark)

---

## 🎯 Risultato Finale

```
PRIMA:
- Solo Romano può deployare
- Collo di bottiglia
- Se Romano assente → blocco deploy

DOPO:
- Entrambi possono deployare
- Backup reciproco
- Business continuity ✅
- Audit trail separato (ISO compliant) ✅
- Sicurezza mantenuta ✅
```

---

**Setup completato**: Collaboratore può deployare autonomamente mantenendo sicurezza e tracciabilità ISO 27001! 🚀
