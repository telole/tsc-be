const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', invoiceController.getAllInvoices);
router.post('/', invoiceController.createInvoice);

router.get('/:id/preview', invoiceController.previewInvoice);
router.get('/:id/pdf', invoiceController.generatePDF);

router.get('/:id', invoiceController.getInvoiceById);
router.put('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;

