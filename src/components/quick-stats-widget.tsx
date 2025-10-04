'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Briefcase, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DataManager } from '@/lib/data-manager';
import { cn } from '@/lib/utils';

interface StatItem {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: string;
  trendUp?: boolean;
}

/**
 * 📊 Quick Stats Widget - สถิติสำคัญแบบเรียลไทม์
 */
export function QuickStatsWidget() {
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    updateStats();
    
    // Update every 5 seconds
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStats = () => {
    const data = DataManager.getStatistics();
    
    const newStats: StatItem[] = [
      {
        label: 'โครงการทั้งหมด',
        value: data.totalProjects,
        icon: Briefcase,
        color: 'from-blue-500 to-blue-600',
        trend: `${data.activeProjects} กำลังดำเนินการ`,
        trendUp: true,
      },
      {
        label: 'โครงการสำเร็จ',
        value: data.completedProjects,
        icon: CheckCircle,
        color: 'from-green-500 to-green-600',
        trend: `${Math.round((data.completedProjects / data.totalProjects) * 100)}% สำเร็จ`,
        trendUp: true,
      },
      {
        label: 'คู่ค้าทั้งหมด',
        value: data.totalContacts,
        icon: Users,
        color: 'from-purple-500 to-purple-600',
        trend: `${data.customers} ลูกค้า`,
      },
      {
        label: 'แจ้งเตือนใหม่',
        value: data.unreadNotifications,
        icon: Clock,
        color: 'from-orange-500 to-orange-600',
        trend: 'ยังไม่ได้อ่าน',
      },
    ];
    
    setStats(newStats);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={idx} 
            className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
          >
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1 group-hover:scale-110 transition-transform">
                      {stat.value}
                    </p>
                    {stat.trend && (
                      <p className={cn(
                        "text-xs mt-2 flex items-center gap-1",
                        stat.trendUp ? "text-green-500" : "text-muted-foreground"
                      )}>
                        {stat.trendUp && <TrendingUp className="h-3 w-3" />}
                        {stat.trend}
                      </p>
                    )}
                  </div>
                  <div className={cn(
                    "h-16 w-16 rounded-full bg-gradient-to-br flex items-center justify-center group-hover:scale-110 transition-transform",
                    stat.color
                  )}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              <div className={cn(
                "h-1 bg-gradient-to-r",
                stat.color
              )} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
