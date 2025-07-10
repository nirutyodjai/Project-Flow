'use client';

/**
 * หน้าสำหรับการวิเคราะห์ตลาดหุ้นและเศรษฐกิจ
 */
import { useState } from 'react';
import Link from 'next/link';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Button, Input, Label, Textarea,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Separator, Alert, AlertDescription,
  CheckboxItem, CheckboxIndicator
} from "@/components/ui";
import { Loader2, Search, LineChart, BookOpen, BarChart3, TrendingUp, RefreshCw, Trophy, Gamepad2 } from "lucide-react";
import PageHeader from "@/components/page-header";

export default function MarketAnalysisPage() {
  // สถานะสำหรับการวิเคราะห์หุ้นรายตัว
  const [stockInput, setStockInput] = useState('');
  const [stockResults, setStockResults] = useState<any>(null);
  const [isAnalyzingStock, setIsAnalyzingStock] = useState(false);
  const [stockError, setStockError] = useState('');

  // สถานะสำหรับการวิเคราะห์ตลาด
  const [marketInput, setMarketInput] = useState('');
  const [marketResults, setMarketResults] = useState<any>(null);
  const [isAnalyzingMarket, setIsAnalyzingMarket] = useState(false);
  const [includeSectorAnalysis, setIncludeSectorAnalysis] = useState(true);
  const [marketError, setMarketError] = useState('');

  // สถานะสำหรับการวิเคราะห์ข่าว
  const [newsInput, setNewsInput] = useState('');
  const [relatedStock, setRelatedStock] = useState('');
  const [newsResults, setNewsResults] = useState<any>(null);
  const [isAnalyzingNews, setIsAnalyzingNews] = useState(false);
  const [includeRelatedStocks, setIncludeRelatedStocks] = useState(false);
  const [newsError, setNewsError] = useState('');

  // สถานะสำหรับค้นหาการวิเคราะห์
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'stock' | 'market' | 'news'>('all');
  const [searchError, setSearchError] = useState('');

  // ฟังก์ชันวิเคราะห์หุ้นรายตัว
  const handleAnalyzeStock = async () => {
    if (!stockInput) {
      setStockError('กรุณากรอกชื่อย่อหุ้น');
      return;
    }

    try {
      setIsAnalyzingStock(true);
      setStockError('');
      
      const response = await fetch('/api/market/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: stockInput,
          includeNews: true,
          includeTechnical: true,
          timeframe: 'medium'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze stock');
      }

      const data = await response.json();
      setStockResults(data);
    } catch (error) {
      console.error('Error analyzing stock:', error);
      setStockError('เกิดข้อผิดพลาดในการวิเคราะห์หุ้น');
    } finally {
      setIsAnalyzingStock(false);
    }
  };

  // ฟังก์ชันวิเคราะห์ตลาด
  const handleAnalyzeMarket = async () => {
    if (!marketInput) {
      setMarketError('กรุณากรอกชื่อตลาดหลักทรัพย์');
      return;
    }

    try {
      setIsAnalyzingMarket(true);
      setMarketError('');
      
      const response = await fetch('/api/market/index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          market: marketInput,
          includeEconomicData: false,
          includeSectorAnalysis
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze market');
      }

      const data = await response.json();
      setMarketResults(data);
    } catch (error) {
      console.error('Error analyzing market:', error);
      setMarketError('เกิดข้อผิดพลาดในการวิเคราะห์ตลาด');
    } finally {
      setIsAnalyzingMarket(false);
    }
  };

  // ฟังก์ชันวิเคราะห์ข่าว
  const handleAnalyzeNews = async () => {
    if (!newsInput || newsInput.length < 10) {
      setNewsError('กรุณากรอกข่าวให้มีความยาวอย่างน้อย 10 ตัวอักษร');
      return;
    }

    try {
      setIsAnalyzingNews(true);
      setNewsError('');
      
      const response = await fetch('/api/market/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          news: newsInput,
          symbol: relatedStock || undefined,
          markets: ['SET'], // ตัวอย่างตลาดที่เกี่ยวข้อง
          includeRelatedStocks
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze news');
      }

      const data = await response.json();
      setNewsResults(data);
    } catch (error) {
      console.error('Error analyzing news:', error);
      setNewsError('เกิดข้อผิดพลาดในการวิเคราะห์ข่าว');
    } finally {
      setIsAnalyzingNews(false);
    }
  };

  // ฟังก์ชันค้นหาการวิเคราะห์
  const handleSearch = async () => {
    if (!searchQuery) {
      setSearchError('กรุณากรอกคำค้นหา');
      return;
    }

    try {
      setIsSearching(true);
      setSearchError('');
      
      const response = await fetch(`/api/market/search?query=${encodeURIComponent(searchQuery)}&type=${searchType !== 'all' ? searchType : ''}&limit=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to search analyses');
      }

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error searching analyses:', error);
      setSearchError('เกิดข้อผิดพลาดในการค้นหา');
    } finally {
      setIsSearching(false);
    }
  };

  // ฟังก์ชันแสดงผลการวิเคราะห์หุ้น
  const renderStockAnalysisResults = () => {
    if (!stockResults) return null;
    
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>ผลการวิเคราะห์: {stockResults.symbol}</CardTitle>
          <CardDescription>{stockResults.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-lg font-medium">ข้อมูลราคา</h3>
              <p>ราคาปัจจุบัน: {stockResults.currentPrice.toFixed(2)} บาท</p>
              <p>ราคาเป้าหมาย: {stockResults.targetPrice.toFixed(2)} บาท</p>
              <p>ผลตอบแทนที่คาดหวัง: {stockResults.potentialReturn.toFixed(2)}%</p>
              <p className="mt-2 font-bold">คำแนะนำ: {stockResults.recommendation}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium">ความเสี่ยงและระยะเวลา</h3>
              <p>ระดับความเสี่ยง: {stockResults.riskLevel}</p>
              <p>กรอบเวลาการลงทุนที่เหมาะสม: {stockResults.timeHorizon}</p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="mb-4">
            <h3 className="text-lg font-medium">การวิเคราะห์ปัจจัยพื้นฐาน</h3>
            <p>{stockResults.fundamentalAnalysis}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium">การวิเคราะห์ทางเทคนิค</h3>
            <p>{stockResults.technicalAnalysis}</p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium">ปัจจัยบวก</h3>
              <ul className="list-disc pl-5">
                {stockResults.catalysts.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium">ความเสี่ยง</h3>
              <ul className="list-disc pl-5">
                {stockResults.risks.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">วิเคราะห์โดย ProjectFlow AI</p>
        </CardFooter>
      </Card>
    );
  };

  // ฟังก์ชันแสดงผลการวิเคราะห์ตลาด
  const renderMarketAnalysisResults = () => {
    if (!marketResults) return null;
    
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>ผลการวิเคราะห์ตลาด: {marketInput}</CardTitle>
          <CardDescription>
            แนวโน้ม: {marketResults.marketSentiment} 
            (ความแข็งแกร่งของเทรนด์: {marketResults.trendStrength}/10)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-medium">ภาพรวมตลาด</h3>
            <p>{marketResults.marketSummary}</p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-lg font-medium">แนวโน้มระยะสั้น</h3>
              <p>{marketResults.shortTermOutlook}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium">แนวโน้มระยะกลาง</h3>
              <p>{marketResults.mediumTermOutlook}</p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="mb-4">
            <h3 className="text-lg font-medium">ตัวชี้วัดสำคัญ</h3>
            <div className="space-y-2">
              {marketResults.keyIndicators.map((indicator: any, index: number) => (
                <div key={index} className="border p-3 rounded-md">
                  <p className="font-medium">{indicator.name}: {indicator.value.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{indicator.interpretation}</p>
                </div>
              ))}
            </div>
          </div>
          
          {marketResults.sectorOutlook && marketResults.sectorOutlook.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="text-lg font-medium">แนวโน้มรายกลุ่มธุรกิจ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {marketResults.sectorOutlook.map((sector: any, index: number) => (
                    <div 
                      key={index} 
                      className={`border p-3 rounded-md ${
                        sector.outlook === 'Positive' ? 'border-green-300' : 
                        sector.outlook === 'Negative' ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <p className="font-medium">{sector.sector}</p>
                      <p className={`text-sm ${
                        sector.outlook === 'Positive' ? 'text-green-600' : 
                        sector.outlook === 'Negative' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        แนวโน้ม: {sector.outlook}
                      </p>
                      <p className="text-sm text-gray-600">{sector.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">วิเคราะห์โดย ProjectFlow AI</p>
        </CardFooter>
      </Card>
    );
  };

  // ฟังก์ชันแสดงผลการวิเคราะห์ข่าว
  const renderNewsAnalysisResults = () => {
    if (!newsResults) return null;
    
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>ผลการวิเคราะห์ข่าว</CardTitle>
          <CardDescription>
            ความรู้สึก: {newsResults.sentiment} 
            (ระดับผลกระทบ: {newsResults.impactLevel}/10)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-medium">สรุปข่าว</h3>
            <p>{newsResults.summary}</p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="mb-4">
            <h3 className="text-lg font-medium">คำแนะนำสำหรับนักลงทุน</h3>
            <p>{newsResults.recommendation}</p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="mb-4">
            <h3 className="text-lg font-medium">แนวคิดการลงทุน</h3>
            <ul className="list-disc pl-5">
              {newsResults.tradingIdeas.map((idea: string, index: number) => (
                <li key={index}>{idea}</li>
              ))}
            </ul>
          </div>
          
          {newsResults.stocksAffected && newsResults.stocksAffected.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="text-lg font-medium">หุ้นที่ได้รับผลกระทบ</h3>
                <div className="space-y-2 mt-2">
                  {newsResults.stocksAffected.map((stock: any, index: number) => (
                    <div 
                      key={index} 
                      className={`border p-3 rounded-md ${
                        stock.impact === 'positive' ? 'border-green-300' : 
                        stock.impact === 'negative' ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <p className="font-medium">{stock.symbol}</p>
                      <p className={`text-sm ${
                        stock.impact === 'positive' ? 'text-green-600' : 
                        stock.impact === 'negative' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        ผลกระทบ: {stock.impact}
                      </p>
                      <p className="text-sm text-gray-600">{stock.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {newsResults.marketImpact && newsResults.marketImpact.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="text-lg font-medium">ผลกระทบต่อตลาด</h3>
                <div className="space-y-2 mt-2">
                  {newsResults.marketImpact.map((market: any, index: number) => (
                    <div 
                      key={index} 
                      className={`border p-3 rounded-md ${
                        market.impact === 'positive' ? 'border-green-300' : 
                        market.impact === 'negative' ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <p className="font-medium">{market.market}</p>
                      <p className={`text-sm ${
                        market.impact === 'positive' ? 'text-green-600' : 
                        market.impact === 'negative' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        ผลกระทบ: {market.impact}
                      </p>
                      <p className="text-sm text-gray-600">{market.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {newsResults.keywords && newsResults.keywords.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="text-lg font-medium">คำสำคัญ</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newsResults.keywords.map((keyword: string, index: number) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">วิเคราะห์โดย ProjectFlow AI • {new Date(newsResults.analysisDate).toLocaleString()}</p>
        </CardFooter>
      </Card>
    );
  };

  // ฟังก์ชันแสดงผลการค้นหา
  const renderSearchResults = () => {
    if (searchResults.length === 0) {
      return (
        <div className="mt-4 p-4 border rounded-md text-center">
          <p className="text-gray-500">ไม่พบผลการวิเคราะห์ที่ตรงกับคำค้นหา</p>
        </div>
      );
    }
    
    return (
      <div className="mt-4 space-y-4">
        {searchResults.map((result, index) => (
          <Card key={index}>
            <CardHeader className="py-3">
              <CardTitle className="text-base flex items-center">
                {result.type === 'stock' && <LineChart className="h-4 w-4 mr-2" />}
                {result.type === 'market' && <BarChart3 className="h-4 w-4 mr-2" />}
                {result.type === 'news' && <BookOpen className="h-4 w-4 mr-2" />}
                {result.type === 'stock' ? `การวิเคราะห์หุ้น: ${result.data.symbol}` : 
                 result.type === 'market' ? `การวิเคราะห์ตลาด: ${result.data.market || ''}` : 
                 'การวิเคราะห์ข่าว'}
              </CardTitle>
              <CardDescription className="text-xs">
                {new Date(result.analysisTimestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-2">
              {result.type === 'stock' && (
                <div>
                  <p className="text-sm">ราคาปัจจุบัน: {result.data.currentPrice?.toFixed(2)} • เป้าหมาย: {result.data.targetPrice?.toFixed(2)}</p>
                  <p className="text-sm font-medium mt-1">คำแนะนำ: {result.data.recommendation}</p>
                </div>
              )}
              
              {result.type === 'market' && (
                <div>
                  <p className="text-sm">แนวโน้ม: {result.data.marketSentiment} (ความแข็งแกร่ง: {result.data.trendStrength}/10)</p>
                  <p className="text-sm line-clamp-2 mt-1">{result.data.marketSummary}</p>
                </div>
              )}
              
              {result.type === 'news' && (
                <div>
                  <p className="text-sm">ความรู้สึก: {result.data.sentiment} (ผลกระทบ: {result.data.impactLevel}/10)</p>
                  <p className="text-sm line-clamp-2 mt-1">{result.data.summary}</p>
                </div>
              )}
              
              {result.keywords && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {result.keywords.slice(0, 5).map((keyword: string, idx: number) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                  {result.keywords.length > 5 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">
                      +{result.keywords.length - 5}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <PageHeader
          title="วิเคราะห์ตลาดหุ้น"
          subtitle="AI วิเคราะห์หุ้น ตลาด และข่าวการเงินเพื่อช่วยการตัดสินใจลงทุน"
        />
        
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline" asChild>
            <Link href="/market/challenge">
              <Trophy className="mr-2 h-4 w-4" />
              การแข่งขันวิเคราะห์หุ้น
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/trading-game">
              <Gamepad2 className="mr-2 h-4 w-4" />
              เกมวิเคราะห์หุ้น
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock"><LineChart className="h-4 w-4 mr-2" />หุ้นรายตัว</TabsTrigger>
          <TabsTrigger value="market"><BarChart3 className="h-4 w-4 mr-2" />ตลาดหุ้น</TabsTrigger>
          <TabsTrigger value="news"><BookOpen className="h-4 w-4 mr-2" />ข่าวการเงิน</TabsTrigger>
          <TabsTrigger value="search"><Search className="h-4 w-4 mr-2" />ค้นหาการวิเคราะห์</TabsTrigger>
        </TabsList>

        {/* แท็บวิเคราะห์หุ้น */}
        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <CardTitle>วิเคราะห์หุ้นรายตัว</CardTitle>
              <CardDescription>ป้อนชื่อย่อหุ้น (Ticker symbol) เพื่อวิเคราะห์</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stock-symbol">ชื่อย่อหุ้น</Label>
                  <Input
                    id="stock-symbol"
                    placeholder="เช่น ADVANC, PTT, SCB"
                    value={stockInput}
                    onChange={(e) => setStockInput(e.target.value)}
                  />
                </div>
                
                {stockError && (
                  <Alert variant="destructive">
                    <AlertDescription>{stockError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAnalyzeStock} disabled={isAnalyzingStock}>
                {isAnalyzingStock ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังวิเคราะห์...
                  </>
                ) : (
                  <>
                    <LineChart className="mr-2 h-4 w-4" />
                    วิเคราะห์หุ้น
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {renderStockAnalysisResults()}
        </TabsContent>

        {/* แท็บวิเคราะห์ตลาด */}
        <TabsContent value="market">
          <Card>
            <CardHeader>
              <CardTitle>วิเคราะห์ตลาดหลักทรัพย์</CardTitle>
              <CardDescription>ป้อนชื่อตลาดหลักทรัพย์เพื่อวิเคราะห์แนวโน้ม</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="market-name">ชื่อตลาดหลักทรัพย์</Label>
                  <Input
                    id="market-name"
                    placeholder="เช่น SET, NASDAQ, S&P500"
                    value={marketInput}
                    onChange={(e) => setMarketInput(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-sector"
                    checked={includeSectorAnalysis}
                    onChange={(e) => setIncludeSectorAnalysis(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="include-sector">รวมการวิเคราะห์รายกลุ่มธุรกิจ</Label>
                </div>
                
                {marketError && (
                  <Alert variant="destructive">
                    <AlertDescription>{marketError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAnalyzeMarket} disabled={isAnalyzingMarket}>
                {isAnalyzingMarket ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังวิเคราะห์...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    วิเคราะห์ตลาด
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {renderMarketAnalysisResults()}
        </TabsContent>

        {/* แท็บวิเคราะห์ข่าว */}
        <TabsContent value="news">
          <Card>
            <CardHeader>
              <CardTitle>วิเคราะห์ข่าวการเงินและเศรษฐกิจ</CardTitle>
              <CardDescription>ป้อนข่าวเพื่อวิเคราะห์ผลกระทบต่อหุ้นหรือตลาด</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="news-content">เนื้อหาข่าว</Label>
                  <Textarea
                    id="news-content"
                    placeholder="วางหรือพิมพ์ข่าวที่ต้องการวิเคราะห์ที่นี่"
                    rows={5}
                    value={newsInput}
                    onChange={(e) => setNewsInput(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="related-stock">หุ้นที่เกี่ยวข้อง (ถ้ามี)</Label>
                  <Input
                    id="related-stock"
                    placeholder="เช่น PTT, ADVANC"
                    value={relatedStock}
                    onChange={(e) => setRelatedStock(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-related-stocks"
                    checked={includeRelatedStocks}
                    onChange={(e) => setIncludeRelatedStocks(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="include-related-stocks">วิเคราะห์หุ้นที่เกี่ยวข้องด้วย</Label>
                </div>
                
                {newsError && (
                  <Alert variant="destructive">
                    <AlertDescription>{newsError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAnalyzeNews} disabled={isAnalyzingNews}>
                {isAnalyzingNews ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังวิเคราะห์...
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-4 w-4" />
                    วิเคราะห์ข่าว
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {renderNewsAnalysisResults()}
        </TabsContent>

        {/* แท็บค้นหาการวิเคราะห์ */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>ค้นหาการวิเคราะห์</CardTitle>
              <CardDescription>ค้นหาการวิเคราะห์ที่เคยทำไว้แล้วจากคีย์เวิร์ด</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <div className="flex-grow">
                    <Input
                      placeholder="พิมพ์คีย์เวิร์ดที่ต้องการค้นหา"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="ทุกประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกประเภท</SelectItem>
                      <SelectItem value="stock">หุ้นรายตัว</SelectItem>
                      <SelectItem value="market">ตลาด</SelectItem>
                      <SelectItem value="news">ข่าว</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {searchError && (
                  <Alert variant="destructive">
                    <AlertDescription>{searchError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSearch} disabled={isSearching} className="mr-2">
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังค้นหา...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    ค้นหา
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setSearchError('');
                }}
                disabled={isSearching || searchResults.length === 0}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                ล้าง
              </Button>
            </CardFooter>
          </Card>
          
          {renderSearchResults()}
        </TabsContent>
      </Tabs>
      
      {/* เพิ่มส่วนบริการตลาดหุ้นอื่นๆ */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">บริการวิเคราะห์ตลาดหุ้นเพิ่มเติม</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" /> แนวโน้มตลาดหุ้น
              </CardTitle>
              <CardDescription>
                วิเคราะห์แนวโน้มตลาดหุ้นรายวัน รายสัปดาห์ รายเดือน และรายไตรมาส
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>ดูการวิเคราะห์แนวโน้มตลาดโดยละเอียด พร้อมคำแนะนำและปัจจัยเสี่ยง</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/market/trends">ไปที่หน้าแนวโน้มตลาด</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5" /> การแข่งขันวิเคราะห์หุ้น
              </CardTitle>
              <CardDescription>
                ดูผลการแข่งขันวิเคราะห์หุ้นของ AI และสถิติย้อนหลัง
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>ตรวจสอบผลการแข่งขันวิเคราะห์หุ้น 10 ตัวต่อวันและความแม่นยำของ AI</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/market/challenge">ไปที่หน้าการแข่งขัน</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gamepad2 className="mr-2 h-5 w-5" /> เกมวิเคราะห์หุ้น
              </CardTitle>
              <CardDescription>
                ทดลองลงทุนในหุ้นจำลองและวัดผลการลงทุนของคุณ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>ฝึกทักษะการลงทุนในตลาดจำลองและเปรียบเทียบกับการวิเคราะห์ของ AI</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/trading-game">ไปที่เกมวิเคราะห์หุ้น</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
