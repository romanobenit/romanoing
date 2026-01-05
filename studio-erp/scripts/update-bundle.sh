#!/bin/bash
# Script per importare catalogo bundle su Linux/macOS
# Uso: ./scripts/update-bundle.sh

set -e  # Exit on error

echo "Importazione catalogo bundle (8 bundle)..."
echo ""

# Leggi DATABASE_URL da .env
if [ -f .env ]; then
    export $(cat .env | grep DATABASE_URL | xargs)
else
    echo "ERRORE: File .env non trovato"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "ERRORE: DATABASE_URL non configurato in .env"
    exit 1
fi

# Rimuovi query parameter ?schema=public per compatibilità psql
CLEAN_URL="${DATABASE_URL%%\?*}"

echo "Connessione a PostgreSQL..."
echo "URL: ${CLEAN_URL}"
echo ""

# Esegui script SQL
psql "$CLEAN_URL" -f prisma/update-bundle-completo.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Import completato con successo!"
    echo ""
    echo "Verifica bundle importati:"
    psql "$CLEAN_URL" -c "SELECT COUNT(*) as total FROM bundle;"
    echo ""
    psql "$CLEAN_URL" -c "SELECT codice, nome FROM bundle ORDER BY codice;"
else
    echo ""
    echo "✗ Errore durante import"
    exit 1
fi
