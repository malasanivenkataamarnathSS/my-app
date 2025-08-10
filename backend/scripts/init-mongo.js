// MongoDB initialization script
db = db.getSiblingDB('myapp');

// Create collections
db.createCollection('users');
db.createCollection('products');
db.createCollection('orders');
db.createCollection('addresses');

// Insert sample products
db.products.insertMany([
  // Milk products
  {
    name: "Fresh Organic Milk",
    category: "milk",
    description: "Pure, fresh organic milk from grass-fed cows. Rich in nutrients and perfect for daily consumption.",
    price: 60,
    unit: "liter",
    availableQuantities: ["500ml", "1L", "2L"],
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Buffalo Milk",
    category: "milk",
    description: "Creamy buffalo milk with higher fat content. Perfect for making paneer and sweets.",
    price: 80,
    unit: "liter",
    availableQuantities: ["500ml", "1L"],
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Meat products
  {
    name: "Free Range Chicken",
    category: "meat",
    subcategory: "chicken",
    description: "Fresh free-range chicken, hormone-free and naturally raised.",
    price: 280,
    unit: "kg",
    availableQuantities: ["500g", "1kg", "2kg"],
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Organic Mutton",
    category: "meat",
    subcategory: "mutton",
    description: "Premium quality organic mutton from grass-fed goats.",
    price: 650,
    unit: "kg",
    availableQuantities: ["500g", "1kg"],
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Farm Fresh Eggs",
    category: "meat",
    subcategory: "eggs",
    description: "Fresh eggs from free-range chickens. Rich in protein and essential nutrients.",
    price: 120,
    unit: "dozen",
    availableQuantities: ["6 pieces", "12 pieces", "30 pieces"],
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Organic oils
  {
    name: "Cold Pressed Coconut Oil",
    category: "organic-oils",
    description: "Pure cold-pressed coconut oil. Perfect for cooking and skincare.",
    price: 350,
    unit: "liter",
    availableQuantities: ["500ml", "1L"],
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Extra Virgin Olive Oil",
    category: "organic-oils",
    description: "Premium extra virgin olive oil imported from Mediterranean region.",
    price: 850,
    unit: "liter",
    availableQuantities: ["250ml", "500ml", "1L"],
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Sesame Oil",
    category: "organic-oils",
    description: "Traditional cold-pressed sesame oil. Great for cooking and massage.",
    price: 400,
    unit: "liter",
    availableQuantities: ["250ml", "500ml", "1L"],
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Organic powders
  {
    name: "Organic Sorghum Powder",
    category: "organic-powders",
    description: "Nutritious sorghum powder, gluten-free and rich in fiber.",
    price: 180,
    unit: "kg",
    availableQuantities: ["500g", "1kg", "2kg"],
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Millet Flour",
    category: "organic-powders",
    description: "Healthy millet flour, perfect for making rotis and traditional recipes.",
    price: 120,
    unit: "kg",
    availableQuantities: ["500g", "1kg", "2kg"],
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Organic Turmeric Powder",
    category: "organic-powders",
    description: "Pure organic turmeric powder with high curcumin content.",
    price: 200,
    unit: "kg",
    availableQuantities: ["100g", "250g", "500g"],
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create admin user
db.users.insertOne({
  email: "admin@myapp.com",
  name: "Admin User",
  role: "admin",
  isVerified: true,
  addresses: [],
  favoriteItems: [],
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully with sample data');