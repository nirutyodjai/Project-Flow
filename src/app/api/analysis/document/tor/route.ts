/**
 * API endpoint สำหรับวิเคราะห์เอกสาร TOR (Terms of Reference)
 */
import { NextResponse } from 'next/server';
import { analyzeTOR, TORAnalysisResult } from '@/ai/document-analysis';
import { saveTORAnalysis, getLatestTORAnalysis } from '@/services/document-analysis-data';

/**
 * วิเคราะห์เอกสาร TOR
 * POST /api/analysis/document/tor
 * 
 * @param request Request object ที่มี torContent, documentId และ projectId (optional)
 */
export async function POST(request: Request) {
  try {
    const { torContent, documentId, projectId, additionalContext } = await request.json();
    
    if (!torContent || !documentId) {
      return NextResponse.json({ error: 'torContent and documentId are required' }, { status: 400 });
    }
    
    // ตรวจสอบว่ามีการวิเคราะห์ล่าสุดหรือไม่
    const latestAnalysis = await getLatestTORAnalysis(documentId);
    
    // วิเคราะห์ TOR
    const analysis = await analyzeTOR(torContent, additionalContext);
    
    // บันทึกผลการวิเคราะห์
    const analysisId = await saveTORAnalysis(analysis, documentId, projectId);
    
    if (!analysisId) {
      return NextResponse.json({ error: 'Failed to save TOR analysis' }, { status: 500 });
    }
    
    return NextResponse.json({
      analysis: {
        ...analysis,
        id: analysisId
      },
      isUpdate: latestAnalysis !== null
    });
  } catch (error) {
    console.error('Error analyzing TOR:', error);
    return NextResponse.json({ error: 'An error occurred while analyzing TOR' }, { status: 500 });
  }
}

/**
 * ดึงข้อมูลการวิเคราะห์ TOR ล่าสุดตาม documentId
 * GET /api/analysis/document/tor?documentId=xxx
 */
export async function GET(request: Request) {
  try {
    // ดึง documentId จาก query parameters
    const url = new URL(request.url);
    const documentId = url.searchParams.get('documentId');
    
    if (!documentId) {
      return NextResponse.json({ error: 'documentId is required' }, { status: 400 });
    }
    
    // ดึงการวิเคราะห์ล่าสุด
    const analysis = await getLatestTORAnalysis(documentId);
    
    if (!analysis) {
      return NextResponse.json({ error: 'No TOR analysis found for the given documentId' }, { status: 404 });
    }
    
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error getting TOR analysis:', error);
    return NextResponse.json({ error: 'An error occurred while getting TOR analysis' }, { status: 500 });
  }
}
