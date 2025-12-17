/**
 * Script untuk generate JWT Secret Key
 * 
 * Cara menggunakan:
 * node generate-jwt-secret.js
 * 
 * Atau gunakan online generator atau command line
 */

const crypto = require('crypto');

// Generate random secret key (64 characters)
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('='.repeat(60));
console.log('JWT Secret Key Generated:');
console.log('='.repeat(60));
console.log(jwtSecret);
console.log('='.repeat(60));
console.log('\nCopy secret key di atas dan paste ke file .env:');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('\n⚠️  PENTING: Simpan secret key ini dengan aman!');
console.log('   Jangan commit ke git repository!');
console.log('='.repeat(60));

