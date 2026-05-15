'use client';

// ============================================================
// useStringJobs — fetches and manages string job data
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { StringJob, StringJobFormData, StringJobStatus, BreakLocation } from '@/types';

// Pass a racketId to only load string jobs for one racket.
// Leave it undefined to load all string jobs.
export function useStringJobs(racketId?: string) {
  const [stringJobs, setStringJobs] = useState<StringJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStringJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      // .select('*, racket:rackets(*)') also fetches the linked racket row
      let query = supabase
        .from('string_jobs')
        .select('*, racket:rackets(*)')
        .order('stringing_date', { ascending: false });

      if (racketId) {
        query = query.eq('racket_id', racketId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setStringJobs(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load string jobs');
    } finally {
      setLoading(false);
    }
  }, [racketId]);

  useEffect(() => {
    fetchStringJobs();
  }, [fetchStringJobs]);

  // Add a new string job
  async function addStringJob(formData: StringJobFormData): Promise<StringJob> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('string_jobs')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        racket_id: formData.racket_id,
        string_model: formData.string_model,
        string_brand: formData.string_brand || null,
        string_color: formData.string_color || null,
        tension_main: formData.tension_main ? parseInt(formData.tension_main) : null,
        tension_cross: formData.tension_cross ? parseInt(formData.tension_cross) : null,
        stringing_date: formData.stringing_date,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        notes: formData.notes || null,
        status: 'active',
        session_count: 0,
        playing_hours: 0,
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    // Refetch to get the joined racket data
    await fetchStringJobs();
    return data;
  }

  // Update a string job with any partial data
  async function updateStringJob(id: string, updates: Record<string, unknown>): Promise<StringJob> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('string_jobs')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    // Refetch to get the joined racket data
    await fetchStringJobs();
    return data;
  }

  // Change the status (active → broken / cut / restrung) and optionally record where it broke
  async function updateStatus(
    id: string,
    status: StringJobStatus,
    breakLocation?: BreakLocation,
  ): Promise<StringJob> {
    return updateStringJob(id, {
      status,
      break_location: breakLocation ?? null,
    });
  }

  // Delete a string job
  async function deleteStringJob(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('string_jobs').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setStringJobs(prev => prev.filter(j => j.id !== id));
  }

  return {
    stringJobs,
    loading,
    error,
    addStringJob,
    updateStringJob,
    updateStatus,
    deleteStringJob,
    refetch: fetchStringJobs,
  };
}
