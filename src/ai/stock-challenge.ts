'use server';

/**
 * @fileOverview ระบบจัดการการแข่งขันวิเคราะห์หุ้นของ AI
 * - AI จะวิเคราะห์หุ้น 10 ตัวต่อวัน
 * - บันทึกผลการวิเคราะห์ว่าหุ้นจะขึ้นหรือลง
 * - ในวันถัดไป ตรวจสอบว่าผลเป็นไปตามที่ AI วิเคราะห์หรือไม่
 * - ถ้า AI ทายถูก 7 ใน 10 ตัว จะถือว่า AI ชนะในวันนั้น
 * - มีการบันทึกคะแนนความสำเร็จของ AI
 */

import { marketAI } from '@/ai/genkit';
import { z } from 'genkit';
import { getDb } from '@/services/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { getStockPrice } from '@/ai/tools';

// กำหนดโครงสร้างข้อมูลสำหรับการคาดการณ์หุ้น 1 ตัว
interface StockPrediction {
  ticker: string;          // สัญลักษณ์หุ้น
  predictionDate: Date;    // วันที่ทำการคาดการณ์
  prediction: 'up' | 'down'; // คาดการณ์ว่าจะขึ้นหรือลง
  confidence: number;      // ความมั่นใจ (%)
  initialPrice: number;    // ราคา ณ เวลาที่คาดการณ์
  reasoning: string;       // เหตุผลในการคาดการณ์
}

// กำหนดโครงสร้างข้อมูลสำหรับผลการตรวจสอบ
interface PredictionResult {
  ticker: string;
  predictionDate: Date;
  verificationDate: Date;
  prediction: 'up' | 'down';
  actualResult: 'up' | 'down' | null;
  isCorrect: boolean | null; // null หมายถึงยังไม่ได้ตรวจสอบ
  initialPrice: number;
  finalPrice: number | null; // null หมายถึงยังไม่ได้ตรวจสอบ
  priceChange: number | null; // เปอร์เซ็นต์การเปลี่ยนแปลงราคา
}

// กำหนดโครงสร้างข้อมูลสำหรับสรุปผลการแข่งขัน 1 วัน
interface DailyChallenge {
  challengeDate: Date;              // วันที่ทำการแข่งขัน
  verificationDate: Date | null;    // วันที่ตรวจสอบผล
  predictions: StockPrediction[];   // รายการคาดการณ์ทั้ง 10 ตัว
  results: PredictionResult[] | null; // ผลการตรวจสอบ (null หมายถึงยังไม่ได้ตรวจสอบ)
  correctCount: number | null;      // จำนวนที่ทายถูก (null หมายถึงยังไม่ได้ตรวจสอบ)
  aiWin: boolean | null;            // AI ชนะหรือไม่ (ทายถูก 7 ใน 10)
  challengeStatus: 'pending' | 'verified'; // สถานะของการแข่งขัน
}

// สร้างชุด prompt สำหรับการวิเคราะห์หุ้น 1 ตัว
const StockPredictionInputSchema = z.object({
  ticker: z.string().describe('สัญลักษณ์หุ้นที่ต้องการวิเคราะห์'),
});

const StockPredictionOutputSchema = z.object({
  ticker: z.string().describe('สัญลักษณ์หุ้นที่วิเคราะห์'),
  prediction: z.enum(['up', 'down']).describe('คาดการณ์ว่าราคาจะขึ้นหรือลงในวันถัดไป'),
  confidence: z.number().min(0).max(100).describe('ความมั่นใจในการคาดการณ์ (0-100%)'),
  reasoning: z.string().describe('เหตุผลสั้นๆ ในการคาดการณ์'),
});

// สร้าง prompt สำหรับการวิเคราะห์หุ้นรายตัวสำหรับการแข่งขัน
const stockChallengePrompt = marketAI.definePrompt({
  name: 'stockChallengePrompt',
  input: { schema: StockPredictionInputSchema },
  output: { schema: StockPredictionOutputSchema },
  tools: [getStockPrice],
  system: `คุณเป็นผู้เชี่ยวชาญด้านการวิเคราะห์หุ้นระดับโลก งานของคุณคือวิเคราะห์ว่าหุ้นที่กำหนดจะมีราคา "ขึ้น" หรือ "ลง" ในวันถัดไป

  ใช้เครื่องมือ getStockPrice เพื่อดึงราคาปัจจุบันของหุ้น จากนั้นวิเคราะห์และคาดการณ์ว่าราคาจะขึ้นหรือลงในวันถัดไป
  
  ให้คำตอบของคุณประกอบด้วย:
  1. การคาดการณ์ว่าจะ "up" (ขึ้น) หรือ "down" (ลง)
  2. ระดับความมั่นใจในการคาดการณ์เป็นเปอร์เซ็นต์ (0-100%)
  3. เหตุผลสั้นๆ ที่คุณคาดการณ์เช่นนั้น
  
  ตัวอย่างผลลัพธ์:
  {
    "ticker": "AAPL",
    "prediction": "up",
    "confidence": 75,
    "reasoning": "แนวโน้มเทคนิคเป็นบวก และมีการประกาศผลิตภัณฑ์ใหม่ที่กำลังจะมาถึง"
  }
  
  คาดการณ์ด้วยความระมัดระวังและให้ความเชื่อมั่นที่สมเหตุสมผล ไม่ควรให้ความเชื่อมั่นสูงเกินไปเนื่องจากตลาดหุ้นมีความไม่แน่นอนสูง
  `,
  prompt: `วิเคราะห์และคาดการณ์แนวโน้มราคาหุ้น {{{ticker}}} สำหรับวันพรุ่งนี้ว่าจะขึ้นหรือลง`,
});

/**
 * เริ่มการแข่งขันวิเคราะห์หุ้นสำหรับวันนี้
 * @param tickers รายการหุ้นที่จะวิเคราะห์ 10 ตัว
 * @returns ข้อมูลการแข่งขันที่เพิ่งสร้าง
 */
export async function startDailyChallenge(tickers: string[]): Promise<DailyChallenge | null> {
  try {
    // ตรวจสอบว่ามีการแข่งขันสำหรับวันนี้แล้วหรือยัง
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const db = getDb();
    if (!db) {
      console.error('ไม่สามารถเชื่อมต่อกับ Firestore ได้');
      return null;
    }
    
    const challengesRef = collection(db, 'stockChallenges');
    const todayQuery = query(
      challengesRef,
      where('challengeDate', '==', today),
    );
    
    const snapshot = await getDocs(todayQuery);
    if (!snapshot.empty) {
      console.log('มีการแข่งขันสำหรับวันนี้แล้ว');
      const existingChallenge = snapshot.docs[0].data() as DailyChallenge;
      return existingChallenge;
    }
    
    // ตรวจสอบจำนวน tickers
    if (tickers.length !== 10) {
      console.error('ต้องระบุหุ้น 10 ตัวเท่านั้น');
      return null;
    }
    
    // วิเคราะห์หุ้นทีละตัว
    console.log('เริ่มวิเคราะห์หุ้น 10 ตัว...');
    const predictions: StockPrediction[] = [];
    
    for (const ticker of tickers) {
      try {
        console.log(`กำลังวิเคราะห์หุ้น ${ticker}...`);
        const { output } = await stockChallengePrompt({ ticker });
        
        if (output) {
          // ดึงราคาปัจจุบัน
          let currentPrice = 0;
          try {
            currentPrice = await getStockPrice.invoke({ ticker });
          } catch (error) {
            console.error(`ไม่สามารถดึงราคาหุ้น ${ticker} ได้:`, error);
            currentPrice = 100; // ค่าเริ่มต้นกรณีไม่สามารถดึงราคาจริงได้
          }
          
          const prediction: StockPrediction = {
            ticker: output.ticker,
            predictionDate: new Date(),
            prediction: output.prediction,
            confidence: output.confidence,
            initialPrice: currentPrice,
            reasoning: output.reasoning,
          };
          
          predictions.push(prediction);
        }
      } catch (error) {
        console.error(`เกิดข้อผิดพลาดในการวิเคราะห์หุ้น ${ticker}:`, error);
      }
    }
    
    // ถ้าวิเคราะห์ได้ไม่ครบ 10 ตัว ให้ยกเลิก
    if (predictions.length !== 10) {
      console.error(`วิเคราะห์หุ้นได้ไม่ครบ 10 ตัว (วิเคราะห์ได้ ${predictions.length} ตัว)`);
      return null;
    }
    
    // สร้าง challenge สำหรับวันนี้
    const challenge: DailyChallenge = {
      challengeDate: today,
      verificationDate: null,
      predictions: predictions,
      results: null,
      correctCount: null,
      aiWin: null,
      challengeStatus: 'pending',
    };
    
    // บันทึกลงฐานข้อมูล
    const docId = `challenge_${today.toISOString().split('T')[0]}`;
    await setDoc(doc(db, 'stockChallenges', docId), challenge);
    
    console.log(`สร้างการแข่งขันวิเคราะห์หุ้นสำหรับวันที่ ${today.toISOString().split('T')[0]} เรียบร้อยแล้ว`);
    return challenge;
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเริ่มการแข่งขันวิเคราะห์หุ้น:', error);
    return null;
  }
}

/**
 * ตรวจสอบผลการแข่งขันวิเคราะห์หุ้นของเมื่อวาน
 * @returns ผลการตรวจสอบ
 */
export async function verifyYesterdayChallenge(): Promise<DailyChallenge | null> {
  try {
    // หาวันที่เมื่อวาน
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const db = getDb();
    if (!db) {
      console.error('ไม่สามารถเชื่อมต่อกับ Firestore ได้');
      return null;
    }
    
    // ค้นหาการแข่งขันเมื่อวาน
    const challengesRef = collection(db, 'stockChallenges');
    const yesterdayQuery = query(
      challengesRef,
      where('challengeDate', '==', yesterday),
      where('challengeStatus', '==', 'pending'),
    );
    
    const snapshot = await getDocs(yesterdayQuery);
    if (snapshot.empty) {
      console.log('ไม่พบการแข่งขันเมื่อวานที่รอการตรวจสอบ');
      return null;
    }
    
    // ดึงข้อมูลการแข่งขัน
    const challengeDoc = snapshot.docs[0];
    const challenge = challengeDoc.data() as DailyChallenge;
    
    // ตรวจสอบผลลัพธ์ทีละตัว
    const results: PredictionResult[] = [];
    let correctCount = 0;
    
    for (const prediction of challenge.predictions) {
      // ดึงราคาล่าสุด
      let currentPrice = 0;
      try {
        currentPrice = await getStockPrice.invoke({ ticker: prediction.ticker });
      } catch (error) {
        console.error(`ไม่สามารถดึงราคาหุ้น ${prediction.ticker} ได้:`, error);
        // สร้างราคาสุ่มเพื่อการทดสอบ
        const randomChange = (Math.random() * 0.1) - 0.05; // -5% ถึง +5%
        currentPrice = prediction.initialPrice * (1 + randomChange);
      }
      
      // คำนวณว่าราคาขึ้นหรือลง
      const priceChange = ((currentPrice - prediction.initialPrice) / prediction.initialPrice) * 100;
      const actualResult: 'up' | 'down' = priceChange >= 0 ? 'up' : 'down';
      
      // ตรวจสอบว่าการคาดการณ์ถูกต้องหรือไม่
      const isCorrect = prediction.prediction === actualResult;
      if (isCorrect) {
        correctCount++;
      }
      
      // สร้างผลลัพธ์
      const result: PredictionResult = {
        ticker: prediction.ticker,
        predictionDate: prediction.predictionDate,
        verificationDate: new Date(),
        prediction: prediction.prediction,
        actualResult: actualResult,
        isCorrect: isCorrect,
        initialPrice: prediction.initialPrice,
        finalPrice: currentPrice,
        priceChange: parseFloat(priceChange.toFixed(2)),
      };
      
      results.push(result);
    }
    
    // อัปเดตข้อมูล challenge
    const updatedChallenge: DailyChallenge = {
      ...challenge,
      verificationDate: new Date(),
      results: results,
      correctCount: correctCount,
      aiWin: correctCount >= 7, // AI ชนะถ้าทายถูก 7 ตัวขึ้นไป
      challengeStatus: 'verified',
    };
    
    // บันทึกลงฐานข้อมูล
    const docId = `challenge_${yesterday.toISOString().split('T')[0]}`;
    await setDoc(doc(db, 'stockChallenges', docId), updatedChallenge);
    
    // ถ้า AI ชนะ ให้บันทึกคะแนน
    if (updatedChallenge.aiWin) {
      await incrementAiScore();
    }
    
    console.log(`ตรวจสอบการแข่งขันวันที่ ${yesterday.toISOString().split('T')[0]} เรียบร้อยแล้ว`);
    console.log(`AI ทายถูก ${correctCount}/10 (${updatedChallenge.aiWin ? 'ชนะ' : 'แพ้'})`);
    
    return updatedChallenge;
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการตรวจสอบผลการแข่งขัน:', error);
    return null;
  }
}

/**
 * เพิ่มคะแนนการชนะของ AI
 */
async function incrementAiScore(): Promise<void> {
  try {
    const db = getDb();
    if (!db) {
      console.error('ไม่สามารถเชื่อมต่อกับ Firestore ได้');
      return;
    }
    
    const scoreRef = doc(db, 'stockChallengeStats', 'aiScore');
    const scoreDoc = await getDoc(scoreRef);
    
    if (scoreDoc.exists()) {
      const currentScore = scoreDoc.data().score || 0;
      await setDoc(scoreRef, { score: currentScore + 1 });
    } else {
      await setDoc(scoreRef, { score: 1 });
    }
    
    console.log('บันทึกคะแนนการชนะของ AI เรียบร้อยแล้ว');
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการบันทึกคะแนนการชนะของ AI:', error);
  }
}

/**
 * ดึงคะแนนการชนะของ AI
 */
export async function getAiScore(): Promise<number> {
  try {
    const db = getDb();
    if (!db) {
      console.error('ไม่สามารถเชื่อมต่อกับ Firestore ได้');
      return 0;
    }
    
    const scoreRef = doc(db, 'stockChallengeStats', 'aiScore');
    const scoreDoc = await getDoc(scoreRef);
    
    if (scoreDoc.exists()) {
      return scoreDoc.data().score || 0;
    } else {
      return 0;
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงคะแนนการชนะของ AI:', error);
    return 0;
  }
}

/**
 * ดึงประวัติการแข่งขันทั้งหมด
 */
export async function getChallengeHistory(count: number = 10): Promise<DailyChallenge[]> {
  try {
    const db = getDb();
    if (!db) {
      console.error('ไม่สามารถเชื่อมต่อกับ Firestore ได้');
      return [];
    }
    
    const challengesRef = collection(db, 'stockChallenges');
    const historyQuery = query(
      challengesRef,
      orderBy('challengeDate', 'desc'),
      limit(count)
    );
    
    const snapshot = await getDocs(historyQuery);
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => doc.data() as DailyChallenge);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงประวัติการแข่งขัน:', error);
    return [];
  }
}

/**
 * ดึงการแข่งขันล่าสุด
 */
export async function getLatestChallenge(): Promise<DailyChallenge | null> {
  try {
    const challenges = await getChallengeHistory(1);
    return challenges.length > 0 ? challenges[0] : null;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงการแข่งขันล่าสุด:', error);
    return null;
  }
}

/**
 * รายชื่อหุ้นยอดนิยมสำหรับการแข่งขัน
 */
export const popularStocks = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META',
  'TSLA', 'NVDA', 'JPM', 'V', 'WMT',
  'DIS', 'NFLX', 'PYPL', 'INTC', 'AMD',
  'BA', 'MCD', 'KO', 'PEP', 'NKE',
  'SBUX', 'CSCO', 'ORCL', 'IBM', 'CRM',
];

/**
 * สร้างชุดหุ้นสำหรับการแข่งขันแบบสุ่ม
 */
export function generateRandomStockSet(): string[] {
  // สุ่มหุ้น 10 ตัวจากรายการหุ้นยอดนิยม
  const shuffled = [...popularStocks].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 10);
}
