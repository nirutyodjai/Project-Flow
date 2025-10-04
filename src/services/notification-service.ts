/**
 * Notification Service
 * จัดการระบบแจ้งเตือนแบบ Real-time
 */

import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
  Timestamp,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import type { 
  Notification, 
  NotificationSettings, 
  NotificationStats,
  CreateNotificationInput,
  NotificationType,
  NotificationPriority
} from '@/types/notification';

const NOTIFICATIONS_COLLECTION = 'notifications';
const SETTINGS_COLLECTION = 'notificationSettings';

export class NotificationService {
  /**
   * สร้าง Notification ใหม่
   */
  static async createNotification(input: CreateNotificationInput): Promise<Notification> {
    try {
      const notification: Omit<Notification, 'id'> = {
        type: input.type,
        priority: input.priority || 'medium',
        title: input.title,
        message: input.message,
        timestamp: new Date(),
        read: false,
        userId: input.userId,
        projectId: input.projectId,
        projectName: input.projectName,
        amount: input.amount,
        deadline: input.deadline,
        actionUrl: input.actionUrl,
        actionLabel: input.actionLabel,
        metadata: input.metadata,
      };

      const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
        ...notification,
        timestamp: Timestamp.fromDate(notification.timestamp),
        deadline: notification.deadline ? Timestamp.fromDate(notification.deadline) : null,
      });

      return {
        ...notification,
        id: docRef.id,
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * ดึง Notifications ของ User
   */
  static async getUserNotifications(
    userId: string, 
    limitCount: number = 50,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    try {
      let q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      if (unreadOnly) {
        q = query(
          collection(db, NOTIFICATIONS_COLLECTION),
          where('userId', '==', userId),
          where('read', '==', false),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
      }

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          deadline: data.deadline?.toDate(),
        } as Notification;
      });
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  /**
   * ทำเครื่องหมายว่าอ่านแล้ว
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      await updateDoc(notificationRef, {
        read: true,
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
   */
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  }

  /**
   * ลบ Notification
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * ลบ Notifications ที่อ่านแล้วทั้งหมด
   */
  static async deleteReadNotifications(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('read', '==', true)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      throw error;
    }
  }

  /**
   * ดึงสถิติ Notifications
   */
  static async getNotificationStats(userId: string): Promise<NotificationStats> {
    try {
      const notifications = await this.getUserNotifications(userId, 1000);

      const stats: NotificationStats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length,
        byType: {} as Record<NotificationType, number>,
        byPriority: {} as Record<NotificationPriority, number>,
      };

      notifications.forEach(notification => {
        // Count by type
        stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
        
        // Count by priority
        stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time notifications
   */
  static subscribeToNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void
  ): () => void {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          deadline: data.deadline?.toDate(),
        } as Notification;
      });

      callback(notifications);
    });

    return unsubscribe;
  }

  /**
   * บันทึกการตั้งค่า Notifications
   */
  static async saveSettings(settings: NotificationSettings): Promise<void> {
    try {
      const settingsRef = doc(db, SETTINGS_COLLECTION, settings.userId);
      await updateDoc(settingsRef, settings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      throw error;
    }
  }

  /**
   * ดึงการตั้งค่า Notifications
   */
  static async getSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
      const snapshot = await getDocs(query(collection(db, SETTINGS_COLLECTION), where('userId', '==', userId)));
      
      if (snapshot.empty) {
        return null;
      }

      return snapshot.docs[0].data() as NotificationSettings;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      throw error;
    }
  }

  /**
   * สร้าง Notification สำหรับงานใหม่
   */
  static async notifyNewProject(
    userId: string,
    projectId: string,
    projectName: string,
    deadline: Date,
    amount?: number
  ): Promise<Notification> {
    const daysUntilDeadline = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    return this.createNotification({
      type: 'new-project',
      priority: daysUntilDeadline <= 3 ? 'high' : 'medium',
      title: '🎯 งานใหม่!',
      message: `${projectName} - ปิดรับใน ${daysUntilDeadline} วัน`,
      userId,
      projectId,
      projectName,
      amount,
      deadline,
      actionUrl: `/projects/${projectId}`,
      actionLabel: 'ดูรายละเอียด',
    });
  }

  /**
   * สร้าง Notification สำหรับแจ้งเตือนใกล้ปิดรับ
   */
  static async notifyDeadlineWarning(
    userId: string,
    projectId: string,
    projectName: string,
    deadline: Date
  ): Promise<Notification> {
    const hoursUntilDeadline = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60));
    
    return this.createNotification({
      type: 'deadline-warning',
      priority: hoursUntilDeadline <= 24 ? 'urgent' : 'high',
      title: '⚠️ ใกล้ปิดรับ!',
      message: `${projectName} - เหลือเวลาอีก ${hoursUntilDeadline} ชั่วโมง`,
      userId,
      projectId,
      projectName,
      deadline,
      actionUrl: `/projects/${projectId}`,
      actionLabel: 'ยื่นข้อเสนอ',
    });
  }

  /**
   * สร้าง Notification สำหรับชนะงาน
   */
  static async notifyProjectWon(
    userId: string,
    projectId: string,
    projectName: string,
    amount: number
  ): Promise<Notification> {
    return this.createNotification({
      type: 'project-won',
      priority: 'high',
      title: '🎉 ชนะงาน!',
      message: `ยินดีด้วย! คุณชนะงาน ${projectName}`,
      userId,
      projectId,
      projectName,
      amount,
      actionUrl: `/projects/${projectId}`,
      actionLabel: 'ดูรายละเอียด',
    });
  }

  /**
   * สร้าง Notification สำหรับได้รับเงิน
   */
  static async notifyPaymentReceived(
    userId: string,
    projectId: string,
    projectName: string,
    amount: number
  ): Promise<Notification> {
    return this.createNotification({
      type: 'payment-received',
      priority: 'medium',
      title: '💰 ได้รับเงิน',
      message: `ได้รับเงิน ${amount.toLocaleString()} บาท จาก ${projectName}`,
      userId,
      projectId,
      projectName,
      amount,
      actionUrl: `/payments/${projectId}`,
      actionLabel: 'ดูรายละเอียด',
    });
  }
}
