import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, Save, Plus, Search, Trash2, FileText, Calculator, 
  User, MapPin, Phone, Mail
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QuotationType, QuotationStatus } from '@/services/quotation-service';
import CustomerSelector from '../../components/customer-selector';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// ฟังก์ชันจัดรูปแบบตัวเลขเป็นเงินบาท
const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined) return '';
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2
  }).format(amount);
};

export default function MaterialOnlyQuotationPage() {
  const router = useRouter();
  
  // ข้อมูลใบเสนอราคา
  const [quotation, setQuotation] = useState({
    customerId: '',
    customerName: '',
    customerAddress: '',
    customerTaxId: '',
    customerContact: '',
    projectName: '',
    validityPeriod: 30,
    paymentTerms: 'เงินสด/โอน 100% ก่อนส่งมอบสินค้า',
    deliveryTerms: 'ส่งมอบภายใน 7 วันหลังชำระเงิน',
    remark: '',
    vat: 7,
    items: [] as any[],
    type: QuotationType.MATERIAL_ONLY,
    status: QuotationStatus.DRAFT,
  });
  
  // ฟังก์ชันจัดการเลือกลูกค้า
  const handleSelectCustomer = (customer: any) => {
    setQuotation({
      ...quotation,
      customerId: customer.id,
      customerName: customer.name,
      customerAddress: customer.address || '',
      customerTaxId: customer.taxId || '',
      customerContact: customer.contactInfo || customer.phone || customer.email || '',
    });
  };
  
  // สถานะการทำงาน
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // คำนวณยอดรวม
  const calculateSubtotal = () => {
    return quotation.items.reduce((sum, item) => sum + (item.netPrice || 0), 0);
  };
  
  const calculateDiscount = () => {
    return 0; // ไม่มีส่วนลดรวม
  };
  
  const calculateVat = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return (subtotal - discount) * (quotation.vat / 100);
  };
  
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const vat = calculateVat();
    return subtotal - discount + vat;
  };
  
  // ฟังก์ชันค้นหาสินค้าจากไพรีสลิสต์
  const searchPriceListItems = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/procurement/quotation/price-list-items?description=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch price list items');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSearchResults(result.data);
      } else {
        setError(result.error || 'เกิดข้อผิดพลาดในการค้นหาสินค้า');
        setSearchResults([]);
      }
    } catch (error: any) {
      setError(error.message || 'เกิดข้อผิดพลาดในการค้นหาสินค้า');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // ฟังก์ชันเพิ่มสินค้าจากการค้นหา
  const addItemFromSearch = (item: any) => {
    // สร้างรายการใหม่
    const newItem = {
      materialCode: item.materialCode,
      description: item.description,
      quantity: 1,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * 1,
      netPrice: item.unitPrice * 1,
      fromStock: item.fromStock || false,
      stockQuantity: item.stockQuantity || 0,
      priceSource: 'price_list',
      costData: item.costData
    };
    
    // เพิ่มรายการลงในใบเสนอราคา
    setQuotation({
      ...quotation,
      items: [...quotation.items, newItem]
    });
  };
  
  // ฟังก์ชันเพิ่มรายการเปล่า
  const addEmptyItem = () => {
    const newItem = {
      description: '',
      quantity: 1,
      unit: 'หน่วย',
      unitPrice: 0,
      totalPrice: 0,
      netPrice: 0,
      priceSource: 'manual',
    };
    
    setQuotation({
      ...quotation,
      items: [...quotation.items, newItem]
    });
  };
  
  // ฟังก์ชันลบรายการ
  const removeItem = (index: number) => {
    const newItems = [...quotation.items];
    newItems.splice(index, 1);
    
    setQuotation({
      ...quotation,
      items: newItems
    });
  };
  
  // ฟังก์ชันอัปเดตรายการ
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...quotation.items];
    const item = { ...newItems[index], [field]: value };
    
    // คำนวณใหม่
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : item.quantity;
      const unitPrice = field === 'unitPrice' ? value : item.unitPrice;
      
      item.totalPrice = quantity * unitPrice;
      item.netPrice = item.totalPrice;
    }
    
    newItems[index] = item;
    
    setQuotation({
      ...quotation,
      items: newItems
    });
  };
  
  // ฟังก์ชันบันทึกใบเสนอราคา
  const handleSave = async () => {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!quotation.customerName.trim()) {
      setError('กรุณาระบุชื่อลูกค้า');
      return;
    }
    
    if (!quotation.projectName.trim()) {
      setError('กรุณาระบุชื่อโครงการ');
      return;
    }
    
    if (quotation.items.length === 0) {
      setError('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/procurement/quotation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...quotation,
          subtotal: calculateSubtotal(),
          vat: quotation.vat,
          total: calculateTotal(),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save quotation');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // นำทางไปยังหน้ารายละเอียดใบเสนอราคา
        router.push(`/procurement/quotation/${result.data.id}`);
      } else {
        setError(result.error || 'เกิดข้อผิดพลาดในการบันทึกใบเสนอราคา');
      }
    } catch (error: any) {
      setError(error.message || 'เกิดข้อผิดพลาดในการบันทึกใบเสนอราคา');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <PageHeader 
        title="สร้างใบเสนอราคา (เสนอราคาอย่างเดียว)" 
        description="สร้างใบเสนอราคาเฉพาะสินค้าและวัสดุ ไม่รวมค่าแรง"
        extra={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/procurement/quotation">
                <ArrowLeft className="mr-2 h-4 w-4" />
                กลับ
              </Link>
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'กำลังบันทึก...' : 'บันทึกใบเสนอราคา'}
            </Button>
          </div>
        }
      />
      
      <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ข้อมูลลูกค้าและโครงการ */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลลูกค้าและโครงการ</CardTitle>
              <CardDescription>กรอกข้อมูลลูกค้าและรายละเอียดโครงการ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="font-medium">ข้อมูลลูกค้า</div>
                <div className="flex gap-2">
                  <CustomerSelector 
                    onSelect={handleSelectCustomer}
                    buttonText={quotation.customerId ? "เปลี่ยนลูกค้า" : "เลือกลูกค้า"}
                    buttonVariant={quotation.customerId ? "secondary" : "default"} 
                  />
                  {quotation.customerId && (
                    <Button 
                      variant="outline" 
                      onClick={() => setQuotation({
                        ...quotation,
                        customerId: '',
                        customerName: '',
                        customerAddress: '',
                        customerTaxId: '',
                        customerContact: '',
                      })}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      ล้างข้อมูล
                    </Button>
                  )}
                </div>
              </div>
              
              {quotation.customerId && (
                <div className="p-3 border rounded-lg mb-4 bg-secondary/30">
                  <div className="flex items-center mb-2">
                    <User className="h-4 w-4 text-primary mr-2" />
                    <div className="font-medium">{quotation.customerName}</div>
                    {quotation.customerTaxId && (
                      <div className="text-xs text-muted-foreground ml-auto">
                        เลขประจำตัวผู้เสียภาษี: {quotation.customerTaxId}
                      </div>
                    )}
                  </div>
                  
                  {quotation.customerAddress && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{quotation.customerAddress}</span>
                    </div>
                  )}
                  
                  {quotation.customerContact && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Phone className="h-3 w-3" />
                      <span>{quotation.customerContact}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">ชื่อลูกค้า <span className="text-destructive">*</span></Label>
                  <Input 
                    id="customerName" 
                    value={quotation.customerName}
                    onChange={(e) => setQuotation({...quotation, customerName: e.target.value})}
                    placeholder="ชื่อบริษัทหรือชื่อลูกค้า"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectName">ชื่อโครงการ <span className="text-destructive">*</span></Label>
                  <Input 
                    id="projectName" 
                    value={quotation.projectName}
                    onChange={(e) => setQuotation({...quotation, projectName: e.target.value})}
                    placeholder="ชื่อโครงการหรือรายละเอียดงาน"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerAddress">ที่อยู่</Label>
                <Textarea 
                  id="customerAddress"
                  value={quotation.customerAddress}
                  onChange={(e) => setQuotation({...quotation, customerAddress: e.target.value})}
                  placeholder="ที่อยู่ลูกค้า"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerTaxId">เลขประจำตัวผู้เสียภาษี</Label>
                  <Input 
                    id="customerTaxId" 
                    value={quotation.customerTaxId}
                    onChange={(e) => setQuotation({...quotation, customerTaxId: e.target.value})}
                    placeholder="เลขประจำตัวผู้เสียภาษี"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerContact">ข้อมูลติดต่อ</Label>
                  <Input 
                    id="customerContact" 
                    value={quotation.customerContact}
                    onChange={(e) => setQuotation({...quotation, customerContact: e.target.value})}
                    placeholder="อีเมลหรือเบอร์โทรศัพท์"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>รายการสินค้า</CardTitle>
                <CardDescription>เพิ่มรายการสินค้าที่ต้องการเสนอราคา</CardDescription>
              </div>
              
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Search className="mr-2 h-4 w-4" />
                      ค้นหาจากไพรีสลิสต์
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>ค้นหาสินค้าจากไพรีสลิสต์</DialogTitle>
                      <DialogDescription>
                        ค้นหาสินค้าจากรายการไพรีสลิสต์เพื่อเพิ่มลงในใบเสนอราคา
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex gap-2 my-4">
                      <Input 
                        placeholder="ค้นหาตามรหัส, ชื่อสินค้า หรือหมวดหมู่"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchPriceListItems()}
                      />
                      <Button onClick={searchPriceListItems} disabled={isSearching}>
                        <Search className="mr-2 h-4 w-4" />
                        {isSearching ? 'กำลังค้นหา...' : 'ค้นหา'}
                      </Button>
                    </div>
                    
                    {isSearching ? (
                      <div className="text-center py-4">กำลังค้นหาสินค้า...</div>
                    ) : searchResults.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">ไม่พบข้อมูลสินค้า หรือยังไม่ได้ค้นหา</div>
                    ) : (
                      <div className="max-h-[400px] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[100px]">รหัส</TableHead>
                              <TableHead>รายการ</TableHead>
                              <TableHead className="text-right">ราคา</TableHead>
                              <TableHead className="w-[60px]">สต๊อก</TableHead>
                              <TableHead className="w-[100px] text-right"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {searchResults.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{item.materialCode || '-'}</TableCell>
                                <TableCell>
                                  <div>{item.description}</div>
                                  <div className="text-xs text-muted-foreground">{item.unit}</div>
                                </TableCell>
                                <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                                <TableCell className="text-center">
                                  {item.stockQuantity > 0 ? (
                                    <div className="text-xs text-green-500">{item.stockQuantity}</div>
                                  ) : (
                                    <div className="text-xs text-muted-foreground">-</div>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => addItemFromSearch(item)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setSearchResults([])}>
                        ล้างผลการค้นหา
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button onClick={addEmptyItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  เพิ่มรายการเปล่า
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {quotation.items.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-md">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">ยังไม่มีรายการสินค้า กรุณาเพิ่มรายการสินค้า</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Button variant="outline" onClick={() => {
                      const dialog = document.querySelector('[role="dialog"]');
                      if (dialog) {
                        const trigger = dialog.previousElementSibling as HTMLButtonElement;
                        if (trigger) trigger.click();
                      }
                    }}>
                      <Search className="mr-2 h-4 w-4" />
                      ค้นหาจากไพรีสลิสต์
                    </Button>
                    <Button onClick={addEmptyItem}>
                      <Plus className="mr-2 h-4 w-4" />
                      เพิ่มรายการเปล่า
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>รายการ</TableHead>
                        <TableHead className="w-[80px]">จำนวน</TableHead>
                        <TableHead className="w-[80px]">หน่วย</TableHead>
                        <TableHead className="w-[150px] text-right">ราคาต่อหน่วย</TableHead>
                        <TableHead className="w-[150px] text-right">ราคารวม</TableHead>
                        <TableHead className="w-[80px] text-center">สต๊อก</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotation.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Input 
                              value={item.description} 
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                              placeholder="รายการสินค้า"
                              className="border-none bg-transparent p-0 h-auto"
                            />
                            {item.materialCode && (
                              <div className="text-xs text-muted-foreground mt-1">รหัส: {item.materialCode}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={item.quantity} 
                              onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              min={0}
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={item.unit} 
                              onChange={(e) => updateItem(index, 'unit', e.target.value)}
                              placeholder="หน่วย"
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={item.unitPrice} 
                              onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              min={0}
                              className="w-full text-right"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.totalPrice)}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.stockQuantity > 0 ? (
                              <div className="flex items-center justify-center">
                                <Checkbox 
                                  checked={item.fromStock} 
                                  onCheckedChange={(checked) => updateItem(index, 'fromStock', !!checked)}
                                  disabled={item.stockQuantity <= 0}
                                />
                                <span className="ml-1 text-xs">{item.stockQuantity}</span>
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">ไม่มี</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => removeItem(index)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <div>
                <Button variant="outline" onClick={addEmptyItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  เพิ่มรายการ
                </Button>
              </div>
              <div className="text-sm">
                จำนวน <span className="font-semibold">{quotation.items.length}</span> รายการ
              </div>
            </CardFooter>
          </Card>
        </div>
        
        {/* สรุปใบเสนอราคาและข้อมูลเพิ่มเติม */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>สรุปใบเสนอราคา</CardTitle>
              <CardDescription>รายละเอียดและยอดรวมใบเสนอราคา</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">ยอดรวม:</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">ภาษีมูลค่าเพิ่ม:</span>
                    <Select
                      value={quotation.vat.toString()}
                      onValueChange={(value) => setQuotation({...quotation, vat: parseFloat(value)})}
                    >
                      <SelectTrigger className="w-[80px] h-8 text-xs">
                        <SelectValue placeholder="VAT %" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="7">7%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <span>{formatCurrency(calculateVat())}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>ยอดรวมทั้งสิ้น:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="validityPeriod">ระยะเวลาที่ใบเสนอราคามีผล (วัน)</Label>
                  <Input 
                    type="number"
                    id="validityPeriod" 
                    value={quotation.validityPeriod}
                    onChange={(e) => setQuotation({...quotation, validityPeriod: parseInt(e.target.value) || 30})}
                    min={1}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">เงื่อนไขการชำระเงิน</Label>
                  <Textarea 
                    id="paymentTerms"
                    value={quotation.paymentTerms}
                    onChange={(e) => setQuotation({...quotation, paymentTerms: e.target.value})}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deliveryTerms">เงื่อนไขการจัดส่ง</Label>
                  <Textarea 
                    id="deliveryTerms"
                    value={quotation.deliveryTerms}
                    onChange={(e) => setQuotation({...quotation, deliveryTerms: e.target.value})}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="remark">หมายเหตุ</Label>
                  <Textarea 
                    id="remark"
                    value={quotation.remark}
                    onChange={(e) => setQuotation({...quotation, remark: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t p-4">
              <Button className="w-full" onClick={handleSave} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'กำลังบันทึก...' : 'บันทึกใบเสนอราคา'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                กำไรโดยประมาณ
              </CardTitle>
              <CardDescription>
                ข้อมูลต้นทุนและกำไรโดยประมาณ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ต้นทุนรวม (ประมาณการ):</span>
                  <span>{formatCurrency(quotation.items.reduce((sum, item) => sum + ((item.costData?.materialCost || item.unitPrice * 0.7) * item.quantity), 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">กำไรรวม (ประมาณการ):</span>
                  <span>{formatCurrency(calculateSubtotal() - quotation.items.reduce((sum, item) => sum + ((item.costData?.materialCost || item.unitPrice * 0.7) * item.quantity), 0))}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>กำไร %:</span>
                  <span className="text-green-500">
                    {(() => {
                      const cost = quotation.items.reduce((sum, item) => sum + ((item.costData?.materialCost || item.unitPrice * 0.7) * item.quantity), 0);
                      const revenue = calculateSubtotal();
                      if (cost === 0 || revenue === 0) return '0.00%';
                      return ((revenue - cost) / cost * 100).toFixed(2) + '%';
                    })()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
