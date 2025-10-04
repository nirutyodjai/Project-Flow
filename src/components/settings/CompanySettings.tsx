/**
 * Company Settings Component
 * ตั้งค่าข้อมูลบริษัท
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Save, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CompanySettings() {
  const { toast } = useToast();
  const [company, setCompany] = useState({
    name: 'บริษัท ของคุณ จำกัด',
    address: '123 ถนน... เขต... กรุงเทพฯ 10000',
    phone: '02-xxx-xxxx',
    email: 'info@company.com',
    taxId: '0-0000-00000-00-0',
    website: 'https://company.com',
    logo: '',
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Save to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'บันทึกสำเร็จ',
        description: 'ข้อมูลบริษัทได้รับการอัปเดตแล้ว',
      });
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้',
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
          <Building2 className="h-5 w-5" />
          ข้อมูลบริษัท
        </CardTitle>
        <CardDescription>
          ข้อมูลบริษัทที่จะแสดงในใบเสนอราคาและเอกสาร
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyName">ชื่อบริษัท *</Label>
            <Input
              id="companyName"
              value={company.name}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxId">เลขประจำตัวผู้เสียภาษี</Label>
            <Input
              id="taxId"
              value={company.taxId}
              onChange={(e) => setCompany({ ...company, taxId: e.target.value })}
              placeholder="0-0000-00000-00-0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">ที่อยู่</Label>
          <Textarea
            id="address"
            value={company.address}
            onChange={(e) => setCompany({ ...company, address: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">เบอร์โทร</Label>
            <Input
              id="phone"
              value={company.phone}
              onChange={(e) => setCompany({ ...company, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              value={company.email}
              onChange={(e) => setCompany({ ...company, email: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">เว็บไซต์</Label>
          <Input
            id="website"
            value={company.website}
            onChange={(e) => setCompany({ ...company, website: e.target.value })}
            placeholder="https://company.com"
          />
        </div>

        <div className="space-y-2">
          <Label>โลโก้บริษัท</Label>
          <div className="flex items-center gap-4">
            {company.logo && (
              <div className="w-20 h-20 border rounded-lg overflow-hidden">
                <img src={company.logo} alt="Company Logo" className="w-full h-full object-cover" />
              </div>
            )}
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              อัปโหลดโลโก้
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            แนะนำขนาด 200x200 px, ไฟล์ PNG หรือ JPG
          </p>
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
