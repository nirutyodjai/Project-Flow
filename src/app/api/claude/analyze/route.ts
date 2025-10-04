import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocumentWithClaude, isClaudeAvailable } from '@/lib/claude';

/**
 * POST /api/claude/analyze
 * วิเคราะห์เอกสารด้วย Claude Sonnet 4.5
 */
export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบว่า Claude พร้อมใช้งานหรือไม่
    if (!isClaudeAvailable()) {
      return NextResponse.json(
        { 
          error: 'Claude AI is not configured. Please set ANTHROPIC_API_KEY in .env file',
          available: false 
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { documentText, analysisType = 'general' } = body;

    if (!documentText) {
      return NextResponse.json(
        { error: 'documentText is required' },
        { status: 400 }
      );
    }

    // วิเคราะห์เอกสารด้วย Claude
    const analysis = await analyzeDocumentWithClaude(documentText, analysisType);

    return NextResponse.json({
      success: true,
      analysis,
      model: 'claude-sonnet-4-20250514',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in Claude analysis:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Analysis failed',
        success: false 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/claude/analyze
 * ตรวจสอบสถานะ Claude AI
 */
export async function GET() {
  return NextResponse.json({
    available: isClaudeAvailable(),
    model: 'claude-sonnet-4-20250514',
    status: isClaudeAvailable() ? 'ready' : 'not configured',
  });
}
