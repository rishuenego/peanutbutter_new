// Run this script with: node scripts/hash-password.js
// Make sure to run: npm install bcryptjs first

import bcrypt from 'bcryptjs';

const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\nRun this SQL to update admin password:');
    console.log(`UPDATE admins SET password_hash = '${hash}' WHERE username = 'admin';`);
});
