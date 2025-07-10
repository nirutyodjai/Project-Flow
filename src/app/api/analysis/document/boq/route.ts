/**
 * API endpoint สำหรับวิเคราะห์เอกสาร BOQ (Bill of Quantities)
 */
import { NextResponse } from 'next/server';
import { analyzeBOQ, BOQAnalysisResult } from '@/ai/document-analysis';
import {
  saveBOQAnalysis,
  getLatestBOQAnalysis,
  getLatestTORAnalysis
} from '@/services/document-analysis-data';

/**
 * วิเคราะห์เอกสาร BOQ
 * POST /api/analysis/document/boq
 * 
 * @param request Request object ที่มี boqContent, documentId, projectId (optional), และ torDocumentId (optional)
 */
export async function POST(request: Request) {
  try {
    const { boqContent, documentId, projectId, torDocumentId } = await request.json();
    
    if (!boqContent || !documentId) {
      return NextResponse.json({ error: 'boqContent and documentId are required' }, { status: 400 });
    }
    
    // ตรวจสอบว่ามีการวิเคราะห์ล่าสุดหรือไม่
    const latestAnalysis = await getLatestBOQAnalysis(documentId);
    
    // ดึงข้อมูล TOR analysis ถ้ามีการระบุ torDocumentId
    let torAnalysis = null;
    let torAnalysisId = null;
    
    if (torDocumentId) {
      torAnalysis = await getLatestTORAnalysis(torDocumentId);
      if (torAnalysis) {
        torAnalysisId = torAnalysis.id;
      }
    }
    
    // วิเคราะห์ BOQ
    const analysis = await analyzeBOQ(boqContent, torAnalysis || undefined);
    
    // บันทึกผลการวิเคราะห์
    const analysisId = await saveBOQAnalysis(analysis, documentId, projectId, torAnalysisId || undefined);
    
    if (!analysisId) {
      return NextResponse.json({ error: 'Failed to save BOQ analysis' }, { status: 500 });
    }
    
    return NextResponse.json({
      analysis: {
        ...analysis,
        id: analysisId
      },
      isUpdate: latestAnalysis !== null
    });
  } catch (error) {
    console.error('Error analyzing BOQ:', error);
    return NextResponse.json({ error: 'An error occurred while analyzing BOQ' }, { status: 500 });
  }
}

/**
 * ดึงข้อมูลการวิเคราะห์ BOQ ล่าสุดตาม documentId
 * GET /api/analysis/document/boq?documentId=xxx
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
    const analysis = await getLatestBOQAnalysis(documentId);
    
    if (!analysis) {
      return NextResponse.json({ error: 'No BOQ analysis found for the given documentId' }, { status: 404 });
    }
    
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error getting BOQ analysis:', error);
    return NextResponse.json({ error: 'An error occurred while getting BOQ analysis' }, { status: 500 });
  }
}
