'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Users, 
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface RealTimeMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  monthlyGrowth: number;
  activeUsers: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  lastUpdated: Date;
}

interface ActivityData {
  time: string;
  projects: number;
  revenue: number;
  users: number;
}

export function RealTimeDashboard() {
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    totalProjects: 42,
    activeProjects: 18,
    completedProjects: 24,
    totalRevenue: 8500000,
    monthlyGrowth: 12.5,
    activeUsers: 156,
    systemHealth: 'healthy',
    lastUpdated: new Date(),
  });

  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate real-time data updates
  useEffect(() => {
    // Generate initial activity data
    const initialData: ActivityData[] = [];
    for (let i = 23; i >= 0; i--) {
      const time = new Date();
      time.setHours(time.getHours() - i);
      initialData.push({
        time: time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        projects: Math.floor(Math.random() * 10) + 15,
        revenue: Math.floor(Math.random() * 500000) + 200000,
        users: Math.floor(Math.random() * 50) + 100,
      });
    }
    setActivityData(initialData);
    setIsConnected(true);

    // Simulate real-time updates every 5 seconds
    const interval = setInterval(() => {
      const now = new Date();
      const newDataPoint: ActivityData = {
        time: now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        projects: Math.floor(Math.random() * 10) + 15,
        revenue: Math.floor(Math.random() * 500000) + 200000,
        users: Math.floor(Math.random() * 50) + 100,
      };

      setActivityData(prev => {
        const updated = [...prev.slice(1), newDataPoint];
        return updated;
      });

      // Update metrics randomly
      setMetrics(prev => ({
        ...prev,
        totalProjects: prev.totalProjects + (Math.random() > 0.8 ? 1 : 0),
        activeProjects: Math.max(1, prev.activeProjects + (Math.random() > 0.5 ? 1 : -1)),
        totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 100000),
        monthlyGrowth: prev.monthlyGrowth + (Math.random() - 0.5) * 2,
        activeUsers: Math.max(50, prev.activeUsers + Math.floor((Math.random() - 0.5) * 10)),
        lastUpdated: now,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMetrics(prev => ({
      ...prev,
      lastUpdated: new Date(),
    }));
    setIsLoading(false);
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Activity;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const HealthIcon = getHealthIcon(metrics.systemHealth);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard แบบ Real-time</h2>
          <p className="text-muted-foreground">
            อัปเดตล่าสุด: {metrics.lastUpdated.toLocaleString('th-TH')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">โปรเจกต์ทั้งหมด</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              กำลังดำเนินการ {metrics.activeProjects} โปรเจกต์
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <div className="flex items-center gap-1 text-xs">
              {metrics.monthlyGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={metrics.monthlyGrowth > 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(metrics.monthlyGrowth).toFixed(1)}%
              </span>
              <span className="text-muted-foreground">จากเดือนที่แล้ว</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ผู้ใช้งานออนไลน์</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              เชื่อมต่อในขณะนี้
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สถานะระบบ</CardTitle>
            <HealthIcon className={`h-4 w-4 ${getHealthColor(metrics.systemHealth)}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(metrics.systemHealth)}`}>
              {metrics.systemHealth === 'healthy' ? 'ปกติ' : 
               metrics.systemHealth === 'warning' ? 'เตือน' : 'วิกฤต'}
            </div>
            <p className="text-xs text-muted-foreground">
              ตรวจสอบเมื่อ {new Date().toLocaleTimeString('th-TH')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>กิจกรรมโปรเจกต์ (24 ชั่วโมงล่าสุด)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="projects" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>รายได้แบบ Real-time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'รายได้']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--chart-2))" 
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>กิจกรรมล่าสุด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityData.slice(-5).reverse().map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.projects}</span> โปรเจกต์ใหม่ | 
                    <span className="font-medium ml-2">{formatCurrency(activity.revenue)}</span> รายได้ | 
                    <span className="font-medium ml-2">{activity.users}</span> ผู้ใช้
                  </p>
                  <p className="text-xs text-muted-foreground">เวลา {activity.time}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Live
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
