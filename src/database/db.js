const mysql = require('mysql2/promise');
const config = require('../../config');

let pool;

async function initializeDatabase() {
  try {
    pool = mysql.createPool({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      port: config.db.port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    await pool.getConnection().then(conn => conn.release());
    await createTable();
  } catch (error) {
    if (error.code === 'ER_BAD_DB_ERROR') {
      await createDatabase();
      await initializeDatabase();
    } else {
      throw error;
    }
  }
}

async function createDatabase() {
  const tempPool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    port: config.db.port
  });
  await tempPool.execute(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\``);
  await tempPool.end();
}

async function createTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const [columns] = await pool.execute(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'invoices' AND COLUMN_NAME = 'user_id'
  `, [config.db.database]);

  if (columns.length === 0) {
    try {
      await pool.execute(`ALTER TABLE invoices ADD COLUMN user_id INT`);
      await pool.execute(`ALTER TABLE invoices ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`);
    } catch {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS invoices (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    }
  } else {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS invoices (
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  return pool;
}

initializeDatabase().catch(err => {
  console.error('Database initialization failed:', err.message);
  process.exit(1);
});

module.exports = { getPool, initializeDatabase };
