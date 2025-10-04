/**
 * NotificationItem Component
 * แสดง Notification แต่ละรายการ
 */

'use client';

import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification } from '@/types/notification';
import { Button } from '@/components/ui/button';
import { X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getNotificationIcon, getNotificationColor } from '@/lib/notification-utils';

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const { markAsRead, deleteNotification } = useNotifications(notification.userId);

  const handleClick = async () => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notification.id);
  };

  const Icon = getNotificationIcon(notification.type);
  const color = getNotificationColor(notification.priority);

  return (
    <div
      className={cn(
        'p-4 hover:bg-accent/50 cursor-pointer transition-colors relative group',
        !notification.read && 'bg-accent/30'
      )}
      onClick={handleClick}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
      )}

      <div className="flex gap-3 ml-4">
        {/* Icon */}
        <div className={cn('mt-1', color)}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="font-medium text-sm">{notification.title}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {notification.message}
              </p>
            </div>

            {/* Delete button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleDelete}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>
              {formatDistanceToNow(notification.timestamp, {
                addSuffix: true,
                locale: th,
              })}
            </span>

            {notification.amount && (
              <span className="font-medium text-primary">
                {notification.amount.toLocaleString()} บาท
              </span>
            )}

            {notification.deadline && (
              <span>
                ปิดรับ: {formatDistanceToNow(notification.deadline, {
                  addSuffix: true,
                  locale: th,
                })}
              </span>
            )}
          </div>

          {/* Action button */}
          {notification.actionUrl && notification.actionLabel && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 mt-2 text-xs"
              onClick={handleClick}
            >
              {notification.actionLabel}
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
