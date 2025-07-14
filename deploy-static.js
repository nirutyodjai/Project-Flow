#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting static deployment process...');

try {
  // Build the application
  console.log('🔨 Building Next.js application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Check if out directory exists
  if (!fs.existsSync('out')) {
    console.error('❌ Build failed: out directory not found');
    process.exit(1);
  }

  console.log('✅ Build completed successfully');

  // Deploy to Firebase with static hosting only
  console.log('🚀 Deploying to Firebase (static hosting only)...');
  execSync('firebase deploy --only hosting --project project-comdee', { stdio: 'inherit' });

  console.log('✅ Deployment completed successfully!');
  console.log('🌐 Website: https://projectflow-comdee.web.app');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
