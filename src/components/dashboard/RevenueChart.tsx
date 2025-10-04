/**
 * Revenue Chart Component
 * กราฟแสดงรายได้และกำไร
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, DollarSign, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function RevenueChart() {
  const data = [
    { month: 'ม.ค.', revenue: 2500000, profit: 375000, projects: 8 },
    { month: 'ก.พ.', revenue: 2800000, profit: 420000, projects: 9 },
    { month: 'มี.ค.', revenue: 2100000, profit: 315000, projects: 7 },
    { month: 'เม.ย.', revenue: 2900000, profit: 435000, projects: 10 },
    { month: 'พ.ค.', revenue: 3200000, profit: 480000, projects: 11 },
    { month: 'มิ.ย.', revenue: 3500000, profit: 525000, projects: 12 },
  ];

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);
  const avgProfitMargin = (totalProfit / totalRevenue) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              รายได้และกำไร
            </CardTitle>
            <CardDescription>
              แนวโน้มรายได้และกำไร 6 เดือนล่าสุด
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/finance">
              ดูรายละเอียด
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">รายได้รวม</p>
            <p className="text-xl font-bold text-green-600">
              {(totalRevenue / 1000000).toFixed(1)}M
            </p>
            <Badge variant="default" className="mt-1 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5%
            </Badge>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">กำไรรวม</p>
            <p className="text-xl font-bold text-blue-600">
              {(totalProfit / 1000000).toFixed(1)}M
            </p>
            <Badge variant="secondary" className="mt-1 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15.2%
            </Badge>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Profit Margin</p>
            <p className="text-xl font-bold text-purple-600">
              {avgProfitMargin.toFixed(1)}%
            </p>
            <Badge variant="outline" className="mt-1 text-xs">
              เฉลี่ย
            </Badge>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
              }}
              formatter={(value: number) => [
                `${value.toLocaleString()} ฿`,
                '',
              ]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="รายได้"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProfit)"
              name="กำไร"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Monthly Breakdown */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-medium mb-3">รายละเอียดรายเดือน</h4>
          <div className="space-y-2">
            {data.slice(-3).reverse().map((item) => (
              <div key={item.month} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium w-12">{item.month}</span>
                  <div className="text-xs text-muted-foreground">
                    {item.projects} โครงการ
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      {(item.revenue / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-muted-foreground">รายได้</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">
                      {(item.profit / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-muted-foreground">กำไร</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
