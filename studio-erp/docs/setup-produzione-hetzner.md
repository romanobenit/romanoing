# Setup Produzione Hetzner VPS

Guida completa per il deployment della piattaforma su Hetzner VPS CX22.

## 📋 Prerequisiti

- Account Hetzner Cloud
- Dominio registrato (es. `studio-romano.it`)
- Conoscenze base Linux

---

## 1️⃣ Creazione VPS Hetzner

### Accedi a Hetzner Cloud Console
https://console.hetzner.cloud/

### Crea Nuovo Progetto
- Nome: `Studio-ERP-Production`

### Crea Server
1. **Location**: Falkenstein (Germania) o Nuremberg
2. **Image**: Ubuntu 24.04 LTS
3. **Type**: CX22 (2 vCPU, 4GB RAM) - **€4.51/mese**
4. **Networking**:
   - IPv4
   - IPv6 (opzionale)
5. **SSH Key**: Aggiungi la tua chiave pubblica
6. **Nome**: `studio-erp-prod`

### Annotati IP Pubblico
```
IP Server: 123.45.67.89 (esempio)
```

---

## 2️⃣ Configurazione DNS

### Configura Record DNS del tuo dominio

```
Tipo    Nome                    Valore              TTL
A       @                       123.45.67.89        3600
A       www                     123.45.67.89        3600
A       api                     123.45.67.89        3600
CNAME   cliente                 studio-romano.it    3600
```

---

## 3️⃣ Connessione e Setup Iniziale

### Connetti via SSH
```bash
ssh root@123.45.67.89
```

### Update Sistema
```bash
apt update && apt upgrade -y
```

### Installa Pacchetti Base
```bash
apt install -y \
  curl \
  wget \
  git \
  ufw \
  fail2ban \
  htop \
  vim \
  unzip
```

### Configura Firewall (UFW)
```bash
# Abilita SSH
ufw allow 22/tcp

# Abilita HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Abilita firewall
ufw enable

# Verifica
ufw status
```

### Crea Utente Non-Root
```bash
# Crea utente
adduser studio
usermod -aG sudo studio

# Copia SSH key
mkdir -p /home/studio/.ssh
cp /root/.ssh/authorized_keys /home/studio/.ssh/
chown -R studio:studio /home/studio/.ssh
chmod 700 /home/studio/.ssh
chmod 600 /home/studio/.ssh/authorized_keys

# Test connessione
# Da locale: ssh studio@123.45.67.89
```

---

## 4️⃣ Installazione Node.js

### Installa NVM (Node Version Manager)
```bash
# Come utente 'studio'
su - studio

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# Ricarica shell
source ~/.bashrc

# Installa Node.js LTS
nvm install 20
nvm use 20
nvm alias default 20

# Verifica
node --version  # v20.x.x
npm --version   # 10.x.x
```

---

## 5️⃣ Installazione PostgreSQL

### Installa PostgreSQL 16
```bash
sudo apt install -y postgresql postgresql-contrib

# Verifica
sudo systemctl status postgresql
```

### Configura Database
```bash
sudo -u postgres psql

-- In psql:
CREATE USER studio_user WITH PASSWORD 'PASSWORD_SUPER_SICURA_123!';
CREATE DATABASE studio_erp OWNER studio_user;
GRANT ALL PRIVILEGES ON DATABASE studio_erp TO studio_user;
\q
```

### Configura Accesso Locale
```bash
sudo vim /etc/postgresql/16/main/pg_hba.conf

# Aggiungi/modifica:
local   all             studio_user                             scram-sha-256
host    all             studio_user     127.0.0.1/32            scram-sha-256
```

Riavvia PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### Test Connessione
```bash
psql -U studio_user -d studio_erp -h 127.0.0.1
```

---

## 6️⃣ Installazione Nginx

### Installa Nginx
```bash
sudo apt install -y nginx

# Avvia e abilita
sudo systemctl start nginx
sudo systemctl enable nginx

# Verifica
curl http://localhost
# Dovresti vedere la pagina di default di Nginx
```

### Configura Virtual Host
```bash
sudo vim /etc/nginx/sites-available/studio-erp
```

Contenuto:
```nginx
server {
    listen 80;
    listen [::]:80;

    server_name studio-romano.it www.studio-romano.it;

    # Redirect a HTTPS (dopo setup SSL)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name studio-romano.it www.studio-romano.it;

    # SSL certificates (verranno configurati con Certbot)
    ssl_certificate /etc/letsencrypt/live/studio-romano.it/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/studio-romano.it/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy to Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support (per messaggistica real-time)
    location /ws {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Limiti upload file (10MB per documenti)
    client_max_body_size 10M;

    # Logs
    access_log /var/log/nginx/studio-erp-access.log;
    error_log /var/log/nginx/studio-erp-error.log;
}
```

Abilita sito:
```bash
sudo ln -s /etc/nginx/sites-available/studio-erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7️⃣ Installazione SSL (Let's Encrypt)

### Installa Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Ottieni Certificato SSL
```bash
sudo certbot --nginx -d studio-romano.it -d www.studio-romano.it

# Segui wizard:
# - Email: tuo-email@example.com
# - Accetta ToS: Y
# - Redirect HTTP→HTTPS: Y
```

### Auto-Rinnovo
```bash
# Test rinnovo
sudo certbot renew --dry-run

# Certbot aggiunge automaticamente cron job per rinnovo
```

---

## 8️⃣ Deploy Applicazione Next.js

### Clone Repository
```bash
cd /home/studio
git clone https://github.com/your-repo/studio-erp.git
cd studio-erp
```

### Installa Dipendenze
```bash
npm ci --production=false
```

### Configura Variabili d'Ambiente
```bash
cp .env.example .env
vim .env
```

Contenuto `.env`:
```env
# Database
DATABASE_URL="postgresql://studio_user:PASSWORD@127.0.0.1:5432/studio_erp?schema=public"

# NextAuth
NEXTAUTH_URL="https://studio-romano.it"
NEXTAUTH_SECRET="genera-con: openssl rand -base64 32"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# SendGrid
SENDGRID_API_KEY="SG...."
EMAIL_FROM="noreply@studio-romano.it"

# App
NEXT_PUBLIC_APP_URL="https://studio-romano.it"
NEXT_PUBLIC_APP_NAME="Studio Ing. Romano"
NODE_ENV="production"
```

### Setup Database
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### Build Applicazione
```bash
npm run build
```

### Test Manuale
```bash
npm run start
# Verifica http://localhost:3000
```

---

## 9️⃣ Setup PM2 (Process Manager)

### Installa PM2
```bash
npm install -g pm2
```

### Crea Ecosystem File
```bash
vim ecosystem.config.js
```

Contenuto:
```javascript
module.exports = {
  apps: [{
    name: 'studio-erp',
    script: 'npm',
    args: 'start',
    cwd: '/home/studio/studio-erp',
    instances: 1,
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/studio/logs/err.log',
    out_file: '/home/studio/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
```

### Avvia con PM2
```bash
mkdir -p /home/studio/logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Segui istruzioni per auto-start al boot
```

### Comandi Utili PM2
```bash
pm2 status          # Stato applicazioni
pm2 logs            # Visualizza logs
pm2 restart all     # Riavvia
pm2 reload all      # Reload senza downtime
pm2 monit           # Monitor real-time
```

---

## 🔟 Installazione Redis (Rate Limiting)

### Installa Redis
```bash
sudo apt install -y redis-server

# Configura
sudo vim /etc/redis/redis.conf

# Modifica:
supervised systemd
maxmemory 256mb
maxmemory-policy allkeys-lru

# Riavvia
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Test
redis-cli ping
# Output: PONG
```

---

## 1️⃣1️⃣ Installazione ClamAV (Antivirus)

### Installa ClamAV
```bash
sudo apt install -y clamav clamav-daemon

# Update virus definitions
sudo systemctl stop clamav-freshclam
sudo freshclam
sudo systemctl start clamav-freshclam

# Avvia daemon
sudo systemctl start clamav-daemon
sudo systemctl enable clamav-daemon

# Test
echo "test" | clamdscan -
```

---

## 1️⃣2️⃣ Backup Automatici

### Script Backup Database
```bash
vim /home/studio/backup-db.sh
```

Contenuto:
```bash
#!/bin/bash
BACKUP_DIR="/home/studio/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="studio_erp_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

# Dump database
PGPASSWORD="PASSWORD" pg_dump -U studio_user -h 127.0.0.1 studio_erp | gzip > $BACKUP_DIR/$FILENAME

# Mantieni solo ultimi 7 giorni
find $BACKUP_DIR -name "studio_erp_*.sql.gz" -mtime +7 -delete

echo "Backup completato: $FILENAME"
```

Rendi eseguibile:
```bash
chmod +x /home/studio/backup-db.sh
```

### Aggiungi Cron Job
```bash
crontab -e

# Backup giornaliero alle 2:00 AM
0 2 * * * /home/studio/backup-db.sh >> /home/studio/logs/backup.log 2>&1
```

---

## 1️⃣3️⃣ Monitoring e Logs

### Installa Logrotate per Nginx
```bash
sudo vim /etc/logrotate.d/nginx

# Contenuto già presente, verifica:
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    prerotate
        if [ -d /etc/logrotate.d/httpd-prerotate ]; then \
            run-parts /etc/logrotate.d/httpd-prerotate; \
        fi
    endscript
    postrotate
        invoke-rc.d nginx rotate >/dev/null 2>&1
    endscript
}
```

### Monitoring Server
```bash
# Installa htop
sudo apt install -y htop

# Monitor in tempo reale
htop

# Spazio disco
df -h

# Memoria
free -h

# Processi Node.js
ps aux | grep node
```

---

## 1️⃣4️⃣ Sicurezza Aggiuntiva

### Fail2Ban (Protezione SSH)
```bash
sudo apt install -y fail2ban

sudo vim /etc/fail2ban/jail.local
```

Contenuto:
```ini
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = 22
```

Riavvia:
```bash
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban
```

### Disabilita Root SSH
```bash
sudo vim /etc/ssh/sshd_config

# Modifica:
PermitRootLogin no
PasswordAuthentication no

# Riavvia SSH
sudo systemctl restart sshd
```

---

## 1️⃣5️⃣ Deployment Workflow

### Deploy Nuova Versione
```bash
# SSH nel server
ssh studio@123.45.67.89

cd /home/studio/studio-erp

# Pull ultima versione
git pull origin main

# Installa nuove dipendenze
npm ci --production=false

# Esegui migrations
npm run db:migrate

# Build
npm run build

# Reload PM2 (zero-downtime)
pm2 reload all

# Verifica logs
pm2 logs --lines 100
```

### Rollback
```bash
# Torna a commit precedente
git reset --hard HEAD~1

# Rebuild e reload
npm run build
pm2 reload all
```

---

## 📊 Checklist Post-Deployment

- [ ] Database creato e migrato
- [ ] Applicazione Next.js buildà e running
- [ ] Nginx configurato con SSL
- [ ] DNS punta al server
- [ ] HTTPS funzionante (https://studio-romano.it)
- [ ] Firewall configurato
- [ ] PM2 auto-start abilitato
- [ ] Backup automatici configurati
- [ ] Fail2Ban attivo
- [ ] Redis funzionante
- [ ] ClamAV attivo
- [ ] Logs rotazione configurata
- [ ] Stripe webhook configurato
- [ ] SendGrid configurato e testato

---

## 🆘 Troubleshooting

### Applicazione non raggiungibile
```bash
# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check Next.js
pm2 status
pm2 logs

# Check firewall
sudo ufw status

# Check DNS
nslookup studio-romano.it
```

### 502 Bad Gateway
```bash
# Verifica Next.js running
pm2 status

# Verifica porta 3000
sudo netstat -tulpn | grep 3000

# Riavvia
pm2 restart all
```

### Database connection error
```bash
# Verifica PostgreSQL
sudo systemctl status postgresql

# Test connessione
psql -U studio_user -d studio_erp -h 127.0.0.1
```

---

## 💰 Costi Mensili Stimati

| Servizio | Costo |
|----------|-------|
| Hetzner VPS CX22 | €4.51 |
| Hetzner Object Storage (250GB) | €5.00 |
| Dominio (.it) | €1-2 |
| SendGrid (Free tier 100 email/day) | €0 |
| **TOTALE** | **~€11/mese** |

---

## 📚 Risorse

- [Hetzner Cloud Docs](https://docs.hetzner.com/cloud/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Let's Encrypt](https://letsencrypt.org/)
