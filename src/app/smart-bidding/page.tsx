'use client';

import { useState } from 'react';
import { Sparkles, TrendingUp, Target, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function SmartBiddingPage() {
  const [projectData, setProjectData] = useState({
    projectName: '',
    budget: '',
    estimatedCost: '',
  });
  
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  const analyzeProject = async () => {
    if (!projectData.projectName || !projectData.budget || !projectData.estimatedCost) {
      alert('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    setAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const budget = parseFloat(projectData.budget);
      const cost = parseFloat(projectData.estimatedCost);
      
      // คำนวณ
      const profitMargin = ((budget - cost) / budget) * 100;
      const recommendedPrice = cost * 1.15; // เพิ่มกำไร 15%
      const discount = ((budget - recommendedPrice) / budget) * 100;
      const winProbability = profitMargin > 15 ? 85 : profitMargin > 10 ? 70 : profitMargin > 5 ? 50 : 30;
      
      setRecommendation({
        recommendedPrice,
        discount,
        profitMargin: ((recommendedPrice - cost) / recommendedPrice) * 100,
        winProbability,
        competitorAnalysis: {
          avgDiscount: 8,
          lowestBid: budget * 0.90,
          highestBid: budget * 0.98,
        },
        risks: profitMargin < 10 ? ['กำไรต่ำ', 'ความเสี่ยงสูง'] : [],
        suggestions: [
          profitMargin > 15 ? '✅ โครงการดี แนะนำยื่นข้อเสนอ' : '⚠️ กำไรต่ำ พิจารณาอย่างรอบคอบ',
          discount > 5 ? `💡 ลดราคา ${discount.toFixed(1)}% เพื่อเพิ่มโอกาสชนะ` : '💡 ราคาแข่งขันได้',
          winProbability > 70 ? '🎯 โอกาสชนะสูง' : '⚠️ โอกาสชนะปานกลาง',
        ],
      });
      
      setAnalyzing(false);
    }, 2000);
  };

  const loadExample = () => {
    setProjectData({
      projectName: 'โครงการก่อสร้างอาคารสำนักงาน 5 ชั้น',
      budget: '52500000',
      estimatedCost: '45000000',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-purple-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Smart Bidding AI
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            AI แนะนำราคาเสนอที่เหมาะสม เพิ่มโอกาสชนะงาน
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>ข้อมูลโครงการ</CardTitle>
            <CardDescription>กรอกข้อมูลเพื่อให้ AI วิเคราะห์</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>ชื่อโครงการ</Label>
                <Input
                  value={projectData.projectName}
                  onChange={(e) => setProjectData({ ...projectData, projectName: e.target.value })}
                  placeholder="โครงการก่อสร้าง..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>งบประมาณ (บาท)</Label>
                  <Input
                    type="number"
                    value={projectData.budget}
                    onChange={(e) => setProjectData({ ...projectData, budget: e.target.value })}
                    placeholder="50000000"
                  />
                </div>

                <div>
                  <Label>ต้นทุนประมาณการ (บาท)</Label>
                  <Input
                    type="number"
                    value={projectData.estimatedCost}
                    onChange={(e) => setProjectData({ ...projectData, estimatedCost: e.target.value })}
                    placeholder="45000000"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={analyzeProject} disabled={analyzing} className="flex-1">
                  {analyzing ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      AI กำลังวิเคราะห์...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      วิเคราะห์ด้วย AI
                    </>
                  )}
                </Button>
                <Button onClick={loadExample} variant="outline">
                  โหลดตัวอย่าง
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendation */}
        {recommendation && (
          <div className="space-y-6">
            {/* Recommended Price */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Target className="w-6 h-6" />
                  ราคาที่ AI แนะนำ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-600 mb-2">
                    {recommendation.recommendedPrice.toLocaleString()} บาท
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    ลดจากงบประมาณ {recommendation.discount.toFixed(1)}%
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {recommendation.profitMargin.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">กำไรสุทธิ</div>
                    </div>
                    
                    <div className="p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {recommendation.winProbability}%
                      </div>
                      <div className="text-xs text-muted-foreground">โอกาสชนะ</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Competitor Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  การวิเคราะห์คู่แข่ง
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm">ส่วนลดเฉลี่ยของคู่แข่ง</span>
                    <span className="font-bold">{recommendation.competitorAnalysis.avgDiscount}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm">ราคาต่ำสุดที่คาดการณ์</span>
                    <span className="font-bold">{recommendation.competitorAnalysis.lowestBid.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm">ราคาสูงสุดที่คาดการณ์</span>
                    <span className="font-bold">{recommendation.competitorAnalysis.highestBid.toLocaleString()} บาท</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Sparkles className="w-5 h-5" />
                  คำแนะนำจาก AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recommendation.suggestions.map((suggestion: string, index: number) => (
                    <div key={index} className="p-3 bg-white rounded-lg text-sm">
                      {suggestion}
                    </div>
                  ))}
                </div>
                
                {recommendation.risks.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      ความเสี่ยง
                    </div>
                    <ul className="text-sm text-red-600 space-y-1">
                      {recommendation.risks.map((risk: string, index: number) => (
                        <li key={index}>• {risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
