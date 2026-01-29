# IMOB Motion - Email Authentication System

A complete email-based signup and login system with OTP verification using SMTP.

## Features

### 🔐 Email Authentication System
- **Email Verification**: Users must verify their email address with OTP before signup
- **Duplicate Account Detection**: Prevents multiple accounts with same email
- **Secure Password Creation**: Password and confirmation after email verification
- **JWT Token Authentication**: Secure session management
- **Beautiful UI**: Modern, animated interface with Framer Motion

### 📧 Email Features
- **SMTP Integration**: Uses Gmail SMTP for sending emails
- **OTP Generation**: 6-digit one-time passwords
- **Email Templates**: Beautiful HTML email templates
- **OTP Expiry**: 10-minute expiration for security

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Gmail account with app password enabled

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Email Settings
Update the `.env` file with your Gmail credentials:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=5000
```

**Important**: For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an App Password from Google Account settings
3. Use the App Password (not your regular password)

### 3. Run the Application

#### Option 1: Run Both Servers Separately
```bash
# Terminal 1: Start Backend Server
npm run server

# Terminal 2: Start Frontend Development Server
npm run dev
```

#### Option 2: Run Both Servers Together
```bash
npm run dev:full
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication Endpoints

#### Check Email Existence
```http
POST /api/check-email
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Send OTP for Signup
```http
POST /api/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify OTP
```http
POST /api/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### Complete Signup
```http
POST /api/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

## User Flow

### Signup Process
1. **Email Entry**: User enters email address
2. **Duplicate Check**: System checks if email already exists
3. **OTP Generation**: If email is new, generates and sends 6-digit OTP
4. **Email Verification**: User enters OTP received in email
5. **Password Creation**: After OTP verification, user creates password
6. **Account Creation**: Account is created and user is logged in

### Login Process
1. **Email & Password**: User enters credentials
2. **Authentication**: System validates credentials
3. **Token Generation**: JWT token is generated for session
4. **Dashboard Access**: User is redirected to dashboard

## Security Features

- **Password Hashing**: Uses bcrypt for secure password storage
- **JWT Tokens**: Secure session management with expiration
- **OTP Expiry**: 10-minute expiration for one-time passwords
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured CORS for API security

## File Structure

```
├── server.js                 # Backend server with authentication
├── .env                      # Environment variables
├── src/
│   ├── components/
│   │   ├── pages/
│   │   │   ├── SignupPage.tsx    # Email signup flow
│   │   │   └── LoginPage.tsx     # Login page
│   │   └── ...
│   └── ...
└── package.json
```

## Development Scripts

```bash
npm run dev          # Start frontend development server
npm run server       # Start backend server only
npm run dev:full     # Start both frontend and backend
npm run build        # Build for production
```

## Production Deployment

1. Build the frontend:
```bash
npm run build
```

2. Set production environment variables

3. Start the server:
```bash
npm run server
```

## Troubleshooting

### Gmail SMTP Issues
- Make sure 2-factor authentication is enabled
- Generate an App Password from Google Account settings
- Use the App Password, not your regular password

### Server Issues
- Check that port 5000 is not in use
- Verify all environment variables are set
- Check console logs for error messages

### Frontend Issues
- Clear browser cache
- Check browser console for errors
- Verify backend server is running

## Technologies Used

### Frontend
- React 18
- TypeScript
- Framer Motion (animations)
- Tailwind CSS
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- Nodemailer (email sending)
- bcrypt (password hashing)
- jsonwebtoken (JWT tokens)
- cors (cross-origin resource sharing)

### Email
- Gmail SMTP
- HTML Email Templates
- OTP Generation System

## License

This project is for educational purposes. Please ensure you follow proper security practices when deploying to production.
