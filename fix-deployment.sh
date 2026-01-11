#!/bin/bash

# 🔧 Fix Deployment Issues - Studio Romano ERP
# Esegui questi comandi per risolvere i problemi di deployment

echo "🔧 Studio Romano ERP - Fix Deployment Issues"
echo "=============================================="

echo ""
echo "📋 1. GENERARE NUOVA CHIAVE SSH (ESEGUI SUL SERVER HETZNER)"
echo "-----------------------------------------------------------"
cat << 'EOF'
# Connettiti al server Hetzner
ssh root@116.203.109.249

# Genera una nuova chiave SSH con passphrase
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -C "github-actions-deploy"

# ⚠️ IMPORTANTE: Quando richiesto, inserisci una passphrase sicura
# Esempio passphrase: Studio2025Deploy!

# Aggiungi la chiave alle authorized_keys
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys ~/.ssh/id_ed25519

# Mostra la chiave privata (da copiare in GitHub Secrets)
echo "=== CHIAVE PRIVATA (SSH_PRIVATE_KEY) ==="
cat ~/.ssh/id_ed25519
echo ""

# Mostra la chiave pubblica (per verifica)
echo "=== CHIAVE PUBBLICA ==="
cat ~/.ssh/id_ed25519.pub
echo ""

# Test locale della chiave
ssh-keygen -l -f ~/.ssh/id_ed25519
EOF

echo ""
echo "📋 2. AGGIORNARE GITHUB SECRETS"
echo "--------------------------------"
cat << 'EOF'
# Vai su GitHub: https://github.com/TUO_USERNAME/TUO_REPO/settings/secrets/actions

# Aggiungi/Aggiorna questi secrets:

SSH_PRIVATE_KEY: 
  (Incolla il contenuto completo di ~/.ssh/id_ed25519)

SSH_PASSPHRASE: 
  (La passphrase inserita durante ssh-keygen)

PRODUCTION_SERVER_IP:
  116.203.109.249

SENDGRID_API_KEY:
  (La tua API key SendGrid valida, formato: SG.xxx)

# Per ottenere una nuova API key SendGrid:
# 1. Vai su https://app.sendgrid.com/settings/api_keys
# 2. Create API Key > Full Access
# 3. Copia la chiave e aggiornala nei GitHub Secrets
EOF

echo ""
echo "📋 3. FIX PROBLEMI SPECIFICI NEL WORKFLOW"
echo "----------------------------------------"

cat << 'EOF'
Problemi rilevati nel workflow GitHub Actions:

1. ❌ ERRORE EXPECT: Line 151 usa 'ssh-add' senza expect
   ✅ SOLUZIONE: Il workflow già ha expect installato

2. ❌ ERRORE SPAWN: spawn id exp3 not open  
   ✅ SOLUZIONE: Rimuovere use di expect non necessario

3. ❌ TIMEOUT SSH: ConnectTimeout durante deployment
   ✅ SOLUZIONE: Server funzionante, problema era nella chiave SSH
EOF

echo ""
echo "📋 4. TEST CONNESSIONE SSH"
echo "--------------------------"
cat << 'EOF'
# Dopo aver aggiornato i GitHub Secrets, testa la connessione:

# Dal tuo computer locale (se hai la chiave privata):
ssh -i ~/.ssh/id_ed25519 root@116.203.109.249 "echo 'SSH Connection OK'"

# Se funziona, il deployment GitHub Actions dovrebbe funzionare
EOF

echo ""
echo "📋 5. COMANDI DI DEBUG UTILI"
echo "-----------------------------"
cat << 'EOF'
# Sul server Hetzner, verifica servizi:
sudo systemctl status ssh
sudo ufw status
sudo netstat -tlnp | grep :22

# Verifica logs SSH:
sudo tail -f /var/log/auth.log

# Riavvia SSH se necessario:
sudo systemctl restart ssh
EOF

echo ""
echo "✅ COMPLETAMENTO SETUP"
echo "----------------------"
echo "1. ✅ Server raggiungibile (ping OK)"
echo "2. ✅ Porta SSH 22 aperta"
echo "3. 🔧 Genera nuova chiave SSH"
echo "4. 🔧 Aggiorna GitHub Secrets"
echo "5. 🔧 Re-run GitHub Actions workflow"

echo ""
echo "🚀 Una volta completati tutti i passaggi, re-trigger il deployment da GitHub Actions!"