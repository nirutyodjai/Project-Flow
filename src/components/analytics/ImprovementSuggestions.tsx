/**
 * Improvement Suggestions Component
 * แสดงคำแนะนำในการปรับปรุง
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';

interface ImprovementSuggestionsProps {
  improvements: {
    category: string;
    currentWinRate: number;
    potentialWinRate: number;
    recommendation: string;
  }[];
}

const categoryLabels: Record<string, string> = {
  construction: 'ก่อสร้าง',
  electrical: 'ไฟฟ้า',
  plumbing: 'ประปา',
  interior: 'ตกแต่งภายใน',
  landscape: 'จัดสวน',
  renovation: 'ปรับปรุง',
  maintenance: 'บำรุงรักษา',
  other: 'อื่นๆ',
};

export function ImprovementSuggestions({ improvements }: ImprovementSuggestionsProps) {
  if (improvements.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-semibold mb-2">ยอดเยี่ยม!</h3>
          <p className="text-muted-foreground">
            ทุกหมวดหมู่มี Win Rate ที่ดีแล้ว ไม่มีจุดที่ต้องปรับปรุงเร่งด่วน
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>พบจุดที่ควรปรับปรุง</AlertTitle>
        <AlertDescription>
          มี {improvements.length} หมวดหมู่ที่มี Win Rate ต่ำกว่า 50% และควรได้รับการพัฒนา
        </AlertDescription>
      </Alert>

      {/* Improvement Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {improvements.map((improvement, index) => {
          const label = categoryLabels[improvement.category] || improvement.category;
          const potentialGain = improvement.potentialWinRate - improvement.currentWinRate;

          return (
            <Card key={improvement.category}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{label}</CardTitle>
                    <CardDescription>หมวดหมู่ที่ควรปรับปรุง #{index + 1}</CardDescription>
                  </div>
                  <Badge variant="destructive">
                    {improvement.currentWinRate.toFixed(1)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current vs Potential */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Win Rate ปัจจุบัน</span>
                    <span className="font-medium text-red-600">
                      {improvement.currentWinRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Win Rate เป้าหมาย</span>
                    <span className="font-medium text-green-600">
                      {improvement.potentialWinRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span>โอกาสเพิ่ม</span>
                    <span className="text-primary">
                      +{potentialGain.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Recommendation */}
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-sm">คำแนะนำ</AlertTitle>
                  <AlertDescription className="text-sm">
                    {improvement.recommendation}
                  </AlertDescription>
                </Alert>

                {/* Action Items */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">แนวทางปรับปรุง:</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {getActionItems(improvement.currentWinRate).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* General Tips */}
      <Card>
        <CardHeader>
          <CardTitle>เคล็ดลับทั่วไป</CardTitle>
          <CardDescription>แนวทางในการเพิ่ม Win Rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                กลยุทธ์การเสนอราคา
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• วิเคราะห์ราคาคู่แข่งก่อนเสนอ</li>
                <li>• ปรับราคาให้เหมาะสมกับงบประมาณ</li>
                <li>• เน้นคุณภาพมากกว่าราคาถูก</li>
                <li>• สร้างความแตกต่างจากคู่แข่ง</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                การเพิ่มประสิทธิภาพ
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• ลดต้นทุนการดำเนินงาน</li>
                <li>• เพิ่มทักษะทีมงาน</li>
                <li>• ใช้เทคโนโลยีช่วยงาน</li>
                <li>• สร้างความสัมพันธ์กับลูกค้า</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                สิ่งที่ควรหลีกเลี่ยง
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• เสนอราคาต่ำเกินไป</li>
                <li>• รับงานที่ไม่ถนัด</li>
                <li>• ประมาณการไม่ถูกต้อง</li>
                <li>• ไม่ศึกษาข้อมูลโครงการ</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                การพัฒนาต่อยอด
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• เก็บข้อมูลทุกโครงการ</li>
                <li>• วิเคราะห์สาเหตุที่แพ้</li>
                <li>• เรียนรู้จากคู่แข่ง</li>
                <li>• ปรับปรุงอย่างต่อเนื่อง</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getActionItems(winRate: number): string[] {
  if (winRate < 30) {
    return [
      'ทบทวนกลยุทธ์การเสนอราคาทั้งหมด',
      'วิเคราะห์สาเหตุที่แพ้อย่างละเอียด',
      'พิจารณาเปลี่ยนกลุ่มเป้าหมาย',
      'เพิ่มทักษะและความเชี่ยวชาญ',
    ];
  } else if (winRate < 50) {
    return [
      'ศึกษาคู่แข่งที่ชนะบ่อย',
      'ปรับปรุงคุณภาพงาน',
      'เพิ่มความน่าเชื่อถือ',
      'ปรับราคาให้เหมาะสม',
    ];
  }
  return [
    'รักษาคุณภาพที่มีอยู่',
    'พัฒนาจุดแข็งให้ดียิ่งขึ้น',
    'ขยายไปยังโครงการใหญ่ขึ้น',
  ];
}
