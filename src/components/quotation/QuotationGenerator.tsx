/**
 * Quotation Generator Component
 * สร้างใบเสนอราคาอัตโนมัติ
 */

'use client';

import { useState } from 'react';
import { QuotationGeneratorService } from '@/services/quotation-generator-service';
import type { QuotationItem, CustomerInfo } from '@/types/quotation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, FileText, Send, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QuotationPreview } from './QuotationPreview';

interface QuotationGeneratorProps {
  userId: string;
  projectId?: string;
  projectName?: string;
}

export function QuotationGenerator({ userId, projectId, projectName }: QuotationGeneratorProps) {
  const { toast } = useToast();
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    address: '',
    phone: '',
    email: '',
  });
  
  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: '1',
      no: 1,
      description: '',
      quantity: 1,
      unit: 'ชิ้น',
      unitPrice: 0,
      amount: 0,
    },
  ]);
  
  const [discount, setDiscount] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // เพิ่มรายการ
  const addItem = () => {
    const newItem: QuotationItem = {
      id: String(items.length + 1),
      no: items.length + 1,
      description: '',
      quantity: 1,
      unit: 'ชิ้น',
      unitPrice: 0,
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  // ลบรายการ
  const removeItem = (id: string) => {
    if (items.length === 1) {
      toast({
        title: 'ไม่สามารถลบได้',
        description: 'ต้องมีรายการอย่างน้อย 1 รายการ',
        variant: 'destructive',
      });
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  // อัปเดตรายการ
  const updateItem = (id: string, field: keyof QuotationItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // คำนวณจำนวนเงิน
        if (field === 'quantity' || field === 'unitPrice') {
          updated.amount = updated.quantity * updated.unitPrice;
        }
        
        return updated;
      }
      return item;
    }));
  };

  // คำนวณยอดรวม
  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = discountPercent > 0 
      ? (subtotal * discountPercent) / 100 
      : discount;
    const afterDiscount = subtotal - discountAmount;
    const vat = afterDiscount * 0.07;
    const total = afterDiscount + vat;

    return {
      subtotal,
      discount: discountAmount,
      vat,
      total,
    };
  };

  // สร้างใบเสนอราคา
  const handleCreate = async (status: 'draft' | 'sent' = 'draft') => {
    // Validate
    if (!customer.name) {
      toast({
        title: 'กรุณากรอกข้อมูล',
        description: 'กรุณากรอกชื่อลูกค้า',
        variant: 'destructive',
      });
      return;
    }

    if (items.some(item => !item.description)) {
      toast({
        title: 'กรุณากรอกข้อมูล',
        description: 'กรุณากรอกรายละเอียดสินค้า/บริการ',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const quotation = await QuotationGeneratorService.createQuotation(
        userId,
        customer,
        items,
        {
          projectId,
          projectName,
          discount,
          discountPercent,
          notes,
        }
      );

      if (status === 'sent') {
        await QuotationGeneratorService.sendQuotation(quotation.id);
      }

      toast({
        title: 'สร้างใบเสนอราคาสำเร็จ',
        description: `เลขที่: ${quotation.quotationNumber}`,
      });

      // Reset form
      setCustomer({ name: '', address: '', phone: '', email: '' });
      setItems([{
        id: '1',
        no: 1,
        description: '',
        quantity: 1,
        unit: 'ชิ้น',
        unitPrice: 0,
        amount: 0,
      }]);
      setDiscount(0);
      setDiscountPercent(0);
      setNotes('');
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสร้างใบเสนอราคาได้',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotal();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">สร้างใบเสนอราคา</h2>
        <p className="text-muted-foreground">
          สร้างใบเสนอราคาอัตโนมัติด้วย AI
        </p>
      </div>

      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลลูกค้า</CardTitle>
          <CardDescription>กรอกข้อมูลลูกค้าหรือบริษัท</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">ชื่อลูกค้า / บริษัท *</Label>
              <Input
                id="customerName"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                placeholder="บริษัท ABC จำกัด"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">เบอร์โทร</Label>
              <Input
                id="customerPhone"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                placeholder="02-xxx-xxxx"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerAddress">ที่อยู่</Label>
            <Textarea
              id="customerAddress"
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              placeholder="123 ถนน... เขต... กรุงเทพฯ 10000"
              rows={2}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerEmail">อีเมล</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                placeholder="contact@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerTaxId">เลขประจำตัวผู้เสียภาษี</Label>
              <Input
                id="customerTaxId"
                value={customer.taxId}
                onChange={(e) => setCustomer({ ...customer, taxId: e.target.value })}
                placeholder="0-0000-00000-00-0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>รายการสินค้า/บริการ</CardTitle>
              <CardDescription>เพิ่มรายการที่ต้องการเสนอราคา</CardDescription>
            </div>
            <Button onClick={addItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มรายการ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">รายการที่ {index + 1}</span>
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-12">
                  <div className="md:col-span-5 space-y-2">
                    <Label>รายละเอียด *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="ชื่อสินค้า/บริการ"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label>จำนวน</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label>หน่วย</Label>
                    <Input
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                      placeholder="ชิ้น"
                    />
                  </div>

                  <div className="md:col-span-3 space-y-2">
                    <Label>ราคา/หน่วย</Label>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">จำนวนเงิน</p>
                    <p className="text-lg font-bold">
                      {item.amount.toLocaleString()} ฿
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>สรุปยอด</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>ส่วนลด (บาท)</Label>
              <Input
                type="number"
                value={discount}
                onChange={(e) => {
                  setDiscount(parseFloat(e.target.value) || 0);
                  setDiscountPercent(0);
                }}
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>ส่วนลด (%)</Label>
              <Input
                type="number"
                value={discountPercent}
                onChange={(e) => {
                  setDiscountPercent(parseFloat(e.target.value) || 0);
                  setDiscount(0);
                }}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>หมายเหตุ</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="หมายเหตุเพิ่มเติม..."
              rows={3}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>ยอดรวม</span>
              <span>{totals.subtotal.toLocaleString()} ฿</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>ส่วนลด</span>
                <span>-{totals.discount.toLocaleString()} ฿</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>VAT 7%</span>
              <span>{totals.vat.toLocaleString()} ฿</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>รวมทั้งสิ้น</span>
              <span className="text-primary">{totals.total.toLocaleString()} ฿</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={() => setShowPreview(true)}
          disabled={loading}
        >
          <FileText className="h-4 w-4 mr-2" />
          ดูตัวอย่าง
        </Button>
        <Button
          variant="outline"
          onClick={() => handleCreate('draft')}
          disabled={loading}
        >
          <Save className="h-4 w-4 mr-2" />
          บันทึกแบบร่าง
        </Button>
        <Button
          onClick={() => handleCreate('sent')}
          disabled={loading}
        >
          {loading ? (
            'กำลังสร้าง...'
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              สร้างและส่ง
            </>
          )}
        </Button>
      </div>

      {/* Preview Dialog */}
      {showPreview && (
        <QuotationPreview
          customer={customer}
          items={items}
          totals={totals}
          notes={notes}
          open={showPreview}
          onOpenChange={setShowPreview}
        />
      )}
    </div>
  );
}
