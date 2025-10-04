/**
 * useQuotations Hook
 * Hook สำหรับจัดการใบเสนอราคา
 */

import { useState, useEffect } from 'react';
import type { Quotation, QuotationSummary, QuotationItem, CustomerInfo } from '@/types/quotation';

export function useQuotations(userId: string) {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [summary, setSummary] = useState<QuotationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadQuotations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/quotations/list?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setQuotations(data.quotations);
        setSummary(data.summary);
      } else {
        throw new Error(data.error || 'Failed to load quotations');
      }
    } catch (err) {
      setError(err as Error);
      console.error('Error loading quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  const createQuotation = async (
    customer: CustomerInfo,
    items: QuotationItem[],
    options?: any
  ): Promise<Quotation | null> => {
    try {
      const response = await fetch('/api/quotations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, customer, items, options }),
      });

      const data = await response.json();

      if (data.success) {
        await loadQuotations(); // Reload list
        return data.quotation;
      } else {
        throw new Error(data.error || 'Failed to create quotation');
      }
    } catch (err) {
      console.error('Error creating quotation:', err);
      return null;
    }
  };

  useEffect(() => {
    if (userId) {
      loadQuotations();
    }
  }, [userId]);

  return {
    quotations,
    summary,
    loading,
    error,
    loadQuotations,
    createQuotation,
  };
}
