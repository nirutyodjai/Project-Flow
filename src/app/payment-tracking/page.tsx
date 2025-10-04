'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function PaymentTrackingPage() {
  const [payments, setPayments] = useState([
    {
      id: 'PAY-001',
      projectName: 'โครงการก่อสร้างอาคาร',
      amount: 10000000,
      paid: 6000000,
      remaining: 4000000,
      dueDate: '2025-11-15',
      status: 'partial',
      invoices: [
        { no: 'INV-001', amount: 3000000, paid: true, date: '2025-09-01' },
        { no: 'INV-002', amount: 3000000, paid: true, date: '2025-10-01' },
        { no: 'INV-003', amount: 4000000, paid: false, date: '2025-11-01' },
      ],
    },
    {
      id: 'PAY-002',
      projectName: 'โครงการติดตั้งระบบไฟฟ้า',
      amount: 5000000,
      paid: 5000000,
      remaining: 0,
      dueDate: '2025-10-01',
      status: 'completed',
      invoices: [
        { no: 'INV-004', amount: 5000000, paid: true, date: '2025-09-15' },
      ],
    },
    {
      id: 'PAY-003',
      projectName: 'โครงการปรับปรุงอาคาร',
      amount: 8000000,
      paid: 0,
      remaining: 8000000,
      dueDate: '2025-10-20',
      status: 'pending',
      invoices: [
        { no: 'INV-005', amount: 8000000, paid: false, date: '2025-10-20' },
      ],
    },
  ]);

  const totalReceivable = payments.reduce((sum, p) => sum + p.remaining, 0);
  const totalReceived = payments.reduce((sum, p) => sum + p.paid, 0);
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">ชำระครบ</Badge>;
      case 'partial':
        return <Badge className="bg-blue-600">ชำระบางส่วน</Badge>;
      case 'pending':
        return <Badge variant="secondary">รอชำระ</Badge>;
      case 'overdue':
        return <Badge variant="destructive">เกินกำหนด</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-10 h-10 text-emerald-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Payment Tracking
            </h1>
          </div>
          <p className="text-gray-600">ติดตามการรับเงินและกระแสเงินสด</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">ได้รับแล้ว</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{(totalReceived / 1000000).toFixed(1)}M</div>
                  <div className="text-xs opacity-80">
                    {((totalReceived / totalAmount) * 100).toFixed(0)}% ของยอดรวม
                  </div>
                </div>
                <CheckCircle className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">รอรับ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{(totalReceivable / 1000000).toFixed(1)}M</div>
                  <div className="text-xs opacity-80">
                    {((totalReceivable / totalAmount) * 100).toFixed(0)}% ของยอดรวม
                  </div>
                </div>
                <Clock className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">ยอดรวม</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{(totalAmount / 1000000).toFixed(1)}M</div>
                  <div className="text-xs opacity-80">{payments.length} โครงการ</div>
                </div>
                <DollarSign className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment List */}
        <Card>
          <CardHeader>
            <CardTitle>รายการรับเงิน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {payments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{payment.projectName}</h3>
                      <p className="text-sm text-muted-foreground">รหัส: {payment.id}</p>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground">ยอดรวม</div>
                      <div className="text-lg font-bold">{payment.amount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">ได้รับแล้ว</div>
                      <div className="text-lg font-bold text-green-600">
                        {payment.paid.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">คงเหลือ</div>
                      <div className="text-lg font-bold text-orange-600">
                        {payment.remaining.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <Progress value={(payment.paid / payment.amount) * 100} className="mb-4" />

                  {/* Invoices */}
                  <div className="space-y-2">
                    <div className="text-sm font-semibold">ใบแจ้งหนี้:</div>
                    {payment.invoices.map((invoice, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {invoice.paid ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-orange-600" />
                          )}
                          <span>{invoice.no}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">{invoice.date}</span>
                          <span className="font-bold">
                            {invoice.amount.toLocaleString()} บาท
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
