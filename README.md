# MyApp - Full-Stack Organic Food Delivery Platform

A complete full-stack web application for organic food delivery with modern technologies and responsive design.

## 🚀 Technologies Used

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router DOM** for routing
- **Axios** for API requests
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Nodemailer** for email services
- **Bcrypt** for password hashing

### DevOps & Deployment
- **Docker** & **Docker Compose**
- **Nginx** for frontend serving
- Production-ready containerized setup

## 🌟 Features

### User Features
- **OTP-based Email Authentication** - Secure login without passwords
- **Product Catalog** - Browse organic products by categories (Milk, Meat, Oils, Powders)
- **Smart Shopping Cart** - Add products with custom quantities and milk schedules
- **Address Management** - Save multiple delivery addresses with default selection
- **Order Tracking** - Real-time order status updates
- **User Profile** - Update personal information and preferences
- **Favorites** - Save favorite products for quick access

### Admin Features
- **Admin Dashboard** - Overview of users, products, orders, and analytics
- **Product Management** - Add, edit, delete products and manage inventory
- **Order Management** - Update order statuses and track deliveries
- **User Management** - View and manage user accounts

### Technical Features
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Type Safety** - Full TypeScript implementation
- **Security** - Input validation, rate limiting, secure headers
- **Email Templates** - Beautiful HTML email templates for OTP
- **Error Handling** - Comprehensive error handling and user feedback
- **Loading States** - Smooth user experience with loading indicators

## 🏗️ Project Structure

```
my-app/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts (Auth, Cart)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── Dockerfile           # Frontend container config
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utility functions
│   ├── scripts/             # Database scripts
│   └── Dockerfile           # Backend container config
├── docker-compose.yml       # Multi-container setup
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- MongoDB (for local development)

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-app
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment file
   cp backend/.env.example backend/.env
   
   # Update email configuration in backend/.env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Option 2: Local Development

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Database Setup**
   ```bash
   # Start MongoDB locally
   mongod
   
   # Initialize with sample data
   mongo myapp < backend/scripts/init-mongo.js
   ```

## 📱 User Guide

### For Customers

1. **Registration/Login**
   - Enter your email address
   - Receive OTP via email
   - Enter OTP to complete login

2. **Shopping**
   - Browse products by categories
   - Use search to find specific items
   - Add products to cart with custom quantities
   - For milk products, select delivery schedule (Morning/Evening/Both)

3. **Checkout**
   - Review cart items
   - Select delivery address
   - Place order and track status

4. **Profile Management**
   - Update personal information
   - Manage delivery addresses
   - View order history

### For Admins

1. **Access Admin Panel**
   - Login with admin credentials
   - Navigate to Admin Dashboard

2. **Product Management**
   - Add new products with categories
   - Update existing products
   - Manage inventory status

3. **Order Management**
   - View all customer orders
   - Update order statuses
   - Track deliveries

## 🛡️ Security Features

- **Input Validation** - Server-side validation for all inputs
- **Rate Limiting** - Protection against brute force attacks
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt for secure OTP storage
- **CORS Configuration** - Controlled cross-origin requests
- **Security Headers** - Helmet.js for security headers

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/me` - Get current user info

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/admin/all` - Get all orders (admin)

### Addresses
- `GET /api/addresses` - Get user addresses
- `POST /api/addresses` - Create new address
- `PUT /api/addresses/:id` - Update address

## 🌍 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/myapp
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Deployment

### Production Deployment

1. **Update environment variables** for production
2. **Build and deploy with Docker**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

3. **Set up SSL/HTTPS** with reverse proxy (Nginx/Traefik)
4. **Configure email service** for OTP delivery
5. **Set up monitoring** and logging

### Health Checks
- Frontend: `GET /health`
- Backend: `GET /api/health`
- Database: Automatic health checks in Docker

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📈 Performance Optimizations

- **Image Optimization** - WebP format with fallbacks
- **Code Splitting** - Dynamic imports for route-based splitting
- **Caching** - Browser and CDN caching strategies
- **Compression** - Gzip compression for assets
- **Database Indexing** - Optimized MongoDB queries

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@myapp.com
- Documentation: [Wiki](link-to-wiki)

## 🙏 Acknowledgments

- React community for excellent documentation
- Tailwind CSS for the amazing utility-first framework
- MongoDB for the flexible document database
- All contributors and testers

---

**Built with ❤️ for organic food lovers**
