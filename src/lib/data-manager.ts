/**
 * 🎯 Data Manager - ระบบจัดการข้อมูลแบบ Offline-First
 * แทนที่ Firebase ด้วย Local Storage + IndexedDB
 */

import { LocalStorageService, STORAGE_KEYS } from './local-storage';

export interface Project {
  id: string;
  name: string;
  organization: string;
  type: string;
  budget: string;
  address: string;
  contactPerson: string;
  phone: string;
  bidSubmissionDeadline: string;
  createdAt: string;
  status?: 'active' | 'pending' | 'completed' | 'cancelled';
  progress?: number;
  tags?: string[];
}

export interface Contact {
  id: string;
  type: 'ลูกค้า' | 'ซัพพลายเออร์' | 'คู่ค้า';
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  notes?: string;
  lastContact?: string;
}

export interface PriceItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  supplier?: string;
  lastUpdated: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export class DataManager {
  // Projects
  static getProjects(): Project[] {
    return LocalStorageService.getItem<Project[]>(STORAGE_KEYS.PROJECTS) || [];
  }

  static saveProject(project: Project): boolean {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    
    return LocalStorageService.setItem(STORAGE_KEYS.PROJECTS, projects);
  }

  static deleteProject(id: string): boolean {
    const projects = this.getProjects().filter(p => p.id !== id);
    return LocalStorageService.setItem(STORAGE_KEYS.PROJECTS, projects);
  }

  static getProjectById(id: string): Project | null {
    return this.getProjects().find(p => p.id === id) || null;
  }

  static searchProjects(query: string): Project[] {
    const lowerQuery = query.toLowerCase();
    return this.getProjects().filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.organization.toLowerCase().includes(lowerQuery) ||
      p.address.toLowerCase().includes(lowerQuery)
    );
  }

  // Contacts
  static getContacts(): Contact[] {
    return LocalStorageService.getItem<Contact[]>(STORAGE_KEYS.CONTACTS) || [];
  }

  static saveContact(contact: Contact): boolean {
    const contacts = this.getContacts();
    const index = contacts.findIndex(c => c.id === contact.id);
    
    if (index >= 0) {
      contacts[index] = contact;
    } else {
      contacts.push(contact);
    }
    
    return LocalStorageService.setItem(STORAGE_KEYS.CONTACTS, contacts);
  }

  static deleteContact(id: string): boolean {
    const contacts = this.getContacts().filter(c => c.id !== id);
    return LocalStorageService.setItem(STORAGE_KEYS.CONTACTS, contacts);
  }

  // Price List
  static getPriceList(): PriceItem[] {
    return LocalStorageService.getItem<PriceItem[]>(STORAGE_KEYS.PRICE_LIST) || [];
  }

  static savePriceItem(item: PriceItem): boolean {
    const items = this.getPriceList();
    const index = items.findIndex(i => i.id === item.id);
    
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    
    return LocalStorageService.setItem(STORAGE_KEYS.PRICE_LIST, items);
  }

  static searchPriceList(query: string): PriceItem[] {
    const lowerQuery = query.toLowerCase();
    return this.getPriceList().filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Notifications
  static getNotifications(): Notification[] {
    return LocalStorageService.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || [];
  }

  static addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): boolean {
    const notifications = this.getNotifications();
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    notifications.unshift(newNotification);
    
    // เก็บแค่ 100 รายการล่าสุด
    const limited = notifications.slice(0, 100);
    return LocalStorageService.setItem(STORAGE_KEYS.NOTIFICATIONS, limited);
  }

  static markNotificationAsRead(id: string): boolean {
    const notifications = this.getNotifications();
    const notification = notifications.find(n => n.id === id);
    
    if (notification) {
      notification.read = true;
      return LocalStorageService.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
    
    return false;
  }

  static markAllNotificationsAsRead(): boolean {
    const notifications = this.getNotifications().map(n => ({ ...n, read: true }));
    return LocalStorageService.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  static getUnreadCount(): number {
    return this.getNotifications().filter(n => !n.read).length;
  }

  // Export/Import
  static exportData(): string {
    const data = {
      projects: this.getProjects(),
      contacts: this.getContacts(),
      priceList: this.getPriceList(),
      notifications: this.getNotifications(),
      exportedAt: new Date().toISOString(),
    };
    
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.projects) LocalStorageService.setItem(STORAGE_KEYS.PROJECTS, data.projects);
      if (data.contacts) LocalStorageService.setItem(STORAGE_KEYS.CONTACTS, data.contacts);
      if (data.priceList) LocalStorageService.setItem(STORAGE_KEYS.PRICE_LIST, data.priceList);
      if (data.notifications) LocalStorageService.setItem(STORAGE_KEYS.NOTIFICATIONS, data.notifications);
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Statistics
  static getStatistics() {
    const projects = this.getProjects();
    const contacts = this.getContacts();
    
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      totalContacts: contacts.length,
      customers: contacts.filter(c => c.type === 'ลูกค้า').length,
      suppliers: contacts.filter(c => c.type === 'ซัพพลายเออร์').length,
      unreadNotifications: this.getUnreadCount(),
    };
  }
}

// Initialize with sample data
export function initializeSampleData() {
  if (DataManager.getProjects().length === 0) {
    const sampleProjects: Project[] = [
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
        status: 'active',
        progress: 65,
        tags: ['ก่อสร้าง', 'อาคาร', 'ภาครัฐ'],
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
        status: 'active',
        progress: 40,
        tags: ['ไฟฟ้า', 'โรงพยาบาล'],
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
        status: 'pending',
        progress: 20,
        tags: ['ปรับอากาศ', 'มหาวิทยาลัย'],
      },
    ];

    sampleProjects.forEach(p => DataManager.saveProject(p));
  }

  if (DataManager.getContacts().length === 0) {
    const sampleContacts: Contact[] = [
      {
        id: '1',
        type: 'ลูกค้า',
        name: 'บริษัท ABC จำกัด',
        email: 'contact@abc.com',
        phone: '02-111-2222',
        address: 'กรุงเทพมหานคร',
        contactPerson: 'นายสมชาย',
        lastContact: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'ซัพพลายเออร์',
        name: 'บริษัท XYZ วัสดุก่อสร้าง',
        email: 'sales@xyz.com',
        phone: '02-333-4444',
        address: 'สมุทรปราการ',
        contactPerson: 'นางสาวสมหญิง',
        lastContact: new Date().toISOString(),
      },
    ];

    sampleContacts.forEach(c => DataManager.saveContact(c));
  }

  // Add welcome notification
  DataManager.addNotification({
    type: 'success',
    title: 'ยินดีต้อนรับ!',
    message: 'ระบบพร้อมใช้งานแล้ว - ไม่ต้องใช้ Firebase!',
  });
}
