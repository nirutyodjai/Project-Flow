/**
 * useMaterials Hook
 * Hook สำหรับจัดการวัสดุและราคา
 */

import { useState, useEffect } from 'react';
import type { Material, PriceComparison, MaterialSearchFilters } from '@/types/material';

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const searchMaterials = async (searchTerm: string, filters?: MaterialSearchFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/materials/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerm, filters }),
      });

      const data = await response.json();

      if (data.success) {
        setMaterials(data.materials);
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (err) {
      setError(err as Error);
      console.error('Error searching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const comparePrices = async (materialId: string): Promise<PriceComparison | null> => {
    try {
      const response = await fetch('/api/materials/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId }),
      });

      const data = await response.json();

      if (data.success) {
        return data.comparison;
      } else {
        throw new Error(data.error || 'Comparison failed');
      }
    } catch (err) {
      console.error('Error comparing prices:', err);
      return null;
    }
  };

  return {
    materials,
    loading,
    error,
    searchMaterials,
    comparePrices,
  };
}
