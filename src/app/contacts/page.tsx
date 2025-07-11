'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { listContacts } from '@/services/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


const contactTypeStyles: { [key: string]: string } = {
  'ลูกค้า': 'bg-blue-900/30 text-blue-300 border-blue-400/30',
  'ซัพพลายเออร์': 'bg-purple-900/30 text-purple-300 border-purple-400/30',
  'ดีลเลอร์': 'bg-green-900/30 text-green-300 border-green-400/30',
  'ผู้รับเหมา': 'bg-orange-900/30 text-orange-300 border-orange-400/30',
  'ซับคอนแทรค': 'bg-pink-900/30 text-pink-300 border-pink-400/30',
};

const activityStyles: { [key: string]: string } = {
    'recent': 'activity-recent',
    'medium': 'activity-medium',
    'inactive': 'activity-inactive',
};

const tabFilters = [
    { value: 'all', label: 'ทั้งหมด', filter: () => true },
    { value: 'ลูกค้า', label: 'ลูกค้า', filter: (contact: Contact) => contact.type === 'ลูกค้า' },
    { value: 'ซัพพลายเออร์', label: 'ซัพพลายเออร์', filter: (contact: Contact) => contact.type === 'ซัพพลายเออร์' },
    { value: 'ดีลเลอร์', label: 'ดีลเลอร์', filter: (contact: Contact) => contact.type === 'ดีลเลอร์' },
    { value: 'ผู้รับเหมา', label: 'ผู้รับเหมา', filter: (contact: Contact) => contact.type === 'ผู้รับเหมา' },
    { value: 'ซับคอนแทรค', label: 'ซับคอนแทรค', filter: (contact: Contact) => contact.type === 'ซับคอนแทรค' },
    { value: 'favorite', label: 'รายการโปรด', filter: (contact: any) => contact.rating >= 4 },
];

const ContactsTable = ({ contacts }: { contacts: (Contact & { activity: string, rating: number, lastContact: string })[] }) => {
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
                        <TableRow key={contact.id}>
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
    const [contacts, setContacts] = useState<(Contact & { activity: string, rating: number, lastContact: string })[]>([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const { toast } = useToast();

    useEffect(() => {
      const fetchContacts = async () => {
        setIsLoading(true);
        try {
          const data = await listContacts();
          if (data) {
            // Add mock activity, rating, lastContact for display purposes
            const contactsWithMockData = data.map(contact => ({
              ...contact,
              activity: ['recent', 'medium', 'inactive'][Math.floor(Math.random() * 3)],
              rating: Math.floor(Math.random() * 3) + 3, // 3 to 5 stars
              lastContact: `${Math.floor(Math.random() * 10) + 1} วันที่แล้ว`,
            }));
            setContacts(contactsWithMockData);
          }
        } catch (error) {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถโหลดข้อมูลผู้ติดต่อได้",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchContacts();
    }, [toast]);


    const filteredContacts = useMemo(() => {
        const currentFilter = tabFilters.find(f => f.value === activeTab)?.filter || (() => true);
        
        const filteredByType = contacts.filter(currentFilter as (contact: Contact) => boolean);
        
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
                           {isLoading ? (
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                                </div>
                           ) : filteredContacts.length > 0 ? (
                                <ContactsTable contacts={filteredContacts} />
                           ) : (
                                <div className="text-center py-16 text-muted-foreground">
                                    <p>ไม่พบข้อมูลผู้ติดต่อที่ตรงกับเงื่อนไข</p>
                                </div>
                           )}
                        </TabsContent>
                    </div>
                </Tabs>
            </main>
        </div>
    );
}
