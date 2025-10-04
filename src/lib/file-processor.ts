/**
 * File Processor - ประมวลผลไฟล์หลายประเภท
 */

export interface FileProcessResult {
  success: boolean;
  fileName: string;
  fileType: string;
  fileSize: number;
  
  // เนื้อหาที่แยกได้
  text?: string;
  data?: any;
  
  // การวิเคราะห์
  analysis?: {
    type: 'tor' | 'boq' | 'quotation' | 'contract' | 'other';
    confidence: number;
    extractedData?: any;
  };
  
  error?: string;
}

/**
 * ประมวลผลไฟล์ตามประเภท
 */
export async function processFile(
  file: File
): Promise<FileProcessResult> {
  const result: FileProcessResult = {
    success: false,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  };

  try {
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return await processPDF(file);
      
      case 'xlsx':
      case 'xls':
        return await processExcel(file);
      
      case 'docx':
      case 'doc':
        return await processWord(file);
      
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return await processImage(file);
      
      case 'txt':
        return await processText(file);
      
      default:
        result.error = `ไม่รองรับไฟล์ประเภท .${extension}`;
        return result;
    }
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
    return result;
  }
}

/**
 * ประมวลผล PDF
 */
async function processPDF(file: File): Promise<FileProcessResult> {
  // จะใช้ pdf-parse ในฝั่ง server
  return {
    success: true,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    text: 'PDF processing requires server-side API',
    analysis: {
      type: 'other',
      confidence: 0,
    },
  };
}

/**
 * ประมวลผล Excel
 */
async function processExcel(file: File): Promise<FileProcessResult> {
  return {
    success: true,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    text: 'Excel processing requires server-side API',
    analysis: {
      type: 'boq',
      confidence: 0.8,
    },
  };
}

/**
 * ประมวลผล Word
 */
async function processWord(file: File): Promise<FileProcessResult> {
  return {
    success: true,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    text: 'Word processing requires server-side API',
    analysis: {
      type: 'tor',
      confidence: 0.7,
    },
  };
}

/**
 * ประมวลผลรูปภาพ
 */
async function processImage(file: File): Promise<FileProcessResult> {
  return {
    success: true,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    analysis: {
      type: 'other',
      confidence: 0,
    },
  };
}

/**
 * ประมวลผล Text
 */
async function processText(file: File): Promise<FileProcessResult> {
  const text = await file.text();
  
  return {
    success: true,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    text,
    analysis: analyzeText(text),
  };
}

/**
 * วิเคราะห์ข้อความ
 */
function analyzeText(text: string): FileProcessResult['analysis'] {
  const lowerText = text.toLowerCase();
  
  // ตรวจสอบว่าเป็นเอกสารประเภทไหน
  if (lowerText.includes('tor') || lowerText.includes('terms of reference')) {
    return { type: 'tor', confidence: 0.9 };
  }
  
  if (lowerText.includes('boq') || lowerText.includes('bill of quantities')) {
    return { type: 'boq', confidence: 0.9 };
  }
  
  if (lowerText.includes('quotation') || lowerText.includes('ใบเสนอราคา')) {
    return { type: 'quotation', confidence: 0.8 };
  }
  
  if (lowerText.includes('contract') || lowerText.includes('สัญญา')) {
    return { type: 'contract', confidence: 0.8 };
  }
  
  return { type: 'other', confidence: 0.5 };
}

/**
 * แยก BOQ จากข้อความ
 */
export function extractBOQFromText(text: string): any[] {
  const lines = text.split('\n');
  const items: any[] = [];
  
  lines.forEach((line, index) => {
    // ตัวอย่างการแยก BOQ (ควรปรับตามรูปแบบจริง)
    const match = line.match(/^(\d+)\.\s+(.+?)\s+(\d+(?:\.\d+)?)\s+(\S+)/);
    
    if (match) {
      items.push({
        no: match[1],
        description: match[2].trim(),
        quantity: parseFloat(match[3]),
        unit: match[4],
      });
    }
  });
  
  return items;
}
