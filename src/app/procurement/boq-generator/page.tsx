'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { 
    FileText, 
    FileCheck, 
    ArrowRight, 
    Calculator, 
    CheckCircle2, 
    Copy, 
    Cpu,
    FileSpreadsheet,
    Save,
    Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import CostProfitAnalysis from '../components/cost-profit-analysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TORDataForBOQ {
    id: string;
    analysisId: string;
    documentId: string;
    projectId: string | null;
    projectName: string;
    analysisData: {
        mainRequirements: string[];
        keyDeliverables: string[];
        budget: number;
    };
    createdAt: Date;
    status: 'pending' | 'in_progress' | 'completed';
}

export default function BOQGeneratorPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [torData, setTorData] = useState<TORDataForBOQ | null>(null);
    const [boqItems, setBOQItems] = useState<{
        id: string;
        description: string;
        unit: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }[]>([]);
    const [projectName, setProjectName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isBOQGenerated, setIsBOQGenerated] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [priceSuggestions, setPriceSuggestions] = useState<{
        id: string;
        materialCode: string;
        description: string;
        unit: string;
        priceList: number;
        netPrice: number;
        submitPrice: number;
        supplier?: string;
        maker?: string;
        category?: string;
    }[]>([]);
    const [isSearchingPrices, setIsSearchingPrices] = useState(false);
    const [showPriceDialog, setShowPriceDialog] = useState(false);
    const [costProfitAnalysisData, setCostProfitAnalysisData] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const { toast } = useToast();

    useEffect(() => {
        loadLatestTORData();
    }, []);

    const loadLatestTORData = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/api/analysis/document/save-for-boq');
            
            if (!response.ok) {
                if (response.status === 404) {
                    setError('ไม่พบข้อมูลการวิเคราะห์ TOR สำหรับจัดทำ BOQ');
                    return;
                }
                throw new Error('การดึงข้อมูลล้มเหลว');
            }
            
            const data = await response.json();
            
            if (!data.success || !data.data) {
                setError('ไม่พบข้อมูลการวิเคราะห์ TOR');
                return;
            }
            
            // Format the date for display if needed
            const torDataWithDateFormatted = {
                ...data.data,
                createdAt: new Date(data.data.createdAt)
            };
            
            setTorData(torDataWithDateFormatted);
            setProjectName(data.data.projectName);
            
            // Show success message
            toast({
                title: "โหลดข้อมูลสำเร็จ",
                description: `โหลดข้อมูลการวิเคราะห์ TOR "${data.data.projectName}" สำเร็จ`,
                variant: "success"
            });
            
        } catch (err) {
            console.error('Error loading TOR data for BOQ:', err);
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล');
            
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถดึงข้อมูลการวิเคราะห์ TOR ได้",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Function to generate BOQ from TOR using price list data
    const generateBOQFromTOR = async () => {
        if (!torData?.id) {
            toast({
                title: "ข้อผิดพลาด",
                description: "ไม่พบข้อมูล TOR สำหรับสร้าง BOQ",
                variant: "destructive"
            });
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        try {
            // เรียกใช้ API สำหรับสร้าง BOQ จาก TOR
            const response = await fetch('/api/procurement/boq/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    torForBOQId: torData.id,
                }),
            });
            
            if (!response.ok) {
                throw new Error(`การสร้าง BOQ ล้มเหลว: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'การสร้าง BOQ ล้มเหลว');
            }
            
            // อัปเดตข้อมูล BOQ
            setBOQItems(result.data.boqItems);
            setIsBOQGenerated(true);
            
            // แสดงข้อความสำเร็จ
            toast({
                title: "สร้าง BOQ สำเร็จ",
                description: `สร้างรายการ BOQ จำนวน ${result.data.boqItems.length} รายการ จากข้อมูล TOR สำเร็จ`,
                variant: "success"
            });
            
        } catch (error) {
            console.error('Error generating BOQ:', error);
            setError(error instanceof Error ? error.message : 'การสร้าง BOQ ล้มเหลว');
            
            toast({
                title: "การสร้าง BOQ ล้มเหลว",
                description: error instanceof Error ? error.message : 'การสร้าง BOQ ล้มเหลว กรุณาลองใหม่อีกครั้ง',
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // บันทึก BOQ ที่สร้าง
    const saveBOQ = async () => {
        if (!torData?.id || boqItems.length === 0) {
            toast({
                title: "ไม่สามารถบันทึกได้",
                description: "ไม่มีข้อมูล TOR หรือยังไม่มีรายการ BOQ",
                variant: "destructive"
            });
            return;
        }
        
        setIsSaving(true);
        
        try {
            // เตรียมข้อมูลสำหรับบันทึก
            const requestBody = {
                torForBOQId: torData.id,
                projectName: projectName,
                projectId: torData.projectId,
                boqItems: boqItems
            };
            
            // เรียกใช้ API บันทึกข้อมูล
            const response = await fetch('/api/procurement/boq/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            
            if (!response.ok) {
                throw new Error(`การบันทึกล้มเหลว: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'การบันทึกล้มเหลว');
            }
            
            // แสดงข้อความสำเร็จ
            toast({
                title: "บันทึกข้อมูลสำเร็จ",
                description: `บันทึกข้อมูล BOQ สำหรับโครงการ "${projectName}" เรียบร้อยแล้ว`,
                variant: "success"
            });
            
        } catch (error) {
            console.error('Error saving BOQ:', error);
            
            toast({
                title: "การบันทึกล้มเหลว",
                description: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง',
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    // ค้นหารายการในไพรีสลิสต์
    const searchPriceListItems = async () => {
        if (!searchText.trim()) {
            toast({
                title: "กรุณาระบุคำค้นหา",
                description: "โปรดระบุคำอธิบายหรือชื่อวัสดุที่ต้องการค้นหา",
                variant: "destructive"
            });
            return;
        }
        
        setIsSearchingPrices(true);
        
        try {
            const response = await fetch(`/api/procurement/boq/price-suggestions?description=${encodeURIComponent(searchText)}`);
            
            if (!response.ok) {
                throw new Error(`การค้นหาล้มเหลว: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'การค้นหาล้มเหลว');
            }
            
            setPriceSuggestions(result.data);
            
            if (result.data.length === 0) {
                toast({
                    title: "ไม่พบรายการที่ค้นหา",
                    description: "ไม่พบรายการในไพรีสลิสต์ที่ตรงกับคำค้นหา กรุณาลองคำค้นหาอื่น",
                    variant: "default"
                });
            } else {
                toast({
                    title: "ค้นหาสำเร็จ",
                    description: `พบ ${result.data.length} รายการที่ตรงกับคำค้นหา`,
                    variant: "success"
                });
            }
        } catch (error) {
            console.error('Error searching price list items:', error);
            toast({
                title: "การค้นหาล้มเหลว",
                description: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้ง',
                variant: "destructive"
            });
        } finally {
            setIsSearchingPrices(false);
        }
    };
    
    // เพิ่มรายการจากไพรีสลิสต์ลงใน BOQ
    const addPriceItemToBOQ = (priceItem: any) => {
        // สร้าง ID สำหรับรายการใหม่
        const newId = `item_${Date.now()}`;
        
        // สร้างรายการ BOQ ใหม่จากข้อมูลในไพรีสลิสต์
        const newBOQItem = {
            id: newId,
            description: priceItem.description,
            unit: priceItem.unit,
            quantity: 1, // ค่าเริ่มต้น
            unitPrice: priceItem.submitPrice,
            totalPrice: priceItem.submitPrice,
            materialCode: priceItem.materialCode,
            supplier: priceItem.supplier,
            maker: priceItem.maker,
            priceSource: 'price-list' as const
        };
        
        // เพิ่มรายการใหม่เข้าไปใน state
        setBOQItems(prevItems => [...prevItems, newBOQItem]);
        
        // ปิด dialog
        setShowPriceDialog(false);
        
        // แสดงข้อความสำเร็จ
        toast({
            title: "เพิ่มรายการสำเร็จ",
            description: `เพิ่ม "${priceItem.description}" ลงใน BOQ แล้ว`,
            variant: "success"
        });
    };

    // วิเคราะห์ต้นทุนและกำไร
    const analyzeCostProfit = async () => {
        if (boqItems.length === 0) {
            toast({
                title: "ไม่สามารถวิเคราะห์ได้",
                description: "ยังไม่มีรายการ BOQ สำหรับวิเคราะห์",
                variant: "destructive"
            });
            return;
        }
        
        setIsAnalyzing(true);
        
        try {
            // เรียกใช้ API วิเคราะห์ต้นทุนและกำไร
            const response = await fetch('/api/procurement/cost-profit-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    boqItems,
                    profitTarget: 10, // เป้าหมายกำไร 10%
                    overheadPercent: 8, // ค่าโสหุ้ย 8%
                    labourCostPercent: 15 // ค่าแรงงาน 15% ของต้นทุนวัสดุ
                }),
            });
            
            if (!response.ok) {
                throw new Error(`การวิเคราะห์ล้มเหลว: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'การวิเคราะห์ล้มเหลว');
            }
            
            // อัปเดตข้อมูลการวิเคราะห์
            setCostProfitAnalysisData(result.data);
            
            // อัปเดต boqItems ด้วยข้อมูลการวิเคราะห์
            const updatedItems = result.data.items.map(item => ({
                ...item,
                costBreakdown: item.costBreakdown
            }));
            
            setBOQItems(updatedItems);
            
            // แสดงข้อความสำเร็จ
            toast({
                title: "วิเคราะห์สำเร็จ",
                description: "วิเคราะห์ต้นทุนและกำไรเสร็จสมบูรณ์",
                variant: "success"
            });
            
        } catch (error) {
            console.error('Error analyzing cost and profit:', error);
            
            toast({
                title: "การวิเคราะห์ล้มเหลว",
                description: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการวิเคราะห์ต้นทุนและกำไร',
                variant: "destructive"
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const getTotalAmount = () => {
        return boqItems.reduce((total, item) => total + item.totalPrice, 0);
    };

    return (
        <div className="h-full flex flex-col w-full bg-background text-foreground overflow-y-auto custom-scrollbar">
            <PageHeader 
                title="ระบบสร้าง BOQ"
                description="สร้างเอกสาร BOQ (Bill of Quantities) จากข้อมูลการวิเคราะห์ TOR"
            />
            
            <div className="flex-1 p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: TOR Data */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                ข้อมูล TOR
                            </CardTitle>
                            <CardDescription>
                                ข้อมูลสำคัญจากการวิเคราะห์ TOR
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4 text-muted-foreground animate-pulse">
                                    <Cpu className="h-12 w-12" />
                                    <p>กำลังโหลดข้อมูล TOR...</p>
                                </div>
                            ) : error ? (
                                <Alert variant="destructive" className="mb-6">
                                    <AlertTitle>ไม่พบข้อมูล TOR</AlertTitle>
                                    <AlertDescription>
                                        {error}
                                        <div className="mt-4">
                                            <Button variant="outline" size="sm" onClick={() => window.location.href = '/analysis'}>
                                                <ArrowRight className="mr-2 h-4 w-4" />
                                                ไปยังหน้าวิเคราะห์ TOR
                                            </Button>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            ) : torData ? (
                                <div className="space-y-6">
                                    <div>
                                        <Label>ชื่อโครงการ</Label>
                                        <Input 
                                            value={projectName}
                                            onChange={e => setProjectName(e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                    
                                    <div>
                                        <Label>งบประมาณ</Label>
                                        <p className="text-lg font-medium mt-1">{formatCurrency(torData.analysisData.budget)} บาท</p>
                                    </div>
                                    
                                    <div>
                                        <Label>ข้อกำหนดหลัก</Label>
                                        <ul className="mt-2 space-y-2 list-disc pl-5">
                                            {torData.analysisData.mainRequirements.map((item, index) => (
                                                <li key={index} className="text-sm">{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <Label>ผลงานที่ต้องส่งมอบ</Label>
                                        <ul className="mt-2 space-y-2 list-disc pl-5">
                                            {torData.analysisData.keyDeliverables.map((item, index) => (
                                                <li key={index} className="text-sm">{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <Button 
                                        onClick={generateBOQFromTOR}
                                        disabled={isLoading || !torData}
                                        className="flex items-center gap-2"
                                    >
                                        <Cpu className="h-4 w-4" />
                                        สร้าง BOQ จาก TOR โดยใช้ไพรีสลิสต์
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>ไม่พบข้อมูล TOR</p>
                                    <Button 
                                        variant="link" 
                                        onClick={loadLatestTORData}
                                        className="mt-2"
                                    >
                                        โหลดข้อมูลใหม่
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                
                {/* Right Column: BOQ Builder */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5 text-primary" />
                                Bill of Quantities (BOQ)
                            </CardTitle>
                            <CardDescription>
                                รายการปริมาณงานและราคา
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {boqItems.length > 0 ? (
                                <div className="space-y-6">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse boq-table">
                                            <thead>
                                                <tr className="bg-secondary">
                                                    <th className="border p-2 text-left">ลำดับ</th>
                                                    <th className="border p-2 text-left">รายการ</th>
                                                    <th className="border p-2 text-center">หน่วย</th>
                                                    <th className="border p-2 text-center">จำนวน</th>
                                                    <th className="border p-2 text-right">ราคาต่อหน่วย (บาท)</th>
                                                    <th className="border p-2 text-right">ราคารวม (บาท)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {boqItems.map((item, index) => (
                                                    <tr key={item.id} className="hover:bg-secondary/30">
                                                        <td className="border p-2 text-center">{index + 1}</td>
                                                        <td className="border p-2">{item.description}</td>
                                                        <td className="border p-2 text-center">{item.unit}</td>
                                                        <td className="border p-2 text-center">{item.quantity}</td>
                                                        <td className="border p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                                                        <td className="border p-2 text-right">{formatCurrency(item.totalPrice)}</td>
                                                    </tr>
                                                ))}
                                                <tr className="font-bold bg-secondary/50">
                                                    <td colSpan={5} className="border p-2 text-right">รวมทั้งสิ้น</td>
                                                    <td className="border p-2 text-right">{formatCurrency(getTotalAmount())}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    <div className="flex gap-4 justify-end">
                                        <Button 
                                            variant="outline"
                                            onClick={() => {/* Export to Excel/CSV logic */}}
                                        >
                                            <Copy className="mr-2 h-4 w-4" />
                                            ส่งออก Excel
                                        </Button>
                                        
                                        <Button 
                                            onClick={saveBOQ}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Cpu className="mr-2 h-4 w-4 animate-spin" />
                                                    กำลังบันทึก...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    บันทึก BOQ
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-12 min-h-[400px] text-muted-foreground">
                                    <FileCheck className="h-16 w-16 mb-4" />
                                    <h3 className="text-lg font-medium mb-1">ยังไม่มีรายการ BOQ</h3>
                                    <p className="text-center mb-4">กดปุ่ม "สร้าง BOQ จากข้อมูล TOR" เพื่อเริ่มต้นสร้างรายการ BOQ</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    {/* ข้อมูลเกี่ยวกับราคา */}
                    {isBOQGenerated && boqItems.length > 0 && (
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>รายละเอียดข้อมูลราคา</CardTitle>
                                <CardDescription>ข้อมูลการใช้ไพรีสลิสต์ในการสร้าง BOQ</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>จำนวนรายการที่ใช้ข้อมูลจากไพรีสลิสต์:</span>
                                        <span className="font-medium">{boqItems.filter(item => item.priceSource === 'price-list').length} รายการ</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>จำนวนรายการที่ประมาณราคาเอง:</span>
                                        <span className="font-medium">{boqItems.filter(item => item.priceSource === 'estimate').length} รายการ</span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between">
                                        <span>ความครอบคลุมของไพรีสลิสต์:</span>
                                        <span className="font-medium">
                                            {Math.round((boqItems.filter(item => item.priceSource === 'price-list').length / boqItems.length) * 100)}%
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
            
            {/* ปุ่มค้นหารายการในไพรีสลิสต์ */}
            <Button 
                variant="outline" 
                onClick={() => setShowPriceDialog(true)}
                className="flex items-center gap-2"
            >
                <Search className="h-4 w-4" />
                ค้นหาในไพรีสลิสต์
            </Button>

            {/* Dialog สำหรับค้นหารายการในไพรีสลิสต์ */}
            <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>ค้นหารายการในไพรีสลิสต์</DialogTitle>
                        <DialogDescription>
                            ค้นหารายการวัสดุในไพรีสลิสต์เพื่อเพิ่มลงใน BOQ
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex gap-2 mb-4">
                        <Input 
                            placeholder="ระบุชื่อหรือคำอธิบายวัสดุ" 
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="flex-1"
                        />
                        <Button 
                            onClick={searchPriceListItems}
                            disabled={isSearchingPrices || !searchText.trim()}
                        >
                            {isSearchingPrices ? 'กำลังค้นหา...' : 'ค้นหา'}
                        </Button>
                    </div>
                    
                    {priceSuggestions.length > 0 ? (
                        <div className="max-h-96 overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>รหัสสินค้า</TableHead>
                                        <TableHead>รายละเอียด</TableHead>
                                        <TableHead>หน่วย</TableHead>
                                        <TableHead>ราคา</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {priceSuggestions.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono">{item.materialCode}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell>{item.unit}</TableCell>
                                            <TableCell className="text-right">
                                                {item.submitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => addPriceItemToBOQ(item)}
                                                >
                                                    เพิ่ม
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            {isSearchingPrices 
                                ? 'กำลังค้นหา...' 
                                : 'ยังไม่มีผลการค้นหา โปรดระบุคำค้นหาและกดปุ่มค้นหา'}
                        </div>
                    )}
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPriceDialog(false)}>
                            ปิด
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* แสดงข้อมูลการวิเคราะห์ต้นทุนและกำไรโดยละเอียด */}
            {costProfitAnalysisData && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">การวิเคราะห์ต้นทุน-กำไร</h3>
                    
                    <Tabs defaultValue="analysis">
                        <TabsList className="mb-4">
                            <TabsTrigger value="analysis">สรุปการวิเคราะห์</TabsTrigger>
                            <TabsTrigger value="details">ข้อมูลโดยละเอียด</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="analysis">
                            <div className="grid gap-6 md:grid-cols-2">
                                <CostProfitAnalysis 
                                    boqItems={boqItems} 
                                    budget={torData?.budget} 
                                />
                                
                                <Card>
                                    <CardHeader>
                                        <CardTitle>คำแนะนำในการประมูล</CardTitle>
                                        <CardDescription>
                                            คำแนะนำสำหรับการเสนอราคาและการดำเนินโครงการ
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <h3 className="font-medium">สถานะความเป็นไปได้:</h3>
                                            <div className={`p-3 rounded-md ${
                                                costProfitAnalysisData.summary.averageProfitPercent < 5 
                                                ? 'bg-red-50 text-red-700' 
                                                : costProfitAnalysisData.summary.averageProfitPercent < 10
                                                ? 'bg-amber-50 text-amber-700'
                                                : 'bg-green-50 text-green-700'
                                            }`}>
                                                <p>
                                                    {costProfitAnalysisData.summary.averageProfitPercent < 5 
                                                    ? 'ไม่แนะนำให้เข้าร่วมการประมูล เนื่องจากอัตรากำไรต่ำเกินไป มีความเสี่ยงในการขาดทุน' 
                                                    : costProfitAnalysisData.summary.averageProfitPercent < 10
                                                    ? 'สามารถเข้าร่วมการประมูลได้ แต่ต้องมีการควบคุมต้นทุนอย่างรัดกุม'
                                                    : 'เหมาะสมในการเข้าร่วมการประมูล มีอัตรากำไรอยู่ในเกณฑ์ดี'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h3 className="font-medium mb-2">ข้อควรพิจารณา:</h3>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li>ใช้ข้อมูลราคาจากไพรีสลิสต์ {costProfitAnalysisData.summary.priceListCoveragePercent}% ของรายการทั้งหมด</li>
                                                {costProfitAnalysisData.summary.priceListCoveragePercent < 60 && (
                                                    <li className="text-amber-600">
                                                        ควรหาข้อมูลราคาวัสดุเพิ่มเติม เนื่องจากมีการประมาณราคาเองค่อนข้างมาก
                                                    </li>
                                                )}
                                                {costProfitAnalysisData.summary.labourPercent > 20 && (
                                                    <li className="text-amber-600">
                                                        สัดส่วนค่าแรงสูง ({Math.round(costProfitAnalysisData.summary.labourPercent)}%) ควรมีการบริหารจัดการกำลังคนที่มีประสิทธิภาพ
                                                    </li>
                                                )}
                                                {torData?.budget && costProfitAnalysisData.summary.totalPrice > torData.budget && (
                                                    <li className="text-red-600">
                                                        ราคารวมสูงกว่างบประมาณ {Math.round((costProfitAnalysisData.summary.totalPrice / torData.budget - 1) * 100)}% ควรพิจารณาลดราคาหรือปรับรายการ
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                        
                                        <div>
                                            <h3 className="font-medium mb-2">กลยุทธ์เสนอราคา:</h3>
                                            <p className="text-sm text-gray-600">
                                                {costProfitAnalysisData.summary.averageProfitPercent > 15 
                                                ? 'มีพื้นที่สำหรับปรับลดราคาในการแข่งขันได้ สามารถพิจารณาลดราคาได้สูงสุด 10-15% หากจำเป็น' 
                                                : costProfitAnalysisData.summary.averageProfitPercent > 10
                                                ? 'มีพื้นที่สำหรับปรับลดราคาเล็กน้อยประมาณ 5-7% ถ้าการแข่งขันสูง'
                                                : 'ไม่ควรปรับลดราคาเพิ่มเติม เนื่องจากอัตรากำไรอยู่ในระดับต่ำอยู่แล้ว'}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="details">
                            <Card>
                                <CardHeader>
                                    <CardTitle>โครงสร้างต้นทุนรายละเอียด</CardTitle>
                                    <CardDescription>
                                        แสดงรายละเอียดโครงสร้างต้นทุนแยกตามรายการ
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>รายการ</TableHead>
                                                <TableHead>ค่าวัสดุ</TableHead>
                                                <TableHead>ค่าแรง</TableHead>
                                                <TableHead>ค่าโสหุ้ย</TableHead>
                                                <TableHead>กำไร</TableHead>
                                                <TableHead className="text-right">รวม</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {costProfitAnalysisData.items.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">
                                                        {item.description}
                                                        <div className="text-xs text-gray-500">
                                                            {item.quantity} {item.unit}
                                                            {item.priceSource === 'price-list' && 
                                                                <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-800 rounded-sm text-[10px]">
                                                                    ไพรีสลิสต์
                                                                </span>
                                                            }
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.totalBreakdown?.material.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.totalBreakdown?.labour.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.totalBreakdown?.overhead.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.totalBreakdown?.profit.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                                                        <div className="text-xs text-gray-500">
                                                            {Math.round(item.costBreakdown?.profitPercent || 0)}%
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {item.totalBreakdown?.totalPrice.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow className="bg-muted/50">
                                                <TableCell className="font-bold">รวมทั้งสิ้น</TableCell>
                                                <TableCell className="font-bold">
                                                    {costProfitAnalysisData.summary.totalMaterialCost.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                                                </TableCell>
                                                <TableCell className="font-bold">
                                                    {costProfitAnalysisData.summary.totalLabourCost.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                                                </TableCell>
                                                <TableCell className="font-bold">
                                                    {costProfitAnalysisData.summary.totalOverheadCost.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                                                </TableCell>
                                                <TableCell className="font-bold">
                                                    {costProfitAnalysisData.summary.totalProfitAmount.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                                                    <div className="text-xs">
                                                        {Math.round(costProfitAnalysisData.summary.averageProfitPercent)}%
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-bold">
                                                    {costProfitAnalysisData.summary.totalPrice.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    );
}
