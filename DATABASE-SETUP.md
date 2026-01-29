# Database Setup Guide

## Option 1: PostgreSQL (Recommended for Production)

### Prerequisites
1. Install PostgreSQL on your system
2. Create a database named `imob_motion`
3. Update the `.env` file with your PostgreSQL credentials

### Setup Steps
1. **Install PostgreSQL:**
   - Windows: Download from https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql postgresql-contrib`

2. **Create Database:**
   ```sql
   CREATE DATABASE imob_motion;
   ```

3. **Update .env file:**
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=imob_motion
   DB_USER=your_postgres_username
   DB_PASSWORD=your_postgres_password
   ```

4. **Run Database Setup:**
   ```bash
   node database/setup.js
   ```

5. **Start Server:**
   ```bash
   npm run server
   ```

## Option 2: SQLite (Easier for Development)

### Prerequisites
1. Install SQLite dependencies

### Setup Steps
1. **Install SQLite dependencies:**
   ```bash
   npm install sqlite3 @types/sqlite3
   ```

2. **Use the provided SQLite configuration**

### Database Schema

The users table will have the following structure:
- `id` (SERIAL PRIMARY KEY) - Auto-incrementing user ID
- `email` (VARCHAR(255) UNIQUE) - User's email address
- `password` (VARCHAR(255)) - Hashed password
- `created_at` (TIMESTAMP) - Account creation time
- `updated_at` (TIMESTAMP) - Last update time

## Features
- ✅ User registration with email verification
- ✅ OTP-based email verification
- ✅ Secure password hashing with bcrypt
- ✅ JWT authentication
- ✅ Database persistence
- ✅ Email notifications

## Environment Variables
```env
# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Server Port
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=imob_motion
DB_USER=postgres
DB_PASSWORD=password
```
