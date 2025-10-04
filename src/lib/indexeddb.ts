/**
 * 💾 IndexedDB Service
 * ระบบจัดเก็บข้อมูลขั้นสูง - รองรับข้อมูลขนาดใหญ่
 */

const DB_NAME = 'ProjectFlowDB';
const DB_VERSION = 1;

export interface DBStore {
  name: string;
  keyPath: string;
  indexes?: { name: string; keyPath: string; unique?: boolean }[];
}

const stores: DBStore[] = [
  {
    name: 'projects',
    keyPath: 'id',
    indexes: [
      { name: 'organization', keyPath: 'organization' },
      { name: 'type', keyPath: 'type' },
      { name: 'status', keyPath: 'status' },
      { name: 'createdAt', keyPath: 'createdAt' },
    ],
  },
  {
    name: 'contacts',
    keyPath: 'id',
    indexes: [
      { name: 'type', keyPath: 'type' },
      { name: 'name', keyPath: 'name' },
    ],
  },
  {
    name: 'files',
    keyPath: 'id',
    indexes: [
      { name: 'projectId', keyPath: 'projectId' },
      { name: 'type', keyPath: 'type' },
      { name: 'uploadedAt', keyPath: 'uploadedAt' },
    ],
  },
  {
    name: 'notifications',
    keyPath: 'id',
    indexes: [
      { name: 'read', keyPath: 'read' },
      { name: 'timestamp', keyPath: 'timestamp' },
    ],
  },
];

/**
 * เปิดการเชื่อมต่อ IndexedDB
 */
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is only available in browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // สร้าง object stores
      stores.forEach((store) => {
        if (!db.objectStoreNames.contains(store.name)) {
          const objectStore = db.createObjectStore(store.name, {
            keyPath: store.keyPath,
          });

          // สร้าง indexes
          store.indexes?.forEach((index) => {
            objectStore.createIndex(index.name, index.keyPath, {
              unique: index.unique || false,
            });
          });
        }
      });
    };
  });
}

/**
 * บันทึกข้อมูล
 */
export async function setItem<T>(storeName: string, value: T): Promise<boolean> {
  try {
    const db = await openDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    store.put(value);
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error setting item in IndexedDB:', error);
    return false;
  }
}

/**
 * ดึงข้อมูล
 */
export async function getItem<T>(storeName: string, key: string): Promise<T | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting item from IndexedDB:', error);
    return null;
  }
}

/**
 * ดึงข้อมูลทั้งหมด
 */
export async function getAllItems<T>(storeName: string): Promise<T[]> {
  try {
    const db = await openDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting all items from IndexedDB:', error);
    return [];
  }
}

/**
 * ลบข้อมูล
 */
export async function deleteItem(storeName: string, key: string): Promise<boolean> {
  try {
    const db = await openDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    store.delete(key);
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error deleting item from IndexedDB:', error);
    return false;
  }
}

/**
 * ค้นหาด้วย Index
 */
export async function queryByIndex<T>(
  storeName: string,
  indexName: string,
  value: any
): Promise<T[]> {
  try {
    const db = await openDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error querying by index:', error);
    return [];
  }
}

/**
 * นับจำนวนข้อมูล
 */
export async function countItems(storeName: string): Promise<number> {
  try {
    const db = await openDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.count();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error counting items:', error);
    return 0;
  }
}

/**
 * ล้างข้อมูลทั้งหมด
 */
export async function clearStore(storeName: string): Promise<boolean> {
  try {
    const db = await openDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    store.clear();
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error clearing store:', error);
    return false;
  }
}

/**
 * บันทึกไฟล์ (Binary data)
 */
export async function saveFile(file: {
  id: string;
  name: string;
  type: string;
  size: number;
  data: Blob;
  projectId?: string;
  uploadedAt: Date;
}): Promise<boolean> {
  return setItem('files', file);
}

/**
 * ดึงไฟล์
 */
export async function getFile(id: string): Promise<any> {
  return getItem('files', id);
}

/**
 * ดึงไฟล์ทั้งหมดของโครงการ
 */
export async function getProjectFiles(projectId: string): Promise<any[]> {
  return queryByIndex('files', 'projectId', projectId);
}

/**
 * Export ข้อมูลทั้งหมด
 */
export async function exportAllData(): Promise<any> {
  const data: any = {};

  for (const store of stores) {
    data[store.name] = await getAllItems(store.name);
  }

  return data;
}

/**
 * Import ข้อมูลทั้งหมด
 */
export async function importAllData(data: any): Promise<boolean> {
  try {
    for (const storeName of Object.keys(data)) {
      const items = data[storeName];
      
      for (const item of items) {
        await setItem(storeName, item);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}
