'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Project } from '@/lib/data-manager';

interface CalendarViewProps {
  projects: Project[];
}

/**
 * 📅 Calendar View Component
 * แสดงโครงการในรูปแบบปฏิทิน
 */
export function CalendarView({ projects }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getProjectsForDate = (date: Date) => {
    return projects.filter((p) => {
      const deadline = new Date(p.bidSubmissionDeadline);
      return (
        deadline.getDate() === date.getDate() &&
        deadline.getMonth() === date.getMonth() &&
        deadline.getFullYear() === date.getFullYear()
      );
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {monthName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={today}>
              วันนี้
            </Button>
            <Button size="icon" variant="outline" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells before first day */}
          {[...Array(startingDayOfWeek)].map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days */}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayProjects = getProjectsForDate(date);
            const isToday =
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={day}
                className={cn(
                  'aspect-square border rounded-lg p-2 hover:bg-accent transition-colors cursor-pointer',
                  isToday && 'border-primary border-2 bg-primary/5'
                )}
              >
                <div className="flex flex-col h-full">
                  <span
                    className={cn(
                      'text-sm font-semibold mb-1',
                      isToday && 'text-primary'
                    )}
                  >
                    {day}
                  </span>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    {dayProjects.slice(0, 2).map((project) => (
                      <div
                        key={project.id}
                        className="text-xs p-1 bg-primary/10 rounded truncate"
                        title={project.name}
                      >
                        {project.name}
                      </div>
                    ))}
                    {dayProjects.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayProjects.length - 2} เพิ่มเติม
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">วันนี้</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary/10" />
            <span className="text-muted-foreground">มีโครงการ</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
