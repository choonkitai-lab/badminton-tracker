'use client';

// ============================================================
// useRackets — fetches and manages racket data from Supabase
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Racket, RacketFormData } from '@/types';

export function useRackets() {
  const [rackets, setRackets] = useState<Racket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all rackets from Supabase, newest first
  const fetchRackets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('rackets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRackets(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rackets');
    } finally {
      setLoading(false);
    }
  }, []);

  // Run on component mount
  useEffect(() => {
    fetchRackets();
  }, [fetchRackets]);

  // Add a new racket
  async function addRacket(formData: RacketFormData): Promise<Racket> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('rackets')
      .insert({
        user_id: user.id,
        name: formData.name,
        brand: formData.brand || null,
        model: formData.model || null,
        weight_class: formData.weight_class || null,
        notes: formData.notes || null,
        status: formData.status,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    // Prepend to local state so it appears at the top without refetching
    setRackets(prev => [data, ...prev]);
    return data;
  }

  // Update an existing racket
  async function updateRacket(id: string, formData: RacketFormData): Promise<Racket> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('rackets')
      .update({
        name: formData.name,
        brand: formData.brand || null,
        model: formData.model || null,
        weight_class: formData.weight_class || null,
        notes: formData.notes || null,
        status: formData.status,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    setRackets(prev => prev.map(r => (r.id === id ? data : r)));
    return data;
  }

  // Delete a racket (also deletes its string jobs via CASCADE in the database)
  async function deleteRacket(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('rackets').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setRackets(prev => prev.filter(r => r.id !== id));
  }

  return {
    rackets,
    loading,
    error,
    addRacket,
    updateRacket,
    deleteRacket,
    refetch: fetchRackets,
  };
}
