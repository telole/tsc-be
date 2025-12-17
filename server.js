const express = require('express');
const cors = require('cors');
const invoiceRoutes = require('./src/routes/invoice');
const authRoutes = require('./src/routes/auth');
const config = require('./config');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!fs.existsSync(config.pdfOutputDir)) {
  fs.mkdirSync(config.pdfOutputDir, { recursive: true });
}

app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Invoice Generator API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Invoice Generator Backend API',
    version: '1.0.0'
  });
});

app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
