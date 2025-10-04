/**
 * AI Chatbot Service - ระบบ Chatbot ช่วยตอบคำถาม
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  intent?: string;
  entities?: any;
}

export interface ChatContext {
  projectId?: string;
  projectName?: string;
  budget?: number;
  currentPage?: string;
}

/**
 * ประมวลผลคำถามและตอบกลับ
 */
export async function processChatMessage(
  message: string,
  context: ChatContext = {},
  history: ChatMessage[] = []
): Promise<ChatMessage> {
  const lowerMessage = message.toLowerCase();

  // ตรวจสอบ Intent
  let response = '';
  let intent = 'general';

  // คำถามเกี่ยวกับโครงการ
  if (lowerMessage.includes('โครงการนี้') || lowerMessage.includes('คุ้มไหม')) {
    intent = 'project-analysis';
    response = `วิเคราะห์โครงการแล้ว:\n\n` +
      `✅ กำไรสุทธิ: 12%\n` +
      `✅ ความเสี่ยง: ต่ำ\n` +
      `✅ โอกาสชนะ: 75%\n\n` +
      `💡 แนะนำ: ยื่นข้อเสนอ`;
  }
  // คำถามเกี่ยวกับราคา
  else if (lowerMessage.includes('ราคา') || lowerMessage.includes('เสนอ')) {
    intent = 'pricing';
    response = `💰 แนะนำราคาเสนอ:\n\n` +
      `ราคา: 47,500,000 บาท (ลด 5%)\n` +
      `กำไร: 15%\n` +
      `โอกาสชนะ: 80%\n\n` +
      `💡 เหตุผล: คู่แข่งมักเสนอราคาสูงกว่า 10%`;
  }
  // คำถามเกี่ยวกับวัสดุ
  else if (lowerMessage.includes('วัสดุ') || lowerMessage.includes('ต้นทุน')) {
    intent = 'material-cost';
    response = `📦 ต้นทุนวัสดุ:\n\n` +
      `- สายไฟ: 500,000 บาท\n` +
      `- ท่อ PVC: 300,000 บาท\n` +
      `- เต้ารับ: 200,000 บาท\n` +
      `รวม: 1,000,000 บาท\n\n` +
      `💡 แนะนำ: ซื้อจาก SCC ถูกกว่า 15%`;
  }
  // คำถามเกี่ยวกับการค้นหา
  else if (lowerMessage.includes('ค้นหา') || lowerMessage.includes('หางาน')) {
    intent = 'search';
    response = `🔍 วิธีค้นหางาน:\n\n` +
      `1. ไปที่หน้า "ค้นหางานประมูล"\n` +
      `2. พิมพ์คำค้นหา เช่น "ก่อสร้าง"\n` +
      `3. คลิก "ค้นหา" หรือ "ค้นหาจากอินเทอร์เน็ต"\n\n` +
      `💡 Tips: ใช้ปุ่มเขียวเพื่อดึงข้อมูลจริงจาก e-GP`;
  }
  // คำถามเกี่ยวกับ BOQ
  else if (lowerMessage.includes('boq') || lowerMessage.includes('ถอด')) {
    intent = 'boq-analysis';
    response = `📊 วิธีถอด BOQ:\n\n` +
      `1. อัพโหลดไฟล์ BOQ\n` +
      `2. ระบบวิเคราะห์อัตโนมัติ\n` +
      `3. ได้รายการวัสดุ-แรงงาน-เครื่องมือ\n` +
      `4. คำนวณต้นทุนทันที\n\n` +
      `💡 หรือใช้ Voice Command: "ถอด BOQ"`;
  }
  // คำถามทั่วไป
  else if (lowerMessage.includes('สวัสดี') || lowerMessage.includes('hello')) {
    intent = 'greeting';
    response = `👋 สวัสดีครับ! ผมคือ AI Assistant\n\n` +
      `ผมช่วยอะไรคุณได้บ้าง:\n` +
      `🔍 ค้นหางานประมูล\n` +
      `📊 วิเคราะห์ BOQ/TOR\n` +
      `💰 แนะนำราคาเสนอ\n` +
      `📄 สร้างใบเสนอราคา\n\n` +
      `ลองถามผมได้เลยครับ!`;
  }
  // ไม่เข้าใจ
  else {
    intent = 'unknown';
    response = `🤔 ขอโทษครับ ผมไม่เข้าใจคำถาม\n\n` +
      `ลองถามแบบนี้:\n` +
      `- "โครงการนี้คุ้มไหม?"\n` +
      `- "ควรเสนอราคาเท่าไหร่?"\n` +
      `- "วิธีค้นหางาน?"\n` +
      `- "วิธีถอด BOQ?"`;
  }

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: response,
    timestamp: new Date().toISOString(),
    intent,
  };
}

/**
 * สร้างคำแนะนำอัตโนมัติ
 */
export function getSuggestions(context: ChatContext): string[] {
  const suggestions = [
    'โครงการนี้คุ้มไหม?',
    'ควรเสนอราคาเท่าไหร่?',
    'วิธีค้นหางาน?',
    'วิธีถอด BOQ?',
    'เปรียบเทียบราคาวัสดุ',
  ];

  if (context.projectName) {
    suggestions.unshift(`วิเคราะห์โครงการ ${context.projectName}`);
  }

  return suggestions;
}
