# Advanced Features Installation Guide

This guide provides step-by-step instructions to install and configure all the advanced features implemented in the MyApp platform.

## Prerequisites

- Node.js 18+
- MongoDB 6.0+
- Docker & Docker Compose
- Redis (optional, for caching)

## Backend Dependencies

### 1. Payment Gateway (Stripe)

```bash
cd backend
npm install stripe @types/stripe
```

**Environment Variables:**
```bash
# Add to backend/.env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key  
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Configuration:**
1. Create a Stripe account at https://stripe.com
2. Get your test API keys from the Stripe Dashboard
3. Set up webhook endpoints for payment events

### 2. Push Notifications (Firebase)

```bash
cd backend
npm install firebase-admin
```

**Setup:**
1. Create a Firebase project at https://console.firebase.google.com
2. Generate a service account key
3. Download the service account JSON file

**Environment Variables:**
```bash
# Add to backend/.env
FCM_SERVER_KEY=your_fcm_server_key
FCM_SENDER_ID=your_fcm_sender_id
FIREBASE_SERVICE_ACCOUNT_PATH=path/to/service-account-key.json
```

### 3. Analytics & Monitoring

```bash
cd backend
npm install redis ioredis @types/ioredis
npm install winston morgan compression
```

**Environment Variables:**
```bash
# Add to backend/.env
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password (optional)
```

### 4. Email Service (Enhanced)

```bash
cd backend  
npm install @sendgrid/mail handlebars
```

**Environment Variables:**
```bash
# Add to backend/.env
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_TEMPLATES_PATH=src/templates
```

## Frontend Dependencies

### 1. Maps Integration (Leaflet)

```bash
cd frontend
npm install leaflet react-leaflet @types/leaflet
```

### 2. Charts & Analytics

```bash
cd frontend
npm install recharts react-chartjs-2 chart.js
```

### 3. Payment UI (Stripe Elements)

```bash
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 4. Enhanced UI Components

```bash
cd frontend
npm install framer-motion react-spring
npm install react-date-picker react-select
npm install react-hot-toast react-dropzone
```

### 5. Progressive Web App

```bash
cd frontend
npm install workbox-webpack-plugin workbox-window
```

## Mobile App Dependencies

### 1. Initialize React Native Project

```bash
cd mobile-app
npx react-native init MyAppMobile --template typescript
cd MyAppMobile
```

### 2. Install Core Dependencies

```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# State Management  
npm install @reduxjs/toolkit react-redux redux-persist

# Storage
npm install @react-native-async-storage/async-storage
npm install react-native-keychain

# Networking
npm install axios react-native-netinfo

# UI Components
npm install react-native-elements react-native-vector-icons
npm install react-native-paper native-base

# Platform linking (iOS only)
cd ios && pod install && cd ..
```

### 3. Native Features

```bash
# Push Notifications
npm install @react-native-firebase/app @react-native-firebase/messaging

# Maps
npm install react-native-maps react-native-geolocation-service

# Camera & Media
npm install react-native-image-picker react-native-camera

# Payments
npm install react-native-stripe-sdk

# Biometrics
npm install react-native-biometrics
```

## Database Setup

### 1. MongoDB Indexes

```bash
# Connect to MongoDB and create indexes
mongo myapp

# Analytics indexes
db.analyticevents.createIndex({ "timestamp": -1 })
db.analyticevents.createIndex({ "userId": 1, "timestamp": -1 })
db.analyticevents.createIndex({ "eventName": 1, "timestamp": -1 })

# Payment indexes  
db.payments.createIndex({ "userId": 1, "createdAt": -1 })
db.payments.createIndex({ "status": 1, "createdAt": -1 })
db.payments.createIndex({ "stripePaymentIntentId": 1 })

# Subscription indexes
db.subscriptions.createIndex({ "userId": 1, "status": 1 })
db.subscriptions.createIndex({ "stripeSubscriptionId": 1 })

# Notification indexes
db.notifications.createIndex({ "userId": 1, "createdAt": -1 })
db.notifications.createIndex({ "status": 1, "scheduledFor": 1 })
```

### 2. Redis Setup (Optional)

```bash
# Install Redis
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Start Redis
redis-server

# Or using Docker
docker run --name redis -p 6379:6379 -d redis:7-alpine
```

## Configuration Files

### 1. Update Backend Configuration

Create `backend/src/config/services.ts`:

```typescript
import Stripe from 'stripe';
import admin from 'firebase-admin';
import Redis from 'ioredis';

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Initialize Firebase Admin
if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Initialize Redis
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
```

### 2. Update Frontend Configuration

Create `frontend/src/config/services.ts`:

```typescript
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
export const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!
);

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

## Docker Configuration Updates

### 1. Add New Services to docker-compose.yml

```yaml
services:
  # Existing services...

  # Redis for caching
  redis:
    image: redis:7-alpine
    container_name: myapp-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - myapp-network

  # Analytics Dashboard (Optional)
  analytics:
    image: metabase/metabase:latest
    container_name: myapp-analytics
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      MB_DB_TYPE: postgres
      MB_DB_DBNAME: metabase
      MB_DB_PORT: 5432
      MB_DB_USER: metabase
      MB_DB_PASS: metabase_password
      MB_DB_HOST: postgres
    depends_on:
      - postgres
    networks:
      - myapp-network

  # PostgreSQL for Metabase
  postgres:
    image: postgres:15-alpine
    container_name: myapp-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: metabase
      POSTGRES_USER: metabase
      POSTGRES_PASSWORD: metabase_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - myapp-network

volumes:
  redis_data:
  postgres_data:
```

## Environment Variables Template

### Backend (.env)
```bash
# Existing variables...

# Payment Gateway
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Push Notifications
FCM_SERVER_KEY=your_fcm_server_key
FCM_SENDER_ID=your_sender_id
FIREBASE_SERVICE_ACCOUNT_PATH=config/firebase-service-account.json

# Analytics & Caching
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=

# Enhanced Email
SENDGRID_API_KEY=SG.your_sendgrid_api_key
EMAIL_TEMPLATES_PATH=src/templates

# Security
ENCRYPTION_KEY=your-32-char-encryption-key
SESSION_SECRET=your-session-secret
```

### Frontend (.env)
```bash
# Existing variables...

# Stripe
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Maps
REACT_APP_MAPBOX_TOKEN=pk.your_mapbox_token
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Analytics
REACT_APP_ANALYTICS_ENABLED=true
REACT_APP_GA_TRACKING_ID=GA_MEASUREMENT_ID

# PWA
REACT_APP_PWA_ENABLED=true
REACT_APP_NOTIFICATION_VAPID_KEY=your_vapid_key
```

## Testing

### 1. Run Backend Tests
```bash
cd backend
npm test
```

### 2. Run Frontend Tests  
```bash
cd frontend
npm test
```

### 3. Run E2E Tests
```bash
cd frontend
npm run test:e2e
```

### 4. Test Mobile App
```bash
cd mobile-app
npm test
npx react-native run-android
npx react-native run-ios
```

## Deployment

### 1. Production Build
```bash
# Backend
cd backend && npm run build

# Frontend  
cd frontend && npm run build

# Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Mobile App Deployment
```bash
# Android
cd mobile-app/android
./gradlew assembleRelease

# iOS (macOS only)
cd mobile-app/ios
xcodebuild -workspace MyApp.xcworkspace -scheme MyApp archive
```

## Monitoring & Maintenance

### 1. Health Checks
- Backend: `GET /api/health`
- Database: MongoDB health check
- Redis: `redis-cli ping`

### 2. Log Monitoring
```bash
# View application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Monitor system resources
docker stats
```

### 3. Performance Monitoring
- Set up application monitoring (New Relic, DataDog)
- Configure error tracking (Sentry)
- Monitor API response times

## Support

For questions and support:
- Check the individual feature documentation
- Review the API documentation at `/api/docs`
- Submit issues to the project repository
- Contact the development team

---

**Note:** This is a foundational implementation. Additional configuration and customization may be required based on specific deployment environments and requirements.