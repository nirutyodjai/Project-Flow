
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown, LogIn, User as UserIcon, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationCenter } from '@/components/notification-center';
import Image from 'next/image';

// Mock User type (แทน Firebase User)
interface MockUser {
  email: string;
  displayName: string;
  photoURL?: string;
}

export function UserProfile() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Mock user data (แทน Firebase Auth)
    const mockUser: MockUser = {
      email: 'admin@example.com',
      displayName: 'Admin User',
      photoURL: undefined,
    };
    setUser(mockUser);
  }, []);

  if (!user) {
    return (
      <div className="p-2 flex items-center gap-2">
        <NotificationCenter />
        <Button asChild className="w-full justify-center">
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            เข้าสู่ระบบ
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2">
      <NotificationCenter />
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 flex items-center justify-between w-full hover:bg-sidebar-accent rounded-md">
          <div className="flex items-center gap-3 text-left">
            <Avatar className="h-9 w-9 relative">
              {user.photoURL ? (
                  <Image src={user.photoURL} alt={user.displayName || 'User'} width={36} height={36} data-ai-hint="person face" />
              ) : (
                 <Image src="https://placehold.co/100x100.png" alt="@user" width={36} height={36} data-ai-hint="person face" />
              )}
              <AvatarFallback>{user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-sidebar"></span>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground truncate max-w-28">
                {user.displayName || user.email}
              </p>
              <p className="text-xs text-muted-foreground">
                ผู้จัดการโครงการ
              </p>
            </div>
          </div>
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mb-2 ml-2">
        <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>โปรไฟล์</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>ตั้งค่า</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action="/auth/signout" method="post">
          <button type="submit" className="w-full">
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>ออกจากระบบ</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
}
