// Script per verificare la password hash
const bcrypt = require('bcryptjs');

const password = 'test123';
const hash = '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa';

console.log('Testing password:', password);
console.log('Against hash:', hash);

bcrypt.compare(password, hash).then(result => {
  console.log('Password match:', result);

  if (!result) {
    console.log('\n❌ Password does NOT match!');
    console.log('Generating new hash for "test123"...\n');

    bcrypt.hash(password, 10).then(newHash => {
      console.log('New hash for "test123":');
      console.log(newHash);
      console.log('\nUpdate the database with this SQL:');
      console.log(`UPDATE utenti SET password_hash = '${newHash}' WHERE email = 'cliente.test@romano.it';`);
    });
  } else {
    console.log('\n✅ Password matches correctly!');
  }
}).catch(err => {
  console.error('Error:', err);
});
