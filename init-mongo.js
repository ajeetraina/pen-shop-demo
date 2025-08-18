// MongoDB initialization script for Pen Store
db = db.getSiblingDB('penstore');

// Create collections
db.createCollection('pens');
db.createCollection('orders');
db.createCollection('customers');

// Insert sample pen data
db.pens.insertMany([
  {
    _id: "mont-blanc-149",
    name: "Montblanc Meisterstück 149 Fountain Pen",
    brand: "Montblanc",
    price: 750.00,
    type: "fountain",
    inStock: true,
    quantity: 15
  },
  {
    _id: "parker-sonnet", 
    name: "Parker Sonnet Fountain Pen",
    brand: "Parker",
    price: 145.00,
    type: "fountain", 
    inStock: true,
    quantity: 32
  },
  {
    _id: "pilot-metropolitan",
    name: "Pilot Metropolitan Fountain Pen", 
    brand: "Pilot",
    price: 18.00,
    type: "fountain",
    inStock: true,
    quantity: 85
  }
]);

print("✅ Pen Store database initialized successfully!");
