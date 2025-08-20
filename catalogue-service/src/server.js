const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'pendb'
};

let db;

async function initDatabase() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');
  } catch (error) {
    console.error('Database connection failed:', error);
    setTimeout(initDatabase, 5000); // Retry after 5 seconds
  }
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'pen-catalogue' });
});

app.get('/catalogue', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        id,
        name,
        brand,
        type,
        price,
        description,
        in_stock,
        image_url
      FROM pens 
      ORDER BY brand, name
    `);
    
    res.json(rows.map(row => ({
      id: row.id,
      name: row.name,
      brand: row.brand,
      type: row.type,
      price: parseFloat(row.price),
      description: row.description,
      in_stock: Boolean(row.in_stock),
      image_url: row.image_url
    })));
  } catch (error) {
    console.error('Error fetching catalogue:', error);
    res.status(500).json({ error: 'Failed to fetch catalogue' });
  }
});

app.get('/catalogue/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM pens WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pen not found' });
    }
    
    const pen = rows[0];
    res.json({
      id: pen.id,
      name: pen.name,
      brand: pen.brand,
      type: pen.type,
      price: parseFloat(pen.price),
      description: pen.description,
      in_stock: Boolean(pen.in_stock),
      image_url: pen.image_url
    });
  } catch (error) {
    console.error('Error fetching pen:', error);
    res.status(500).json({ error: 'Failed to fetch pen details' });
  }
});

app.get('/catalogue/brand/:brand', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM pens WHERE brand = ? ORDER BY name',
      [req.params.brand]
    );
    
    res.json(rows.map(row => ({
      id: row.id,
      name: row.name,
      brand: row.brand,
      type: row.type,
      price: parseFloat(row.price),
      description: row.description,
      in_stock: Boolean(row.in_stock),
      image_url: row.image_url
    })));
  } catch (error) {
    console.error('Error fetching pens by brand:', error);
    res.status(500).json({ error: 'Failed to fetch pens by brand' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Pen Catalogue Service running on port ${PORT}`);
  initDatabase();
});
