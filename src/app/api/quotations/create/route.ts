/**
 * Quotations Create API
 * สร้างใบเสนอราคา
 */

import { NextRequest, NextResponse } from 'next/server';
import { QuotationServicePostgres } from '@/services/quotation-service-postgres';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, customer, items, options } = body;

    if (!userId || !customer || !items) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const quotation = await QuotationServicePostgres.createQuotation(
      userId,
      customer,
      items,
      options
    );

    return NextResponse.json({
      success: true,
      quotation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating quotation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Creation failed',
      },
      { status: 500 }
    );
  }
}
