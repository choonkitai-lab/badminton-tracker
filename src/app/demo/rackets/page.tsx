import { createClient } from '@/lib/supabase/server';
import { formatDate, cn } from '@/lib/utils';
import { Dumbbell } from 'lucide-react';
import Link from 'next/link';

const DEMO_USER_ID = 'bd6e2632-4f9d-4d46-b3d0-1ea49d8e307e';

export default async function DemoRacketsPage() {
  const supabase = await createClient();
  const { data: rackets } = await supabase
    .from('rackets')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .order('created_at', { ascending: false });

  const allRackets = rackets ?? [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rackets</h1>
        <p className="text-muted-foreground mt-1">{allRackets.length} racket{allRackets.length !== 1 ? 's' : ''} in this demo account</p>
      </div>

      {allRackets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Dumbbell className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-foreground">No rackets yet</p>
          <p className="text-muted-foreground text-sm mt-1">Demo data hasn't been added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allRackets.map(racket => (
            <div key={racket.id} className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{racket.name}</p>
                  {(racket.brand || racket.model) && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {[racket.brand, racket.model].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize shrink-0',
                  racket.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
                )}>
                  {racket.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {racket.weight_class && (
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md font-medium">
                    {racket.weight_class}
                  </span>
                )}
                <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md">
                  Added {formatDate(racket.created_at)}
                </span>
              </div>

              {racket.notes && (
                <p className="text-xs text-muted-foreground line-clamp-2">{racket.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
        <p className="font-semibold text-foreground text-sm">Track your own rackets</p>
        <p className="text-xs text-muted-foreground mt-1 mb-3">Sign up free to add your rackets, log restrings, and track string lifespan.</p>
        <Link href="/login" className="inline-flex px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
          Get started →
        </Link>
      </div>
    </div>
  );
}
