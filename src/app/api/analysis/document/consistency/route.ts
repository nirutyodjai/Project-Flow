/**
 * API endpoint สำหรับวิเคราะห์ความสอดคล้องระหว่าง TOR และ BOQ และสร้างรายงานสรุป
 */
import { NextResponse } from 'next/server';
import {
  analyzeTORBOQConsistency,
  generateProjectAnalysisSummary
} from '@/ai/document-analysis';
import {
  saveConsistencyAnalysis,
  getLatestTORAnalysis,
  getLatestBOQAnalysis,
  saveProjectAnalysisSummary,
  getConsistencyAnalysis
} from '@/services/document-analysis-data';

/**
 * วิเคราะห์ความสอดคล้องระหว่าง TOR และ BOQ
 * POST /api/analysis/document/consistency
 * 
 * @param request Request object ที่มี torAnalysisId, boqAnalysisId และ projectId
 */
export async function POST(request: Request) {
  try {
    const { torAnalysisId, boqAnalysisId, projectId } = await request.json();
    
    if (!torAnalysisId || !boqAnalysisId || !projectId) {
      return NextResponse.json({ error: 'torAnalysisId, boqAnalysisId, and projectId are required' }, { status: 400 });
    }
    
    // ดึงข้อมูลการวิเคราะห์ TOR และ BOQ
    const torAnalysis = await getLatestTORAnalysis(torAnalysisId);
    const boqAnalysis = await getLatestBOQAnalysis(boqAnalysisId);
    
    if (!torAnalysis || !boqAnalysis) {
      return NextResponse.json({ error: 'TOR analysis or BOQ analysis not found' }, { status: 404 });
    }
    
    // วิเคราะห์ความสอดคล้อง
    const consistencyAnalysis = await analyzeTORBOQConsistency(torAnalysis, boqAnalysis);
    
    // บันทึกผลการวิเคราะห์
    const analysisId = await saveConsistencyAnalysis(
      projectId,
      torAnalysisId,
      boqAnalysisId,
      consistencyAnalysis.consistencyScore,
      consistencyAnalysis.inconsistencies,
      consistencyAnalysis.recommendations,
      consistencyAnalysis.summary
    );
    
    if (!analysisId) {
      return NextResponse.json({ error: 'Failed to save consistency analysis' }, { status: 500 });
    }
    
    return NextResponse.json({
      analysis: {
        ...consistencyAnalysis,
        id: analysisId,
        torAnalysisId,
        boqAnalysisId,
        projectId
      }
    });
  } catch (error) {
    console.error('Error analyzing consistency:', error);
    return NextResponse.json({ error: 'An error occurred while analyzing consistency' }, { status: 500 });
  }
}

/**
 * สร้างรายงานสรุปการวิเคราะห์โครงการ
 * POST /api/analysis/document/summary
 * 
 * @param request Request object ที่มี projectId, projectName, torAnalysisId, boqAnalysisId และ drawingAnalysisId (optional)
 */
export async function PUT(request: Request) {
  try {
    const { projectId, projectName, torAnalysisId, boqAnalysisId, consistencyAnalysisId, drawingAnalysisId } = await request.json();
    
    if (!projectId || !projectName || !torAnalysisId) {
      return NextResponse.json({ error: 'projectId, projectName, and torAnalysisId are required' }, { status: 400 });
    }
    
    // ดึงข้อมูลการวิเคราะห์ TOR
    const torAnalysis = await getLatestTORAnalysis(torAnalysisId);
    
    if (!torAnalysis) {
      return NextResponse.json({ error: 'TOR analysis not found' }, { status: 404 });
    }
    
    // ดึงข้อมูลการวิเคราะห์ BOQ ถ้ามี
    let boqAnalysis = null;
    if (boqAnalysisId) {
      boqAnalysis = await getLatestBOQAnalysis(boqAnalysisId);
    }
    
    // ดึงข้อมูลการวิเคราะห์ความสอดคล้อง ถ้ามี
    let consistencyAnalysis = null;
    if (consistencyAnalysisId && boqAnalysisId) {
      consistencyAnalysis = await getConsistencyAnalysis(torAnalysisId, boqAnalysisId);
    }
    
    // ดึงข้อมูลการวิเคราะห์แบบแปลน ถ้ามี
    let drawingAnalysis = null;
    if (drawingAnalysisId) {
      drawingAnalysis = await getDrawingAnalysis(drawingAnalysisId);
    }
    
    // สร้างรายงานสรุป
    const summary = await generateProjectAnalysisSummary(
      projectName,
      torAnalysis,
      boqAnalysis || undefined,
      consistencyAnalysis || undefined,
      drawingAnalysis || undefined
    );
    
    // บันทึกรายงานสรุป
    const saved = await saveProjectAnalysisSummary(
      projectId,
      projectName,
      summary,
      {
        torAnalysisIds: [torAnalysisId],
        boqAnalysisIds: boqAnalysisId ? [boqAnalysisId] : [],
        consistencyAnalysisIds: consistencyAnalysisId ? [consistencyAnalysisId] : [],
        drawingAnalysisIds: drawingAnalysisId ? [drawingAnalysisId] : []
      }
    );
    
    if (!saved) {
      return NextResponse.json({ error: 'Failed to save project analysis summary' }, { status: 500 });
    }
    
    return NextResponse.json({
      summary,
      projectId,
      projectName
    });
  } catch (error) {
    console.error('Error generating project analysis summary:', error);
    return NextResponse.json({ error: 'An error occurred while generating project analysis summary' }, { status: 500 });
  }
}
