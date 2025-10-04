/**
 * Voice Recognition Service - ระบบรับเสียงและแปลงเป็นข้อความ
 */

export interface VoiceRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface VoiceCommand {
  transcript: string;
  confidence: number;
  timestamp: string;
  intent?: 'create-quotation' | 'search-project' | 'analyze-boq' | 'calculate-cost' | 'other';
  entities?: {
    projectName?: string;
    budget?: number;
    materials?: string[];
    quantities?: number[];
  };
}

/**
 * เริ่มการรับเสียง
 */
export class VoiceRecognitionService {
  private recognition: any;
  private isListening: boolean = false;
  private onResultCallback?: (result: VoiceCommand) => void;
  private onErrorCallback?: (error: string) => void;

  constructor(options: VoiceRecognitionOptions = {}) {
    if (typeof window === 'undefined') return;

    // ตรวจสอบว่า browser รองรับหรือไม่
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = options.language || 'th-TH';
    this.recognition.continuous = options.continuous || false;
    this.recognition.interimResults = options.interimResults || false;
    this.recognition.maxAlternatives = options.maxAlternatives || 1;

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      const voiceCommand: VoiceCommand = {
        transcript,
        confidence,
        timestamp: new Date().toISOString(),
        ...this.parseIntent(transcript),
      };

      this.onResultCallback?.(voiceCommand);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.onErrorCallback?.(event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  /**
   * แปลงคำพูดเป็น Intent และ Entities
   */
  private parseIntent(transcript: string): Partial<VoiceCommand> {
    const lowerText = transcript.toLowerCase();
    const result: Partial<VoiceCommand> = { entities: {} };

    // ตรวจสอบ Intent
    if (
      lowerText.includes('สร้างใบเสนอราคา') ||
      lowerText.includes('ทำใบเสนอราคา') ||
      lowerText.includes('ใบเสนอราคา')
    ) {
      result.intent = 'create-quotation';
    } else if (lowerText.includes('ค้นหา') || lowerText.includes('หางาน')) {
      result.intent = 'search-project';
    } else if (lowerText.includes('วิเคราะห์') || lowerText.includes('ถอด')) {
      result.intent = 'analyze-boq';
    } else if (lowerText.includes('คำนวณ') || lowerText.includes('ต้นทุน')) {
      result.intent = 'calculate-cost';
    } else {
      result.intent = 'other';
    }

    // แยก Entities
    // ชื่อโครงการ
    const projectMatch = transcript.match(/โครงการ(.+?)(?:งบประมาณ|ราคา|$)/i);
    if (projectMatch) {
      result.entities!.projectName = projectMatch[1].trim();
    }

    // งบประมาณ
    const budgetMatch = transcript.match(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:บาท|ล้าน|million)/i);
    if (budgetMatch) {
      let budget = parseFloat(budgetMatch[1].replace(/,/g, ''));
      if (transcript.includes('ล้าน') || transcript.includes('million')) {
        budget *= 1000000;
      }
      result.entities!.budget = budget;
    }

    // วัสดุ
    const materials: string[] = [];
    const materialKeywords = ['สายไฟ', 'ท่อ', 'เต้ารับ', 'สวิตช์', 'คอนกรีต', 'เหล็ก', 'อิฐ', 'ปูน'];
    materialKeywords.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        materials.push(keyword);
      }
    });
    if (materials.length > 0) {
      result.entities!.materials = materials;
    }

    return result;
  }

  /**
   * เริ่มฟัง
   */
  start(
    onResult: (result: VoiceCommand) => void,
    onError?: (error: string) => void
  ) {
    if (!this.recognition) {
      onError?.('Speech Recognition not supported');
      return;
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.isListening = true;
    this.recognition.start();
  }

  /**
   * หยุดฟัง
   */
  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * ตรวจสอบว่ากำลังฟังอยู่หรือไม่
   */
  getIsListening(): boolean {
    return this.isListening;
  }
}

/**
 * ตรวจสอบว่า browser รองรับหรือไม่
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
}

/**
 * แปลง Voice Command เป็น Quotation Data
 */
export function voiceCommandToQuotation(command: VoiceCommand): any {
  const { entities } = command;

  return {
    projectName: entities?.projectName || 'โครงการจากเสียง',
    budget: entities?.budget || 0,
    materials: entities?.materials || [],
    quantities: entities?.quantities || [],
    createdBy: 'voice',
    createdAt: command.timestamp,
    transcript: command.transcript,
  };
}
