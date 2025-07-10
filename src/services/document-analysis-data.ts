/**
 * @fileOverview บริการจัดการข้อมูลการวิเคราะห์เอกสาร TOR และ BOQ
 * ไฟล์นี้รับผิดชอบการจัดเก็บและดึงข้อมูลการวิเคราะห์เอกสารโครงการที่ AI ได้วิเคราะห์แล้ว
 */
'use server';

import { getDb } from './firebase';
import { doc, setDoc, getDoc, collection, getDocs, query, where, orderBy, addDoc } from 'firebase/firestore';
import {
  TORAnalysisResult,
  BOQAnalysisResult,
  DocumentType,
  RiskLevel
} from '@/ai/document-analysis';
import * as PriceListService from './price-list-service';

/**
 * ข้อมูลการวิเคราะห์เอกสาร TOR
 */
export interface TORAnalysisData extends TORAnalysisResult {
  id?: string;
  documentId: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * ข้อมูลการวิเคราะห์เอกสาร BOQ
 */
export interface BOQAnalysisData extends BOQAnalysisResult {
  id?: string;
  documentId: string;
  projectId?: string;
  torAnalysisId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * ผลการวิเคราะห์ความสอดคล้องระหว่าง TOR และ BOQ
 */
export interface ConsistencyAnalysisData {
  id?: string;
  projectId: string;
  torAnalysisId: string;
  boqAnalysisId: string;
  consistencyScore: number;
  inconsistencies: string[];
  recommendations: string[];
  summary: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * ผลการวิเคราะห์แบบแปลน
 */
export interface DrawingAnalysisData {
  id?: string;
  documentId: string;
  projectId: string;
  keyComponents: string[];
  technicalChallenges: string[];
  resourceRequirements: string[];
  timelineEstimate: string;
  riskFactors: {
    description: string;
    level: RiskLevel;
  }[];
  recommendations: string[];
  summary: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * บันทึกผลการวิเคราะห์ TOR
 * 
 * @param analysis ข้อมูลผลการวิเคราะห์ TOR
 * @returns สถานะการบันทึกข้อมูล (true = สำเร็จ, false = ล้มเหลว)
 */
export async function saveTORAnalysis(
  analysis: TORAnalysisResult,
  documentId: string,
  projectId?: string
): Promise<string | null> {
  try {
    const db = getDb();
    const currentTime = new Date().toISOString();
    
    // สร้างข้อมูลสำหรับบันทึก
    const analysisData: TORAnalysisData = {
      ...analysis,
      documentId,
      projectId,
      createdAt: currentTime,
      updatedAt: currentTime
    };
    
    // สร้าง ID ถ้าไม่มี
    const docId = analysisData.id || `tor_${documentId}_${currentTime.replace(/[:.]/g, '_')}`;
    analysisData.id = docId;
    
    // บันทึกลงฐานข้อมูล
    const docRef = doc(db, 'torAnalyses', docId);
    await setDoc(docRef, analysisData);
    
    console.log(`TOR analysis saved with ID: ${docId}`);
    return docId;
  } catch (error) {
    console.error('Error saving TOR analysis:', error);
    return null;
  }
}

/**
 * บันทึกผลการวิเคราะห์ BOQ
 * 
 * @param analysis ข้อมูลผลการวิเคราะห์ BOQ
 * @returns สถานะการบันทึกข้อมูล (true = สำเร็จ, false = ล้มเหลว)
 */
export async function saveBOQAnalysis(
  analysis: BOQAnalysisResult,
  documentId: string,
  projectId?: string,
  torAnalysisId?: string
): Promise<string | null> {
  try {
    const db = getDb();
    const currentTime = new Date().toISOString();
    
    // สร้างข้อมูลสำหรับบันทึก
    const analysisData: BOQAnalysisData = {
      ...analysis,
      documentId,
      projectId,
      torAnalysisId,
      createdAt: currentTime,
      updatedAt: currentTime
    };
    
    // สร้าง ID ถ้าไม่มี
    const docId = analysisData.id || `boq_${documentId}_${currentTime.replace(/[:.]/g, '_')}`;
    analysisData.id = docId;
    
    // บันทึกลงฐานข้อมูล
    const docRef = doc(db, 'boqAnalyses', docId);
    await setDoc(docRef, analysisData);
    
    console.log(`BOQ analysis saved with ID: ${docId}`);
    return docId;
  } catch (error) {
    console.error('Error saving BOQ analysis:', error);
    return null;
  }
}

/**
 * บันทึกผลการวิเคราะห์ความสอดคล้องระหว่าง TOR และ BOQ
 * 
 * @param analysis ข้อมูลผลการวิเคราะห์ความสอดคล้อง
 * @returns สถานะการบันทึกข้อมูล (true = สำเร็จ, false = ล้มเหลว)
 */
export async function saveConsistencyAnalysis(
  projectId: string,
  torAnalysisId: string,
  boqAnalysisId: string,
  consistencyScore: number,
  inconsistencies: string[],
  recommendations: string[],
  summary: string
): Promise<string | null> {
  try {
    const db = getDb();
    const currentTime = new Date().toISOString();
    
    // สร้างข้อมูลสำหรับบันทึก
    const analysisData: ConsistencyAnalysisData = {
      projectId,
      torAnalysisId,
      boqAnalysisId,
      consistencyScore,
      inconsistencies,
      recommendations,
      summary,
      createdAt: currentTime,
      updatedAt: currentTime
    };
    
    // สร้าง ID
    const docId = `consistency_${torAnalysisId}_${boqAnalysisId}`;
    analysisData.id = docId;
    
    // บันทึกลงฐานข้อมูล
    const docRef = doc(db, 'consistencyAnalyses', docId);
    await setDoc(docRef, analysisData);
    
    console.log(`Consistency analysis saved with ID: ${docId}`);
    return docId;
  } catch (error) {
    console.error('Error saving consistency analysis:', error);
    return null;
  }
}

/**
 * บันทึกผลการวิเคราะห์แบบแปลน
 * 
 * @param analysis ข้อมูลผลการวิเคราะห์แบบแปลน
 * @returns สถานะการบันทึกข้อมูล (true = สำเร็จ, false = ล้มเหลว)
 */
export async function saveDrawingAnalysis(
  documentId: string,
  projectId: string,
  keyComponents: string[],
  technicalChallenges: string[],
  resourceRequirements: string[],
  timelineEstimate: string,
  riskFactors: Array<{
    description: string;
    level: RiskLevel;
  }>,
  recommendations: string[],
  summary: string
): Promise<string | null> {
  try {
    const db = getDb();
    const currentTime = new Date().toISOString();
    
    // สร้างข้อมูลสำหรับบันทึก
    const analysisData: DrawingAnalysisData = {
      documentId,
      projectId,
      keyComponents,
      technicalChallenges,
      resourceRequirements,
      timelineEstimate,
      riskFactors,
      recommendations,
      summary,
      createdAt: currentTime,
      updatedAt: currentTime
    };
    
    // สร้าง ID
    const docId = `drawing_${documentId}_${currentTime.replace(/[:.]/g, '_')}`;
    analysisData.id = docId;
    
    // บันทึกลงฐานข้อมูล
    const docRef = doc(db, 'drawingAnalyses', docId);
    await setDoc(docRef, analysisData);
    
    console.log(`Drawing analysis saved with ID: ${docId}`);
    return docId;
  } catch (error) {
    console.error('Error saving drawing analysis:', error);
    return null;
  }
}

/**
 * ดึงผลการวิเคราะห์ TOR ล่าสุดของเอกสาร
 * 
 * @param documentId ID ของเอกสาร TOR
 * @returns ข้อมูลผลการวิเคราะห์ TOR ล่าสุด
 */
export async function getLatestTORAnalysis(documentId: string): Promise<TORAnalysisData | null> {
  try {
    const db = getDb();
    const q = query(
      collection(db, 'torAnalyses'),
      where('documentId', '==', documentId),
      orderBy('createdAt', 'desc'),
      // limit to 1 document
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return { ...doc.data(), id: doc.id } as TORAnalysisData;
  } catch (error) {
    console.error('Error getting latest TOR analysis:', error);
    return null;
  }
}

/**
 * ดึงผลการวิเคราะห์ BOQ ล่าสุดของเอกสาร
 * 
 * @param documentId ID ของเอกสาร BOQ
 * @returns ข้อมูลผลการวิเคราะห์ BOQ ล่าสุด
 */
export async function getLatestBOQAnalysis(documentId: string): Promise<BOQAnalysisData | null> {
  try {
    const db = getDb();
    const q = query(
      collection(db, 'boqAnalyses'),
      where('documentId', '==', documentId),
      orderBy('createdAt', 'desc'),
      // limit to 1 document
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return { ...doc.data(), id: doc.id } as BOQAnalysisData;
  } catch (error) {
    console.error('Error getting latest BOQ analysis:', error);
    return null;
  }
}

/**
 * ดึงผลการวิเคราะห์ความสอดคล้องล่าสุดระหว่าง TOR และ BOQ
 * 
 * @param torAnalysisId ID ของการวิเคราะห์ TOR
 * @param boqAnalysisId ID ของการวิเคราะห์ BOQ
 * @returns ข้อมูลผลการวิเคราะห์ความสอดคล้องล่าสุด
 */
export async function getConsistencyAnalysis(
  torAnalysisId: string,
  boqAnalysisId: string
): Promise<ConsistencyAnalysisData | null> {
  try {
    const db = getDb();
    const docId = `consistency_${torAnalysisId}_${boqAnalysisId}`;
    const docRef = doc(db, 'consistencyAnalyses', docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as ConsistencyAnalysisData;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting consistency analysis:', error);
    return null;
  }
}

/**
 * ดึงผลการวิเคราะห์ทั้งหมดของโครงการ
 * 
 * @param projectId ID ของโครงการ
 * @returns ข้อมูลผลการวิเคราะห์ทั้งหมดของโครงการ
 */
export async function getAllProjectAnalyses(projectId: string): Promise<{
  torAnalyses: TORAnalysisData[];
  boqAnalyses: BOQAnalysisData[];
  consistencyAnalyses: ConsistencyAnalysisData[];
  drawingAnalyses: DrawingAnalysisData[];
}> {
  try {
    const db = getDb();
    
    // ดึง TOR analyses
    const torQ = query(
      collection(db, 'torAnalyses'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );
    const torSnapshot = await getDocs(torQ);
    const torAnalyses = torSnapshot.docs.map(
      doc => ({ ...doc.data(), id: doc.id }) as TORAnalysisData
    );
    
    // ดึง BOQ analyses
    const boqQ = query(
      collection(db, 'boqAnalyses'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );
    const boqSnapshot = await getDocs(boqQ);
    const boqAnalyses = boqSnapshot.docs.map(
      doc => ({ ...doc.data(), id: doc.id }) as BOQAnalysisData
    );
    
    // ดึง consistency analyses
    const consistencyQ = query(
      collection(db, 'consistencyAnalyses'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );
    const consistencySnapshot = await getDocs(consistencyQ);
    const consistencyAnalyses = consistencySnapshot.docs.map(
      doc => ({ ...doc.data(), id: doc.id }) as ConsistencyAnalysisData
    );
    
    // ดึง drawing analyses
    const drawingQ = query(
      collection(db, 'drawingAnalyses'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );
    const drawingSnapshot = await getDocs(drawingQ);
    const drawingAnalyses = drawingSnapshot.docs.map(
      doc => ({ ...doc.data(), id: doc.id }) as DrawingAnalysisData
    );
    
    return {
      torAnalyses,
      boqAnalyses,
      consistencyAnalyses,
      drawingAnalyses
    };
  } catch (error) {
    console.error('Error getting all project analyses:', error);
    return {
      torAnalyses: [],
      boqAnalyses: [],
      consistencyAnalyses: [],
      drawingAnalyses: []
    };
  }
}

/**
 * ค้นหาผลการวิเคราะห์ TOR ตามเงื่อนไข
 * 
 * @param conditions เงื่อนไขในการค้นหา
 * @returns ข้อมูลผลการวิเคราะห์ TOR ที่ตรงตามเงื่อนไข
 */
export async function searchTORAnalyses(conditions: {
  projectName?: string;
  projectType?: string;
  agency?: string;
  minBudget?: number;
  maxBudget?: number;
  minOpportunityScore?: number;
  maxOpportunityScore?: number;
}): Promise<TORAnalysisData[]> {
  try {
    const db = getDb();
    let results: TORAnalysisData[] = [];
    
    // ดึงข้อมูลทั้งหมดก่อนเพื่อกรองในแอปพลิเคชัน (Firestore มีข้อจำกัดในการใช้ OR และการกรองแบบซับซ้อน)
    const querySnapshot = await getDocs(collection(db, 'torAnalyses'));
    const allAnalyses = querySnapshot.docs.map(
      doc => ({ ...doc.data(), id: doc.id }) as TORAnalysisData
    );
    
    // กรองตามเงื่อนไข
    results = allAnalyses.filter(analysis => {
      let match = true;
      
      if (conditions.projectName && !analysis.projectName.toLowerCase().includes(conditions.projectName.toLowerCase())) {
        match = false;
      }
      
      if (conditions.projectType && !analysis.projectType.toLowerCase().includes(conditions.projectType.toLowerCase())) {
        match = false;
      }
      
      if (conditions.agency && !analysis.agency.toLowerCase().includes(conditions.agency.toLowerCase())) {
        match = false;
      }
      
      if (conditions.minBudget !== undefined && analysis.budget < conditions.minBudget) {
        match = false;
      }
      
      if (conditions.maxBudget !== undefined && analysis.budget > conditions.maxBudget) {
        match = false;
      }
      
      if (conditions.minOpportunityScore !== undefined && analysis.opportunityScore < conditions.minOpportunityScore) {
        match = false;
      }
      
      if (conditions.maxOpportunityScore !== undefined && analysis.opportunityScore > conditions.maxOpportunityScore) {
        match = false;
      }
      
      return match;
    });
    
    // เรียงตามคะแนนโอกาส (มากไปน้อย)
    results.sort((a, b) => b.opportunityScore - a.opportunityScore);
    
    return results;
  } catch (error) {
    console.error('Error searching TOR analyses:', error);
    return [];
  }
}

/**
 * บันทึกรายงานสรุปการวิเคราะห์โครงการ
 * 
 * @param projectId ID ของโครงการ
 * @param summary เนื้อหารายงานสรุป
 * @param relatedAnalyses IDs ของการวิเคราะห์ที่เกี่ยวข้อง
 * @returns สถานะการบันทึกข้อมูล (true = สำเร็จ, false = ล้มเหลว)
 */
export async function saveProjectAnalysisSummary(
  projectId: string,
  projectName: string,
  summary: string,
  relatedAnalyses: {
    torAnalysisIds: string[];
    boqAnalysisIds: string[];
    consistencyAnalysisIds: string[];
    drawingAnalysisIds: string[];
  }
): Promise<boolean> {
  try {
    const db = getDb();
    const currentTime = new Date().toISOString();
    
    // สร้างข้อมูลสำหรับบันทึก
    const summaryData = {
      projectId,
      projectName,
      summary,
      relatedAnalyses,
      createdAt: currentTime,
      updatedAt: currentTime
    };
    
    // สร้าง ID
    const docId = `summary_${projectId}_${currentTime.replace(/[:.]/g, '_')}`;
    
    // บันทึกลงฐานข้อมูล
    const docRef = doc(db, 'projectAnalysisSummaries', docId);
    await setDoc(docRef, summaryData);
    
    console.log(`Project analysis summary saved with ID: ${docId}`);
    return true;
  } catch (error) {
    console.error('Error saving project analysis summary:', error);
    return false;
  }
}

/**
 * บันทึกข้อมูลการวิเคราะห์ TOR สำหรับใช้ในการทำ BOQ
 * 
 * @param data ข้อมูลการวิเคราะห์ TOR
 * @returns ID ของข้อมูลที่บันทึก
 */
export async function saveTORForBOQ(data: {
  analysisId: string;
  documentId: string;
  projectId?: string;
  projectName: string;
  mainRequirements: string[];
  keyDeliverables: string[];
  budget: number;
  savedAt: string;
}): Promise<string> {
  try {
    const db = getDb();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    // กำหนด ID สำหรับเอกสาร
    const id = `tor-for-boq-${data.documentId}-${Date.now()}`;
    const docRef = doc(db, 'torForBOQ', id);
    
    // บันทึกข้อมูล
    await setDoc(docRef, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending'
    });
    
    return id;
  } catch (error) {
    console.error('Error saving TOR for BOQ:', error);
    throw error;
  }
}

/**
 * ดึงข้อมูลการวิเคราะห์ TOR สำหรับทำ BOQ
 * 
 * @param documentId ID ของเอกสาร (optional)
 * @param projectId ID ของโครงการ (optional)
 * @returns ข้อมูลการวิเคราะห์ TOR สำหรับทำ BOQ หรือ null ถ้าไม่พบ
 */
export async function getTORForBOQ(documentId?: string, projectId?: string): Promise<{
  id: string;
  analysisId: string;
  documentId: string;
  projectId?: string;
  projectName: string;
  mainRequirements: string[];
  keyDeliverables: string[];
  budget: number;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'in_progress' | 'completed';
} | null> {
  try {
    const db = getDb();
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    let q;
    
    if (documentId) {
      // ค้นหาจาก documentId
      q = query(
        collection(db, 'torForBOQ'),
        where('documentId', '==', documentId),
        orderBy('createdAt', 'desc')
      );
    } else if (projectId) {
      // ค้นหาจาก projectId
      q = query(
        collection(db, 'torForBOQ'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
    } else {
      // ดึงข้อมูลล่าสุด
      q = query(
        collection(db, 'torForBOQ'),
        orderBy('createdAt', 'desc')
      );
    }
    
    // ดึงเฉพาะเอกสารแรก (ล่าสุด)
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      analysisId: data.analysisId,
      documentId: data.documentId,
      projectId: data.projectId,
      projectName: data.projectName,
      mainRequirements: data.mainRequirements || [],
      keyDeliverables: data.keyDeliverables || [],
      budget: data.budget || 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      status: data.status || 'pending'
    };
  } catch (error) {
    console.error('Error getting TOR for BOQ:', error);
    return null;
  }
}

/**
 * สร้าง BOQ จากผลการวิเคราะห์ TOR พร้อมดึงข้อมูลราคาจากไพรีสลิสต์
 * 
 * @param torForBOQId ID ของข้อมูลการวิเคราะห์ TOR ที่บันทึกไว้สำหรับจัดทำ BOQ
 * @param materialKeywords คำค้นหาที่เกี่ยวข้องกับวัสดุเพื่อค้นหาในไพรีสลิสต์
 * @returns รายการ BOQ พร้อมข้อมูลราคาจากไพรีสลิสต์
 */
export async function generateBOQFromTOR(
  torForBOQId: string,
  materialKeywords?: string[]
): Promise<{
  boqItems: {
    id: string;
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    materialCode?: string;
    supplier?: string;
    maker?: string;
    priceSource?: 'price-list' | 'estimate';
  }[];
  summary: {
    totalItems: number;
    totalMaterialCost: number;
    totalLabourCost: number;
    totalCost: number;
    withPriceListData: number;
    withoutPriceListData: number;
  }
}> {
  try {
    // 1. ดึงข้อมูล TOR ที่บันทึกไว้
    const torForBOQData = await getTORForBOQ(torForBOQId);
    
    if (!torForBOQData) {
      throw new Error(`ไม่พบข้อมูล TOR สำหรับจัดทำ BOQ (ID: ${torForBOQId})`);
    }
    
    // 2. สร้างคำสำคัญสำหรับค้นหาในไพรีสลิสต์จาก key deliverables และ requirements
    const searchKeywords = materialKeywords || [];
    
    // เพิ่มคำสำคัญจาก key deliverables ถ้าไม่มีการระบุ materialKeywords
    if (!materialKeywords || materialKeywords.length === 0) {
      const keyDeliverables = torForBOQData.keyDeliverables || [];
      const mainRequirements = torForBOQData.mainRequirements || [];
      
      // แยกคำจาก deliverables และ requirements เพื่อใช้เป็น keywords
      const extractKeywordsFromText = (textList: string[]) => {
        const allWords = textList.join(' ')
          .toLowerCase()
          .split(/\s+/)
          .filter(word => word.length > 3) // กรองคำที่สั้นเกินไป
          .filter(word => !['และ', 'หรือ', 'ต้อง', 'เป็น', 'ตาม', 'ทั้ง', 'การ'].includes(word)); // กรองคำเชื่อมทั่วไป
        
        // นับความถี่ของแต่ละคำ
        const wordFrequency: Record<string, number> = {};
        allWords.forEach(word => {
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });
        
        // เรียงตามความถี่และเลือก 10 อันดับแรก
        return Object.entries(wordFrequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([word]) => word);
      };
      
      searchKeywords.push(...extractKeywordsFromText(keyDeliverables));
      searchKeywords.push(...extractKeywordsFromText(mainRequirements));
    }
    
    // 3. ค้นหารายการในไพรีสลิสต์
    const priceItems: PriceListService.PriceListItem[] = [];
    
    // ดึงข้อมูลจากไพรีสลิสต์สำหรับแต่ละคำค้นหา
    await Promise.all(searchKeywords.map(async keyword => {
      try {
        const items = await PriceListService.searchPriceListItems({
          description: keyword,
          onlyActive: true
        });
        
        // เพิ่มเข้าไปใน priceItems (ป้องกันการซ้ำกัน)
        items.forEach(item => {
          if (!priceItems.some(existing => existing.id === item.id)) {
            priceItems.push(item);
          }
        });
      } catch (error) {
        console.warn(`Error searching for price list items with keyword '${keyword}':`, error);
        // ไม่หยุดการทำงาน แต่บันทึก error ไว้
      }
    }));
    
    // 4. สร้างรายการ BOQ
    // หมายเหตุ: ในการใช้งานจริงอาจใช้ AI เพื่อช่วยแนะนำรายการที่ควรมีในโครงการนี้
    // หรือใช้แม่แบบตามประเภทโครงการ
    
    // ตัวอย่างโครงสร้าง BOQ แบบง่าย
    const boqItems = priceItems.map((priceItem, index) => {
      const quantity = Math.floor(Math.random() * 10) + 1; // สุ่มจำนวนตัวอย่าง (1-10)
      const unitPrice = priceItem.submitPrice || priceItem.priceList;
      const totalPrice = quantity * unitPrice;
      
      return {
        id: `item_${index + 1}`,
        description: priceItem.description,
        unit: priceItem.unit,
        quantity,
        unitPrice,
        totalPrice,
        materialCode: priceItem.materialCode,
        supplier: priceItem.supplier,
        maker: priceItem.maker,
        priceSource: 'price-list' as const
      };
    });
    
    // เพิ่มรายการที่ไม่มีในไพรีสลิสต์ (ตัวอย่าง)
    if (boqItems.length < 5) {
      const additionalItems = [
        {
          id: `item_additional_1`,
          description: 'งานติดตั้งและทดสอบระบบ',
          unit: 'งาน',
          quantity: 1,
          unitPrice: Math.round(torForBOQData.budget * 0.15), // 15% ของงบประมาณ
          totalPrice: Math.round(torForBOQData.budget * 0.15),
          priceSource: 'estimate' as const
        },
        {
          id: `item_additional_2`,
          description: 'งานเอกสารและฝึกอบรม',
          unit: 'งาน',
          quantity: 1,
          unitPrice: Math.round(torForBOQData.budget * 0.05), // 5% ของงบประมาณ
          totalPrice: Math.round(torForBOQData.budget * 0.05),
          priceSource: 'estimate' as const
        }
      ];
      
      boqItems.push(...additionalItems);
    }
    
    // 5. คำนวณสรุป
    const summary = {
      totalItems: boqItems.length,
      totalMaterialCost: boqItems
        .filter(item => item.priceSource === 'price-list')
        .reduce((sum, item) => sum + item.totalPrice, 0),
      totalLabourCost: boqItems
        .filter(item => item.priceSource === 'estimate')
        .reduce((sum, item) => sum + item.totalPrice, 0),
      totalCost: boqItems.reduce((sum, item) => sum + item.totalPrice, 0),
      withPriceListData: boqItems.filter(item => item.priceSource === 'price-list').length,
      withoutPriceListData: boqItems.filter(item => item.priceSource === 'estimate').length,
    };
    
    return { boqItems, summary };
  } catch (error) {
    console.error('Error generating BOQ from TOR:', error);
    throw error;
  }
}

/**
 * อัปเดตข้อมูล BOQ พร้อมเชื่อมโยงกับรายการในไพรีสลิสต์
 * 
 * @param boqId ID ของ BOQ ที่ต้องการอัปเดต
 * @param boqItems รายการ BOQ ที่ต้องการอัปเดต
 * @returns ข้อมูล BOQ ที่อัปเดตแล้ว
 */
export async function updateBOQWithPriceListItems(
  boqId: string,
  boqItems: {
    id: string;
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    materialCode?: string;
    priceListItemId?: string;
  }[]
): Promise<boolean> {
  try {
    const db = getDb();
    const boqDocRef = doc(db, 'boqData', boqId);
    
    // ตรวจสอบว่ามี BOQ นี้อยู่หรือไม่
    const boqDoc = await getDoc(boqDocRef);
    if (!boqDoc.exists()) {
      throw new Error(`BOQ ID ${boqId} not found`);
    }
    
    // อัปเดตรายการ BOQ
    const updatedItems = await Promise.all(boqItems.map(async item => {
      // ถ้ามีการอ้างถึง materialCode แต่ไม่มี priceListItemId ให้ค้นหาในไพรีสลิสต์
      if (item.materialCode && !item.priceListItemId) {
        const priceItems = await PriceListService.searchPriceListItems({
          materialCode: item.materialCode,
          onlyActive: true
        });
        
        if (priceItems.length > 0) {
          const priceItem = priceItems[0];
          return {
            ...item,
            priceListItemId: priceItem.id,
            unitPrice: item.unitPrice || priceItem.submitPrice || priceItem.priceList,
            totalPrice: item.quantity * (item.unitPrice || priceItem.submitPrice || priceItem.priceList)
          };
        }
      }
      
      // คำนวณราคารวม
      return {
        ...item,
        totalPrice: item.quantity * item.unitPrice
      };
    }));
    
    // คำนวณข้อมูลรวม
    const totalCost = updatedItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    
    // อัปเดตข้อมูล BOQ
    await updateDoc(boqDocRef, {
      items: updatedItems,
      totalCost,
      updatedAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating BOQ with price list items:', error);
    throw error;
  }
}

/**
 * บันทึกข้อมูล BOQ ที่สร้างจาก TOR
 * 
 * @param data ข้อมูล BOQ ที่จะบันทึก
 * @returns ข้อมูลที่บันทึกแล้ว
 */
export async function saveBOQFromTOR(data: {
  torForBOQId: string;
  projectName: string;
  projectId: string | null;
  items: any[];
  createdAt: string;
  status: 'pending' | 'in_progress' | 'completed';
}): Promise<{ id: string } | null> {
  try {
    const db = getDb();
    
    // ดึงข้อมูล TOR เพื่อตรวจสอบ
    const torData = await getTORForBOQ(data.torForBOQId);
    if (!torData) {
      console.error(`TOR for BOQ data not found (ID: ${data.torForBOQId})`);
      return null;
    }
    
    // คำนวณราคารวม
    const totalPrice = data.items.reduce((total, item) => {
      return total + (item.totalPrice || (item.quantity * item.unitPrice) || 0);
    }, 0);
    
    // สร้างข้อมูลที่จะบันทึก
    const boqData = {
      torForBOQId: data.torForBOQId,
      torAnalysisId: torData.analysisId,
      projectName: data.projectName,
      projectId: data.projectId,
      items: data.items,
      totalPrice,
      createdAt: data.createdAt,
      updatedAt: data.createdAt,
      status: data.status,
    };
    
    // บันทึกข้อมูล
    const collectionRef = collection(db, 'projectBOQData');
    const docRef = await addDoc(collectionRef, boqData);
    
    console.log(`BOQ data saved with ID: ${docRef.id}`);
    return { id: docRef.id };
  } catch (error) {
    console.error('Error saving BOQ from TOR:', error);
    return null;
  }
}
