#!/bin/bash
# Script per verificare se i GitHub Secrets sono configurati
# Nota: GitHub API non mostra i VALORI dei secrets (per sicurezza),
# ma può mostrare i NOMI dei secrets configurati

REPO="romanobenit/romanoing"

echo "═══════════════════════════════════════════════════════════"
echo "🔍 GitHub Secrets Checker - Studio ERP"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Repository: $REPO"
echo ""

# Secrets obbligatori
REQUIRED_SECRETS=(
    "PRODUCTION_SERVER_IP"
    "ANSIBLE_VAULT_PASSWORD"
    "POSTGRESQL_PASSWORD"
    "NEXTAUTH_SECRET"
    "BACKUP_ENCRYPTION_PASSPHRASE"
    "GRAFANA_ADMIN_PASSWORD"
    "SSH_PRIVATE_KEY"
    "STRIPE_PUBLISHABLE_KEY"
    "STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "SENDGRID_API_KEY"
    "UPSTASH_REDIS_REST_URL"
    "UPSTASH_REDIS_REST_TOKEN"
    "HETZNER_API_TOKEN"
)

echo "📋 Secrets obbligatori da configurare:"
echo ""

for secret in "${REQUIRED_SECRETS[@]}"; do
    echo "  [ ] $secret"
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "ℹ️  Per verificare su GitHub:"
echo ""
echo "1. Vai su:"
echo "   https://github.com/$REPO/settings/secrets/actions"
echo ""
echo "2. Dovresti vedere 14 secrets nell'elenco"
echo "   (GITHUB_TOKEN è automatico, non compare)"
echo ""
echo "3. Se ne manca qualcuno, clicca 'New repository secret'"
echo "   e aggiungi i valori da SECRETS_GENERATED.txt"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Quando hai configurato tutti i 14 secrets, procedi allo Step 2:"
echo ""
echo "   - Crea Pull Request su GitHub"
echo "   - Merge su 'main'"
echo "   - Deploy automatico partirà!"
echo ""
echo "═══════════════════════════════════════════════════════════"
