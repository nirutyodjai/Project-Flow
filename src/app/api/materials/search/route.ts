/**
 * Materials Search API
 * ค้นหาวัสดุด้วย PostgreSQL
 */

import { NextRequest, NextResponse } from 'next/server';
import { MaterialPriceServicePostgres } from '@/services/material-price-service-postgres';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchTerm = '', filters = {} } = body;

    const materials = await MaterialPriceServicePostgres.searchMaterials(
      searchTerm,
      filters
    );

    return NextResponse.json({
      success: true,
      total: materials.length,
      materials,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error searching materials:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      },
      { status: 500 }
    );
  }
}
