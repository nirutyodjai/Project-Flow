/**
 * Slack Notification API
 * ส่ง Notifications ไปยัง Slack
 */

import { NextRequest, NextResponse } from 'next/server';

interface SlackMessage {
  channel: string;
  text: string;
  blocks?: any[];
  attachments?: any[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, message, priority, projectName, amount, actionUrl } = body;

    const slackToken = process.env.SLACK_BOT_TOKEN;
    const slackChannel = process.env.SLACK_CHANNEL_ID;

    if (!slackToken || !slackChannel) {
      return NextResponse.json(
        { error: 'Slack configuration missing' },
        { status: 500 }
      );
    }

    // สร้าง Slack message
    const slackMessage: SlackMessage = {
      channel: slackChannel,
      text: `${title}: ${message}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: title,
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message,
          },
        },
      ],
    };

    // เพิ่มข้อมูลเพิ่มเติม
    if (projectName || amount) {
      const fields = [];
      
      if (projectName) {
        fields.push({
          type: 'mrkdwn',
          text: `*โครงการ:*\n${projectName}`,
        });
      }
      
      if (amount) {
        fields.push({
          type: 'mrkdwn',
          text: `*มูลค่า:*\n${amount.toLocaleString()} บาท`,
        });
      }

      slackMessage.blocks?.push({
        type: 'section',
        fields,
      });
    }

    // เพิ่มปุ่ม Action
    if (actionUrl) {
      slackMessage.blocks?.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'ดูรายละเอียด',
              emoji: true,
            },
            url: actionUrl,
            style: priority === 'urgent' ? 'danger' : 'primary',
          },
        ],
      });
    }

    // ส่งไปยัง Slack
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${slackToken}`,
      },
      body: JSON.stringify(slackMessage),
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.error || 'Failed to send Slack message');
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return NextResponse.json(
      { error: 'Failed to send Slack notification' },
      { status: 500 }
    );
  }
}
