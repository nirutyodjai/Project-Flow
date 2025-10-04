'use client';

import React, { useEffect, useState } from 'react';
import { Command, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  { keys: ['Ctrl', 'K'], description: 'เปิดค้นหาแบบเร็ว', category: 'Navigation' },
  { keys: ['Ctrl', 'N'], description: 'สร้างโครงการใหม่', category: 'Actions' },
  { keys: ['Ctrl', 'S'], description: 'บันทึก', category: 'Actions' },
  { keys: ['Ctrl', 'E'], description: 'ส่งออกข้อมูล', category: 'Data' },
  { keys: ['Ctrl', 'I'], description: 'นำเข้าข้อมูล', category: 'Data' },
  { keys: ['Ctrl', '/'], description: 'แสดง Keyboard Shortcuts', category: 'Help' },
  { keys: ['Esc'], description: 'ปิดหน้าต่าง/ยกเลิก', category: 'Navigation' },
  { keys: ['?'], description: 'แสดงความช่วยเหลือ', category: 'Help' },
];

/**
 * ⌨️ Keyboard Shortcuts Component
 * แสดงและจัดการ Keyboard Shortcuts
 */
export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + / to toggle shortcuts dialog
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts.map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent">
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          <Badge variant="secondary" className="font-mono">
                            {key}
                          </Badge>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground mx-1">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          กด <Badge variant="secondary" className="mx-1">Ctrl</Badge> +
          <Badge variant="secondary" className="mx-1">/</Badge> เพื่อเปิด/ปิดหน้าต่างนี้
        </div>
      </DialogContent>
    </Dialog>
  );
}
