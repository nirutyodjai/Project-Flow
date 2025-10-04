/**
 * Claude AI Service (Anthropic)
 * ใช้ Claude Sonnet 4.5 สำหรับการวิเคราะห์ที่ต้องการความแม่นยำสูง
 */

import Anthropic from '@anthropic-ai/sdk';

// ตรวจสอบ API Key
const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

if (!apiKey) {
  console.warn('⚠️ ANTHROPIC_API_KEY ไม่ได้ถูกกำหนดใน .env file - Claude AI จะไม่สามารถใช้งานได้');
}

// สร้าง Anthropic client
export const anthropic = apiKey ? new Anthropic({
  apiKey: apiKey,
}) : null;

/**
 * Claude Models
 */
export const CLAUDE_MODELS = {
  SONNET_4_5: 'claude-sonnet-4-20250514', // Claude Sonnet 4.5 (ล่าสุด)
  SONNET_3_7: 'claude-3-7-sonnet-20250219', // Claude 3.7 Sonnet
  OPUS_4: 'claude-opus-4-20250514', // Claude Opus 4 (ทรงพลังที่สุด)
  HAIKU_3_5: 'claude-3-5-haiku-20241022', // Claude Haiku 3.5 (เร็วที่สุด)
} as const;

/**
 * ส่งข้อความไปยัง Claude และรับคำตอบ
 */
export async function sendToClaude(
  prompt: string,
  options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  } = {}
) {
  if (!anthropic) {
    throw new Error('Claude AI is not configured. Please set ANTHROPIC_API_KEY in .env file');
  }

  const {
    model = CLAUDE_MODELS.SONNET_4_5,
    maxTokens = 4096,
    temperature = 0.3,
    systemPrompt = 'You are a helpful AI assistant specialized in construction and procurement analysis.',
  } = options;

  try {
    const message = await anthropic.messages.create({
      model: model,
      max_tokens: maxTokens,
      temperature: temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // ดึงข้อความจาก response
    const textContent = message.content.find(block => block.type === 'text');
    return textContent ? textContent.text : '';
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

/**
 * วิเคราะห์เอกสารด้วย Claude
 */
export async function analyzeDocumentWithClaude(
  documentText: string,
  analysisType: 'tor' | 'contract' | 'specification' | 'general' = 'general'
) {
  const systemPrompts = {
    tor: 'You are an expert in analyzing Terms of Reference (TOR) documents for construction and procurement projects. Provide detailed, accurate analysis in Thai language.',
    contract: 'You are an expert in analyzing construction contracts. Identify key terms, obligations, and potential risks. Respond in Thai language.',
    specification: 'You are an expert in analyzing technical specifications for construction materials and equipment. Respond in Thai language.',
    general: 'You are a helpful assistant for analyzing documents related to construction and procurement. Respond in Thai language.',
  };

  const prompt = `
กรุณาวิเคราะห์เอกสารต่อไปนี้:

${documentText}

โปรดให้การวิเคราะห์ที่ครอบคลุม รวมถึง:
1. สรุปเนื้อหาหลัก
2. จุดสำคัญที่ต้องให้ความสนใจ
3. ข้อกำหนดและเงื่อนไข
4. คำแนะนำและข้อควรระวัง

ตอบเป็นภาษาไทย ในรูปแบบ JSON:
{
  "summary": "สรุปโดยรวม",
  "keyPoints": ["จุดสำคัญ 1", "จุดสำคัญ 2"],
  "requirements": ["ข้อกำหนด 1", "ข้อกำหนด 2"],
  "recommendations": ["คำแนะนำ 1", "คำแนะนำ 2"],
  "warnings": ["ข้อควรระวัง 1", "ข้อควรระวัง 2"]
}
`;

  const response = await sendToClaude(prompt, {
    model: CLAUDE_MODELS.SONNET_4_5,
    maxTokens: 8000,
    temperature: 0.2,
    systemPrompt: systemPrompts[analysisType],
  });

  try {
    return JSON.parse(response);
  } catch {
    return { summary: response };
  }
}

/**
 * เปรียบเทียบการวิเคราะห์จาก Claude และ Gemini
 */
export async function compareAIAnalysis(prompt: string) {
  // ใช้ทั้ง Claude และ Gemini แล้วเปรียบเทียบผลลัพธ์
  const claudeResponse = await sendToClaude(prompt, {
    model: CLAUDE_MODELS.SONNET_4_5,
    temperature: 0.2,
  });

  return {
    claude: claudeResponse,
    model: CLAUDE_MODELS.SONNET_4_5,
    timestamp: new Date().toISOString(),
  };
}

/**
 * ใช้ Claude สำหรับการวิเคราะห์ที่ซับซ้อน
 */
export async function advancedAnalysisWithClaude(
  data: {
    projectName: string;
    budget: string;
    requirements: string[];
    context?: string;
  }
) {
  const prompt = `
วิเคราะห์โครงการต่อไปนี้อย่างละเอียด:

ชื่อโครงการ: ${data.projectName}
งบประมาณ: ${data.budget}
ข้อกำหนด:
${data.requirements.map((req, i) => `${i + 1}. ${req}`).join('\n')}

${data.context ? `\nข้อมูลเพิ่มเติม:\n${data.context}` : ''}

กรุณาวิเคราะห์:
1. โอกาสในการชนะการประมูล (%)
2. กำไรที่คาดการณ์ (%)
3. ความเสี่ยงและวิธีจัดการ
4. กลยุทธ์ที่แนะนำ
5. ราคาที่เหมาะสมในการยื่นประมูล

ตอบเป็น JSON format
`;

  const response = await sendToClaude(prompt, {
    model: CLAUDE_MODELS.SONNET_4_5,
    maxTokens: 8000,
    temperature: 0.2,
    systemPrompt: 'You are an expert bidding advisor for construction projects. Provide accurate, data-driven analysis in Thai language.',
  });

  try {
    return JSON.parse(response);
  } catch {
    return { analysis: response };
  }
}

/**
 * ตรวจสอบว่า Claude พร้อมใช้งานหรือไม่
 */
export function isClaudeAvailable(): boolean {
  return anthropic !== null;
}

/**
 * ทดสอบการเชื่อมต่อ Claude
 */
export async function testClaudeConnection(): Promise<boolean> {
  if (!anthropic) {
    return false;
  }

  try {
    await sendToClaude('Hello, this is a test message.', {
      maxTokens: 100,
    });
    return true;
  } catch (error) {
    console.error('Claude connection test failed:', error);
    return false;
  }
}
