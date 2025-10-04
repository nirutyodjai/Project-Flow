'use client';

import { useState } from 'react';
import { FileText, Download, Send, Sparkles, Building, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function AutoQuotationPage() {
  const [formData, setFormData] = useState({
    projectName: '',
    customerName: '',
    customerOrg: '',
    budget: '',
    items: [] as any[],
  });

  const [generating, setGenerating] = useState(false);
  const [quotation, setQuotation] = useState<any>(null);

  const generateQuotation = async () => {
    setGenerating(true);
    
    // Simulate generation
    setTimeout(() => {
      const budget = parseFloat(formData.budget);
      const totalCost = budget * 0.85;
      const profit = budget - totalCost;
      
      setQuotation({
        quotationNo: `QT-${Date.now()}`,
        date: new Date().toLocaleDateString('th-TH'),
        projectName: formData.projectName,
        customerName: formData.customerName,
        customerOrg: formData.customerOrg,
        items: [
          { no: 1, description: 'งานโครงสร้าง', unit: 'งาน', qty: 1, price: totalCost * 0.4, amount: totalCost * 0.4 },
          { no: 2, description: 'งานสถาปัตย์', unit: 'งาน', qty: 1, price: totalCost * 0.3, amount: totalCost * 0.3 },
          { no: 3, description: 'งานระบบ', unit: 'งาน', qty: 1, price: totalCost * 0.3, amount: totalCost * 0.3 },
        ],
        subtotal: totalCost,
        vat: totalCost * 0.07,
        total: totalCost * 1.07,
        profit,
        profitPercent: (profit / budget) * 100,
      });
      
      setGenerating(false);
    }, 2000);
  };

  const downloadPDF = () => {
    alert('กำลังสร้าง PDF... (ฟีเจอร์นี้กำลังพัฒนา)');
  };

  const sendEmail = () => {
    alert('กำลังส่ง Email... (ฟีเจอร์นี้กำลังพัฒนา)');
  };

  const loadExample = () => {
    setFormData({
      projectName: 'โครงการก่อสร้างอาคารสำนักงาน 5 ชั้น',
      customerName: 'นายทดสอบ ระบบ',
      customerOrg: 'กรมทางหลวง',
      budget: '52500000',
      items: [],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-12 h-12 text-blue-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Auto Quotation Generator
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            สร้างใบเสนอราคาอัตโนมัติ สวยงาม พร้อมส่ง
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลโครงการ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>ชื่อโครงการ</Label>
                  <Input
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder="โครงการก่อสร้าง..."
                  />
                </div>

                <div>
                  <Label>ชื่อลูกค้า</Label>
                  <Input
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="นายสมชาย..."
                  />
                </div>

                <div>
                  <Label>หน่วยงาน</Label>
                  <Input
                    value={formData.customerOrg}
                    onChange={(e) => setFormData({ ...formData, customerOrg: e.target.value })}
                    placeholder="กรมทางหลวง..."
                  />
                </div>

                <div>
                  <Label>งบประมาณ (บาท)</Label>
                  <Input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="50000000"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={generateQuotation} disabled={generating} className="flex-1">
                    {generating ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                        กำลังสร้าง...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        สร้างใบเสนอราคา
                      </>
                    )}
                  </Button>
                  <Button onClick={loadExample} variant="outline">
                    ตัวอย่าง
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {quotation ? (
            <Card className="bg-white">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>ใบเสนอราคา</CardTitle>
                  <Badge variant="secondary">{quotation.quotationNo}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="text-center pb-4 border-b">
                    <h2 className="text-2xl font-bold text-blue-600">บริษัท ABC จำกัด</h2>
                    <p className="text-sm text-muted-foreground">ใบเสนอราคา</p>
                    <p className="text-xs text-muted-foreground">เลขที่: {quotation.quotationNo}</p>
                    <p className="text-xs text-muted-foreground">วันที่: {quotation.date}</p>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-1 text-sm">
                    <div><span className="font-semibold">เรียน:</span> {quotation.customerName}</div>
                    <div><span className="font-semibold">หน่วยงาน:</span> {quotation.customerOrg}</div>
                    <div><span className="font-semibold">โครงการ:</span> {quotation.projectName}</div>
                  </div>

                  {/* Items Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left">ลำดับ</th>
                          <th className="p-2 text-left">รายการ</th>
                          <th className="p-2 text-right">จำนวนเงิน</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotation.items.map((item: any) => (
                          <tr key={item.no} className="border-t">
                            <td className="p-2">{item.no}</td>
                            <td className="p-2">{item.description}</td>
                            <td className="p-2 text-right font-semibold">
                              {item.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>รวมเงิน</span>
                      <span className="font-semibold">{quotation.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>ภาษีมูลค่าเพิ่ม 7%</span>
                      <span className="font-semibold">{quotation.vat.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>รวมทั้งสิ้น</span>
                      <span className="text-green-600">{quotation.total.toLocaleString()} บาท</span>
                    </div>
                  </div>

                  {/* Profit Info */}
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-green-700">กำไรสุทธิ</span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {quotation.profit.toLocaleString()} บาท
                        </div>
                        <div className="text-xs text-green-600">
                          ({quotation.profitPercent.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button onClick={downloadPDF} className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      ดาวน์โหลด PDF
                    </Button>
                    <Button onClick={sendEmail} variant="outline" className="flex-1">
                      <Send className="mr-2 h-4 w-4" />
                      ส่ง Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-full">
              <CardContent className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-muted-foreground">
                  กรอกข้อมูลและคลิก &quot;สร้างใบเสนอราคา&quot;
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
