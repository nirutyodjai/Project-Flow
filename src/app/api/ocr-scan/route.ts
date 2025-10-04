import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // แปลง base64 เป็น buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // ใช้ Gemini Vision model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `วิเคราะห์เอกสารนี้และแยกข้อมูลออกมา:

1. ระบุประเภทเอกสาร (BOQ, TOR, หรืออื่นๆ)
2. ชื่อโครงการ (ถ้ามี)
3. รายการทั้งหมดในเอกสาร (ลำดับ, รายการ, หน่วย, จำนวน, ราคา)
4. ยอดรวมทั้งหมด

กรุณาตอบกลับในรูปแบบ JSON ดังนี้:
{
  "type": "BOQ" | "TOR" | "OTHER",
  "confidence": 0-100,
  "data": {
    "projectName": "ชื่อโครงการ",
    "items": [
      {
        "no": "ลำดับ",
        "description": "รายการ",
        "unit": "หน่วย",
        "qty": จำนวน,
        "price": ราคา
      }
    ],
    "total": ยอดรวม
  }
}

ถ้าไม่พบข้อมูลบางส่วน ให้ใส่ค่าว่างหรือ 0`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    const text = response.text();

    // แปลง JSON response
    let ocrResult;
    try {
      // ลบ markdown code block ถ้ามี
      const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      ocrResult = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse JSON:', text);
      // ถ้า parse ไม่ได้ ให้ส่งข้อมูล default
      ocrResult = {
        type: 'UNKNOWN',
        confidence: 50,
        data: {
          projectName: 'ไม่สามารถระบุได้',
          items: [],
          total: 0,
        },
        rawText: text,
      };
    }

    return NextResponse.json(ocrResult);
  } catch (error) {
    console.error('OCR Error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
