'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Upload, Filter, Search, Star, Ellipsis } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { type Contact } from '@/services/firestore';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';


const contactTypeStyles: { [key: string]: string } = {
  'ลูกค้า': 'bg-blue-900/30 text-blue-300 border-blue-400/30',
  'ซัพพลายเออร์': 'bg-purple-900/30 text-purple-300 border-purple-400/30',
  'ดีลเลอร์': 'bg-green-900/30 text-green-300 border-green-400/30',
  'ผู้รับเหมา': 'bg-orange-900/30 text-orange-300 border-orange-400/30',
  'ซับคอนแทรค': 'bg-pink-900/30 text-pink-300 border-pink-400/30',
};

const mockData = [
    { id: '1', type: "ลูกค้า", name: "บริษัท พัฒนาที่ดินไทย จำกัด", email: "contact@thaidev.co.th", phone: "02-123-4567", address: "123 ถนนสาทร แขวงทุ่งมหาเมฆ เขตสาทร กรุงเทพฯ 10120", contactPerson: "คุณสมศักดิ์ มั่นคง", lastContact: "2 วันที่แล้ว", activity: 'recent', rating: 4 },
    { id: '2', type: "ซัพพลายเออร์", name: "ห้างหุ้นส่วนจำกัด วัสดุภัณฑ์", email: "sales@wasadu.co.th", phone: "02-345-6789", address: "456 ถนนพระราม 9 แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ 10310", contactPerson: "คุณวิชัย รุ่งเรือง", lastContact: "1 วันที่แล้ว", activity: 'recent', rating: 5 },
    { id: '3', type: "ดีลเลอร์", name: "บริษัท เอ็นเอส เทรดดิ้ง จำกัด", email: "info@nstrading.co.th", phone: "02-567-8901", address: "789 ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400", contactPerson: "คุณนภา สุขสวัสดิ์", lastContact: "7 วันที่แล้ว", activity: 'medium', rating: 3 },
    { id: '4', type: "ผู้รับเหมา", name: "บริษัท ก่อสร้างไทย จำกัด", email: "contact@thaiconstruction.co.th", phone: "02-890-1234", address: "101 ถนนวิภาวดีรังสิต แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900", contactPerson: "คุณประเสริฐ ก่อเกียรติ", lastContact: "วันนี้", activity: 'recent', rating: 5 },
    { id: '5', type: "ซับคอนแทรค", name: "บริษัท ระบบไฟฟ้าไทย จำกัด", email: "info@thaielectric.co.th", phone: "02-456-7890", address: "222 ถนนพัฒนาการ แขวงสวนหลวง เขตสวนหลวง กรุงเทพฯ 10250", contactPerson: "คุณสมชาย ไฟฟ้า", lastContact: "3 วันที่แล้ว", activity: 'recent', rating: 4 },
    { id: '6', type: "ลูกค้า", name: "บริษัท เรียลเอสเตท กรุ๊ป", email: "hello@realestategroup.com", phone: "02-987-6543", address: "1/2 อาคารวันซิตี้เซ็นเตอร์ ถนนเพลินจิต กรุงเทพฯ", contactPerson: "คุณอารยา เจริญสุข", lastContact: "1 เดือนที่แล้ว", activity: 'inactive', rating: 3 },
    { id: '7', type: "ซัพพลายเออร์", name: "บริษัท ปูนซีเมนต์ไทย จำกัด (มหาชน)", email: "cement@scc.co.th", phone: "02-586-3333", address: "1 ถนนปูนซิเมนต์ไทย แขวงบางซื่อ เขตบางซื่อ กรุงเทพฯ 10800", contactPerson: "ฝ่ายจัดซื้อ", lastContact: "5 วันที่แล้ว", activity: 'medium', rating: 5 },
    { id: '8', type: "ผู้รับเหมา", name: "บริษัท อิตาเลียนไทย ดีเวล๊อปเมนต์ จำกัด (มหาชน)", email: "info@itd.co.th", phone: "02-733-4000", address: "2034/132-161 อาคารอิตัลไทย ทาวเวอร์ ถนนเพชรบุรีตัดใหม่ แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ 10310", contactPerson: "คุณเปรมชัย กรรณสูต", lastContact: "10 วันที่แล้ว", activity: 'medium', rating: 4 },
    { id: '9', type: "ลูกค้า", name: "มหาวิทยาลัยเกษตรศาสตร์", email: "registrar@ku.ac.th", phone: "02-579-0113", address: "50 ถนนงามวงศ์วาน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900", contactPerson: "ฝ่ายอาคารและสถานที่", lastContact: "2 เดือนที่แล้ว", activity: 'inactive', rating: 4 },
    { id: '10', type: "ดีลเลอร์", name: "บริษัท โฮม โปรดักส์ เซ็นเตอร์ จำกัด (มหาชน)", email: "info@homepro.co.th", phone: "02-832-1000", address: "96/27 หมู่ที่ 9 ตำบลบางเขน อำเภอเมืองนนทบุรี จังหวัดนนทบุรี 11000", contactPerson: "ฝ่ายจัดซื้อโครงการ", lastContact: "12 วันที่แล้ว", activity: 'medium', rating: 4 },
    { id: '11', type: "ซับคอนแทรค", name: "บริษัท ไทยแอร์คอนดิชั่น จำกัด", email: "service@thaiac.co.th", phone: "02-722-9999", address: "1234 ถนนสุขุมวิท แขวงพระโขนง เขตคลองเตย กรุงเทพฯ 10110", contactPerson: "คุณวิรัช ตั้งใจ", lastContact: "4 วันที่แล้ว", activity: 'recent', rating: 3 },
];

const activityStyles: { [key: string]: string } = {
    'recent': 'activity-recent',
    'medium': 'activity-medium',
    'inactive': 'activity-inactive',
};

const tabFilters = [
    { value: 'all', label: 'ทั้งหมด', filter: () => true },
    { value: 'customer', label: 'ลูกค้า', filter: (contact: Contact) => contact.type === 'ลูกค้า' },
    { value: 'supplier', label: 'ซัพพลายเออร์', filter: (contact: Contact) => contact.type === 'ซัพพลายเออร์' },
    { value: 'dealer', label: 'ดีลเลอร์', filter: (contact: Contact) => contact.type === 'ดีลเลอร์' },
    { value: 'contractor', label: 'ผู้รับเหมา', filter: (contact: Contact) => contact.type === 'ผู้รับเหมา' },
    { value: 'subcontractor', label: 'ซับคอนแทรค', filter: (contact: Contact) => contact.type === 'ซับคอนแทรค' },
    { value: 'favorite', label: 'รายการโปรด', filter: (contact: any) => contact.rating >= 4 },
];

const ContactsTable = ({ contacts }: { contacts: (Contact & { activity: string, rating: number })[] }) => {
    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40px]"><Checkbox /></TableHead>
                        <TableHead className="min-w-[250px]">ชื่อ</TableHead>
                        <TableHead>ประเภท</TableHead>
                        <TableHead>เบอร์โทรศัพท์</TableHead>
                        <TableHead>ผู้ติดต่อหลัก</TableHead>
                        <TableHead>ติดต่อล่าสุด</TableHead>
                        <TableHead className="text-center">คะแนน</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contacts.map((contact) => (
                        <TableRow key={contact.email}>
                            <TableCell><Checkbox /></TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{contact.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{contact.name}</div>
                                        <div className="text-xs text-muted-foreground">{contact.email}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={cn(contact.type && contactTypeStyles[contact.type])}>
                                    {contact.type}
                                </Badge>
                            </TableCell>
                            <TableCell>{contact.phone}</TableCell>
                            <TableCell>{contact.contactPerson}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className={`activity-indicator ${activityStyles[contact.activity]}`}></div>
                                    {contact.lastContact}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-center items-center gap-0.5 star-rating">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < contact.rating ? 'star-filled' : 'text-muted-foreground'}`} />
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Ellipsis className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>ดูรายละเอียด</DropdownMenuItem>
                                        <DropdownMenuItem>แก้ไข</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive">ลบ</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
};


export default function ContactsPage() {
    // For now, we use mock data. In a real application, you would fetch this data.
    const [contacts] = useState(mockData); 
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    const filteredContacts = useMemo(() => {
        const currentFilter = tabFilters.find(f => f.value === activeTab)?.filter || (() => true);
        
        const filteredByType = contacts.filter(currentFilter);
        
        if (!searchTerm) {
            return filteredByType;
        }

        const lowercasedFilter = searchTerm.toLowerCase();
        return filteredByType.filter((contact) =>
            Object.values(contact).some(
                (val) =>
                    typeof val === 'string' &&
                    val.toLowerCase().includes(lowercasedFilter)
            )
        );
    }, [contacts, searchTerm, activeTab]);

    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="คู่ค้าและลูกค้า"
                description="จัดการข้อมูลลูกค้า ซัพพลายเออร์ ดีลเลอร์ ผู้รับเหมา และซับคอนแทรค"
            >
                <div className="flex flex-wrap gap-2">
                    <Button><Plus className="h-5 w-5 mr-1" />เพิ่มรายชื่อ</Button>
                    <Button variant="secondary"><Upload className="h-5 w-5 mr-1" />นำเข้า/ส่งออก</Button>
                </div>
            </PageHeader>
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Input 
                                type="text"
                                placeholder="ค้นหาชื่อ บริษัท อีเมล หรือเบอร์โทรศัพท์..."
                                className="pl-10 bg-secondary border-border focus:ring-primary focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="h-5 w-5 text-muted-foreground absolute left-3 top-2.5" />
                        </div>
                        <div className="flex gap-2">
                             <Button variant="secondary"><Filter className="h-5 w-5" /></Button>
                        </div>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden mt-4">
                    <div className="px-4 sm:px-6 lg:px-8 border-b border-border">
                        <TabsList className="bg-transparent p-0">
                            {tabFilters.map(tab => (
                                <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <TabsContent value={activeTab} className="p-4 sm:p-6 lg:p-8 mt-0">
                            <ContactsTable contacts={filteredContacts} />
                        </TabsContent>
                    </div>
                </Tabs>
            </main>
        </div>
    );
}
