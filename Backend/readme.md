# Node.js + MySQL API - User Management System

API for user management with email verification, authentication, and password reset functionality built with Node.js, Express, and MySQL.

## Prerequisites

- [NodeJS and NPM](https://nodejs.org/en/download/) - JavaScript runtime and package manager
- [MySQL Community Server](https://dev.mysql.com/downloads/mysql/) - Database server
  - Installation instructions are available at [MySQL Documentation](https://dev.mysql.com/doc/refman/8.0/en/installing.html)

## Setup & Running Locally

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure MySQL Database**
   - Make sure MySQL server is running
   - Update database connection details in `config.json` if necessary

3. **Configure Email (SMTP) Settings**
   - Update SMTP settings in `config.json` 
   - For testing, create a free account at [Ethereal Email](https://ethereal.email/) and use their SMTP configuration

4. **Start the API**
   ```bash
   # Standard start
   npm start

   # Development mode with auto-reload (nodemon)
   npm run start:dev
   ```

5. **Access the API**
   - The API runs at: http://localhost:4000
   - Swagger API documentation: http://localhost:4000/api-docs

## Important Security Notes

Before deploying to production:

1. **Change JWT Secret Key**
   - In `config.json`, update the `secret` property used for JWT token generation
   - Use a strong random string (you can combine multiple GUIDs from [GUID Generator](https://www.guidgenerator.com/))

2. **Set up proper email configuration**
   - Replace the testing email configuration with a production-ready solution

3. **Secure database credentials**
   - Consider using environment variables instead of hardcoded database credentials

## API Features

- User registration with email verification
- Authentication with JWT and refresh tokens
- Password reset functionality
- Role-based access control (Admin/User)
- Account management (CRUD operations)
- Swagger API documentation

## License

MIT

# User-Management-System
### IT-INTPROG32- 16543

# **Members:** 
## **Group H Leader : Alexes Z. Cena**
   - Backend-authorization
### **Peter Luigi Nelmida**
   - Backend-CRUD
### **Ivan Nellas**
   - Frontend-profile-admin
### **Stanlee Muñaque**
   - Frontend-Fake-Backend
### **Godwin Gabriel Cabreros**
   - Tester-functional-testing


