/**
 * Materials Price Comparison API
 * เปรียบเทียบราคาวัสดุ
 */

import { NextRequest, NextResponse } from 'next/server';
import { MaterialPriceServicePostgres } from '@/services/material-price-service-postgres';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { materialId } = body;

    if (!materialId) {
      return NextResponse.json(
        { success: false, error: 'materialId is required' },
        { status: 400 }
      );
    }

    const comparison = await MaterialPriceServicePostgres.comparePrices(materialId);

    return NextResponse.json({
      success: true,
      comparison,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error comparing prices:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Comparison failed',
      },
      { status: 500 }
    );
  }
}
