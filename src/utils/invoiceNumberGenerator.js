const { getPool } = require('../database/db');

async function generateInvoiceNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `INV-${year}-${month}-`;

  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT invoice_number FROM invoices 
     WHERE invoice_number LIKE ? 
     ORDER BY invoice_number DESC 
     LIMIT 1`,
    [`${prefix}%`]
  );

  let sequence = 1;
  if (rows.length > 0) {
    const lastNumber = rows[0].invoice_number;
    sequence = parseInt(lastNumber.split('-')[3]) || 0;
    sequence += 1;
  }

  return `${prefix}${String(sequence).padStart(4, '0')}`;
}

module.exports = { generateInvoiceNumber };
