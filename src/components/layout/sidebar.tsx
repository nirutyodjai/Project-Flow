'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import {
  Home,
  Users,
  Wallet,
  Shield,
  Cog,
  Briefcase,
  ChartNoAxesColumnIncreasing,
  BarChart3,
  TrendingUp,
  Database,
  FileSpreadsheet,
  Calculator,
  LineChart,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { UserProfile } from './user-profile';

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <span className="text-3xl text-primary font-bold">⚡</span>
          <h1 className="text-xl font-headline font-semibold">ProjectFlow AI</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2 flex-grow">
        <h2 className="px-2 mb-2 text-sm font-semibold tracking-wider text-muted-foreground font-headline uppercase">
          เมนูหลัก
        </h2>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/')}>
              <Link href="/"><Home /><span>แดชบอร์ด</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/kpi-dashboard')}>
              <Link href="/kpi-dashboard"><BarChart3 /><span>KPI Dashboard</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/procurement')}>
              <Link href="/procurement"><Briefcase /><span>ค้นหางานประมูล</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/procurement/price-list')}>
              <Link href="/procurement/price-list"><Database /><span>สินค้าไพรีส</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/procurement/price-comparison')}>
              <Link href="/procurement/price-comparison"><LineChart /><span>เปรียบเทียบราคา</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/procurement/boq-generator')}>
              <Link href="/procurement/boq-generator"><FileSpreadsheet /><span>สร้าง BOQ</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/analysis')}>
              <Link href="/analysis"><ChartNoAxesColumnIncreasing /><span>วิเคราะห์โครงการ</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/finance')}>
              <Link href="/finance"><Wallet /><span>บริหารการเงิน</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/market')}>
              <Link href="/market"><TrendingUp /><span>วิเคราะห์ตลาดหุ้น</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/market/trends')}>
              <Link href="/market/trends"><BarChart3 /><span>แนวโน้มตลาด</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/contacts')}>
              <Link href="/contacts"><Users /><span>คู่ค้าและลูกค้า</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/admin')}>
                <Link href="/admin"><Shield /><span>แผงควบคุม</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/settings')}>
                <Link href="/settings"><Cog /><span>ตั้งค่า</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
         <div className="px-3 py-2 mt-6">
            <h2 className="mb-2 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                โครงการสำคัญ
            </h2>
            <div className="space-y-1 mt-2">
                <a href="#" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white">
                    <span className="mr-2 h-2 w-2 rounded-full bg-green-400"></span>
                    โครงการก่อสร้างอาคารสำนักงาน A
                </a>
                <a href="#" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white">
                    <span className="mr-2 h-2 w-2 rounded-full bg-yellow-400"></span>
                    โครงการปรับปรุงระบบไฟฟ้า B
                </a>
                <a href="#" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white">
                    <span className="mr-2 h-2 w-2 rounded-full bg-red-400"></span>
                    โครงการติดตั้งระบบปรับอากาศ C
                </a>
            </div>
        </div>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarSeparator className="my-2" />
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
