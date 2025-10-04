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
  Database,
  FileSpreadsheet,
  LineChart,
  LayoutGrid,
  Calendar as CalendarIcon,
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
            <SidebarMenuButton asChild isActive={isActive('/projects')}>
              <Link href="/projects"><Briefcase /><span>จัดการโครงการ</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/projects/kanban')}>
              <Link href="/projects/kanban"><LayoutGrid /><span>Kanban Board</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/calendar')}>
              <Link href="/calendar"><CalendarIcon /><span>ปฏิทินโครงการ</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/kpi-dashboard')}>
              <Link href="/kpi-dashboard"><BarChart3 /><span>KPI Dashboard</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/notifications')}>
              <Link href="/notifications"><BarChart3 /><span>การแจ้งเตือน</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/procurement')}>
              <Link href="/procurement"><Database /><span>ค้นหางานประมูล AI</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/procurement/real-search')}>
              <Link href="/procurement/real-search"><Database /><span>ค้นหางานจริง (Internet)</span></Link>
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
            <SidebarMenuButton asChild isActive={isActive('/bidding-ai')}>
              <Link href="/bidding-ai"><ChartNoAxesColumnIncreasing /><span>Smart Bidding AI</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/materials')}>
              <Link href="/materials"><Database /><span>เปรียบเทียบราคาวัสดุ</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/quotations')}>
              <Link href="/quotations"><FileSpreadsheet /><span>ใบเสนอราคา</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/finance')}>
              <Link href="/finance"><Wallet /><span>บริหารการเงิน</span></Link>
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
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarSeparator className="my-2" />
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
