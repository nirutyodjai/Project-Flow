import * as React from "react";
import { AppSidebar } from "@/components/layout/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-col flex-1 overflow-hidden">
          <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 md:hidden">
            <SidebarTrigger />
            <ThemeToggle />
          </header>
          {children}
        </main>
    </SidebarProvider>
  );
}
