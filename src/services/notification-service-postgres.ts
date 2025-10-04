/**
 * Notification Service (PostgreSQL)
 * ใช้ Prisma แทน Firebase
 */

import { prisma } from '@/lib/prisma';
import type { 
  Notification, 
  CreateNotificationInput,
  NotificationStats,
} from '@/types/notification';

export class NotificationServicePostgres {
  /**
   * สร้าง Notification ใหม่
   */
  static async createNotification(input: CreateNotificationInput): Promise<Notification> {
    const notification = await prisma.notification.create({
      data: {
        type: input.type,
        priority: input.priority || 'medium',
        title: input.title,
        message: input.message,
        userId: input.userId,
        projectId: input.projectId,
        projectName: input.projectName,
        amount: input.amount,
        deadline: input.deadline,
        actionUrl: input.actionUrl,
        actionLabel: input.actionLabel,
        metadata: input.metadata as any,
        isRead: false,
      },
    });

    return {
      id: notification.id,
      type: notification.type as any,
      priority: notification.priority as any,
      title: notification.title,
      message: notification.message,
      timestamp: notification.createdAt,
      read: notification.isRead,
      userId: notification.userId,
      projectId: notification.projectId || undefined,
      projectName: notification.projectName || undefined,
      amount: notification.amount || undefined,
      deadline: notification.deadline || undefined,
      actionUrl: notification.actionUrl || undefined,
      actionLabel: notification.actionLabel || undefined,
      metadata: notification.metadata as any,
    };
  }

  /**
   * ดึง Notifications ของ User
   */
  static async getUserNotifications(
    userId: string, 
    limitCount: number = 50,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: limitCount,
    });

    return notifications.map(n => ({
      id: n.id,
      type: n.type as any,
      priority: n.priority as any,
      title: n.title,
      message: n.message,
      timestamp: n.createdAt,
      read: n.isRead,
      userId: n.userId,
      projectId: n.projectId || undefined,
      projectName: n.projectName || undefined,
      amount: n.amount || undefined,
      deadline: n.deadline || undefined,
      actionUrl: n.actionUrl || undefined,
      actionLabel: n.actionLabel || undefined,
      metadata: n.metadata as any,
    }));
  }

  /**
   * ทำเครื่องหมายว่าอ่านแล้ว
   */
  static async markAsRead(notificationId: string): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  /**
   * ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
   */
  static async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { 
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  /**
   * ลบ Notification
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    await prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  /**
   * ลบ Notifications ที่อ่านแล้วทั้งหมด
   */
  static async deleteReadNotifications(userId: string): Promise<void> {
    await prisma.notification.deleteMany({
      where: { 
        userId,
        isRead: true,
      },
    });
  }

  /**
   * ดึงสถิติ Notifications
   */
  static async getNotificationStats(userId: string): Promise<NotificationStats> {
    const notifications = await this.getUserNotifications(userId, 1000);

    const stats: NotificationStats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType: {} as any,
      byPriority: {} as any,
    };

    notifications.forEach(notification => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
      stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
    });

    return stats;
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
