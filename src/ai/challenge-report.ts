'use server';

/**
 * @fileOverview ระบบสร้างรายงานสรุปผลการแข่งขันวิเคราะห์หุ้นและวิเคราะห์แนวโน้มความแม่นยำของ AI
 */

import { marketAI } from '@/ai/genkit';
import { z } from 'genkit';
import { getDb } from '@/services/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { getChallengeHistory, getAiScore } from './stock-challenge';

// ประเภทข้อมูลสำหรับผลการแข่งขัน
interface DailyChallenge {
  challengeDate: Date | string;
  verificationDate: Date | string | null;
  predictions: {
    ticker: string;
    prediction: 'up' | 'down';
    confidence: number;
    initialPrice: number;
  }[];
  results: {
    ticker: string;
    isCorrect: boolean | null;
    priceChange: number | null;
  }[] | null;
  correctCount: number | null;
  aiWin: boolean | null;
  challengeStatus: 'pending' | 'verified';
}

// ประเภทข้อมูลสำหรับรายงานสรุป
interface ChallengeReport {
  // ข้อมูลทั่วไป
  totalChallenges: number;
  completedChallenges: number;
  aiWins: number;
  aiLosses: number;
  winRate: number;
  
  // แนวโน้มความแม่นยำ
  accuracyTrend: {
    date: string;
    accuracy: number;
    correctCount: number;
  }[];
  
  // หุ้นที่ AI วิเคราะห์แม่นยำที่สุด
  bestPredictedStocks: {
    ticker: string;
    correctCount: number;
    totalPredictions: number;
    accuracy: number;
  }[];
  
  // หุ้นที่ AI วิเคราะห์แม่นยำน้อยที่สุด
  worstPredictedStocks: {
    ticker: string;
    correctCount: number;
    totalPredictions: number;
    accuracy: number;
  }[];
  
  // ความแม่นยำในการวิเคราะห์หุ้นขึ้นและลง
  upDownAccuracy: {
    upPredictions: number;
    correctUpPredictions: number;
    upAccuracy: number;
    downPredictions: number;
    correctDownPredictions: number;
    downAccuracy: number;
  };
  
  // ความสัมพันธ์ระหว่างความมั่นใจและความแม่นยำ
  confidenceAnalysis: {
    confidenceRange: string;
    predictions: number;
    correct: number;
    accuracy: number;
  }[];
  
  // ข้อเสนอแนะในการปรับปรุงความแม่นยำ
  recommendations: string[];
}

// สร้าง Schema สำหรับรายงาน
const ChallengeReportInputSchema = z.object({
  historyDays: z.number().default(30).describe('จำนวนวันย้อนหลังที่ต้องการดึงข้อมูลมาวิเคราะห์'),
  stocksToAnalyze: z.number().default(5).describe('จำนวนหุ้นที่ต้องการวิเคราะห์แยกตามความแม่นยำ')
});

const ChallengeReportOutputSchema = z.object({
  insights: z.string().describe('ข้อมูลเชิงลึกจากการวิเคราะห์ผลการแข่งขัน'),
  recommendations: z.array(z.string()).describe('คำแนะนำในการปรับปรุงความแม่นยำ'),
  trendAnalysis: z.string().describe('การวิเคราะห์แนวโน้มความแม่นยำของ AI'),
  stockSpecificInsights: z.string().describe('ข้อมูลเชิงลึกเกี่ยวกับหุ้นแต่ละตัว'),
});

/**
 * สร้างรายงานสรุปผลการแข่งขันวิเคราะห์หุ้น
 */
export async function generateChallengeReport(historyDays: number = 30, stocksToAnalyze: number = 5): Promise<ChallengeReport> {
  try {
    // ดึงประวัติการแข่งขัน
    const challenges = await getChallengeHistory(historyDays);
    const completedChallenges = challenges.filter(c => c.challengeStatus === 'verified' && c.correctCount !== null);
    
    if (completedChallenges.length === 0) {
      // ถ้ายังไม่มีข้อมูลที่สมบูรณ์ ให้ส่งรายงานเบื้องต้น
      return {
        totalChallenges: challenges.length,
        completedChallenges: 0,
        aiWins: 0,
        aiLosses: 0,
        winRate: 0,
        accuracyTrend: [],
        bestPredictedStocks: [],
        worstPredictedStocks: [],
        upDownAccuracy: {
          upPredictions: 0,
          correctUpPredictions: 0,
          upAccuracy: 0,
          downPredictions: 0,
          correctDownPredictions: 0,
          downAccuracy: 0
        },
        confidenceAnalysis: [],
        recommendations: ['เริ่มตรวจสอบผลการแข่งขันเพื่อสร้างรายงานที่สมบูรณ์']
      };
    }
    
    // ข้อมูลทั่วไป
    const aiWins = completedChallenges.filter(c => c.aiWin === true).length;
    const aiLosses = completedChallenges.filter(c => c.aiWin === false).length;
    const winRate = completedChallenges.length > 0 ? (aiWins / completedChallenges.length) * 100 : 0;
    
    // สร้างแนวโน้มความแม่นยำ
    const accuracyTrend = completedChallenges.map(c => {
      const date = typeof c.challengeDate === 'string' 
        ? c.challengeDate 
        : (c.challengeDate as Date).toISOString().split('T')[0];
      
      return {
        date,
        accuracy: c.correctCount !== null ? (c.correctCount / 10) * 100 : 0,
        correctCount: c.correctCount || 0
      };
    });
    
    // วิเคราะห์หุ้นแต่ละตัว
    const stockPerformance = new Map<string, { correct: number, total: number }>();
    
    // รวบรวมข้อมูลการทำนายหุ้นแต่ละตัว
    completedChallenges.forEach(challenge => {
      if (!challenge.results) return;
      
      challenge.results.forEach(result => {
        const ticker = result.ticker;
        if (!stockPerformance.has(ticker)) {
          stockPerformance.set(ticker, { correct: 0, total: 0 });
        }
        
        const stock = stockPerformance.get(ticker)!;
        stock.total += 1;
        if (result.isCorrect === true) {
          stock.correct += 1;
        }
      });
    });
    
    // แปลงเป็น Array และคำนวณความแม่นยำ
    const stockPerformanceArray = Array.from(stockPerformance.entries()).map(([ticker, data]) => ({
      ticker,
      correctCount: data.correct,
      totalPredictions: data.total,
      accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0
    }));
    
    // เรียงลำดับตามความแม่นยำ
    stockPerformanceArray.sort((a, b) => b.accuracy - a.accuracy);
    
    // หุ้นที่ AI วิเคราะห์แม่นยำที่สุดและน้อยที่สุด
    const bestPredictedStocks = stockPerformanceArray
      .filter(stock => stock.totalPredictions >= 3) // กรองเฉพาะหุ้นที่มีการทำนายมากพอ
      .slice(0, stocksToAnalyze);
      
    const worstPredictedStocks = [...stockPerformanceArray]
      .filter(stock => stock.totalPredictions >= 3)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, stocksToAnalyze);
    
    // วิเคราะห์ความแม่นยำในการทำนายแนวโน้มขึ้นและลง
    let upPredictions = 0;
    let correctUpPredictions = 0;
    let downPredictions = 0;
    let correctDownPredictions = 0;
    
    completedChallenges.forEach(challenge => {
      if (!challenge.predictions || !challenge.results) return;
      
      challenge.predictions.forEach((pred, i) => {
        const result = challenge.results?.[i];
        if (!result || result.isCorrect === null) return;
        
        if (pred.prediction === 'up') {
          upPredictions++;
          if (result.isCorrect) {
            correctUpPredictions++;
          }
        } else {
          downPredictions++;
          if (result.isCorrect) {
            correctDownPredictions++;
          }
        }
      });
    });
    
    const upDownAccuracy = {
      upPredictions,
      correctUpPredictions,
      upAccuracy: upPredictions > 0 ? (correctUpPredictions / upPredictions) * 100 : 0,
      downPredictions,
      correctDownPredictions,
      downAccuracy: downPredictions > 0 ? (correctDownPredictions / downPredictions) * 100 : 0
    };
    
    // วิเคราะห์ความสัมพันธ์ระหว่างความมั่นใจและความแม่นยำ
    const confidenceRanges = [
      { min: 0, max: 50, predictions: 0, correct: 0 },
      { min: 50, max: 70, predictions: 0, correct: 0 },
      { min: 70, max: 85, predictions: 0, correct: 0 },
      { min: 85, max: 100, predictions: 0, correct: 0 }
    ];
    
    completedChallenges.forEach(challenge => {
      if (!challenge.predictions || !challenge.results) return;
      
      challenge.predictions.forEach((pred, i) => {
        const result = challenge.results?.[i];
        if (!result || result.isCorrect === null) return;
        
        const range = confidenceRanges.find(r => pred.confidence > r.min && pred.confidence <= r.max);
        if (range) {
          range.predictions++;
          if (result.isCorrect) {
            range.correct++;
          }
        }
      });
    });
    
    const confidenceAnalysis = confidenceRanges.map(range => ({
      confidenceRange: `${range.min}%-${range.max}%`,
      predictions: range.predictions,
      correct: range.correct,
      accuracy: range.predictions > 0 ? (range.correct / range.predictions) * 100 : 0
    }));
    
    // สร้างคำแนะนำในการปรับปรุงความแม่นยำ
    const recommendations = [];
    
    // คำแนะนำเกี่ยวกับความมั่นใจและความแม่นยำ
    const bestConfidenceRange = [...confidenceAnalysis].sort((a, b) => b.accuracy - a.accuracy)[0];
    if (bestConfidenceRange && bestConfidenceRange.predictions > 5) {
      recommendations.push(
        `AI มีความแม่นยำสูงสุด (${bestConfidenceRange.accuracy.toFixed(1)}%) ในช่วงความมั่นใจ ${bestConfidenceRange.confidenceRange} ควรให้น้ำหนักกับการคาดการณ์ในช่วงนี้มากขึ้น`
      );
    }
    
    // คำแนะนำเกี่ยวกับแนวโน้มขึ้นหรือลง
    if (upDownAccuracy.upAccuracy > upDownAccuracy.downAccuracy + 15) {
      recommendations.push(
        `AI คาดการณ์แนวโน้มขึ้นได้แม่นยำมากกว่า (${upDownAccuracy.upAccuracy.toFixed(1)}% vs ${upDownAccuracy.downAccuracy.toFixed(1)}%) ควรให้น้ำหนักกับคำแนะนำซื้อมากกว่า`
      );
    } else if (upDownAccuracy.downAccuracy > upDownAccuracy.upAccuracy + 15) {
      recommendations.push(
        `AI คาดการณ์แนวโน้มลงได้แม่นยำมากกว่า (${upDownAccuracy.downAccuracy.toFixed(1)}% vs ${upDownAccuracy.upAccuracy.toFixed(1)}%) ควรให้น้ำหนักกับคำแนะนำขายมากกว่า`
      );
    }
    
    // คำแนะนำเกี่ยวกับหุ้นที่วิเคราะห์แม่นยำที่สุด
    if (bestPredictedStocks.length > 0 && bestPredictedStocks[0].accuracy > 70) {
      const bestStocks = bestPredictedStocks
        .filter(stock => stock.accuracy > 70)
        .map(stock => `${stock.ticker} (${stock.accuracy.toFixed(1)}%)`)
        .join(', ');
      
      recommendations.push(
        `AI มีความแม่นยำสูงในการวิเคราะห์หุ้น ${bestStocks} ควรให้ความสำคัญกับคำแนะนำสำหรับหุ้นเหล่านี้`
      );
    }
    
    // คำแนะนำเกี่ยวกับหุ้นที่วิเคราะห์แม่นยำน้อยที่สุด
    if (worstPredictedStocks.length > 0 && worstPredictedStocks[0].accuracy < 40) {
      const worstStocks = worstPredictedStocks
        .filter(stock => stock.accuracy < 40)
        .map(stock => `${stock.ticker} (${stock.accuracy.toFixed(1)}%)`)
        .join(', ');
      
      recommendations.push(
        `AI มีความแม่นยำต่ำในการวิเคราะห์หุ้น ${worstStocks} ควรระมัดระวังในการใช้คำแนะนำสำหรับหุ้นเหล่านี้`
      );
    }
    
    // คำแนะนำเกี่ยวกับแนวโน้มความแม่นยำ
    if (accuracyTrend.length >= 7) {
      const recentTrend = accuracyTrend.slice(-7);
      const improvingAccuracy = recentTrend.every((item, i, arr) => 
        i === 0 || item.accuracy >= arr[i-1].accuracy
      );
      
      const decliningAccuracy = recentTrend.every((item, i, arr) => 
        i === 0 || item.accuracy <= arr[i-1].accuracy
      );
      
      if (improvingAccuracy) {
        recommendations.push(
          'ความแม่นยำของ AI มีแนวโน้มเพิ่มขึ้นในช่วง 7 วันที่ผ่านมา แสดงให้เห็นว่าโมเดลอาจกำลังเรียนรู้และปรับตัวดีขึ้น'
        );
      } else if (decliningAccuracy) {
        recommendations.push(
          'ความแม่นยำของ AI มีแนวโน้มลดลงในช่วง 7 วันที่ผ่านมา อาจต้องตรวจสอบและปรับปรุงโมเดล หรืออาจมีปัจจัยภายนอกที่ทำให้ตลาดคาดเดายากขึ้น'
        );
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push('ยังไม่มีคำแนะนำเฉพาะเนื่องจากข้อมูลยังไม่เพียงพอ ควรเก็บข้อมูลเพิ่มเติม');
    }
    
    return {
      totalChallenges: challenges.length,
      completedChallenges: completedChallenges.length,
      aiWins,
      aiLosses,
      winRate,
      accuracyTrend,
      bestPredictedStocks,
      worstPredictedStocks,
      upDownAccuracy,
      confidenceAnalysis,
      recommendations
    };
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการสร้างรายงาน:', error);
    throw new Error('ไม่สามารถสร้างรายงานได้');
  }
}

/**
 * วิเคราะห์รายงานผลการแข่งขันด้วย AI
 */
export async function analyzeReportWithAI(report: ChallengeReport): Promise<{
  insights: string;
  recommendations: string[];
  trendAnalysis: string;
  stockSpecificInsights: string;
}> {
  try {
    // กำหนด prompt สำหรับการวิเคราะห์รายงาน
    const challengeReportAnalysisPrompt = marketAI.definePrompt({
      name: 'challengeReportAnalysisPrompt',
      input: { schema: ChallengeReportInputSchema },
      output: { schema: ChallengeReportOutputSchema },
      system: `คุณเป็นผู้เชี่ยวชาญด้านการวิเคราะห์ผลการลงทุนและความแม่นยำของโมเดล AI ในการวิเคราะห์ตลาดหุ้น
      
      งานของคุณคือวิเคราะห์รายงานสรุปผลการแข่งขันวิเคราะห์หุ้นของ AI เพื่อหาข้อมูลเชิงลึกและให้คำแนะนำที่เป็นประโยชน์
      
      ให้ความเห็นเกี่ยวกับ:
      1. ความแม่นยำโดยรวมและแนวโน้มของ AI
      2. จุดแข็งและจุดอ่อนในการวิเคราะห์
      3. คำแนะนำในการปรับปรุงความแม่นยำ
      4. ข้อมูลเชิงลึกเฉพาะเจาะจงเกี่ยวกับหุ้นแต่ละตัว
      
      ตอบเป็นภาษาไทย ใช้ภาษาที่เข้าใจง่ายและมีข้อมูลเชิงลึกที่เป็นประโยชน์สำหรับผู้ลงทุน
      `,
      prompt: `วิเคราะห์รายงานสรุปผลการแข่งขันวิเคราะห์หุ้นต่อไปนี้:
      
      ข้อมูลทั่วไป:
      - จำนวนการแข่งขันทั้งหมด: {{totalChallenges}}
      - จำนวนการแข่งขันที่ตรวจสอบแล้ว: {{completedChallenges}}
      - จำนวนครั้งที่ AI ชนะ: {{aiWins}}
      - จำนวนครั้งที่ AI แพ้: {{aiLosses}}
      - อัตราชนะ: {{winRate}}%
      
      แนวโน้มความแม่นยำ:
      {{#each accuracyTrend}}
      - วันที่ {{date}}: {{accuracy}}% (ถูกต้อง {{correctCount}}/10)
      {{/each}}
      
      หุ้นที่ AI วิเคราะห์แม่นยำที่สุด:
      {{#each bestPredictedStocks}}
      - {{ticker}}: {{accuracy}}% (ถูกต้อง {{correctCount}}/{{totalPredictions}})
      {{/each}}
      
      หุ้นที่ AI วิเคราะห์แม่นยำน้อยที่สุด:
      {{#each worstPredictedStocks}}
      - {{ticker}}: {{accuracy}}% (ถูกต้อง {{correctCount}}/{{totalPredictions}})
      {{/each}}
      
      ความแม่นยำในการวิเคราะห์หุ้นขึ้นและลง:
      - แนวโน้มขึ้น: {{upDownAccuracy.upAccuracy}}% (ถูกต้อง {{upDownAccuracy.correctUpPredictions}}/{{upDownAccuracy.upPredictions}})
      - แนวโน้มลง: {{upDownAccuracy.downAccuracy}}% (ถูกต้อง {{upDownAccuracy.correctDownPredictions}}/{{upDownAccuracy.downPredictions}})
      
      ความสัมพันธ์ระหว่างความมั่นใจและความแม่นยำ:
      {{#each confidenceAnalysis}}
      - ความมั่นใจ {{confidenceRange}}: {{accuracy}}% (ถูกต้อง {{correct}}/{{predictions}})
      {{/each}}
      `,
    });

    // เตรียมข้อมูลสำหรับ prompt
    const promptInput = {
      historyDays: report.accuracyTrend.length,
      stocksToAnalyze: report.bestPredictedStocks.length,
      ...report
    };

    // เรียกใช้ prompt
    const { output } = await challengeReportAnalysisPrompt(promptInput);

    return output || {
      insights: "ไม่สามารถวิเคราะห์รายงานได้",
      recommendations: ["ควรตรวจสอบข้อมูลและลองอีกครั้ง"],
      trendAnalysis: "ไม่สามารถวิเคราะห์แนวโน้มได้",
      stockSpecificInsights: "ไม่สามารถวิเคราะห์หุ้นรายตัวได้"
    };
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการวิเคราะห์รายงานด้วย AI:', error);
    return {
      insights: "เกิดข้อผิดพลาดในการวิเคราะห์รายงาน",
      recommendations: ["ควรตรวจสอบระบบและลองอีกครั้ง"],
      trendAnalysis: "ไม่สามารถวิเคราะห์แนวโน้มได้เนื่องจากเกิดข้อผิดพลาด",
      stockSpecificInsights: "ไม่สามารถวิเคราะห์หุ้นรายตัวได้เนื่องจากเกิดข้อผิดพลาด"
    };
  }
}

/**
 * ดึงรายงานสรุปและวิเคราะห์ด้วย AI
 */
export async function getFullAnalysisReport(days: number = 30): Promise<{
  report: ChallengeReport;
  analysis: {
    insights: string;
    recommendations: string[];
    trendAnalysis: string;
    stockSpecificInsights: string;
  }
}> {
  try {
    // สร้างรายงานสรุป
    const report = await generateChallengeReport(days);
    
    // ถ้ายังไม่มีข้อมูลเพียงพอ ให้ส่งเฉพาะรายงาน
    if (report.completedChallenges < 3) {
      return {
        report,
        analysis: {
          insights: "ยังมีข้อมูลไม่เพียงพอสำหรับการวิเคราะห์เชิงลึก กรุณาสะสมข้อมูลเพิ่มเติมอย่างน้อย 3 วัน",
          recommendations: ["เก็บข้อมูลเพิ่มเติมอย่างน้อย 3 วัน"],
          trendAnalysis: "ยังไม่สามารถวิเคราะห์แนวโน้มได้เนื่องจากข้อมูลไม่เพียงพอ",
          stockSpecificInsights: "ยังไม่สามารถวิเคราะห์หุ้นรายตัวได้เนื่องจากข้อมูลไม่เพียงพอ"
        }
      };
    }
    
    // วิเคราะห์รายงานด้วย AI
    const analysis = await analyzeReportWithAI(report);
    
    return {
      report,
      analysis
    };
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการสร้างรายงานและวิเคราะห์:', error);
    throw new Error('ไม่สามารถสร้างรายงานและวิเคราะห์ได้');
  }
}
