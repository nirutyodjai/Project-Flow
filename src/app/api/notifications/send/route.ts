/**
 * Send Notification API
 * API สำหรับส่ง Notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/services/notification-service';
import type { CreateNotificationInput } from '@/types/notification';

export async function POST(request: NextRequest) {
  try {
    const body: CreateNotificationInput = await request.json();

    // Validate input
    if (!body.userId || !body.title || !body.message || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create notification
    const notification = await NotificationService.createNotification(body);

    // ส่งไปยัง Slack ถ้าเปิดใช้งาน
    if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_CHANNEL_ID) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/slack`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            projectName: notification.projectName,
            amount: notification.amount,
            actionUrl: notification.actionUrl,
          }),
        });
      } catch (slackError) {
        console.error('Failed to send Slack notification:', slackError);
        // ไม่ throw error เพราะ notification หลักสำเร็จแล้ว
      }
    }

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const notifications = await NotificationService.getUserNotifications(
      userId,
      limit,
      unreadOnly
    );

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return NextResponse.json(
      { error: 'Failed to get notifications' },
      { status: 500 }
    );
  }
}
