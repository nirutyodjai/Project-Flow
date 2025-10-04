import { NextRequest, NextResponse } from 'next/server';
import {
  createNewProjectNotification,
  createDeadlineNotification,
  checkDeadlines,
  sendSlackNotification,
} from '@/lib/notification-service';

/**
 * GET /api/notifications
 * ดึงการแจ้งเตือนทั้งหมด
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // ในการใช้งานจริง ควรดึงจาก database
    // ตอนนี้ใช้ mock data
    const mockNotifications = [
      createNewProjectNotification({
        id: 'P001',
        name: 'โครงการก่อสร้างอาคารสำนักงาน 5 ชั้น',
        budget: '52,500,000 บาท',
        closingDate: '15 พฤศจิกายน 2568',
      }),
      createDeadlineNotification(
        {
          id: 'P002',
          name: 'โครงการติดตั้งระบบไฟฟ้า',
          closingDate: '5 ตุลาคม 2568',
        },
        2
      ),
    ];

    return NextResponse.json({
      success: true,
      notifications: mockNotifications,
      total: mockNotifications.length,
      unread: mockNotifications.filter((n) => !n.read).length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * สร้างการแจ้งเตือนใหม่
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    let notification;

    switch (type) {
      case 'new-project':
        notification = createNewProjectNotification(data);
        break;
      case 'deadline':
        notification = createDeadlineNotification(data.project, data.daysLeft);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid notification type' },
          { status: 400 }
        );
    }

    // ส่งไป Slack ถ้ามี webhook
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    if (slackWebhook) {
      await sendSlackNotification(notification, slackWebhook);
    }

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications
 * ลบการแจ้งเตือนทั้งหมด
 */
export async function DELETE() {
  try {
    // ในการใช้งานจริง ควรลบจาก database
    return NextResponse.json({
      success: true,
      message: 'All notifications cleared',
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear notifications' },
      { status: 500 }
    );
  }
}
