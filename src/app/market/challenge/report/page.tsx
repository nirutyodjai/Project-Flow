'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Alert, AlertTitle, AlertDescription,
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui";
import { 
  BarChart, BarChart3, Loader2, RefreshCcw, ArrowLeft, 
  TrendingUp, TrendingDown, LineChart, HelpCircle, 
  AreaChart, PieChart, ChartBar, ListChecks
} from "lucide-react";
import PageHeader from "@/components/page-header";

// เพิ่ม chart component
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  Cell, PieChart, Pie
} from 'recharts';

interface AccuracyTrend {
  date: string;
  accuracy: number;
  correctCount: number;
}

interface StockPerformance {
  ticker: string;
  correctCount: number;
  totalPredictions: number;
  accuracy: number;
}

interface UpDownAccuracy {
  upPredictions: number;
  correctUpPredictions: number;
  upAccuracy: number;
  downPredictions: number;
  correctDownPredictions: number;
  downAccuracy: number;
}

interface ConfidenceAnalysis {
  confidenceRange: string;
  predictions: number;
  correct: number;
  accuracy: number;
}

interface ChallengeReport {
  totalChallenges: number;
  completedChallenges: number;
  aiWins: number;
  aiLosses: number;
  winRate: number;
  accuracyTrend: AccuracyTrend[];
  bestPredictedStocks: StockPerformance[];
  worstPredictedStocks: StockPerformance[];
  upDownAccuracy: UpDownAccuracy;
  confidenceAnalysis: ConfidenceAnalysis[];
  recommendations: string[];
}

interface AIAnalysis {
  insights: string;
  recommendations: string[];
  trendAnalysis: string;
  stockSpecificInsights: string;
}

interface FullReport {
  report: ChallengeReport;
  analysis: AIAnalysis;
}

export default function ChallengeReportPage() {
  const [reportData, setReportData] = useState<FullReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dayRange, setDayRange] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');
  
  // โหลดข้อมูลเมื่อเริ่มต้น
  useEffect(() => {
    fetchReport();
  }, []);

  // โหลดรายงาน
  const fetchReport = async (days: string = dayRange) => {
    try {
      setIsLoading(true);
      setError('');
      
      const res = await fetch(`/api/market/challenge/report?days=${days}`);
      if (!res.ok) {
        throw new Error('ไม่สามารถโหลดรายงานได้');
      }
      
      const data = await res.json();
      setReportData(data);
      setDayRange(days);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      console.error('Error loading report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันช่วยจัดรูปแบบเปอร์เซ็นต์
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // กำหนดสีสำหรับกราฟ
  const COLORS = ['#4f46e5', '#10b981', '#f97316', '#ef4444', '#8b5cf6', '#ec4899'];
  const TREND_COLORS = {
    up: '#10b981',   // เขียว
    down: '#ef4444', // แดง
    neutral: '#6b7280' // เทา
  };

  // ถ้ากำลังโหลด
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">กำลังโหลดรายงาน...</p>
      </div>
    );
  }

  // ถ้าเกิดข้อผิดพลาด
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Link href="/market/challenge" className="flex items-center text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          กลับไปยังการแข่งขันวิเคราะห์หุ้น
        </Link>
        
        <Alert variant="destructive">
          <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <div className="mt-6 flex justify-center">
          <Button onClick={() => fetchReport()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            ลองอีกครั้ง
          </Button>
        </div>
      </div>
    );
  }

  // ถ้าไม่มีข้อมูล
  if (!reportData || !reportData.report) {
    return (
      <div className="container mx-auto py-8">
        <Link href="/market/challenge" className="flex items-center text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          กลับไปยังการแข่งขันวิเคราะห์หุ้น
        </Link>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <p>ยังไม่มีข้อมูลรายงาน กรุณาเริ่มการแข่งขันและรอผลการตรวจสอบ</p>
          </CardContent>
          <CardFooter className="justify-center">
            <Link href="/market/challenge">
              <Button>
                เริ่มการแข่งขัน
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const { report, analysis } = reportData;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/market/challenge" className="flex items-center text-muted-foreground hover:text-primary mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปยังการแข่งขันวิเคราะห์หุ้น
          </Link>
          
          <PageHeader 
            title="รายงานผลการวิเคราะห์หุ้น AI" 
            subtitle="ข้อมูลเชิงลึกและสถิติความแม่นยำในการวิเคราะห์หุ้นของ AI"
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            value={dayRange}
            onValueChange={(value) => {
              setDayRange(value);
              fetchReport(value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <span>ข้อมูลย้อนหลัง {dayRange} วัน</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 วัน</SelectItem>
              <SelectItem value="30">30 วัน</SelectItem>
              <SelectItem value="60">60 วัน</SelectItem>
              <SelectItem value="90">90 วัน</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => fetchReport()}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            รีเฟรช
          </Button>
        </div>
      </div>

      {report.completedChallenges < 3 ? (
        <Alert>
          <AlertTitle>ข้อมูลไม่เพียงพอ</AlertTitle>
          <AlertDescription>
            มีข้อมูลการแข่งขันที่สมบูรณ์เพียง {report.completedChallenges} วัน 
            ต้องมีข้อมูลอย่างน้อย 3 วันเพื่อให้การวิเคราะห์มีความน่าเชื่อถือ
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>อัตราชนะ</CardTitle>
            <CardDescription>AI ชนะเมื่อทายถูก 7 จาก 10 ครั้ง</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{report.winRate.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">
              ชนะ {report.aiWins} จาก {report.completedChallenges} ครั้ง
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>ความแม่นยำเฉลี่ย</CardTitle>
            <CardDescription>เปอร์เซ็นต์การทำนายถูกต้องเฉลี่ย</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {report.accuracyTrend.length > 0 
                ? (report.accuracyTrend.reduce((sum, item) => sum + item.accuracy, 0) / report.accuracyTrend.length).toFixed(1)
                : 0}%
            </div>
            <p className="text-sm text-muted-foreground">
              จากข้อมูล {report.accuracyTrend.length} วัน
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>ทำนายแนวโน้มหุ้นขึ้น</CardTitle>
            <CardDescription>ความแม่นยำในการทำนายหุ้นขึ้น</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: report.upDownAccuracy.upAccuracy >= 50 ? '#10b981' : '#ef4444' }}>
              {report.upDownAccuracy.upAccuracy.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">
              ถูกต้อง {report.upDownAccuracy.correctUpPredictions} จาก {report.upDownAccuracy.upPredictions} ครั้ง
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview"><BarChart className="h-4 w-4 mr-2" />ภาพรวม</TabsTrigger>
          <TabsTrigger value="trend"><LineChart className="h-4 w-4 mr-2" />แนวโน้ม</TabsTrigger>
          <TabsTrigger value="stocks"><ChartBar className="h-4 w-4 mr-2" />หุ้นรายตัว</TabsTrigger>
          <TabsTrigger value="recommendations"><ListChecks className="h-4 w-4 mr-2" />คำแนะนำ</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลเชิงลึก</CardTitle>
              <CardDescription>การวิเคราะห์ภาพรวมโดย AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">สรุปผลการวิเคราะห์</h3>
                <p>{analysis.insights}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">การวิเคราะห์แนวโน้ม</h3>
                <p>{analysis.trendAnalysis}</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>ความสัมพันธ์ระหว่างความมั่นใจและความแม่นยำ</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {report.confidenceAnalysis.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={report.confidenceAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="confidenceRange" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => `${parseFloat(value.toString()).toFixed(1)}%`} />
                      <Legend />
                      <Bar dataKey="accuracy" name="ความแม่นยำ (%)" fill="#4f46e5" />
                      <Bar dataKey="predictions" name="จำนวนการทำนาย" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">ไม่มีข้อมูลเพียงพอ</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>ความแม่นยำในการทำนายทิศทาง</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {report.upDownAccuracy && 
                  (report.upDownAccuracy.upPredictions > 0 || 
                   report.upDownAccuracy.downPredictions > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'ทำนายขึ้นถูกต้อง', value: report.upDownAccuracy.correctUpPredictions },
                          { name: 'ทำนายขึ้นไม่ถูกต้อง', value: report.upDownAccuracy.upPredictions - report.upDownAccuracy.correctUpPredictions },
                          { name: 'ทำนายลงถูกต้อง', value: report.upDownAccuracy.correctDownPredictions },
                          { name: 'ทำนายลงไม่ถูกต้อง', value: report.upDownAccuracy.downPredictions - report.upDownAccuracy.correctDownPredictions },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {[
                          { name: 'ทำนายขึ้นถูกต้อง', color: '#10b981' },
                          { name: 'ทำนายขึ้นไม่ถูกต้อง', color: '#d1fae5' },
                          { name: 'ทำนายลงถูกต้อง', color: '#ef4444' },
                          { name: 'ทำนายลงไม่ถูกต้อง', color: '#fee2e2' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value.toString()} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">ไม่มีข้อมูลเพียงพอ</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>แนวโน้มความแม่นยำ</CardTitle>
              <CardDescription>ความแม่นยำในการวิเคราะห์หุ้นของ AI ตามช่วงเวลา</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {report.accuracyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={report.accuracyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${parseFloat(value.toString()).toFixed(1)}%`} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      name="ความแม่นยำ (%)"
                      stroke="#4f46e5" 
                      activeDot={{ r: 8 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="correctCount" 
                      name="จำนวนที่ถูกต้อง (จาก 10)"
                      stroke="#10b981" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">ไม่มีข้อมูลเพียงพอสำหรับแสดงแนวโน้ม</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>การวิเคราะห์แนวโน้ม</CardTitle>
              <CardDescription>ข้อมูลเชิงลึกเกี่ยวกับแนวโน้มความแม่นยำ</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{analysis.trendAnalysis}</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stocks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>หุ้นที่วิเคราะห์แม่นยำที่สุด</CardTitle>
                <CardDescription>หุ้นที่ AI วิเคราะห์ได้แม่นยำมากที่สุด</CardDescription>
              </CardHeader>
              <CardContent>
                {report.bestPredictedStocks.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>หุ้น</TableHead>
                        <TableHead>ความแม่นยำ</TableHead>
                        <TableHead>ถูกต้อง/ทั้งหมด</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.bestPredictedStocks.map((stock) => (
                        <TableRow key={stock.ticker}>
                          <TableCell className="font-medium">{stock.ticker}</TableCell>
                          <TableCell>{stock.accuracy.toFixed(1)}%</TableCell>
                          <TableCell>{stock.correctCount}/{stock.totalPredictions}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">ไม่มีข้อมูลเพียงพอ</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>หุ้นที่วิเคราะห์แม่นยำน้อยที่สุด</CardTitle>
                <CardDescription>หุ้นที่ AI วิเคราะห์ได้แม่นยำน้อยที่สุด</CardDescription>
              </CardHeader>
              <CardContent>
                {report.worstPredictedStocks.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>หุ้น</TableHead>
                        <TableHead>ความแม่นยำ</TableHead>
                        <TableHead>ถูกต้อง/ทั้งหมด</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.worstPredictedStocks.map((stock) => (
                        <TableRow key={stock.ticker}>
                          <TableCell className="font-medium">{stock.ticker}</TableCell>
                          <TableCell>{stock.accuracy.toFixed(1)}%</TableCell>
                          <TableCell>{stock.correctCount}/{stock.totalPredictions}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">ไม่มีข้อมูลเพียงพอ</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลเชิงลึกเกี่ยวกับหุ้นรายตัว</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{analysis.stockSpecificInsights}</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>คำแนะนำจาก AI</CardTitle>
              <CardDescription>คำแนะนำสำหรับการใช้งานระบบวิเคราะห์หุ้น</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="mt-0.5 bg-primary/10 p-1 rounded-full">
                      <HelpCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>คำแนะนำจากระบบ</CardTitle>
              <CardDescription>คำแนะนำจากการวิเคราะห์ข้อมูลโดยระบบ</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="mt-0.5 bg-primary/10 p-1 rounded-full">
                      <ListChecks className="h-4 w-4 text-primary" />
                    </div>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
