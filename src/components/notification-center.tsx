'use client';

import React from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, type NotificationData } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const notificationIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
  error: AlertCircle,
};

const notificationColors = {
  success: 'text-green-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
  error: 'text-red-500',
};

interface NotificationItemProps {
  notification: NotificationData;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}) => {
  const Icon = notificationIcons[notification.type];
  const colorClass = notificationColors[notification.type];

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} นาทีที่แล้ว`;
    } else if (hours < 24) {
      return `${hours} ชั่วโมงที่แล้ว`;
    } else {
      return `${days} วันที่แล้ว`;
    }
  };

  const handleItemClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const content = (
    <div
      className={cn(
        'flex items-start gap-3 p-3 hover:bg-accent/50 transition-colors cursor-pointer group',
        !notification.read && 'bg-accent/20'
      )}
      onClick={handleItemClick}
    >
      <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', colorClass)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn(
            'text-sm font-medium leading-5',
            !notification.read && 'text-foreground font-semibold'
          )}>
            {notification.title}
          </h4>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!notification.read && (
              <div className="h-2 w-2 bg-primary rounded-full" />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {formatTime(notification.timestamp)}
        </p>
      </div>
    </div>
  );

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

export const NotificationCenter: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-3">
          <h3 className="font-semibold">การแจ้งเตือน</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              อ่านทั้งหมด
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>ไม่มีการแจ้งเตือน</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
