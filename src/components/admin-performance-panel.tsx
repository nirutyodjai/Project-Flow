'use client';

import { useState } from 'react';
import { usePerformance } from '@/hooks/use-performance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Settings, Activity, X, ChevronUp, ChevronDown } from 'lucide-react';

/**
 * AdminPerformancePanel component shows real-time performance metrics for the admin dashboard
 */
export function AdminPerformancePanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const metrics = usePerformance();

  // Create historic data for charts
  const [historicData, setHistoricData] = useState<Array<{
    time: string;
    memory: number;
    requests: number;
    fps?: number;
  }>>([]);

  // Update historic data every 10 seconds
  useState(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeString = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      
      setHistoricData(prev => {
        // Keep only the last 10 data points
        const newData = [...prev, {
          time: timeString,
          memory: metrics.memoryUsage || 0,
          requests: metrics.networkRequests,
          fps: metrics.fps,
        }];
        
        if (newData.length > 10) {
          return newData.slice(newData.length - 10);
        }
        return newData;
      });
    }, 10000);

    return () => clearInterval(interval);
  });

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
          onClick={() => setIsVisible(true)}
        >
          <Activity className="h-4 w-4 mr-2" />
          แสดงข้อมูลประสิทธิภาพ
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 shadow-lg">
      <Card className="border-primary/20">
        <CardHeader className="py-3 px-4 flex flex-row justify-between items-center space-y-0 border-b">
          <CardTitle className="text-sm font-medium flex items-center">
            <Activity className="h-4 w-4 mr-2 text-primary" />
            ข้อมูลประสิทธิภาพแอพพลิเคชัน
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setIsVisible(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className={`p-4 ${!isExpanded ? 'space-y-4' : 'space-y-6'}`}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">เวลาโหลดเพจ</p>
              <p className="text-sm font-medium">{metrics.pageLoadTime} ms</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">การใช้หน่วยความจำ</p>
              <p className="text-sm font-medium">{metrics.memoryUsage ?? 'N/A'} MB</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">จำนวนการร้องขอ</p>
              <p className="text-sm font-medium">{metrics.networkRequests}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">FPS</p>
              <p className="text-sm font-medium">{metrics.fps ?? 'N/A'}</p>
            </div>
          </div>

          {isExpanded && historicData.length >= 2 && (
            <>
              <div className="pt-4">
                <p className="text-xs font-medium mb-2">การใช้หน่วยความจำ (MB)</p>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="memory" stroke="#8884d8" name="MB" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-xs font-medium mb-2">การร้องขอเครือข่าย</p>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historicData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="requests" fill="#82ca9d" name="จำนวน" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
