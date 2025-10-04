/**
 * Notification Types & Interfaces
 * สำหรับระบบแจ้งเตือนแบบ Real-time
 */

export type NotificationType = 
  | 'new-project'           // งานใหม่
  | 'deadline-warning'      // ใกล้ปิดรับ
  | 'competitor-bid'        // คู่แข่งยื่นข้อเสนอ
  | 'project-won'           // ชนะงาน
  | 'project-lost'          // แพ้งาน
  | 'payment-received'      // ได้รับเงิน
  | 'payment-due'           // ถึงกำหนดชำระ
  | 'document-uploaded'     // อัพโหลดเอกสาร
  | 'analysis-complete'     // วิเคราะห์เสร็จ
  | 'team-mention'          // มีคนแท็ก
  | 'system-update'         // อัปเดตระบบ
  | 'error'                 // ข้อผิดพลาด
  | 'success'               // สำเร็จ
  | 'info';                 // ข้อมูลทั่วไป

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  userId: string;
  
  // Optional fields
  projectId?: string;
  projectName?: string;
  amount?: number;
  deadline?: Date;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  slackNotifications: boolean;
  
  // Notification preferences by type
  preferences: {
    newProject: boolean;
    deadlineWarning: boolean;
    competitorBid: boolean;
    projectWon: boolean;
    projectLost: boolean;
    paymentReceived: boolean;
    paymentDue: boolean;
  };
  
  // Timing preferences
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string;
  timezone: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

export interface CreateNotificationInput {
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  userId: string;
  projectId?: string;
  projectName?: string;
  amount?: number;
  deadline?: Date;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}
