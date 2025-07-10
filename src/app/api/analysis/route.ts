import { NextResponse } from 'next/server';
import { 
  getLatestProjectAnalysis, 
  findRelatedAnalyses, 
  getProjectStatistics,
  ProjectAnalysisData
} from '@/services/analysis-data';

/**
 * API endpoint สำหรับดึงข้อมูลการวิเคราะห์ล่าสุดของโครงการ
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');
    const keywords = url.searchParams.get('keywords');
    const type = url.searchParams.get('type');
    const organization = url.searchParams.get('organization');
    
    // ตรวจสอบว่าต้องการดึงข้อมูลชนิดใด
    if (projectId) {
      // ดึงข้อมูลการวิเคราะห์ล่าสุดของโครงการ
      const analysis = await getLatestProjectAnalysis(projectId);
      
      if (analysis) {
        return NextResponse.json({ success: true, data: analysis });
      } else {
        return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลการวิเคราะห์สำหรับโครงการนี้' });
      }
    } else if (keywords) {
      // ดึงข้อมูลการวิเคราะห์ที่เกี่ยวข้องกับคำสำคัญ
      const keywordArray = keywords.split(',');
      const analyses = await findRelatedAnalyses(keywordArray);
      
      return NextResponse.json({ success: true, data: analyses });
    } else if (type || organization) {
      // ดึงสถิติของโครงการที่มีลักษณะคล้ายกัน
      const stats = await getProjectStatistics(type, organization);
      
      return NextResponse.json({ success: true, data: stats });
    } else {
      return NextResponse.json({ success: false, message: 'กรุณาระบุพารามิเตอร์ projectId, keywords, หรือ type' });
    }
  } catch (error) {
    console.error('Error in analysis API:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 });
  }
}
