// Initialize pen store database
db = db.getSiblingDB('penstore');

// Create pen products collection
db.pens.insertMany([
  {
    id: "mont-149",
    name: "Montblanc Meisterstück 149",
    brand: "Montblanc",
    price: 745,
    category: "luxury",
    description: "Premium fountain pen with 14k gold nib",
    in_stock: true
  },
  {
    id: "parker-sonnet",
    name: "Parker Sonnet Premium",
    brand: "Parker", 
    price: 245,
    category: "professional",
    description: "Elegant fountain pen with stainless steel nib",
    in_stock: true
  },
  {
    id: "lamy-safari",
    name: "Lamy Safari",
    brand: "Lamy",
    price: 29,
    category: "entry",
    description: "Reliable starter fountain pen",
    in_stock: true
  }
]);

print("Pen store database initialized!");
