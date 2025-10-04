/**
 * NotificationList Component
 * แสดงรายการ Notifications
 */

'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCheck, Trash2, Bell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NotificationListProps {
  userId: string | null;
}

export function NotificationList({ userId }: NotificationListProps) {
  const {
    notifications,
    loading,
    unreadCount,
    markAllAsRead,
    deleteReadNotifications,
  } = useNotifications(userId);

  if (!userId) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>กรุณาเข้าสู่ระบบเพื่อดู Notifications</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-sm text-muted-foreground">กำลังโหลด...</p>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">การแจ้งเตือน</h3>
          {unreadCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {unreadCount} รายการใหม่
            </span>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex-1"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              อ่านทั้งหมด
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deleteReadNotifications}
              disabled={readNotifications.length === 0}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              ลบที่อ่านแล้ว
            </Button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>ไม่มีการแจ้งเตือน</p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="all" className="flex-1">
              ทั้งหมด ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">
              ยังไม่อ่าน ({unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="m-0">
            <ScrollArea className="h-[400px]">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <NotificationItem notification={notification} />
                  {index < notifications.length - 1 && <Separator />}
                </div>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="unread" className="m-0">
            <ScrollArea className="h-[400px]">
              {unreadNotifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <CheckCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>ไม่มีการแจ้งเตือนใหม่</p>
                </div>
              ) : (
                unreadNotifications.map((notification, index) => (
                  <div key={notification.id}>
                    <NotificationItem notification={notification} />
                    {index < unreadNotifications.length - 1 && <Separator />}
                  </div>
                ))
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
