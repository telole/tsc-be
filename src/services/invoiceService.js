const { getPool } = require('../database/db');
const { generateInvoiceNumber } = require('../utils/invoiceNumberGenerator');
const { formatDateForMySQL } = require('../utils/dateHelper');
const { v4: uuidv4 } = require('uuid');

async function getAllInvoices(userId) {
  const pool = getPool();
  const [rows] = await pool.execute(
    'SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows.map(row => ({
    ...row,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
  }));
}

async function getInvoiceById(id, userId) {
  const pool = getPool();
  const [rows] = await pool.execute(
    'SELECT * FROM invoices WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  if (rows.length === 0) return null;
  return {
    ...rows[0],
    items: typeof rows[0].items === 'string' ? JSON.parse(rows[0].items) : rows[0].items
  };
}

async function createInvoice(invoiceData, userId) {
  const invoiceNumber = invoiceData.invoice_number || await generateInvoiceNumber();
  const id = uuidv4();
  const invoiceDate = invoiceData.invoice_date 
    ? formatDateForMySQL(invoiceData.invoice_date)
    : formatDateForMySQL(new Date());

  if (!Array.isArray(invoiceData.items) || invoiceData.items.length === 0) {
    throw new Error('Items must be a non-empty array');
  }

  if (!invoiceData.client_name || invoiceData.client_name.trim() === '') {
    throw new Error('client_name is required');
  }

  const processedItems = invoiceData.items.map(item => ({
    feature_title: item.feature_title || item.title || '',
    feature_desc: item.feature_desc || item.desc || '',
    detail: item.detail || item.description || item.work_detail || '',
    price: item.is_free ? 0 : (parseFloat(item.price) || 0),
    is_free: item.is_free || false
  }));

  const calculatedTotal = processedItems.reduce((sum, item) => sum + item.price, 0);
  const totalAmount = invoiceData.total_amount || calculatedTotal;

  const pool = getPool();
  await pool.execute(
    `INSERT INTO invoices (id, invoice_number, invoice_date, client_name, subtitle, items, total_amount, footer_text, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, invoiceNumber, invoiceDate,
      invoiceData.client_name.trim(),
      invoiceData.subtitle ? invoiceData.subtitle.trim() : null,
      JSON.stringify(processedItems),
      totalAmount,
      invoiceData.footer_text ? invoiceData.footer_text.trim() : null,
      userId
    ]
  );

  return await getInvoiceById(id, userId);
}

async function updateInvoice(id, invoiceData, userId) {
  const existingInvoice = await getInvoiceById(id, userId);
  if (!existingInvoice) return null;

  const invoiceDate = invoiceData.invoice_date 
    ? formatDateForMySQL(invoiceData.invoice_date)
    : formatDateForMySQL(new Date());

  let processedItems = null;
  if (invoiceData.items) {
    if (!Array.isArray(invoiceData.items) || invoiceData.items.length === 0) {
      throw new Error('Items must be a non-empty array');
    }
    processedItems = invoiceData.items.map(item => ({
      feature_title: item.feature_title || item.title || '',
      feature_desc: item.feature_desc || item.desc || '',
      detail: item.detail || item.description || item.work_detail || '',
      price: item.is_free ? 0 : (parseFloat(item.price) || 0),
      is_free: item.is_free || false
    }));
  }

  let totalAmount = invoiceData.total_amount;
  if (processedItems) {
    totalAmount = invoiceData.total_amount || processedItems.reduce((sum, item) => sum + item.price, 0);
  }

  if (invoiceData.client_name !== undefined && !invoiceData.client_name?.trim()) {
    throw new Error('client_name cannot be empty');
  }

  const updateFields = [];
  const updateValues = [];

  if (invoiceDate) {
    updateFields.push('invoice_date = ?');
    updateValues.push(invoiceDate);
  }
  if (invoiceData.client_name !== undefined) {
    updateFields.push('client_name = ?');
    updateValues.push(invoiceData.client_name.trim());
  }
  if (invoiceData.subtitle !== undefined) {
    updateFields.push('subtitle = ?');
    updateValues.push(invoiceData.subtitle ? invoiceData.subtitle.trim() : null);
  }
  if (processedItems) {
    updateFields.push('items = ?');
    updateValues.push(JSON.stringify(processedItems));
  }
  if (totalAmount !== undefined) {
    updateFields.push('total_amount = ?');
    updateValues.push(totalAmount);
  }
  if (invoiceData.footer_text !== undefined) {
    updateFields.push('footer_text = ?');
    updateValues.push(invoiceData.footer_text ? invoiceData.footer_text.trim() : null);
  }

  if (updateFields.length === 0) {
    throw new Error('No fields to update');
  }

  const pool = getPool();
  const [result] = await pool.execute(
    `UPDATE invoices SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
    [...updateValues, id, userId]
  );

  if (result.affectedRows === 0) return null;
  return await getInvoiceById(id, userId);
}

async function deleteInvoice(id, userId) {
  const pool = getPool();
  const [result] = await pool.execute(
    'DELETE FROM invoices WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
};
