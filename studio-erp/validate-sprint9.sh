#!/bin/bash
# Validazione Statica Sprint 9 - Non richiede server in esecuzione
# Verifica che tutti i file e le configurazioni siano presenti

echo "======================================"
echo "🔍 VALIDAZIONE STATICA - SPRINT 9"
echo "======================================"
echo ""

# Colori
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0
WARNINGS=0

pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASSED++))
}

fail() {
  echo -e "${RED}✗${NC} $1"
  ((FAILED++))
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
  ((WARNINGS++))
}

# ======================================
# 1. Verifica Files Sprint 9
# ======================================
echo "📁 Verifica Files Sprint 9: Stripe Checkout"
echo "--------------------------------------"

declare -A FILES=(
  ["app/api/checkout/create-session/route.ts"]="API Stripe Checkout Session"
  ["app/(public)/checkout/page.tsx"]="Pagina Checkout Pubblica"
  ["app/(public)/checkout/success/page.tsx"]="Pagina Success Post-Pagamento"
  ["app/api/cliente/pagamenti/webhook/route.ts"]="Webhook Stripe"
)

for file in "${!FILES[@]}"; do
  if [ -f "$file" ]; then
    pass "${FILES[$file]}: $file"
  else
    fail "${FILES[$file]}: $file (MANCANTE)"
  fi
done

echo ""

# ======================================
# 2. Verifica Files Sprint 11 (Email)
# ======================================
echo "📧 Verifica Files Sprint 11: Email Service"
echo "--------------------------------------"

if [ -f "lib/email.ts" ]; then
  pass "Email Service: lib/email.ts"

  # Verifica funzioni email
  if grep -q "sendWelcomeEmail" lib/email.ts; then
    pass "  - Funzione sendWelcomeEmail presente"
  else
    fail "  - Funzione sendWelcomeEmail MANCANTE"
  fi

  if grep -q "sendPaymentConfirmationEmail" lib/email.ts; then
    pass "  - Funzione sendPaymentConfirmationEmail presente"
  else
    fail "  - Funzione sendPaymentConfirmationEmail MANCANTE"
  fi

  if grep -q "sendDocumentDeliveredEmail" lib/email.ts; then
    pass "  - Funzione sendDocumentDeliveredEmail presente"
  else
    fail "  - Funzione sendDocumentDeliveredEmail MANCANTE"
  fi

  if grep -q "sendNewMessageEmail" lib/email.ts; then
    pass "  - Funzione sendNewMessageEmail presente"
  else
    fail "  - Funzione sendNewMessageEmail MANCANTE"
  fi
else
  fail "Email Service: lib/email.ts (MANCANTE)"
fi

echo ""

# ======================================
# 3. Verifica Files Sprint 10 (Messaging)
# ======================================
echo "💬 Verifica Files Sprint 10: Real-time Messaging"
echo "--------------------------------------"

if [ -f "components/message-thread.tsx" ]; then
  pass "Message Thread Component: components/message-thread.tsx"

  # Verifica polling
  if grep -q "setInterval" components/message-thread.tsx; then
    pass "  - Polling implementation presente"
  else
    warn "  - Polling implementation non trovata"
  fi

  if grep -q "scrollIntoView" components/message-thread.tsx; then
    pass "  - Auto-scroll implementation presente"
  else
    warn "  - Auto-scroll implementation non trovata"
  fi
else
  fail "Message Thread Component MANCANTE"
fi

echo ""

# ======================================
# 4. Verifica Files Sprint 12 (Preferenze)
# ======================================
echo "⚙️  Verifica Files Sprint 12: Preferenze Notifiche"
echo "--------------------------------------"

if [ -f "app/api/cliente/preferenze/route.ts" ]; then
  pass "API Preferenze: app/api/cliente/preferenze/route.ts"
else
  fail "API Preferenze MANCANTE"
fi

if [ -f "app/(protected)/cliente/preferenze/page.tsx" ]; then
  pass "UI Preferenze: app/(protected)/cliente/preferenze/page.tsx"
else
  fail "UI Preferenze MANCANTE"
fi

# Verifica integrazione email preferences
if [ -f "lib/email.ts" ]; then
  if grep -q "checkUserNotificationPreference" lib/email.ts; then
    pass "  - Controllo preferenze integrato in email service"
  else
    warn "  - Controllo preferenze NON integrato in email service"
  fi
fi

echo ""

# ======================================
# 5. Verifica Dipendenze
# ======================================
echo "📦 Verifica Dipendenze package.json"
echo "--------------------------------------"

if [ -f "package.json" ]; then
  if grep -q '"@sendgrid/mail"' package.json; then
    pass "Dipendenza @sendgrid/mail presente"
  else
    fail "Dipendenza @sendgrid/mail MANCANTE"
  fi

  if grep -q '"stripe"' package.json; then
    pass "Dipendenza stripe presente"
  else
    fail "Dipendenza stripe MANCANTE"
  fi

  if grep -q '"@upstash/ratelimit"' package.json; then
    pass "Dipendenza @upstash/ratelimit presente"
  else
    warn "Dipendenza @upstash/ratelimit MANCANTE"
  fi
else
  fail "package.json NON trovato"
fi

echo ""

# ======================================
# 6. Verifica Codice Webhook
# ======================================
echo "🔗 Verifica Implementazione Webhook"
echo "--------------------------------------"

if [ -f "app/api/cliente/pagamenti/webhook/route.ts" ]; then
  # Verifica initial_purchase flow
  if grep -q "initial_purchase" app/api/cliente/pagamenti/webhook/route.ts; then
    pass "  - Gestione initial_purchase presente"
  else
    fail "  - Gestione initial_purchase MANCANTE"
  fi

  # Verifica creazione cliente
  if grep -q "INSERT INTO clienti" app/api/cliente/pagamenti/webhook/route.ts; then
    pass "  - Creazione cliente implementata"
  else
    fail "  - Creazione cliente MANCANTE"
  fi

  # Verifica creazione incarico
  if grep -q "INSERT INTO incarichi" app/api/cliente/pagamenti/webhook/route.ts; then
    pass "  - Creazione incarico implementata"
  else
    fail "  - Creazione incarico MANCANTE"
  fi

  # Verifica creazione milestone
  if grep -q "INSERT INTO milestone" app/api/cliente/pagamenti/webhook/route.ts; then
    pass "  - Creazione milestone implementata"
  else
    fail "  - Creazione milestone MANCANTE"
  fi

  # Verifica creazione utente
  if grep -q "INSERT INTO utenti" app/api/cliente/pagamenti/webhook/route.ts; then
    pass "  - Creazione utente implementata"
  else
    fail "  - Creazione utente MANCANTE"
  fi

  # Verifica invio email
  if grep -q "sendWelcomeEmail" app/api/cliente/pagamenti/webhook/route.ts; then
    pass "  - Invio email benvenuto implementato"
  else
    fail "  - Invio email benvenuto MANCANTE"
  fi
fi

echo ""

# ======================================
# 7. Verifica Bugfix Timestamps
# ======================================
echo "🐛 Verifica Bugfix createdAt/updatedAt"
echo "--------------------------------------"

if [ -f "app/api/collaboratore/incarichi/route.ts" ]; then
  if grep -q '"createdAt"' app/api/collaboratore/incarichi/route.ts && \
     grep -q '"updatedAt"' app/api/collaboratore/incarichi/route.ts; then
    pass "  - INSERT incarichi include timestamp"
  else
    fail "  - INSERT incarichi MANCA timestamp (bug NOT NULL)"
  fi
fi

if [ -f "lib/db.ts" ]; then
  if grep -q '"createdAt"' lib/db.ts && grep -q '"updatedAt"' lib/db.ts; then
    pass "  - createIncarico helper include timestamp"
  else
    warn "  - createIncarico helper potrebbe mancare timestamp"
  fi
fi

echo ""

# ======================================
# 8. Verifica Documentazione
# ======================================
echo "📚 Verifica Documentazione"
echo "--------------------------------------"

DOCS=(
  "TEST_E2E_MVP.md:Test E2E Plan"
  "MVP_COMPLETION_SUMMARY.md:MVP Summary"
)

for doc in "${DOCS[@]}"; do
  file="${doc%%:*}"
  name="${doc##*:}"
  if [ -f "$file" ]; then
    pass "$name: $file"
  else
    warn "$name: $file (MANCANTE)"
  fi
done

echo ""

# ======================================
# 9. Verifica Rate Limiting Fix
# ======================================
echo "🚦 Verifica Rate Limiting Development Fix"
echo "--------------------------------------"

if [ -f "lib/rate-limit.ts" ]; then
  if grep -q "isDevelopment" lib/rate-limit.ts; then
    pass "  - Rate limiting usa NODE_ENV per environment"
  else
    warn "  - Rate limiting NON differenzia environment"
  fi

  if grep -q "authLimit.*100" lib/rate-limit.ts; then
    pass "  - Limite auth development aumentato (100 req/min)"
  else
    warn "  - Limite auth development potrebbe essere troppo basso"
  fi
fi

echo ""

# ======================================
# REPORT FINALE
# ======================================
echo "======================================"
echo "📊 REPORT VALIDAZIONE"
echo "======================================"
echo ""
echo -e "${GREEN}Checks Passati:${NC} $PASSED"
echo -e "${RED}Checks Falliti:${NC} $FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ Validazione statica completata con successo!${NC}"
  echo ""
  echo "📝 Prossimi step:"
  echo "   1. Configura .env.local con variabili necessarie"
  echo "   2. Avvia server: npm run dev"
  echo "   3. Esegui test automatici: ./test-e2e-sprint9.sh"
  echo "   4. Esegui test manuali UI"
  exit 0
else
  echo -e "${RED}✗ Alcuni file o implementazioni sono mancanti${NC}"
  echo ""
  echo "Risolvi i problemi sopra prima di procedere"
  exit 1
fi
