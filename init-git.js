const { execSync } = require('child_process');
const fs = require('fs');

console.log('Initializing Git repository for Azure deployment...');

try {
  // Check if .git directory exists
  if (!fs.existsSync('.git')) {
    console.log('\nInitializing new Git repository...');
    execSync('git init', { stdio: 'inherit' });
  } else {
    console.log('\nGit repository already exists.');
  }

  // Add all files to git
  console.log('\nAdding files to Git...');
  execSync('git add .', { stdio: 'inherit' });

  // Commit changes
  console.log('\nCommitting changes...');
  execSync('git commit -m "Prepare for Azure deployment"', { stdio: 'inherit' });

  console.log('\nGit repository is ready for Azure deployment!');
  console.log('\nNext steps:');
  console.log('1. Create an Azure App Service');
  console.log('2. Set up deployment from your git repository to Azure');
  console.log('3. Add the Azure remote to your local Git repository:');
  console.log('   git remote add azure <git-clone-url-from-azure-portal>');
  console.log('4. Push your code to Azure:');
  console.log('   git push azure main');

} catch (error) {
  console.error('Error initializing Git repository:', error.message);
  process.exit(1);
}
