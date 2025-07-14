import { seedFirebaseData } from './src/services/seed-data';
import { logger } from './src/lib/logger';

async function uploadToFirebase() {
  try {
    console.log('🚀 เริ่มอัพโหลดข้อมูลขึ้น Firebase...');
    logger.info('Starting direct Firebase data upload', undefined, 'DirectUpload');
    
    const result = await seedFirebaseData();
    
    if (result.success) {
      console.log('✅ อัพโหลดสำเร็จ!');
      console.log('📊 ข้อมูลที่อัพโหลด:');
      console.log(`   - โครงการ: ${result.data?.projects || 0} รายการ`);
      console.log(`   - ผู้ติดต่อ: ${result.data?.contacts || 0} รายการ`);
      console.log(`   - โครงการผู้ดูแล: ${result.data?.adminProjects || 0} รายการ`);
      console.log(`   - งาน: ${result.data?.tasks || 0} รายการ`);
      
      logger.info('Direct Firebase upload completed successfully', result.data, 'DirectUpload');
    } else {
      console.error('❌ อัพโหลดไม่สำเร็จ:', result.error);
      logger.error('Direct Firebase upload failed', result.error, 'DirectUpload');
    }
  } catch (error) {
    console.error('💥 เกิดข้อผิดพลาด:', error);
    logger.error('Direct Firebase upload error', error, 'DirectUpload');
    process.exit(1);
  }
}

uploadToFirebase();
