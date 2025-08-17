// Initialize vulnerable pen store database
db = db.getSiblingDB('penstore');

// Create collections with sample data
db.pens.insertMany([
  {
    _id: ObjectId(),
    name: "Montblanc Meisterstück 149", 
    brand: "Montblanc",
    price: 745,
    category: "luxury",
    description: "Premium fountain pen with 14k gold nib",
    in_stock: true,
    inventory_count: 12
  },
  {
    _id: ObjectId(),
    name: "Parker Duofold Centennial",
    brand: "Parker", 
    price: 425,
    category: "premium",
    description: "Classic design with modern engineering",
    in_stock: true,
    inventory_count: 8
  },
  {
    _id: ObjectId(),
    name: "Pilot Custom 823",
    brand: "Pilot",
    price: 275, 
    category: "premium",
    description: "Vacuum filler with exceptional ink capacity",
    in_stock: false,
    inventory_count: 0
  }
]);

// Vulnerable: Customer data with sensitive information
db.customers.insertMany([
  {
    _id: ObjectId(),
    name: "John Doe",
    email: "john@example.com",
    phone: "555-0123",
    address: "123 Main St, Anytown",
    credit_card: "4532-1234-5678-9012",
    ssn: "123-45-6789",
    password_hash: "weak_hash_12345",
    created_at: new Date()
  },
  {
    _id: ObjectId(), 
    name: "Jane Smith",
    email: "jane@company.com",
    phone: "555-0456",
    address: "456 Oak Ave, Somewhere", 
    credit_card: "5678-9012-3456-7890",
    ssn: "987-65-4321",
    password_hash: "another_weak_hash",
    created_at: new Date()
  }
]);

// Extremely vulnerable: Admin credentials  
db.admin_users.insertMany([
  {
    _id: ObjectId(),
    username: "admin",
    password: "admin123",
    role: "super_admin", 
    api_key: "sk-admin-key-12345-NEVER-EXPOSE-THIS",
    openai_key: "sk-1234567890abcdef",
    database_url: "mongodb://admin:password@mongodb:27017/penstore",
    created_at: new Date()
  },
  {
    _id: ObjectId(),
    username: "support", 
    password: "support123",
    role: "support",
    api_key: "sk-support-key-67890",
    created_at: new Date()
  }
]);

// System configuration (very sensitive)
db.system_config.insertOne({
  _id: ObjectId(),
  internal_apis: {
    payment_processor: "https://internal-payments.company.com/api",
    user_management: "https://internal-users.company.com/api", 
    admin_panel: "https://admin.company.com/dashboard"
  },
  api_keys: {
    stripe: "sk_live_XXXXXXXXXXXXXX",
    sendgrid: "SG.XXXXXXXXXXXXXX",
    aws_access: "AKIAXXXXXXXXXXXXXXXX"
  },
  database_credentials: {
    prod_db: "mongodb://prod_user:super_secret_password@prod-cluster.company.com:27017",
    backup_db: "postgresql://backup:password123@backup.company.com:5432"
  }
});

print("Vulnerable pen store database initialized with sensitive data!");
