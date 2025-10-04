'use client';

import React from 'react';
import { Calendar, MapPin, Phone, User, TrendingUp, Clock, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Project } from '@/lib/data-manager';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

/**
 * 📋 Project Card Component
 * แสดงโครงการแบบ Card สวยงาม
 */
export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active': return 'กำลังดำเนินการ';
      case 'pending': return 'รอดำเนินการ';
      case 'completed': return 'เสร็จสิ้น';
      case 'cancelled': return 'ยกเลิก';
      default: return 'ไม่ระบุ';
    }
  };

  const daysUntilDeadline = () => {
    const deadline = new Date(project.bidSubmissionDeadline);
    const today = new Date();
    const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const days = daysUntilDeadline();

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {project.name}
          </CardTitle>
          <Badge className={cn('border', getStatusColor(project.status))}>
            {getStatusText(project.status)}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Tag className="h-4 w-4" />
          <span>{project.type}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Organization */}
        <div className="flex items-start gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{project.organization}</p>
            <p className="text-muted-foreground">{project.contactPerson}</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{project.address}</span>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{project.phone}</span>
        </div>

        {/* Budget */}
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
          <span className="text-sm font-medium">งบประมาณ</span>
          <span className="text-lg font-bold text-primary">
            ฿{Number(project.budget.replace(/,/g, '')).toLocaleString()}
          </span>
        </div>

        {/* Progress */}
        {project.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">ความคืบหน้า</span>
              <span className="font-semibold">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
        )}

        {/* Deadline */}
        <div className={cn(
          "flex items-center justify-between p-3 rounded-lg",
          days < 7 ? 'bg-red-500/10' : 'bg-muted'
        )}>
          <div className="flex items-center gap-2">
            <Calendar className={cn(
              "h-4 w-4",
              days < 7 ? 'text-red-500' : 'text-muted-foreground'
            )} />
            <span className="text-sm">กำหนดส่งเอกสาร</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">
              {new Date(project.bidSubmissionDeadline).toLocaleDateString('th-TH')}
            </p>
            <p className={cn(
              "text-xs",
              days < 7 ? 'text-red-500 font-semibold' : 'text-muted-foreground'
            )}>
              {days > 0 ? `อีก ${days} วัน` : days === 0 ? 'วันนี้!' : 'เลยกำหนดแล้ว'}
            </p>
          </div>
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" size="sm">
            ดูรายละเอียด
          </Button>
          <Button className="flex-1" size="sm">
            เริ่มงาน
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
