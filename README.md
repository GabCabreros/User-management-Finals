# Employee Management System

A full-stack application for user authentication, account management, employee management with dynamic departments, transactional workflows, and employee requests.

## Technologies

- **Backend**: Node.js + Express + MySQL (Sequelize ORM)
- **Frontend**: Angular 17/19

## Features

### Accounts & Authentication
- Email Sign-Up: Users can register with an email and password, receiving a verification email to activate their account.
- Verify Email: Email verification link sent via SMTP (using Ethereal for testing) to confirm user registration.
- Authentication: JWT-based authentication with access and refresh tokens.
- Authorization: Role-based access control (Admin and User roles).
- Account Management: Users can view and update their profiles, change passwords, and manage refresh tokens.

### Employees
- Employee Management: Create, read, update, and delete (CRUD) employees with details like Employee ID, Account assignment, position, Department, hire date, and status.
- Department Transfer: Admins can transfer employees between departments, creating a workflow entry for tracking.

### Departments
- Department Management: CRUD operations for departments with fields for name and description.
- Employee Assignment: Departments are linked to employees, showing employee counts per department.

### Workflows
- Transactional Workflows: Create workflows for employee-related actions (e.g., onboarding, department changes, employee requests).
- Status Management: Update workflow status (e.g., Pending, Approved, Rejected) with detailed tracking.

### Requests
- Employee Requests: Employees can create requests (e.g., equipment, leave, resources) with a header (type, status) and a list of items (e.g., name, quantity).
- Request Management: Admins can view, update, and delete requests. Users can view their own requests.

## Setup and Installation

### Backend
1. Navigate to the Backend directory: `cd Backend`
2. Install dependencies: `npm install`
3. Configure the database connection in `config.json`
4. Start the server: `npm start`

### Frontend
1. Navigate to the Frontend directory: `cd Frontend`
2. Install dependencies: `npm install`
3. Start the development server: `ng serve`
4. Access the application at `http://localhost:4200`

## Testing

### Backend
- Use Postman to test API endpoints (e.g., POST http://localhost:4000/accounts/register)
- Run tests: `npm test`

### Frontend
- Test with fake backend: Ensure FakeBackendInterceptor is in app.module.ts and run `ng serve`
- Test with real backend: Remove FakeBackendInterceptor, update environment.apiUrl, and run `ng serve`
- Run tests: `ng test`

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

