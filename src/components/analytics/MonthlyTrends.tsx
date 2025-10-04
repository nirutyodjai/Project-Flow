/**
 * Monthly Trends Component
 * แสดงแนวโน้มรายเดือน
 */

'use client';

import type { MonthlyStats } from '@/types/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyTrendsProps {
  monthlyStats: MonthlyStats[];
}

export function MonthlyTrends({ monthlyStats }: MonthlyTrendsProps) {
  // Format data for charts
  const chartData = monthlyStats.map(stat => ({
    month: formatMonth(stat.month),
    'Win Rate': stat.winRate,
    'ชนะ': stat.wonProjects,
    'แพ้': stat.lostProjects,
    'กำไร (M)': stat.profit / 1000000,
  }));

  return (
    <div className="space-y-6">
      {/* Win Rate Trend */}
      <Card>
        <CardHeader>
          <CardTitle>แนวโน้ม Win Rate</CardTitle>
          <CardDescription>อัตราการชนะงานรายเดือน</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Win Rate" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Projects Won/Lost */}
      <Card>
        <CardHeader>
          <CardTitle>โครงการชนะ/แพ้</CardTitle>
          <CardDescription>จำนวนโครงการที่ชนะและแพ้รายเดือน</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ชนะ" fill="#22c55e" />
              <Bar dataKey="แพ้" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Profit Trend */}
      <Card>
        <CardHeader>
          <CardTitle>แนวโน้มกำไร</CardTitle>
          <CardDescription>กำไรรายเดือน (ล้านบาท)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="กำไร (M)" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>สถิติรายเดือน</CardTitle>
          <CardDescription>ข้อมูลรายละเอียดแต่ละเดือน</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">เดือน</th>
                  <th className="text-right p-2">โครงการ</th>
                  <th className="text-right p-2">ชนะ</th>
                  <th className="text-right p-2">แพ้</th>
                  <th className="text-right p-2">Win Rate</th>
                  <th className="text-right p-2">กำไร</th>
                </tr>
              </thead>
              <tbody>
                {monthlyStats.map((stat) => (
                  <tr key={stat.month} className="border-b hover:bg-accent/50">
                    <td className="p-2">{formatMonth(stat.month)}</td>
                    <td className="text-right p-2">{stat.totalProjects}</td>
                    <td className="text-right p-2 text-green-600">{stat.wonProjects}</td>
                    <td className="text-right p-2 text-red-600">{stat.lostProjects}</td>
                    <td className="text-right p-2 font-medium">
                      {stat.winRate.toFixed(1)}%
                    </td>
                    <td className="text-right p-2">
                      {(stat.profit / 1000000).toFixed(2)}M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatMonth(month: string): string {
  const [year, monthNum] = month.split('-');
  const monthNames = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  return `${monthNames[parseInt(monthNum) - 1]} ${parseInt(year) + 543}`;
}
