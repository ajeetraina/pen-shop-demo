// Secure MongoDB initialization script

// Switch to penstore database
db = db.getSiblingDB('penstore');

// Create secure admin user
db.createUser({
  user: "secure_admin",
  pwd: "SecureP@ssw0rd123!",
  roles: [
    { role: "readWrite", db: "penstore" }
  ]
});

// Create collections with validation
db.createCollection("pens", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "price", "brand"],
      properties: {
        name: { bsonType: "string" },
        price: { bsonType: "number", minimum: 0 },
        brand: { bsonType: "string" },
        description: { bsonType: "string" }
      }
    }
  }
});

db.createCollection("customers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "name"],
      properties: {
        email: { bsonType: "string", pattern: "^.+@.+$" },
        name: { bsonType: "string" },
        phone: { bsonType: "string" }
      }
    }
  }
});

// Insert sample secure data
db.pens.insertMany([
  {
    _id: ObjectId(),
    name: "Secure Fountain Pen",
    brand: "SecurePens Inc",
    price: 299.99,
    description: "High-security fountain pen with encrypted ink",
    stock: 25,
    category: "luxury"
  },
  {
    _id: ObjectId(),
    name: "Privacy Ballpoint",
    brand: "SecurePens Inc", 
    price: 49.99,
    description: "Ballpoint pen with privacy features",
    stock: 100,
    category: "office"
  }
]);

db.customers.insertMany([
  {
    _id: ObjectId(),
    name: "Secure Customer",
    email: "secure@example.com",
    phone: "+1-555-0123",
    preferences: ["luxury", "security"]
  }
]);

print("✅ Secure database initialized successfully");
