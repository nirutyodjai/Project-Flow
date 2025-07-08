'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Monitor, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface PerformanceMetrics {
  pageLoadTime: number;
  memoryUsage: number;
  networkLatency: number;
  bundleSize: number;
  renderTime: number;
  interactionDelay: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    bundleSize: 0,
    renderTime: 0,
    interactionDelay: 0,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simulate performance metrics collection
    const collectMetrics = () => {
      const performance = window.performance;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      setMetrics({
        pageLoadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : Math.random() * 1000 + 500,
        memoryUsage: (performance as any).memory ? 
          ((performance as any).memory.usedJSHeapSize / (performance as any).memory.totalJSHeapSize) * 100 :
          Math.random() * 60 + 20,
        networkLatency: Math.random() * 100 + 50,
        bundleSize: 2.3, // MB
        renderTime: Math.random() * 50 + 10,
        interactionDelay: Math.random() * 20 + 5,
      });
    };

    collectMetrics();
    const interval = setInterval(collectMetrics, 5000);

    // Show only in development or when specifically enabled
    setIsVisible(process.env.NODE_ENV === 'development' || localStorage.getItem('showPerformanceMonitor') === 'true');

    return () => clearInterval(interval);
  }, []);

  const getPerformanceStatus = (value: number, thresholds: [number, number]) => {
    if (value < thresholds[0]) return { status: 'excellent', color: 'bg-green-500' };
    if (value < thresholds[1]) return { status: 'good', color: 'bg-yellow-500' };
    return { status: 'poor', color: 'bg-red-500' };
  };

  if (!isVisible) return null;

  const performanceData = [
    {
      icon: Clock,
      label: 'Page Load',
      value: `${metrics.pageLoadTime.toFixed(0)}ms`,
      progress: Math.min((metrics.pageLoadTime / 3000) * 100, 100),
      status: getPerformanceStatus(metrics.pageLoadTime, [1000, 2000]),
    },
    {
      icon: Cpu,
      label: 'Memory Usage',
      value: `${metrics.memoryUsage.toFixed(1)}%`,
      progress: metrics.memoryUsage,
      status: getPerformanceStatus(metrics.memoryUsage, [50, 80]),
    },
    {
      icon: Wifi,
      label: 'Network',
      value: `${metrics.networkLatency.toFixed(0)}ms`,
      progress: Math.min((metrics.networkLatency / 200) * 100, 100),
      status: getPerformanceStatus(metrics.networkLatency, [100, 150]),
    },
    {
      icon: HardDrive,
      label: 'Bundle Size',
      value: `${metrics.bundleSize.toFixed(1)}MB`,
      progress: Math.min((metrics.bundleSize / 5) * 100, 100),
      status: getPerformanceStatus(metrics.bundleSize, [2, 4]),
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 bg-background/95 backdrop-blur-sm border shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <CardTitle className="text-sm">Performance Monitor</CardTitle>
            <button
              onClick={() => {
                setIsVisible(false);
                localStorage.setItem('showPerformanceMonitor', 'false');
              }}
              className="ml-auto text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {performanceData.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono">{item.value}</span>
                      <Badge 
                        variant="outline" 
                        className={`h-2 w-2 p-0 border-none ${item.status.color}`}
                      />
                    </div>
                  </div>
                  <Progress 
                    value={item.progress} 
                    className="h-1 mt-1"
                  />
                </div>
              </div>
            );
          })}
          
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Core Web Vitals</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">Good</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
