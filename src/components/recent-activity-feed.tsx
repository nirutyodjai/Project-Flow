'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Briefcase, Users, DollarSign, FileText, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataManager } from '@/lib/data-manager';
import { cn } from '@/lib/utils';

/**
 * 📰 Recent Activity Feed - ฟีดกิจกรรมแบบเรียลไทม์
 */
export function RecentActivityFeed() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateNotifications = () => {
      setNotifications(DataManager.getNotifications());
    };

    updateNotifications();
    const interval = setInterval(updateNotifications, 3000);
    return () => clearInterval(interval);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">กิจกรรมล่าสุด</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>กำลังโหลด...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return Clock;
      case 'error': return Bell;
      default: return FileText;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-500 bg-green-500/10';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10';
      case 'error': return 'text-red-500 bg-red-500/10';
      default: return 'text-blue-500 bg-blue-500/10';
    }
  };

  const markAsRead = (id: string) => {
    DataManager.markNotificationAsRead(id);
    setNotifications(DataManager.getNotifications());
  };

  const markAllAsRead = () => {
    DataManager.markAllNotificationsAsRead();
    setNotifications(DataManager.getNotifications());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            กิจกรรมล่าสุด
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            อ่านทั้งหมด
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>ยังไม่มีกิจกรรม</p>
            </div>
          ) : (
            notifications.slice(0, 10).map((notification, index) => {
              const Icon = getIcon(notification.type);
              const colorClass = getColor(notification.type);
              
              return (
                <div
                  key={`${notification.id}-${index}`}
                  className={cn(
                    "flex gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                    "hover:bg-accent",
                    !notification.read && "bg-primary/5 border-l-4 border-primary"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className={cn("h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0", colorClass)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("text-sm font-medium", !notification.read && "font-bold")}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <Badge variant="default" className="text-xs">ใหม่</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.timestamp).toLocaleString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
