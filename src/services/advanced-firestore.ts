import { getDb } from '@/services/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch,
  Timestamp,
  Firestore
} from 'firebase/firestore';
import { logger } from '@/lib/logger';

// Interface สำหรับข้อมูลวัสดุ
export interface Material {
  id?: string;
  name: string;
  category: string;
  unit: string;
  priceOptions: {
    budget: {
      price: number;
      supplier: string;
      phone: string;
      address: string;
    };
    standard: {
      price: number;
      supplier: string;
      phone: string;
      address: string;
    };
    premium: {
      price: number;
      supplier: string;
      phone: string;
      address: string;
    };
  };
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Interface สำหรับข้อมูลราคาออนไลน์
export interface OnlinePriceRecord {
  id?: string;
  materialName: string;
  supplierName: string;
  supplierPhone: string;
  searchQuery: string;
  results: Array<{
    source: string;
    price: number;
    url: string;
    lastChecked: string;
  }>;
  averagePrice: number;
  marketAnalysis: string;
  reliability: number;
  recommendations: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Interface สำหรับการวิเคราะห์โครงการ
export interface ProjectAnalysis {
  id?: string;
  projectName: string;
  projectType: string;
  budget: number;
  materials: Material[];
  designAnalysis: {
    overview: string;
    keyFeatures: string[];
    requirements: string[];
    challenges: string[];
  };
  totalCost: {
    budget: number;
    standard: number;
    premium: number;
  };
  recommendations: string[];
  timeline: string;
  riskAssessment: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Helper function to ensure Firebase is initialized
function ensureFirebase(): Firestore {
  const db = getDb();
  if (!db) {
    throw new Error('Firebase not initialized');
  }
  return db;
}

// ==================== MATERIAL FUNCTIONS ====================

export async function addMaterial(material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const db = ensureFirebase();
    
    const docRef = await addDoc(collection(db, 'materials'), {
      ...material,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    logger.info('Material added successfully', { materialId: docRef.id, name: material.name }, 'Materials');
    return docRef.id;
  } catch (error) {
    logger.error('Error adding material:', error, 'Materials');
    throw error;
  }
}

export async function getMaterial(materialId: string): Promise<Material | null> {
  try {
    const db = ensureFirebase();
    const docRef = doc(db, 'materials', materialId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Material;
    } else {
      return null;
    }
  } catch (error) {
    logger.error('Error getting material:', error, 'Materials');
    throw error;
  }
}

export async function listMaterials(category?: string): Promise<Material[]> {
  try {
    const db = ensureFirebase();
    let q = query(collection(db, 'materials'), orderBy('name'));
    
    if (category) {
      q = query(collection(db, 'materials'), where('category', '==', category), orderBy('name'));
    }
    
    const querySnapshot = await getDocs(q);
    const materials: Material[] = [];
    
    querySnapshot.forEach((doc) => {
      materials.push({ id: doc.id, ...doc.data() } as Material);
    });
    
    return materials;
  } catch (error) {
    logger.error('Error listing materials:', error, 'Materials');
    throw error;
  }
}

export async function updateMaterial(materialId: string, updates: Partial<Material>): Promise<void> {
  try {
    const db = ensureFirebase();
    const docRef = doc(db, 'materials', materialId);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    
    logger.info('Material updated successfully', { materialId }, 'Materials');
  } catch (error) {
    logger.error('Error updating material:', error, 'Materials');
    throw error;
  }
}

export async function deleteMaterial(materialId: string): Promise<void> {
  try {
    const db = ensureFirebase();
    const docRef = doc(db, 'materials', materialId);
    await deleteDoc(docRef);
    
    logger.info('Material deleted successfully', { materialId }, 'Materials');
  } catch (error) {
    logger.error('Error deleting material:', error, 'Materials');
    throw error;
  }
}

// ==================== ONLINE PRICE FUNCTIONS ====================

export async function saveOnlinePriceRecord(record: Omit<OnlinePriceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const db = ensureFirebase();
    const docRef = await addDoc(collection(db, 'onlinePrices'), {
      ...record,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    logger.info('Online price record saved', { recordId: docRef.id, materialName: record.materialName }, 'OnlinePrices');
    return docRef.id;
  } catch (error) {
    logger.error('Error saving online price record:', error, 'OnlinePrices');
    throw error;
  }
}

export async function getOnlinePriceHistory(materialName: string, limit_count: number = 10): Promise<OnlinePriceRecord[]> {
  try {
    const db = ensureFirebase();
    const q = query(
      collection(db, 'onlinePrices'),
      where('materialName', '==', materialName),
      orderBy('createdAt', 'desc'),
      limit(limit_count)
    );
    
    const querySnapshot = await getDocs(q);
    const records: OnlinePriceRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() } as OnlinePriceRecord);
    });
    
    return records;
  } catch (error) {
    logger.error('Error getting online price history:', error, 'OnlinePrices');
    throw error;
  }
}

export async function getSupplierPriceHistory(supplierName: string): Promise<OnlinePriceRecord[]> {
  try {
    const db = ensureFirebase();
    const q = query(
      collection(db, 'onlinePrices'),
      where('supplierName', '==', supplierName),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const records: OnlinePriceRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() } as OnlinePriceRecord);
    });
    
    return records;
  } catch (error) {
    logger.error('Error getting supplier price history:', error, 'OnlinePrices');
    throw error;
  }
}

// ==================== PROJECT ANALYSIS FUNCTIONS ====================

export async function saveProjectAnalysis(analysis: Omit<ProjectAnalysis, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const db = ensureFirebase();
    const docRef = await addDoc(collection(db, 'projectAnalyses'), {
      ...analysis,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    logger.info('Project analysis saved', { analysisId: docRef.id, projectName: analysis.projectName }, 'ProjectAnalysis');
    return docRef.id;
  } catch (error) {
    logger.error('Error saving project analysis:', error, 'ProjectAnalysis');
    throw error;
  }
}

export async function getProjectAnalysis(analysisId: string): Promise<ProjectAnalysis | null> {
  try {
    const db = ensureFirebase();
    const docRef = doc(db, 'projectAnalyses', analysisId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ProjectAnalysis;
    } else {
      return null;
    }
  } catch (error) {
    logger.error('Error getting project analysis:', error, 'ProjectAnalysis');
    throw error;
  }
}

export async function listProjectAnalyses(limit_count: number = 20): Promise<ProjectAnalysis[]> {
  try {
    const db = ensureFirebase();
    const q = query(
      collection(db, 'projectAnalyses'),
      orderBy('createdAt', 'desc'),
      limit(limit_count)
    );
    
    const querySnapshot = await getDocs(q);
    const analyses: ProjectAnalysis[] = [];
    
    querySnapshot.forEach((doc) => {
      analyses.push({ id: doc.id, ...doc.data() } as ProjectAnalysis);
    });
    
    return analyses;
  } catch (error) {
    logger.error('Error listing project analyses:', error, 'ProjectAnalysis');
    throw error;
  }
}

// ==================== BATCH OPERATIONS ====================

export async function saveMaterialsBatch(materials: Material[]): Promise<string[]> {
  try {
    const db = ensureFirebase();
    const batch = writeBatch(db);
    const docRefs: string[] = [];
    
    materials.forEach((material) => {
      const docRef = doc(collection(db, 'materials'));
      batch.set(docRef, {
        ...material,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      docRefs.push(docRef.id);
    });
    
    await batch.commit();
    
    logger.info('Materials batch saved successfully', { count: materials.length }, 'Materials');
    return docRefs;
  } catch (error) {
    logger.error('Error saving materials batch:', error, 'Materials');
    throw error;
  }
}

// ==================== ANALYTICS FUNCTIONS ====================

export async function getMaterialPriceAnalytics(category?: string) {
  try {
    const materials = await listMaterials(category);
    
    const analytics = {
      totalMaterials: materials.length,
      averagePrices: {
        budget: 0,
        standard: 0,
        premium: 0,
      },
      categories: {} as Record<string, number>,
      suppliers: {} as Record<string, number>,
    };
    
    if (materials.length === 0) return analytics;
    
    let totalBudget = 0;
    let totalStandard = 0;
    let totalPremium = 0;
    
    materials.forEach((material) => {
      // Calculate average prices
      totalBudget += material.priceOptions.budget.price;
      totalStandard += material.priceOptions.standard.price;
      totalPremium += material.priceOptions.premium.price;
      
      // Count categories
      analytics.categories[material.category] = (analytics.categories[material.category] || 0) + 1;
      
      // Count suppliers
      analytics.suppliers[material.priceOptions.standard.supplier] = 
        (analytics.suppliers[material.priceOptions.standard.supplier] || 0) + 1;
    });
    
    analytics.averagePrices.budget = totalBudget / materials.length;
    analytics.averagePrices.standard = totalStandard / materials.length;
    analytics.averagePrices.premium = totalPremium / materials.length;
    
    return analytics;
  } catch (error) {
    logger.error('Error getting material price analytics:', error, 'Analytics');
    throw error;
  }
}

export async function getProjectAnalyticsData() {
  try {
    const analyses = await listProjectAnalyses(50);
    
    const analytics = {
      totalProjects: analyses.length,
      averageBudget: 0,
      projectTypes: {} as Record<string, number>,
      costDistribution: {
        budget: 0,
        standard: 0,
        premium: 0,
      },
      monthlyTrends: {} as Record<string, number>,
    };
    
    if (analyses.length === 0) return analytics;
    
    let totalBudget = 0;
    let totalBudgetCost = 0;
    let totalStandardCost = 0;
    let totalPremiumCost = 0;
    
    analyses.forEach((analysis) => {
      totalBudget += analysis.budget;
      totalBudgetCost += analysis.totalCost.budget;
      totalStandardCost += analysis.totalCost.standard;
      totalPremiumCost += analysis.totalCost.premium;
      
      // Count project types
      analytics.projectTypes[analysis.projectType] = (analytics.projectTypes[analysis.projectType] || 0) + 1;
      
      // Monthly trends (if createdAt exists)
      if (analysis.createdAt) {
        const month = new Date(analysis.createdAt.toDate()).toLocaleDateString('th-TH', { year: 'numeric', month: 'short' });
        analytics.monthlyTrends[month] = (analytics.monthlyTrends[month] || 0) + 1;
      }
    });
    
    analytics.averageBudget = totalBudget / analyses.length;
    analytics.costDistribution.budget = totalBudgetCost / analyses.length;
    analytics.costDistribution.standard = totalStandardCost / analyses.length;
    analytics.costDistribution.premium = totalPremiumCost / analyses.length;
    
    return analytics;
  } catch (error) {
    logger.error('Error getting project analytics data:', error, 'Analytics');
    throw error;
  }
}
