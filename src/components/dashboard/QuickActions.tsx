/**
 * Quick Actions Component
 * ปุ่มลัดสำหรับการทำงานที่ใช้บ่อย
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Search,
  TrendingUp,
  DollarSign,
  Package,
  Target,
  Plus,
  Zap
} from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      title: 'สร้างใบเสนอราคา',
      description: 'สร้างใบเสนอราคาใหม่อย่างรวดเร็ว',
      icon: FileText,
      href: '/quotations',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'ค้นหางานประมูล',
      description: 'ค้นหางานประมูลจาก e-GP',
      icon: Search,
      href: '/procurement',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'วิเคราะห์ราคาเสนอ',
      description: 'ใช้ AI วิเคราะห์ราคาเสนอ',
      icon: Target,
      href: '/bidding-ai',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'เปรียบเทียบราคา',
      description: 'เปรียบเทียบราคาวัสดุ',
      icon: DollarSign,
      href: '/materials',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'ดู Analytics',
      description: 'วิเคราะห์ Win Rate',
      icon: TrendingUp,
      href: '/analytics',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      title: 'จัดการโครงการ',
      description: 'จัดการโครงการทั้งหมด',
      icon: Package,
      href: '/projects',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              เข้าถึงฟีเจอร์ที่ใช้บ่อยได้อย่างรวดเร็ว
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-start gap-2 hover:shadow-md transition-all"
                >
                  <div className={`p-2 rounded-lg ${action.bgColor}`}>
                    <Icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              สร้างโครงการใหม่
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
