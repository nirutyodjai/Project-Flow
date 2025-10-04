'use client';

import React, { useState } from 'react';
import { GripVertical, Plus, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Project } from '@/lib/data-manager';

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  color: string;
}

const columns: KanbanColumn[] = [
  { id: 'pending', title: 'รอดำเนินการ', status: 'pending', color: 'bg-yellow-500' },
  { id: 'active', title: 'กำลังดำเนินการ', status: 'active', color: 'bg-blue-500' },
  { id: 'review', title: 'รอตรวจสอบ', status: 'review', color: 'bg-purple-500' },
  { id: 'completed', title: 'เสร็จสิ้น', status: 'completed', color: 'bg-green-500' },
];

interface KanbanBoardProps {
  projects: Project[];
  onProjectMove?: (projectId: string, newStatus: string) => void;
}

/**
 * 📋 Kanban Board Component
 * จัดการโครงการแบบ Kanban
 */
export function KanbanBoard({ projects, onProjectMove }: KanbanBoardProps) {
  const [draggedProject, setDraggedProject] = useState<string | null>(null);

  const getProjectsByStatus = (status: string) => {
    return projects.filter((p) => p.status === status);
  };

  const handleDragStart = (projectId: string) => {
    setDraggedProject(projectId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: string) => {
    if (draggedProject && onProjectMove) {
      onProjectMove(draggedProject, status);
    }
    setDraggedProject(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column) => {
        const columnProjects = getProjectsByStatus(column.status);
        
        return (
          <div
            key={column.id}
            className="flex flex-col"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.status)}
          >
            {/* Column Header */}
            <Card className="mb-3">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-3 h-3 rounded-full', column.color)} />
                    <CardTitle className="text-sm font-semibold">
                      {column.title}
                    </CardTitle>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {columnProjects.length}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Project Cards */}
            <div className="space-y-3 flex-1 min-h-[200px]">
              {columnProjects.map((project) => (
                <Card
                  key={project.id}
                  draggable
                  onDragStart={() => handleDragStart(project.id)}
                  className={cn(
                    'cursor-move hover:shadow-lg transition-all',
                    draggedProject === project.id && 'opacity-50'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2 mb-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                          {project.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {project.organization}
                        </p>
                      </div>
                      <Button size="icon" variant="ghost" className="h-6 w-6 flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">งบประมาณ</span>
                        <span className="font-semibold">
                          ฿{Number(project.budget.replace(/,/g, '')).toLocaleString()}
                        </span>
                      </div>
                      
                      {project.progress !== undefined && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">ความคืบหน้า</span>
                          <span className="font-semibold">{project.progress}%</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">กำหนดส่ง</span>
                        <span className="font-semibold">
                          {new Date(project.bidSubmissionDeadline).toLocaleDateString('th-TH', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {project.tags.slice(0, 2).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Add Card Button */}
              <Button
                variant="outline"
                className="w-full border-dashed"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มโครงการ
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
