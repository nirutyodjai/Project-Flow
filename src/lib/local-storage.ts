/**
 * 🚀 Enhanced Local Storage Service
 * ระบบจัดเก็บข้อมูลที่ทรงพลัง - ไม่ต้องใช้ Firebase!
 */

export class LocalStorageService {
  private static isClient = typeof window !== 'undefined';
  private static listeners: Map<string, Set<(value: any) => void>> = new Map();

  /**
   * บันทึกข้อมูลพร้อม Real-time Update
   */
  static setItem<T>(key: string, value: T): boolean {
    if (!this.isClient) return false;
    
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      
      // แจ้ง listeners ทั้งหมด
      this.notifyListeners(key, value);
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  /**
   * Subscribe เพื่อรับการแจ้งเตือนเมื่อข้อมูลเปลี่ยน
   */
  static subscribe<T>(key: string, callback: (value: T) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);
    
    // ส่งค่าปัจจุบันให้ทันที
    const currentValue = this.getItem<T>(key);
    if (currentValue !== null) {
      callback(currentValue);
    }
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  private static notifyListeners(key: string, value: any) {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(callback => callback(value));
    }
  }

  /**
   * ดึงข้อมูล
   */
  static getItem<T>(key: string): T | null {
    if (!this.isClient) return null;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  /**
   * ลบข้อมูล
   */
  static removeItem(key: string): boolean {
    if (!this.isClient) return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }

  /**
   * ล้างข้อมูลทั้งหมด
   */
  static clear(): boolean {
    if (!this.isClient) return false;
    
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  /**
   * ตรวจสอบว่ามี key หรือไม่
   */
  static hasItem(key: string): boolean {
    if (!this.isClient) return false;
    return localStorage.getItem(key) !== null;
  }

  /**
   * ดึง keys ทั้งหมด
   */
  static getAllKeys(): string[] {
    if (!this.isClient) return [];
    
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  }
}

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  PROJECTS: 'projects',
  CONTACTS: 'contacts',
  QUOTATIONS: 'quotations',
  PRICE_LIST: 'priceList',
  UPLOADED_FILES: 'uploadedFiles',
  NOTIFICATIONS: 'notifications',
  USER_PREFERENCES: 'userPreferences',
  PROJECT_ANALYSES: 'projectAnalyses',
  AI_HISTORY: 'aiHistory',
  MARKET_DATA: 'marketData',
  USER_PROFILE: 'userProfile',
  DASHBOARD_WIDGETS: 'dashboardWidgets',
  BOOKMARKS: 'bookmarks',
  RECENT_SEARCHES: 'recentSearches',
} as const;

/**
 * Helper Functions
 */

// Projects
export function saveProjects(projects: any[]) {
  return LocalStorageService.setItem(STORAGE_KEYS.PROJECTS, projects);
}

export function getProjects(): any[] {
  return LocalStorageService.getItem(STORAGE_KEYS.PROJECTS) || [];
}

// Contacts
export function saveContacts(contacts: any[]) {
  return LocalStorageService.setItem(STORAGE_KEYS.CONTACTS, contacts);
}

export function getContacts(): any[] {
  return LocalStorageService.getItem(STORAGE_KEYS.CONTACTS) || [];
}

// Uploaded Files
export function saveUploadedFile(file: { name: string; url: string; size: number; type: string; uploadedAt: string }) {
  const files = LocalStorageService.getItem<any[]>(STORAGE_KEYS.UPLOADED_FILES) || [];
  files.push({ ...file, id: Date.now().toString() });
  return LocalStorageService.setItem(STORAGE_KEYS.UPLOADED_FILES, files);
}

export function getUploadedFiles(): any[] {
  return LocalStorageService.getItem(STORAGE_KEYS.UPLOADED_FILES) || [];
}

// Notifications
export function saveNotification(notification: any) {
  const notifications = LocalStorageService.getItem<any[]>(STORAGE_KEYS.NOTIFICATIONS) || [];
  notifications.unshift({ ...notification, id: Date.now().toString(), timestamp: new Date().toISOString() });
  // เก็บแค่ 50 รายการล่าสุด
  const limited = notifications.slice(0, 50);
  return LocalStorageService.setItem(STORAGE_KEYS.NOTIFICATIONS, limited);
}

export function getNotifications(): any[] {
  return LocalStorageService.getItem(STORAGE_KEYS.NOTIFICATIONS) || [];
}

export function clearNotifications() {
  return LocalStorageService.setItem(STORAGE_KEYS.NOTIFICATIONS, []);
}

// Initialize default data
export function initializeDefaultData() {
  if (!LocalStorageService.hasItem(STORAGE_KEYS.PROJECTS)) {
    const defaultProjects = [
      {
        id: '1',
        name: 'ก่อสร้างอาคารสำนักงาน 5 ชั้น',
        organization: 'กรมทางหลวง',
        type: 'ภาครัฐ',
        budget: '50,000,000',
        address: 'กรุงเทพมหานคร',
        contactPerson: 'นายสมชาย ใจดี',
        phone: '02-123-4567',
        bidSubmissionDeadline: '2025-11-30',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'ปรับปรุงระบบไฟฟ้าโรงพยาบาล',
        organization: 'โรงพยาบาลจุฬาลงกรณ์',
        type: 'โรงพยาบาล',
        budget: '15,000,000',
        address: 'กรุงเทพมหานคร',
        contactPerson: 'นางสาวสมหญิง ดีมาก',
        phone: '02-256-4000',
        bidSubmissionDeadline: '2025-11-15',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'ติดตั้งระบบปรับอากาศอาคารเรียน',
        organization: 'มหาวิทยาลัยธรรมศาสตร์',
        type: 'มหาวิทยาลัย',
        budget: '8,000,000',
        address: 'ปทุมธานี',
        contactPerson: 'ผศ.ดร.สมศักดิ์ วิชาการ',
        phone: '02-564-4000',
        bidSubmissionDeadline: '2025-12-01',
        createdAt: new Date().toISOString(),
      },
    ];
    saveProjects(defaultProjects);
  }

  if (!LocalStorageService.hasItem(STORAGE_KEYS.CONTACTS)) {
    const defaultContacts = [
      {
        id: '1',
        type: 'ลูกค้า',
        name: 'บริษัท ABC จำกัด',
        email: 'contact@abc.com',
        phone: '02-111-2222',
        address: 'กรุงเทพมหานคร',
        contactPerson: 'นายสมชาย',
      },
      {
        id: '2',
        type: 'ซัพพลายเออร์',
        name: 'บริษัท XYZ วัสดุก่อสร้าง',
        email: 'sales@xyz.com',
        phone: '02-333-4444',
        address: 'สมุทรปราการ',
        contactPerson: 'นางสาวสมหญิง',
      },
    ];
    saveContacts(defaultContacts);
  }
}
