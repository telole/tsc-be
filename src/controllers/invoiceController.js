const invoiceService = require('../services/invoiceService');
const pdfService = require('../services/pdfService');
const templateService = require('../services/templateService');
const config = require('../../config');

async function getAllInvoices(req, res) {
  try {
    const invoices = await invoiceService.getAllInvoices(req.user.id);
    res.json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices',
      error: error.message
    });
  }
}

async function getInvoiceById(req, res) {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id, req.user.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice',
      error: error.message
    });
  }
}

async function createInvoice(req, res) {
  try {
    const { client_name, items, total_amount } = req.body;
    if (!client_name || !items || !total_amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: client_name, items, total_amount'
      });
    }
    const invoice = await invoiceService.createInvoice(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating invoice',
      error: error.message
    });
  }
}

async function updateInvoice(req, res) {
  try {
    const invoice = await invoiceService.updateInvoice(req.params.id, req.body, req.user.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating invoice',
      error: error.message
    });
  }
}

async function deleteInvoice(req, res) {
  try {
    const deleted = await invoiceService.deleteInvoice(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting invoice',
      error: error.message
    });
  }
}

async function previewInvoice(req, res) {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id, req.user.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    invoice.bank_name = config.bankName;
    invoice.bank_account = config.bankAccount;
    invoice.bank_account_name = config.bankAccountName;
    const html = await templateService.renderInvoiceTemplate(invoice);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating preview',
      error: error.message
    });
  }
}

async function generatePDF(req, res) {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id, req.user.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    invoice.bank_name = config.bankName;
    invoice.bank_account = config.bankAccount;
    invoice.bank_account_name = config.bankAccountName;

    if (req.query.save === 'true') {
      const result = await pdfService.generatePDF(invoice);
      res.json({
        success: true,
        message: 'PDF generated and saved successfully',
        data: { path: result.path, filename: result.filename }
      });
    } else {
      const pdfBuffer = await pdfService.generatePDFBuffer(invoice);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoice_number}.pdf"`);
      res.send(pdfBuffer);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
}

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  previewInvoice,
  generatePDF
};
