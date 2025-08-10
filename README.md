# Organic Products Delivery Application

A comprehensive full-stack web application for organic products delivery built with React, Node.js, Express, and MongoDB.

## 🌟 Features

### 🔐 Authentication System
- **OTP-based login** via email
- Secure JWT token-based session management
- Structured email templates for OTP delivery

### 🏠 Homepage
- **Product Categories**: Milk, Meat (Chicken, Mutton, Eggs), Organic Oils, Organic Powders
- Quantity selection for each product (½ liter, 1 liter, etc.)
- Milk booking options: Morning, Evening, or Both
- Responsive design with modern UI

### 🛒 Shopping & Ordering
- Product browsing and selection
- Add to cart functionality
- Checkout process with address selection
- Order history and tracking
- Favorite products management

### 📍 Address Management
- OpenStreetMap integration for address input
- Current location detection and usage
- Multiple address support with default selection

### 👤 User Features
- User profile management (name, gender, DOB)
- Order history
- Address management with map integration
- Favorite items

### 🔧 Admin Dashboard
- User management (view and manage all users)
- Product category and inventory management
- Order management and fulfillment
- Analytics dashboard with key metrics

## 🛠 Technology Stack

- **Frontend**: React with TypeScript, Custom CSS
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with OTP via email
- **Maps**: OpenStreetMap integration
- **Email**: Nodemailer
- **Containerization**: Docker & Docker Compose

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for containerized setup)
- Gmail account for OTP emails (or any SMTP service)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-app
   ```

2. **Set up environment variables**
   ```bash
   # For backend
   cp backend/.env.example backend/.env
   
   # For Docker Compose
   cp .env.example .env
   ```

3. **Configure email service** (Update backend/.env)
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongo mongo:7
   ```

5. **Start Backend Development Server**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

6. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm install
   npm start
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

### Docker Compose Setup

1. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your email credentials
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

4. **Stop services**
   ```bash
   docker-compose down
   ```

## 📁 Project Structure

```
my-app/
├── backend/                 # Node.js/Express API
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth & validation
│   ├── utils/              # Utilities (email service)
│   ├── server.js           # Main server file
│   └── Dockerfile          # Backend container config
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utilities
│   │   └── types/          # TypeScript types
│   ├── public/             # Static assets
│   └── Dockerfile          # Frontend container config
├── docker-compose.yml      # Container orchestration
└── README.md              # This file
```

## 🗄 Database Schema

### Users
- Personal information (name, email, phone, gender, DOB)
- Multiple addresses with geolocation
- Favorite products
- Admin flags

### Products
- Category-based organization
- Multiple quantity options
- Milk delivery preferences
- Inventory management
- Rating system

### Orders
- Complete order lifecycle
- Delivery scheduling
- Payment tracking
- Status history

### Categories
- Hierarchical organization
- Subcategories support
- Display customization

## 🔒 Security Features

- Input sanitization and validation
- Rate limiting for OTP requests
- CORS configuration
- JWT token authentication
- Environment variable protection
- Secure password handling

## 📧 Email Configuration

The application uses SMTP for sending OTP emails. Configure your email service in the environment variables:

### Gmail Setup
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use your Gmail address and app password

### Other SMTP Services
Update the email configuration in backend/.env:
```env
EMAIL_HOST=your-smtp-host
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
```

## 🧪 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Get products by category

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

1. Tailwind CSS configuration temporarily disabled - using custom CSS
2. OpenStreetMap integration pending implementation
3. Payment gateway integration pending

## 🔄 Upcoming Features

- [ ] Payment gateway integration
- [ ] OpenStreetMap integration
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Subscription management
- [ ] Multi-language support

## 📞 Support

For support, email support@organicproducts.com or create an issue in the repository.

---

Made with ❤️ for fresh, organic living
