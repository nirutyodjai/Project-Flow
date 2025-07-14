'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';
import { 
  Search, 
  Package, 
  PenTool, 
  Calculator, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Layers,
  Building,
  DollarSign,
  FileText,
  BarChart3,
  Save,
  UserPlus,
  Globe,
  Wifi
} from 'lucide-react';
import type { ProjectAnalysisInput, ProjectAnalysisOutput } from '@/ai/flows/analyze-project-details';
import { logger } from '@/lib/logger';

export default function ProjectAnalysisPage() {
  const [input, setInput] = useState<ProjectAnalysisInput>({
    projectName: 'โครงการก่อสร้างอาคารสำนักงาน',
    projectType: 'ก่อสร้าง',
    budget: '12,500,000 บาท',
    organization: 'บริษัท พัฒนาที่ดินไทย จำกัด',
    description: 'ก่อสร้างอาคารสำนักงาน 5 ชั้น พื้นที่ใช้สอย 2,000 ตร.ม.',
  });
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ProjectAnalysisOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingSuppliers, setSavingSuppliers] = useState(false);
  const [searchingOnline, setSearchingOnline] = useState(false);
  const [onlineResults, setOnlineResults] = useState<any>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      logger.info('Starting project analysis via API', input, 'ProjectAnalysisPage');
      
      const response = await fetch('/api/analyze-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const analysis = await response.json();
      setResults(analysis);
    } catch (e) {
      setError('เกิดข้อผิดพลาดในการวิเคราะห์โครงการ');
      logger.error('Error analyzing project:', e, 'ProjectAnalysisPage');
    }
    
    setLoading(false);
  };

  const handleSaveSuppliers = async () => {
    if (!results?.materials) return;
    
    setSavingSuppliers(true);
    
    try {
      // Collect all suppliers from materials
      const suppliers: any[] = [];
      
      results.materials.forEach((material) => {
        if (material.priceOptions) {
          suppliers.push({
            name: material.priceOptions.budget.supplier,
            phone: material.priceOptions.budget.phone,
            address: material.priceOptions.budget.address,
            contactPerson: 'ฝ่ายขาย',
            priceLevel: 'ถูก',
            category: material.category
          });
          
          suppliers.push({
            name: material.priceOptions.standard.supplier,
            phone: material.priceOptions.standard.phone,
            address: material.priceOptions.standard.address,
            contactPerson: 'ฝ่ายขาย',
            priceLevel: 'กลาง',
            category: material.category
          });
          
          suppliers.push({
            name: material.priceOptions.premium.supplier,
            phone: material.priceOptions.premium.phone,
            address: material.priceOptions.premium.address,
            contactPerson: 'ฝ่ายขาย',
            priceLevel: 'แพง',
            category: material.category
          });
        }
      });
      
      const response = await fetch('/api/save-suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ suppliers }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      logger.info('Suppliers saved successfully', result, 'ProjectAnalysisPage');
      
      // Show success message (you can add toast notification here)
      alert(`บันทึกข้อมูลผู้จำหน่าย ${result.saved}/${result.total} รายการเรียบร้อยแล้ว`);
      
    } catch (e) {
      logger.error('Error saving suppliers:', e, 'ProjectAnalysisPage');
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้จำหน่าย');
    }
    
    setSavingSuppliers(false);
  };

  const handleSearchOnlinePrices = async () => {
    if (!results?.materials) return;
    
    setSearchingOnline(true);
    
    try {
      // Search for the first material as example
      const firstMaterial = results.materials[0];
      const searchInput = {
        name: firstMaterial.priceOptions?.standard.supplier || firstMaterial.supplier,
        phone: firstMaterial.priceOptions?.standard.phone || '02-XXX-XXXX',
        material: firstMaterial.item,
        quantity: firstMaterial.quantity,
        location: 'กรุงเทพฯ',
      };
      
      logger.info('Starting online price search', searchInput, 'ProjectAnalysisPage');
      
      const response = await fetch('/api/search-online-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchInput),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const onlineData = await response.json();
      setOnlineResults(onlineData);
      
      logger.info('Online price search completed', onlineData, 'ProjectAnalysisPage');
      
    } catch (e) {
      logger.error('Error searching online prices:', e, 'ProjectAnalysisPage');
      alert('เกิดข้อผิดพลาดในการค้นหาราคาออนไลน์');
    }
    
    setSearchingOnline(false);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'ต่ำ': return 'bg-green-500';
      case 'ปานกลาง': return 'bg-yellow-500';
      case 'สูง': return 'bg-orange-500';
      case 'สูงมาก': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getFeasibilityColor = (feasibility: string) => {
    switch (feasibility) {
      case 'สูง': return 'text-green-600 bg-green-50 border-green-200';
      case 'ปานกลาง': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'ต่ำ': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader 
        title="AI วิเคราะห์โครงการละเอียด" 
        description="วิเคราะห์วัสดุ แบบ ราคา และความเป็นไปได้ของโครงการด้วย AI"
      />

      {/* Form Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            ข้อมูลโครงการ
          </CardTitle>
          <CardDescription>
            กรอกข้อมูลโครงการเพื่อให้ AI วิเคราะห์อย่างละเอียด
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">ชื่อโครงการ</Label>
              <Input
                id="projectName"
                value={input.projectName}
                onChange={(e) => setInput({ ...input, projectName: e.target.value })}
                placeholder="เช่น โครงการก่อสร้างอาคารสำนักงาน"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectType">ประเภทโครงการ</Label>
              <Input
                id="projectType"
                value={input.projectType}
                onChange={(e) => setInput({ ...input, projectType: e.target.value })}
                placeholder="เช่น ก่อสร้าง ปรับปรุง ติดตั้ง"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">งบประมาณ</Label>
              <Input
                id="budget"
                value={input.budget}
                onChange={(e) => setInput({ ...input, budget: e.target.value })}
                placeholder="เช่น 12,500,000 บาท"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">หน่วยงาน/องค์กร</Label>
              <Input
                id="organization"
                value={input.organization}
                onChange={(e) => setInput({ ...input, organization: e.target.value })}
                placeholder="เช่น บริษัท พัฒนาที่ดินไทย จำกัด"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียดโครงการ (ไม่บังคับ)</Label>
            <Textarea
              id="description"
              value={input.description || ''}
              onChange={(e) => setInput({ ...input, description: e.target.value })}
              placeholder="รายละเอียดเพิ่มเติมของโครงการ..."
              rows={3}
            />
          </div>
          <Button 
            onClick={handleAnalyze} 
            disabled={loading || !input.projectName || !input.budget}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                กำลังวิเคราะห์...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                วิเคราะห์โครงการ
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {results && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ความเป็นไปได้</p>
                    <Badge className={getFeasibilityColor(results.summary.feasibility)}>
                      {results.summary.feasibility}
                    </Badge>
                  </div>
                  <Target className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ระดับความเสี่ยง</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getRiskColor(results.summary.riskLevel)}`} />
                      <span className="font-medium">{results.summary.riskLevel}</span>
                    </div>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ระยะเวลา</p>
                    <p className="font-medium">{results.summary.timeframe}</p>
                  </div>
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ราคาประมาณการ</p>
                    <p className="font-medium text-primary">{results.pricing.totalEstimate} บาท</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis Tabs */}
          <Tabs defaultValue="materials" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="materials" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                วัสดุ
              </TabsTrigger>
              <TabsTrigger value="design" className="flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                แบบ
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                ราคา
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                สรุป
              </TabsTrigger>
            </TabsList>

            {/* Materials Tab */}
            <TabsContent value="materials" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        การวิเคราะห์วัสดุและอุปกรณ์
                      </CardTitle>
                      <CardDescription>
                        รายการวัสดุพร้อมตัวเลือกราคาในระดับต่างๆ
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSearchOnlinePrices}
                        disabled={searchingOnline}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        {searchingOnline ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                            ค้นหาออนไลน์...
                          </>
                        ) : (
                          <>
                            <Globe className="w-4 h-4" />
                            ค้นหาราคาออนไลน์
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleSaveSuppliers}
                        disabled={savingSuppliers}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        {savingSuppliers ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                            กำลังบันทึก...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            บันทึกผู้จำหน่าย
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {results.materials.map((material, index) => (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardContent className="pt-4">
                          {/* Basic Material Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground">หมวดหมู่</p>
                              <p className="font-medium">{material.category}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">รายการ</p>
                              <p className="font-medium">{material.item}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">ปริมาณ</p>
                              <p className="font-medium">{material.quantity} {material.unit}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">ราคารวม</p>
                              <p className="font-medium text-primary">{material.totalCost} บาท</p>
                            </div>
                          </div>

                          <Separator className="my-4" />

                          {/* Price Options */}
                          {material.priceOptions && (
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                ตัวเลือกราคา
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Budget Option */}
                                <Card className="border-green-200 bg-green-50">
                                  <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                        💰 ราคาถูก
                                      </Badge>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-2 text-sm">
                                    <div>
                                      <p className="font-medium text-green-800">{material.priceOptions.budget.supplier}</p>
                                      <p className="text-lg font-bold text-green-600">{material.priceOptions.budget.price}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground text-xs">ที่อยู่:</p>
                                      <p className="text-green-700">{material.priceOptions.budget.address}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground text-xs">โทร:</p>
                                      <p className="font-mono text-green-700">{material.priceOptions.budget.phone}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground text-xs">คุณภาพ:</p>
                                      <p className="text-green-700">{material.priceOptions.budget.quality}</p>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Standard Option */}
                                <Card className="border-blue-200 bg-blue-50">
                                  <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                                        ⚖️ ราคากลาง
                                      </Badge>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-2 text-sm">
                                    <div>
                                      <p className="font-medium text-blue-800">{material.priceOptions.standard.supplier}</p>
                                      <p className="text-lg font-bold text-blue-600">{material.priceOptions.standard.price}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground text-xs">ที่อยู่:</p>
                                      <p className="text-blue-700">{material.priceOptions.standard.address}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground text-xs">โทร:</p>
                                      <p className="font-mono text-blue-700">{material.priceOptions.standard.phone}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground text-xs">คุณภาพ:</p>
                                      <p className="text-blue-700">{material.priceOptions.standard.quality}</p>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Premium Option */}
                                <Card className="border-purple-200 bg-purple-50">
                                  <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                                        💎 ราคาแพง
                                      </Badge>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-2 text-sm">
                                    <div>
                                      <p className="font-medium text-purple-800">{material.priceOptions.premium.supplier}</p>
                                      <p className="text-lg font-bold text-purple-600">{material.priceOptions.premium.price}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground text-xs">ที่อยู่:</p>
                                      <p className="text-purple-700">{material.priceOptions.premium.address}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground text-xs">โทร:</p>
                                      <p className="font-mono text-purple-700">{material.priceOptions.premium.phone}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground text-xs">คุณภาพ:</p>
                                      <p className="text-purple-700">{material.priceOptions.premium.quality}</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          )}

                          <Separator className="my-4" />

                          {/* Original Supplier Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-muted/20 p-3 rounded-lg">
                            <div>
                              <p className="text-muted-foreground">ผู้จำหน่ายแนะนำ</p>
                              <p>{material.supplier}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">มาตรฐานคุณภาพ</p>
                              <p>{material.quality}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Price Comparison Summary */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        สรุปเปรียบเทียบราคา
                      </CardTitle>
                      <CardDescription>
                        ตารางเปรียบเทียบราคารวมแต่ละระดับ
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-border">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="border border-border p-3 text-left">วัสดุ/อุปกรณ์</th>
                              <th className="border border-border p-3 text-center bg-green-50">💰 ถูกสุด</th>
                              <th className="border border-border p-3 text-center bg-blue-50">⚖️ ระดับกลาง</th>
                              <th className="border border-border p-3 text-center bg-purple-50">💎 แพงสุด</th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.materials.map((material, index) => {
                              const budgetTotal = material.priceOptions ? 
                                parseFloat(material.priceOptions.budget.price.replace(/[^\d.]/g, '')) * parseFloat(material.quantity) : 0;
                              const standardTotal = material.priceOptions ? 
                                parseFloat(material.priceOptions.standard.price.replace(/[^\d.]/g, '')) * parseFloat(material.quantity) : 0;
                              const premiumTotal = material.priceOptions ? 
                                parseFloat(material.priceOptions.premium.price.replace(/[^\d.]/g, '')) * parseFloat(material.quantity) : 0;
                              
                              return (
                                <tr key={index} className="hover:bg-muted/20">
                                  <td className="border border-border p-3 font-medium">
                                    {material.item}
                                    <br />
                                    <span className="text-sm text-muted-foreground">
                                      {material.quantity} {material.unit}
                                    </span>
                                  </td>
                                  <td className="border border-border p-3 text-center bg-green-50">
                                    <div className="font-bold text-green-600">
                                      {budgetTotal.toLocaleString('th-TH')} บาท
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {material.priceOptions?.budget.price}
                                    </div>
                                  </td>
                                  <td className="border border-border p-3 text-center bg-blue-50">
                                    <div className="font-bold text-blue-600">
                                      {standardTotal.toLocaleString('th-TH')} บาท
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {material.priceOptions?.standard.price}
                                    </div>
                                  </td>
                                  <td className="border border-border p-3 text-center bg-purple-50">
                                    <div className="font-bold text-purple-600">
                                      {premiumTotal.toLocaleString('th-TH')} บาท
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {material.priceOptions?.premium.price}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                            {/* Total Row */}
                            <tr className="bg-muted font-bold">
                              <td className="border border-border p-3">รวมทั้งสิ้น</td>
                              <td className="border border-border p-3 text-center bg-green-100 text-green-700">
                                {results.materials.reduce((total, material) => {
                                  const price = material.priceOptions ? 
                                    parseFloat(material.priceOptions.budget.price.replace(/[^\d.]/g, '')) * parseFloat(material.quantity) : 0;
                                  return total + price;
                                }, 0).toLocaleString('th-TH')} บาท
                              </td>
                              <td className="border border-border p-3 text-center bg-blue-100 text-blue-700">
                                {results.materials.reduce((total, material) => {
                                  const price = material.priceOptions ? 
                                    parseFloat(material.priceOptions.standard.price.replace(/[^\d.]/g, '')) * parseFloat(material.quantity) : 0;
                                  return total + price;
                                }, 0).toLocaleString('th-TH')} บาท
                              </td>
                              <td className="border border-border p-3 text-center bg-purple-100 text-purple-700">
                                {results.materials.reduce((total, material) => {
                                  const price = material.priceOptions ? 
                                    parseFloat(material.priceOptions.premium.price.replace(/[^\d.]/g, '')) * parseFloat(material.quantity) : 0;
                                  return total + price;
                                }, 0).toLocaleString('th-TH')} บาท
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Online Price Search Results */}
                  {onlineResults && (
                    <Card className="mt-6 border-blue-200 bg-blue-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Wifi className="w-5 h-5" />
                          ผลการค้นหาราคาออนไลน์
                        </CardTitle>
                        <CardDescription>
                          ข้อมูลราคาและซัพพลายเออร์จากอินเทอร์เน็ต
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Summary */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="border-green-200 bg-green-50">
                              <CardContent className="pt-4">
                                <div className="text-center">
                                  <p className="text-sm text-muted-foreground">ราคาเฉลี่ย</p>
                                  <p className="text-lg font-bold text-green-600">{onlineResults.summary.averagePrice}</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="border-blue-200 bg-blue-50">
                              <CardContent className="pt-4">
                                <div className="text-center">
                                  <p className="text-sm text-muted-foreground">ผลลัพธ์</p>
                                  <p className="text-lg font-bold text-blue-600">{onlineResults.summary.totalResults} รายการ</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="border-purple-200 bg-purple-50">
                              <CardContent className="pt-4">
                                <div className="text-center">
                                  <p className="text-sm text-muted-foreground">แนวโน้มราคา</p>
                                  <p className="text-lg font-bold text-purple-600">
                                    {onlineResults.summary.priceTrend === 'stable' ? '📊 เสถียร' :
                                     onlineResults.summary.priceTrend === 'increasing' ? '📈 เพิ่มขึ้น' : '📉 ลดลง'}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="border-amber-200 bg-amber-50">
                              <CardContent className="pt-4">
                                <div className="text-center">
                                  <p className="text-sm text-muted-foreground">แนะนำ</p>
                                  <p className="text-sm font-medium text-amber-700">{onlineResults.summary.recommendedSupplier}</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Detailed Results */}
                          {onlineResults.searchResults.map((result: any, index: number) => (
                            <Card key={index} className="border-l-4 border-l-blue-500">
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-lg">{result.supplier.name}</CardTitle>
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant={result.supplier.verificationStatus === 'verified' ? 'default' : 'outline'}
                                      className={
                                        result.supplier.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' :
                                        result.supplier.verificationStatus === 'suspicious' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                      }
                                    >
                                      {result.supplier.verificationStatus === 'verified' ? '✅ ยืนยันแล้ว' :
                                       result.supplier.verificationStatus === 'suspicious' ? '⚠️ น่าสงสัย' : '❓ ไม่ได้ยืนยัน'}
                                    </Badge>
                                    <Badge 
                                      variant="outline"
                                      className={
                                        result.recommendations.riskLevel === 'low' ? 'bg-green-50 text-green-700 border-green-300' :
                                        result.recommendations.riskLevel === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                                        'bg-red-50 text-red-700 border-red-300'
                                      }
                                    >
                                      ความเสี่ยง: {result.recommendations.riskLevel === 'low' ? 'ต่ำ' : 
                                                   result.recommendations.riskLevel === 'medium' ? 'ปานกลาง' : 'สูง'}
                                    </Badge>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {/* Price Info */}
                                  <div className="space-y-3">
                                    <h4 className="font-medium flex items-center gap-2">
                                      <DollarSign className="w-4 h-4" />
                                      ข้อมูลราคา
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <p className="text-muted-foreground">ราคาปัจจุบัน</p>
                                        <p className="font-bold text-lg text-primary">{result.priceInfo.currentPrice}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">ช่วงราคา</p>
                                        <p>{result.priceInfo.priceRange}</p>
                                      </div>
                                      {result.priceInfo.discount && (
                                        <div>
                                          <p className="text-muted-foreground">ส่วนลด</p>
                                          <p className="text-green-600">{result.priceInfo.discount}</p>
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-muted-foreground">สั่งซื้อขั้นต่ำ</p>
                                        <p>{result.priceInfo.minimumOrder}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Contact Info */}
                                  <div className="space-y-3">
                                    <h4 className="font-medium flex items-center gap-2">
                                      <Building className="w-4 h-4" />
                                      ข้อมูลติดต่อ
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <p className="text-muted-foreground">โทรศัพท์</p>
                                        <p className="font-mono">{result.supplier.phone}</p>
                                      </div>
                                      {result.supplier.website && (
                                        <div>
                                          <p className="text-muted-foreground">เว็บไซต์</p>
                                          <p className="text-blue-600">{result.supplier.website}</p>
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-muted-foreground">เวลาตอบกลับ</p>
                                        <p>{result.reliability.responseTime}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">เวลาที่เหมาะสมติดต่อ</p>
                                        <p>{result.recommendations.bestContactTime}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Reliability */}
                                  <div className="space-y-3">
                                    <h4 className="font-medium flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4" />
                                      ความน่าเชื่อถือ
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center gap-2">
                                        <span className={result.reliability.businessRegistration ? 'text-green-600' : 'text-red-600'}>
                                          {result.reliability.businessRegistration ? '✅' : '❌'}
                                        </span>
                                        <span>ลงทะเบียนธุรกิจ</span>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">คะแนนรีวิว</p>
                                        <p className="flex items-center gap-1">
                                          <span className="text-yellow-500">⭐</span>
                                          {result.reliability.reviewScore}/5 ({result.reliability.reviewCount} รีวิว)
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">การชำระเงิน</p>
                                        <div className="flex flex-wrap gap-1">
                                          {result.reliability.paymentTerms.map((term: string, i: number) => (
                                            <Badge key={i} variant="secondary" className="text-xs">{term}</Badge>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Recommendations */}
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                  <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    คำแนะนำ
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className={result.recommendations.shouldContact ? 'text-green-600' : 'text-red-600'}>
                                        {result.recommendations.shouldContact ? '✅ แนะนำให้ติดต่อ' : '❌ ไม่แนะนำให้ติดต่อ'}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">เทคนิคการต่อรอง:</p>
                                      <ul className="list-disc list-inside space-y-1">
                                        {result.recommendations.negotiationTips.map((tip: string, i: number) => (
                                          <li key={i} className="text-gray-700">{tip}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>

                                {/* Market Comparison */}
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                  <h4 className="font-medium mb-2">เปรียบเทียบตลาด</h4>
                                  <div className="text-sm">
                                    <p className="mb-2">ราคาเฉลี่ยตลาด: <span className="font-medium">{result.marketComparison.marketAverage}</span></p>
                                    <p className="mb-2">
                                      ตำแหน่งราคา: 
                                      <Badge 
                                        variant="outline" 
                                        className={
                                          result.marketComparison.pricePosition === 'below_market' ? 'text-green-600 bg-green-50' :
                                          result.marketComparison.pricePosition === 'above_market' ? 'text-red-600 bg-red-50' :
                                          'text-blue-600 bg-blue-50'
                                        }
                                      >
                                        {result.marketComparison.pricePosition === 'below_market' ? 'ต่ำกว่าตลาด' :
                                         result.marketComparison.pricePosition === 'above_market' ? 'สูงกว่าตลาด' : 'ระดับตลาด'}
                                      </Badge>
                                    </p>
                                    {result.marketComparison.competitorPrices.length > 0 && (
                                      <div>
                                        <p className="mb-1">ราคาคู่แข่ง:</p>
                                        <div className="space-y-1">
                                          {result.marketComparison.competitorPrices.map((comp: any, i: number) => (
                                            <div key={i} className="flex justify-between text-xs">
                                              <span>{comp.name}</span>
                                              <span className="font-medium">{comp.price}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}

                          {/* Market Insights */}
                          <Card className="bg-amber-50 border-amber-200">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-amber-700">
                                <TrendingUp className="w-5 h-5" />
                                ข้อมูลเชิงลึกจากตลาด
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {onlineResults.summary.marketInsights.map((insight: string, index: number) => (
                                  <li key={index} className="flex items-start gap-2 text-sm text-amber-700">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                                    {insight}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Design Tab */}
            <TabsContent value="design" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenTool className="w-5 h-5" />
                    การวิเคราะห์แบบ/การออกแบบ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">ประเภทการออกแบบ</p>
                      <p className="font-medium">{results.design.designType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ความซับซ้อน</p>
                      <Badge variant="outline">{results.design.complexity}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">เวลาที่ใช้</p>
                      <p className="font-medium">{results.design.estimatedDesignTime}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">ทักษะที่จำเป็น</p>
                    <div className="flex flex-wrap gap-2">
                      {results.design.requiredSkills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">ข้อกำหนดพิเศษ</p>
                    <ul className="space-y-1">
                      {results.design.specialRequirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">ปัจจัยเสี่ยง</p>
                    <ul className="space-y-1">
                      {results.design.riskFactors.map((risk, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cost Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      แยกต้นทุน
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: 'ต้นทุนวัสดุ', value: results.pricing.materialCost, icon: Package },
                      { label: 'ค่าแรงงาน', value: results.pricing.laborCost, icon: Building },
                      { label: 'ค่าอุปกรณ์', value: results.pricing.equipmentCost, icon: Layers },
                      { label: 'ค่าออกแบบ', value: results.pricing.designCost, icon: PenTool },
                      { label: 'ค่าบริหาร', value: results.pricing.managementCost, icon: TrendingUp },
                      { label: 'ค่าความเสี่ยง', value: results.pricing.contingency, icon: AlertTriangle },
                      { label: 'กำไร', value: results.pricing.profit, icon: DollarSign },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <span className="font-medium">{item.value} บาท</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                      <span className="font-medium">รวมทั้งสิ้น</span>
                      <span className="font-bold text-primary">{results.pricing.totalEstimate} บาท</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Price Breakdown Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      สัดส่วนต้นทุน
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {results.pricing.priceBreakdown.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{item.category}</span>
                          <span className="font-medium">{item.percentage}</span>
                        </div>
                        <Progress 
                          value={parseInt(item.percentage)} 
                          className="h-2"
                        />
                        <div className="text-right text-xs text-muted-foreground">
                          {item.amount} บาท
                        </div>
                      </div>
                    ))}
                    
                    <Separator className="my-4" />
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-medium">ราคาที่แข่งขันได้</span>
                      </div>
                      <p className="text-lg font-bold text-green-600 mt-1">
                        {results.pricing.competitivePrice} บาท
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    สรุปการวิเคราะห์
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted/20 rounded-lg p-4">
                    <h4 className="font-medium mb-2">คำแนะนำ</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {results.summary.recommendation}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">ปัจจัยสำคัญของความสำเร็จ</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {results.summary.keySuccessFactors.map((factor, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-green-700">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
