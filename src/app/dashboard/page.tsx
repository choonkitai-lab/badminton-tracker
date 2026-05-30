'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Dumbbell,
  Wrench,
  Clock,
  Calendar,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDate, formatDuration, getStatusColor, cn } from '@/lib/utils';
import type { Racket, StringJob, Session } from '@/types';

// ── Small stat card ──────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
      <div className={cn('p-2.5 rounded-lg', color)}>
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

// ── Status badge ─────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize',
        getStatusColor(status as never),
      )}
    >
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const [rackets, setRackets] = useState<Racket[]>([]);
  const [stringJobs, setStringJobs] = useState<StringJob[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const [{ data: r }, { data: sj }, { data: se }] = await Promise.all([
          supabase.from('rackets').select('*'),
          supabase.from('string_jobs').select('*, racket:rackets(name)').order('stringing_date', { ascending: false }).limit(8),
          supabase.from('sessions').select('*').order('session_date', { ascending: false }).limit(5),
        ]);
        setRackets(r ?? []);
        setStringJobs(sj ?? []);
        setSessions(se ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Derived stats
  const activeRackets  = rackets.filter(r => r.status === 'active').length;
  const activeStrings  = stringJobs.filter(j => j.status === 'active').length;
  const finishedJobs   = stringJobs.filter(j => j.status !== 'active');
  const avgHours       =
    finishedJobs.length > 0
      ? Math.round(finishedJobs.reduce((s, j) => s + j.playing_hours, 0) / finishedJobs.length)
      : 0;
  const totalSessions  = sessions.length;

  // 5 most recently restrung rackets
  const recentJobs = stringJobs.slice(0, 5);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Your badminton string tracking overview
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Rackets"
          value={activeRackets}
          sub={`${rackets.length} total`}
          icon={Dumbbell}
          color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
        />
        <StatCard
          label="Active Strings"
          value={activeStrings}
          sub={`${stringJobs.length} total jobs`}
          icon={Wrench}
          color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          label="Avg String Life"
          value={avgHours > 0 ? `${avgHours}h` : '—'}
          sub={finishedJobs.length > 0 ? `over ${finishedJobs.length} finished jobs` : 'No data yet'}
          icon={TrendingUp}
          color="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        />
        <StatCard
          label="Sessions Logged"
          value={totalSessions}
          sub="last 100 sessions"
          icon={Calendar}
          color="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
        />
      </div>

      {/* Recent string jobs */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent String Jobs</h2>
          <Link
            href="/string-jobs"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {recentJobs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Wrench className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No string jobs yet.</p>
            <Link href="/string-jobs" className="text-primary hover:underline text-sm mt-1 inline-block">
              Add your first string job →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentJobs.map(job => (
              <div
                key={job.id}
                className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors"
              >
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
                <div className="flex items-center gap-4 ml-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground">{job.session_count} sessions</p>
                    <p className="text-xs text-muted-foreground">{job.playing_hours}h played</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/rackets',     label: 'Manage Rackets',    icon: Dumbbell,  desc: 'Add or edit your rackets' },
          { href: '/string-jobs', label: 'Log a String Job',  icon: Wrench,    desc: 'Record a new restring' },
          { href: '/sessions',    label: 'Log a Session',     icon: Clock,     desc: 'Track playing time' },
        ].map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-sm transition-all group"
          >
            <div className="p-2 rounded-lg bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-sm text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
