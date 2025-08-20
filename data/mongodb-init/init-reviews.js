// Initialize pen reviews and customer data

db = db.getSiblingDB('penstore');

// Create reviews collection
db.reviews.insertMany([
  {
    pen_id: "pen-001",
    customer_name: "Sarah Johnson",
    rating: 5,
    review: "The Parker Jotter is my go-to pen. Smooth writing and feels premium despite the affordable price.",
    date: new Date("2024-01-15")
  },
  {
    pen_id: "pen-002",
    customer_name: "Michael Chen",
    rating: 5,
    review: "Absolutely stunning pen! The StarWalker writes beautifully and feels like a luxury item.",
    date: new Date("2024-02-03")
  },
  {
    pen_id: "pen-004",
    customer_name: "Emma Williams",
    rating: 4,
    review: "Beautiful fountain pen with excellent build quality. The nib is very smooth.",
    date: new Date("2024-01-28")
  },
  {
    pen_id: "pen-006",
    customer_name: "David Rodriguez",
    rating: 5,
    review: "The Meisterstück 149 is the pinnacle of writing instruments. Worth every penny!",
    date: new Date("2024-02-10")
  },
  {
    pen_id: "pen-008",
    customer_name: "Lisa Thompson",
    rating: 5,
    review: "Love the retractable mechanism! Perfect for quick note-taking.",
    date: new Date("2024-02-01")
  }
]);

// Create customer preferences collection
db.customer_preferences.insertMany([
  {
    customer_id: "cust_001",
    preferred_brands: ["Parker", "Cross"],
    preferred_types: ["Ballpoint", "Gel"],
    budget_range: { min: 20, max: 100 },
    writing_style: "quick notes",
    hand_size: "medium"
  },
  {
    customer_id: "cust_002", 
    preferred_brands: ["Montblanc", "Waterman"],
    preferred_types: ["Fountain", "Rollerball"],
    budget_range: { min: 200, max: 1000 },
    writing_style: "formal documents",
    hand_size: "large"
  }
]);

// Create AI conversation logs collection
db.ai_conversations.createIndex({ "timestamp": 1 });
db.ai_conversations.createIndex({ "customer_id": 1 });

print("Pen store MongoDB initialized successfully!");
