'use client';

import { useState, useMemo } from 'react';
import { Plus, Timer, Trash2, X, Star } from 'lucide-react';
import { useSessions } from '@/hooks/use-sessions';
import { useRackets } from '@/hooks/use-rackets';
import { useStringJobs } from '@/hooks/use-string-jobs';
import { cn, formatDate, formatDuration, todayISO } from '@/lib/utils';
import type { SessionFormData } from '@/types';

const EMPTY_FORM: SessionFormData = {
  racket_id: '',
  string_job_id: '',
  session_date: todayISO(),
  duration_minutes: '90',
  notes: '',
  repulsion_rating: '',
  control_rating: '',
  sound_rating: '',
  durability_feeling: '',
  overall_feeling: '',
};

// ── Modal ─────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';

// ── Star rating input (1–5) ───────────────────────────────────
function StarRating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const num = parseInt(value) || 0;
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(num === i ? '' : String(i))}
            className={cn(
              'h-7 w-7 rounded text-sm transition-colors',
              i <= num
                ? 'text-amber-500'
                : 'text-muted-foreground/30 hover:text-amber-400',
            )}
          >
            <Star className={cn('h-5 w-5', i <= num && 'fill-current')} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Session log form ──────────────────────────────────────────
function SessionForm({
  rackets,
  stringJobs,
  onSubmit,
  onClose,
  saving,
}: {
  rackets: { id: string; name: string }[];
  stringJobs: { id: string; string_model: string; racket_id: string; status: string }[];
  onSubmit: (data: SessionFormData) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<SessionFormData>(EMPTY_FORM);
  function set(key: keyof SessionFormData, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  // Only show active string jobs for the selected racket
  const availableJobs = useMemo(
    () => stringJobs.filter(j => j.racket_id === form.racket_id && j.status === 'active'),
    [stringJobs, form.racket_id],
  );

  // Auto-select the only active job if there is one
  function handleRacketChange(racketId: string) {
    const jobs = stringJobs.filter(j => j.racket_id === racketId && j.status === 'active');
    setForm(prev => ({
      ...prev,
      racket_id: racketId,
      string_job_id: jobs.length === 1 ? jobs[0].id : '',
    }));
  }

  return (
    <form onSubmit={async e => { e.preventDefault(); await onSubmit(form); }} className="space-y-4">
      {/* Racket */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Racket <span className="text-destructive">*</span></label>
          <select className={inputClass} value={form.racket_id} onChange={e => handleRacketChange(e.target.value)} required>
            <option value="">Select…</option>
            {rackets.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">String Job</label>
          <select className={inputClass} value={form.string_job_id} onChange={e => set('string_job_id', e.target.value)} disabled={!form.racket_id}>
            <option value="">None / not tracked</option>
            {availableJobs.map(j => <option key={j.id} value={j.id}>{j.string_model}</option>)}
          </select>
        </div>
      </div>

      {/* Date + duration */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Date <span className="text-destructive">*</span></label>
          <input type="date" className={inputClass} value={form.session_date} onChange={e => set('session_date', e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Duration (minutes) <span className="text-destructive">*</span></label>
          <input type="number" className={inputClass} value={form.duration_minutes} onChange={e => set('duration_minutes', e.target.value)} min="1" max="720" required />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">Notes</label>
        <textarea className={cn(inputClass, 'min-h-[56px] resize-none')} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="How was the session?" />
      </div>

      {/* Feel ratings */}
      <div className="space-y-3 pt-1">
        <p className="text-sm font-medium text-foreground">Feel Ratings <span className="text-muted-foreground font-normal">(optional)</span></p>
        <div className="grid grid-cols-2 gap-3">
          <StarRating label="Repulsion"      value={form.repulsion_rating}    onChange={v => set('repulsion_rating', v)} />
          <StarRating label="Control"        value={form.control_rating}      onChange={v => set('control_rating', v)} />
          <StarRating label="Sound"          value={form.sound_rating}        onChange={v => set('sound_rating', v)} />
          <StarRating label="Durability Feel" value={form.durability_feeling} onChange={v => set('durability_feeling', v)} />
          <StarRating label="Overall Feel"   value={form.overall_feeling}     onChange={v => set('overall_feeling', v)} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {saving ? 'Logging…' : 'Log Session'}
        </button>
      </div>
    </form>
  );
}

// ── Rating dots display ───────────────────────────────────────
function RatingDots({ value }: { value: number | null }) {
  if (!value) return <span className="text-muted-foreground/40">—</span>;
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={cn('h-1.5 w-1.5 rounded-full', i <= value ? 'bg-amber-500' : 'bg-muted-foreground/20')} />
      ))}
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function SessionsPage() {
  const { sessions, loading, error, addSession, deleteSession } = useSessions();
  const { rackets } = useRackets();
  const { stringJobs } = useStringJobs();

  const [showAdd, setShowAdd]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [formError, setFormError] = useState('');

  // Total hours played
  const totalHours = (sessions.reduce((s, se) => s + se.duration_minutes, 0) / 60).toFixed(1);

  async function handleAdd(data: SessionFormData) {
    try {
      setSaving(true);
      setFormError('');
      await addSession(data);
      setShowAdd(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error logging session');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sessions</h1>
          <p className="text-muted-foreground mt-1">
            {sessions.length} sessions · {totalHours}h total
          </p>
        </div>
        <button
          onClick={() => { setFormError(''); setShowAdd(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Log Session
        </button>
      </div>

      {loading && <div className="text-muted-foreground text-center py-12">Loading…</div>}
      {error && <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">{error}</div>}

      {!loading && sessions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Timer className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-foreground">No sessions logged yet</p>
          <p className="text-muted-foreground text-sm mt-1 mb-4">
            Log your first session to start tracking playing time.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Log Session
          </button>
        </div>
      )}

      {/* Session list */}
      {!loading && sessions.length > 0 && (
        <div className="space-y-3">
          {sessions.map(session => (
            <div key={session.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground">{session.racket?.name ?? '—'}</p>
                    <span className="text-muted-foreground text-sm">·</span>
                    <p className="text-sm text-muted-foreground">{formatDate(session.session_date)}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                    <span>{formatDuration(session.duration_minutes)}</span>
                    {session.string_job && (
                      <span>String: {session.string_job.string_model}</span>
                    )}
                  </div>
                  {session.notes && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{session.notes}</p>
                  )}
                  {/* Ratings row */}
                  {(session.repulsion_rating || session.control_rating || session.sound_rating || session.overall_feeling) && (
                    <div className="flex gap-4 mt-3 flex-wrap">
                      {session.repulsion_rating  && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span>Repulsion</span><RatingDots value={session.repulsion_rating} /></div>}
                      {session.control_rating    && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span>Control</span><RatingDots value={session.control_rating} /></div>}
                      {session.sound_rating      && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span>Sound</span><RatingDots value={session.sound_rating} /></div>}
                      {session.overall_feeling   && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span>Overall</span><RatingDots value={session.overall_feeling} /></div>}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setDeleting(session.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <Modal title="Log Session" onClose={() => setShowAdd(false)}>
          {formError && <p className="mb-4 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{formError}</p>}
          <SessionForm
            rackets={rackets}
            stringJobs={stringJobs}
            onSubmit={handleAdd}
            onClose={() => setShowAdd(false)}
            saving={saving}
          />
        </Modal>
      )}

      {/* Delete confirm */}
      {deleting && (
        <Modal title="Delete Session" onClose={() => setDeleting(null)}>
          <p className="text-sm text-muted-foreground">
            Are you sure? This will not adjust the string job&apos;s session counter.
          </p>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setDeleting(null)} className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
            <button
              onClick={async () => { await deleteSession(deleting); setDeleting(null); }}
              className="flex-1 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 transition-colors"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
