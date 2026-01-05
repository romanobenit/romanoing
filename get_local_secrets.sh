#!/bin/bash
# Script helper per ottenere secrets locali
# Esegui questo script sul TUO computer (non su server)

echo "═══════════════════════════════════════════════════════════"
echo "🔑 Local Secrets Helper - Studio ERP"
echo "═══════════════════════════════════════════════════════════"
echo ""

# SSH Private Key
echo "📝 SECRET: SSH_PRIVATE_KEY"
echo "-----------------------------------------------------------"
if [ -f ~/.ssh/id_rsa ]; then
    echo "✅ Trovata chiave SSH: ~/.ssh/id_rsa"
    echo ""
    echo "Copia TUTTO l'output sotto (incluso BEGIN/END):"
    echo "-----------------------------------------------------------"
    cat ~/.ssh/id_rsa
    echo "-----------------------------------------------------------"
    echo ""
else
    echo "❌ Chiave SSH non trovata in ~/.ssh/id_rsa"
    echo ""
    echo "Percorsi alternativi da provare:"
    echo "  - ~/.ssh/id_ed25519"
    echo "  - ~/.ssh/id_ecdsa"
    echo ""
    echo "Su Windows, prova:"
    echo "  type C:\\Users\\Romano\\.ssh\\id_rsa"
    echo ""
fi

echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🌐 Per gli altri secrets, apri questi link:"
echo ""
echo "Stripe Dashboard:"
echo "  https://dashboard.stripe.com/apikeys"
echo ""
echo "SendGrid API Keys:"
echo "  https://app.sendgrid.com/settings/api_keys"
echo ""
echo "Upstash Console:"
echo "  https://console.upstash.com/redis"
echo ""
echo "Hetzner Cloud:"
echo "  https://console.hetzner.cloud/"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Tutti i valori generati sono già in: SECRETS_GENERATED.txt"
echo "═══════════════════════════════════════════════════════════"
