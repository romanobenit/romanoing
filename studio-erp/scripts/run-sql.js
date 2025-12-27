#!/usr/bin/env node
/**
 * Script cross-platform per eseguire file SQL su PostgreSQL
 * Uso: node scripts/run-sql.js <file.sql>
 *
 * Supporta sia Windows che Linux/macOS
 * Gestisce correttamente DATABASE_URL con query parameters
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Leggi argomento (file SQL)
const sqlFile = process.argv[2];

if (!sqlFile) {
  console.error('❌ Errore: Specifica un file SQL');
  console.error('Uso: node scripts/run-sql.js <file.sql>');
  process.exit(1);
}

// Verifica che il file esista
if (!fs.existsSync(sqlFile)) {
  console.error(`❌ Errore: File ${sqlFile} non trovato`);
  process.exit(1);
}

// Leggi DATABASE_URL da .env
require('dotenv').config();
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Errore: DATABASE_URL non configurato in .env');
  process.exit(1);
}

// Rimuovi query parameters (es. ?schema=public) per compatibilità psql
const cleanUrl = databaseUrl.split('?')[0];

console.log(`📦 Esecuzione SQL: ${sqlFile}`);
console.log(`🔗 Database: ${cleanUrl.replace(/:[^:]*@/, ':***@')}`); // Nasconde password in output
console.log('');

try {
  // Determina il comando in base al sistema operativo
  const isWindows = process.platform === 'win32';

  // Su Windows, usa il file SQL con backslash
  const sqlFilePath = isWindows ? sqlFile.replace(/\//g, '\\') : sqlFile;

  // Esegui psql
  // Nota: su Windows, psql potrebbe non accettare l'URL direttamente se contiene caratteri speciali
  // In tal caso, usa variabili d'ambiente o credenziali separate

  let command;

  // Prova prima con URL diretto (funziona su Linux/macOS e alcune configurazioni Windows)
  if (isWindows) {
    // Su Windows, parsing URL e usa parametri separati
    const urlMatch = cleanUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

    if (urlMatch) {
      const [, user, password, host, port, database] = urlMatch;

      // Imposta variabili d'ambiente per evitare prompt password
      process.env.PGPASSWORD = password;

      command = `psql -h ${host} -p ${port} -U ${user} -d ${database} -f "${sqlFilePath}"`;
    } else {
      console.error('❌ Errore: Formato DATABASE_URL non valido');
      console.error('Formato atteso: postgresql://user:password@host:port/database');
      process.exit(1);
    }
  } else {
    // Linux/macOS: usa URL diretto
    command = `psql "${cleanUrl}" -f "${sqlFilePath}"`;
  }

  // Esegui comando
  execSync(command, {
    stdio: 'inherit',
    env: process.env
  });

  console.log('');
  console.log('✅ Import completato con successo!');

} catch (error) {
  console.error('');
  console.error('❌ Errore durante esecuzione SQL');
  console.error(error.message);
  process.exit(1);
}
