/**
 * Quotation List Component
 * แสดงรายการใบเสนอราคาทั้งหมด
 */

'use client';

import { useState, useEffect } from 'react';
import { QuotationGeneratorService } from '@/services/quotation-generator-service';
import type { Quotation } from '@/types/quotation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Download,
  Eye,
  Loader2
} from 'lucide-react';

interface QuotationListProps {
  userId: string;
}

export function QuotationList({ userId }: QuotationListProps) {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadQuotations();
  }, [userId]);

  const loadQuotations = async () => {
    try {
      const data = await QuotationGeneratorService.getQuotations(userId);
      setQuotations(data);
    } catch (error) {
      console.error('Error loading quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Quotation['status']) => {
    const variants = {
      draft: { variant: 'secondary' as const, icon: FileText, label: 'แบบร่าง' },
      sent: { variant: 'default' as const, icon: Send, label: 'ส่งแล้ว' },
      accepted: { variant: 'default' as const, icon: CheckCircle, label: 'ตอบรับ' },
      rejected: { variant: 'destructive' as const, icon: XCircle, label: 'ปฏิเสธ' },
      expired: { variant: 'outline' as const, icon: Clock, label: 'หมดอายุ' },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredQuotations = quotations.filter(q =>
    q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">กำลังโหลด...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">ใบเสนอราคา</h2>
          <p className="text-muted-foreground">
            จัดการใบเสนอราคาทั้งหมด ({quotations.length} รายการ)
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ค้นหาเลขที่, ลูกค้า, โครงการ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quotations List */}
      {filteredQuotations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {searchTerm ? 'ไม่พบใบเสนอราคา' : 'ยังไม่มีใบเสนอราคา'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredQuotations.map((quotation) => (
            <Card key={quotation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {quotation.quotationNumber}
                    </CardTitle>
                    <CardDescription>
                      {quotation.customer.name}
                      {quotation.projectName && (
                        <span className="ml-2">• {quotation.projectName}</span>
                      )}
                    </CardDescription>
                  </div>
                  {getStatusBadge(quotation.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">วันที่</p>
                    <p className="font-medium">
                      {quotation.date.toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ใช้ได้ถึง</p>
                    <p className="font-medium">
                      {quotation.validUntil.toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">รายการ</p>
                    <p className="font-medium">{quotation.items.length} รายการ</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">มูลค่า</p>
                    <p className="font-bold text-primary">
                      {quotation.total.toLocaleString()} ฿
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    ดู
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    ดาวน์โหลด PDF
                  </Button>
                  {quotation.status === 'draft' && (
                    <Button size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      ส่ง
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
