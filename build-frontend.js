const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building frontend for Azure deployment...');

try {
  // Step 1: Install frontend dependencies
  console.log('\n1. Installing frontend dependencies...');
  execSync('cd frontend && npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('Frontend dependencies installed successfully.');
  
  // Step 2: Build the frontend
  console.log('\n2. Building frontend...');
  execSync('cd frontend && npm run build --legacy-peer-deps', { stdio: 'inherit' });
  console.log('Frontend built successfully.');
  
  // Step 3: Verify the build
  const distPath = path.join(__dirname, 'frontend', 'dist');
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    console.log(`\nBuild verified. Found ${files.length} files in frontend/dist:`);
    files.forEach(file => console.log(` - ${file}`));
  } else {
    console.error('\nError: frontend/dist directory not found. Build may have failed.');
    process.exit(1);
  }
  
  console.log('\nFrontend build completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Commit your changes: git add . && git commit -m "Update frontend build"');
  console.log('2. Push to Azure: git push azure main:master');
  console.log('3. Configure startup settings as described in azure-startup-config.md');
  
} catch (error) {
  console.error('Error building frontend:', error.message);
  process.exit(1);
}
