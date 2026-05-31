import { createClient } from '@/lib/supabase/server';
import { formatDate, getStatusColor, getBreakLocationLabel, cn } from '@/lib/utils';
import { Wrench } from 'lucide-react';
import Link from 'next/link';
import type { Racket } from '@/types';

const DEMO_USER_ID = 'bd6e2632-4f9d-4d46-b3d0-1ea49d8e307e';

export default async function DemoStringJobsPage() {
  const supabase = await createClient();
  const { data: stringJobs } = await supabase
    .from('string_jobs')
    .select('*, racket:rackets(*)')
    .eq('user_id', DEMO_USER_ID)
    .order('stringing_date', { ascending: false });

  const allJobs = stringJobs ?? [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">String Jobs</h1>
        <p className="text-muted-foreground mt-1">{allJobs.length} string job{allJobs.length !== 1 ? 's' : ''} in this demo account</p>
      </div>

      {allJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Wrench className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-foreground">No string jobs yet</p>
          <p className="text-muted-foreground text-sm mt-1">Demo data hasn't been added yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allJobs.map(job => (
            <div key={job.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground">
                      {job.string_brand ? `${job.string_brand} ` : ''}{job.string_model}
                    </p>
                    {job.string_color && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {job.string_color}
                      </span>
                    )}
                    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize', getStatusColor(job.status))}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(job.racket as Racket | undefined)?.name ?? '—'} · Strung {formatDate(job.stringing_date)}
                    {job.tension_main ? ` · ${job.tension_main}${job.tension_cross ? `/${job.tension_cross}` : ''} lbs` : ''}
                    {job.cost ? ` · $${job.cost}` : ''}
                  </p>
                  {job.break_location && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Break: {getBreakLocationLabel(job.break_location)}
                    </p>
                  )}
                  {job.notes && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{job.notes}</p>
                  )}
                </div>
                <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2 shrink-0">
                  <div className="text-center sm:text-right">
                    <p className="text-lg font-bold text-foreground">{job.session_count}</p>
                    <p className="text-xs text-muted-foreground">sessions</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-lg font-bold text-foreground">{job.playing_hours}h</p>
                    <p className="text-xs text-muted-foreground">played</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
        <p className="font-semibold text-foreground text-sm">Track your own restrings</p>
        <p className="text-xs text-muted-foreground mt-1 mb-3">Log every restring, track string lifespan, and find out which strings last longest for you.</p>
        <Link href="/login" className="inline-flex px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
          Get started →
        </Link>
      </div>
    </div>
  );
}
