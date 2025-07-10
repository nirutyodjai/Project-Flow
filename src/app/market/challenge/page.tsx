'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter,
  Button, Input, Label, Checkbox,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
  Alert, AlertTitle, AlertDescription,
  Badge
} from "@/components/ui";
import {
  Trophy, Medal, Calendar, Timer, TrendingUp, TrendingDown,
  CheckCircle, XCircle, BarChart3, Loader2, RefreshCcw, Plus
} from "lucide-react";
import PageHeader from "@/components/page-header";

// ประเภทข้อมูลสำหรับการแข่งขัน
interface StockPrediction {
  ticker: string;
  predictionDate: string;
  prediction: 'up' | 'down';
  confidence: number;
  initialPrice: number;
  reasoning: string;
}

interface PredictionResult {
  ticker: string;
  predictionDate: string;
  verificationDate: string;
  prediction: 'up' | 'down';
  actualResult: 'up' | 'down' | null;
  isCorrect: boolean | null;
  initialPrice: number;
  finalPrice: number | null;
  priceChange: number | null;
}

interface DailyChallenge {
  challengeDate: string;
  verificationDate: string | null;
  predictions: StockPrediction[];
  results: PredictionResult[] | null;
  correctCount: number | null;
  aiWin: boolean | null;
  challengeStatus: 'pending' | 'verified';
}

export default function StockChallengePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('latest');
  
  // สถานะสำหรับการแข่งขันล่าสุด
  const [latestChallenge, setLatestChallenge] = useState<DailyChallenge | null>(null);
  const [challengeHistory, setChallengeHistory] = useState<DailyChallenge[]>([]);
  const [aiScore, setAiScore] = useState(0);
  
  // สถานะสำหรับการสร้างการแข่งขันใหม่
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [customTicker, setCustomTicker] = useState('');
  const [popularStocks, setPopularStocks] = useState([
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META',
    'TSLA', 'NVDA', 'JPM', 'V', 'WMT',
    'DIS', 'NFLX', 'PYPL', 'INTC', 'AMD',
  ]);
  
  // สถานะโหลดข้อมูล
  const [isLoading, setIsLoading] = useState(false);
  const [isStartingChallenge, setIsStartingChallenge] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  // โหลดข้อมูลเมื่อเริ่มต้น
  useEffect(() => {
    fetchLatestData();
  }, []);

  // โหลดข้อมูลการแข่งขันล่าสุดและคะแนน AI
  const fetchLatestData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const res = await fetch(`/api/market/challenge?latest=true&score=true`);
      if (!res.ok) {
        throw new Error('ไม่สามารถโหลดข้อมูลได้');
      }
      
      const data = await res.json();
      setLatestChallenge(data.latestChallenge);
      setAiScore(data.aiScore || 0);
      
      // ดึงประวัติการแข่งขัน
      await fetchHistory();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      console.error('Error fetching challenge data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // โหลดประวัติการแข่งขัน
  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/market/challenge?limit=10`);
      if (!res.ok) {
        throw new Error('ไม่สามารถโหลดประวัติการแข่งขันได้');
      }
      
      const data = await res.json();
      setChallengeHistory(data.history || []);
    } catch (err: any) {
      console.error('Error fetching challenge history:', err);
    }
  };

  // เริ่มการแข่งขันใหม่
  const startNewChallenge = async () => {
    if (selectedStocks.length !== 10) {
      setError('กรุณาเลือกหุ้น 10 ตัวสำหรับการแข่งขัน');
      return;
    }
    
    try {
      setIsStartingChallenge(true);
      setError('');
      
      const res = await fetch('/api/market/challenge/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tickers: selectedStocks }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'ไม่สามารถเริ่มการแข่งขันได้');
      }
      
      const data = await res.json();
      
      // รีเฟรชข้อมูล
      await fetchLatestData();
      
      // รีเซ็ตการเลือกหุ้น
      setSelectedStocks([]);
      
      // เปลี่ยนไปแท็บล่าสุด
      setActiveTab('latest');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเริ่มการแข่งขัน');
      console.error('Error starting challenge:', err);
    } finally {
      setIsStartingChallenge(false);
    }
  };

  // ตรวจสอบผลการแข่งขันเมื่อวาน
  const verifyYesterdayChallenge = async () => {
    try {
      setIsVerifying(true);
      setError('');
      
      const res = await fetch('/api/market/challenge/verify', {
        method: 'PUT',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'ไม่สามารถตรวจสอบผลการแข่งขันได้');
      }
      
      await fetchLatestData();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการตรวจสอบผลการแข่งขัน');
      console.error('Error verifying challenge:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  // เพิ่มหุ้นที่เลือกเอง
  const addCustomStock = () => {
    if (!customTicker) return;
    
    const ticker = customTicker.toUpperCase().trim();
    if (selectedStocks.includes(ticker)) {
      setError('หุ้นนี้ถูกเลือกไว้แล้ว');
      return;
    }
    
    if (selectedStocks.length >= 10) {
      setError('เลือกได้สูงสุด 10 ตัว');
      return;
    }
    
    setSelectedStocks([...selectedStocks, ticker]);
    setCustomTicker('');
    setError('');
  };

  // ตัวช่วยฟอร์แมตวันที่
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'd MMMM yyyy', { locale: th });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader 
        title="การแข่งขันวิเคราะห์หุ้นของ AI" 
        subtitle="AI วิเคราะห์หุ้น 10 ตัวต่อวัน และตรวจสอบความถูกต้องในวันถัดไป"
      />

      {error && (
        <Alert variant="destructive">
          <AlertTitle>ข้อผิดพลาด</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 text-amber-800 p-3 rounded-lg">
            <Trophy size={24} />
          </div>
          <div>
            <h3 className="text-lg font-medium">คะแนน AI</h3>
            <p className="text-2xl font-bold">{aiScore} ครั้ง</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={fetchLatestData} 
            disabled={isLoading}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            รีเฟรชข้อมูล
          </Button>
          
          <Button 
            onClick={verifyYesterdayChallenge} 
            disabled={isVerifying}
          >
            {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            ตรวจสอบผลเมื่อวาน
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="latest">การแข่งขันล่าสุด</TabsTrigger>
          <TabsTrigger value="history">ประวัติการแข่งขัน</TabsTrigger>
          <TabsTrigger value="new">เริ่มการแข่งขันใหม่</TabsTrigger>
        </TabsList>
        
        <TabsContent value="latest" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !latestChallenge ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>ยังไม่มีการแข่งขัน กรุณาเริ่มการแข่งขันใหม่</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>การแข่งขันวันที่ {formatDate(latestChallenge.challengeDate)}</CardTitle>
                      <CardDescription>
                        สถานะ: {latestChallenge.challengeStatus === 'pending' ? 'รอการตรวจสอบ' : 'ตรวจสอบแล้ว'}
                      </CardDescription>
                    </div>
                    
                    {latestChallenge.challengeStatus === 'verified' && latestChallenge.aiWin !== null && (
                      <Badge className={latestChallenge.aiWin ? 'bg-green-600' : 'bg-red-600'}>
                        {latestChallenge.aiWin ? 'AI ชนะ' : 'AI แพ้'}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  {latestChallenge.challengeStatus === 'verified' && latestChallenge.correctCount !== null && (
                    <div className="mb-4">
                      <p className="text-lg font-medium mb-1">ผลการแข่งขัน:</p>
                      <div className="flex items-center gap-2">
                        <p>AI ทายถูก {latestChallenge.correctCount} ใน 10</p>
                        <Badge variant="outline">
                          {((latestChallenge.correctCount / 10) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">การวิเคราะห์</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>หุ้น</TableHead>
                          <TableHead>การคาดการณ์</TableHead>
                          <TableHead>ความมั่นใจ</TableHead>
                          <TableHead>ราคาเริ่มต้น</TableHead>
                          {latestChallenge.challengeStatus === 'verified' && (
                            <>
                              <TableHead>ราคาสุดท้าย</TableHead>
                              <TableHead>การเปลี่ยนแปลง</TableHead>
                              <TableHead>ผลลัพธ์</TableHead>
                            </>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {latestChallenge.predictions.map((pred, index) => {
                          const result = latestChallenge.results?.[index];
                          return (
                            <TableRow key={pred.ticker}>
                              <TableCell className="font-medium">{pred.ticker}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  {pred.prediction === 'up' ? (
                                    <TrendingUp className="text-green-500 mr-1 h-4 w-4" />
                                  ) : (
                                    <TrendingDown className="text-red-500 mr-1 h-4 w-4" />
                                  )}
                                  {pred.prediction === 'up' ? 'ขึ้น' : 'ลง'}
                                </div>
                              </TableCell>
                              <TableCell>{pred.confidence}%</TableCell>
                              <TableCell>${pred.initialPrice.toFixed(2)}</TableCell>
                              
                              {latestChallenge.challengeStatus === 'verified' && result && (
                                <>
                                  <TableCell>${result.finalPrice?.toFixed(2) || '-'}</TableCell>
                                  <TableCell className={result.priceChange && result.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {result.priceChange !== null ? `${result.priceChange > 0 ? '+' : ''}${result.priceChange}%` : '-'}
                                  </TableCell>
                                  <TableCell>
                                    {result.isCorrect !== null && (
                                      result.isCorrect ? (
                                        <CheckCircle className="text-green-500 h-5 w-5" />
                                      ) : (
                                        <XCircle className="text-red-500 h-5 w-5" />
                                      )
                                    )}
                                  </TableCell>
                                </>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              
              {latestChallenge.predictions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>เหตุผลในการวิเคราะห์</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {latestChallenge.predictions.map((pred) => (
                        <div key={`${pred.ticker}-reasoning`} className="border-b pb-3 last:border-0">
                          <h4 className="font-semibold flex items-center">
                            {pred.ticker}
                            {pred.prediction === 'up' ? (
                              <TrendingUp className="text-green-500 ml-2 h-4 w-4" />
                            ) : (
                              <TrendingDown className="text-red-500 ml-2 h-4 w-4" />
                            )}
                          </h4>
                          <p className="text-muted-foreground">{pred.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          {challengeHistory.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>ยังไม่มีประวัติการแข่งขัน</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>ประวัติการแข่งขัน</CardTitle>
                <CardDescription>ผลการแข่งขันวิเคราะห์หุ้นของ AI</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>วันที่</TableHead>
                      <TableHead>ผลการวิเคราะห์</TableHead>
                      <TableHead>ความถูกต้อง</TableHead>
                      <TableHead>ผลลัพธ์</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {challengeHistory.map((challenge) => (
                      <TableRow key={challenge.challengeDate}>
                        <TableCell>{formatDate(challenge.challengeDate)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {challenge.predictions.map((pred) => (
                              <span key={`${challenge.challengeDate}-${pred.ticker}`} 
                                title={pred.ticker}
                                className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full
                                  ${pred.prediction === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                              >
                                {pred.ticker.substring(0, 1)}
                              </span>
                            )).slice(0, 5)}
                            {challenge.predictions.length > 5 && (
                              <span className="inline-flex items-center justify-center w-6 h-6 text-xs bg-gray-100 rounded-full">
                                +{challenge.predictions.length - 5}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {challenge.challengeStatus === 'verified' && challenge.correctCount !== null ? (
                            <span>{challenge.correctCount}/10</span>
                          ) : (
                            <span className="text-muted-foreground">รอตรวจสอบ</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {challenge.challengeStatus === 'verified' && challenge.aiWin !== null ? (
                            challenge.aiWin ? (
                              <Badge className="bg-green-600">ชนะ</Badge>
                            ) : (
                              <Badge className="bg-red-600">แพ้</Badge>
                            )
                          ) : (
                            <Badge variant="outline">รอผล</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>เริ่มการแข่งขันใหม่</CardTitle>
              <CardDescription>
                เลือกหุ้น 10 ตัวที่ต้องการให้ AI วิเคราะห์สำหรับวันนี้
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>เพิ่มหุ้นเอง</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="ป้อนสัญลักษณ์หุ้น เช่น AAPL"
                      value={customTicker}
                      onChange={(e) => setCustomTicker(e.target.value)}
                    />
                    <Button onClick={addCustomStock} variant="outline" disabled={!customTicker}>
                      <Plus className="mr-1 h-4 w-4" />
                      เพิ่ม
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label>หุ้นยอดนิยม</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
                    {popularStocks.map((ticker) => {
                      const isSelected = selectedStocks.includes(ticker);
                      const isDisabled = selectedStocks.length >= 10 && !isSelected;
                      
                      return (
                        <Button 
                          key={ticker} 
                          variant={isSelected ? "default" : "outline"} 
                          className="h-auto py-1"
                          disabled={isDisabled}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedStocks(selectedStocks.filter(t => t !== ticker));
                            } else {
                              setSelectedStocks([...selectedStocks, ticker]);
                            }
                          }}
                        >
                          {ticker}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">หุ้นที่เลือก ({selectedStocks.length}/10):</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedStocks.length === 0 ? (
                      <p className="text-muted-foreground">ยังไม่ได้เลือกหุ้น</p>
                    ) : (
                      selectedStocks.map((ticker) => (
                        <Badge key={ticker} variant="secondary" className="flex gap-1 items-center">
                          {ticker}
                          <button 
                            className="hover:bg-slate-300/20 rounded-full p-1"
                            onClick={() => setSelectedStocks(selectedStocks.filter(t => t !== ticker))}
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setSelectedStocks([])}
              >
                รีเซ็ต
              </Button>
              <Button
                onClick={startNewChallenge}
                disabled={selectedStocks.length !== 10 || isStartingChallenge}
              >
                {isStartingChallenge ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                เริ่มการแข่งขัน
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
