import * as React from "react";
import { AppSidebar } from "@/components/layout/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationSystem } from "@/components/notification-system";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-col flex-1 overflow-hidden">
          <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <NotificationSystem />
              <ThemeToggle />
            </div>
          </header>
          {children}
        </main>
    </SidebarProvider>
  );
}
