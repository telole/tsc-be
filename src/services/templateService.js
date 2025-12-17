const fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');

async function renderInvoiceTemplate(invoiceData) {
  const templatePath = path.join(__dirname, '../templates/invoice-template.html');
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  const template = Handlebars.compile(templateContent);

  const invoiceDate = new Date(invoiceData.invoice_date);
  const formattedDate = invoiceDate.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let items = typeof invoiceData.items === 'string' 
    ? JSON.parse(invoiceData.items) 
    : invoiceData.items;

  const formattedItems = items.map((item, index) => {
    const isFree = item.is_free !== undefined ? item.is_free : ((item.price || 0) === 0);
    return {
      no: index + 1,
      feature_title: item.feature_title || item.title || item.description || `Item ${index + 1}`,
      feature_desc: item.feature_desc || item.desc || item.subtitle || '',
      detail: item.detail || item.description || item.work_detail || '',
      price: formatCurrency(item.price || 0),
      is_free: isFree
    };
  });

  let logoBase64 = '';
  try {
    const logoPath = path.join(__dirname, '../templates/New Project 125 [FC932E8].png');
    logoBase64 = (await fs.readFile(logoPath)).toString('base64');
  } catch {}

  const templateData = {
    invoiceNumber: invoiceData.invoice_number,
    invoiceDate: formattedDate,
    clientName: invoiceData.client_name,
    subtitle: invoiceData.subtitle || '',
    items: formattedItems,
    total: formatCurrency(invoiceData.total_amount),
    calculatedTotal: items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
    footerText: invoiceData.footer_text || 'Invoice ini sah dan dapat digunakan sebagai bukti transaksi',
    bankName: invoiceData.bank_name || '',
    bankAccount: invoiceData.bank_account || '',
    bankAccountName: invoiceData.bank_account_name || '',
    logoBase64
  };

  return template(templateData);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

module.exports = { renderInvoiceTemplate };
