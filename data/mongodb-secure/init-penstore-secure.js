// Initialize secure pen store database
db = db.getSiblingDB('penstore');

// Create limited user
db.createUser({
  user: "penstore_user",
  pwd: process.env.SECURE_DB_PASSWORD || "secure_random_password",
  roles: [
    { role: "readWrite", db: "penstore" }
  ]
});

// Create collections with sample data (no sensitive info)
db.pens.insertMany([
  {
    _id: ObjectId(),
    name: "Montblanc Meisterstück 149", 
    brand: "Montblanc",
    price: 745,
    category: "luxury", 
    description: "Premium fountain pen with 14k gold nib",
    in_stock: true
  },
  {
    _id: ObjectId(),
    name: "Parker Duofold Centennial",
    brand: "Parker",
    price: 425,
    category: "premium",
    description: "Classic design with modern engineering", 
    in_stock: true
  }
]);

// Secure: Limited customer data (no sensitive fields)
db.customers.insertMany([
  {
    _id: ObjectId(),
    name: "John Doe",
    email: "john@example.com", 
    phone: "555-0123",
    created_at: new Date()
  }
]);

// Audit log for security monitoring
db.audit_log.insertOne({
  _id: ObjectId(),
  event: "database_initialized",
  timestamp: new Date(),
  security_level: "secure"
});

print("Secure pen store database initialized!");
