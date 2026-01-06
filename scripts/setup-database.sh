#!/bin/bash

# =============================================================================
# Setup Database PostgreSQL per Studio Ing. Romano ERP
# =============================================================================
# Script per configurare il database PostgreSQL in produzione su Hetzner
# Include creazione database, utenti, backup automatici e ottimizzazioni
# =============================================================================

set -euo pipefail

# Configurazione
DB_NAME="studio_erp"
DB_USER="studio_user"
DB_PASSWORD=${DB_PASSWORD:-$(openssl rand -base64 32)}
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="/var/backups/postgresql"
APP_USER="studio"

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "======================================================================="
echo "🗃️  Setup Database PostgreSQL - Studio ERP"
echo "======================================================================="

# Verifica se PostgreSQL è installato
if ! command -v psql &> /dev/null; then
    log_error "PostgreSQL non è installato. Installalo prima di eseguire questo script."
    exit 1
fi

# 1. Configurazione PostgreSQL per produzione
log_info "Configurazione PostgreSQL per produzione..."

# Backup della configurazione originale
sudo cp /etc/postgresql/*/main/postgresql.conf /etc/postgresql/*/main/postgresql.conf.backup
sudo cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup

# Configurazione postgresql.conf per prestazioni
POSTGRES_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | grep -oP 'PostgreSQL \K[0-9]+')
POSTGRES_CONFIG="/etc/postgresql/${POSTGRES_VERSION}/main/postgresql.conf"

log_info "Configurazione prestazioni PostgreSQL ${POSTGRES_VERSION}..."

# Ottimizzazioni per server con 4GB RAM (adatta per CX22)
sudo tee -a $POSTGRES_CONFIG << EOF

# =============================================================================
# Studio ERP - Configurazione ottimizzata per produzione
# =============================================================================

# Memory Configuration (per server 4GB)
shared_buffers = 1GB                    # 25% della RAM
effective_cache_size = 3GB              # 75% della RAM
work_mem = 64MB                         # Per query complesse
maintenance_work_mem = 512MB            # Per VACUUM e CREATE INDEX

# Checkpoint Configuration
checkpoint_completion_target = 0.9
checkpoint_timeout = 15min
max_wal_size = 2GB
min_wal_size = 1GB

# Connection Configuration
max_connections = 200                   # Adeguato per Next.js
superuser_reserved_connections = 3

# Logging Configuration
logging_collector = on
log_destination = 'stderr'
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000      # Log query > 1 secondo
log_line_prefix = '%m [%p] %q%u@%d '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0

# Performance Monitoring
track_activities = on
track_counts = on
track_functions = all
track_io_timing = on

# Auto Vacuum Configuration
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 10min
autovacuum_vacuum_threshold = 50
autovacuum_analyze_threshold = 50

# Security Configuration
ssl = on
password_encryption = scram-sha-256

EOF

# 2. Configurazione accessi (pg_hba.conf)
log_info "Configurazione accessi database..."

PG_HBA="/etc/postgresql/${POSTGRES_VERSION}/main/pg_hba.conf"

# Backup e configurazione sicura
sudo cp $PG_HBA ${PG_HBA}.backup

# Configurazione più sicura per produzione
sudo tee $PG_HBA << EOF
# PostgreSQL Client Authentication Configuration File
# Studio ERP - Configurazione Produzione

# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" è per connessioni Unix domain socket
local   all             postgres                                peer
local   all             all                                     peer

# IPv4 local connections:
host    all             all             127.0.0.1/32           scram-sha-256
host    ${DB_NAME}      ${DB_USER}      127.0.0.1/32           scram-sha-256

# IPv6 local connections:
host    all             all             ::1/128                scram-sha-256

# Nega tutte le altre connessioni
# (questa deve essere l'ultima riga)
host    all             all             0.0.0.0/0               reject
EOF

# 3. Restart PostgreSQL per applicare le configurazioni
log_info "Riavvio PostgreSQL per applicare le configurazioni..."
sudo systemctl restart postgresql

# Attendi che PostgreSQL sia pronto
sleep 5

# 4. Creazione database e utente
log_info "Creazione database e utente..."

# Verifica se il database esiste già
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    log_warning "Database $DB_NAME esiste già"
else
    # Crea database
    sudo -u postgres createdb $DB_NAME
    log_success "Database $DB_NAME creato"
fi

# Verifica se l'utente esiste già
if sudo -u postgres psql -t -c "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
    log_warning "Utente $DB_USER esiste già"
    # Aggiorna la password
    sudo -u postgres psql -c "ALTER USER $DB_USER PASSWORD '$DB_PASSWORD';"
else
    # Crea utente
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    log_success "Utente $DB_USER creato"
fi

# Assegna permessi
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"  # Permesso per creare DB per test

# Configurazione schema permissions
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"

# 5. Creazione directory backup
log_info "Configurazione sistema di backup..."
sudo mkdir -p $BACKUP_DIR
sudo chown postgres:postgres $BACKUP_DIR
sudo chmod 750 $BACKUP_DIR

# 6. Script di backup automatico
sudo tee /usr/local/bin/backup-postgres.sh << EOF
#!/bin/bash
# Backup automatico database PostgreSQL - Studio ERP

BACKUP_DIR="$BACKUP_DIR"
DB_NAME="$DB_NAME"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="\${BACKUP_DIR}/\${DB_NAME}_backup_\${DATE}.sql"

# Backup completo
sudo -u postgres pg_dump \$DB_NAME > \$BACKUP_FILE

# Comprimi il backup
gzip \$BACKUP_FILE

# Mantieni solo gli ultimi 30 backup
find \$BACKUP_DIR -name "*.gz" -mtime +30 -delete

# Log del backup
echo "\$(date): Backup completato - \${BACKUP_FILE}.gz" >> /var/log/postgres-backup.log

# Verifica integrità del backup (opzionale)
if [ -f "\${BACKUP_FILE}.gz" ]; then
    echo "\$(date): Backup verificato - OK" >> /var/log/postgres-backup.log
else
    echo "\$(date): ERRORE - Backup non trovato!" >> /var/log/postgres-backup.log
    exit 1
fi
EOF

sudo chmod +x /usr/local/bin/backup-postgres.sh

# 7. Configurazione cron per backup automatico
log_info "Configurazione backup automatico giornaliero..."

# Backup giornaliero alle 2:30
(sudo crontab -l 2>/dev/null; echo "30 2 * * * /usr/local/bin/backup-postgres.sh") | sudo crontab -

# 8. Script di monitoraggio database
sudo tee /usr/local/bin/monitor-postgres.sh << EOF
#!/bin/bash
# Monitoraggio PostgreSQL - Studio ERP

DB_NAME="$DB_NAME"
DB_USER="$DB_USER"
LOG_FILE="/var/log/postgres-monitor.log"

# Funzione di log
log_message() {
    echo "\$(date '+%Y-%m-%d %H:%M:%S'): \$1" >> \$LOG_FILE
}

# Test connessione
if sudo -u postgres psql -d \$DB_NAME -c "SELECT 1;" >/dev/null 2>&1; then
    log_message "[OK] Database connection successful"
else
    log_message "[ERROR] Database connection failed"
    exit 1
fi

# Verifica spazio disco
DB_SIZE=\$(sudo -u postgres psql -d \$DB_NAME -t -c "SELECT pg_size_pretty(pg_database_size('\$DB_NAME'));" | xargs)
log_message "[INFO] Database size: \$DB_SIZE"

# Verifica connessioni attive
ACTIVE_CONN=\$(sudo -u postgres psql -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" | xargs)
log_message "[INFO] Active connections: \$ACTIVE_CONN"

# Verifica slow queries
SLOW_QUERIES=\$(sudo -u postgres psql -t -c "SELECT count(*) FROM pg_stat_activity WHERE query_start < now() - interval '10 minutes' AND state = 'active';" | xargs)
if [ \$SLOW_QUERIES -gt 0 ]; then
    log_message "[WARNING] \$SLOW_QUERIES slow queries detected"
fi

# Verifica spazio tablespace
TABLESPACE_USAGE=\$(df /var/lib/postgresql | tail -1 | awk '{print \$5}' | sed 's/%//')
if [ \$TABLESPACE_USAGE -gt 85 ]; then
    log_message "[WARNING] Tablespace usage is \${TABLESPACE_USAGE}%"
fi
EOF

sudo chmod +x /usr/local/bin/monitor-postgres.sh

# Monitor ogni 15 minuti
(sudo crontab -l 2>/dev/null; echo "*/15 * * * * /usr/local/bin/monitor-postgres.sh") | sudo crontab -

# 9. Script di restore database
sudo tee /usr/local/bin/restore-postgres.sh << EOF
#!/bin/bash
# Restore database PostgreSQL - Studio ERP

if [ \$# -ne 1 ]; then
    echo "Uso: \$0 <file_backup.sql.gz>"
    echo "Esempio: \$0 /var/backups/postgresql/studio_erp_backup_20241225_020000.sql.gz"
    exit 1
fi

BACKUP_FILE=\$1
DB_NAME="$DB_NAME"

if [ ! -f "\$BACKUP_FILE" ]; then
    echo "File backup non trovato: \$BACKUP_FILE"
    exit 1
fi

echo "ATTENZIONE: Questo cancellerà tutti i dati esistenti nel database \$DB_NAME"
read -p "Confermi? (yes/no): " confirm

if [ "\$confirm" != "yes" ]; then
    echo "Restore annullato"
    exit 0
fi

echo "Decompressione backup..."
TEMP_FILE="/tmp/restore_\$(date +%s).sql"
gunzip -c "\$BACKUP_FILE" > "\$TEMP_FILE"

echo "Drop e ricreazione database..."
sudo -u postgres dropdb \$DB_NAME
sudo -u postgres createdb \$DB_NAME

echo "Restore database..."
sudo -u postgres psql \$DB_NAME < "\$TEMP_FILE"

echo "Ripristino permessi utente..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE \$DB_NAME TO $DB_USER;"
sudo -u postgres psql -d \$DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"

# Cleanup
rm "\$TEMP_FILE"

echo "Restore completato!"
EOF

sudo chmod +x /usr/local/bin/restore-postgres.sh

# 10. Salvataggio credenziali
log_info "Salvataggio credenziali database..."

# Crea file con credenziali per l'app user
sudo -u $APP_USER tee /home/$APP_USER/database_credentials.txt << EOF
# Database Credentials - Studio ERP
# =================================
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

# Componenti separati:
DB_NAME="$DB_NAME"
DB_USER="$DB_USER"  
DB_PASSWORD="$DB_PASSWORD"
DB_HOST="$DB_HOST"
DB_PORT="$DB_PORT"

# Per .env.local:
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME
EOF

sudo chmod 600 /home/$APP_USER/database_credentials.txt

# 11. Test finale connessione
log_info "Test finale connessione database..."

if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" >/dev/null; then
    log_success "Test connessione database: OK"
else
    log_error "Test connessione database: FALLITO"
    exit 1
fi

# 12. Ottimizzazioni finali
log_info "Applicazione ottimizzazioni finali..."

# Analyze database per aggiornare statistiche
sudo -u postgres psql -d $DB_NAME -c "ANALYZE;"

# Enable extensions utili
sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"pg_stat_statements\";"

log_success "======================================================================="
log_success "🗃️  Setup Database PostgreSQL completato!"
log_success "======================================================================="
echo ""
log_info "📊 Riepilogo configurazione:"
echo "  • Database: $DB_NAME"
echo "  • Utente: $DB_USER"
echo "  • Host: $DB_HOST:$DB_PORT"
echo "  • Credenziali salvate in: /home/$APP_USER/database_credentials.txt"
echo ""
log_info "🔄 Script disponibili:"
echo "  • Backup: /usr/local/bin/backup-postgres.sh"
echo "  • Restore: /usr/local/bin/restore-postgres.sh" 
echo "  • Monitor: /usr/local/bin/monitor-postgres.sh"
echo ""
log_info "⏰ Backup automatico configurato: giornaliero alle 02:30"
log_info "📊 Monitoring configurato: ogni 15 minuti"
echo ""
log_success "✅ PostgreSQL è pronto per la produzione!"