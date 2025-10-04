'use client';

import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { DataManager, type Project } from '@/lib/data-manager';
import { CalendarView } from '@/components/calendar-view';

export default function CalendarPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const data = DataManager.getProjects();
    setProjects(data);
  };

  const exportToICS = () => {
    // สร้างไฟล์ .ics สำหรับ Calendar
    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ProjectFlow//Calendar//EN\n';

    projects.forEach((project) => {
      const deadline = new Date(project.bidSubmissionDeadline);
      const dtstart = deadline.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      icsContent += `BEGIN:VEVENT\n`;
      icsContent += `UID:${project.id}@projectflow.app\n`;
      icsContent += `DTSTAMP:${dtstart}\n`;
      icsContent += `DTSTART:${dtstart}\n`;
      icsContent += `SUMMARY:${project.name}\n`;
      icsContent += `DESCRIPTION:${project.organization}\\nงบประมาณ: ${project.budget}\n`;
      icsContent += `LOCATION:${project.address}\n`;
      icsContent += `END:VEVENT\n`;
    });

    icsContent += 'END:VCALENDAR';

    // Download
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projectflow-calendar.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <PageHeader
        title="ปฏิทินโครงการ"
        description="ดูกำหนดส่งเอกสารและ Deadline ทั้งหมด"
        extra={
          <Button variant="outline" size="sm" onClick={exportToICS}>
            <Download className="mr-2 h-4 w-4" />
            Export .ics
          </Button>
        }
      />

      <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
        <CalendarView projects={projects} />
      </main>
    </div>
  );
}
