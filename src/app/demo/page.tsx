import { createClient } from '@/lib/supabase/server';
import { formatDate, getStatusColor, cn } from '@/lib/utils';
import { Dumbbell, Wrench, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Racket } from '@/types';

const DEMO_USER_ID = 'bd6e2632-4f9d-4d46-b3d0-1ea49d8e307e';

export default async function DemoDashboard() {
  const supabase = await createClient();

  const [{ data: rackets }, { data: stringJobs }, { data: sessions }] = await Promise.all([
    supabase.from('rackets').select('*').eq('user_id', DEMO_USER_ID),
    supabase.from('string_jobs').select('*, racket:rackets(name)').eq('user_id', DEMO_USER_ID)
      .order('stringing_date', { ascending: false }).limit(8),
    supabase.from('sessions').select('*').eq('user_id', DEMO_USER_ID)
      .order('session_date', { ascending: false }).limit(5),
  ]);

  const allRackets  = rackets    ?? [];
  const allJobs     = stringJobs ?? [];
  const allSessions = sessions   ?? [];

  const activeRackets = allRackets.filter(r => r.status === 'active').length;
  const activeStrings = allJobs.filter(j => j.status === 'active').length;
  const finishedJobs  = allJobs.filter(j => j.status !== 'active');
  const avgHours = finishedJobs.length > 0
    ? Math.round(finishedJobs.reduce((s, j) => s + j.playing_hours, 0) / finishedJobs.length)
    : 0;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Demo account overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Rackets" value={activeRackets} sub={`${allRackets.length} total`}
          icon={Dumbbell} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
        />
        <StatCard
          label="Active Strings" value={activeStrings} sub={`${allJobs.length} total jobs`}
          icon={Wrench} color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          label="Avg String Life" value={avgHours > 0 ? `${avgHours}h` : '—'}
          sub={finishedJobs.length > 0 ? `over ${finishedJobs.length} finished jobs` : 'No data yet'}
          icon={TrendingUp} color="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        />
        <StatCard
          label="Sessions Logged" value={allSessions.length} sub="logged sessions"
          icon={Calendar} color="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
        />
      </div>

      {/* Recent string jobs */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent String Jobs</h2>
          <Link href="/demo/string-jobs" className="flex items-center gap-1 text-sm text-primary hover:underline">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {allJobs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No string jobs yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {allJobs.slice(0, 5).map(job => (
              <div key={job.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {job.string_model}
                    {job.string_brand && (
                      <span className="text-muted-foreground font-normal"> · {job.string_brand}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(job.racket as Racket | undefined)?.name ?? '—'} ·{' '}
                    {job.tension_main ? `${job.tension_main}lbs` : '—'} ·{' '}
                    {formatDate(job.stringing_date)}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground">{job.session_count} sessions</p>
                    <p className="text-xs text-muted-foreground">{job.playing_hours}h played</p>
                  </div>
                  <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize', getStatusColor(job.status))}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
        <p className="font-semibold text-foreground">Ready to track your own strings?</p>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Create a free account and start logging your rackets, restrings, and sessions.
        </p>
        <Link
          href="/login"
          className="inline-flex px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Get started free →
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
      <div className={cn('p-2.5 rounded-lg shrink-0', color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
