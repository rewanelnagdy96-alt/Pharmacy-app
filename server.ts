import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database('pharmacy.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  );

  CREATE TABLE IF NOT EXISTS medicines (
    id TEXT PRIMARY KEY,
    barcode TEXT UNIQUE,
    name TEXT,
    category TEXT,
    price REAL,
    cost REAL,
    stock INTEGER,
    expiry_date TEXT
  );

  CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    address TEXT
  );

  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    debt REAL
  );

  CREATE TABLE IF NOT EXISTS missing_items (
    id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    total REAL,
    discount REAL,
    final_total REAL,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS sale_items (
    id TEXT PRIMARY KEY,
    sale_id TEXT,
    medicine_id TEXT,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY(sale_id) REFERENCES sales(id),
    FOREIGN KEY(medicine_id) REFERENCES medicines(id)
  );

  CREATE TABLE IF NOT EXISTS accounting_entries (
    id TEXT PRIMARY KEY,
    date TEXT,
    field1 REAL,
    field2 REAL,
    field3 REAL,
    field4 REAL,
    status TEXT
  );

  CREATE TABLE IF NOT EXISTS returns (
    id TEXT PRIMARY KEY,
    sale_id TEXT,
    medicine_id TEXT,
    quantity INTEGER,
    refund_amount REAL,
    date TEXT,
    FOREIGN KEY(sale_id) REFERENCES sales(id),
    FOREIGN KEY(medicine_id) REFERENCES medicines(id)
  );
`);

// Insert default admin
try {
  const insertUser = db.prepare('INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)');
  insertUser.run('1', 'admin', 'admin123', 'admin');
} catch (e) {
  // Ignore if exists
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Users
  app.get('/api/users', (req, res) => {
    const users = db.prepare('SELECT id, username, role FROM users').all();
    res.json(users);
  });

  app.post('/api/users', (req, res) => {
    const { id, username, password, role } = req.body;
    try {
      db.prepare('INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)')
        .run(id, username, password, role);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  app.delete('/api/users/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  // Clients
  app.get('/api/clients', (req, res) => {
    const clients = db.prepare('SELECT * FROM clients').all();
    res.json(clients);
  });

  app.post('/api/clients', (req, res) => {
    const { id, name, phone, debt } = req.body;
    try {
      db.prepare('INSERT INTO clients (id, name, phone, debt) VALUES (?, ?, ?, ?)')
        .run(id, name, phone, debt);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  app.put('/api/clients/:id/debt', (req, res) => {
    const { debt } = req.body;
    try {
      db.prepare('UPDATE clients SET debt = ? WHERE id = ?').run(debt, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  // Missing Items
  app.get('/api/missing', (req, res) => {
    const items = db.prepare('SELECT * FROM missing_items').all();
    res.json(items);
  });

  app.post('/api/missing', (req, res) => {
    const { id, name, type, date } = req.body;
    try {
      db.prepare('INSERT INTO missing_items (id, name, type, date) VALUES (?, ?, ?, ?)')
        .run(id, name, type, date);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  app.delete('/api/missing/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM missing_items WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  // Medicines
  app.get('/api/medicines', (req, res) => {
    const medicines = db.prepare('SELECT * FROM medicines').all();
    res.json(medicines);
  });

  app.post('/api/medicines', (req, res) => {
    const { id, barcode, name, category, price, cost, stock, expiry_date } = req.body;
    try {
      db.prepare('INSERT INTO medicines (id, barcode, name, category, price, cost, stock, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(id, barcode, name, category, price, cost, stock, expiry_date);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  // Suppliers
  app.get('/api/suppliers', (req, res) => {
    const suppliers = db.prepare('SELECT * FROM suppliers').all();
    res.json(suppliers);
  });

  app.post('/api/suppliers', (req, res) => {
    const { id, name, phone, address } = req.body;
    try {
      db.prepare('INSERT INTO suppliers (id, name, phone, address) VALUES (?, ?, ?, ?)')
        .run(id, name, phone, address);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  // Sales
  app.post('/api/sales', (req, res) => {
    const { id, total, discount, final_total, date, items } = req.body;
    const insertSale = db.prepare('INSERT INTO sales (id, total, discount, final_total, date) VALUES (?, ?, ?, ?, ?)');
    const insertItem = db.prepare('INSERT INTO sale_items (id, sale_id, medicine_id, quantity, price) VALUES (?, ?, ?, ?, ?)');
    const updateStock = db.prepare('UPDATE medicines SET stock = stock - ? WHERE id = ?');

    const transaction = db.transaction(() => {
      insertSale.run(id, total, discount, final_total, date);
      for (const item of items) {
        insertItem.run(item.id, id, item.medicine_id, item.quantity, item.price);
        updateStock.run(item.quantity, item.medicine_id);
      }
    });

    try {
      transaction();
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  // Reports
  app.get('/api/reports', (req, res) => {
    const { type } = req.query;
    try {
      if (type === 'daily') {
        const data = db.prepare(`
          SELECT date(date) as label, SUM(final_total) as value 
          FROM sales 
          GROUP BY date(date) 
          ORDER BY date(date) DESC 
          LIMIT 30
        `).all();
        res.json(data);
      } else if (type === 'monthly') {
        const data = db.prepare(`
          SELECT strftime('%Y-%m', date) as label, SUM(final_total) as value 
          FROM sales 
          GROUP BY strftime('%Y-%m', date) 
          ORDER BY strftime('%Y-%m', date) DESC 
          LIMIT 12
        `).all();
        res.json(data);
      } else if (type === 'profits') {
        // Profit = final_total - sum(cost * quantity)
        const data = db.prepare(`
          SELECT 
            date(s.date) as label, 
            SUM(s.final_total - (
              SELECT SUM(m.cost * si.quantity) 
              FROM sale_items si 
              JOIN medicines m ON si.medicine_id = m.id 
              WHERE si.sale_id = s.id
            )) as value
          FROM sales s
          GROUP BY date(s.date)
          ORDER BY date(s.date) DESC
          LIMIT 30
        `).all();
        res.json(data);
      } else if (type === 'missing') {
        const data = db.prepare(`
          SELECT name as label, stock as value 
          FROM medicines 
          WHERE stock <= 0 
          ORDER BY name ASC
        `).all();
        res.json(data);
      } else if (type === 'expiry') {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const today = new Date().toISOString().split('T')[0];
        const data = db.prepare(`
          SELECT name as label, expiry_date as value 
          FROM medicines 
          WHERE expiry_date <= ? AND expiry_date >= ?
          ORDER BY expiry_date ASC
        `).all(thirtyDaysFromNow.toISOString().split('T')[0], today);
        res.json(data);
      } else {
        res.status(400).json({ success: false, message: 'Invalid report type' });
      }
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  // Dashboard Stats
  app.get('/api/dashboard', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    const todaySales = db.prepare('SELECT SUM(final_total) as total, COUNT(*) as count FROM sales WHERE date LIKE ?').get(`${today}%`) as any;
    const missingMedicines = db.prepare('SELECT COUNT(*) as count FROM medicines WHERE stock <= 0').get() as any;
    
    // Near expiry (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const nearExpiry = db.prepare('SELECT COUNT(*) as count FROM medicines WHERE expiry_date <= ? AND expiry_date >= ?').get(thirtyDaysFromNow.toISOString().split('T')[0], today) as any;

    res.json({
      todaySales: todaySales.total || 0,
      invoicesCount: todaySales.count || 0,
      missingMedicines: missingMedicines.count || 0,
      nearExpiry: nearExpiry.count || 0
    });
  });

  // Accounting
  app.get('/api/accounting', (req, res) => {
    const entries = db.prepare('SELECT * FROM accounting_entries ORDER BY date DESC').all();
    res.json(entries);
  });

  app.post('/api/accounting', (req, res) => {
    const { id, date, field1, field2, field3, field4, status } = req.body;
    try {
      db.prepare('INSERT OR REPLACE INTO accounting_entries (id, date, field1, field2, field3, field4, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(id, date, field1, field2, field3, field4, status);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  // Returns
  app.get('/api/returns', (req, res) => {
    const returns = db.prepare(`
      SELECT r.*, m.name as medicine_name 
      FROM returns r 
      JOIN medicines m ON r.medicine_id = m.id 
      ORDER BY r.date DESC
    `).all();
    res.json(returns);
  });

  app.post('/api/returns', (req, res) => {
    const { id, sale_id, medicine_id, quantity, refund_amount, date } = req.body;
    const insertReturn = db.prepare('INSERT INTO returns (id, sale_id, medicine_id, quantity, refund_amount, date) VALUES (?, ?, ?, ?, ?, ?)');
    const updateStock = db.prepare('UPDATE medicines SET stock = stock + ? WHERE id = ?');

    const transaction = db.transaction(() => {
      insertReturn.run(id, sale_id, medicine_id, quantity, refund_amount, date);
      updateStock.run(quantity, medicine_id);
    });

    try {
      transaction();
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  // Notifications
  app.get('/api/notifications', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const lowStock = db.prepare('SELECT id, name, stock FROM medicines WHERE stock <= 5').all();
    const nearExpiry = db.prepare('SELECT id, name, expiry_date FROM medicines WHERE expiry_date <= ? AND expiry_date >= ?').all(thirtyDaysFromNow.toISOString().split('T')[0], today);
    const expired = db.prepare('SELECT id, name, expiry_date FROM medicines WHERE expiry_date < ?').all(today);

    res.json({
      lowStock,
      nearExpiry,
      expired
    });
  });

  // Backup & Restore
  app.get('/api/backup', (req, res) => {
    try {
      const tables = ['users', 'medicines', 'suppliers', 'clients', 'missing_items', 'sales', 'sale_items', 'accounting_entries', 'returns'];
      const backup: any = {};
      
      for (const table of tables) {
        backup[table] = db.prepare(`SELECT * FROM ${table}`).all();
      }
      
      res.json(backup);
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.post('/api/restore', (req, res) => {
    const data = req.body;
    const tables = ['users', 'medicines', 'suppliers', 'clients', 'missing_items', 'sales', 'sale_items', 'accounting_entries', 'returns'];
    
    try {
      const transaction = db.transaction(() => {
        for (const table of tables) {
          if (data[table] && Array.isArray(data[table])) {
            db.prepare(`DELETE FROM ${table}`).run();
            if (data[table].length > 0) {
              const columns = Object.keys(data[table][0]);
              const placeholders = columns.map(() => '?').join(', ');
              const insert = db.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`);
              for (const row of data[table]) {
                insert.run(...columns.map(col => row[col]));
              }
            }
          }
        }
      });
      
      transaction();
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
