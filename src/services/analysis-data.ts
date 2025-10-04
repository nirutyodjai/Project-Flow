/**
 * @fileOverview บริการจัดการข้อมูลการวิเคราะห์โครงการและตลาดหุ้น
 * ไฟล์นี้รับผิดชอบการจัดเก็บและดึงข้อมูลการวิเคราะห์โครงการและตลาดหุ้นที่ AI ได้วิเคราะห์แล้ว
 * เพื่อใช้เป็นฐานข้อมูลในการวิเคราะห์ครั้งต่อไป
 */
// ลบ 'use server' เพราะมี functions ที่ไม่ใช่ async

import { getDb } from './firebase';
import { doc, setDoc, getDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { z } from 'zod';
import { FinalAnalysisOutputSchema, MaterialSpecificationSchema } from '@/ai/flows/summarize-document-flow';

/**
 * ประเภทข้อมูลสำหรับการวิเคราะห์โครงการ
 */
export interface ProjectAnalysisData {
  projectId: string;
  projectName: string;
  organizationType: string | null;
  winProbability: number;
  estimatedProfit: number;
  analysisText: string;
  reasonForWinning: string;
  recommendedBidPrice: string;
  queryKeywords: string[];
  analysisTimestamp: Date;

  // ข้อมูลเพิ่มเติมที่ AI อาจวิเคราะห์
  competitorInfo?: {
    competitors: string[];
    overallThreat: number;
  };
  projectFitScore?: number;
  successFactors?: string[];
  riskFactors?: string[];
}

/**
 * บันทึกข้อมูลการวิเคราะห์โครงการลงในฐานข้อมูล
 */
export async function saveProjectAnalysis(analysis: ProjectAnalysisData): Promise<boolean> {
  try {
    const db = getDb();
    if (!db) {
      console.warn('Firestore not initialized');
      return false;
    }

    const analysisWithTimestamp = {
      ...analysis,
      analysisTimestamp: new Date(),
    };

    // สร้าง ID จากโครงการและเวลาวิเคราะห์
    const analysisId = `${analysis.projectId}_${new Date().getTime()}`;

    // บันทึกข้อมูลลงใน collection 'projectAnalyses'
    await setDoc(doc(db, 'projectAnalyses', analysisId), analysisWithTimestamp);
    console.log(`Saved analysis for project ${analysis.projectName} with ID: ${analysisId}`);
    return true;
  } catch (error) {
    console.error('Error saving project analysis:', error);
    return false;
  }
}

/**
 * ดึงข้อมูลการวิเคราะห์โครงการล่าสุดตาม projectId
 */
export async function getLatestProjectAnalysis(projectId: string): Promise<ProjectAnalysisData | null> {
  try {
    const db = getDb();
    if (!db) {
      console.warn('Firestore not initialized');
      return null;
    }

    const projectAnalysesCol = collection(db, 'projectAnalyses');
    const q = query(
      projectAnalysesCol,
      where('projectId', '==', projectId),
      orderBy('analysisTimestamp', 'desc')
    );

    const analysisSnapshot = await getDocs(q);

    if (analysisSnapshot.empty) {
      console.log(`No analysis found for project ${projectId}`);
      return null;
    }

    const analysisData = analysisSnapshot.docs[0].data() as ProjectAnalysisData;
    console.log(`Retrieved latest analysis for project ${projectId}`);
    return analysisData;
  } catch (error) {
    console.error('Error getting project analysis:', error);
    return null;
  }
}

/**
 * ค้นหาการวิเคราะห์โครงการที่มีคีย์เวิร์ดที่เกี่ยวข้อง
 * สำหรับใช้เป็นข้อมูลในการช่วยวิเคราะห์โครงการใหม่ที่มีลักษณะคล้ายคลึงกัน
 */
export async function findRelatedAnalyses(keywords: string[], limit = 5): Promise<ProjectAnalysisData[]> {
  try {
    const db = getDb();
    if (!db) {
      console.warn('Firestore not initialized');
      return [];
    }

    const projectAnalysesCol = collection(db, 'projectAnalyses');
    const analysisSnapshot = await getDocs(projectAnalysesCol);

    if (analysisSnapshot.empty) {
      return [];
    }

    // ดึงการวิเคราะห์ทั้งหมดและกรองตามคีย์เวิร์ด
    const allAnalyses = analysisSnapshot.docs.map(doc => doc.data() as ProjectAnalysisData);

    // คำนวณคะแนนความเกี่ยวข้องกับคีย์เวิร์ดที่ให้มา
    const scoredAnalyses = allAnalyses.map(analysis => {
      // ตรวจสอบคีย์เวิร์ดที่ตรงกัน
      const matchedKeywords = keywords.filter(keyword =>
        analysis.queryKeywords.some(k => k.includes(keyword) || keyword.includes(k))
      );

      // คำนวณคะแนนความเกี่ยวข้อง
      const relevanceScore = matchedKeywords.length / keywords.length;

      return {
        analysis,
        relevanceScore
      };
    });

    // เรียงลำดับตามคะแนนความเกี่ยวข้องจากมากไปน้อย
    scoredAnalyses.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // ดึงเฉพาะการวิเคราะห์ที่มีคะแนนมากกว่า 0 และจำกัดจำนวนตามที่กำหนด
    const relatedAnalyses = scoredAnalyses
      .filter(item => item.relevanceScore > 0)
      .slice(0, limit)
      .map(item => item.analysis);

    console.log(`Found ${relatedAnalyses.length} related analyses for keywords: ${keywords.join(', ')}`);
    return relatedAnalyses;
  } catch (error) {
    console.error('Error finding related analyses:', error);
    return [];
  }
}

/**
 * ดึงข้อมูลสถิติของโครงการที่มีลักษณะคล้ายกัน
 * เพื่อใช้ในการวิเคราะห์โอกาสชนะและกำไรที่คาดการณ์
 */
export async function getProjectStatistics(projectType: string | null, organizationType: string | null): Promise<{
  avgWinProbability: number;
  avgEstimatedProfit: number;
  sampleSize: number;
}> {
  try {
    const db = getDb();
    if (!db) {
      console.warn('Firestore not initialized');
      return { avgWinProbability: 50, avgEstimatedProfit: 15, sampleSize: 0 };
    }

    const projectAnalysesCol = collection(db, 'projectAnalyses');
    let q = query(projectAnalysesCol);

    if (projectType) {
      q = query(q, where('projectType', '==', projectType));
    }

    if (organizationType) {
      q = query(q, where('organizationType', '==', organizationType));
    }

    const analysisSnapshot = await getDocs(q);

    if (analysisSnapshot.empty) {
      return { avgWinProbability: 50, avgEstimatedProfit: 15, sampleSize: 0 };
    }

    const analyses = analysisSnapshot.docs.map(doc => doc.data() as ProjectAnalysisData);

    // คำนวณค่าเฉลี่ย
    const totalWinProb = analyses.reduce((sum, analysis) => sum + analysis.winProbability, 0);
    const totalProfit = analyses.reduce((sum, analysis) => sum + analysis.estimatedProfit, 0);

    return {
      avgWinProbability: totalWinProb / analyses.length,
      avgEstimatedProfit: totalProfit / analyses.length,
      sampleSize: analyses.length
    };
  } catch (error) {
    console.error('Error getting project statistics:', error);
    return { avgWinProbability: 50, avgEstimatedProfit: 15, sampleSize: 0 };
  }
}

/**
 * เก็บข้อมูลในกรณีที่ Firestore ไม่สามารถใช้งานได้
 * ใช้ localStorage ในฝั่ง client หรือ Map ในฝั่ง server
 */
let localAnalysisCache = new Map<string, ProjectAnalysisData[]>();

/**
 * บันทึกข้อมูลการวิเคราะห์ลงในแคชท้องถิ่น
 */
export function saveProjectAnalysisToLocalCache(analysis: ProjectAnalysisData): void {
  try {
    const projectId = analysis.projectId;
    const existingAnalyses = localAnalysisCache.get(projectId) || [];
    localAnalysisCache.set(projectId, [...existingAnalyses, analysis]);
    console.log(`Saved analysis for project ${analysis.projectName} to local cache`);
  } catch (error) {
    console.error('Error saving project analysis to local cache:', error);
  }
}

/**
 * ดึงข้อมูลการวิเคราะห์จากแคชท้องถิ่น
 */
export function getProjectAnalysisFromLocalCache(projectId: string): ProjectAnalysisData[] {
  try {
    return localAnalysisCache.get(projectId) || [];
  } catch (error) {
    console.error('Error getting project analysis from local cache:', error);
    return [];
  }
}

/**
 * ประเภทข้อมูลสำหรับการวิเคราะห์ตลาดหุ้น
 */
export interface MarketAnalysisData {
  id: string;
  type: 'stock' | 'market' | 'news';
  data: any;
  keywords: string[];
  analysisTimestamp: Date;
}

// แคชท้องถิ่นสำหรับข้อมูลวิเคราะห์ตลาด
let localMarketAnalysisCache = new Map<string, MarketAnalysisData[]>();

/**
 * บันทึกข้อมูลการวิเคราะห์ตลาดหุ้น ข่าว หรือหุ้นรายตัวลงในฐานข้อมูล
 */
export async function saveAnalysisData(
  type: 'stock' | 'market' | 'news',
  data: any,
  keywords: string[] = []
): Promise<boolean> {
  try {
    const db = getDb();
    if (!db) {
      console.warn('Firestore not initialized, saving to local cache instead');
      saveAnalysisToLocalCache(type, data, keywords);
      return true;
    }

    const timestamp = new Date();
    const id = `${type}_${timestamp.getTime()}`;

    let idField = '';
    switch (type) {
      case 'stock':
        idField = data.ticker || data.symbol;
        break;
      case 'market':
        idField = data.market;
        break;
      case 'news':
        idField = data.topics ? data.topics.join('_') : 'general';
        break;
    }

    const analysisData: MarketAnalysisData = {
      id: `${idField}_${id}`,
      type,
      data,
      keywords,
      analysisTimestamp: timestamp
    };

    // บันทึกข้อมูลลงใน collection 'marketAnalyses'
    await setDoc(doc(db, 'marketAnalyses', analysisData.id), analysisData);
    console.log(`Saved ${type} analysis with ID: ${analysisData.id}`);

    // บันทึกลงแคชท้องถิ่นด้วย
    saveAnalysisToLocalCache(type, data, keywords);

    return true;
  } catch (error) {
    console.error(`Error saving ${type} analysis:`, error);
    saveAnalysisToLocalCache(type, data, keywords);
    return false;
  }
}

/**
 * บันทึกข้อมูลการวิเคราะห์ลงในแคชท้องถิ่น
 */
export function saveAnalysisToLocalCache(
  type: 'stock' | 'market' | 'news',
  data: any,
  keywords: string[] = []
): void {
  try {
    const timestamp = new Date();
    const id = `${type}_${timestamp.getTime()}`;

    let idField = '';
    switch (type) {
      case 'stock':
        idField = data.ticker || data.symbol;
        break;
      case 'market':
        idField = data.market;
        break;
      case 'news':
        idField = data.topics ? data.topics.join('_') : 'general';
        break;
    }

    const analysisData: MarketAnalysisData = {
      id: `${idField}_${id}`,
      type,
      data,
      keywords,
      analysisTimestamp: timestamp
    };

    const key = `${type}_${idField}`;
    const existingAnalyses = localMarketAnalysisCache.get(key) || [];
    localMarketAnalysisCache.set(key, [...existingAnalyses, analysisData]);
    console.log(`Saved ${type} analysis for ${idField} to local cache`);
  } catch (error) {
    console.error(`Error saving ${type} analysis to local cache:`, error);
  }
}

/**
 * ดึงข้อมูลการวิเคราะห์ตลาดหุ้น
 * @param type ประเภทของการวิเคราะห์ ('stock', 'market', 'news')
 * @param filter เงื่อนไขการกรอง (เช่น { ticker: 'AAPL' } หรือ { market: 'SET' })
 * @param limit จำนวนรายการที่ต้องการ (ค่าเริ่มต้น 5)
 */
export async function getAnalysisData(
  type: 'stock' | 'market' | 'news',
  filter: Record<string, any> = {},
  limit: number = 5
): Promise<MarketAnalysisData[]> {
  try {
    const db = getDb();
    if (!db) {
      console.warn('Firestore not initialized, fetching from local cache instead');
      return findAnalysesInLocalCache(filter.keywords || [], type, limit);
    }

    const marketAnalysesCol = collection(db, 'marketAnalyses');
    let q = query(
      marketAnalysesCol,
      where('type', '==', type),
      orderBy('analysisTimestamp', 'desc')
    );

    // เพิ่มเงื่อนไขการกรองตาม filter
    for (const key in filter) {
      // เพิ่มเงื่อนไขการกรองสำหรับข้อมูลที่อยู่ใน data
      q = query(q, where(`data.${key}`, '==', filter[key]));
    }

    const analysisSnapshot = await getDocs(q);

    if (analysisSnapshot.empty) {
      console.log(`No ${type} analysis found with filter:`, filter);
      return findAnalysesInLocalCache(filter.keywords || [], type, limit);
    }

    // ดึงข้อมูลและจำกัดจำนวนตาม limit
    const results = analysisSnapshot.docs
      .map(doc => doc.data() as MarketAnalysisData)
      .slice(0, limit);

    console.log(`Retrieved ${results.length} ${type} analyses with filter:`, filter);
    return results;
  } catch (error) {
    console.error(`Error getting ${type} analysis:`, error);
    return findAnalysesInLocalCache(filter.keywords || [], type, limit);
  }
}

/**
 * ดึงข้อมูลการวิเคราะห์จากแคชท้องถิ่น
 */
export function findAnalysesInLocalCache(
  keywords: string[],
  type?: 'stock' | 'market' | 'news',
  limit: number = 5
): MarketAnalysisData[] {
  try {
    // รวมทุกรายการในแคชที่ตรงตามประเภท
    let allCacheEntries: MarketAnalysisData[] = [];

    for (const entries of localMarketAnalysisCache.values()) {
      if (type) {
        allCacheEntries.push(...entries.filter(entry => entry.type === type));
      } else {
        allCacheEntries.push(...entries);
      }
    }

    // คำนวณความเกี่ยวข้องกับคีย์เวิร์ด
    const scoredEntries = allCacheEntries.map(entry => {
      const matchCount = keywords.reduce((count, keyword) => {
        const keywordLower = keyword.toLowerCase();
        return Number(count) + (entry.keywords.some(k =>
          k.toLowerCase().includes(keywordLower) || keywordLower.includes(k.toLowerCase())
        ) ? 1 : 0);
      }, 0);

      return {
        entry,
        score: matchCount / keywords.length
      };
    });

    // เรียงลำดับและกรอง
    return scoredEntries
      .filter(item => item.score > 0)
      .sort((a, b) => b.entry.analysisTimestamp.getTime() - a.entry.analysisTimestamp.getTime())
      .slice(0, limit)
      .map(item => item.entry); // Return only the MarketAnalysisData objects
  } catch (error) {
    console.error(`Error finding analyses in local cache:`, error);
    return [];
  }
}

/**
 * ดึงข้อมูลการวิเคราะห์หุ้นรายตัวล่าสุด
 * @param ticker รหัสย่อของหุ้น (เช่น AAPL, MSFT)
 */
export async function getRecentStockAnalysis(ticker: string): Promise<any | null> {
  const results = await getAnalysisData('stock', { ticker }, 1);
  if (results && results.length > 0) {
    return results[0].data;
  }
  return null;
}

/**
 * ดึงข้อมูลการวิเคราะห์ตลาดหุ้นล่าสุด
 * @param market ชื่อตลาด (เช่น SET, NASDAQ)
 */
export async function getRecentMarketAnalysis(market: string): Promise<any | null> {
  const results = await getAnalysisData('market', { market }, 1);
  if (results && results.length > 0) {
    return results[0].data;
  }
  return null;
}

/**
 * ดึงข้อมูลการวิเคราะห์ข่าวการเงินที่เกี่ยวข้องล่าสุด
 * @param keyword คำค้นสำหรับค้นหาข่าวที่เกี่ยวข้อง
 */
export async function findMarketAnalysesByKeywords(keywords: string[], type: string, limit: number): Promise<any[]> {
  // Placeholder implementation
  console.warn("findMarketAnalysesByKeywords is a placeholder and needs proper implementation.");
  return [];
}

export async function getRecentNewsAnalysis(keyword: string): Promise<any | null> {
  // ใช้ findMarketAnalysesByKeywords เพื่อค้นหาข่าวที่เกี่ยวข้อง
  const results = await findMarketAnalysesByKeywords([keyword], 'news', 1);
  if (results && results.length > 0) {
    return results[0].data;
  }
  return null;
}

/**
 * บันทึกผลการวิเคราะห์หุ้นรายตัวลงฐานข้อมูล
 * @param analysisData ข้อมูลการวิเคราะห์หุ้น
 */
export async function saveStockAnalysis(analysisData: any): Promise<boolean> {
  const ticker = analysisData.ticker || analysisData.symbol;
  const keywords = [
    ticker,
    analysisData.trend,
    ...(analysisData.keyFactors?.slice(0, 3) || [])
  ];

  return await saveAnalysisData('stock', analysisData, keywords);
}

/**
 * บันทึกผลการวิเคราะห์ตลาดหุ้นลงฐานข้อมูล
 * @param analysisData ข้อมูลการวิเคราะห์ตลาด
 */
export async function saveMarketAnalysis(analysisData: any): Promise<boolean> {
  const keywords = [
    analysisData.market,
    analysisData.trend,
    ...(analysisData.sectorOutlook?.slice(0, 3).map((s: any) => s.sector) || [])
  ];

  return await saveAnalysisData('market', analysisData, keywords);
}

/**
 * บันทึกผลการวิเคราะห์ข่าวการเงินลงฐานข้อมูล
 * @param analysisData ข้อมูลการวิเคราะห์ข่าว
 */
export async function saveNewsAnalysis(analysisData: any): Promise<boolean> {
  const keywords = [
    analysisData.headline?.substring(0, 50) || "",
    analysisData.marketImpact,
    ...(analysisData.affectedSectors || [])
  ];

  return await saveAnalysisData('news', analysisData, keywords);
}

/**
 * ข้อมูลการวิเคราะห์แนวโน้มตลาด
 */
export interface MarketTrendAnalysisData {
  id?: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  type: 'general' | 'sector' | 'global' | 'local';
  date: string;
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  riskFactors: string[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidenceScore: number;
  createdAt: string;
}

/**
 * บันทึกข้อมูลการวิเคราะห์แนวโน้มตลาด
 * 
 * @param analysis ข้อมูลการวิเคราะห์แนวโน้มตลาด
 * @returns สถานะการบันทึกข้อมูล (true = สำเร็จ, false = ล้มเหลว)
 */
export async function saveMarketTrendAnalysis(analysis: MarketTrendAnalysisData): Promise<boolean> {
  try {
    const db = getDb();
    if (!db) {
      console.error('Error saving market trend analysis: Firestore not initialized');
      return false;
    }
    const docId = analysis.id || `${analysis.period}_${analysis.type}_${analysis.date}`;
    const docRef = doc(db, 'marketTrends', docId);

    await setDoc(docRef, {
      ...analysis,
      id: docId,
      updatedAt: new Date().toISOString(),
    });

    console.log(`Market trend analysis saved with ID: ${docId}`);
    return true;
  } catch (error) {
    console.error('Error saving market trend analysis:', error);
    return false;
  }
}

/**
 * ดึงข้อมูลการวิเคราะห์แนวโน้มตลาดล่าสุดตามระยะเวลาและประเภท
 * 
 * @param period ระยะเวลาของการวิเคราะห์
 * @param type ประเภทของการวิเคราะห์
 * @returns ข้อมูลการวิเคราะห์แนวโน้มตลาดล่าสุด
 */
export async function getLatestMarketTrendAnalysis(
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly',
  type: 'general' | 'sector' | 'global' | 'local'
): Promise<MarketTrendAnalysisData | null> {
  try {
    const db = getDb();
    if (!db) {
      console.error('Error getting latest market trend analysis: Firestore not initialized');
      return null;
    }
    const q = query(
      collection(db, 'marketTrends'),
      where('period', '==', period),
      where('type', '==', type),
      orderBy('date', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as MarketTrendAnalysisData;
  } catch (error) {
    console.error('Error getting latest market trend analysis:', error);
    return null;
  }
}

/**
 * ค้นหาข้อมูลการวิเคราะห์แนวโน้มตลาดตามเงื่อนไข
 * 
 * @param period ระยะเวลาของการวิเคราะห์ (optional)
 * @param type ประเภทของการวิเคราะห์ (optional)
 * @param startDate วันที่เริ่มต้นของการวิเคราะห์ (optional)
 * @param endDate วันที่สิ้นสุดของการวิเคราะห์ (optional)
 * @returns รายการข้อมูลการวิเคราะห์แนวโน้มตลาด
 */
export async function searchMarketTrendAnalysis(
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly',
  type?: 'general' | 'sector' | 'global' | 'local',
  startDate?: string,
  endDate?: string
): Promise<MarketTrendAnalysisData[]> {
  try {
    const db = getDb();
    if (!db) {
      console.error('Error searching market trend analysis: Firestore not initialized');
      return [];
    }
    let q = query(collection(db, 'marketTrends'));

    // Add filters if provided
    let conditions: any[] = [];
    if (period) {
      conditions.push(where('period', '==', period));
    }
    if (type) {
      conditions.push(where('type', '==', type));
    }
    if (startDate) {
      conditions.push(where('date', '>=', startDate));
    }
    if (endDate) {
      conditions.push(where('date', '<=', endDate));
    }

    if (conditions.length > 0) {
      q = query(collection(db, 'marketTrends'), ...conditions, orderBy('date', 'desc'));
    } else {
      q = query(collection(db, 'marketTrends'), orderBy('date', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketTrendAnalysisData));
  } catch (error) {
    console.error('Error searching market trend analysis:', error);
    return [];
  }
}

/**
 * =================================================================
 * NEW: Document Analysis Service Functions
 * =================================================================
 */

/**
 * Schema for storing document analysis results in Firestore.
 * สร้าง schema ใหม่แทนการ extend เพราะ FinalAnalysisOutputSchema อาจไม่ใช่ pure Zod schema
 */
export const DocumentAnalysisDBSchema = z.object({
  id: z.string(),
  sourceType: z.enum(['url', 'text', 'file']),
  sourceContent: z.string().describe('URL, text snippet, or original file name'),
  downloadUrl: z.string().optional().describe('Public URL for file downloads, if applicable'),
  createdAt: z.string().describe('ISO 8601 timestamp'),
});

export type DocumentAnalysisData = z.infer<typeof DocumentAnalysisDBSchema>;

/**
 * Saves the result of a document analysis to the 'documentAnalyses' collection in Firestore.
 *
 * @param analysisResult The analysis data from the AI flow.
 * @param source The original source information (URL, text, or file details).
 * @returns The ID of the newly created document, or null if an error occurred.
 */
export async function saveDocumentAnalysis(
  analysisResult: z.infer<typeof FinalAnalysisOutputSchema>,
  source: {
    sourceType: 'url' | 'text' | 'file';
    content: string;
    downloadUrl?: string;
  }
): Promise<string | null> {
  try {
    const db = getDb();
    if (!db) {
      console.warn('Firestore not initialized');
      return null;
    }

    const timestamp = new Date();
    // Create a URL-safe, short, and descriptive ID
    const safeProjectName = (analysisResult.projectName || 'Untitled')
      .replace(/[^a-zA-Z0-9-]/g, '_')
      .substring(0, 50);
    const id = `${safeProjectName}_${timestamp.getTime()}`;

    const dataToSave: DocumentAnalysisData = {
      id,
      ...analysisResult,
      sourceType: source.sourceType,
      // For text, store a snippet. For URL/file, store the full URL or file name.
      sourceContent: source.sourceType === 'text' ? source.content.substring(0, 250) + (source.content.length > 250 ? '...' : '') : source.content,
      downloadUrl: source.downloadUrl,
      createdAt: timestamp.toISOString(),
    };

    // Validate data with Zod before saving
    DocumentAnalysisDBSchema.parse(dataToSave);

    await setDoc(doc(db, 'documentAnalyses', id), dataToSave);
    console.log(`Saved document analysis with ID: ${id}`);
    return id;
  } catch (error) {
    console.error('Error saving document analysis:', error);
    // If Zod validation fails, the error will be caught here.
    return null;
  }
}

/**
 * =================================================================
 * NEW: TOR Material Specifications History Functions
 * =================================================================
 */

// Re-export MaterialSpecificationSchema from summarize-document-flow for consistency
export type TorMaterialSpecification = z.infer<typeof MaterialSpecificationSchema>;

/**
 * Saves extracted material specifications from a TOR to a historical collection.
 * @param torAnalysisId A unique ID for this specific TOR analysis (e.g., from summarizeDocumentFlow).
 * @param materials An array of MaterialSpecificationSchema objects.
 * @returns True if successful, false otherwise.
 */
export async function saveTorMaterialSpecifications(
  torAnalysisId: string,
  materials: TorMaterialSpecification[],
  options?: { agencyName?: string; projectId?: string; documentId?: string }
): Promise<boolean> {
  try {
    const db = getDb();
    if (!db) {
      console.warn('Firestore not initialized');
      return false;
    }

    const batch = [] as Promise<any>[];
    const collectionRef = collection(db, 'torMaterialHistory');

    for (const material of materials) {
      const safeName = material.itemName.replace(/[^a-zA-Z0-9-]/g, '_').substring(0, 30);
      const docId = `${torAnalysisId}_${safeName}_${Date.now()}`;
      const record = {
        torAnalysisId,
        ...material,
        ...(options?.agencyName ? { agencyName: options.agencyName } : {}),
        ...(options?.projectId ? { projectId: options.projectId } : {}),
        ...(options?.documentId ? { documentId: options.documentId } : {}),
        createdAt: new Date().toISOString(),
      } as const;
      batch.push(setDoc(doc(collectionRef, docId), record));
    }

    await Promise.all(batch);
    console.log(`Saved ${materials.length} material specifications for TOR analysis ID: ${torAnalysisId}`);
    return true;
  } catch (error) {
    console.error('Error saving TOR material specifications:', error);
    return false;
  }
}

/**
 * Retrieves historical material specifications for a given item name and optional agency.
 * This can be used to detect common patterns or potential vendor locks.
 * @param itemName The name of the material or equipment to search for.
 * @param agencyName Optional: The name of the government agency or organization.
 * @param limit Optional: Maximum number of historical records to return. Defaults to 10.
 * @returns An array of historical TorMaterialSpecification objects.
 */
export async function getHistoricalTorMaterialSpecs(
  itemName: string,
  agencyName?: string,
  maxResults: number = 10
): Promise<TorMaterialSpecification[]> {
  try {
    const db = getDb();
    if (!db) {
      console.warn('Firestore not initialized');
      return [];
    }

    let q = query(
      collection(db, 'torMaterialHistory'),
      where('itemName', '==', itemName),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );

    // If agencyName is provided, filter by it (assuming we can link TORs to agencies)
    // This would require adding agencyName to the saved TorMaterialSpecification in saveTorMaterialSpecifications
    // For now, we'll keep it simple and just filter by itemName.
    // In a real-world scenario, you'd likely have a 'torId' linked to a 'projectId' which has an 'agencyName'.
    // For demonstration, we'll just use itemName.

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as TorMaterialSpecification);
  } catch (error) {
    console.error('Error getting historical TOR material specifications:', error);
    return [];
  }
}

/**
 * Retrieves material specifications by torAnalysisId.
 * Useful for linking TOR analysis outputs (from summarizeDocumentFlow) to UI.
 */
export async function getTorMaterialSpecsByAnalysisId(
  torAnalysisId: string,
  maxResults: number = 100
): Promise<TorMaterialSpecification[]> {
  try {
    const db = getDb();
    if (!db) {
      console.warn('Firestore not initialized');
      return [];
    }

    const q = query(
      collection(db, 'torMaterialHistory'),
      where('torAnalysisId', '==', torAnalysisId),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as TorMaterialSpecification);
  } catch (error) {
    console.error('Error getting TOR material specs by analysis id:', error);
    return [];
  }
}