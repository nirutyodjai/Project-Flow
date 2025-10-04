'use client';

import React, { useEffect, useState } from 'react';
import { LayoutGrid, Columns3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { DataManager, type Project } from '@/lib/data-manager';
import { KanbanBoard } from '@/components/kanban-board';
import { useToast } from '@/hooks/use-toast';

export default function KanbanPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const data = DataManager.getProjects();
    setProjects(data);
  };

  const handleProjectMove = (projectId: string, newStatus: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    // Update project status
    const updatedProject = { ...project, status: newStatus };
    DataManager.saveProject(updatedProject);

    // Update local state
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? updatedProject : p))
    );

    toast({
      title: 'อัปเดตสถานะสำเร็จ!',
      description: `ย้าย "${project.name}" ไปยัง ${getStatusText(newStatus)}`,
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'รอดำเนินการ';
      case 'active': return 'กำลังดำเนินการ';
      case 'review': return 'รอตรวจสอบ';
      case 'completed': return 'เสร็จสิ้น';
      default: return status;
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <PageHeader
        title="Kanban Board"
        description="จัดการโครงการแบบ Kanban - ลากวางเพื่อเปลี่ยนสถานะ"
        extra={
          <Button variant="outline" size="sm">
            <Columns3 className="mr-2 h-4 w-4" />
            ปรับแต่งคอลัมน์
          </Button>
        }
      />

      <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
        <KanbanBoard projects={projects} onProjectMove={handleProjectMove} />
      </main>
    </div>
  );
}
