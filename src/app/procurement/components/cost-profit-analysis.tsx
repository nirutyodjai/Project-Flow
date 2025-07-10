'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface BOQItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  materialCode?: string;
  supplier?: string;
  maker?: string;
  priceSource?: 'price-list' | 'estimate';
  costBreakdown?: {
    material: number;
    labour: number;
    overhead: number;
    profit: number;
  };
}

interface CostProfitAnalysisProps {
  boqItems: BOQItem[];
  budget?: number;
}

export default function CostProfitAnalysis({ boqItems, budget }: CostProfitAnalysisProps) {
  // คำนวณราคารวม
  const totalCost = boqItems.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // คำนวณต้นทุนวัสดุและแรงงาน (ประมาณ)
  let materialCost = 0;
  let labourCost = 0;
  let overheadCost = 0;
  let profitAmount = 0;
  
  boqItems.forEach(item => {
    if (item.costBreakdown) {
      materialCost += item.costBreakdown.material * item.quantity;
      labourCost += item.costBreakdown.labour * item.quantity;
      overheadCost += item.costBreakdown.overhead * item.quantity;
      profitAmount += item.costBreakdown.profit * item.quantity;
    } else {
      // ถ้าไม่มีการระบุ cost breakdown ให้ประมาณตามค่าทั่วไป
      materialCost += item.totalPrice * 0.65; // 65% เป็นค่าวัสดุ
      labourCost += item.totalPrice * 0.15;  // 15% เป็นค่าแรงงาน
      overheadCost += item.totalPrice * 0.1; // 10% เป็นค่าโสหุ้ย
      profitAmount += item.totalPrice * 0.1; // 10% เป็นกำไร
    }
  });
  
  // คำนวณเปอร์เซ็นต์
  const materialPercent = Math.round((materialCost / totalCost) * 100);
  const labourPercent = Math.round((labourCost / totalCost) * 100);
  const overheadPercent = Math.round((overheadCost / totalCost) * 100);
  const profitPercent = Math.round((profitAmount / totalCost) * 100);
  
  // คำนวณการใช้งบประมาณ
  const budgetPercentage = budget ? Math.round((totalCost / budget) * 100) : 0;
  const budgetRemaining = budget ? budget - totalCost : 0;
  const budgetStatus = budget 
    ? (budgetPercentage > 100 
      ? 'เกินงบประมาณ' 
      : (budgetPercentage > 90 
        ? 'ใกล้เคียงงบประมาณ' 
        : 'อยู่ในงบประมาณ'))
    : 'ไม่ระบุงบประมาณ';
  
  // สถานะโดยรวม
  const statusColor = budget
    ? (budgetPercentage > 100 
      ? 'text-red-500' 
      : (budgetPercentage > 90 
        ? 'text-orange-500' 
        : 'text-green-500'))
    : 'text-gray-500';
    
  return (
    <Card>
      <CardHeader>
        <CardTitle>วิเคราะห์ต้นทุน-กำไร</CardTitle>
        <CardDescription>การวิเคราะห์ต้นทุนและประมาณการกำไรขาดทุน</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* สรุปมูลค่าโดยรวม */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">มูลค่ารวมทั้งสิ้น:</span>
              <span className="font-bold">{totalCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span>
            </div>
            
            {budget > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="font-medium">งบประมาณโครงการ:</span>
                  <span className="font-bold">{budget.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">ใช้งบประมาณไปแล้ว:</span>
                  <span className={budgetPercentage > 100 ? 'font-bold text-red-500' : 'font-bold'}>
                    {budgetPercentage}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">งบประมาณคงเหลือ:</span>
                  <span className={budgetRemaining < 0 ? 'font-bold text-red-500' : 'font-bold text-green-500'}>
                    {budgetRemaining.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">สถานะงบประมาณ:</span>
                  <span className={`font-bold ${statusColor}`}>{budgetStatus}</span>
                </div>
                
                <Progress 
                  value={budgetPercentage > 100 ? 100 : budgetPercentage} 
                  className={budgetPercentage > 100 ? 'bg-red-200' : 'bg-gray-200'} 
                />
              </>
            )}
          </div>
          
          {/* การกระจายของต้นทุน */}
          <div>
            <h3 className="text-sm font-medium mb-2">โครงสร้างต้นทุน</h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>ค่าวัสดุ</span>
                  <span>{materialPercent}% ({materialCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท)</span>
                </div>
                <Progress value={materialPercent} className="h-2 bg-blue-100" indicatorClassName="bg-blue-500" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>ค่าแรงงาน</span>
                  <span>{labourPercent}% ({labourCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท)</span>
                </div>
                <Progress value={labourPercent} className="h-2 bg-amber-100" indicatorClassName="bg-amber-500" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>ค่าโสหุ้ย/ดำเนินงาน</span>
                  <span>{overheadPercent}% ({overheadCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท)</span>
                </div>
                <Progress value={overheadPercent} className="h-2 bg-orange-100" indicatorClassName="bg-orange-500" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>กำไร</span>
                  <span>{profitPercent}% ({profitAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท)</span>
                </div>
                <Progress value={profitPercent} className="h-2 bg-green-100" indicatorClassName="bg-green-500" />
              </div>
            </div>
          </div>
          
          {/* สรุปและคำแนะนำ */}
          <div className="pt-3 border-t">
            <h3 className="text-sm font-medium mb-1">บทวิเคราะห์</h3>
            <p className="text-sm text-gray-600">
              {profitPercent < 5 ? (
                'อัตรากำไรค่อนข้างต่ำ ควรพิจารณาปรับลดต้นทุนหรือเพิ่มราคา'
              ) : profitPercent < 10 ? (
                'อัตรากำไรอยู่ในเกณฑ์พอใช้ แต่ควรระมัดระวังความเสี่ยงจากการเพิ่มของต้นทุน'
              ) : (
                'อัตรากำไรอยู่ในเกณฑ์ดี มีความเป็นไปได้ทางธุรกิจ'
              )}
              {' '}
              {budget && budgetPercentage > 100 ? (
                'ราคารวมเกินงบประมาณที่ตั้งไว้ ควรพิจารณาทบทวนรายการหรือเจรจาปรับเพิ่มงบประมาณ'
              ) : budget && budgetPercentage > 90 ? (
                'ราคารวมใกล้เคียงงบประมาณที่ตั้งไว้ ควรระวังค่าใช้จ่ายที่อาจเกิดเพิ่มเติม'
              ) : budget ? (
                'ราคารวมอยู่ภายในงบประมาณที่กำหนดไว้'
              ) : ''}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
