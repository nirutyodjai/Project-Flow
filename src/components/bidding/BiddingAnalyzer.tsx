/**
 * Bidding Analyzer Component
 * วิเคราะห์และแนะนำราคาเสนอด้วย AI
 */

'use client';

import { useState } from 'react';
import { BiddingAIService } from '@/services/bidding-ai-service';
import type { BiddingProject, BiddingAnalysis, BiddingStrategy } from '@/types/bidding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Target,
  Lightbulb,
  Loader2
} from 'lucide-react';

export function BiddingAnalyzer() {
  const [project, setProject] = useState<Partial<BiddingProject>>({
    name: '',
    category: 'construction',
    budget: 0,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    requirements: [],
    competitorCount: 5,
  });

  const [analysis, setAnalysis] = useState<BiddingAnalysis | null>(null);
  const [strategies, setStrategies] = useState<BiddingStrategy[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!project.name || !project.budget) {
      alert('กรุณากรอกชื่อโครงการและงบประมาณ');
      return;
    }

    setLoading(true);
    try {
      const fullProject: BiddingProject = {
        id: 'temp-' + Date.now(),
        name: project.name,
        category: project.category || 'construction',
        budget: project.budget,
        deadline: project.deadline || new Date(),
        requirements: project.requirements || [],
        competitorCount: project.competitorCount,
      };

      // Mock history data
      const history: any[] = [];

      const result = await BiddingAIService.analyzeBidding(fullProject, history);
      setAnalysis(result);

      const strats = BiddingAIService.generateStrategies(result);
      setStrategies(strats);
    } catch (error) {
      console.error('Error analyzing bidding:', error);
      alert('เกิดข้อผิดพลาดในการวิเคราะห์');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'very-high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      case 'very-high': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Smart Bidding AI</h2>
        <p className="text-muted-foreground">
          วิเคราะห์และแนะนำราคาเสนอด้วย AI อัจฉริยะ
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลโครงการ</CardTitle>
          <CardDescription>กรอกข้อมูลโครงการเพื่อวิเคราะห์</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="projectName">ชื่อโครงการ *</Label>
              <Input
                id="projectName"
                value={project.name}
                onChange={(e) => setProject({ ...project, name: e.target.value })}
                placeholder="โครงการก่อสร้างอาคาร..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">งบประมาณ (บาท) *</Label>
              <Input
                id="budget"
                type="number"
                value={project.budget || ''}
                onChange={(e) => setProject({ ...project, budget: parseFloat(e.target.value) || 0 })}
                placeholder="50000000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">หมวดหมู่</Label>
              <select
                id="category"
                value={project.category}
                onChange={(e) => setProject({ ...project, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="construction">ก่อสร้าง</option>
                <option value="electrical">ไฟฟ้า</option>
                <option value="plumbing">ประปา</option>
                <option value="renovation">ปรับปรุง</option>
                <option value="maintenance">บำรุงรักษา</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="competitors">จำนวนคู่แข่ง</Label>
              <Input
                id="competitors"
                type="number"
                value={project.competitorCount || ''}
                onChange={(e) => setProject({ ...project, competitorCount: parseInt(e.target.value) || 0 })}
                placeholder="5"
              />
            </div>
          </div>

          <Button onClick={handleAnalyze} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังวิเคราะห์...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                วิเคราะห์ราคาเสนอ
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">ราคาแนะนำ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {analysis.recommendedBid.toLocaleString()} ฿
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ช่วง: {analysis.minBid.toLocaleString()} - {analysis.maxBid.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">โอกาสชนะ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {analysis.winProbability.toFixed(0)}%
                </div>
                <Progress value={analysis.winProbability} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  ความมั่นใจ: {analysis.confidenceLevel}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">กำไรคาดการณ์</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {analysis.profitMargin.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analysis.estimatedProfit.toLocaleString()} ฿
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>ประเมินความเสี่ยง</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Badge variant={getRiskBadge(analysis.riskLevel) as any}>
                  {analysis.riskLevel.toUpperCase()}
                </Badge>
                <span className={`font-medium ${getRiskColor(analysis.riskLevel)}`}>
                  ระดับความเสี่ยง: {analysis.riskLevel}
                </span>
              </div>
              {analysis.riskFactors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">ปัจจัยเสี่ยง:</p>
                  <ul className="text-sm space-y-1">
                    {analysis.riskFactors.map((factor, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Strategies */}
          <Card>
            <CardHeader>
              <CardTitle>กลยุทธ์การเสนอราคา</CardTitle>
              <CardDescription>เลือกกลยุทธ์ที่เหมาะสมกับสถานการณ์</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="moderate" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="aggressive">Aggressive</TabsTrigger>
                  <TabsTrigger value="moderate">Moderate</TabsTrigger>
                  <TabsTrigger value="conservative">Conservative</TabsTrigger>
                </TabsList>

                {strategies.map((strategy) => (
                  <TabsContent key={strategy.strategy} value={strategy.strategy} className="space-y-4">
                    <Alert>
                      <Lightbulb className="h-4 w-4" />
                      <AlertTitle>{strategy.description}</AlertTitle>
                      <AlertDescription>
                        <div className="mt-2 space-y-2">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">ราคาเสนอ</p>
                              <p className="font-bold">{strategy.recommendedBid.toLocaleString()} ฿</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">โอกาสชนะ</p>
                              <p className="font-bold text-green-600">{strategy.winProbability.toFixed(0)}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">กำไร</p>
                              <p className="font-bold text-blue-600">{strategy.profitMargin.toFixed(1)}%</p>
                            </div>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          ข้อดี
                        </h4>
                        <ul className="text-sm space-y-1">
                          {strategy.pros.map((pro, index) => (
                            <li key={index} className="text-muted-foreground">• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          ข้อควรระวัง
                        </h4>
                        <ul className="text-sm space-y-1">
                          {strategy.cons.map((con, index) => (
                            <li key={index} className="text-muted-foreground">• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>คำแนะนำ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.recommendations.map((rec, index) => (
                  <Alert key={index}>
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle className="text-sm">{rec.message}</AlertTitle>
                    {rec.action && (
                      <AlertDescription className="text-xs">
                        แนวทาง: {rec.action}
                      </AlertDescription>
                    )}
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI Reasoning */}
          <Card>
            <CardHeader>
              <CardTitle>เหตุผลจาก AI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{analysis.reasoning}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
