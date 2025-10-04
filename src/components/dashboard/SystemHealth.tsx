/**
 * System Health Component
 * แสดงสถานะสุขภาพของระบบ
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Database,
  Server,
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

export function SystemHealth() {
  const health = {
    overall: 'healthy',
    database: {
      status: 'connected',
      responseTime: 45,
      connections: 12,
    },
    api: {
      status: 'operational',
      uptime: 99.9,
      requests: 1234,
    },
    storage: {
      used: 2.4,
      total: 10,
      percent: 24,
    },
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'operational':
        return { variant: 'default' as const, icon: CheckCircle, label: 'ปกติ' };
      case 'warning':
        return { variant: 'secondary' as const, icon: AlertTriangle, label: 'เตือน' };
      case 'error':
        return { variant: 'destructive' as const, icon: AlertTriangle, label: 'ผิดปกติ' };
      default:
        return { variant: 'outline' as const, icon: Clock, label: 'ไม่ทราบ' };
    }
  };

  const overallStatus = getStatusBadge(health.overall);
  const OverallIcon = overallStatus.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              สถานะระบบ
            </CardTitle>
            <CardDescription>
              ตรวจสอบสุขภาพของระบบ
            </CardDescription>
          </div>
          <Badge variant={overallStatus.variant} className="flex items-center gap-1">
            <OverallIcon className="h-3 w-3" />
            {overallStatus.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Database */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Database</span>
            </div>
            <Badge variant="default" className="text-xs">
              {health.database.status}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-muted rounded">
              <p className="text-muted-foreground">Response Time</p>
              <p className="font-medium">{health.database.responseTime}ms</p>
            </div>
            <div className="p-2 bg-muted rounded">
              <p className="text-muted-foreground">Connections</p>
              <p className="font-medium">{health.database.connections}</p>
            </div>
          </div>
        </div>

        {/* API */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">API Server</span>
            </div>
            <Badge variant="default" className="text-xs">
              {health.api.status}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-muted rounded">
              <p className="text-muted-foreground">Uptime</p>
              <p className="font-medium">{health.api.uptime}%</p>
            </div>
            <div className="p-2 bg-muted rounded">
              <p className="text-muted-foreground">Requests</p>
              <p className="font-medium">{health.api.requests.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Storage</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {health.storage.used}GB / {health.storage.total}GB
            </span>
          </div>
          <Progress value={health.storage.percent} className="h-2" />
          <p className="text-xs text-muted-foreground">
            ใช้ไปแล้ว {health.storage.percent}%
          </p>
        </div>

        {/* Last Updated */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Clock className="h-3 w-3" />
            อัปเดตล่าสุด: {new Date().toLocaleString('th-TH')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
