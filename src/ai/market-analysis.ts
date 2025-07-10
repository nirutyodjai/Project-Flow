/**
 * @fileOverview AI สำหรับวิเคราะห์ตลาดหุ้น
 * ไฟล์นี้สร้างเพื่อใช้ในการวิเคราะห์ข้อมูลตลาดหุ้น สภาพเศรษฐกิจ 
 * และให้คำแนะนำเกี่ยวกับการลงทุน
 * มีการเก็บผลการวิเคราะห์ลงฐานข้อมูลเพื่อใช้เป็นข้อมูลอ้างอิงในอนาคต
 */

import { z } from 'genkit';
import { marketAI } from './genkit';
import { saveAnalysisData, getAnalysisData, findMarketAnalysesByKeywords } from '@/services/analysis-data';

// กำหนดโครงสร้างข้อมูลหุ้น
const StockDataSchema = z.object({
  symbol: z.string().describe('ชื่อย่อหุ้น (Ticker symbol)'),
  name: z.string().describe('ชื่อเต็มของบริษัท'),
  price: z.number().describe('ราคาปัจจุบัน'),
  priceChange: z.number().describe('การเปลี่ยนแปลงของราคา'),
  percentChange: z.number().describe('เปอร์เซ็นต์การเปลี่ยนแปลง'),
  volume: z.number().describe('ปริมาณการซื้อขาย'),
  marketCap: z.number().optional().describe('มูลค่าตลาด'),
  peRatio: z.number().optional().describe('อัตราส่วนราคาต่อกำไร (P/E Ratio)'),
  sector: z.string().optional().describe('กลุ่มธุรกิจ'),
  industry: z.string().optional().describe('อุตสาหกรรม'),
});

// กำหนดโครงสร้างข้อมูลข่าวตลาดหุ้น
const MarketNewsSchema = z.object({
  title: z.string().describe('หัวข้อข่าว'),
  source: z.string().describe('แหล่งที่มาของข่าว'),
  date: z.string().describe('วันที่เผยแพร่'),
  content: z.string().describe('เนื้อหาข่าว'),
  url: z.string().optional().describe('URL ของข่าว'),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional().describe('ความรู้สึกของข่าว'),
});

// กำหนดโครงสร้างข้อมูลเศรษฐกิจ
const EconomicDataSchema = z.object({
  indicator: z.string().describe('ชื่อตัวชี้วัดเศรษฐกิจ'),
  value: z.number().describe('ค่าปัจจุบัน'),
  previousValue: z.number().optional().describe('ค่าก่อนหน้า'),
  change: z.number().optional().describe('การเปลี่ยนแปลง'),
  date: z.string().describe('วันที่ของข้อมูล'),
});

// กำหนดโครงสร้างผลการวิเคราะห์หุ้น
const StockAnalysisSchema = z.object({
  symbol: z.string().describe('ชื่อย่อหุ้น'),
  name: z.string().describe('ชื่อบริษัท'),
  currentPrice: z.number().describe('ราคาปัจจุบัน'),
  targetPrice: z.number().describe('ราคาเป้าหมาย'),
  potentialReturn: z.number().describe('ผลตอบแทนที่อาจเกิดขึ้น (%)'),
  recommendation: z.enum(['ซื้อ', 'ถือ', 'ขาย']).describe('คำแนะนำการลงทุน'),
  riskLevel: z.enum(['ต่ำ', 'ปานกลาง', 'สูง']).describe('ระดับความเสี่ยง'),
  timeHorizon: z.string().describe('กรอบเวลาการลงทุนที่เหมาะสม'),
  fundamentalAnalysis: z.string().describe('การวิเคราะห์ปัจจัยพื้นฐาน'),
  technicalAnalysis: z.string().describe('การวิเคราะห์ทางเทคนิค'),
  catalysts: z.array(z.string()).describe('ปัจจัยที่อาจส่งผลต่อราคาในอนาคต'),
  risks: z.array(z.string()).describe('ความเสี่ยงที่ควรระวัง'),
});

// กำหนดโครงสร้างผลการวิเคราะห์ตลาด
const MarketAnalysisSchema = z.object({
  marketSentiment: z.enum(['Bullish', 'Neutral', 'Bearish']).describe('ภาพรวมความรู้สึกของตลาด'),
  trendStrength: z.number().min(1).max(10).describe('ความแข็งแกร่งของเทรนด์ (1-10)'),
  keyIndicators: z.array(z.object({
    name: z.string().describe('ชื่อตัวชี้วัด'),
    value: z.number().describe('ค่าปัจจุบัน'),
    interpretation: z.string().describe('การตีความ'),
  })).describe('ตัวชี้วัดสำคัญ'),
  sectorOutlook: z.array(z.object({
    sector: z.string().describe('กลุ่มธุรกิจ'),
    outlook: z.enum(['Positive', 'Neutral', 'Negative']).describe('แนวโน้ม'),
    comment: z.string().describe('ความเห็น'),
  })).describe('แนวโน้มรายกลุ่มธุรกิจ'),
  marketSummary: z.string().describe('สรุปภาพรวมตลาด'),
  shortTermOutlook: z.string().describe('แนวโน้มระยะสั้น'),
  mediumTermOutlook: z.string().describe('แนวโน้มระยะกลาง'),
});

// สร้าง AI Flow สำหรับวิเคราะห์หุ้นรายตัว
export const analyzeStock = marketAI.defineFlow(
  {
    name: 'analyzeStock',
    inputSchema: z.object({
      symbol: z.string().describe('ชื่อย่อหุ้น (Ticker symbol)'),
      includeNews: z.boolean().optional().describe('รวมข่าวล่าสุดในการวิเคราะห์หรือไม่'),
      includeTechnical: z.boolean().optional().describe('รวมการวิเคราะห์ทางเทคนิคหรือไม่'),
      timeframe: z.enum(['short', 'medium', 'long']).optional().describe('กรอบเวลาการลงทุน (ค่าเริ่มต้น: medium)'),
    }),
    outputSchema: StockAnalysisSchema,
  },
  async (input) => {
    // Step 1: ดึงข้อมูลหุ้นปัจจุบันและการวิเคราะห์ที่ผ่านมา
    console.log(`กำลังวิเคราะห์หุ้น ${input.symbol}...`);
    
    try {
      // ดึงข้อมูลการวิเคราะห์ล่าสุด (ถ้ามี)
      const previousAnalyses = await getAnalysisData('stock', { symbol: input.symbol }, 1);
      const previousAnalysis = previousAnalyses.length > 0 ? previousAnalyses[0].data : null;
      
      console.log(`พบการวิเคราะห์ก่อนหน้า: ${previousAnalysis ? 'มี' : 'ไม่มี'}`);
      
      // ดึงข่าวที่เกี่ยวข้อง (ถ้ามี)
      let newsImpact = [];
      if (input.includeNews) {
        // ในที่นี้ใช้ข้อมูลสมมติ (ในการใช้งานจริงควรดึงจาก API)
        newsImpact = [
          {
            news: `${input.symbol} ประกาศผลประกอบการไตรมาสล่าสุดเติบโต 15% เหนือคาดการณ์ของนักวิเคราะห์`,
            sentiment: 'positive',
            potentialImpact: 'ราคาหุ้นอาจปรับตัวขึ้นในระยะสั้น'
          },
          {
            news: `${input.symbol} เตรียมเปิดตัวผลิตภัณฑ์ใหม่ในเดือนหน้า`,
            sentiment: 'positive',
            potentialImpact: 'อาจเพิ่มยอดขายและส่วนแบ่งตลาด'
          }
        ];
      }
      
      // ใช้ข้อมูลเดิม (ถ้ามี) เพื่อปรับปรุงการวิเคราะห์
      const stockData = {
        symbol: input.symbol,
        name: previousAnalysis ? previousAnalysis.name : `${input.symbol} Corporation`,
        currentPrice: 150 + Math.random() * 50,
        targetPrice: 180 + Math.random() * 50,
      };

      const potentialReturn = ((stockData.targetPrice - stockData.currentPrice) / stockData.currentPrice) * 100;
      
      // ปรับปรุงเป้าหมายราคาโดยพิจารณาการวิเคราะห์ก่อนหน้า
      if (previousAnalysis) {
        // ปรับเป้าหมายราคาโดยใช้ข้อมูลเก่าและใหม่
        stockData.targetPrice = (previousAnalysis.targetPrice * 0.7) + (stockData.targetPrice * 0.3);
        console.log(`ปรับเป้าหมายราคาตามข้อมูลเดิม: ${stockData.targetPrice}`);
      }
      
      // กำหนดคำแนะนำตามผลตอบแทนที่คาดหวัง
      let recommendation: 'ซื้อ' | 'ถือ' | 'ขาย';
      if (potentialReturn > 15) {
        recommendation = 'ซื้อ';
      } else if (potentialReturn > 0) {
        recommendation = 'ถือ';
      } else {
        recommendation = 'ขาย';
      }
      
      // สร้างการวิเคราะห์ปัจจัยพื้นฐานและทางเทคนิค
      const fundamentalAnalysis = `${stockData.name} แสดงผลประกอบการที่แข็งแกร่ง โดยมีการเติบโตของรายได้อย่างต่อเนื่อง อัตรากำไรขั้นต้นอยู่ที่ระดับน่าพอใจที่ 45% สูงกว่าค่าเฉลี่ยของอุตสาหกรรมที่ 38% บริษัทมีกระแสเงินสดอิสระที่แข็งแกร่งและมีการจ่ายเงินปันผลอย่างสม่ำเสมอ${
        previousAnalysis ? ' ซึ่งแนวโน้มนี้สอดคล้องกับการวิเคราะห์ก่อนหน้า' : ''
      }`;
      
      const technicalAnalysis = input.includeTechnical 
        ? `ในระยะสั้น ราคาหุ้นกำลังอยู่เหนือเส้นค่าเฉลี่ยเคลื่อนที่ 50 วัน และ 200 วัน ซึ่งเป็นสัญญาณเชิงบวก ตัวชี้วัด RSI อยู่ที่ระดับ 65 ซึ่งยังไม่ถือว่าอยู่ในเขต overbought แม้จะเริ่มมีสัญญาณความร้อนแรง${
            previousAnalysis && previousAnalysis.technicalAnalysis ? ' การเปรียบเทียบกับการวิเคราะห์ก่อนหน้าพบว่าแนวโน้มเชิงเทคนิคยังคงไปในทิศทางเดียวกัน' : ''
          }`
        : 'ไม่รวมการวิเคราะห์ทางเทคนิค';
      
      // รวบรวมปัจจัยที่อาจส่งผลและความเสี่ยง
      const catalysts = [
        'การเปิดตัวผลิตภัณฑ์ใหม่ในไตรมาสถัดไป',
        'การขยายตลาดไปยังภูมิภาคเอเชียตะวันออกเฉียงใต้',
        'แนวโน้มการเติบโตของอุตสาหกรรมที่แข็งแกร่ง',
      ];
      
      const risks = [
        'การแข่งขันที่เพิ่มขึ้นจากคู่แข่งรายใหญ่',
        'ความไม่แน่นอนของเศรษฐกิจโลก',
        'การเปลี่ยนแปลงกฎระเบียบในตลาดหลัก',
      ];
      
      // กำหนดระดับความเสี่ยงและกรอบเวลาการลงทุน
      let riskLevel: 'ต่ำ' | 'ปานกลาง' | 'สูง';
      if (potentialReturn > 20) {
        riskLevel = 'สูง';
      } else if (potentialReturn > 10) {
        riskLevel = 'ปานกลาง';
      } else {
        riskLevel = 'ต่ำ';
      }
      
      // กำหนดกรอบเวลาตาม input หรือค่าเริ่มต้น
      const timeframe = input.timeframe || 'medium';
      const timeHorizon = timeframe === 'short' ? '3-6 เดือน' : 
                           timeframe === 'medium' ? '1-2 ปี' : '3-5 ปี';
      
      // สร้างผลการวิเคราะห์
      const result = {
        symbol: stockData.symbol,
        name: stockData.name,
        currentPrice: stockData.currentPrice,
        targetPrice: stockData.targetPrice,
        potentialReturn,
        recommendation,
        riskLevel,
        timeHorizon,
        fundamentalAnalysis,
        technicalAnalysis,
        catalysts,
        risks,
      };
      
      // บันทึกผลการวิเคราะห์ลงฐานข้อมูล
      const keywords = [
        input.symbol,
        recommendation,
        riskLevel,
        ...catalysts.slice(0, 2).map(c => c.split(' ')[0]), // ใช้คำแรกของ catalysts
        ...risks.slice(0, 2).map(r => r.split(' ')[0]), // ใช้คำแรกของ risks
      ];
      
      await saveAnalysisData('stock', result, keywords);
      console.log(`บันทึกผลการวิเคราะห์หุ้น ${input.symbol} เรียบร้อย`);
      
      return result;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการวิเคราะห์หุ้น:', error);
      throw new Error(`ไม่สามารถวิเคราะห์หุ้น ${input.symbol} ได้`);
    }
  }
);

// สร้าง AI Flow สำหรับวิเคราะห์ตลาด
export const analyzeMarket = marketAI.defineFlow(
  {
    name: 'analyzeMarket',
    inputSchema: z.object({
      market: z.string().describe('ชื่อตลาดหลักทรัพย์ (เช่น SET, NASDAQ, NYSE)'),
      includeEconomicData: z.boolean().optional().describe('รวมข้อมูลเศรษฐกิจในการวิเคราะห์หรือไม่'),
      includeSectorAnalysis: z.boolean().optional().describe('รวมการวิเคราะห์รายกลุ่มธุรกิจหรือไม่'),
    }),
    outputSchema: MarketAnalysisSchema,
  },
  async (input) => {
    console.log(`กำลังวิเคราะห์ตลาด ${input.market}...`);
    
    try {
      // ดึงข้อมูลการวิเคราะห์ล่าสุด (ถ้ามี)
      const previousAnalyses = await getAnalysisData('market', { market: input.market }, 1);
      const previousAnalysis = previousAnalyses.length > 0 ? previousAnalyses[0].data : null;
      
      console.log(`พบการวิเคราะห์ก่อนหน้า: ${previousAnalysis ? 'มี' : 'ไม่มี'}`);
      
      // สร้างตัวชี้วัดสำคัญ
      const keyIndicators = [
        {
          name: 'ดัชนีตลาด',
          value: 1500 + Math.random() * 500,
          interpretation: 'ดัชนีปรับตัวเพิ่มขึ้น 2.3% ในเดือนที่ผ่านมา แสดงถึงความเชื่อมั่นที่เพิ่มขึ้น',
        },
        {
          name: 'มูลค่าการซื้อขายเฉลี่ย',
          value: 65000 + Math.random() * 15000,
          interpretation: 'สภาพคล่องอยู่ในระดับปานกลาง แสดงถึงความสนใจในการลงทุนที่คงที่',
        },
        {
          name: 'อัตราส่วน P/E ตลาด',
          value: 15 + Math.random() * 10,
          interpretation: 'อัตราส่วนราคาต่อกำไรของตลาดอยู่ในระดับที่สมเหตุสมผลเมื่อเทียบกับค่าเฉลี่ยในอดีต',
        },
      ];
      
      // ใช้ข้อมูลเดิม (ถ้ามี) เพื่อเปรียบเทียบและปรับปรุงการวิเคราะห์
      if (previousAnalysis && previousAnalysis.keyIndicators) {
        for (let i = 0; i < Math.min(keyIndicators.length, previousAnalysis.keyIndicators.length); i++) {
          const currentIndicator = keyIndicators[i];
          const prevIndicator = previousAnalysis.keyIndicators[i];
          
          if (currentIndicator.name === prevIndicator.name) {
            const change = ((currentIndicator.value - prevIndicator.value) / prevIndicator.value) * 100;
            const direction = change > 0 ? 'เพิ่มขึ้น' : 'ลดลง';
            
            currentIndicator.interpretation += ` เมื่อเทียบกับการวิเคราะห์ครั้งก่อน พบว่า${direction} ${Math.abs(change).toFixed(2)}%`;
          }
        }
      }
      
      // สร้างแนวโน้มรายกลุ่มธุรกิจ
      const sectorOutlook = input.includeSectorAnalysis 
        ? [
            {
              sector: 'เทคโนโลยี',
              outlook: 'Positive' as const,
              comment: 'การเติบโตของ AI และ Cloud Computing ช่วยขับเคลื่อนกลุ่มนี้',
            },
            {
              sector: 'พลังงาน',
              outlook: 'Neutral' as const,
              comment: 'ราคาน้ำมันที่ผันผวนอาจส่งผลกระทบต่อกำไร แต่อุปสงค์ยังคงแข็งแกร่ง',
            },
            {
              sector: 'ธนาคาร',
              outlook: 'Positive' as const,
              comment: 'อัตราดอกเบี้ยที่สูงขึ้นช่วยเพิ่มรายได้ดอกเบี้ยสุทธิ',
            },
            {
              sector: 'ค้าปลีก',
              outlook: 'Negative' as const,
              comment: 'กำลังซื้อผู้บริโภคที่ลดลงอาจกดดันผลประกอบการ',
            },
          ] 
        : [];
      
      // ปรับปรุงการวิเคราะห์รายกลุ่มธุรกิจด้วยข้อมูลเดิม (ถ้ามี)
      if (previousAnalysis && previousAnalysis.sectorOutlook && input.includeSectorAnalysis) {
        for (let i = 0; i < Math.min(sectorOutlook.length, previousAnalysis.sectorOutlook.length); i++) {
          const currentSector = sectorOutlook[i];
          const prevSector = previousAnalysis.sectorOutlook[i];
          
          if (currentSector.sector === prevSector.sector && currentSector.outlook !== prevSector.outlook) {
            currentSector.comment += ` แนวโน้มเปลี่ยนจาก ${prevSector.outlook} เป็น ${currentSector.outlook} เนื่องจากการเปลี่ยนแปลงสภาพตลาด`;
          }
        }
      }
      
      // กำหนดความรู้สึกของตลาดและความแข็งแกร่งของเทรนด์
      let marketSentiment: 'Bullish' | 'Neutral' | 'Bearish';
      
      // ถ้ามีการวิเคราะห์ก่อนหน้า ให้พิจารณาข้อมูลเดิมร่วมด้วย
      if (previousAnalysis && previousAnalysis.marketSentiment) {
        // ตัดสินใจว่าจะยังคงหรือเปลี่ยนแนวโน้ม โดยมีโอกาส 70% ที่จะคงเดิม
        const keepPreviousSentiment = Math.random() < 0.7;
        
        if (keepPreviousSentiment) {
          marketSentiment = previousAnalysis.marketSentiment;
          console.log(`คงแนวโน้มเดิม: ${marketSentiment}`);
        } else {
          // เปลี่ยนแนวโน้ม
          const randomFactor = Math.random();
          if (randomFactor > 0.6) {
            marketSentiment = 'Bullish';
          } else if (randomFactor > 0.3) {
            marketSentiment = 'Neutral';
          } else {
            marketSentiment = 'Bearish';
          }
          console.log(`เปลี่ยนแนวโน้มเป็น: ${marketSentiment}`);
        }
      } else {
        // ถ้าไม่มีข้อมูลเดิม ให้สุ่มตามปกติ
        const randomFactor = Math.random();
        if (randomFactor > 0.6) {
          marketSentiment = 'Bullish';
        } else if (randomFactor > 0.3) {
          marketSentiment = 'Neutral';
        } else {
          marketSentiment = 'Bearish';
        }
      }
      
      // กำหนดความแข็งแกร่งของเทรนด์
      let trendStrength: number;
      
      if (previousAnalysis && typeof previousAnalysis.trendStrength === 'number') {
        // ปรับความแข็งแกร่งของเทรนด์จากข้อมูลเดิม
        const change = Math.random() > 0.5 ? 1 : -1;
        trendStrength = Math.min(10, Math.max(1, previousAnalysis.trendStrength + change));
      } else {
        // ถ้าไม่มีข้อมูลเดิม ให้สุ่มตามปกติ
        trendStrength = Math.floor(Math.random() * 6) + 4; // 4-9
      }
      
      // สร้างข้อความสรุปและแนวโน้ม
      let marketSummary, shortTermOutlook, mediumTermOutlook;
      
      if (marketSentiment === 'Bullish') {
        marketSummary = `ตลาด ${input.market} แสดงแนวโน้มเชิงบวกอย่างต่อเนื่อง โดยดัชนีสามารถทำจุดสูงสุดใหม่ได้ในช่วงที่ผ่านมา สภาพคล่องตลาดปรับตัวเพิ่มขึ้นอย่างมีนัยสำคัญ นักลงทุนสถาบันยังคงเพิ่มสัดส่วนการลงทุนในตลาด สะท้อนถึงความเชื่อมั่นที่ยังอยู่ในระดับสูง`;
        shortTermOutlook = 'ในระยะสั้น ตลาดมีแนวโน้มเชิงบวกต่อเนื่อง อย่างไรก็ตาม อาจมีการพักฐานในช่วงสั้นๆ เนื่องจากดัชนีปรับตัวขึ้นค่อนข้างเร็ว นักลงทุนควรใช้จังหวะนี้ในการทยอยสะสมหุ้นในกลุ่มที่มีแนวโน้มการเติบโตสูง';
        mediumTermOutlook = 'แนวโน้มระยะกลางยังคงเป็นบวก โดยได้รับแรงสนับสนุนจากการฟื้นตัวของเศรษฐกิจและนโยบายการเงินที่ยังผ่อนคลาย นักลงทุนควรพิจารณาหุ้นในกลุ่มเทคโนโลยีและการเงินซึ่งคาดว่าจะมีผลประกอบการที่ดี';
      } else if (marketSentiment === 'Neutral') {
        marketSummary = `ตลาด ${input.market} เคลื่อนไหวในกรอบแคบในช่วงที่ผ่านมา สะท้อนถึงความไม่แน่นอนและการรอประเมินสถานการณ์ของนักลงทุน ปริมาณการซื้อขายอยู่ในระดับปานกลาง แสดงถึงการขาดปัจจัยใหม่ที่จะกระตุ้นตลาด`;
        shortTermOutlook = 'แนวโน้มระยะสั้นคาดว่าตลาดจะยังคงเคลื่อนไหวในกรอบ นักลงทุนควรระมัดระวังและเลือกลงทุนในหุ้นที่มีปัจจัยพื้นฐานแข็งแกร่ง รวมถึงอาจพิจารณาใช้กลยุทธ์ทำกำไรในกรอบ';
        mediumTermOutlook = 'ในระยะกลาง ตลาดมีโอกาสปรับตัวขึ้นได้หากปัจจัยเศรษฐกิจเป็นไปในทิศทางที่ดีขึ้น อย่างไรก็ตาม นักลงทุนควรติดตามตัวเลขเศรษฐกิจและผลประกอบการของบริษัทจดทะเบียนอย่างใกล้ชิด';
      } else {
        marketSummary = `ตลาด ${input.market} ปรับตัวลดลงอย่างต่อเนื่อง สะท้อนถึงความกังวลของนักลงทุนต่อแนวโน้มเศรษฐกิจที่ชะลอตัวและความเสี่ยงด้านนโยบายการเงิน ดัชนีหลุดเส้นแนวรับสำคัญหลายระดับ ส่งผลให้มีแรงขายทำกำไรเพิ่มขึ้น`;
        shortTermOutlook = 'แนวโน้มระยะสั้นยังมีความเสี่ยงขาลงต่อเนื่อง นักลงทุนควรชะลอการลงทุนเพิ่มและอาจพิจารณาลดสัดส่วนการลงทุนในหุ้นกลุ่มที่มีความผันผวนสูง';
        mediumTermOutlook = 'ในระยะกลาง ตลาดอาจมีโอกาสฟื้นตัวหากนโยบายการเงินเริ่มผ่อนคลายลง อย่างไรก็ตาม นักลงทุนควรรอดูสัญญาณการฟื้นตัวที่ชัดเจนก่อนเพิ่มสัดส่วนการลงทุน';
      }
      
      // ถ้ามีการวิเคราะห์ก่อนหน้าและแนวโน้มเปลี่ยน ให้เพิ่มการเปรียบเทียบ
      if (previousAnalysis && previousAnalysis.marketSentiment !== marketSentiment) {
        marketSummary += ` เมื่อเทียบกับการวิเคราะห์ครั้งก่อนที่มีแนวโน้ม${previousAnalysis.marketSentiment} พบว่าสถานการณ์ตลาดมีการเปลี่ยนแปลงอย่างมีนัยสำคัญ`;
      }
      
      // สร้างผลการวิเคราะห์
      const result = {
        marketSentiment,
        trendStrength,
        keyIndicators,
        sectorOutlook,
        marketSummary,
        shortTermOutlook,
        mediumTermOutlook,
      };
      
      // บันทึกผลการวิเคราะห์ลงฐานข้อมูล
      const keywords = [
        input.market,
        marketSentiment,
        ...sectorOutlook.slice(0, 3).map(s => s.sector),
        shortTermOutlook.split(' ').slice(0, 3).join(' '), // คำสำคัญจากแนวโน้มระยะสั้น
      ];
      
      await saveAnalysisData('market', result, keywords);
      console.log(`บันทึกผลการวิเคราะห์ตลาด ${input.market} เรียบร้อย`);
      
      return result;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการวิเคราะห์ตลาด:', error);
      throw new Error(`ไม่สามารถวิเคราะห์ตลาด ${input.market} ได้`);
    }
  }
);

// สร้าง AI Function สำหรับสรุปข่าวและประเมินผลกระทบต่อหุ้นหรือตลาด
export const analyzeFinancialNews = marketAI.defineFlow(
  {
    name: 'analyzeFinancialNews',
    inputSchema: z.object({
      news: z.string().describe('ข่าวการเงินหรือเศรษฐกิจ'),
      symbol: z.string().optional().describe('ชื่อย่อหุ้นที่เกี่ยวข้อง (ถ้ามี)'),
      markets: z.array(z.string()).optional().describe('ตลาดที่เกี่ยวข้อง (ถ้ามี)'),
      includeRelatedStocks: z.boolean().optional().describe('วิเคราะห์หุ้นที่เกี่ยวข้องด้วยหรือไม่'),
    }),
    outputSchema: z.object({
      summary: z.string().describe('สรุปข่าว'),
      sentiment: z.enum(['positive', 'neutral', 'negative']).describe('ความรู้สึกของข่าว'),
      impactLevel: z.number().min(1).max(10).describe('ระดับผลกระทบ (1-10)'),
      stocksAffected: z.array(z.object({
        symbol: z.string(),
        impact: z.enum(['positive', 'neutral', 'negative']),
        reason: z.string(),
      })).describe('หุ้นที่ได้รับผลกระทบ'),
      marketImpact: z.array(z.object({
        market: z.string(),
        impact: z.enum(['positive', 'neutral', 'negative']),
        description: z.string(),
      })).optional().describe('ผลกระทบต่อตลาด'),
      tradingIdeas: z.array(z.string()).describe('แนวคิดการลงทุนจากข่าวนี้'),
      recommendation: z.string().describe('คำแนะนำสำหรับนักลงทุน'),
      relatedNews: z.array(z.string()).optional().describe('ข่าวอื่นๆ ที่เกี่ยวข้อง'),
      keywords: z.array(z.string()).describe('คำสำคัญจากข่าว'),
      analysisDate: z.string().describe('วันที่วิเคราะห์')
    }),
  },
  async (input) => {
    console.log(`กำลังวิเคราะห์ข่าวการเงิน${input.symbol ? ` เกี่ยวกับ ${input.symbol}` : ''}...`);
    
    try {
      // หาข่าวที่วิเคราะห์ไปแล้วที่คล้ายกัน (ถ้ามี) เพื่อใช้เป็นข้อมูลอ้างอิง
      const newsKeywords = extractKeywordsFromNews(input.news);
      const previousAnalyses = await findMarketAnalysesByKeywords(newsKeywords, 'news', 1);
      const previousAnalysis = previousAnalyses.length > 0 ? previousAnalyses[0].data : null;
      
      // ในการใช้งานจริง จะใช้ AI วิเคราะห์ข่าวและประเมินผลกระทบ
      // ตัวอย่างการวิเคราะห์เบื้องต้น
      const keywords = {
        positive: ['เติบโต', 'กำไร', 'ขยาย', 'สูงกว่าคาด', 'ดีกว่าคาด', 'ฟื้นตัว', 'เพิ่มขึ้น'],
        negative: ['ขาดทุน', 'ลดลง', 'ล้มละลาย', 'ปิดกิจการ', 'ต่ำกว่าคาด', 'ผิดนัด', 'ถดถอย', 'เสี่ยง'],
      };
      
      // ตรวจสอบความรู้สึกของข่าวโดยนับคำสำคัญ
      const positiveCount = keywords.positive.reduce((count, word) => 
        count + (input.news.toLowerCase().includes(word.toLowerCase()) ? 1 : 0), 0
      );
      
      const negativeCount = keywords.negative.reduce((count, word) => 
        count + (input.news.toLowerCase().includes(word.toLowerCase()) ? 1 : 0), 0
      );
      
      // กำหนดความรู้สึกของข่าว
      let sentiment: 'positive' | 'neutral' | 'negative';
      if (positiveCount > negativeCount) {
        sentiment = 'positive';
      } else if (negativeCount > positiveCount) {
        sentiment = 'negative';
      } else {
        sentiment = 'neutral';
      }
      
      // กำหนดระดับผลกระทบ
      const impactLevel = Math.min(10, Math.max(1, 5 + (positiveCount - negativeCount)));
      
      // สร้างหุ้นที่ได้รับผลกระทบ
      const stocksAffected = [];
      if (input.symbol) {
        stocksAffected.push({
          symbol: input.symbol,
          impact: sentiment,
          reason: sentiment === 'positive'
            ? 'ข่าวมีนัยเชิงบวกต่อการดำเนินธุรกิจและผลประกอบการ'
            : sentiment === 'negative'
            ? 'ข่าวอาจส่งผลเชิงลบต่อการดำเนินธุรกิจหรือความเชื่อมั่น'
            : 'ข่าวไม่น่าจะมีผลกระทบอย่างมีนัยสำคัญ',
        });
      }
      
      // ถ้าต้องการวิเคราะห์หุ้นที่เกี่ยวข้องด้วย
      if (input.includeRelatedStocks) {
        // ตัวอย่างหุ้นที่เกี่ยวข้อง (ในงานจริงควรใช้ AI หรือฐานข้อมูลเพื่อหาหุ้นที่เกี่ยวข้อง)
        const relatedStocks = input.symbol 
          ? [`${input.symbol}-RELATED1`, `${input.symbol}-RELATED2`]
          : ['SECTOR-LEADER1', 'SECTOR-LEADER2'];
        
        // เพิ่มหุ้นที่เกี่ยวข้องเข้าไปในผลกระทบ
        relatedStocks.forEach(stock => {
          stocksAffected.push({
            symbol: stock,
            impact: sentiment, // ใช้ความรู้สึกเดียวกับข่าวหลัก (ในงานจริงควรวิเคราะห์แยก)
            reason: `เป็นบริษัทที่เกี่ยวข้องกับ ${input.symbol || 'เหตุการณ์ในข่าว'} และอาจได้รับผลกระทบในทิศทางเดียวกัน`,
          });
        });
      }
      
      // วิเคราะห์ผลกระทบต่อตลาด (ถ้ามีการระบุตลาดที่เกี่ยวข้อง)
      let marketImpact = undefined;
      if (input.markets && input.markets.length > 0) {
        marketImpact = input.markets.map(market => ({
          market,
          impact: sentiment as any, // ใช้ความรู้สึกเดียวกันกับข่าวหลัก (ในงานจริงควรวิเคราะห์แยก)
          description: `ข่าวนี้อาจ${sentiment === 'positive' ? 'ส่งผลดี' : sentiment === 'negative' ? 'ส่งผลเสีย' : 'ไม่ส่งผลกระทบมาก'}ต่อภาพรวมของตลาด ${market}`,
        }));
      }
      
      // แนวคิดการลงทุนจากข่าวนี้
      const tradingIdeas = [];
      if (sentiment === 'positive') {
        tradingIdeas.push(
          'พิจารณาเพิ่มน้ำหนักการลงทุนในหุ้นที่ได้ประโยชน์จากเหตุการณ์ในข่าว',
          'มองหาโอกาสในการเข้าซื้อหุ้นที่มีปัจจัยพื้นฐานดีที่เกี่ยวข้องกับข่าวนี้'
        );
      } else if (sentiment === 'negative') {
        tradingIdeas.push(
          'พิจารณาลดน้ำหนักการลงทุนในหุ้นที่ได้รับผลกระทบเชิงลบจากข่าวนี้',
          'เพิ่มความระมัดระวังและอาจชะลอการลงทุนเพิ่มจนกว่าสถานการณ์จะชัดเจนขึ้น'
        );
      } else {
        tradingIdeas.push(
          'ติดตามพัฒนาการอย่างใกล้ชิด แต่ยังไม่จำเป็นต้องเปลี่ยนแปลงกลยุทธ์การลงทุน',
          'เตรียมแผนรับมือทั้งในกรณีที่สถานการณ์พัฒนาในทางที่ดีขึ้นหรือแย่ลง'
        );
      }
      
      // สร้างคำแนะนำ
      let recommendation;
      if (sentiment === 'positive') {
        recommendation = input.symbol
          ? `นักลงทุนอาจพิจารณาเพิ่มน้ำหนักการลงทุนใน ${input.symbol} เนื่องจากมีปัจจัยบวกที่อาจส่งผลดีต่อราคาหุ้นในระยะสั้น`
          : 'นักลงทุนควรติดตามพัฒนาการเชิงบวกนี้และอาจพิจารณาเพิ่มน้ำหนักการลงทุนในหุ้นที่เกี่ยวข้อง';
      } else if (sentiment === 'negative') {
        recommendation = input.symbol
          ? `นักลงทุนควรระมัดระวังหรือพิจารณาลดน้ำหนักการลงทุนใน ${input.symbol} จนกว่าสถานการณ์จะมีความชัดเจนมากขึ้น`
          : 'นักลงทุนควรระมัดระวังและอาจพิจารณาลดความเสี่ยงในพอร์ตการลงทุนชั่วคราว';
      } else {
        recommendation = 'นักลงทุนควรติดตามพัฒนาการอย่างใกล้ชิด แต่ยังไม่จำเป็นต้องปรับเปลี่ยนกลยุทธ์การลงทุนในขณะนี้';
      }
      
      // สรุปข่าว
      const summary = input.news.length > 200 
        ? input.news.substring(0, 197) + '...' 
        : input.news;
      
      // คำสำคัญจากข่าว
      let extractedKeywords = newsKeywords;
      
      // เพิ่ม symbol ถ้ามี
      if (input.symbol) {
        extractedKeywords.push(input.symbol);
      }
      
      // เพิ่ม markets ถ้ามี
      if (input.markets) {
        extractedKeywords = [...extractedKeywords, ...input.markets];
      }
      
      // วันที่วิเคราะห์
      const analysisDate = new Date().toISOString();
      
      // สร้างผลการวิเคราะห์
      const result = {
        summary,
        sentiment,
        impactLevel,
        stocksAffected,
        marketImpact,
        tradingIdeas,
        recommendation,
        relatedNews: previousAnalysis ? [previousAnalysis.summary] : undefined,
        keywords: extractedKeywords,
        analysisDate
      };
      
      // บันทึกผลการวิเคราะห์ลงฐานข้อมูล
      await saveAnalysisData('news', result, extractedKeywords);
      console.log(`บันทึกผลการวิเคราะห์ข่าวเรียบร้อย`);
      
      return result;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการวิเคราะห์ข่าว:', error);
      throw new Error(`ไม่สามารถวิเคราะห์ข่าวการเงินได้`);
    }
  }
);

/**
 * ฟังก์ชันช่วยสกัดคำสำคัญจากเนื้อหาข่าว
 */
function extractKeywordsFromNews(news: string): string[] {
  // ในการใช้งานจริง ควรใช้ AI สกัดคำสำคัญ
  // ตัวอย่างง่ายๆ โดยการแยกคำและกรองเฉพาะคำที่มีความยาว > 4
  const words = news
    .replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s]/g, '') // กรองเฉพาะตัวอักษรไทย อังกฤษ ตัวเลข และช่องว่าง
    .split(/\s+/) // แยกคำด้วยช่องว่าง
    .filter(word => word.length > 4) // กรองเฉพาะคำที่มีความยาวมากกว่า 4
    .map(word => word.toLowerCase()); // แปลงเป็นตัวพิมพ์เล็ก
  
  // กำจัดคำซ้ำและจำกัดจำนวน
  const uniqueWords = [...new Set(words)];
  return uniqueWords.slice(0, 10); // จำกัดจำนวนคำสำคัญไม่เกิน 10 คำ
}
