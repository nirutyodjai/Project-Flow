'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after a delay (better UX)
      setTimeout(() => {
        setIsVisible(true);
      }, 10000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
    };

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Don't show again for this session
    sessionStorage.setItem('pwaPromptDismissed', 'true');
  };

  if (!isVisible || isInstalled || !installPrompt || sessionStorage.getItem('pwaPromptDismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <Card className="bg-background/95 backdrop-blur-sm border shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm">ติดตั้ง ProjectFlow AI</h3>
              <p className="text-xs text-muted-foreground mt-1">
                เข้าถึงได้ง่ายขึ้นจากหน้าจอหลัก และใช้งานแบบออฟไลน์
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Button 
                  size="sm" 
                  onClick={handleInstallClick}
                  className="h-8 text-xs"
                >
                  ติดตั้ง
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDismiss}
                  className="h-8 text-xs"
                >
                  ไม่ใช่ตอนนี้
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="ปิด"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
