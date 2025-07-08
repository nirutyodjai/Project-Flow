import { useState, useEffect } from 'react';

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Mock notifications data
    const mockNotifications: NotificationData[] = [
      {
        id: '1',
        title: 'โปรเจคใหม่ถูกสร้าง',
        message: 'โปรเจค "ระบบจัดการคลังสินค้า" ถูกเพิ่มเข้าระบบแล้ว',
        type: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        actionUrl: '/admin'
      },
      {
        id: '2',
        title: 'แจ้งเตือนกำหนดส่งงาน',
        message: 'โปรเจค "เว็บไซต์บริษัท ABC" จะครบกำหนดในอีก 2 วัน',
        type: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
      },
      {
        id: '3',
        title: 'การชำระเงินสำเร็จ',
        message: 'ได้รับเงินงวดที่ 2 จากโปรเจค A จำนวน 2,500,000 บาท',
        type: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        read: true,
        actionUrl: '/finance'
      },
      {
        id: '4',
        title: 'ข้อผิดพลาดระบบ',
        message: 'พบปัญหาในการเชื่อมต่อฐานข้อมูลในโปรเจค "ระบบจัดการโรงแรม"',
        type: 'error',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        read: true,
      },
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
