# Deploying UoG Polling System to Azure

This guide will walk you through the process of deploying the UoG Polling System to Microsoft Azure using Azure App Service.

## Prerequisites

1. Microsoft Azure account (Azure for Students is sufficient)
2. Git installed on your local machine
3. Node.js and npm installed on your local machine

## Preparation Steps

1. Run the deployment preparation script:

```bash
node deploy.js
```

This script will:
- Install all dependencies for both backend and frontend
- Build the frontend application
- Create necessary configuration files for Azure deployment

2. Initialize a Git repository (if not already done):

```bash
git init
git add .
git commit -m "Prepare for Azure deployment"
```

## Deploying to Azure

### 1. Create an Azure App Service

1. Log in to the [Azure Portal](https://portal.azure.com)
2. Click on "Create a resource"
3. Search for "Web App" and select it
4. Fill in the following details:
   - **Subscription**: Your Azure subscription (e.g., Azure for Students)
   - **Resource Group**: Create a new one or use an existing one
   - **Name**: Choose a unique name for your app (e.g., uog-polling-system)
   - **Publish**: Code
   - **Runtime stack**: Node.js 18 LTS (or latest available)
   - **Operating System**: Windows
   - **Region**: Choose a region close to your location
   - **App Service Plan**: Create a new one or use an existing one (Free tier is sufficient for testing)
5. Click "Review + create" and then "Create"

### 2. Configure Deployment

#### Option 1: Deploy from Local Git

1. In the Azure Portal, navigate to your newly created App Service
2. Go to "Deployment Center" in the left menu
3. Select "Local Git" as the source
4. Click "Save"
5. Go to "Deployment Credentials" and set up your deployment credentials
6. Add the Azure remote to your local Git repository:

```bash
git remote add azure <git-clone-url-from-azure-portal>
git push azure main
```

#### Option 2: Deploy from GitHub

1. Push your code to a GitHub repository
2. In the Azure Portal, navigate to your App Service
3. Go to "Deployment Center" in the left menu
4. Select "GitHub" as the source
5. Authenticate with GitHub and select your repository
6. Configure the build provider (Kudu/App Service Build Service)
7. Click "Save"

### 3. Configure Database

Since this application uses SQLite, which is a file-based database, you need to ensure the database file is stored in a persistent location:

1. In the Azure Portal, navigate to your App Service
2. Go to "Configuration" in the left menu
3. Add a new application setting:
   - **Name**: WEBSITE_CONTENTSHARE
   - **Value**: A unique name for your file share

This ensures that your SQLite database file will be stored in a persistent location.

### 4. Configure Environment Variables (if needed)

1. In the Azure Portal, navigate to your App Service
2. Go to "Configuration" in the left menu
3. Add any necessary environment variables under "Application settings"

### 5. Test Your Deployment

1. Once deployment is complete, navigate to your app's URL (https://your-app-name.azurewebsites.net)
2. Test the functionality to ensure everything is working correctly

## Troubleshooting

If you encounter issues with your deployment:

1. Check the logs in the Azure Portal:
   - Navigate to your App Service
   - Go to "Log stream" in the left menu

2. Make sure your web.config file is correctly configured for Node.js applications

3. Verify that all dependencies are correctly listed in your package.json file

4. Check that the frontend build was successful and the files are in the correct location

## Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Deploying Node.js Apps to Azure](https://docs.microsoft.com/en-us/azure/app-service/quickstart-nodejs)
- [Azure for Students](https://azure.microsoft.com/en-us/free/students/)
