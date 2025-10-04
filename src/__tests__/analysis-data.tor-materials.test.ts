import { describe, it, expect, vi, beforeEach } from '@jest/globals';
import { getTorMaterialSpecsByAnalysisId, saveTorMaterialSpecifications } from '@/services/analysis-data';

// Mock Firestore layer
vi.mock('@/services/firebase', () => {
    const docs: any[] = [];
    return {
        getDb: () => ({
            _docs: docs,
        }),
    };
});

vi.mock('firebase/firestore', async () => {
    const actual: any = await vi.importActual('firebase/firestore');
    const docs: any[] = [];

    return {
        ...actual,
        collection: vi.fn((db: any, name: string) => ({ name, _docs: docs })),
        where: vi.fn((field: string, op: string, value: string) => ({ field, op, value })),
        orderBy: vi.fn((field: string, direction: string) => ({ field, direction })),
        limit: vi.fn((n: number) => ({ n })),
        getDocs: vi.fn(async () => ({ docs: docs.map((d) => ({ data: () => d })) })),
        doc: vi.fn((db: any, col: string, id: string) => ({ col, id })),
        setDoc: vi.fn(async (ref: any, data: any) => {
            docs.push(data);
        }),
    };
});

describe('TOR materials service', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('saves and fetches materials by torAnalysisId', async () => {
        const torId = 'tor_123';
        await saveTorMaterialSpecifications(torId, [
            { itemName: 'สายไฟ', brandModel: 'ABC', quantity: '10', unit: 'ม้วน' },
            { itemName: 'ท่อ PVC', quantity: '20', unit: 'เส้น' },
        ] as any);

        const results = await getTorMaterialSpecsByAnalysisId(torId);
        expect(results.length).toBeGreaterThanOrEqual(2);
        expect(results[0].itemName).toBeDefined();
    });
});