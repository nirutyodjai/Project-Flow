'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  PlusCircle, 
  Search, 
  FileSpreadsheet,
  Filter,
  RefreshCcw,
  ShoppingCart,
  Edit,
  Trash2,
  Eye,
  ClipboardCheck
} from 'lucide-react';
import { QuotationType, QuotationStatus } from '@/services/quotation-service';

// ฟังก์ชันแปลงประเภทใบเสนอราคาเป็นภาษาไทย
const quotationTypeText = (type: string): string => {
  switch (type) {
    case QuotationType.MATERIAL_ONLY:
      return 'เสนอราคาอย่างเดียว';
    case QuotationType.MATERIAL_LABOR:
      return 'เสนอราคาพร้อมค่าแรง';
    case QuotationType.LABOR_ONLY:
      return 'เสนอค่าแรงอย่างเดียว';
    case QuotationType.BOQ_BASED:
      return 'เสนอราคาตาม BOQ';
    default:
      return 'ไม่ระบุ';
  }
};

// ฟังก์ชันแปลงสถานะใบเสนอราคาเป็นภาษาไทย และกำหนดสีของ Badge
const quotationStatusConfig = (status: string): { text: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
  switch (status) {
    case QuotationStatus.DRAFT:
      return { text: 'ร่าง', variant: 'outline' };
    case QuotationStatus.PENDING:
      return { text: 'รออนุมัติ', variant: 'secondary' };
    case QuotationStatus.APPROVED:
      return { text: 'อนุมัติแล้ว', variant: 'default' };
    case QuotationStatus.REJECTED:
      return { text: 'ปฏิเสธ', variant: 'destructive' };
    case QuotationStatus.EXPIRED:
      return { text: 'หมดอายุ', variant: 'destructive' };
    case QuotationStatus.CONVERTED:
      return { text: 'แปลงเป็น PO แล้ว', variant: 'secondary' };
    default:
      return { text: 'ไม่ระบุ', variant: 'outline' };
  }
};

// ฟังก์ชันจัดรูปแบบวันที่
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// ฟังก์ชันจัดรูปแบบตัวเลขเป็นเงินบาท
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2
  }).format(amount);
};

export default function QuotationListPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");

  // โหลดข้อมูลใบเสนอราคา
  const loadQuotations = async () => {
    setIsLoading(true);
    try {
      let queryParams = new URLSearchParams();
      
      // เพิ่มพารามิเตอร์การกรอง
      if (activeTab !== "all" && activeTab !== "") {
        queryParams.append('status', activeTab);
      }
      
      if (filterType) {
        queryParams.append('type', filterType);
      }
      
      if (searchTerm) {
        // ค้นหาทั้งเลขที่ใบเสนอราคา, ชื่อลูกค้า, หรือชื่อโครงการ
        queryParams.append('quotationNumber', searchTerm);
        // ไม่สามารถส่งหลาย parameter ที่มีชื่อเดียวกัน จึงต้องแยกการค้นหาและรวมผลลัพธ์ในฝั่ง client
      }
      
      const response = await fetch(`/api/procurement/quotation?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch quotations');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // กรองด้วย searchTerm ในฝั่งไคลเอนต์อีกครั้ง
        let filteredResults = result.data;
        
        if (searchTerm) {
          filteredResults = filteredResults.filter((q: any) => 
            q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.projectName.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setQuotations(filteredResults);
      } else {
        console.error('Error fetching quotations:', result.error);
        setQuotations([]);
      }
    } catch (error) {
      console.error('Error loading quotations:', error);
      setQuotations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // โหลดข้อมูลเมื่อเริ่มต้น และเมื่อตัวกรองเปลี่ยนแปลง
  useEffect(() => {
    loadQuotations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filterType]);

  // ฟังก์ชันค้นหา
  const handleSearch = () => {
    loadQuotations();
  };

  // ฟังก์ชันรีเซ็ตตัวกรอง
  const handleResetFilters = () => {
    setActiveTab("all");
    setFilterType("");
    setSearchTerm("");
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader 
        title="ใบเสนอราคา" 
        description="สร้างและจัดการใบเสนอราคาในรูปแบบต่างๆ"
        extra={
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/procurement/quotation/new/material-only">
                <PlusCircle className="mr-2 h-4 w-4" />
                เสนอราคาอย่างเดียว
              </Link>
            </Button>
            <Button asChild>
              <Link href="/procurement/quotation/new/material-labor">
                <PlusCircle className="mr-2 h-4 w-4" />
                เสนอราคา+ค่าแรง
              </Link>
            </Button>
            <Button asChild>
              <Link href="/procurement/quotation/new/labor-only">
                <PlusCircle className="mr-2 h-4 w-4" />
                เสนอค่าแรงอย่างเดียว
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/procurement/quotation/new/boq-based">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                เสนอราคาตาม BOQ
              </Link>
            </Button>
          </div>
        }
      />
      
      <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col overflow-y-auto">
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>ค้นหาใบเสนอราคา</CardTitle>
            <CardDescription>
              ค้นหาใบเสนอราคาตามเลขที่ ลูกค้า หรือโครงการ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[250px]">
                <Input
                  placeholder="ค้นหาตามเลขที่, ลูกค้า, หรือโครงการ"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              
              <div>
                <Select
                  value={filterType}
                  onValueChange={setFilterType}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="ประเภทใบเสนอราคา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>ประเภทใบเสนอราคา</SelectLabel>
                      <SelectItem value="">ทั้งหมด</SelectItem>
                      <SelectItem value={QuotationType.MATERIAL_ONLY}>เสนอราคาอย่างเดียว</SelectItem>
                      <SelectItem value={QuotationType.MATERIAL_LABOR}>เสนอราคาพร้อมค่าแรง</SelectItem>
                      <SelectItem value={QuotationType.LABOR_ONLY}>เสนอค่าแรงอย่างเดียว</SelectItem>
                      <SelectItem value={QuotationType.BOQ_BASED}>เสนอราคาตาม BOQ</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                ค้นหา
              </Button>
              
              <Button variant="outline" onClick={handleResetFilters}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                ล้างตัวกรอง
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
            <TabsTrigger value={QuotationStatus.DRAFT}>ร่าง</TabsTrigger>
            <TabsTrigger value={QuotationStatus.PENDING}>รออนุมัติ</TabsTrigger>
            <TabsTrigger value={QuotationStatus.APPROVED}>อนุมัติแล้ว</TabsTrigger>
            <TabsTrigger value={QuotationStatus.REJECTED}>ปฏิเสธ</TabsTrigger>
            <TabsTrigger value={QuotationStatus.EXPIRED}>หมดอายุ</TabsTrigger>
            <TabsTrigger value={QuotationStatus.CONVERTED}>แปลงเป็น PO แล้ว</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="flex-1">
            <Card className="flex-1">
              <CardContent className="p-0">
                <Table>
                  <TableCaption>
                    {isLoading 
                      ? 'กำลังโหลดข้อมูล...' 
                      : quotations.length === 0 
                        ? 'ไม่พบข้อมูลใบเสนอราคา' 
                        : `จำนวน ${quotations.length} รายการ`
                    }
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[160px]">เลขที่</TableHead>
                      <TableHead>ลูกค้า/โครงการ</TableHead>
                      <TableHead>ประเภท</TableHead>
                      <TableHead>วันที่</TableHead>
                      <TableHead className="text-right">มูลค่ารวม</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead className="text-center">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">กำลังโหลดข้อมูล...</TableCell>
                      </TableRow>
                    ) : quotations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">ไม่พบข้อมูลใบเสนอราคา</TableCell>
                      </TableRow>
                    ) : (
                      quotations.map((quotation) => {
                        const statusConfig = quotationStatusConfig(quotation.status);
                        
                        return (
                          <TableRow key={quotation.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              <Link href={`/procurement/quotation/${quotation.id}`} className="hover:text-primary transition-colors">
                                {quotation.quotationNumber}
                              </Link>
                            </TableCell>
                            
                            <TableCell>
                              <div className="font-medium">{quotation.customerName}</div>
                              <div className="text-sm text-muted-foreground">{quotation.projectName}</div>
                            </TableCell>
                            
                            <TableCell>
                              {quotationTypeText(quotation.type)}
                            </TableCell>
                            
                            <TableCell>
                              <div>ออก: {formatDate(quotation.issuedDate)}</div>
                              <div className="text-sm text-muted-foreground">หมดอายุ: {formatDate(quotation.expiredDate)}</div>
                            </TableCell>
                            
                            <TableCell className="text-right font-medium">
                              {formatCurrency(quotation.total)}
                            </TableCell>
                            
                            <TableCell>
                              <Badge variant={statusConfig.variant}>
                                {statusConfig.text}
                              </Badge>
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex justify-center gap-2">
                                <Button size="icon" variant="ghost" asChild>
                                  <Link href={`/procurement/quotation/${quotation.id}`}>
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">ดู</span>
                                  </Link>
                                </Button>
                                
                                {quotation.status === QuotationStatus.DRAFT && (
                                  <>
                                    <Button size="icon" variant="ghost" asChild>
                                      <Link href={`/procurement/quotation/${quotation.id}/edit`}>
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">แก้ไข</span>
                                      </Link>
                                    </Button>
                                    
                                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">ลบ</span>
                                    </Button>
                                  </>
                                )}
                                
                                {quotation.status === QuotationStatus.APPROVED && (
                                  <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-700">
                                    <ShoppingCart className="h-4 w-4" />
                                    <span className="sr-only">แปลงเป็น PO</span>
                                  </Button>
                                )}
                                
                                {quotation.status === QuotationStatus.PENDING && (
                                  <Button size="icon" variant="ghost" className="text-blue-600 hover:text-blue-700">
                                    <ClipboardCheck className="h-4 w-4" />
                                    <span className="sr-only">อนุมัติ</span>
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
