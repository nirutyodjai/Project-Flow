/**
 * useNotifications Hook
 * สำหรับจัดการ Notifications แบบ Real-time
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '@/services/notification-service';
import type { Notification, NotificationStats } from '@/types/notification';

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const unsubscribe = NotificationService.subscribeToNotifications(
      userId,
      (newNotifications) => {
        setNotifications(newNotifications);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Load stats
  useEffect(() => {
    if (!userId) return;

    const loadStats = async () => {
      try {
        const notificationStats = await NotificationService.getNotificationStats(userId);
        setStats(notificationStats);
      } catch (err) {
        console.error('Error loading notification stats:', err);
      }
    };

    loadStats();
  }, [userId, notifications]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
    } catch (err) {
      setError(err as Error);
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    
    try {
      await NotificationService.markAllAsRead(userId);
    } catch (err) {
      setError(err as Error);
      console.error('Error marking all as read:', err);
    }
  }, [userId]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.deleteNotification(notificationId);
    } catch (err) {
      setError(err as Error);
      console.error('Error deleting notification:', err);
    }
  }, []);

  // Delete all read notifications
  const deleteReadNotifications = useCallback(async () => {
    if (!userId) return;
    
    try {
      await NotificationService.deleteReadNotifications(userId);
    } catch (err) {
      setError(err as Error);
      console.error('Error deleting read notifications:', err);
    }
  }, [userId]);

  return {
    notifications,
    stats,
    loading,
    error,
    unreadCount: stats?.unread || 0,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications,
  };
}
