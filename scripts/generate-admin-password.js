// Run this script with: node scripts/generate-admin-password.js
// Make sure bcrypt is installed: npm install bcrypt

const bcrypt = require('bcrypt');

const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }
  
  console.log('===================================');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('===================================');
  console.log('\nRun this SQL to update admin password:\n');
  console.log(`UPDATE admins SET password_hash = '${hash}' WHERE username = 'admin';`);
  console.log('\n===================================');
});
