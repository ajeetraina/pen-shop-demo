const express = require('express');
const router = express.Router();

// Simulated customer data (intentionally exposed when security disabled)
const customers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    credit_card: "4532-1234-5678-9012",
    address: "123 Main St, City"
  },
  {
    id: 2, 
    name: "Jane Smith",
    email: "jane@company.com",
    credit_card: "5678-9012-3456-7890",
    address: "456 Oak Ave, Town"
  }
];

const SECURITY_ENABLED = process.env.SECURITY_ENABLED === 'true';

router.get('/customers', (req, res) => {
  if (SECURITY_ENABLED) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Vulnerable: Exposes customer data
  res.json(customers);
});

router.post('/', (req, res) => {
  const { pen_id, customer_email, quantity } = req.body;
  
  // Simulate order creation
  const order = {
    id: Math.floor(Math.random() * 10000),
    pen_id,
    customer_email,
    quantity,
    total: quantity * 500, // Simplified pricing
    status: 'pending',
    created_at: new Date().toISOString()
  };
  
  res.json(order);
});

module.exports = router;
