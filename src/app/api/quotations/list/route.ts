/**
 * Quotations List API
 * ดึงรายการใบเสนอราคา
 */

import { NextRequest, NextResponse } from 'next/server';
import { QuotationServicePostgres } from '@/services/quotation-service-postgres';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const quotations = await QuotationServicePostgres.getQuotations(userId);
    const summary = await QuotationServicePostgres.getQuotationSummary(userId);

    return NextResponse.json({
      success: true,
      quotations,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting quotations:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get quotations',
      },
      { status: 500 }
    );
  }
}
