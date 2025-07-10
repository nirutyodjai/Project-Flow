/**
 * API endpoint สำหรับวิเคราะห์แบบแปลน (Drawing)
 */
import { NextResponse } from 'next/server';
import { analyzeDrawing } from '@/ai/document-analysis';
import {
  saveDrawingAnalysis,
  getLatestTORAnalysis
} from '@/services/document-analysis-data';

/**
 * วิเคราะห์แบบแปลน
 * POST /api/analysis/document/drawing
 * 
 * @param request Request object ที่มี drawingContent, documentId, projectId และ torDocumentId (optional)
 */
export async function POST(request: Request) {
  try {
    const { drawingContent, documentId, projectId, torDocumentId } = await request.json();
    
    if (!drawingContent || !documentId || !projectId) {
      return NextResponse.json({ error: 'drawingContent, documentId, and projectId are required' }, { status: 400 });
    }
    
    // ดึงข้อมูล TOR analysis ถ้ามีการระบุ torDocumentId
    let torAnalysis = null;
    
    if (torDocumentId) {
      torAnalysis = await getLatestTORAnalysis(torDocumentId);
    }
    
    // วิเคราะห์แบบแปลน
    const analysis = await analyzeDrawing(drawingContent, torAnalysis || undefined);
    
    // บันทึกผลการวิเคราะห์
    const analysisId = await saveDrawingAnalysis(
      documentId,
      projectId,
      analysis.keyComponents,
      analysis.technicalChallenges,
      analysis.resourceRequirements,
      analysis.timelineEstimate,
      analysis.riskFactors,
      analysis.recommendations,
      analysis.summary
    );
    
    if (!analysisId) {
      return NextResponse.json({ error: 'Failed to save drawing analysis' }, { status: 500 });
    }
    
    return NextResponse.json({
      analysis: {
        ...analysis,
        id: analysisId,
        documentId,
        projectId
      }
    });
  } catch (error) {
    console.error('Error analyzing drawing:', error);
    return NextResponse.json({ error: 'An error occurred while analyzing drawing' }, { status: 500 });
  }
}
