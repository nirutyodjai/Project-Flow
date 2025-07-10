'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, UserPlus, User, Phone, Mail, Building, MapPin, 
  LoaderCircle, Save, AlertTriangle, X, Check 
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Customer {
  id: string;
  name: string;
  address?: string;
  taxId?: string;
  contactInfo?: string;
  email?: string;
  phone?: string;
}

interface CustomerSelectorProps {
  onSelect: (customer: Customer) => void;
  buttonText?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
}

export default function CustomerSelector({ onSelect, buttonText = "เลือกลูกค้า", buttonVariant = "outline" }: CustomerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // ข้อมูลลูกค้าใหม่
  const [newCustomer, setNewCustomer] = useState<{
    name: string;
    address: string;
    taxId: string;
    contactPerson: string;
    email: string;
    phone: string;
  }>({
    name: '',
    address: '',
    taxId: '',
    contactPerson: '',
    email: '',
    phone: '',
  });

  // ฟังก์ชันค้นหาลูกค้า
  const searchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/contacts/customers?search=${encodeURIComponent(searchTerm)}&limit=20`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setCustomers(result.data);
      } else {
        setError(result.error || 'เกิดข้อผิดพลาดในการค้นหาลูกค้า');
        setCustomers([]);
      }
    } catch (error: any) {
      setError(error.message || 'เกิดข้อผิดพลาดในการค้นหาลูกค้า');
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // โหลดข้อมูลลูกค้าเริ่มต้นเมื่อเปิด Dialog
  useEffect(() => {
    if (isOpen && activeTab === 'search') {
      searchCustomers();
    }
  }, [isOpen]);
  
  // รีเซ็ตฟอร์มเมื่อปิด Dialog
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setNewCustomer({
        name: '',
        address: '',
        taxId: '',
        contactPerson: '',
        email: '',
        phone: '',
      });
      setSaveSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  // เลือกลูกค้าและปิด Dialog
  const handleSelectCustomer = (customer: Customer) => {
    onSelect(customer);
    setIsOpen(false);
  };
  
  // บันทึกลูกค้าใหม่
  const saveNewCustomer = async () => {
    if (!newCustomer.name) {
      setError('กรุณาระบุชื่อลูกค้า');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCustomer.name,
          type: 'ลูกค้า',
          address: newCustomer.address,
          taxId: newCustomer.taxId,
          contactPerson: newCustomer.contactPerson,
          email: newCustomer.email,
          phone: newCustomer.phone
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลลูกค้า');
      }
      
      // สร้างลูกค้าจากข้อมูลที่ส่งกลับมา
      const customer: Customer = {
        id: data.data.id,
        name: newCustomer.name,
        address: newCustomer.address,
        taxId: newCustomer.taxId,
        contactInfo: newCustomer.contactPerson,
        email: newCustomer.email,
        phone: newCustomer.phone
      };
      
      setSaveSuccess(true);
      
      // รอเล็กน้อยแล้วเลือกลูกค้าที่เพิ่มใหม่
      setTimeout(() => {
        handleSelectCustomer(customer);
      }, 1000);
      
    } catch (error: any) {
      setError(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลลูกค้า');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant}>
          <User className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>ข้อมูลลูกค้า</DialogTitle>
          <DialogDescription>
            ค้นหาลูกค้าที่มีอยู่ในระบบหรือเพิ่มลูกค้าใหม่
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="search" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="search">ค้นหาลูกค้า</TabsTrigger>
            <TabsTrigger value="new">เพิ่มลูกค้าใหม่</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search">
            <div className="flex gap-2 mb-4">
              <Input 
                placeholder="ค้นหาตามชื่อลูกค้า"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchCustomers()}
              />
              <Button onClick={searchCustomers} disabled={isLoading}>
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? 'กำลังค้นหา...' : 'ค้นหา'}
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {isLoading ? (
              <div className="text-center py-8">
                <LoaderCircle className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                <p>กำลังค้นหาลูกค้า...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-md">
                <p className="text-muted-foreground mb-4">ไม่พบข้อมูลลูกค้า หรือยังไม่ได้ค้นหา</p>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      searchCustomers();
                    }}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    ค้นหาอีกครั้ง
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => {
                      setActiveTab('new');
                      if (searchTerm) {
                        setNewCustomer({
                          ...newCustomer,
                          name: searchTerm
                        });
                      }
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    เพิ่มลูกค้าใหม่
                  </Button>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {customers.map((customer) => (
                    <div 
                      key={customer.id} 
                      className="p-3 border rounded-md hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          {customer.name}
                        </div>
                        
                        {customer.taxId && (
                          <div className="text-xs text-muted-foreground">
                            เลขประจำตัวผู้เสียภาษี: {customer.taxId}
                          </div>
                        )}
                      </div>
                      
                      {customer.address && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
                          <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span>{customer.address}</span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                        
                        {customer.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="new">
            {saveSuccess ? (
              <div className="text-center py-8">
                <div className="h-12 w-12 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-green-700 mb-2">บันทึกข้อมูลเรียบร้อย</h3>
                <p className="text-muted-foreground mb-4">บันทึกข้อมูลลูกค้าใหม่เรียบร้อยแล้ว</p>
              </div>
            ) : (
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="customer-name">ชื่อลูกค้า <span className="text-destructive">*</span></Label>
                  <Input 
                    id="customer-name" 
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    placeholder="ชื่อบริษัทหรือชื่อลูกค้า"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer-address">ที่อยู่</Label>
                  <Textarea 
                    id="customer-address" 
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                    placeholder="ที่อยู่ลูกค้า"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-tax-id">เลขประจำตัวผู้เสียภาษี</Label>
                    <Input 
                      id="customer-tax-id" 
                      value={newCustomer.taxId}
                      onChange={(e) => setNewCustomer({...newCustomer, taxId: e.target.value})}
                      placeholder="เลขประจำตัวผู้เสียภาษี"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customer-contact">ผู้ติดต่อหลัก</Label>
                    <Input 
                      id="customer-contact" 
                      value={newCustomer.contactPerson}
                      onChange={(e) => setNewCustomer({...newCustomer, contactPerson: e.target.value})}
                      placeholder="ชื่อผู้ติดต่อ"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-email">อีเมล</Label>
                    <Input 
                      id="customer-email" 
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                      placeholder="อีเมล"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customer-phone">เบอร์โทรศัพท์</Label>
                    <Input 
                      id="customer-phone" 
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                      placeholder="เบอร์โทรศัพท์"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={saveNewCustomer} 
                    disabled={isSaving || !newCustomer.name}
                  >
                    {isSaving ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        บันทึกข้อมูลลูกค้า
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {activeTab === 'search' ? 'ยกเลิก' : (
              <>
                <X className="mr-2 h-4 w-4" />
                ปิด
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
