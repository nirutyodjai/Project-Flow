'use client';

import { useState } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function ProjectTimelinePage() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: 'งานโครงสร้าง',
      startDate: '2025-10-01',
      endDate: '2025-11-30',
      duration: 60,
      progress: 60,
      status: 'in-progress',
      dependencies: [],
      team: ['ทีม A', 'ทีม B'],
    },
    {
      id: 2,
      name: 'งานสถาปัตย์',
      startDate: '2025-11-15',
      endDate: '2025-12-31',
      duration: 45,
      progress: 30,
      status: 'in-progress',
      dependencies: [1],
      team: ['ทีม C'],
    },
    {
      id: 3,
      name: 'งานระบบไฟฟ้า',
      startDate: '2025-12-01',
      endDate: '2026-01-15',
      duration: 45,
      progress: 0,
      status: 'pending',
      dependencies: [1, 2],
      team: ['ทีม D'],
    },
    {
      id: 4,
      name: 'งานตกแต่ง',
      startDate: '2026-01-01',
      endDate: '2026-02-15',
      duration: 45,
      progress: 0,
      status: 'pending',
      dependencies: [2, 3],
      team: ['ทีม E'],
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-gray-300';
      case 'delayed':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Play className="w-4 h-4 text-blue-600" />;
      case 'delayed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-10 h-10 text-teal-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Project Timeline (Gantt Chart)
            </h1>
          </div>
          <p className="text-gray-600">วางแผนและติดตามความคืบหน้าโครงการ</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">4</div>
                <div className="text-sm text-muted-foreground">งานทั้งหมด</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">2</div>
                <div className="text-sm text-muted-foreground">กำลังดำเนินการ</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">135</div>
                <div className="text-sm text-muted-foreground">วันทั้งหมด</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">45%</div>
                <div className="text-sm text-muted-foreground">ความคืบหน้า</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gantt Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Gantt Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(task.status)}
                      <div>
                        <div className="font-semibold">{task.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {task.startDate} - {task.endDate} ({task.duration} วัน)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-600">
                        {task.progress}%
                      </span>
                      <Badge variant="outline">{task.status}</Badge>
                    </div>
                  </div>

                  {/* Timeline Bar */}
                  <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full ${getStatusColor(task.status)} opacity-30`}
                      style={{ width: '100%' }}
                    />
                    <div
                      className={`absolute top-0 left-0 h-full ${getStatusColor(task.status)}`}
                      style={{ width: `${task.progress}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                      {task.progress}%
                    </div>
                  </div>

                  {/* Team */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>ทีม:</span>
                    {task.team.map((member, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {member}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Critical Path */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Critical Path</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="font-semibold">งานโครงสร้าง</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-semibold">งานสถาปัตย์</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-semibold">งานระบบไฟฟ้า</span>
              </div>
              <p className="text-xs text-muted-foreground">
                ⚠️ งานเหล่านี้ต้องทำตามลำดับ ห้ามล่าช้า
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
