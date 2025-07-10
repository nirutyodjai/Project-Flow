'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarDateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ChevronRight, BarChart4, LineChart, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

/**
 * MarketTrendAnalysis interface สำหรับรับข้อมูลจาก API
 */
interface MarketTrendAnalysis {
  id?: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  type: 'general' | 'sector' | 'global' | 'local';
  date: string;
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  riskFactors: string[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidenceScore: number;
  createdAt: string;
}

export default function MarketTrendsPage() {
  const [activeTab, setActiveTab] = useState('analyze');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // สำหรับการวิเคราะห์ใหม่
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('daily');
  const [type, setType] = useState<'general' | 'sector' | 'global' | 'local'>('general');
  const [marketData, setMarketData] = useState('');
  const [analysisResult, setAnalysisResult] = useState<MarketTrendAnalysis | null>(null);
  
  // สำหรับการค้นหา
  const [searchPeriod, setSearchPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | ''>('');
  const [searchType, setSearchType] = useState<'general' | 'sector' | 'global' | 'local' | ''>('');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [searchResults, setSearchResults] = useState<MarketTrendAnalysis[]>([]);
  
  // สำหรับรายงานสรุป
  const [summaryReport, setSummaryReport] = useState<string>('');
  const [analysesCount, setAnalysesCount] = useState<number>(0);
  
  const router = useRouter();
  
  // ฟังก์ชันเพื่อวิเคราะห์แนวโน้มตลาด
  const analyzeMarketTrend = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/market/trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period,
          type,
          marketData: marketData.trim() !== '' ? marketData : undefined,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze market trend');
      }
      
      const data = await response.json();
      setAnalysisResult(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // ฟังก์ชันเพื่อค้นหาการวิเคราะห์แนวโน้มตลาด
  const searchMarketTrends = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let url = '/api/market/trends?action=search';
      if (searchPeriod) url += `&period=${searchPeriod}`;
      if (searchType) url += `&type=${searchType}`;
      if (dateRange.from) url += `&startDate=${format(dateRange.from, 'yyyy-MM-dd')}`;
      if (dateRange.to) url += `&endDate=${format(dateRange.to, 'yyyy-MM-dd')}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search market trends');
      }
      
      const data = await response.json();
      setSearchResults(data.analyses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // ฟังก์ชันเพื่อสร้างรายงานสรุป
  const generateSummaryReport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let url = '/api/market/trends?action=summary';
      if (searchPeriod) url += `&period=${searchPeriod}`;
      if (searchType) url += `&type=${searchType}`;
      if (dateRange.from) url += `&startDate=${format(dateRange.from, 'yyyy-MM-dd')}`;
      if (dateRange.to) url += `&endDate=${format(dateRange.to, 'yyyy-MM-dd')}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate summary report');
      }
      
      const data = await response.json();
      setSummaryReport(data.summaryReport);
      setAnalysesCount(data.analysesCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setSummaryReport('');
      setAnalysesCount(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  // ดึงข้อมูลล่าสุดเมื่อโหลดหน้า
  useEffect(() => {
    const fetchLatestAnalysis = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/market/trends?action=latest&period=${period}&type=${type}`);
        
        if (response.ok) {
          const data = await response.json();
          setAnalysisResult(data.analysis);
        }
      } catch (err) {
        console.error('Error fetching latest analysis:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (activeTab === 'analyze') {
      fetchLatestAnalysis();
    }
  }, [activeTab, period, type]);
  
  // ฟังก์ชันแปลง sentiment เป็นไอคอนและสี
  const getSentimentBadge = (sentiment: 'bullish' | 'bearish' | 'neutral') => {
    switch (sentiment) {
      case 'bullish':
        return <Badge className="bg-green-600"><TrendingUp className="w-4 h-4 mr-1" />Bullish</Badge>;
      case 'bearish':
        return <Badge className="bg-red-600"><TrendingDown className="w-4 h-4 mr-1" />Bearish</Badge>;
      case 'neutral':
        return <Badge className="bg-blue-600"><LineChart className="w-4 h-4 mr-1" />Neutral</Badge>;
      default:
        return null;
    }
  };
  
  // ฟังก์ชันแปลงคะแนนความเชื่อมั่นเป็นสี
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">วิเคราะห์แนวโน้มตลาด</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="analyze" className="text-center">วิเคราะห์แนวโน้มตลาด</TabsTrigger>
          <TabsTrigger value="search" className="text-center">ค้นหาการวิเคราะห์</TabsTrigger>
          <TabsTrigger value="summary" className="text-center">รายงานสรุป</TabsTrigger>
        </TabsList>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <TabsContent value="analyze" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>วิเคราะห์แนวโน้มตลาดใหม่</CardTitle>
              <CardDescription>
                ระบบจะทำการวิเคราะห์แนวโน้มตลาดโดยใช้ AI และข้อมูลการวิเคราะห์ล่าสุด
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period">ระยะเวลา</Label>
                  <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
                    <SelectTrigger id="period">
                      <SelectValue placeholder="เลือกระยะเวลา" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">รายวัน</SelectItem>
                      <SelectItem value="weekly">รายสัปดาห์</SelectItem>
                      <SelectItem value="monthly">รายเดือน</SelectItem>
                      <SelectItem value="quarterly">รายไตรมาส</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">ประเภทการวิเคราะห์</Label>
                  <Select value={type} onValueChange={(value: any) => setType(value)}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">ภาพรวมตลาด</SelectItem>
                      <SelectItem value="sector">รายอุตสาหกรรม</SelectItem>
                      <SelectItem value="global">ตลาดโลก</SelectItem>
                      <SelectItem value="local">ตลาดในประเทศ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="marketData">ข้อมูลตลาดเพิ่มเติม (optional)</Label>
                <Textarea
                  id="marketData"
                  placeholder="ป้อนข้อมูลตลาดเพิ่มเติมที่นี่..."
                  value={marketData}
                  onChange={(e) => setMarketData(e.target.value)}
                  rows={5}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={analyzeMarketTrend} disabled={isLoading}>
                {isLoading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์แนวโน้มตลาด'}
              </Button>
            </CardFooter>
          </Card>
          
          {isLoading && !analysisResult ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ) : analysisResult ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>ผลการวิเคราะห์แนวโน้มตลาด {analysisResult.date}</CardTitle>
                  {getSentimentBadge(analysisResult.sentiment)}
                </div>
                <CardDescription>
                  {period === 'daily' ? 'รายวัน' : 
                    period === 'weekly' ? 'รายสัปดาห์' : 
                    period === 'monthly' ? 'รายเดือน' : 'รายไตรมาส'} | 
                  {type === 'general' ? ' ภาพรวมตลาด' : 
                    type === 'sector' ? ' รายอุตสาหกรรม' : 
                    type === 'global' ? ' ตลาดโลก' : ' ตลาดในประเทศ'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">สรุป</h3>
                  <p>{analysisResult.summary}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">ประเด็นสำคัญ</h3>
                    <ul className="list-disc pl-5">
                      {analysisResult.keyPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">คำแนะนำ</h3>
                    <ul className="list-disc pl-5">
                      {analysisResult.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">ปัจจัยเสี่ยง</h3>
                    <ul className="list-disc pl-5">
                      {analysisResult.riskFactors.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-muted-foreground">ความเชื่อมั่นในการวิเคราะห์: </span>
                    <span className={`font-bold ${getConfidenceColor(analysisResult.confidenceScore)}`}>
                      {analysisResult.confidenceScore}%
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(analysisResult.createdAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
        
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ค้นหาการวิเคราะห์แนวโน้มตลาด</CardTitle>
              <CardDescription>
                ค้นหาการวิเคราะห์แนวโน้มตลาดที่มีอยู่แล้วในระบบ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="searchPeriod">ระยะเวลา</Label>
                  <Select value={searchPeriod} onValueChange={(value: any) => setSearchPeriod(value)}>
                    <SelectTrigger id="searchPeriod">
                      <SelectValue placeholder="ทั้งหมด" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">ทั้งหมด</SelectItem>
                      <SelectItem value="daily">รายวัน</SelectItem>
                      <SelectItem value="weekly">รายสัปดาห์</SelectItem>
                      <SelectItem value="monthly">รายเดือน</SelectItem>
                      <SelectItem value="quarterly">รายไตรมาส</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="searchType">ประเภท</Label>
                  <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                    <SelectTrigger id="searchType">
                      <SelectValue placeholder="ทั้งหมด" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">ทั้งหมด</SelectItem>
                      <SelectItem value="general">ภาพรวมตลาด</SelectItem>
                      <SelectItem value="sector">รายอุตสาหกรรม</SelectItem>
                      <SelectItem value="global">ตลาดโลก</SelectItem>
                      <SelectItem value="local">ตลาดในประเทศ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>ช่วงวันที่</Label>
                  <CalendarDateRangePicker date={dateRange} setDate={setDateRange} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={searchMarketTrends} disabled={isLoading}>
                {isLoading ? 'กำลังค้นหา...' : 'ค้นหา'}
              </Button>
            </CardFooter>
          </Card>
          
          {isLoading && searchResults.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/4 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((result) => (
                <Card key={result.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{result.date}</CardTitle>
                      {getSentimentBadge(result.sentiment)}
                    </div>
                    <CardDescription>
                      {result.period === 'daily' ? 'รายวัน' : 
                        result.period === 'weekly' ? 'รายสัปดาห์' : 
                        result.period === 'monthly' ? 'รายเดือน' : 'รายไตรมาส'} | 
                      {result.type === 'general' ? ' ภาพรวมตลาด' : 
                        result.type === 'sector' ? ' รายอุตสาหกรรม' : 
                        result.type === 'global' ? ' ตลาดโลก' : ' ตลาดในประเทศ'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="item-1">
                        <AccordionTrigger>ดูรายละเอียด</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold">สรุป</h3>
                              <p>{result.summary}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-semibold">ประเด็นสำคัญ</h4>
                                <ul className="list-disc pl-5">
                                  {result.keyPoints.map((point, index) => (
                                    <li key={index}>{point}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold">คำแนะนำ</h4>
                                <ul className="list-disc pl-5">
                                  {result.recommendations.map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold">ปัจจัยเสี่ยง</h4>
                                <ul className="list-disc pl-5">
                                  {result.riskFactors.map((risk, index) => (
                                    <li key={index}>{risk}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            <div className="text-sm text-muted-foreground">
                              ความเชื่อมั่นในการวิเคราะห์: 
                              <span className={`font-bold ${getConfidenceColor(result.confidenceScore)}`}>
                                {result.confidenceScore}%
                              </span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !isLoading && (
            <Card className="text-center p-8">
              <p>ไม่พบข้อมูลการวิเคราะห์แนวโน้มตลาดที่ตรงกับเงื่อนไข</p>
              <p className="text-sm text-muted-foreground mt-2">กรุณาปรับเงื่อนไขการค้นหา หรือสร้างการวิเคราะห์แนวโน้มตลาดใหม่</p>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>รายงานสรุปแนวโน้มตลาด</CardTitle>
              <CardDescription>
                สร้างรายงานสรุปแนวโน้มตลาดจากการวิเคราะห์ที่มีอยู่แล้ว
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="summaryPeriod">ระยะเวลา</Label>
                  <Select value={searchPeriod} onValueChange={(value: any) => setSearchPeriod(value)}>
                    <SelectTrigger id="summaryPeriod">
                      <SelectValue placeholder="ทั้งหมด" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">ทั้งหมด</SelectItem>
                      <SelectItem value="daily">รายวัน</SelectItem>
                      <SelectItem value="weekly">รายสัปดาห์</SelectItem>
                      <SelectItem value="monthly">รายเดือน</SelectItem>
                      <SelectItem value="quarterly">รายไตรมาส</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="summaryType">ประเภท</Label>
                  <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                    <SelectTrigger id="summaryType">
                      <SelectValue placeholder="ทั้งหมด" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">ทั้งหมด</SelectItem>
                      <SelectItem value="general">ภาพรวมตลาด</SelectItem>
                      <SelectItem value="sector">รายอุตสาหกรรม</SelectItem>
                      <SelectItem value="global">ตลาดโลก</SelectItem>
                      <SelectItem value="local">ตลาดในประเทศ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>ช่วงวันที่</Label>
                  <CalendarDateRangePicker date={dateRange} setDate={setDateRange} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={generateSummaryReport} disabled={isLoading}>
                {isLoading ? 'กำลังสร้างรายงาน...' : 'สร้างรายงานสรุป'}
              </Button>
            </CardFooter>
          </Card>
          
          {isLoading && !summaryReport ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/3 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ) : summaryReport ? (
            <Card>
              <CardHeader>
                <CardTitle>รายงานสรุปแนวโน้มตลาด</CardTitle>
                <CardDescription>
                  สร้างจากข้อมูลการวิเคราะห์ {analysesCount} รายการ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap">{summaryReport}</div>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">บริการวิเคราะห์ตลาดหุ้นอื่นๆ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>วิเคราะห์ตลาดหุ้น</CardTitle>
            </CardHeader>
            <CardContent>
              <p>วิเคราะห์หุ้นรายตัว, ดัชนีตลาด และข่าวสารทางการเงิน</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push('/market')}>
                ไปที่หน้าวิเคราะห์ตลาดหุ้น <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>การแข่งขันวิเคราะห์หุ้น</CardTitle>
            </CardHeader>
            <CardContent>
              <p>ดูผลการแข่งขันวิเคราะห์หุ้นของ AI และสถิติย้อนหลัง</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push('/market/challenge')}>
                ไปที่หน้าการแข่งขัน <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>เกมวิเคราะห์หุ้น</CardTitle>
            </CardHeader>
            <CardContent>
              <p>ทดลองลงทุนในหุ้นจำลองและวัดผลการลงทุนของคุณ</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push('/trading-game')}>
                ไปที่เกมวิเคราะห์หุ้น <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
