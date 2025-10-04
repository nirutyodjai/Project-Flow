/**
 * Notification Service - ระบบแจ้งเตือนแบบ Real-time
 */

export interface Notification {
  id: string;
  type: 'new-project' | 'deadline-soon' | 'won-bid' | 'lost-bid' | 'price-alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  projectId?: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface NotificationSettings {
  enableNewProject: boolean;
  enableDeadline: boolean;
  enableWinLoss: boolean;
  enablePriceAlert: boolean;
  deadlineWarningDays: number; // แจ้งเตือนก่อนกี่วัน
  slackWebhook?: string;
  emailNotification?: boolean;
}

/**
 * สร้างการแจ้งเตือนงานใหม่
 */
export function createNewProjectNotification(project: {
  id: string;
  name: string;
  budget: string;
  closingDate: string;
}): Notification {
  return {
    id: `notif-${Date.now()}`,
    type: 'new-project',
    title: '🎯 งานประมูลใหม่!',
    message: `${project.name}\nงบประมาณ: ${project.budget}\nปิดรับ: ${project.closingDate}`,
    priority: 'high',
    projectId: project.id,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: `/search-procurement?id=${project.id}`,
  };
}

/**
 * สร้างการแจ้งเตือนใกล้ปิดรับ
 */
export function createDeadlineNotification(
  project: {
    id: string;
    name: string;
    closingDate: string;
  },
  daysLeft: number
): Notification {
  const priority = daysLeft <= 1 ? 'urgent' : daysLeft <= 3 ? 'high' : 'medium';
  
  return {
    id: `notif-${Date.now()}`,
    type: 'deadline-soon',
    title: `⚠️ ใกล้ปิดรับ ${daysLeft} วัน!`,
    message: `${project.name}\nปิดรับ: ${project.closingDate}`,
    priority,
    projectId: project.id,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: `/search-procurement?id=${project.id}`,
  };
}

/**
 * สร้างการแจ้งเตือนชนะงาน
 */
export function createWonBidNotification(project: {
  id: string;
  name: string;
  amount: string;
}): Notification {
  return {
    id: `notif-${Date.now()}`,
    type: 'won-bid',
    title: '🎉 ชนะงาน!',
    message: `ยินดีด้วย! ชนะงาน ${project.name}\nมูลค่า: ${project.amount}`,
    priority: 'high',
    projectId: project.id,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: `/projects/${project.id}`,
  };
}

/**
 * สร้างการแจ้งเตือนแพ้งาน
 */
export function createLostBidNotification(project: {
  id: string;
  name: string;
}): Notification {
  return {
    id: `notif-${Date.now()}`,
    type: 'lost-bid',
    title: '😔 ไม่ได้งาน',
    message: `ไม่ได้งาน ${project.name}\nวิเคราะห์และปรับปรุงในครั้งหน้า`,
    priority: 'medium',
    projectId: project.id,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: `/projects/${project.id}`,
  };
}

/**
 * สร้างการแจ้งเตือนราคาวัสดุเปลี่ยน
 */
export function createPriceAlertNotification(material: {
  name: string;
  oldPrice: number;
  newPrice: number;
}): Notification {
  const change = ((material.newPrice - material.oldPrice) / material.oldPrice) * 100;
  const isIncrease = change > 0;
  
  return {
    id: `notif-${Date.now()}`,
    type: 'price-alert',
    title: isIncrease ? '📈 ราคาวัสดุขึ้น!' : '📉 ราคาวัสดุลง!',
    message: `${material.name}\n${material.oldPrice} → ${material.newPrice} บาท (${change > 0 ? '+' : ''}${change.toFixed(1)}%)`,
    priority: Math.abs(change) > 10 ? 'high' : 'medium',
    timestamp: new Date().toISOString(),
    read: false,
  };
}

/**
 * ส่งการแจ้งเตือนไป Slack
 */
export async function sendSlackNotification(
  notification: Notification,
  webhookUrl: string
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `${notification.title}\n${notification.message}`,
        attachments: [
          {
            color: notification.priority === 'urgent' ? 'danger' : 
                   notification.priority === 'high' ? 'warning' : 'good',
            fields: [
              {
                title: 'Priority',
                value: notification.priority.toUpperCase(),
                short: true,
              },
              {
                title: 'Time',
                value: new Date(notification.timestamp).toLocaleString('th-TH'),
                short: true,
              },
            ],
          },
        ],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
    return false;
  }
}

/**
 * ตรวจสอบโครงการที่ใกล้ปิดรับ
 */
export function checkDeadlines(
  projects: Array<{ id: string; name: string; closingDate: string }>,
  warningDays: number = 3
): Notification[] {
  const notifications: Notification[] = [];
  const now = new Date();

  projects.forEach((project) => {
    const closingDate = new Date(project.closingDate);
    const daysLeft = Math.ceil((closingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft > 0 && daysLeft <= warningDays) {
      notifications.push(createDeadlineNotification(project, daysLeft));
    }
  });

  return notifications;
}

/**
 * Local Storage สำหรับการแจ้งเตือน
 */
export const NotificationStorage = {
  getAll(): Notification[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('notifications');
    return stored ? JSON.parse(stored) : [];
  },

  add(notification: Notification): void {
    if (typeof window === 'undefined') return;
    const notifications = this.getAll();
    notifications.unshift(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications.slice(0, 100))); // เก็บ 100 รายการล่าสุด
  },

  markAsRead(id: string): void {
    if (typeof window === 'undefined') return;
    const notifications = this.getAll();
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updated));
  },

  markAllAsRead(): void {
    if (typeof window === 'undefined') return;
    const notifications = this.getAll();
    const updated = notifications.map((n) => ({ ...n, read: true }));
    localStorage.setItem('notifications', JSON.stringify(updated));
  },

  getUnreadCount(): number {
    return this.getAll().filter((n) => !n.read).length;
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('notifications');
  },
};
