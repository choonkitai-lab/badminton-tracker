'use client';

// ============================================================
// useSessions — fetches and manages session data
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Session, SessionFormData } from '@/types';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('sessions')
        .select('*, racket:rackets(*), string_job:string_jobs(*)')
        .order('session_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      setSessions(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Log a new session.
  // Also automatically increments session_count and playing_hours on the linked string job.
  async function addSession(formData: SessionFormData): Promise<Session> {
    const supabase = createClient();
    const durationMinutes = parseInt(formData.duration_minutes);

    // 1. Insert the session row
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        racket_id: formData.racket_id,
        string_job_id: formData.string_job_id || null,
        session_date: formData.session_date,
        duration_minutes: durationMinutes,
        notes: formData.notes || null,
        repulsion_rating: formData.repulsion_rating ? parseInt(formData.repulsion_rating) : null,
        control_rating:   formData.control_rating   ? parseInt(formData.control_rating)   : null,
        sound_rating:     formData.sound_rating      ? parseInt(formData.sound_rating)     : null,
        durability_feeling: formData.durability_feeling ? parseInt(formData.durability_feeling) : null,
        overall_feeling:  formData.overall_feeling   ? parseInt(formData.overall_feeling)  : null,
      })
      .select('*')
      .single();

    if (sessionError) throw new Error(sessionError.message);

    // 2. If a string job was selected, update its counters
    if (formData.string_job_id) {
      const { data: currentJob } = await supabase
        .from('string_jobs')
        .select('session_count, playing_hours')
        .eq('id', formData.string_job_id)
        .single();

      if (currentJob) {
        await supabase
          .from('string_jobs')
          .update({
            session_count: currentJob.session_count + 1,
            playing_hours: Number((currentJob.playing_hours + durationMinutes / 60).toFixed(1)),
          })
          .eq('id', formData.string_job_id);
      }
    }

    // Refetch to get joined racket + string_job data
    await fetchSessions();
    return session;
  }

  // Delete a session
  async function deleteSession(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('sessions').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setSessions(prev => prev.filter(s => s.id !== id));
  }

  return { sessions, loading, error, addSession, deleteSession, refetch: fetchSessions };
}
