// MongoDB initialization script
db = db.getSiblingDB('organic-products');

// Create collections
db.createCollection('users');
db.createCollection('categories');
db.createCollection('products');
db.createCollection('orders');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phone: 1 });
db.products.createIndex({ category: 1, isActive: 1 });
db.products.createIndex({ name: "text", description: "text", tags: "text" });
db.products.createIndex({ slug: 1 }, { unique: true });
db.orders.createIndex({ user: 1, createdAt: -1 });
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.categories.createIndex({ slug: 1 }, { unique: true });

// Insert default categories
db.categories.insertMany([
  {
    name: "Milk Products",
    description: "Fresh dairy products delivered daily",
    image: {
      url: "/images/categories/milk.jpg",
      alt: "Fresh milk products"
    },
    icon: "milk-icon",
    slug: "milk",
    subcategories: [
      { name: "Cow Milk", description: "Pure cow milk" },
      { name: "Buffalo Milk", description: "Rich buffalo milk" },
      { name: "Goat Milk", description: "Nutritious goat milk" }
    ],
    displayOrder: 1,
    color: "#3B82F6",
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Meat & Eggs",
    description: "Premium quality meat and farm-fresh eggs",
    image: {
      url: "/images/categories/meat.jpg",
      alt: "Fresh meat and eggs"
    },
    icon: "meat-icon",
    slug: "meat",
    subcategories: [
      { name: "Chicken", description: "Fresh chicken meat" },
      { name: "Mutton", description: "Premium mutton" },
      { name: "Eggs", description: "Farm-fresh eggs" },
      { name: "Fish", description: "Fresh fish varieties" }
    ],
    displayOrder: 2,
    color: "#EF4444",
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Organic Oils",
    description: "Pure and natural organic cooking oils",
    image: {
      url: "/images/categories/oils.jpg",
      alt: "Organic cooking oils"
    },
    icon: "oil-icon",
    slug: "oils",
    subcategories: [
      { name: "Coconut Oil", description: "Cold-pressed coconut oil" },
      { name: "Sesame Oil", description: "Traditional sesame oil" },
      { name: "Groundnut Oil", description: "Pure groundnut oil" },
      { name: "Sunflower Oil", description: "Refined sunflower oil" }
    ],
    displayOrder: 3,
    color: "#F59E0B",
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Organic Powders",
    description: "Natural grain and spice powders",
    image: {
      url: "/images/categories/powders.jpg",
      alt: "Organic powders"
    },
    icon: "powder-icon",
    slug: "powders",
    subcategories: [
      { name: "Sorghum Powder", description: "Nutritious sorghum flour" },
      { name: "Millet Powder", description: "Healthy millet flour" },
      { name: "Ragi Powder", description: "Finger millet flour" },
      { name: "Spice Powders", description: "Fresh ground spices" }
    ],
    displayOrder: 4,
    color: "#10B981",
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insert sample products
const categories = db.categories.find().toArray();
const milkCategory = categories.find(cat => cat.slug === 'milk');
const meatCategory = categories.find(cat => cat.slug === 'meat');
const oilsCategory = categories.find(cat => cat.slug === 'oils');
const powdersCategory = categories.find(cat => cat.slug === 'powders');

db.products.insertMany([
  // Milk Products
  {
    name: "Fresh Cow Milk",
    description: "Pure, organic cow milk from local farms. Rich in protein and calcium.",
    category: milkCategory._id,
    subcategory: "Cow Milk",
    quantityOptions: [
      { size: "½ liter", price: 30, unit: "liter" },
      { size: "1 liter", price: 55, unit: "liter" },
      { size: "2 liters", price: 100, unit: "liter" }
    ],
    basePrice: 55,
    images: [
      { url: "/images/products/cow-milk.jpg", alt: "Fresh cow milk" }
    ],
    availability: true,
    stockQuantity: 100,
    milkDelivery: {
      morning: true,
      evening: true,
      both: true
    },
    tags: ["milk", "dairy", "organic", "fresh"],
    rating: { average: 4.8, count: 245 },
    organic: true,
    certifications: ["Organic Certified", "Farm Fresh"],
    origin: { farm: "Green Valley Farm", location: "Karnataka" },
    slug: "fresh-cow-milk",
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Meat Products
  {
    name: "Free Range Chicken",
    description: "Healthy, free-range chicken raised without antibiotics or hormones.",
    category: meatCategory._id,
    subcategory: "Chicken",
    quantityOptions: [
      { size: "500g", price: 180, unit: "kg" },
      { size: "1kg", price: 350, unit: "kg" },
      { size: "2kg", price: 680, unit: "kg" }
    ],
    basePrice: 350,
    images: [
      { url: "/images/products/chicken.jpg", alt: "Free range chicken" }
    ],
    availability: true,
    stockQuantity: 50,
    tags: ["chicken", "meat", "free-range", "protein"],
    rating: { average: 4.7, count: 189 },
    organic: true,
    certifications: ["Free Range", "No Antibiotics"],
    origin: { farm: "Sunrise Poultry", location: "Tamil Nadu" },
    slug: "free-range-chicken",
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Oil Products
  {
    name: "Cold-Pressed Coconut Oil",
    description: "Pure, cold-pressed coconut oil extracted from fresh coconuts.",
    category: oilsCategory._id,
    subcategory: "Coconut Oil",
    quantityOptions: [
      { size: "250ml", price: 120, unit: "ml" },
      { size: "500ml", price: 220, unit: "ml" },
      { size: "1L", price: 400, unit: "ml" }
    ],
    basePrice: 220,
    images: [
      { url: "/images/products/coconut-oil.jpg", alt: "Cold-pressed coconut oil" }
    ],
    availability: true,
    stockQuantity: 75,
    tags: ["coconut oil", "cold-pressed", "cooking oil", "organic"],
    rating: { average: 4.9, count: 156 },
    organic: true,
    certifications: ["Cold-Pressed", "Organic Certified"],
    origin: { farm: "Coconut Grove", location: "Kerala" },
    slug: "cold-pressed-coconut-oil",
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Powder Products
  {
    name: "Organic Sorghum Flour",
    description: "Nutritious sorghum flour, gluten-free and rich in fiber.",
    category: powdersCategory._id,
    subcategory: "Sorghum Powder",
    quantityOptions: [
      { size: "500g", price: 80, unit: "kg" },
      { size: "1kg", price: 150, unit: "kg" },
      { size: "2kg", price: 280, unit: "kg" }
    ],
    basePrice: 150,
    images: [
      { url: "/images/products/sorghum-flour.jpg", alt: "Organic sorghum flour" }
    ],
    availability: true,
    stockQuantity: 60,
    tags: ["sorghum", "flour", "gluten-free", "organic", "healthy"],
    rating: { average: 4.6, count: 92 },
    organic: true,
    certifications: ["Organic Certified", "Gluten-Free"],
    origin: { farm: "Millet Fields", location: "Maharashtra" },
    slug: "organic-sorghum-flour",
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create admin user
db.users.insertOne({
  name: "Admin User",
  email: "admin@organicproducts.com",
  phone: "+91 9876543210",
  gender: "other",
  addresses: [],
  favorites: [],
  isAdmin: true,
  isActive: true,
  lastLogin: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
});

print("Database initialized successfully with sample data!");