'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Trophy, TrendingUp, TrendingDown, Target, DollarSign, Calendar, Award, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const initialState = {
  overview: { totalBids: 0, won: 0, lost: 0, pending: 0, winRate: 0, totalValue: 0, wonValue: 0, avgProfit: 0 },
  byCategory: [],
  byMonth: [],
};

export default function WinRateAnalyticsPage() {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/analytics/win-rate');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <p className="ml-4 text-lg text-gray-700">กำลังโหลดข้อมูลสถิติ...</p>
          </div>
        ) : (
          <>
            {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-10 h-10 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Win Rate Analytics
            </h1>
          </div>
          <p className="text-gray-600">วิเคราะห์สถิติการชนะ-แพ้ และปรับปรุงกลยุทธ์</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">ชนะงาน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{data.overview.won}</div>
                  <div className="text-xs opacity-80">{data.overview.winRate.toFixed(0)}% Win Rate</div>
                </div>
                <Trophy className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">แพ้งาน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{data.overview.lost}</div>
                  <div className="text-xs opacity-80">{((data.overview.lost / data.overview.totalBids) * 100).toFixed(0)}% Loss Rate</div>
                </div>
                <TrendingDown className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">รอผล</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{data.overview.pending}</div>
                  <div className="text-xs opacity-80">{((data.overview.pending / data.overview.totalBids) * 100).toFixed(0)}% Pending</div>
                </div>
                <Calendar className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">มูลค่าที่ชนะ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{(data.overview.wonValue / 1000000).toFixed(1)}M</div>
                  <div className="text-xs opacity-80">จาก {(data.overview.totalValue / 1000000).toFixed(1)}M บาท</div>
                </div>
                <DollarSign className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Win Rate by Category */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Win Rate แยกตามประเภทงาน
            </CardTitle>
            <CardDescription>วิเคราะห์ว่าประเภทงานไหนชนะบ่อย</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.byCategory.map((cat, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{cat.category}</span>
                      <span className="text-sm text-muted-foreground">
                        {cat.won}/{cat.total} งาน
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-600">
                        {cat.winRate}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(cat.value / 1000000).toFixed(0)}M
                      </span>
                    </div>
                  </div>
                  <Progress value={cat.winRate} className="h-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              แนวโน้มรายเดือน
            </CardTitle>
            <CardDescription>สถิติการชนะ-แพ้ในแต่ละเดือน</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.byMonth.map((month, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 font-semibold text-sm">{month.month}</div>
                  
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">
                        {month.won}
                      </div>
                      <span className="text-xs text-muted-foreground">ชนะ</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold">
                        {month.lost}
                      </div>
                      <span className="text-xs text-muted-foreground">แพ้</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Progress value={month.winRate} className="w-32 h-2" />
                    <span className="text-sm font-bold text-green-600 w-12">
                      {month.winRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Award className="w-5 h-5" />
                จุดแข็ง
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>กำไรเฉลี่ย {data.overview.avgProfit.toFixed(1)}% (ดีมาก)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>โครงการขนาดใหญ่ (&gt;50M): ชนะบ่อย</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>กำไรเฉลี่ย 12.5% (ดีมาก)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Target className="w-5 h-5" />
                จุดที่ควรปรับปรุง
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">!</span>
                  <span>งานตกแต่ง: Win Rate 40% (ต่ำ)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">!</span>
                  <span>เดือนเมษายน: Win Rate 40% (ต่ำสุด)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">!</span>
                  <span>ควรปรับกลยุทธ์การเสนอราคา</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
