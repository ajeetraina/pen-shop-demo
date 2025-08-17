const express = require('express');
const router = express.Router();

// Sample pen data
const pens = [
  {
    id: 1,
    name: "Montblanc Meisterstück 149",
    brand: "Montblanc",
    price: 745,
    category: "luxury",
    description: "Premium fountain pen with 14k gold nib",
    in_stock: true
  },
  {
    id: 2,
    name: "Parker Duofold",
    brand: "Parker", 
    price: 425,
    category: "premium",
    description: "Classic design with modern engineering",
    in_stock: true
  },
  {
    id: 3,
    name: "Pilot Custom 823",
    brand: "Pilot",
    price: 275,
    category: "premium", 
    description: "Vacuum filler with exceptional ink capacity",
    in_stock: false
  }
];

router.get('/', (req, res) => {
  res.json(pens);
});

router.get('/:id', (req, res) => {
  const pen = pens.find(p => p.id === parseInt(req.params.id));
  if (!pen) {
    return res.status(404).json({ error: 'Pen not found' });
  }
  res.json(pen);
});

module.exports = router;
