'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn, average, round1, getStatusColor } from '@/lib/utils';
import type { StringJob } from '@/types';

// ── Stat summary card ─────────────────────────────────────────
function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// Custom tooltip for recharts bars
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-md text-sm">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">{round1(payload[0].value)} hours avg</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function StatisticsPage() {
  const [jobs, setJobs] = useState<StringJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from('string_jobs')
        .select('*')
        .order('stringing_date', { ascending: false });
      setJobs(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  // Only finished jobs have meaningful lifespan data
  const finishedJobs = useMemo(
    () => jobs.filter(j => j.status !== 'active' && j.playing_hours > 0),
    [jobs],
  );

  // ── Aggregate by string model ────────────────────────────────
  const byString = useMemo(() => {
    const map = new Map<string, number[]>();
    finishedJobs.forEach(j => {
      const key = j.string_brand ? `${j.string_brand} ${j.string_model}` : j.string_model;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(j.playing_hours);
    });
    return Array.from(map.entries())
      .map(([name, hours]) => ({ name, avg: average(hours), count: hours.length }))
      .sort((a, b) => b.avg - a.avg);
  }, [finishedJobs]);

  // ── Aggregate by tension ─────────────────────────────────────
  const byTension = useMemo(() => {
    const map = new Map<string, number[]>();
    finishedJobs.forEach(j => {
      if (!j.tension_main) return;
      const key = `${j.tension_main} lbs`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(j.playing_hours);
    });
    return Array.from(map.entries())
      .map(([tension, hours]) => ({ tension, avg: average(hours), count: hours.length }))
      .sort((a, b) => parseInt(a.tension) - parseInt(b.tension));
  }, [finishedJobs]);

  // ── Overall stats ────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalHours = finishedJobs.reduce((s, j) => s + j.playing_hours, 0);
    const totalCost  = finishedJobs.reduce((s, j) => s + (j.cost ?? 0), 0);
    const avgLife    = finishedJobs.length ? average(finishedJobs.map(j => j.playing_hours)) : 0;
    const avgSessions = finishedJobs.length ? average(finishedJobs.map(j => j.session_count)) : 0;
    const costPerHour = totalHours > 0 ? totalCost / totalHours : 0;
    const best = byString[0];
    return { avgLife, avgSessions, costPerHour, totalJobs: finishedJobs.length, best };
  }, [finishedJobs, byString]);

  const CHART_COLORS = ['#10b981', '#0d9488', '#0891b2', '#7c3aed', '#db2777', '#d97706'];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading statistics…</div>
      </div>
    );
  }

  if (finishedJobs.length === 0) {
    return (
      <div className="p-6 max-w-5xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Statistics</h1>
          <p className="text-muted-foreground mt-1">String performance analytics</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-foreground">No data yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Statistics appear once you mark a string job as finished (broken / cut / restrung).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Statistics</h1>
        <p className="text-muted-foreground mt-1">
          Based on {stats.totalJobs} finished string job{stats.totalJobs !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Avg String Life"
          value={`${round1(stats.avgLife)}h`}
          sub="across finished jobs"
        />
        <SummaryCard
          label="Avg Sessions / String"
          value={round1(stats.avgSessions)}
          sub="before breaking"
        />
        <SummaryCard
          label="Cost per Hour"
          value={stats.costPerHour > 0 ? `$${round1(stats.costPerHour)}` : '—'}
          sub="based on jobs with cost"
        />
        <SummaryCard
          label="Most Durable String"
          value={stats.best?.name ?? '—'}
          sub={stats.best ? `${round1(stats.best.avg)}h avg` : undefined}
        />
      </div>

      {/* Durability by string model */}
      {byString.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Average Lifespan by String Model</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byString} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: 'var(--color-muted-foreground)' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                {byString.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Durability by tension */}
      {byTension.length > 1 && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Average Lifespan by Tension</h2>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byTension} margin={{ top: 4, right: 16, left: 0, bottom: 16 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="tension" tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} />
              <YAxis
                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: 'var(--color-muted-foreground)' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Comparison table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">String Comparison Table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">String</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Jobs</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Avg Hours</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Avg Sessions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {byString.map(row => (
                <tr key={row.name} className="hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium text-foreground">{row.name}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{row.count}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{round1(row.avg)}h</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {round1(
                      average(
                        finishedJobs
                          .filter(j => (j.string_brand ? `${j.string_brand} ${j.string_model}` : j.string_model) === row.name)
                          .map(j => j.session_count),
                      ),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
