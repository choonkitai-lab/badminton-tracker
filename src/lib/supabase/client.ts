// ============================================================
// Supabase browser client
// ============================================================
// This file creates a Supabase client that runs in the browser
// (inside React components and hooks). It reads the URL and
// API key from environment variables you set in .env.local.
// ============================================================

import { createBrowserClient } from '@supabase/ssr';
import type { Racket, StringJob, Session } from '@/types';

// This type tells TypeScript the shape of our database tables.
// It enables autocomplete and type checking for Supabase queries.
export type Database = {
  public: {
    Tables: {
      rackets: {
        Row: Racket;
        Insert: Omit<Racket, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Racket, 'id' | 'created_at' | 'updated_at'>>;
      };
      string_jobs: {
        Row: StringJob;
        Insert: Omit<StringJob, 'id' | 'created_at' | 'updated_at' | 'racket'>;
        Update: Partial<Omit<StringJob, 'id' | 'created_at' | 'updated_at' | 'racket'>>;
      };
      sessions: {
        Row: Session;
        Insert: Omit<Session, 'id' | 'created_at' | 'racket' | 'string_job'>;
        Update: Partial<Omit<Session, 'id' | 'created_at' | 'racket' | 'string_job'>>;
      };
    };
  };
};

// Call this function to get a Supabase client inside client components.
// The '!' at the end of each env var tells TypeScript "trust me, this is set".
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
