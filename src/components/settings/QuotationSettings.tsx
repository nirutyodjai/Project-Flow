/**
 * Quotation Settings Component
 * ตั้งค่าใบเสนอราคา
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FileText, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function QuotationSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    quotationPrefix: 'QT',
    quotationStartNumber: 1,
    defaultValidDays: 30,
    defaultVatPercent: 7,
    defaultPaymentTerms: 'ชำระเงินภายใน 30 วัน หลังจากได้รับสินค้า',
    defaultDeliveryTerms: 'จัดส่งภายใน 7-14 วันทำการ',
    defaultWarrantyTerms: 'รับประกันสินค้า 1 ปี',
    autoSendEmail: false,
    emailSubject: 'ใบเสนอราคา {quotationNumber}',
    emailBody: 'เรียน คุณ {customerName}\n\nขอส่งใบเสนอราคาเลขที่ {quotationNumber} มาให้ท่านพิจารณา\n\nขอบคุณครับ',
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Save to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'บันทึกสำเร็จ',
        description: 'การตั้งค่าใบเสนอราคาได้รับการอัปเดตแล้ว',
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          การตั้งค่าใบเสนอราคา
        </CardTitle>
        <CardDescription>
          ตั้งค่าเริ่มต้นสำหรับใบเสนอราคา
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Numbering */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">การกำหนดเลขที่</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prefix">คำนำหน้า</Label>
              <Input
                id="prefix"
                value={settings.quotationPrefix}
                onChange={(e) => setSettings({ ...settings, quotationPrefix: e.target.value })}
                placeholder="QT"
              />
              <p className="text-xs text-muted-foreground">
                ตัวอย่าง: QT-202510-0001
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startNumber">เลขเริ่มต้น</Label>
              <Input
                id="startNumber"
                type="number"
                value={settings.quotationStartNumber}
                onChange={(e) => setSettings({ ...settings, quotationStartNumber: parseInt(e.target.value) || 1 })}
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Default Values */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">ค่าเริ่มต้น</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="validDays">จำนวนวันที่ใช้ได้</Label>
              <Input
                id="validDays"
                type="number"
                value={settings.defaultValidDays}
                onChange={(e) => setSettings({ ...settings, defaultValidDays: parseInt(e.target.value) || 30 })}
                min="1"
              />
              <p className="text-xs text-muted-foreground">วัน</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vat">VAT (%)</Label>
              <Input
                id="vat"
                type="number"
                value={settings.defaultVatPercent}
                onChange={(e) => setSettings({ ...settings, defaultVatPercent: parseFloat(e.target.value) || 7 })}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">เงื่อนไขเริ่มต้น</h3>
          
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">เงื่อนไขการชำระเงิน</Label>
            <Textarea
              id="paymentTerms"
              value={settings.defaultPaymentTerms}
              onChange={(e) => setSettings({ ...settings, defaultPaymentTerms: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryTerms">เงื่อนไขการส่งมอบ</Label>
            <Textarea
              id="deliveryTerms"
              value={settings.defaultDeliveryTerms}
              onChange={(e) => setSettings({ ...settings, defaultDeliveryTerms: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="warrantyTerms">เงื่อนไขการรับประกัน</Label>
            <Textarea
              id="warrantyTerms"
              value={settings.defaultWarrantyTerms}
              onChange={(e) => setSettings({ ...settings, defaultWarrantyTerms: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        {/* Email Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">การส่งอีเมล</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>ส่งอีเมลอัตโนมัติ</Label>
              <p className="text-xs text-muted-foreground">
                ส่งอีเมลทันทีเมื่อสร้างใบเสนอราคา
              </p>
            </div>
            <Switch
              checked={settings.autoSendEmail}
              onCheckedChange={(checked) => setSettings({ ...settings, autoSendEmail: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailSubject">หัวข้ออีเมล</Label>
            <Input
              id="emailSubject"
              value={settings.emailSubject}
              onChange={(e) => setSettings({ ...settings, emailSubject: e.target.value })}
              placeholder="ใบเสนอราคา {quotationNumber}"
            />
            <p className="text-xs text-muted-foreground">
              ใช้ได้: {'{quotationNumber}'}, {'{customerName}'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailBody">เนื้อหาอีเมล</Label>
            <Textarea
              id="emailBody"
              value={settings.emailBody}
              onChange={(e) => setSettings({ ...settings, emailBody: e.target.value })}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              ใช้ได้: {'{quotationNumber}'}, {'{customerName}'}, {'{total}'}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              'กำลังบันทึก...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                บันทึกการตั้งค่า
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
