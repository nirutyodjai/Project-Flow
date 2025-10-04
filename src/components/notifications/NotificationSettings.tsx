/**
 * NotificationSettings Component
 * หน้าตั้งค่า Notifications
 */

'use client';

import { useState, useEffect } from 'react';
import { NotificationService } from '@/services/notification-service';
import type { NotificationSettings as Settings } from '@/types/notification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, MessageSquare, Clock } from 'lucide-react';

interface NotificationSettingsProps {
  userId: string;
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({
    userId,
    emailNotifications: true,
    pushNotifications: true,
    slackNotifications: false,
    preferences: {
      newProject: true,
      deadlineWarning: true,
      competitorBid: true,
      projectWon: true,
      projectLost: true,
      paymentReceived: true,
      paymentDue: true,
    },
    timezone: 'Asia/Bangkok',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      const userSettings = await NotificationService.getSettings(userId);
      if (userSettings) {
        setSettings(userSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await NotificationService.saveSettings(settings);
      toast({
        title: 'บันทึกสำเร็จ',
        description: 'การตั้งค่าการแจ้งเตือนถูกบันทึกแล้ว',
      });
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกการตั้งค่าได้',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>ช่องทางการแจ้งเตือน</CardTitle>
          <CardDescription>เลือกช่องทางที่ต้องการรับการแจ้งเตือน</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="push">Push Notifications</Label>
            </div>
            <Switch
              id="push"
              checked={settings.pushNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, pushNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="email">Email Notifications</Label>
            </div>
            <Switch
              id="email"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, emailNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="slack">Slack Notifications</Label>
            </div>
            <Switch
              id="slack"
              checked={settings.slackNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, slackNotifications: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>ประเภทการแจ้งเตือน</CardTitle>
          <CardDescription>เลือกประเภทการแจ้งเตือนที่ต้องการรับ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="newProject">งานใหม่</Label>
            <Switch
              id="newProject"
              checked={settings.preferences.newProject}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, newProject: checked },
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="deadlineWarning">ใกล้ปิดรับ</Label>
            <Switch
              id="deadlineWarning"
              checked={settings.preferences.deadlineWarning}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, deadlineWarning: checked },
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="competitorBid">คู่แข่งยื่นข้อเสนอ</Label>
            <Switch
              id="competitorBid"
              checked={settings.preferences.competitorBid}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, competitorBid: checked },
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="projectWon">ชนะงาน</Label>
            <Switch
              id="projectWon"
              checked={settings.preferences.projectWon}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, projectWon: checked },
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="paymentReceived">ได้รับเงิน</Label>
            <Switch
              id="paymentReceived"
              checked={settings.preferences.paymentReceived}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, paymentReceived: checked },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle>ช่วงเวลาเงียบ</CardTitle>
          <CardDescription>ไม่รับการแจ้งเตือนในช่วงเวลาที่กำหนด</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quietStart">เริ่ม</Label>
              <Input
                id="quietStart"
                type="time"
                value={settings.quietHoursStart || ''}
                onChange={(e) =>
                  setSettings({ ...settings, quietHoursStart: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quietEnd">สิ้นสุด</Label>
              <Input
                id="quietEnd"
                type="time"
                value={settings.quietHoursEnd || ''}
                onChange={(e) =>
                  setSettings({ ...settings, quietHoursEnd: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
      </Button>
    </div>
  );
}
