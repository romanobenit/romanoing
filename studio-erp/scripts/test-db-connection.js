// Test database connection
require('dotenv').config();
const { Pool } = require('pg');

console.log('Testing PostgreSQL connection...\n');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  connectionTimeoutMillis: 5000,
});

async function testConnection() {
  try {
    console.log('1️⃣ Testing basic connection...');
    const client = await pool.connect();
    console.log('✅ Connection successful!\n');

    console.log('2️⃣ Testing simple query...');
    const result1 = await client.query('SELECT NOW()');
    console.log('✅ Simple query successful:', result1.rows[0].now);
    console.log('');

    console.log('3️⃣ Testing query on ruoli table...');
    const result2 = await client.query('SELECT * FROM ruoli WHERE codice = $1', ['COMMITTENTE']);
    console.log('✅ Ruoli query successful:', result2.rows);
    console.log('');

    console.log('4️⃣ Testing query on utenti table with email...');
    const testEmail = 'cliente.test@romano.it';
    const sql = `
      SELECT u.id, u.email, u.nome, u.cognome, u.attivo,
        u.password_hash as "passwordHash",
        u.cliente_id as "clienteId",
        r.codice as "ruoloCodice"
      FROM utenti u
      JOIN ruoli r ON u.ruolo_id = r.id
      WHERE u.email = $1 LIMIT 1
    `;

    console.log('Executing query with email:', testEmail);
    const result3 = await client.query(sql, [testEmail]);

    if (result3.rows.length > 0) {
      const user = result3.rows[0];
      console.log('✅ User found!');
      console.log('   - ID:', user.id);
      console.log('   - Email:', user.email);
      console.log('   - Nome:', user.nome, user.cognome);
      console.log('   - Ruolo:', user.ruoloCodice);
      console.log('   - Attivo:', user.attivo);
      console.log('   - Cliente ID:', user.clienteId);
      console.log('   - Password hash:', user.passwordHash?.substring(0, 20) + '...');
    } else {
      console.log('❌ User NOT found!');
    }

    client.release();
    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await pool.end();
  }
}

testConnection();
