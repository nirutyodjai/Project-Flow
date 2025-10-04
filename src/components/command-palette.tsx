'use client';

import React, { useEffect, useState } from 'react';
import { Search, FileText, Users, Briefcase, Settings, BarChart3, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface Command {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  keywords?: string[];
}

/**
 * 🎯 Command Palette Component
 * ค้นหาและเข้าถึงฟีเจอร์ได้อย่างรวดเร็ว (Ctrl+K)
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const commands: Command[] = [
    {
      id: 'dashboard',
      label: 'ไปที่แดชบอร์ด',
      icon: BarChart3,
      action: () => {
        router.push('/');
        setOpen(false);
      },
      keywords: ['dashboard', 'home', 'หน้าแรก'],
    },
    {
      id: 'projects',
      label: 'จัดการโครงการ',
      icon: Briefcase,
      action: () => {
        router.push('/projects');
        setOpen(false);
      },
      keywords: ['projects', 'โครงการ'],
    },
    {
      id: 'new-project',
      label: 'สร้างโครงการใหม่',
      icon: Plus,
      action: () => {
        console.log('Create new project');
        setOpen(false);
      },
      keywords: ['new', 'create', 'สร้าง', 'ใหม่'],
    },
    {
      id: 'contacts',
      label: 'คู่ค้าและลูกค้า',
      icon: Users,
      action: () => {
        router.push('/contacts');
        setOpen(false);
      },
      keywords: ['contacts', 'customers', 'คู่ค้า', 'ลูกค้า'],
    },
    {
      id: 'procurement',
      label: 'ค้นหางานประมูล',
      icon: Search,
      action: () => {
        router.push('/procurement');
        setOpen(false);
      },
      keywords: ['procurement', 'ประมูล', 'งาน'],
    },
    {
      id: 'settings',
      label: 'ตั้งค่า',
      icon: Settings,
      action: () => {
        router.push('/settings');
        setOpen(false);
      },
      keywords: ['settings', 'preferences', 'ตั้งค่า'],
    },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="ค้นหาคำสั่งหรือหน้า..." />
      <CommandList>
        <CommandEmpty>ไม่พบผลลัพธ์</CommandEmpty>
        <CommandGroup heading="Navigation">
          {commands.map((command) => {
            const Icon = command.icon;
            return (
              <CommandItem
                key={command.id}
                onSelect={command.action}
                className="cursor-pointer"
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{command.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
