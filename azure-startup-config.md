# Azure App Service Startup Configuration

To ensure your Node.js application starts correctly on Azure App Service (Linux), follow these steps:

## 1. Configure Startup Command

1. Go to the Azure Portal
2. Navigate to your App Service
3. Click on "Configuration" in the left menu
4. Go to the "General settings" tab
5. Set the "Startup Command" to:
   ```
   node server.js
   ```
6. Click "Save" and wait for the app to restart

## 2. Configure Environment Variables

1. While still in "Configuration", go to the "Application settings" tab
2. Add the following environment variables:
   - **Name**: `WEBSITE_NODE_DEFAULT_VERSION`
   - **Value**: `~22` (or the version you selected during creation)
   
   - **Name**: `SQLITE_DB_PATH`
   - **Value**: `/home/site/wwwroot/polls.db`

3. Click "Save" and wait for the app to restart

## 3. Check Logs for Errors

If the application still doesn't start:

1. Go to "Log stream" in the left menu
2. Watch the logs as the application attempts to start
3. Look for any error messages that might indicate what's wrong

## 4. Common Issues and Solutions

1. **Missing dependencies**: Make sure all dependencies are listed in package.json
2. **Port configuration**: Ensure the app listens on the port provided by the `PORT` environment variable
3. **Path issues**: Linux is case-sensitive, so check all file paths
4. **Build issues**: Make sure the frontend is built correctly before deployment

## 5. Restart the App Service

After making configuration changes:

1. Go to the "Overview" page of your App Service
2. Click "Restart" and wait for the app to restart
3. Try accessing your app again at https://uog-polling.azurewebsites.net
