const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting deployment preparation...');

// Step 1: Install dependencies
console.log('\n1. Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('Backend dependencies installed successfully.');
  
  execSync('cd frontend && npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('Frontend dependencies installed successfully.');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  process.exit(1);
}

// Step 2: Build the frontend
console.log('\n2. Building frontend...');
try {
  execSync('cd frontend && npm run build --legacy-peer-deps', { stdio: 'inherit' });
  console.log('Frontend built successfully.');
} catch (error) {
  console.error('Error building frontend:', error.message);
  process.exit(1);
}

// Step 3: Create deployment package
console.log('\n3. Creating deployment package...');

// Create .deployment file for Azure
fs.writeFileSync('.deployment', `[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true`);

// Create .gitignore if it doesn't exist
if (!fs.existsSync('.gitignore')) {
  fs.writeFileSync('.gitignore', `node_modules
npm-debug.log
.env
.DS_Store`);
}

console.log('\nDeployment preparation completed successfully!');
console.log('\nNext steps:');
console.log('1. Commit your changes to a git repository');
console.log('2. Create an Azure App Service');
console.log('3. Set up deployment from your git repository to Azure');
console.log('4. Configure environment variables in Azure if needed');
