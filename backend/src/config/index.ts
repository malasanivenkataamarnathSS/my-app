export interface DatabaseConfig {
  mongoUri: string;
  redisUri?: string;
}

export interface PaymentConfig {
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  stripePublishableKey: string;
}

export interface NotificationConfig {
  fcmServerKey: string;
  fcmSenderId: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  frontendUrl: string;
  database: DatabaseConfig;
  payment: PaymentConfig;
  notification: NotificationConfig;
  email: EmailConfig;
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '5000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  database: {
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp',
    redisUri: process.env.REDIS_URI,
  },
  payment: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  },
  notification: {
    fcmServerKey: process.env.FCM_SERVER_KEY || '',
    fcmSenderId: process.env.FCM_SENDER_ID || '',
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@myapp.com',
  },
};