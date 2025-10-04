import { useEffect, useMemo, useState } from 'react';

export interface TorMaterialItem {
    itemName: string;
    brandModel?: string;
    quantity?: string;
    unit?: string;
    torPage?: string;
    specDetails?: string;
    torAnalysisId?: string;
    createdAt?: string;
}

async function fetchJSON(url: string) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Request failed (${res.status}): ${text}`);
    }
    return res.json();
}

export function useTorMaterialSpecsByTor(torAnalysisId?: string | null, limit: number = 100) {
    const [data, setData] = useState<TorMaterialItem[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!torAnalysisId) return;
        setLoading(true);
        setError(null);

        fetchJSON(`/api/tor-materials?torAnalysisId=${encodeURIComponent(torAnalysisId)}&limit=${limit}`)
            .then((res) => setData(res.items || []))
            .catch((e) => setError(e.message || String(e)))
            .finally(() => setLoading(false));
    }, [torAnalysisId, limit]);

    return { data, loading, error };
}

export function useTorMaterialSpecsSearch(itemName?: string, opts?: { agencyName?: string; limit?: number }) {
    const [data, setData] = useState<TorMaterialItem[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const query = useMemo(() => {
        const params = new URLSearchParams();
        if (itemName) params.set('itemName', itemName);
        if (opts?.agencyName) params.set('agencyName', opts.agencyName);
        params.set('limit', String(opts?.limit ?? 50));
        return `/api/tor-materials?${params.toString()}`;
    }, [itemName, opts?.agencyName, opts?.limit]);

    useEffect(() => {
        if (!itemName) return;
        setLoading(true);
        setError(null);

        fetchJSON(query)
            .then((res) => setData(res.items || []))
            .catch((e) => setError(e.message || String(e)))
            .finally(() => setLoading(false));
    }, [query, itemName]);

    return { data, loading, error };
}