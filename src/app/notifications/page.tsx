/**
 * Notifications Page
 * หน้าจัดการการแจ้งเตือนทั้งหมด
 */

'use client';

import { useState, useEffect } from 'react';
import { NotificationList, NotificationSettings } from '@/components/notifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Settings, CheckCheck, Trash2 } from 'lucide-react';

export default function NotificationsPage() {
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bell className="h-8 w-8" />
            การแจ้งเตือน
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-lg px-3 py-1">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            จัดการการแจ้งเตือนและการตั้งค่าทั้งหมด
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            ทั้งหมด
          </TabsTrigger>
          <TabsTrigger value="unread">
            ยังไม่อ่าน
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            ตั้งค่า
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>การแจ้งเตือนทั้งหมด</CardTitle>
                  <CardDescription>
                    ดูการแจ้งเตือนทั้งหมดของคุณ
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <CheckCheck className="h-4 w-4 mr-2" />
                    อ่านทั้งหมด
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    ลบที่อ่านแล้ว
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <NotificationList userId="user-123" limit={50} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>การแจ้งเตือนที่ยังไม่อ่าน</CardTitle>
              <CardDescription>
                การแจ้งเตือนที่คุณยังไม่ได้อ่าน
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationList userId="user-123" unreadOnly={true} limit={50} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <NotificationSettings userId="user-123" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
