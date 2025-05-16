require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('_middleware/error-handler');

// middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// allow cors requests from any origin and with credentials
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:4200',
            'https://user-management-frontend.onrender.com',
            'https://user-management-frontend-4dpx.onrender.com'
        ];
        
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin) return callback(null, true);
        
        // Allow any Render.com domain
        if (origin.endsWith('.onrender.com')) {
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// api routes
app.use('/accounts', require('./accounts/accounts.controller'));
app.use('/employees', require('./employees/employees.controller'));
app.use('/departments', require('./departments/departments.controller'));
app.use('/workflows', require('./workflows/workflows.controller'));
app.use('/requests', require('./requests/requests.controller'));

// swagger docs route
app.use('/api-docs', require('./_helpers/swagger'));

// global error handler
app.use(errorHandler);

// Add a simple health check endpoint
app.get('/', (req, res) => {
    res.json({ message: 'User Management API is running' });
});

// start server
const port = process.env.PORT || (process.env.NODE_ENV === 'production' ? 80 : 4000);
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
