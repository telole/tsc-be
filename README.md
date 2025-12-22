# 📄 Invoice Generator Backend

Backend API untuk generate invoice dengan fitur lengkap: CRUD invoice, preview HTML, generate PDF, dan authentication.

## ✨ Features

- ✅ **Invoice Management** - CRUD lengkap untuk invoice
- ✅ **PDF Generation** - Generate PDF dari HTML menggunakan Puppeteer
- ✅ **Preview HTML** - Preview invoice sebelum generate PDF
- ✅ **Custom Invoice Number** - Generator nomor invoice dengan format `INV-YYYY-MM-XXXX`
- ✅ **Bank Account Footer** - Footer dengan nomor rekening bank
- ✅ **Authentication** - JWT-based authentication & authorization
- ✅ **User Isolation** - Setiap user hanya bisa akses invoice miliknya

## 🚀 Tech Stack

- **Node.js** + **Express.js** - Backend framework
- **MySQL** - Database
- **Puppeteer** - HTML to PDF conversion
- **Handlebars** - Template engine
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📦 Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd InvoiceGenerator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

Buat database MySQL:

```bash
mysql -u root -p
CREATE DATABASE invoice_generator;
```

### 4. Environment Variables

Buat file `.env` dari `env.example`:

```bash
cp env.example .env
```

Edit `.env` dan sesuaikan konfigurasi:

```env
# Server Configuration
PORT=3000

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=invoice_generator
DB_PORT=3306

# PDF Output Directory
PDF_OUTPUT_DIR=./pdfs

# Bank Account Information (for invoice footer)
BANK_NAME=Bank Name
BANK_ACCOUNT=1234567890
BANK_ACCOUNT_NAME=Your Name

# JWT Authentication
JWT_SECRET=your-secret-key-change-in-production-min-32-characters
JWT_EXPIRES_IN=7d
```

**Generate JWT Secret:**

```bash
node generate-jwt-secret.js
```

Copy hasilnya ke `.env` sebagai `JWT_SECRET`.

### 5. Run Server

```bash
# Development mode (dengan auto-reload)
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:3000`

## 📋 API Endpoints

### Public Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Protected Endpoints (Require Authentication)

Semua endpoint di bawah ini memerlukan header:
```
Authorization: Bearer {token}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

#### Get All Invoices
```http
GET /api/invoices
Authorization: Bearer {token}
```

#### Get Invoice by ID
```http
GET /api/invoices/:id
Authorization: Bearer {token}
```

#### Create Invoice
```http
POST /api/invoices
Authorization: Bearer {token}
Content-Type: application/json

{
  "client_name": "Febriani",
  "subtitle": "FoodRecipe App Development",
  "items": [
    {
      "feature_title": "Fitur Register",
      "feature_desc": "Form registrasi dengan validasi lengkap",
      "detail": "Form registrasi pengguna, validasi input, hashing password",
      "price": 90000,
      "is_free": false
    }
  ],
  "total_amount": 180000,
  "footer_text": "Invoice ini sah dan dapat digunakan sebagai bukti transaksi"
}
```

#### Update Invoice
```http
PUT /api/invoices/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "client_name": "Updated Name",
  "total_amount": 200000
}
```

#### Delete Invoice
```http
DELETE /api/invoices/:id
Authorization: Bearer {token}
```

#### Preview Invoice (HTML)
```http
GET /api/invoices/:id/preview
Authorization: Bearer {token}
```

#### Generate PDF
```http
GET /api/invoices/:id/pdf?save=true
Authorization: Bearer {token}
```

- `save=true` - Save PDF ke folder `pdfs/`
- `save=false` - Download PDF langsung

## 📝 Invoice Data Structure

### Request Body (Create/Update)

```json
{
  "client_name": "Febriani",
  "subtitle": "FoodRecipe App Development",
  "invoice_date": "2024-12-15T00:00:00.000Z",
  "items": [
    {
      "feature_title": "Fitur Register",
      "feature_desc": "Form registrasi dengan validasi lengkap",
      "detail": "Form registrasi pengguna, validasi input, hashing password",
      "price": 90000,
      "is_free": false
    }
  ],
  "total_amount": 180000,
  "footer_text": "Invoice ini sah dan dapat digunakan sebagai bukti transaksi"
}
```

### Item Structure

```json
{
  "feature_title": "Feature Name",
  "feature_desc": "Short description (optional)",
  "detail": "Work detail description",
  "price": 100000,
  "is_free": false
}
```

**Note:** Jika `is_free: true`, price otomatis menjadi 0 dan badge "FREE" akan muncul.

## 🔐 Authentication

### How to Use

1. **Register atau Login** untuk mendapatkan token
2. **Gunakan token** di header setiap request ke protected endpoints:
   ```
   Authorization: Bearer {token}
   ```
3. **Token expires** dalam 7 hari (configurable via `JWT_EXPIRES_IN`)

### Example Flow

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const { data } = await loginResponse.json();
const token = data.token;

// 2. Use token untuk akses protected endpoint
const invoicesResponse = await fetch('http://localhost:3000/api/invoices', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🔢 Invoice Number Format

Format: `INV-YYYY-MM-XXXX`

- `INV` - Prefix
- `YYYY` - Tahun (4 digit)
- `MM` - Bulan (01-12)
- `XXXX` - Sequential number per bulan (0001, 0002, dst)

**Contoh:**
- `INV-2024-12-0001`
- `INV-2024-12-0002`
- `INV-2025-01-0001` (reset di bulan baru)

## 📁 Project Structure

```
InvoiceGenerator/
├── config.js                    # Configuration
├── server.js                    # Main server file
├── package.json
├── .env                         # Environment variables (not in git)
├── generate-jwt-secret.js      # JWT secret generator
├── src/
│   ├── routes/
│   │   ├── invoice.js          # Invoice routes
│   │   └── auth.js             # Auth routes
│   ├── controllers/
│   │   ├── invoiceController.js
│   │   └── authController.js
│   ├── services/
│   │   ├── invoiceService.js   # Invoice business logic
│   │   ├── pdfService.js       # PDF generation
│   │   └── templateService.js  # Template rendering
│   ├── middleware/
│   │   └── auth.js             # Authentication middleware
│   ├── database/
│   │   └── db.js               # Database setup
│   ├── utils/
│   │   ├── invoiceNumberGenerator.js
│   │   └── dateHelper.js
│   └── templates/
│       ├── invoice-template.html
│       └── New Project 125 [FC932E8].png
└── pdfs/                        # Generated PDFs (not in git)
```

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Invoices Table

```sql
CREATE TABLE invoices (
  id VARCHAR(36) PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  invoice_date DATETIME NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  subtitle TEXT,
  items TEXT NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  footer_text TEXT,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Note:** Tables akan otomatis dibuat saat pertama kali menjalankan aplikasi.

## 🧪 Testing

### Test Authentication

```bash
# Test tanpa token (harus gagal)
curl http://localhost:3000/api/invoices
# Expected: 401 Unauthorized

# Test dengan token
curl http://localhost:3000/api/invoices \
  -H "Authorization: Bearer YOUR_TOKEN"
# Expected: 200 OK
```

### Test Create Invoice

```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Test Client",
    "items": [{
      "feature_title": "Test Feature",
      "detail": "Test detail",
      "price": 100000
    }],
    "total_amount": 100000
  }'
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | - |
| `DB_NAME` | Database name | `invoice_generator` |
| `DB_PORT` | MySQL port | `3306` |
| `PDF_OUTPUT_DIR` | PDF output directory | `./pdfs` |
| `BANK_NAME` | Bank name for footer | - |
| `BANK_ACCOUNT` | Bank account number | - |
| `BANK_ACCOUNT_NAME` | Bank account name | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |

## 🔒 Security

- ✅ Password hashing dengan bcrypt
- ✅ JWT token authentication
- ✅ User isolation (setiap user hanya akses data sendiri)
- ✅ Input validation
- ✅ SQL injection protection (prepared statements)

## 📄 License

ISC

## 👤 Author

Me Gua (Galank)

---

**Last Updated:** December 2025
