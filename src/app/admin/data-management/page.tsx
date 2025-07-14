'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, Upload, CheckCircle, AlertCircle, Info, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface SeedResult {
  success: boolean;
  message: string;
  data?: {
    projects: number;
    contacts: number;
    adminProjects: number;
    tasks: number;
  };
  error?: string;
}

export default function DataManagementPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);

  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      setSeedResult(null);
      logger.info('Starting mock data seeding process...', undefined, 'DataManagement');

      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result: SeedResult = {
        success: true,
        message: 'ข้อมูลจำลองถูกสร้างเรียบร้อยแล้ว (Demo Mode)',
        data: {
          projects: 5,
          contacts: 10,
          adminProjects: 4,
          tasks: 5
        }
      };

      setSeedResult(result);

      toast({
        title: "สำเร็จ!",
        description: result.message,
        variant: "default",
      });
      logger.info('Mock data seeding completed successfully', result.data, 'DataManagement');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const result: SeedResult = {
        success: false,
        message: 'เกิดข้อผิดพลาดในการสร้างข้อมูลจำลอง',
        error: errorMessage
      };
      setSeedResult(result);

      toast({
        title: "เกิดข้อผิดพลาด",
        description: result.message,
        variant: "destructive",
      });
      logger.error('Mock data seeding failed', errorMessage, 'DataManagement');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Data Management</h1>
          <p className="text-muted-foreground mt-2">
            จัดการข้อมูลและเพิ่มข้อมูลจำลองเข้าสู่ระบบ Firebase
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Database className="w-4 h-4 mr-2" />
          Firebase Ready
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* Seed Data Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              เพิ่มข้อมูลจำลอง
            </CardTitle>
            <CardDescription>
              สร้างข้อมูลจำลองสำหรับทดสอบระบบ รวมโครงการ ผู้ติดต่อ และข้อมูลผู้ดูแลระบบ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleSeedData}
                disabled={isSeeding}
                className="flex items-center gap-2"
                size="lg"
              >
                {isSeeding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Database className="w-4 h-4" />
                )}
                {isSeeding ? 'กำลังเพิ่มข้อมูล...' : 'Seed Firebase Data'}
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => window.open('/admin/firebase-data', '_blank')}
              >
                <Eye className="w-4 h-4" />
                ดูข้อมูลใน Firebase
              </Button>
            </div>

            {/* Progress and Results */}
            {isSeeding && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังประมวลผล...
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-1/2 rounded-full animate-pulse" />
                </div>
              </div>
            )}

            {/* Results Display */}
            {seedResult && (
              <div className="space-y-4">
                <div className={`flex items-start gap-3 p-4 rounded-lg border ${
                  seedResult.success 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                    : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                }`}>
                  {seedResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      seedResult.success 
                        ? 'text-green-800 dark:text-green-200' 
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                      {seedResult.success ? 'สำเร็จ!' : 'เกิดข้อผิดพลาด'}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      seedResult.success 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {seedResult.message}
                    </p>
                    {seedResult.error && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-mono">
                        {seedResult.error}
                      </p>
                    )}
                  </div>
                </div>

                {seedResult.success && seedResult.data && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {seedResult.data.projects}
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">โครงการ</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {seedResult.data.contacts}
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">ผู้ติดต่อ</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {seedResult.data.adminProjects}
                      </div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">โครงการผู้ดูแล</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {seedResult.data.tasks}
                      </div>
                      <div className="text-sm text-orange-700 dark:text-orange-300">งาน</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              ข้อมูลระบบ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Firebase Project:</span>
                <span className="font-mono">project-comdee</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Database:</span>
                <span>Firestore</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Region:</span>
                <span>asia-east1</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="default" className="text-xs">
                  Connected
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
