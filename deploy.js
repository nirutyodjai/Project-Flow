#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 เริ่มกระบวนการ build และ deploy...');

try {
  // Clean previous build
  console.log('🧹 ลบไฟล์ build เก่า...');
  if (fs.existsSync('.next')) {
    execSync('rm -rf .next', { stdio: 'inherit' });
  }

  // Build the application
  console.log('🔨 Building Next.js application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Deploy to Firebase
  console.log('🚀 Deploying to Firebase...');
  execSync('firebase deploy --project project-comdee', { stdio: 'inherit' });

  console.log('✅ Deploy สำเร็จ!');
  console.log('🌐 เว็บไซต์: https://projectflow-comdee.web.app');

} catch (error) {
  console.error('❌ เกิดข้อผิดพลาด:', error.message);
  process.exit(1);
}
