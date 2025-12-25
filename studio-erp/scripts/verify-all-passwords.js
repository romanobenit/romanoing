// Script per verificare tutte le password degli utenti
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function verifyAllPasswords() {
  try {
    console.log('🔍 Verifying all user passwords...\n');

    // Get all users
    const result = await pool.query(`
      SELECT u.email, u.password_hash, r.codice as ruolo
      FROM utenti u
      JOIN ruoli r ON u.ruolo_id = r.id
      ORDER BY r.livello
    `);

    const users = result.rows;

    // Test passwords
    const testPasswords = {
      'romano@studio-ingegneria.it': 'admin123',
      'senior@studio-romano.it': 'test123',
      'junior@studio-romano.it': 'test123',
      'esterno@studio-romano.it': 'test123',
      'cliente.test@romano.it': 'test123',
    };

    console.log('Testing passwords for all users:\n');

    for (const user of users) {
      const expectedPassword = testPasswords[user.email];

      if (!expectedPassword) {
        console.log(`⚠️  ${user.email} (${user.ruolo}) - No test password defined`);
        continue;
      }

      const isMatch = await bcrypt.compare(expectedPassword, user.password_hash);

      if (isMatch) {
        console.log(`✅ ${user.email} (${user.ruolo}) - Password "${expectedPassword}" is CORRECT`);
      } else {
        console.log(`❌ ${user.email} (${user.ruolo}) - Password "${expectedPassword}" is WRONG`);
        console.log(`   Hash in DB: ${user.password_hash.substring(0, 30)}...`);

        // Generate correct hash
        const correctHash = await bcrypt.hash(expectedPassword, 10);
        console.log(`   Correct hash: ${correctHash}`);
        console.log(`   Fix with: UPDATE utenti SET password_hash = '${correctHash}' WHERE email = '${user.email}';\n`);
      }
    }

    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyAllPasswords();
