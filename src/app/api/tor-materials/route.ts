import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getHistoricalTorMaterialSpecs, getTorMaterialSpecsByAnalysisId } from '@/services/analysis-data';

const ByTorQuerySchema = z.object({
    torAnalysisId: z.string().min(1),
    limit: z.coerce.number().int().positive().max(500).optional(),
});

const SearchQuerySchema = z.object({
    itemName: z.string().min(1),
    agencyName: z.string().optional(),
    limit: z.coerce.number().int().positive().max(500).optional(),
});

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);

        // Route: /api/tor-materials?torAnalysisId=...
        const byTorParams = ByTorQuerySchema.safeParse({
            torAnalysisId: url.searchParams.get('torAnalysisId') || undefined,
            limit: url.searchParams.get('limit') || undefined,
        });
        if (byTorParams.success && byTorParams.data.torAnalysisId) {
            const items = await getTorMaterialSpecsByAnalysisId(byTorParams.data.torAnalysisId, byTorParams.data.limit);
            return NextResponse.json({ items });
        }

        // Route: /api/tor-materials?itemName=...&agencyName=...&limit=...
        const searchParams = SearchQuerySchema.safeParse({
            itemName: url.searchParams.get('itemName') || undefined,
            agencyName: url.searchParams.get('agencyName') || undefined,
            limit: url.searchParams.get('limit') || undefined,
        });
        if (searchParams.success && searchParams.data.itemName) {
            const items = await getHistoricalTorMaterialSpecs(
                searchParams.data.itemName,
                searchParams.data.agencyName,
                searchParams.data.limit
            );
            return NextResponse.json({ items });
        }

        return NextResponse.json(
            { error: 'Missing required query params. Provide torAnalysisId or itemName.' },
            { status: 400 }
        );
    } catch (error: any) {
        console.error('Error in /api/tor-materials:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}