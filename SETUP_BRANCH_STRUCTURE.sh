#!/bin/bash
# ═══════════════════════════════════════════════════════════
# Setup Branch Structure - romanoing Repository
# Esegui questo script dal TUO computer locale
# ═══════════════════════════════════════════════════════════

set -e

echo "🌳 Setup Branch Structure per Workflow Fase 1"
echo "════════════════════════════════════════════"
echo ""

# Verifica di essere nella directory corretta
if [ ! -d "studio-erp" ]; then
    echo "❌ ERRORE: Esegui questo script dalla root del repository romanoing/"
    exit 1
fi

echo "📍 Directory corrente: $(pwd)"
echo ""

# 1. Aggiorna master
echo "Step 1/5: Aggiornamento branch master..."
git checkout master
git pull origin master
echo "✅ Master aggiornato"
echo ""

# 2. Crea branch production
echo "Step 2/5: Creazione branch production..."
if git show-ref --verify --quiet refs/heads/production; then
    echo "⚠️  Branch production già esistente localmente"
    git checkout production
    git pull origin production 2>/dev/null || echo "Branch production non ancora su remote"
else
    git checkout -b production
    echo "✅ Branch production creato"
fi
echo ""

# 3. Push production
echo "Step 3/5: Push branch production su GitHub..."
git push -u origin production
echo "✅ Branch production pushato su GitHub"
echo ""

# 4. Crea branch develop
echo "Step 4/5: Creazione branch develop..."
if git show-ref --verify --quiet refs/heads/develop; then
    echo "⚠️  Branch develop già esistente localmente"
    git checkout develop
else
    git checkout -b develop
    echo "✅ Branch develop creato da production"
fi
echo ""

# 5. Push develop
echo "Step 5/5: Push branch develop su GitHub..."
git push -u origin develop
echo "✅ Branch develop pushato su GitHub"
echo ""

# Verifica finale
echo "════════════════════════════════════════════"
echo "📊 Struttura branch creata:"
echo ""
git branch -a | grep -E "(production|develop|master)" | sed 's/^/  /'
echo ""
echo "✅ SETUP COMPLETATO!"
echo ""
echo "🔗 Prossimi step:"
echo "1. Vai su GitHub → Settings → Branches"
echo "2. Configura branch protection (vedi GITHUB_SETUP.md)"
echo "3. Invita collaboratore al repository"
echo ""
