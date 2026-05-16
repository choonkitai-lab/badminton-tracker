// ============================================================
// Supabase server-side client
// Used in middleware and server components (not in 'use client' files).
// ============================================================

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './client';

export async function createClient() {
  // cookies() is async in Next.js 16
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — cookies can't be set here.
            // The middleware handles cookie refresh instead.
          }
        },
      },
    },
  );
}
