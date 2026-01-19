import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category, Cluster } from '@/types/product';

export function useGoogleSheets() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (): Promise<Product[]> => {
    setLoading(true);
    setError(null);
    try {
      if (!supabase) {
        throw new Error('Supabase is not configured. Set VITE_SUPABASE_* env vars to load Google Sheets data.');
      }
      const { data, error } = await supabase.functions.invoke('google-sheets', {
        body: { action: 'getAll', sheet: 'Products' }
      });

      if (error) throw error;
      
      return (data?.data || []).map((row: Record<string, string>) => ({
        id: row.id || '',
        name: row.name || '',
        category: row.category || '',
        cluster: row.cluster || '',
        price: parseFloat(row.price) || 0,
        material: row.material || '',
        size: row.size || '',
        moq: parseInt(row.moq) || 1,
        available: row.available === 'true' || row.available === 'TRUE',
        images: row.images ? row.images.split(',') : [],
        description: row.description || '',
        createdAt: row.createdAt || new Date().toISOString(),
        updatedAt: row.updatedAt || new Date().toISOString(),
        retailerId: row.retailerId || '',
      }));
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async (): Promise<Category[]> => {
    setLoading(true);
    setError(null);
    try {
      if (!supabase) {
        throw new Error('Supabase is not configured. Set VITE_SUPABASE_* env vars to load Google Sheets data.');
      }
      const { data, error } = await supabase.functions.invoke('google-sheets', {
        body: { action: 'getAll', sheet: 'Categories' }
      });

      if (error) throw error;
      
      return (data?.data || []).map((row: Record<string, string>) => ({
        id: row.id || '',
        name: row.name || '',
        description: row.description || '',
        image: row.image,
      }));
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClusters = useCallback(async (): Promise<Cluster[]> => {
    setLoading(true);
    setError(null);
    try {
      if (!supabase) {
        throw new Error('Supabase is not configured. Set VITE_SUPABASE_* env vars to load Google Sheets data.');
      }
      const { data, error } = await supabase.functions.invoke('google-sheets', {
        body: { action: 'getAll', sheet: 'Clusters' }
      });

      if (error) throw error;
      
      return (data?.data || []).map((row: Record<string, string>) => ({
        id: row.id || '',
        name: row.name || '',
        categoryId: row.categoryId || '',
        description: row.description || '',
      }));
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchProducts,
    fetchCategories,
    fetchClusters,
  };
}