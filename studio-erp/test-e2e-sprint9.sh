#!/bin/bash
# Test E2E Automatico - Sprint 9: Stripe Checkout
# Esegui dopo aver avviato il server: npm run dev

echo "======================================"
echo "🧪 TEST E2E - SPRINT 9: STRIPE CHECKOUT"
echo "======================================"
echo ""

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contatori
PASSED=0
FAILED=0

# Helper functions
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
}

# ======================================
# TEST 1: Ambiente e Configurazione
# ======================================
echo "📋 Test 1: Ambiente e Configurazione"
echo "--------------------------------------"

# Check .env file
if [ -f .env.local ] || [ -f .env ]; then
  pass "File .env trovato"
else
  fail "File .env NON trovato - crea .env.local con le variabili necessarie"
fi

# Check if server is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
  pass "Server development in esecuzione su localhost:3000"
else
  fail "Server NON in esecuzione - esegui 'npm run dev'"
  echo ""
  echo "⛔ Server non raggiungibile. Avvia il server prima di eseguire i test:"
  echo "   cd studio-erp && npm run dev"
  echo ""
  exit 1
fi

# Check database connection (via API)
DB_CHECK=$(curl -s http://localhost:3000/api/bundle/PROGETTO_BASE 2>&1)
if echo "$DB_CHECK" | grep -q "success"; then
  pass "Database connesso e raggiungibile"
else
  fail "Database NON connesso"
fi

echo ""

# ======================================
# TEST 2: API /api/checkout/create-session
# ======================================
echo "🔌 Test 2: API /api/checkout/create-session"
echo "--------------------------------------"

# Test data
TEST_DATA='{
  "bundleCode": "PROGETTO_BASE",
  "cliente": {
    "nome": "TestE2E",
    "cognome": "Automatico",
    "email": "test-e2e-'$(date +%s)'@example.com",
    "telefono": "3331234567",
    "codiceFiscale": "TSTTS180A01H501U",
    "indirizzo": "Via Test 1",
    "citta": "Roma",
    "cap": "00100"
  }
}'

echo "Invio richiesta POST /api/checkout/create-session..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/checkout/create-session \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA")

if echo "$RESPONSE" | grep -q "checkoutUrl"; then
  pass "API create-session risponde correttamente"
  CHECKOUT_URL=$(echo "$RESPONSE" | grep -o '"checkoutUrl":"[^"]*"' | cut -d'"' -f4)
  echo "   Checkout URL: ${CHECKOUT_URL:0:50}..."
else
  fail "API create-session NON funziona"
  echo "   Response: $RESPONSE"
fi

echo ""

# ======================================
# TEST 3: API /api/bundle (public)
# ======================================
echo "📦 Test 3: API Bundle Pubbliche"
echo "--------------------------------------"

BUNDLE_RESPONSE=$(curl -s http://localhost:3000/api/bundle/PROGETTO_BASE)

if echo "$BUNDLE_RESPONSE" | grep -q "success.*true"; then
  pass "API bundle funziona"
  BUNDLE_NAME=$(echo "$BUNDLE_RESPONSE" | grep -o '"nome":"[^"]*"' | cut -d'"' -f4)
  echo "   Bundle: $BUNDLE_NAME"
else
  fail "API bundle NON funziona"
fi

echo ""

# ======================================
# TEST 4: Verifica Files Critici
# ======================================
echo "📁 Test 4: Verifica Files Critici"
echo "--------------------------------------"

FILES=(
  "app/api/checkout/create-session/route.ts"
  "app/(public)/checkout/page.tsx"
  "app/(public)/checkout/success/page.tsx"
  "app/api/cliente/pagamenti/webhook/route.ts"
  "lib/email.ts"
  "components/message-thread.tsx"
  "app/api/cliente/preferenze/route.ts"
  "app/(protected)/cliente/preferenze/page.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    pass "File esiste: $file"
  else
    fail "File MANCANTE: $file"
  fi
done

echo ""

# ======================================
# TEST 5: Verifica Variabili Env (opzionale)
# ======================================
echo "🔐 Test 5: Verifica Variabili d'Ambiente"
echo "--------------------------------------"

ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
  ENV_FILE=".env"
fi

if [ -f "$ENV_FILE" ]; then
  # Check Stripe keys
  if grep -q "STRIPE_SECRET_KEY" "$ENV_FILE"; then
    pass "STRIPE_SECRET_KEY configurata"
  else
    warn "STRIPE_SECRET_KEY NON configurata"
  fi

  if grep -q "STRIPE_PUBLISHABLE_KEY" "$ENV_FILE"; then
    pass "STRIPE_PUBLISHABLE_KEY configurata"
  else
    warn "STRIPE_PUBLISHABLE_KEY NON configurata"
  fi

  # Check SendGrid
  if grep -q "SENDGRID_API_KEY" "$ENV_FILE"; then
    pass "SENDGRID_API_KEY configurata"
  else
    warn "SENDGRID_API_KEY NON configurata - email non funzioneranno"
  fi

  # Check Database
  if grep -q "DATABASE_URL" "$ENV_FILE"; then
    pass "DATABASE_URL configurata"
  else
    fail "DATABASE_URL NON configurata"
  fi
else
  warn "Nessun file .env trovato"
fi

echo ""

# ======================================
# TEST 6: Test Rate Limiting
# ======================================
echo "🚦 Test 6: Rate Limiting"
echo "--------------------------------------"

echo "Invio 3 richieste rapide..."
for i in {1..3}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/bundle/PROGETTO_BASE)
  if [ "$STATUS" = "200" ]; then
    pass "Richiesta $i: 200 OK"
  else
    fail "Richiesta $i: $STATUS"
  fi
done

echo ""

# ======================================
# TEST 7: Database Schema Check
# ======================================
echo "🗄️  Test 7: Verifica Schema Database"
echo "--------------------------------------"

# Questo test richiede psql, skip se non disponibile
if command -v psql &> /dev/null; then
  # Estrai DATABASE_URL dal .env
  if [ -f "$ENV_FILE" ]; then
    DB_URL=$(grep DATABASE_URL "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
    if [ -n "$DB_URL" ]; then
      # Test connessione
      TABLES=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('incarichi', 'milestone', 'clienti', 'bundle')" 2>/dev/null)

      if [ "$TABLES" = " 4" ]; then
        pass "Tabelle database presenti (4/4)"
      else
        warn "Database: trovate $TABLES tabelle su 4"
      fi
    else
      warn "DATABASE_URL non trovata nel .env"
    fi
  fi
else
  warn "psql non disponibile - skip verifica database diretta"
fi

echo ""

# ======================================
# REPORT FINALE
# ======================================
echo "======================================"
echo "📊 REPORT FINALE"
echo "======================================"
echo ""
echo -e "${GREEN}Test Passati:${NC} $PASSED"
echo -e "${RED}Test Falliti:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ Tutti i test automatici sono passati!${NC}"
  echo ""
  echo "📝 Prossimi step MANUALI:"
  echo "   1. Apri browser: http://localhost:3000/checkout"
  echo "   2. Compila form checkout"
  echo "   3. Usa carta test Stripe: 4242 4242 4242 4242"
  echo "   4. Verifica redirect a success page"
  echo "   5. Controlla database per nuovo cliente/incarico"
  echo "   6. Verifica email ricevuta (se SendGrid configurato)"
  exit 0
else
  echo -e "${RED}✗ Alcuni test sono falliti${NC}"
  echo ""
  echo "🔧 Risolvi i problemi sopra prima di procedere con test manuali"
  exit 1
fi
