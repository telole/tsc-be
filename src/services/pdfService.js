const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const config = require('../../config');
const templateService = require('./templateService');

async function generatePDF(invoiceData) {
  let browser;
  try {
    if (!await fs.access(config.pdfOutputDir).then(() => true).catch(() => false)) {
      await fs.mkdir(config.pdfOutputDir, { recursive: true });
    }

    const html = await templateService.renderInvoiceTemplate(invoiceData);
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfPath = path.join(config.pdfOutputDir, `${invoiceData.invoice_number}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await browser.close();
    return { success: true, path: pdfPath, filename: `${invoiceData.invoice_number}.pdf` };
  } catch (error) {
    if (browser) await browser.close();
    throw error;
  }
}

async function generatePDFBuffer(invoiceData) {
  let browser;
  try {
    const html = await templateService.renderInvoiceTemplate(invoiceData);
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    if (browser) await browser.close();
    throw error;
  }
}

module.exports = { generatePDF, generatePDFBuffer };
