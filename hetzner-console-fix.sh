#!/bin/bash

# 🔧 Hetzner Console Fix - SSH Setup per GitHub Actions
# Esegui questo script tramite Hetzner Cloud Console per risolvere i problemi SSH

echo "🔧 Studio Romano ERP - Hetzner SSH Fix"
echo "======================================="

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}1. Verifica stato SSH service${NC}"
systemctl status ssh --no-pager
echo ""

echo -e "${YELLOW}2. Backup chiavi esistenti${NC}"
if [ -f ~/.ssh/authorized_keys ]; then
    cp ~/.ssh/authorized_keys ~/.ssh/authorized_keys.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✅ Backup authorized_keys created${NC}"
fi

echo -e "${YELLOW}3. Cleanup chiavi vecchie${NC}"
rm -f ~/.ssh/id_*
echo -e "${GREEN}✅ Old SSH keys removed${NC}"

echo -e "${YELLOW}4. Genera nuova chiave SSH (SENZA passphrase per test)${NC}"
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N "" -C "github-actions-$(date +%Y%m%d)"
echo -e "${GREEN}✅ New SSH key generated${NC}"

echo -e "${YELLOW}5. Aggiungi chiave alle authorized_keys${NC}"
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys ~/.ssh/github_deploy
chmod 700 ~/.ssh
echo -e "${GREEN}✅ SSH key added to authorized_keys${NC}"

echo -e "${YELLOW}6. Test chiave SSH localmente${NC}"
if ssh-keygen -l -f ~/.ssh/github_deploy; then
    echo -e "${GREEN}✅ SSH key is valid${NC}"
else
    echo -e "${RED}❌ SSH key validation failed${NC}"
fi

echo -e "${YELLOW}7. Mostra configurazione SSH${NC}"
echo "SSH config in /etc/ssh/sshd_config:"
grep -E "^(PermitRootLogin|PubkeyAuthentication|PasswordAuthentication)" /etc/ssh/sshd_config || echo "Default settings"

echo -e "${YELLOW}8. Riavvia servizio SSH${NC}"
systemctl restart ssh
sleep 2
systemctl status ssh --no-pager
echo ""

echo -e "${YELLOW}9. Verifica porta SSH${NC}"
if netstat -tlnp | grep :22; then
    echo -e "${GREEN}✅ SSH listening on port 22${NC}"
else
    echo -e "${RED}❌ SSH not listening on port 22${NC}"
fi

echo ""
echo "════════════════════════════════════════════"
echo -e "${GREEN}🔑 CHIAVE PRIVATA PER GITHUB SECRETS${NC}"
echo "════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}Copia TUTTO il contenuto seguente nel GitHub Secret 'SSH_PRIVATE_KEY':${NC}"
echo ""
echo "----------------------------------------"
cat ~/.ssh/github_deploy
echo "----------------------------------------"
echo ""

echo -e "${GREEN}🔑 CHIAVE PUBBLICA (per verifica)${NC}"
echo "================================="
cat ~/.ssh/github_deploy.pub
echo ""

echo -e "${YELLOW}📋 ISTRUZIONI FINALI:${NC}"
echo "1. Copia la CHIAVE PRIVATA mostrata sopra"
echo "2. Vai su GitHub: Settings → Secrets → Actions"  
echo "3. Aggiorna/Crea: SSH_PRIVATE_KEY (incolla chiave privata)"
echo "4. RIMUOVI temporaneamente: SSH_PASSPHRASE (non serve per questa chiave)"
echo "5. Verifica: PRODUCTION_SERVER_IP = $(curl -s ifconfig.me 2>/dev/null || echo 'unknown')"
echo "6. Run il workflow 'Test SSH Connection' per verificare"
echo ""

echo -e "${YELLOW}🧪 Test connessione SSH locale:${NC}"
echo "ssh -i ~/.ssh/github_deploy root@$(curl -s ifconfig.me) 'echo SSH OK'"

echo ""
echo -e "${GREEN}✅ Setup completato! Ora testa il deployment GitHub Actions.${NC}"

# Log this operation
echo "$(date): SSH key regenerated for GitHub Actions" >> /var/log/ssh-setup.log