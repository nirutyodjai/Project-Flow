/**
 * Feature Showcase Component
 * แสดงฟีเจอร์ใหม่ที่เพิ่มเข้ามา
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  TrendingUp,
  Target,
  Package,
  FileText,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export function FeatureShowcase() {
  const features = [
    {
      title: 'Real-time Notifications',
      description: 'รับการแจ้งเตือนแบบ Real-time สำหรับทุกกิจกรรมสำคัญ',
      icon: Bell,
      href: '/notifications',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      badge: 'NEW',
      stats: '14 ประเภท',
    },
    {
      title: 'Win Rate Analytics',
      description: 'วิเคราะห์อัตราการชนะงานและแนวโน้ม',
      icon: TrendingUp,
      href: '/analytics',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      badge: 'NEW',
      stats: 'AI-Powered',
    },
    {
      title: 'Smart Bidding AI',
      description: 'AI แนะนำราคาเสนอที่เหมาะสม',
      icon: Target,
      href: '/bidding-ai',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      badge: 'NEW',
      stats: '3 กลยุทธ์',
    },
    {
      title: 'Material Price Comparison',
      description: 'เปรียบเทียบราคาวัสดุจากหลายร้าน',
      icon: Package,
      href: '/materials',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      badge: 'NEW',
      stats: 'ประหยัดสูงสุด',
    },
    {
      title: 'Auto Quotation Generator',
      description: 'สร้างใบเสนอราคาอัตโนมัติ',
      icon: FileText,
      href: '/quotations',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      badge: 'NEW',
      stats: 'Template สวย',
    },
  ];

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              ฟีเจอร์ใหม่
            </CardTitle>
            <CardDescription>
              ฟีเจอร์ใหม่ล่าสุดที่เพิ่มเข้ามา
            </CardDescription>
          </div>
          <Badge variant="default" className="animate-pulse">
            5 Features
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.href} href={feature.href}>
                <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${feature.bgColor}`}>
                        <Icon className={`h-5 w-5 ${feature.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">{feature.title}</h3>
                          {feature.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {feature.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {feature.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-primary">
                            {feature.stats}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
