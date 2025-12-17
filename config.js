require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'invoice_generator',
    port: process.env.DB_PORT || 3306
  },
  pdfOutputDir: process.env.PDF_OUTPUT_DIR || './pdfs',
  bankName: process.env.BANK_NAME || 'Bank Name',
  bankAccount: process.env.BANK_ACCOUNT || '1234567890',
  bankAccountName: process.env.BANK_ACCOUNT_NAME || 'Your Name',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
};

