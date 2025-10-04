'use client';

import { useState } from 'react';
import { Users, TrendingUp, Target, Award, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function CompetitorIntelligencePage() {
  const [competitors, setCompetitors] = useState([
    {
      name: 'บริษัท ABC จำกัด',
      totalBids: 25,
      won: 15,
      winRate: 60,
      avgDiscount: 8,
      avgProfit: 10,
      strength: ['งานก่อสร้าง', 'โครงการใหญ่'],
      weakness: ['งานตกแต่ง', 'ราคาสูง'],
      recentWins: ['โครงการ A - 50M', 'โครงการ B - 30M'],
    },
    {
      name: 'บริษัท XYZ จำกัด',
      totalBids: 20,
      won: 10,
      winRate: 50,
      avgDiscount: 5,
      avgProfit: 12,
      strength: ['งานไฟฟ้า', 'ราคาถูก'],
      weakness: ['คุณภาพ', 'ล่าช้า'],
      recentWins: ['โครงการ C - 25M'],
    },
    {
      name: 'บริษัท DEF จำกัด',
      totalBids: 18,
      won: 7,
      winRate: 39,
      avgDiscount: 12,
      avgProfit: 8,
      strength: ['งานประปา', 'ส่งมอบเร็ว'],
      weakness: ['งานใหญ่', 'ทีมน้อย'],
      recentWins: ['โครงการ D - 15M'],
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-10 h-10 text-red-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Competitor Intelligence
            </h1>
          </div>
          <p className="text-gray-600">วิเคราะห์คู่แข่งและปรับกลยุทธ์</p>
        </div>

        {/* Competitor Cards */}
        <div className="space-y-6">
          {competitors.map((competitor, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {index === 0 && <Award className="w-5 h-5 text-yellow-500" />}
                    {competitor.name}
                  </CardTitle>
                  <Badge variant={competitor.winRate > 50 ? 'default' : 'secondary'}>
                    Rank #{index + 1}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{competitor.totalBids}</div>
                    <div className="text-xs text-muted-foreground mt-1">ยื่นข้อเสนอ</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{competitor.won}</div>
                    <div className="text-xs text-muted-foreground mt-1">ชนะงาน</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">{competitor.winRate}%</div>
                    <div className="text-xs text-muted-foreground mt-1">Win Rate</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600">-{competitor.avgDiscount}%</div>
                    <div className="text-xs text-muted-foreground mt-1">ส่วนลดเฉลี่ย</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-semibold mb-2">Win Rate Progress</div>
                  <Progress value={competitor.winRate} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">จุดแข็ง</span>
                    </div>
                    <div className="space-y-1">
                      {competitor.strength.map((s, idx) => (
                        <div key={idx} className="text-xs">• {s}</div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-700">จุดอ่อน</span>
                    </div>
                    <div className="space-y-1">
                      {competitor.weakness.map((w, idx) => (
                        <div key={idx} className="text-xs">• {w}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-semibold mb-2">งานที่ชนะล่าสุด</div>
                  <div className="space-y-1">
                    {competitor.recentWins.map((win, idx) => (
                      <div key={idx} className="text-xs">🏆 {win}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Strategy Recommendations */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Target className="w-6 h-6" />
              กลยุทธ์แนะนำ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg">
                <div className="font-semibold text-sm mb-1">💡 เพิ่มโอกาสชนะ</div>
                <p className="text-xs text-muted-foreground">
                  บริษัท ABC ชนะบ่อยในงานก่อสร้าง → ควรเน้นงานไฟฟ้าและตกแต่งแทน
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="font-semibold text-sm mb-1">💰 กลยุทธ์ราคา</div>
                <p className="text-xs text-muted-foreground">
                  คู่แข่งลดราคาเฉลี่ย 8% → แนะนำลด 10% เพื่อแข่งขัน
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="font-semibold text-sm mb-1">🎯 โอกาสทอง</div>
                <p className="text-xs text-muted-foreground">
                  บริษัท XYZ มีปัญหาคุณภาพ → เน้น Quality Assurance ในข้อเสนอ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
