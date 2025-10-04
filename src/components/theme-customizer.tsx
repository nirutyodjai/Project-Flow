'use client';

import React, { useState } from 'react';
import { Palette, Check, Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const themes = {
  colors: [
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Green', value: 'green', class: 'bg-green-500' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
    { name: 'Red', value: 'red', class: 'bg-red-500' },
    { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
  ],
  modes: [
    { name: 'Light', value: 'light', icon: Sun },
    { name: 'Dark', value: 'dark', icon: Moon },
    { name: 'System', value: 'system', icon: Laptop },
  ],
};

/**
 * 🎨 Theme Customizer
 * ปรับแต่ง Theme และสี
 */
export function ThemeCustomizer() {
  const { theme, setTheme } = useTheme();
  const [accentColor, setAccentColor] = useState('blue');
  const [open, setOpen] = useState(false);

  const handleColorChange = (color: string) => {
    setAccentColor(color);
    // Update CSS variables
    document.documentElement.style.setProperty('--accent-color', color);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            ปรับแต่ง Theme
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Theme Mode */}
          <div>
            <h3 className="text-sm font-semibold mb-3">โหมดธีม</h3>
            <div className="grid grid-cols-3 gap-3">
              {themes.modes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <Card
                    key={mode.value}
                    className={cn(
                      'cursor-pointer hover:border-primary transition-colors',
                      theme === mode.value && 'border-primary border-2'
                    )}
                    onClick={() => setTheme(mode.value)}
                  >
                    <CardContent className="p-4 flex flex-col items-center gap-2">
                      <Icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{mode.name}</span>
                      {theme === mode.value && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <h3 className="text-sm font-semibold mb-3">สีหลัก</h3>
            <div className="grid grid-cols-6 gap-3">
              {themes.colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorChange(color.value)}
                  className={cn(
                    'h-12 w-12 rounded-lg transition-all hover:scale-110',
                    color.class,
                    accentColor === color.value && 'ring-2 ring-offset-2 ring-primary'
                  )}
                  title={color.name}
                >
                  {accentColor === color.value && (
                    <Check className="h-6 w-6 text-white mx-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="text-sm font-semibold mb-3">ตัวอย่าง</h3>
            <div className="space-y-2">
              <Button className="w-full">Primary Button</Button>
              <Button variant="secondary" className="w-full">
                Secondary Button
              </Button>
              <Button variant="outline" className="w-full">
                Outline Button
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
