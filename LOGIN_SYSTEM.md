# Email OTP-Based Login System

## Overview
This implementation provides a complete email OTP-based authentication system for the Organic Products application. Users can log in using their email address, receive an OTP verification code, and complete their profile registration.

## Features

### 🔐 Security Features
- 6-digit OTP codes with 10-minute expiration
- Rate limiting: 5 OTP requests per 15 minutes per IP
- Maximum 5 OTP verification attempts before code expires
- JWT-based session management
- Input sanitization and validation
- Protection against brute force attacks

### 📧 Email System
- Professional HTML email templates
- Branded OTP emails with company styling
- Error handling for email delivery failures
- Nodemailer integration with SMTP support

### 🎨 User Interface
- Modern, responsive design with Tailwind CSS
- Multi-step authentication flow
- Real-time form validation
- Loading states and error feedback
- Auto-focus and keyboard navigation for OTP input
- Auto-submission when OTP is complete

### 📱 Mobile Support
- Indian mobile number validation (10 digits)
- +91 country code prefix
- Responsive design for mobile devices

## Authentication Flow

### Step 1: Email Input
1. User enters email address
2. Optional: Check "I'm a new user" to provide name
3. Form validates email format
4. Sends request to `/api/auth/send-otp`

### Step 2: OTP Verification
1. User receives OTP email (6-digit code)
2. Enters OTP in 6-digit input fields
3. Auto-focuses next input on digit entry
4. Auto-submits when all 6 digits are entered
5. Verifies OTP via `/api/auth/verify-otp`
6. On success: User is logged in with JWT token

### Step 3: Profile Completion (Optional)
1. For new users, additional profile details can be collected
2. Username validation (3-20 characters, alphanumeric + underscores)
3. Indian mobile number validation
4. Updates profile via `/api/auth/profile`

## API Endpoints

### POST /api/auth/send-otp
- Sends OTP to user's email
- Rate limited to 5 requests per 15 minutes
- Creates new user if email doesn't exist (with name)
- Returns success message with expiration time

### POST /api/auth/verify-otp
- Verifies OTP code and logs in user
- Rate limited to 10 attempts per 15 minutes
- Returns JWT token and user data
- Clears OTP after successful verification

### GET /api/auth/me
- Returns current user profile (requires authentication)
- Used to check authentication status on app load

### PUT /api/auth/profile
- Updates user profile information
- Validates phone number format
- Updates name, phone, gender, dateOfBirth

## Frontend Components

### EmailLogin Component
- Email input with validation
- "New user" checkbox with conditional name field
- Loading states and error display
- Terms of service links

### OTPVerification Component
- 6-digit OTP input fields
- Auto-focus and keyboard navigation
- Paste support for OTP codes
- Resend functionality with countdown timer
- Back navigation to email step

### UserRegistration Component
- Username input with validation rules
- Indian mobile number input with +91 prefix
- Real-time validation feedback
- Form submission handling

### LoginPage Container
- Manages multi-step flow state
- Handles API integration
- Error management
- Navigation between steps

## Configuration

### Environment Variables (Backend)
```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# OTP Configuration
OTP_EXPIRE_MINUTES=10
OTP_LENGTH=6

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
```

### Frontend Configuration
- API base URL: `http://localhost:5000/api`
- Automatic token management in localStorage
- Error handling with user-friendly messages

## Usage

### Starting the System
1. Start MongoDB server
2. Configure email credentials in backend `.env`
3. Start backend: `npm run dev`
4. Start frontend: `npm start`
5. Navigate to `/login`

### Testing
- Build frontend: `npm run build`
- All components are TypeScript-enabled
- Form validation works offline
- Error states are properly handled

## Security Considerations
- OTP codes are stored securely in MongoDB with expiration
- Email credentials should be app-specific passwords
- Rate limiting prevents abuse
- JWT tokens have expiration
- Input validation on both frontend and backend
- HTTPS should be used in production

## Customization
- Email templates can be modified in `backend/utils/emailService.js`
- Styling can be adjusted in component files (Tailwind CSS)
- Validation rules can be modified in form components
- OTP length and expiration can be configured via environment variables

## Browser Compatibility
- Modern browsers with ES6+ support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design for all screen sizes
- Accessibility features included