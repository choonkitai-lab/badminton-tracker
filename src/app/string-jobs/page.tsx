'use client';

import { useState, useMemo } from 'react';
import { Plus, Wrench, Pencil, Trash2, X, CheckCircle2, Scissors } from 'lucide-react';
import { useStringJobs } from '@/hooks/use-string-jobs';
import { useRackets } from '@/hooks/use-rackets';
import { cn, formatDate, getStatusColor, getBreakLocationLabel, todayISO } from '@/lib/utils';
import type { StringJob, StringJobFormData, StringJobStatus, BreakLocation } from '@/types';

// ── Blank form ────────────────────────────────────────────────
const EMPTY_FORM: StringJobFormData = {
  racket_id: '',
  string_model: '',
  string_brand: '',
  string_color: '',
  tension_main: '',
  tension_cross: '',
  stringing_date: todayISO(),
  cost: '',
  notes: '',
};

// Filter tabs
const FILTERS: { key: StringJobStatus | 'all'; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'active',   label: 'Active' },
  { key: 'broken',   label: 'Broken' },
  { key: 'cut',      label: 'Cut' },
  { key: 'restrung', label: 'Restrung' },
];

// ── Reusable Modal ────────────────────────────────────────────
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

// ── String job form ───────────────────────────────────────────
function StringJobForm({
  initial,
  rackets,
  onSubmit,
  onClose,
  saving,
}: {
  initial: StringJobFormData;
  rackets: { id: string; name: string }[];
  onSubmit: (data: StringJobFormData) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<StringJobFormData>(initial);
  function set(key: keyof StringJobFormData, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  return (
    <form
      onSubmit={async e => { e.preventDefault(); await onSubmit(form); }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">
          Racket <span className="text-destructive">*</span>
        </label>
        <select className={inputClass} value={form.racket_id} onChange={e => set('racket_id', e.target.value)} required>
          <option value="">Select a racket…</option>
          {rackets.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">String Brand</label>
          <input className={inputClass} value={form.string_brand} onChange={e => set('string_brand', e.target.value)} placeholder="Yonex" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">String Model <span className="text-destructive">*</span></label>
          <input className={inputClass} value={form.string_model} onChange={e => set('string_model', e.target.value)} placeholder="BG80" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">String Color</label>
          <input className={inputClass} value={form.string_color} onChange={e => set('string_color', e.target.value)} placeholder="White" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Stringing Date <span className="text-destructive">*</span></label>
          <input type="date" className={inputClass} value={form.stringing_date} onChange={e => set('stringing_date', e.target.value)} required />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Main (lbs)</label>
          <input type="number" className={inputClass} value={form.tension_main} onChange={e => set('tension_main', e.target.value)} placeholder="26" min="18" max="35" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Cross (lbs)</label>
          <input type="number" className={inputClass} value={form.tension_cross} onChange={e => set('tension_cross', e.target.value)} placeholder="24" min="18" max="35" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Cost ($)</label>
          <input type="number" className={inputClass} value={form.cost} onChange={e => set('cost', e.target.value)} placeholder="15.00" step="0.01" min="0" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">Notes</label>
        <textarea className={cn(inputClass, 'min-h-[64px] resize-none')} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes…" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {saving ? 'Saving…' : 'Save String Job'}
        </button>
      </div>
    </form>
  );
}

// ── Status update form ────────────────────────────────────────
function UpdateStatusForm({
  job,
  onSubmit,
  onClose,
}: {
  job: StringJob;
  onSubmit: (status: StringJobStatus, breakLocation?: BreakLocation) => Promise<void>;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<StringJobStatus>('broken');
  const [breakLocation, setBreakLocation] = useState<BreakLocation>('sweet_spot');
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Update the status for <strong className="text-foreground">{job.string_model}</strong>.
      </p>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">New Status</label>
        <select
          className={inputClass}
          value={status}
          onChange={e => setStatus(e.target.value as StringJobStatus)}
        >
          <option value="broken">Broken</option>
          <option value="cut">Cut (manually removed)</option>
          <option value="restrung">Restrung (replaced)</option>
        </select>
      </div>

      {status === 'broken' && (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Break Location</label>
          <select
            className={inputClass}
            value={breakLocation}
            onChange={e => setBreakLocation(e.target.value as BreakLocation)}
          >
            <option value="sweet_spot">Sweet spot</option>
            <option value="vertical">Vertical string</option>
            <option value="horizontal">Horizontal string</option>
            <option value="edge">Edge / Frame</option>
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
        <button
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onSubmit(status, status === 'broken' ? breakLocation : undefined);
            setSaving(false);
          }}
          className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Update Status'}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function StringJobsPage() {
  const { rackets } = useRackets();
  const { stringJobs, loading, error, addStringJob, updateStatus, deleteStringJob } = useStringJobs();

  const [filter, setFilter] = useState<StringJobStatus | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<StringJob | null>(null);
  const [deleting, setDeleting] = useState<StringJob | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const filtered = useMemo(
    () => filter === 'all' ? stringJobs : stringJobs.filter(j => j.status === filter),
    [stringJobs, filter],
  );

  async function handleAdd(data: StringJobFormData) {
    try {
      setSaving(true);
      setFormError('');
      await addStringJob(data);
      setShowAdd(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error saving');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateStatus(status: StringJobStatus, breakLocation?: BreakLocation) {
    if (!updatingStatus) return;
    await updateStatus(updatingStatus.id, status, breakLocation);
    setUpdatingStatus(null);
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">String Jobs</h1>
          <p className="text-muted-foreground mt-1">Track every restring across your rackets</p>
        </div>
        <button
          onClick={() => { setFormError(''); setShowAdd(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add String Job
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit flex-wrap">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              filter === key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
            <span className="ml-1.5 text-xs opacity-60">
              {key === 'all' ? stringJobs.length : stringJobs.filter(j => j.status === key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Loading / error */}
      {loading && <div className="text-muted-foreground text-center py-12">Loading…</div>}
      {error && <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">{error}</div>}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Wrench className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-foreground">No string jobs found</p>
          <p className="text-muted-foreground text-sm mt-1 mb-4">
            {filter === 'all' ? 'Record your first restring to begin tracking.' : `No ${filter} string jobs.`}
          </p>
        </div>
      )}

      {/* String job list */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(job => (
            <div
              key={job.id}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Left: string info */}
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
                    {job.racket?.name ?? '—'} · Strung {formatDate(job.stringing_date)}
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

                {/* Right: stats + actions */}
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

              {/* Action buttons */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-border flex-wrap">
                {job.status === 'active' && (
                  <button
                    onClick={() => setUpdatingStatus(job)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark Finished
                  </button>
                )}
                <button
                  onClick={() => setDeleting(job)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors ml-auto"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <Modal title="Add String Job" onClose={() => setShowAdd(false)}>
          {formError && <p className="mb-4 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{formError}</p>}
          <StringJobForm
            initial={EMPTY_FORM}
            rackets={rackets}
            onSubmit={handleAdd}
            onClose={() => setShowAdd(false)}
            saving={saving}
          />
        </Modal>
      )}

      {/* Update status modal */}
      {updatingStatus && (
        <Modal title="Update String Status" onClose={() => setUpdatingStatus(null)}>
          <UpdateStatusForm
            job={updatingStatus}
            onSubmit={handleUpdateStatus}
            onClose={() => setUpdatingStatus(null)}
          />
        </Modal>
      )}

      {/* Delete confirm */}
      {deleting && (
        <Modal title="Delete String Job" onClose={() => setDeleting(null)}>
          <p className="text-sm text-muted-foreground">
            Delete the string job for{' '}
            <strong className="text-foreground">{deleting.string_model}</strong> on{' '}
            <strong className="text-foreground">{deleting.racket?.name}</strong>? This cannot be undone.
          </p>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setDeleting(null)} className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
            <button
              onClick={async () => {
                await deleteStringJob(deleting.id);
                setDeleting(null);
              }}
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
