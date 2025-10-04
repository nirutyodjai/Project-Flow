/**
 * Quotation Preview Component
 * แสดงตัวอย่างใบเสนอราคา
 */

'use client';

import type { QuotationItem, CustomerInfo } from '@/types/quotation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

interface QuotationPreviewProps {
  customer: CustomerInfo;
  items: QuotationItem[];
  totals: {
    subtotal: number;
    discount: number;
    vat: number;
    total: number;
  };
  notes?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuotationPreview({
  customer,
  items,
  totals,
  notes,
  open,
  onOpenChange,
}: QuotationPreviewProps) {
  const today = new Date();
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ตัวอย่างใบเสนอราคา</DialogTitle>
          <DialogDescription>
            ตรวจสอบข้อมูลก่อนสร้างใบเสนอราคา
          </DialogDescription>
        </DialogHeader>

        {/* Quotation Document */}
        <div className="bg-white p-8 space-y-6 border rounded-lg">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">ใบเสนอราคา</h1>
            <p className="text-sm text-muted-foreground">QUOTATION</p>
          </div>

          <Separator />

          {/* Company & Customer Info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Company */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                จาก (From)
              </h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">บริษัท ของคุณ จำกัด</p>
                <p className="text-muted-foreground flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>123 ถนน... เขต... กรุงเทพฯ 10000</span>
                </p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  02-xxx-xxxx
                </p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  info@company.com
                </p>
              </div>
            </div>

            {/* Customer */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                ถึง (To)
              </h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{customer.name || '-'}</p>
                {customer.address && (
                  <p className="text-muted-foreground flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{customer.address}</span>
                  </p>
                )}
                {customer.phone && (
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {customer.phone}
                  </p>
                )}
                {customer.email && (
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {customer.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Document Info */}
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">เลขที่: </span>
              <span className="font-medium">QT-{today.getFullYear()}{String(today.getMonth() + 1).padStart(2, '0')}-0001</span>
            </div>
            <div>
              <span className="text-muted-foreground">วันที่: </span>
              <span className="font-medium">{today.toLocaleDateString('th-TH')}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-muted-foreground">ใช้ได้ถึง: </span>
              <span className="font-medium">{validUntil.toLocaleDateString('th-TH')}</span>
            </div>
          </div>

          <Separator />

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left p-2 w-12">ลำดับ</th>
                  <th className="text-left p-2">รายการ</th>
                  <th className="text-center p-2 w-20">จำนวน</th>
                  <th className="text-center p-2 w-20">หน่วย</th>
                  <th className="text-right p-2 w-28">ราคา/หน่วย</th>
                  <th className="text-right p-2 w-28">จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2 text-center">{index + 1}</td>
                    <td className="p-2">{item.description || '-'}</td>
                    <td className="p-2 text-center">{item.quantity.toLocaleString()}</td>
                    <td className="p-2 text-center">{item.unit}</td>
                    <td className="p-2 text-right">{item.unitPrice.toLocaleString()}</td>
                    <td className="p-2 text-right font-medium">{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end">
            <div className="w-full md:w-1/2 space-y-2">
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
          </div>

          {/* Notes */}
          {notes && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">หมายเหตุ</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {notes}
              </p>
            </div>
          )}

          <Separator />

          {/* Terms */}
          <div className="space-y-3 text-sm">
            <h3 className="font-semibold">เงื่อนไขและข้อตกลง</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• ชำระเงินภายใน 30 วัน หลังจากได้รับสินค้า</li>
              <li>• จัดส่งภายใน 7-14 วันทำการ</li>
              <li>• รับประกันสินค้า 1 ปี</li>
              <li>• ราคานี้ใช้ได้ถึงวันที่ {validUntil.toLocaleDateString('th-TH')}</li>
            </ul>
          </div>

          {/* Signature */}
          <div className="grid md:grid-cols-2 gap-8 pt-8">
            <div className="text-center space-y-8">
              <div className="border-t pt-2">
                <p className="text-sm">ผู้เสนอราคา</p>
                <p className="text-xs text-muted-foreground mt-1">
                  วันที่: {today.toLocaleDateString('th-TH')}
                </p>
              </div>
            </div>
            <div className="text-center space-y-8">
              <div className="border-t pt-2">
                <p className="text-sm">ผู้อนุมัติ</p>
                <p className="text-xs text-muted-foreground mt-1">
                  วันที่: ........................
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
