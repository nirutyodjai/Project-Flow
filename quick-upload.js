const { execSync } = require('child_process');

console.log('🚀 เริ่มอัพโหลดข้อมูลขึ้น Firebase...');
console.log('📝 กำลังเรียก API endpoint สำหรับ seed data...');

try {
  // Start the dev server in background
  console.log('⚡ เริ่ม dev server...');
  const devServer = execSync('start /b npm run dev', { encoding: 'utf-8' });
  
  // Wait a moment for server to start
  console.log('⏳ รอ server เริ่มทำงาน...');
  setTimeout(() => {
    try {
      // Call the API endpoint
      fetch('http://localhost:3000/api/seed-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          console.log('✅ อัพโหลดสำเร็จ!');
          console.log('📊 ข้อมูลที่อัพโหลด:');
          console.log(`   - โครงการ: ${result.data?.projects || 0} รายการ`);
          console.log(`   - ผู้ติดต่อ: ${result.data?.contacts || 0} รายการ`);
          console.log(`   - โครงการผู้ดูแล: ${result.data?.adminProjects || 0} รายการ`);
          console.log(`   - งาน: ${result.data?.tasks || 0} รายการ`);
        } else {
          console.error('❌ อัพโหลดไม่สำเร็จ:', result.error);
        }
        process.exit(0);
      })
      .catch(error => {
        console.error('💥 เกิดข้อผิดพลาดในการเรียก API:', error);
        process.exit(1);
      });
    } catch (error) {
      console.error('💥 ไม่สามารถเรียก API ได้:', error);
      process.exit(1);
    }
  }, 5000); // Wait 5 seconds for server to start
  
} catch (error) {
  console.error('💥 ไม่สามารถเริ่ม dev server ได้:', error);
  process.exit(1);
}
