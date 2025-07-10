/**
 * API endpoint สำหรับวิเคราะห์ต้นทุนและกำไรของ BOQ จากข้อมูลไพรีสลิสต์
 */
import { NextResponse } from 'next/server';
import * as PriceListService from '@/services/price-list-service';

/**
 * วิเคราะห์ต้นทุนและกำไรของ BOQ จากข้อมูลไพรีสลิสต์
 * 
 * POST /api/procurement/cost-profit-analysis
 */
export async function POST(request: Request) {
  try {
    const { boqItems, profitTarget, overheadPercent, labourCostPercent } = await request.json();
    
    if (!boqItems || !Array.isArray(boqItems) || boqItems.length === 0) {
      return NextResponse.json({ 
        error: 'ต้องระบุรายการ BOQ อย่างน้อย 1 รายการ' 
      }, { status: 400 });
    }
    
    // ดึงข้อมูลรายการจากไพรีสลิสต์ที่เกี่ยวข้อง (ถ้ามี)
    const analysisResult = await Promise.all(
      boqItems.map(async (item) => {
        // ถ้ามี materialCode หรือ priceListItemId ให้ดึงข้อมูลจากไพรีสลิสต์
        let priceListItem = null;
        
        if (item.priceListItemId) {
          priceListItem = await PriceListService.getPriceListItemById(item.priceListItemId);
        } else if (item.materialCode) {
          const searchResults = await PriceListService.searchPriceListItems({
            materialCode: item.materialCode,
            onlyActive: true
          });
          
          if (searchResults.length > 0) {
            priceListItem = searchResults[0];
          }
        }
        
        // ถ้าพบข้อมูลในไพรีสลิสต์
        if (priceListItem) {
          const costBreakdown = PriceListService.calculateCostProfitBreakdown(
            priceListItem, 
            { 
              profitTarget, 
              overheadPercent, 
              labourCostPercent 
            }
          );
          
          return {
            ...item,
            priceSource: 'price-list',
            priceListItem: {
              id: priceListItem.id,
              materialCode: priceListItem.materialCode,
              description: priceListItem.description
            },
            costBreakdown: {
              material: costBreakdown.materialCost,
              labour: costBreakdown.labourCost,
              overhead: costBreakdown.overheadCost,
              profit: costBreakdown.profit,
              profitPercent: costBreakdown.profitPercent
            },
            totalBreakdown: {
              material: costBreakdown.materialCost * item.quantity,
              labour: costBreakdown.labourCost * item.quantity,
              overhead: costBreakdown.overheadCost * item.quantity,
              profit: costBreakdown.profit * item.quantity,
              totalCost: costBreakdown.totalCost * item.quantity,
              totalPrice: costBreakdown.submitPrice * item.quantity
            }
          };
        } 
        // ถ้าไม่มีข้อมูลในไพรีสลิสต์ ให้ประมาณการแบบง่าย
        else {
          // ประมาณต้นทุนและกำไรโดยใช้สัดส่วนมาตรฐาน
          const estimatedUnitPrice = item.unitPrice || 0;
          const totalPrice = estimatedUnitPrice * item.quantity;
          
          // สัดส่วนพื้นฐาน: วัสดุ 70%, แรงงาน 15%, โสหุ้ย 8%, กำไร 7%
          const materialPercent = 0.7;
          const labourPercent = 0.15;
          const overheadPercent = 0.08;
          const profitPercent = 0.07;
          
          const material = estimatedUnitPrice * materialPercent;
          const labour = estimatedUnitPrice * labourPercent;
          const overhead = estimatedUnitPrice * overheadPercent;
          const profit = estimatedUnitPrice * profitPercent;
          
          return {
            ...item,
            priceSource: 'estimate',
            costBreakdown: {
              material,
              labour,
              overhead,
              profit,
              profitPercent: profitPercent * 100
            },
            totalBreakdown: {
              material: material * item.quantity,
              labour: labour * item.quantity,
              overhead: overhead * item.quantity,
              profit: profit * item.quantity,
              totalCost: (material + labour + overhead) * item.quantity,
              totalPrice
            }
          };
        }
      })
    );
    
    // คำนวณผลรวม
    const summary = analysisResult.reduce((acc, item) => {
      return {
        totalMaterialCost: acc.totalMaterialCost + (item.totalBreakdown?.material || 0),
        totalLabourCost: acc.totalLabourCost + (item.totalBreakdown?.labour || 0),
        totalOverheadCost: acc.totalOverheadCost + (item.totalBreakdown?.overhead || 0),
        totalProfitAmount: acc.totalProfitAmount + (item.totalBreakdown?.profit || 0),
        totalCost: acc.totalCost + (item.totalBreakdown?.totalCost || 0),
        totalPrice: acc.totalPrice + (item.totalBreakdown?.totalPrice || item.quantity * item.unitPrice || 0),
      };
    }, {
      totalMaterialCost: 0,
      totalLabourCost: 0,
      totalOverheadCost: 0,
      totalProfitAmount: 0,
      totalCost: 0,
      totalPrice: 0,
    });
    
    // คำนวณเปอร์เซ็นต์กำไรเฉลี่ย
    summary.averageProfitPercent = summary.totalCost > 0 
      ? (summary.totalProfitAmount / summary.totalCost) * 100 
      : 0;
    
    // คำนวณสัดส่วนของต้นทุนแต่ละประเภท
    summary.materialPercent = summary.totalPrice > 0 
      ? (summary.totalMaterialCost / summary.totalPrice) * 100 
      : 0;
      
    summary.labourPercent = summary.totalPrice > 0 
      ? (summary.totalLabourCost / summary.totalPrice) * 100 
      : 0;
      
    summary.overheadPercent = summary.totalPrice > 0 
      ? (summary.totalOverheadCost / summary.totalPrice) * 100 
      : 0;
      
    summary.profitPercent = summary.totalPrice > 0 
      ? (summary.totalProfitAmount / summary.totalPrice) * 100 
      : 0;
    
    // ข้อมูลเพิ่มเติม
    summary.itemsWithPriceList = analysisResult.filter(item => item.priceSource === 'price-list').length;
    summary.itemsWithoutPriceList = analysisResult.filter(item => item.priceSource !== 'price-list').length;
    summary.totalItems = analysisResult.length;
    summary.priceListCoveragePercent = Math.round((summary.itemsWithPriceList / summary.totalItems) * 100);
    
    return NextResponse.json({
      success: true,
      data: {
        items: analysisResult,
        summary
      }
    });
  } catch (error) {
    console.error('Error analyzing cost and profit:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการวิเคราะห์ต้นทุนและกำไร' 
    }, { status: 500 });
  }
}
