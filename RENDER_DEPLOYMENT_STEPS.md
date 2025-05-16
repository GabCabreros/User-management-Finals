# Step-by-Step Render Deployment Guide

This guide provides detailed instructions for deploying your User Management System to Render's free tier.

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and log in to your account
2. Click on the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., "user-management-system")
4. Choose visibility (public or private)
5. Click "Create repository"
6. Follow GitHub's instructions to push your code to the repository

## Step 2: Deploy the Backend Service

1. Go to [Render](https://render.com) and log in to your account
2. Click on the "New +" button in the dashboard and select "Web Service"

   ![New Web Service](https://i.imgur.com/example1.png)

3. Connect your GitHub repository
   - Select "GitHub" as the deployment method
   - Grant Render access to your GitHub account if prompted
   - Select your repository from the list

4. Configure the service with the following settings:
   - **Name**: user-management-backend
   - **Environment**: Node
   - **Region**: Choose the region closest to your users
   - **Branch**: main (or your default branch)
   - **Root Directory**: Backend
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

   ![Backend Configuration](https://i.imgur.com/example2.png)

5. Set environment variables:
   - Scroll down to the "Environment Variables" section
   - Add the following variables:
     - Key: `NODE_ENV`, Value: `production`
     - Key: `PORT`, Value: `10000`

   ![Environment Variables](https://i.imgur.com/example3.png)

6. Click "Create Web Service"
7. Wait for the deployment to complete (this may take a few minutes)
8. Once deployed, you'll see a URL for your backend service (e.g., https://user-management-backend.onrender.com)
9. Visit this URL to verify that your backend is running (you should see "User Management API is running")

## Step 3: Update the Frontend Configuration

1. Update the `environment.prod.ts` file in your frontend code to point to your new backend URL:

```typescript
export const environment = {
    production: true,
    apiUrl: 'https://your-backend-service-name.onrender.com',
    useFakeBackend: false
};
```

2. Commit and push these changes to your GitHub repository

## Step 4: Deploy the Frontend Service

1. Go back to your Render dashboard
2. Click on the "New +" button and select "Static Site"

   ![New Static Site](https://i.imgur.com/example4.png)

3. Connect your GitHub repository (same as before)
4. Configure the static site with the following settings:
   - **Name**: user-management-frontend
   - **Region**: Choose the region closest to your users
   - **Branch**: main (or your default branch)
   - **Root Directory**: Frontend
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist/user-management-system`
   - **Plan**: Free

   ![Frontend Configuration](https://i.imgur.com/example5.png)

5. **Important**: Configure Routing for Single Page Application
   - Scroll down to the "Advanced" section
   - Expand it and look for "Redirect/Rewrite Rules"
   - Add the following rule:
     - Source: `/*`
     - Destination: `/index.html`
     - Action: `Rewrite`

   ![Routing Configuration](https://i.imgur.com/example6.png)

6. Click "Create Static Site"
7. Wait for the deployment to complete
8. Once deployed, you'll see a URL for your frontend service (e.g., https://user-management-frontend.onrender.com)
9. Visit this URL to verify that your frontend is running

## Step 5: Verify the Full Application

1. Visit your frontend URL
2. Try to log in or sign up
3. Test various features of the application to ensure everything is working correctly
4. Make sure to test navigation between different pages to verify that client-side routing is working

## Troubleshooting Common Issues

### "Not Found" Errors on Page Refresh or Direct URL Access

This is a common issue with single-page applications (SPAs) deployed to static hosting. It happens because the server doesn't know how to handle client-side routes.

**Solution**:
1. Make sure you've added the redirect/rewrite rule in Render as described in Step 4.5 above
2. If you're still having issues, try the following:
   - Check that the `_redirects` file is in your `src` directory and included in the build output
   - Verify that the `netlify.toml` file is in your Frontend directory
   - Make sure your `index.html` has the client-side routing script

### Backend Not Responding

1. Check the logs in your Render dashboard:
   - Go to your backend service
   - Click on the "Logs" tab
   - Look for any error messages

2. Remember that on the free tier, your backend service will spin down after 15 minutes of inactivity. The first request after inactivity will take some time as the service spins up.

### Database Connection Issues

1. Verify your MySQL credentials in the `config.json` file
2. Ensure your MySQL server allows connections from external IP addresses
3. Check if your database server has any firewall rules that might be blocking connections

### CORS Errors

If you see CORS errors in your browser console:

1. Check that your backend's CORS configuration includes your frontend domain
2. Verify that the frontend is making requests to the correct backend URL
3. Try opening the backend URL directly in your browser to ensure it's accessible

### Frontend Build Failures

If your frontend fails to build:

1. Check the build logs in your Render dashboard
2. Ensure all dependencies are correctly listed in your package.json
3. Verify that your Angular configuration is correct
4. Try building the frontend locally to identify any issues before deploying

## Maintaining Your Deployment

1. **Updates**: When you make changes to your code, push them to GitHub and Render will automatically redeploy your services
2. **Monitoring**: Regularly check the logs in your Render dashboard to catch any issues
3. **Free Tier Limitations**: Be aware that free tier services on Render have limitations:
   - Backend services spin down after 15 minutes of inactivity
   - Free tier includes 750 hours of runtime per month
   - Limited bandwidth and build minutes 