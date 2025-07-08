
import type { Metadata } from 'next';
import { ThemeProvider } from "@/components/theme-provider";
import { belleza, alegreya } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/layout/app-layout-client";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProjectFlow AI",
  description: "AI-Powered Project Financial Management",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={cn(belleza.variable, alegreya.variable)} suppressHydrationWarning>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
