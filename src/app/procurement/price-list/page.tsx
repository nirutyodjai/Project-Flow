'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/page-header';
import { 
  Database, 
  FileSpreadsheet, 
  Filter, 
  Upload, 
  Download,
  Plus,
  Search,
  RefreshCcw,
  FileEdit,
  Calendar,
  Pencil
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

// ประเภทข้อมูลสำหรับรายการสินค้า
interface PriceListItem {
  id?: string;
  materialCode: string;
  budgetCode?: string;
  description: string;
  detail?: string;
  unit: string;
  priceList: number;
  discount?: number;
  netPrice?: number;
  upPrice?: number;
  submitPrice?: number;
  manPower?: number;
  labour?: number;
  standardPrice?: number;
  miscellaneous?: number;
  miscPercent?: number;
  fitting?: number;
  fittingPercent?: number;
  support?: number;
  supportPercent?: number;
  other?: number;
  otherPercent?: number;
  remark?: string;
  maker?: string;
  supplier?: string;
  category?: string;
  subcategory?: string;
  updatedAt?: string;
  lastUpdated?: string;
}

// ข้อมูลการอัปเดตราคา
interface PriceUpdate {
  updateDate: string;
  description: string;
  fixRate1?: number;
  fixRate2?: number;
  updatedBy?: string;
}

export default function PriceListPage() {
  // State variables
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceItems, setPriceItems] = useState<PriceListItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState<PriceListItem | null>(null);
  const [updateInfo, setUpdateInfo] = useState<PriceUpdate>({
    updateDate: new Date().toISOString().split('T')[0],
    description: 'อัปเดตราคา ' + new Date().toLocaleDateString('th-TH'),
    fixRate1: 15,
    fixRate2: 1000
  });
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  
  const { toast } = useToast();

  // Load price list data and categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadPriceItems();
    }
  }, [selectedCategory]);

  // Load categories
  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/procurement/price-list/categories');
      
      if (!response.ok) {
        throw new Error('การดึงข้อมูลประเภทสินค้าล้มเหลว');
      }
      
      const data = await response.json();
      setCategories(data.data || []);
      
      // Select first category automatically if available
      if (data.data && data.data.length > 0) {
        setSelectedCategory(data.data[0]);
      }
      
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทสินค้า');
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลประเภทสินค้าได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load price items by selected category
  const loadPriceItems = async () => {
    if (!selectedCategory) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/procurement/price-list?category=${encodeURIComponent(selectedCategory)}`);
      
      if (!response.ok) {
        throw new Error('การดึงข้อมูลรายการสินค้าล้มเหลว');
      }
      
      const data = await response.json();
      setPriceItems(data.data || []);
      
    } catch (err) {
      console.error('Error loading price items:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการสินค้า');
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลรายการสินค้าได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Search price items
  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let searchParams = new URLSearchParams();
      
      if (selectedCategory) {
        searchParams.append('category', selectedCategory);
      }
      
      if (searchText) {
        searchParams.append('description', searchText);
      }
      
      const response = await fetch(`/api/procurement/price-list?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('การค้นหาข้อมูลล้มเหลว');
      }
      
      const data = await response.json();
      setPriceItems(data.data || []);
      
    } catch (err) {
      console.error('Error searching price items:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการค้นหาข้อมูล');
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถค้นหาข้อมูลได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add new item
  const handleAddItem = async (formData: PriceListItem) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/procurement/price-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          category: selectedCategory
        }),
      });
      
      if (!response.ok) {
        throw new Error('การเพิ่มรายการสินค้าล้มเหลว');
      }
      
      const data = await response.json();
      
      toast({
        title: "สำเร็จ",
        description: "เพิ่มรายการสินค้าเรียบร้อยแล้ว",
        variant: "success"
      });
      
      // Reload price items
      loadPriceItems();
      setShowAddDialog(false);
      
    } catch (err) {
      console.error('Error adding price item:', err);
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: err instanceof Error ? err.message : 'การเพิ่มรายการสินค้าล้มเหลว',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update item
  const handleUpdateItem = async (formData: PriceListItem) => {
    if (!currentItem?.id) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/procurement/price-list/${currentItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('การอัปเดตรายการสินค้าล้มเหลว');
      }
      
      toast({
        title: "สำเร็จ",
        description: "อัปเดตรายการสินค้าเรียบร้อยแล้ว",
        variant: "success"
      });
      
      // Reload price items
      loadPriceItems();
      setShowUpdateDialog(false);
      
    } catch (err) {
      console.error('Error updating price item:', err);
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: err instanceof Error ? err.message : 'การอัปเดตรายการสินค้าล้มเหลว',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update prices for a category
  const handleUpdatePrices = async () => {
    if (!selectedCategory) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/procurement/price-list/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory,
          updateParams: {
            priceIncreasePercent: 0, // No increase in this example
            newDiscount: 40, // Example: set all discounts to 40%
            newUpPrice: updateInfo.fixRate1 // Example: set all up prices to 15%
          },
          updateInfo: {
            fixRate1: updateInfo.fixRate1,
            fixRate2: updateInfo.fixRate2,
            description: updateInfo.description,
            updatedBy: 'admin' // This would come from authentication
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('การอัปเดตราคาล้มเหลว');
      }
      
      const data = await response.json();
      
      toast({
        title: "สำเร็จ",
        description: `อัปเดตราคาเรียบร้อยแล้ว ${data.count} รายการ`,
        variant: "success"
      });
      
      // Reload price items
      loadPriceItems();
      
    } catch (err) {
      console.error('Error updating prices:', err);
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: err instanceof Error ? err.message : 'การอัปเดตราคาล้มเหลว',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format number as currency
  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined) return '';
    return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Format date
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  // Export data to CSV
  const handleExport = () => {
    if (priceItems.length === 0) return;
    
    // Create CSV content
    let csvContent = "Material Code,Budget Code,Description,Detail,Unit,Price List,Discount %,Net Price,Up %,Submit,Man Power,Labour,Standard Price,Miscellaneous,Maker,Supplier,Last Updated\n";
    
    priceItems.forEach(item => {
      csvContent += `"${item.materialCode || ''}","${item.budgetCode || ''}","${item.description || ''}","${item.detail || ''}","${item.unit || ''}",${item.priceList || ''},${item.discount || ''},${item.netPrice || ''},${item.upPrice || ''},${item.submitPrice || ''},${item.manPower || ''},${item.labour || ''},${item.standardPrice || ''},${item.miscellaneous || ''},"${item.maker || ''}","${item.supplier || ''}","${item.lastUpdated || ''}"\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `price-list-${selectedCategory}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="h-full flex flex-col w-full bg-background text-foreground overflow-y-auto custom-scrollbar">
      <PageHeader 
        title="ระบบบริหารสินค้าและราคา (Price List)"
        description="จัดการข้อมูลสินค้า ราคา ส่วนลด และการคำนวณต้นทุนและกำไร"
      />
      
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Filter and Control Bar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              ค้นหาและกรองข้อมูล
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="categoryFilter">ประเภทสินค้า</Label>
                <Select 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกประเภทสินค้า" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category, index) => (
                      <SelectItem key={index} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="searchInput">ค้นหา</Label>
                <div className="flex gap-2">
                  <Input
                    id="searchInput"
                    placeholder="ค้นหาตามชื่อสินค้า..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  <Button onClick={handleSearch}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-end gap-2">
                <Button onClick={loadPriceItems} variant="outline">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  รีเฟรช
                </Button>
                
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มรายการ
                </Button>
                
                <Button onClick={handleExport} variant="secondary">
                  <Download className="h-4 w-4 mr-2" />
                  ส่งออก CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Update Price Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileEdit className="h-5 w-5 text-primary" />
              ข้อมูลการอัปเดตราคา
            </CardTitle>
            <CardDescription>อัปเดตล่าสุด: {formatDate(updateInfo.updateDate)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="updateDate">วันที่อัปเดต</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="updateDate"
                    type="date"
                    value={updateInfo.updateDate}
                    onChange={(e) => setUpdateInfo({...updateInfo, updateDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="fixRate1">FIX Rate 1 (%)</Label>
                <Input
                  id="fixRate1"
                  type="number"
                  value={updateInfo.fixRate1}
                  onChange={(e) => setUpdateInfo({...updateInfo, fixRate1: parseFloat(e.target.value)})}
                />
              </div>
              
              <div>
                <Label htmlFor="fixRate2">FIX Rate 2</Label>
                <Input
                  id="fixRate2"
                  type="number"
                  value={updateInfo.fixRate2}
                  onChange={(e) => setUpdateInfo({...updateInfo, fixRate2: parseFloat(e.target.value)})}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="updateDesc">รายละเอียด</Label>
                <Input
                  id="updateDesc"
                  value={updateInfo.description}
                  onChange={(e) => setUpdateInfo({...updateInfo, description: e.target.value})}
                />
              </div>
              
              <div className="flex items-end">
                <Button onClick={handleUpdatePrices} className="w-full">
                  <FileEdit className="h-4 w-4 mr-2" />
                  อัปเดตราคาทั้งหมด
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Price List Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              รายการสินค้าและราคา
            </CardTitle>
            <CardDescription>
              {selectedCategory ? `ประเภท: ${selectedCategory}` : 'กรุณาเลือกประเภทสินค้า'} - 
              แสดงทั้งหมด {priceItems.length} รายการ
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground animate-pulse">กำลังโหลดข้อมูล...</p>
              </div>
            ) : error ? (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : priceItems.length === 0 ? (
              <div className="text-center p-8 border border-dashed rounded-lg">
                <p className="text-muted-foreground">ไม่พบข้อมูลรายการสินค้า</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>อัปเดตล่าสุด: {formatDate(updateInfo.updateDate)}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Material Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Detail</TableHead>
                      <TableHead className="text-center">Unit</TableHead>
                      <TableHead className="text-right">Price List</TableHead>
                      <TableHead className="text-center">Dis%</TableHead>
                      <TableHead className="text-right">Net Price</TableHead>
                      <TableHead className="text-center">Up%</TableHead>
                      <TableHead className="text-right">Submit</TableHead>
                      <TableHead className="text-right">Man Power</TableHead>
                      <TableHead className="text-right">Labour</TableHead>
                      <TableHead className="text-right">Standard Price</TableHead>
                      <TableHead className="text-center">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priceItems.map((item, index) => (
                      <TableRow key={item.id || index} className="text-sm">
                        <TableCell>{item.materialCode}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.detail}</TableCell>
                        <TableCell className="text-center">{item.unit}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.priceList)}</TableCell>
                        <TableCell className="text-center">{item.discount}%</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.netPrice)}</TableCell>
                        <TableCell className="text-center">{item.upPrice}%</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.submitPrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.manPower)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.labour)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.standardPrice)}</TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setCurrentItem(item);
                              setShowUpdateDialog(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>เพิ่มรายการสินค้าใหม่</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลรายการสินค้าที่ต้องการเพิ่มในไพรีสลิสต์
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newMaterialCode">Material Code</Label>
                <Input id="newMaterialCode" required />
              </div>
              <div>
                <Label htmlFor="newBudgetCode">Budget Code</Label>
                <Input id="newBudgetCode" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="newDescription">Description</Label>
              <Input id="newDescription" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newDetail">Detail</Label>
                <Input id="newDetail" />
              </div>
              <div>
                <Label htmlFor="newUnit">Unit</Label>
                <Input id="newUnit" required />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="newPriceList">Price List</Label>
                <Input id="newPriceList" type="number" required />
              </div>
              <div>
                <Label htmlFor="newDiscount">Discount %</Label>
                <Input id="newDiscount" type="number" />
              </div>
              <div>
                <Label htmlFor="newUpPrice">Up %</Label>
                <Input id="newUpPrice" type="number" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="newManPower">Man Power</Label>
                <Input id="newManPower" type="number" step="0.001" />
              </div>
              <div>
                <Label htmlFor="newLabour">Labour</Label>
                <Input id="newLabour" type="number" />
              </div>
              <div>
                <Label htmlFor="newStandardPrice">Standard Price</Label>
                <Input id="newStandardPrice" type="number" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newMaker">Maker</Label>
                <Input id="newMaker" />
              </div>
              <div>
                <Label htmlFor="newSupplier">Supplier</Label>
                <Input id="newSupplier" />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddDialog(false)}
            >
              ยกเลิก
            </Button>
            <Button 
              type="submit" 
              onClick={() => {
                // Get form values and add item
                const materialCode = (document.getElementById('newMaterialCode') as HTMLInputElement).value;
                const budgetCode = (document.getElementById('newBudgetCode') as HTMLInputElement).value;
                const description = (document.getElementById('newDescription') as HTMLInputElement).value;
                const detail = (document.getElementById('newDetail') as HTMLInputElement).value;
                const unit = (document.getElementById('newUnit') as HTMLInputElement).value;
                const priceList = parseFloat((document.getElementById('newPriceList') as HTMLInputElement).value);
                const discount = parseFloat((document.getElementById('newDiscount') as HTMLInputElement).value || '0');
                const upPrice = parseFloat((document.getElementById('newUpPrice') as HTMLInputElement).value || '0');
                const manPower = parseFloat((document.getElementById('newManPower') as HTMLInputElement).value || '0');
                const labour = parseFloat((document.getElementById('newLabour') as HTMLInputElement).value || '0');
                const standardPrice = parseFloat((document.getElementById('newStandardPrice') as HTMLInputElement).value || '0');
                const maker = (document.getElementById('newMaker') as HTMLInputElement).value;
                const supplier = (document.getElementById('newSupplier') as HTMLInputElement).value;
                
                // Calculate derived values
                const netPrice = priceList * (1 - discount / 100);
                const submitPrice = netPrice * (1 + upPrice / 100);
                
                const newItem: PriceListItem = {
                  materialCode,
                  budgetCode,
                  description,
                  detail,
                  unit,
                  priceList,
                  discount,
                  netPrice,
                  upPrice,
                  submitPrice,
                  manPower,
                  labour,
                  standardPrice,
                  maker,
                  supplier,
                  category: selectedCategory
                };
                
                handleAddItem(newItem);
              }}
            >
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Item Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>แก้ไขรายการสินค้า</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลรายการสินค้าในไพรีสลิสต์
            </DialogDescription>
          </DialogHeader>
          
          {currentItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editMaterialCode">Material Code</Label>
                  <Input 
                    id="editMaterialCode" 
                    required 
                    defaultValue={currentItem.materialCode} 
                  />
                </div>
                <div>
                  <Label htmlFor="editBudgetCode">Budget Code</Label>
                  <Input 
                    id="editBudgetCode" 
                    defaultValue={currentItem.budgetCode || ''}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Input 
                  id="editDescription" 
                  required 
                  defaultValue={currentItem.description}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editDetail">Detail</Label>
                  <Input 
                    id="editDetail" 
                    defaultValue={currentItem.detail || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="editUnit">Unit</Label>
                  <Input 
                    id="editUnit" 
                    required 
                    defaultValue={currentItem.unit}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="editPriceList">Price List</Label>
                  <Input 
                    id="editPriceList" 
                    type="number" 
                    required 
                    defaultValue={currentItem.priceList}
                  />
                </div>
                <div>
                  <Label htmlFor="editDiscount">Discount %</Label>
                  <Input 
                    id="editDiscount" 
                    type="number" 
                    defaultValue={currentItem.discount || 0}
                  />
                </div>
                <div>
                  <Label htmlFor="editUpPrice">Up %</Label>
                  <Input 
                    id="editUpPrice" 
                    type="number" 
                    defaultValue={currentItem.upPrice || 0}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="editManPower">Man Power</Label>
                  <Input 
                    id="editManPower" 
                    type="number" 
                    step="0.001" 
                    defaultValue={currentItem.manPower || 0}
                  />
                </div>
                <div>
                  <Label htmlFor="editLabour">Labour</Label>
                  <Input 
                    id="editLabour" 
                    type="number" 
                    defaultValue={currentItem.labour || 0}
                  />
                </div>
                <div>
                  <Label htmlFor="editStandardPrice">Standard Price</Label>
                  <Input 
                    id="editStandardPrice" 
                    type="number" 
                    defaultValue={currentItem.standardPrice || 0}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editMaker">Maker</Label>
                  <Input 
                    id="editMaker" 
                    defaultValue={currentItem.maker || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="editSupplier">Supplier</Label>
                  <Input 
                    id="editSupplier" 
                    defaultValue={currentItem.supplier || ''}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUpdateDialog(false)}
            >
              ยกเลิก
            </Button>
            <Button 
              type="submit" 
              onClick={() => {
                if (!currentItem) return;
                
                // Get form values and update item
                const materialCode = (document.getElementById('editMaterialCode') as HTMLInputElement).value;
                const budgetCode = (document.getElementById('editBudgetCode') as HTMLInputElement).value;
                const description = (document.getElementById('editDescription') as HTMLInputElement).value;
                const detail = (document.getElementById('editDetail') as HTMLInputElement).value;
                const unit = (document.getElementById('editUnit') as HTMLInputElement).value;
                const priceList = parseFloat((document.getElementById('editPriceList') as HTMLInputElement).value);
                const discount = parseFloat((document.getElementById('editDiscount') as HTMLInputElement).value || '0');
                const upPrice = parseFloat((document.getElementById('editUpPrice') as HTMLInputElement).value || '0');
                const manPower = parseFloat((document.getElementById('editManPower') as HTMLInputElement).value || '0');
                const labour = parseFloat((document.getElementById('editLabour') as HTMLInputElement).value || '0');
                const standardPrice = parseFloat((document.getElementById('editStandardPrice') as HTMLInputElement).value || '0');
                const maker = (document.getElementById('editMaker') as HTMLInputElement).value;
                const supplier = (document.getElementById('editSupplier') as HTMLInputElement).value;
                
                // Calculate derived values
                const netPrice = priceList * (1 - discount / 100);
                const submitPrice = netPrice * (1 + upPrice / 100);
                
                const updatedItem: PriceListItem = {
                  materialCode,
                  budgetCode,
                  description,
                  detail,
                  unit,
                  priceList,
                  discount,
                  netPrice,
                  upPrice,
                  submitPrice,
                  manPower,
                  labour,
                  standardPrice,
                  maker,
                  supplier,
                  category: currentItem.category
                };
                
                handleUpdateItem(updatedItem);
              }}
            >
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
