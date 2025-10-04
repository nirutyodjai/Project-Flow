'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, FileText, Users, AlertCircle, CheckCircle, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function AdvancedDashboardPage() {
  const [liveData, setLiveData] = useState({
    newToday: 5,
    deadlineSoon: 3,
    pending: 12,
    wonThisMonth: 8,
    totalValue: 150000000,
    avgProfit: 12,
    activeProjects: 15,
    teamMembers: 8,
  });

  const [recentActivities, setRecentActivities] = useState([
    { time: '10:30', action: 'งานใหม่', detail: 'โครงการก่อสร้างอาคาร 50M', type: 'new' },
    { time: '09:15', action: 'ชนะงาน', detail: 'โครงการไฟฟ้า 30M', type: 'won' },
    { time: '08:45', action: 'ใกล้ปิดรับ', detail: 'โครงการประปา (2 วัน)', type: 'deadline' },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData((prev) => ({
        ...prev,
        newToday: prev.newToday + Math.floor(Math.random() * 2),
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Advanced Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Real-time Analytics & Insights</p>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              🟢 Live
            </Badge>
          </div>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">งานใหม่วันนี้</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold">{liveData.newToday}</div>
                <FileText className="w-10 h-10 opacity-80" />
              </div>
              <p className="text-xs opacity-80 mt-2">+2 จากเมื่อวาน</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">ใกล้ปิดรับ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold">{liveData.deadlineSoon}</div>
                <AlertCircle className="w-10 h-10 opacity-80" />
              </div>
              <p className="text-xs opacity-80 mt-2">ภายใน 3 วัน</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">ชนะเดือนนี้</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold">{liveData.wonThisMonth}</div>
                <CheckCircle className="w-10 h-10 opacity-80" />
              </div>
              <p className="text-xs opacity-80 mt-2">Win Rate 60%</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">มูลค่ารวม</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold">{(liveData.totalValue / 1000000).toFixed(0)}M</div>
                <DollarSign className="w-10 h-10 opacity-80" />
              </div>
              <p className="text-xs opacity-80 mt-2">กำไรเฉลี่ย {liveData.avgProfit}%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                กิจกรรมล่าสุด (Real-time)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-xs text-muted-foreground w-12">{activity.time}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{activity.action}</div>
                      <div className="text-xs text-muted-foreground">{activity.detail}</div>
                    </div>
                    <Badge
                      variant={
                        activity.type === 'won'
                          ? 'default'
                          : activity.type === 'deadline'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="text-xs"
                    >
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                สถิติด่วน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>โครงการที่กำลังดำเนินการ</span>
                    <span className="font-bold">{liveData.activeProjects}</span>
                  </div>
                  <Progress value={75} />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>สมาชิกในทีม</span>
                    <span className="font-bold">{liveData.teamMembers}</span>
                  </div>
                  <Progress value={80} />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>งานที่รอผล</span>
                    <span className="font-bold">{liveData.pending}</span>
                  </div>
                  <Progress value={40} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">75%</div>
                <div className="text-xs text-muted-foreground mt-1">Response Rate</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">60%</div>
                <div className="text-xs text-muted-foreground mt-1">Win Rate</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">12%</div>
                <div className="text-xs text-muted-foreground mt-1">Avg Profit</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">95%</div>
                <div className="text-xs text-muted-foreground mt-1">Satisfaction</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
