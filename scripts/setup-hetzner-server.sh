#!/bin/bash

# =============================================================================
# Setup Script per Server Hetzner - Studio Ing. Romano ERP Platform
# =============================================================================
# Questo script automatizza la configurazione completa del server Hetzner
# per l'hosting della piattaforma ERP + eCommerce
#
# Uso: bash setup-hetzner-server.sh [dominio]
# Esempio: bash setup-hetzner-server.sh app.studioromano.it
# =============================================================================

set -euo pipefail  # Fallisce immediatamente se c'è un errore

# Configurazione
DOMAIN=${1:-""}
APP_USER="studio"
APP_PATH="/var/www/studio-erp"
DB_NAME="studio_erp"
DB_USER="studio_user"
DB_PASSWORD=$(openssl rand -base64 32)
NODE_VERSION="18"

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzioni di utilità
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verifica se lo script è eseguito come root
if [[ $EUID -eq 0 ]]; then
   log_error "Questo script non deve essere eseguito come root per sicurezza."
   log_info "Eseguilo come utente normale con sudo quando necessario."
   exit 1
fi

# Banner
echo "======================================================================="
echo "🚀 Setup Server Hetzner - Studio Ing. Romano ERP Platform"
echo "======================================================================="

if [[ -n "$DOMAIN" ]]; then
    log_info "Configurando per dominio: $DOMAIN"
else
    log_warning "Nessun dominio specificato. Configurazione solo locale."
fi

# 1. Aggiornamento sistema
log_info "Aggiornamento sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Installazione pacchetti base
log_info "Installazione pacchetti essenziali..."
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    htop \
    tree

# 3. Installazione Node.js
log_info "Installazione Node.js ${NODE_VERSION}..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
sudo apt install -y nodejs

# Verifica installazione Node.js
node_version=$(node --version)
npm_version=$(npm --version)
log_success "Node.js installato: $node_version"
log_success "npm installato: $npm_version"

# 4. Installazione PM2
log_info "Installazione PM2..."
sudo npm install -g pm2

# 5. Installazione PostgreSQL
log_info "Installazione PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Configurazione database
log_info "Configurazione database PostgreSQL..."
sudo -u postgres psql << EOF
CREATE DATABASE ${DB_NAME};
CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
ALTER USER ${DB_USER} CREATEDB;
\q
EOF

log_success "Database configurato: ${DB_NAME}"
log_success "Utente database: ${DB_USER}"
echo "Password database: ${DB_PASSWORD}" | sudo tee /home/studio/db_credentials.txt
sudo chown studio:studio /home/studio/db_credentials.txt
sudo chmod 600 /home/studio/db_credentials.txt

# 6. Installazione Redis
log_info "Installazione Redis..."
sudo apt install -y redis-server

# Configurazione Redis per produzione
sudo sed -i 's/^supervised no/supervised systemd/' /etc/redis/redis.conf
sudo sed -i 's/^# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
sudo sed -i 's/^# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf

sudo systemctl enable redis-server
sudo systemctl restart redis-server

# 7. Installazione Nginx
log_info "Installazione Nginx..."
sudo apt install -y nginx

# 8. Installazione ClamAV (antivirus)
log_info "Installazione ClamAV..."
sudo apt install -y clamav clamav-daemon

# Aggiornamento database antivirus
log_info "Aggiornamento database ClamAV (può richiedere alcuni minuti)..."
sudo systemctl stop clamav-freshclam
sudo freshclam
sudo systemctl start clamav-freshclam
sudo systemctl enable clamav-freshclam clamav-daemon

# 9. Configurazione Firewall
log_info "Configurazione firewall UFW..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
echo "y" | sudo ufw enable

# 10. Configurazione Fail2Ban
log_info "Configurazione Fail2Ban..."
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Configurazione personalizzata Fail2Ban per SSH e Nginx
sudo tee /etc/fail2ban/jail.d/customjail.local << EOF
[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600

[nginx-noscript]
enabled = true
filter = nginx-noscript
logpath = /var/log/nginx/access.log
maxretry = 6
bantime = 3600
EOF

sudo systemctl enable fail2ban
sudo systemctl restart fail2ban

# 11. Creazione utente applicazione
log_info "Creazione utente applicazione..."
sudo useradd -m -s /bin/bash $APP_USER
sudo usermod -aG sudo $APP_USER

# 12. Creazione directory applicazione
log_info "Preparazione directory applicazione..."
sudo mkdir -p $APP_PATH
sudo chown $APP_USER:$APP_USER $APP_PATH

# 13. Configurazione Nginx
if [[ -n "$DOMAIN" ]]; then
    log_info "Configurazione Nginx per dominio $DOMAIN..."
    
    sudo tee /etc/nginx/sites-available/studio-erp << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    # SSL Configuration (certificati Let's Encrypt verranno configurati dopo)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL Security Headers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Rate Limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=auth:10m rate=1r/s;
    
    # Upload limite
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout configuration
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Rate limiting per API auth
    location /api/auth/ {
        limit_req zone=auth burst=5 nodelay;
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Rate limiting per API generali
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Logs
    access_log /var/log/nginx/studio-erp.access.log;
    error_log /var/log/nginx/studio-erp.error.log;
}
EOF

    # Abilita il sito
    sudo ln -sf /etc/nginx/sites-available/studio-erp /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
else
    log_info "Configurazione Nginx per sviluppo locale..."
    
    sudo tee /etc/nginx/sites-available/studio-erp << EOF
server {
    listen 80;
    server_name localhost _;
    
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    access_log /var/log/nginx/studio-erp.access.log;
    error_log /var/log/nginx/studio-erp.error.log;
}
EOF

    # Abilita il sito
    sudo ln -sf /etc/nginx/sites-available/studio-erp /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
fi

# Test configurazione Nginx
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

# 14. Installazione Certbot per SSL (se dominio specificato)
if [[ -n "$DOMAIN" ]]; then
    log_info "Installazione Certbot per SSL..."
    sudo snap install --classic certbot
    sudo ln -sf /snap/bin/certbot /usr/bin/certbot
    
    log_info "Per ottenere il certificato SSL, esegui:"
    log_info "sudo certbot --nginx -d $DOMAIN"
fi

# 15. Configurazione PM2 Ecosystem
log_info "Configurazione PM2 ecosystem..."
sudo -u $APP_USER tee $APP_PATH/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'studio-erp',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/studio-erp',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/studio-erp-error.log',
    out_file: '/var/log/pm2/studio-erp-out.log',
    log_file: '/var/log/pm2/studio-erp.log',
    time: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G'
  }]
}
EOF

# Crea directory log PM2
sudo mkdir -p /var/log/pm2
sudo chown $APP_USER:$APP_USER /var/log/pm2

# 16. Configurazione PM2 come servizio di sistema
log_info "Configurazione PM2 come servizio di sistema..."
sudo -u $APP_USER pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $APP_USER --hp /home/$APP_USER

# 17. Configurazione log rotation
log_info "Configurazione log rotation..."
sudo tee /etc/logrotate.d/studio-erp << EOF
/var/log/nginx/studio-erp.*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 \`cat /var/run/nginx.pid\`
        fi
    endscript
}

/var/log/pm2/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $APP_USER $APP_USER
    postrotate
        sudo -u $APP_USER pm2 reloadLogs
    endscript
}
EOF

# 18. Creazione script di backup
log_info "Creazione script di backup..."
sudo tee /usr/local/bin/backup-studio-erp.sh << EOF
#!/bin/bash
# Script di backup automatico per Studio ERP

BACKUP_DIR="/var/backups/studio-erp"
DATE=\$(date +%Y%m%d_%H%M%S)
DB_BACKUP_FILE="\${BACKUP_DIR}/db_backup_\${DATE}.sql"
APP_BACKUP_FILE="\${BACKUP_DIR}/app_backup_\${DATE}.tar.gz"

# Crea directory backup se non esiste
mkdir -p \$BACKUP_DIR

# Backup database
sudo -u postgres pg_dump $DB_NAME > \$DB_BACKUP_FILE
gzip \$DB_BACKUP_FILE

# Backup applicazione (esclusi node_modules e .next)
tar -czf \$APP_BACKUP_FILE -C $APP_PATH --exclude='node_modules' --exclude='.next' --exclude='uploads' .

# Mantieni solo gli ultimi 7 backup
find \$BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completato: \${DATE}"
EOF

sudo chmod +x /usr/local/bin/backup-studio-erp.sh

# Configura backup automatico giornaliero
(sudo crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-studio-erp.sh") | sudo crontab -

# 19. Configurazione monitoraggio di base
log_info "Configurazione monitoraggio sistema..."
sudo tee /usr/local/bin/check-studio-erp.sh << EOF
#!/bin/bash
# Script di monitoring per Studio ERP

# Verifica se l'app risponde
if curl -f -s http://localhost:3000/api/health >/dev/null; then
    echo "[OK] App is responding"
else
    echo "[ERROR] App is not responding"
    # Restart dell'app
    sudo -u $APP_USER pm2 restart studio-erp
fi

# Verifica database
if sudo -u postgres psql -d $DB_NAME -c "SELECT 1;" >/dev/null 2>&1; then
    echo "[OK] Database is accessible"
else
    echo "[ERROR] Database connection failed"
fi

# Verifica spazio disco
DISK_USAGE=\$(df / | tail -1 | awk '{print \$5}' | sed 's/%//')
if [ \$DISK_USAGE -gt 85 ]; then
    echo "[WARNING] Disk usage is \${DISK_USAGE}%"
fi
EOF

sudo chmod +x /usr/local/bin/check-studio-erp.sh

# Esegui check ogni 5 minuti
(sudo crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/check-studio-erp.sh >> /var/log/studio-erp-monitoring.log 2>&1") | sudo crontab -

# 20. Configurazione sicurezza SSH
log_info "Configurazione sicurezza SSH..."
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Configurazione SSH più sicura
sudo tee -a /etc/ssh/sshd_config << EOF

# Studio ERP Security Configuration
Protocol 2
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile %h/.ssh/authorized_keys
PermitEmptyPasswords no
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding no
PrintMotd no
ClientAliveInterval 300
ClientAliveCountMax 2
MaxAuthTries 3
EOF

sudo systemctl restart sshd

# 21. Informazioni finali
log_success "======================================================================="
log_success "🎉 Setup completato con successo!"
log_success "======================================================================="
echo ""
log_info "📊 Riepilogo configurazione:"
echo "  • App Path: $APP_PATH"
echo "  • App User: $APP_USER"
echo "  • Database: $DB_NAME"
echo "  • Database User: $DB_USER"
echo "  • Database Password: Salvata in /home/studio/db_credentials.txt"
if [[ -n "$DOMAIN" ]]; then
echo "  • Dominio: $DOMAIN"
fi
echo ""
log_info "🔄 Prossimi passi:"
echo "1. Clona il repository nell'app path:"
echo "   sudo -u $APP_USER git clone <repository-url> $APP_PATH"
echo ""
echo "2. Configura le variabili ambiente:"
echo "   sudo -u $APP_USER nano $APP_PATH/.env.local"
echo ""
if [[ -n "$DOMAIN" ]]; then
echo "3. Configura SSL:"
echo "   sudo certbot --nginx -d $DOMAIN"
echo ""
fi
echo "4. Configura i GitHub Secrets:"
echo "   HETZNER_HOST=$(curl -s ifconfig.me)"
echo "   HETZNER_USER=$APP_USER"
echo "   HETZNER_SSH_KEY=<chiave privata SSH>"
echo ""
echo "5. Fai il primo deploy con GitHub Actions!"
echo ""
log_success "🔒 Il server è ora configurato e sicuro per la produzione!"