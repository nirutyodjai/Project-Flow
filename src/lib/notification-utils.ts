/**
 * Notification Utilities
 * Helper functions สำหรับ Notifications
 */

import { 
  Bell, 
  AlertTriangle, 
  Trophy, 
  DollarSign, 
  FileText, 
  Users, 
  Info,
  CheckCircle,
  XCircle,
  Target,
  Clock,
  type LucideIcon
} from 'lucide-react';
import type { NotificationType, NotificationPriority } from '@/types/notification';

/**
 * ดึง Icon ตาม Notification Type
 */
export function getNotificationIcon(type: NotificationType): LucideIcon {
  const iconMap: Record<NotificationType, LucideIcon> = {
    'new-project': Target,
    'deadline-warning': Clock,
    'competitor-bid': Users,
    'project-won': Trophy,
    'project-lost': XCircle,
    'payment-received': DollarSign,
    'payment-due': AlertTriangle,
    'document-uploaded': FileText,
    'analysis-complete': CheckCircle,
    'team-mention': Users,
    'system-update': Info,
    'error': XCircle,
    'success': CheckCircle,
    'info': Info,
  };

  return iconMap[type] || Bell;
}

/**
 * ดึงสีตาม Priority
 */
export function getNotificationColor(priority: NotificationPriority): string {
  const colorMap: Record<NotificationPriority, string> = {
    low: 'text-muted-foreground',
    medium: 'text-blue-500',
    high: 'text-orange-500',
    urgent: 'text-red-500',
  };

  return colorMap[priority] || 'text-muted-foreground';
}

/**
 * ดึงข้อความตาม Notification Type
 */
export function getNotificationTypeLabel(type: NotificationType): string {
  const labelMap: Record<NotificationType, string> = {
    'new-project': 'งานใหม่',
    'deadline-warning': 'ใกล้ปิดรับ',
    'competitor-bid': 'คู่แข่งยื่นข้อเสนอ',
    'project-won': 'ชนะงาน',
    'project-lost': 'แพ้งาน',
    'payment-received': 'ได้รับเงิน',
    'payment-due': 'ถึงกำหนดชำระ',
    'document-uploaded': 'อัพโหลดเอกสาร',
    'analysis-complete': 'วิเคราะห์เสร็จ',
    'team-mention': 'มีคนแท็ก',
    'system-update': 'อัปเดตระบบ',
    'error': 'ข้อผิดพลาด',
    'success': 'สำเร็จ',
    'info': 'ข้อมูล',
  };

  return labelMap[type] || 'การแจ้งเตือน';
}

/**
 * ดึงข้อความตาม Priority
 */
export function getPriorityLabel(priority: NotificationPriority): string {
  const labelMap: Record<NotificationPriority, string> = {
    low: 'ต่ำ',
    medium: 'ปานกลาง',
    high: 'สูง',
    urgent: 'ด่วนมาก',
  };

  return labelMap[priority] || 'ปานกลาง';
}

/**
 * ตรวจสอบว่าควรแสดง Notification หรือไม่
 * ตาม Quiet Hours
 */
export function shouldShowNotification(
  quietHoursStart?: string,
  quietHoursEnd?: string,
  timezone: string = 'Asia/Bangkok'
): boolean {
  if (!quietHoursStart || !quietHoursEnd) {
    return true;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const [startHour, startMinute] = quietHoursStart.split(':').map(Number);
  const [endHour, endMinute] = quietHoursEnd.split(':').map(Number);
  
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  // ถ้า quiet hours ข้ามวัน (เช่น 22:00 - 08:00)
  if (startTime > endTime) {
    return currentTime < startTime && currentTime >= endTime;
  }

  // ถ้า quiet hours ไม่ข้ามวัน (เช่น 08:00 - 22:00)
  return currentTime < startTime || currentTime >= endTime;
}

/**
 * สร้าง Sound สำหรับ Notification
 */
export function playNotificationSound(priority: NotificationPriority = 'medium') {
  if (typeof window === 'undefined') return;

  // ใช้ Web Audio API
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // ตั้งค่าเสียงตาม priority
  const frequencyMap: Record<NotificationPriority, number> = {
    low: 400,
    medium: 600,
    high: 800,
    urgent: 1000,
  };

  oscillator.frequency.value = frequencyMap[priority];
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

/**
 * ส่ง Browser Notification
 */
export async function sendBrowserNotification(
  title: string,
  message: string,
  icon?: string
) {
  if (typeof window === 'undefined') return;

  // ตรวจสอบว่า browser รองรับหรือไม่
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return;
  }

  // ขออนุญาต
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  // ส่ง notification
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'project-flow-notification',
      requireInteraction: false,
    });
  }
}
