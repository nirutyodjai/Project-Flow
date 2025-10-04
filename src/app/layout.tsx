import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from "@/components/theme-provider";
import { inter } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/layout/app-layout-client";
import { Toaster } from "@/components/ui/toaster";
import { PerformanceMonitor } from "@/components/performance-monitor";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { CommandPalette } from "@/components/command-palette";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProjectFlow AI",
  description: "AI-Powered Project Financial Management",
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020817" }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={cn(inter.variable)} suppressHydrationWarning>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
          <KeyboardShortcuts />
          <CommandPalette />
          {process.env.NODE_ENV === 'development' && (
            <>
              <PerformanceMonitor />
              <PWAInstallPrompt />
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
