import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

/**
 * POST /api/ai/chat
 * AI Chat ด้วย Gemini API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // ตรวจสอบ API Key
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API Key not configured' },
        { status: 500 }
      );
    }

    // สร้าง context สำหรับ AI
    const systemPrompt = `คุณคือ AI Assistant ของระบบ ProjectFlow - ระบบบริหารจัดการโครงการก่อสร้างและงานประมูล

ความสามารถของคุณ:
- ตอบคำถามเกี่ยวกับโครงการก่อสร้าง
- วิเคราะห์งบประมาณและต้นทุน
- แนะนำราคาเสนอที่เหมาะสม
- ประเมินโอกาสชนะการประมูล
- คำนวณกำไรและความเสี่ยง
- แนะนำกลยุทธ์การยื่นข้อเสนอ

ตอบเป็นภาษาไทย สั้น กระชับ เป็นมิตร และให้ข้อมูลที่เป็นประโยชน์`;

    // เรียก Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // สร้าง chat history
    const chatHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    // ส่งข้อความ
    const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${message}`);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      message: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'AI chat failed',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/chat
 * ทดสอบ API
 */
export async function GET() {
  const hasApiKey = !!process.env.GOOGLE_GENAI_API_KEY;
  
  return NextResponse.json({
    status: hasApiKey ? 'ready' : 'not configured',
    message: hasApiKey 
      ? 'Gemini AI Chat is ready to use' 
      : 'Please set GOOGLE_GENAI_API_KEY in .env file',
    model: 'gemini-pro',
  });
}
