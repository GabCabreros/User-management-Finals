# Deployment Guide for User Management System (Free Tier)

This guide explains how to deploy the User Management System on Render.com using the free tier.

## Prerequisites

- A Render.com account
- A GitHub account (for connecting your repository to Render)
- Your MySQL database credentials (already configured)

## Backend Deployment Steps (Free Tier)

1. **Push your code to GitHub**
   - Create a new GitHub repository
   - Push your code to the repository

2. **Create a new Web Service on Render**
   - Log in to your Render account
   - Click on "New +" and select "Web Service"
   - Connect your GitHub repository
   - Use the following settings:
     - **Name**: user-management-backend
     - **Environment**: Node
     - **Root Directory**: Backend
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Set Environment Variables**
   - In your Render dashboard, go to your web service
   - Click on "Environment" tab
   - Add the following environment variables:
     - `NODE_ENV`: `production`
     - `PORT`: `10000`

4. **Deploy the Service**
   - Click on "Create Web Service"
   - Wait for the deployment to complete (this may take a few minutes)

5. **Verify the Deployment**
   - Once deployed, click on the URL provided by Render
   - You should see a message: "User Management API is running"
   - Test the API endpoints using tools like Postman
   - Note: Free tier services on Render will spin down after 15 minutes of inactivity. The first request after inactivity may take some time to respond.

## Frontend Deployment Steps (Free Tier)

1. **Create a new Static Site on Render**
   - Log in to your Render account
   - Click on "New +" and select "Static Site"
   - Connect your GitHub repository
   - Use the following settings:
     - **Name**: user-management-frontend
     - **Root Directory**: Frontend
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist/user-management-system`
     - **Plan**: Free

2. **Deploy the Static Site**
   - Click on "Create Static Site"
   - Wait for the deployment to complete

3. **Verify the Frontend Deployment**
   - Once deployed, click on the URL provided by Render
   - You should see your User Management System frontend
   - Test the login and other features

## Important Notes for Free Tier

1. **Backend Service Spin-down**:
   - On the free tier, your backend service will spin down after 15 minutes of inactivity
   - The first request after inactivity will take some time as the service spins up
   - This is normal behavior for free tier services

2. **Database Connection**:
   - Your MySQL database is already configured in the config.json file
   - Make sure your MySQL server allows connections from Render's IP addresses

3. **CORS Configuration**:
   - The backend is configured to accept requests from the frontend domain
   - You may need to update the allowed origins in server.js if your frontend URL is different

## Troubleshooting

- **Database Connection Issues**: 
  - Ensure your MySQL credentials are correct in the config.json file
  - Check if your MySQL server allows remote connections
  - Verify that the necessary database tables are created

- **Deployment Failures**:
  - Check the logs in your Render dashboard
  - Ensure all dependencies are correctly listed in package.json
  - Verify that the build and start commands are correct

- **CORS Issues**:
  - If you encounter CORS errors, update the CORS configuration in server.js with your actual frontend URL
  - The current configuration allows requests from 'https://user-management-frontend.onrender.com'

- **Frontend-Backend Connection**:
  - Make sure the frontend's environment.prod.ts file has the correct backend URL
  - Update the apiUrl in environment.prod.ts if your backend URL is different from 'https://user-management-backend.onrender.com' 