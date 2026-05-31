'use client';

import { useState } from 'react';
import { Plus, Dumbbell, Pencil, Trash2, X } from 'lucide-react';
import { useRackets } from '@/hooks/use-rackets';
import { cn, formatDate } from '@/lib/utils';
import type { Racket, RacketFormData, WeightClass } from '@/types';

// ── Blank form ────────────────────────────────────────────────
const EMPTY_FORM: RacketFormData = {
  name: '',
  brand: '',
  model: '',
  weight_class: '',
  notes: '',
  status: 'active',
};

// ── Small badge for racket status ─────────────────────────────
function RacketStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize',
        status === 'active'
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
      )}
    >
      {status}
    </span>
  );
}

// ── Modal dialog ──────────────────────────────────────────────
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* Panel */}
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Form field helper ─────────────────────────────────────────
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';

// ── Add / Edit form ───────────────────────────────────────────
function RacketForm({
  initial,
  onSubmit,
  onClose,
  saving,
}: {
  initial: RacketFormData;
  onSubmit: (data: RacketFormData) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<RacketFormData>(initial);

  function set(key: keyof RacketFormData, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Racket Name" required>
        <input
          className={inputClass}
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="e.g. My Astrox 99"
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Brand">
          <input
            className={inputClass}
            value={form.brand}
            onChange={e => set('brand', e.target.value)}
            placeholder="Yonex"
          />
        </Field>
        <Field label="Model">
          <input
            className={inputClass}
            value={form.model}
            onChange={e => set('model', e.target.value)}
            placeholder="Astrox 99"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Weight Class">
          <select
            className={inputClass}
            value={form.weight_class}
            onChange={e => set('weight_class', e.target.value as WeightClass | '')}
          >
            <option value="">Select…</option>
            {(['U', '3U', '4U', '5U', 'F'] as const).map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            className={inputClass}
            value={form.status}
            onChange={e => set('status', e.target.value as 'active' | 'inactive')}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          className={cn(inputClass, 'min-h-[72px] resize-none')}
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Any notes about this racket…"
        />
      </Field>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Racket'}
        </button>
      </div>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function RacketsPage() {
  const { rackets, loading, error, addRacket, updateRacket, deleteRacket } = useRackets();

  const [showAdd, setShowAdd]           = useState(false);
  const [editing, setEditing]           = useState<Racket | null>(null);
  const [deleting, setDeleting]         = useState<Racket | null>(null);
  const [saving, setSaving]             = useState(false);
  const [formError, setFormError]       = useState('');

  // ── Handlers ──────────────────────────────────────────────
  async function handleAdd(data: RacketFormData) {
    try {
      setSaving(true);
      setFormError('');
      await addRacket(data);
      setShowAdd(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error saving racket';
      console.error('[handleAdd] error:', msg);
      setFormError(msg);
      alert('Save failed: ' + msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(data: RacketFormData) {
    if (!editing) return;
    try {
      setSaving(true);
      setFormError('');
      await updateRacket(editing.id, data);
      setEditing(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error updating racket');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteRacket(deleting.id);
      setDeleting(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting racket');
    }
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rackets</h1>
          <p className="text-muted-foreground mt-1">Manage your badminton rackets</p>
        </div>
        <button
          onClick={() => { setFormError(''); setShowAdd(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Racket
        </button>
      </div>

      {/* Loading / error states */}
      {loading && (
        <div className="text-muted-foreground text-center py-12">Loading rackets…</div>
      )}
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">{error}</div>
      )}

      {/* Empty state */}
      {!loading && !error && rackets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Dumbbell className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-foreground">No rackets yet</p>
          <p className="text-muted-foreground text-sm mt-1 mb-4">
            Add your first racket to start tracking string jobs.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Add Racket
          </button>
        </div>
      )}

      {/* Racket grid */}
      {!loading && rackets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rackets.map(racket => (
            <div
              key={racket.id}
              className="bg-card border border-border rounded-xl p-5 space-y-4 hover:shadow-sm transition-shadow"
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{racket.name}</p>
                  {(racket.brand || racket.model) && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {[racket.brand, racket.model].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <RacketStatusBadge status={racket.status} />
              </div>

              {/* Details */}
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

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setFormError(''); setEditing(racket); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeleting(racket)}
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
        <Modal title="Add Racket" onClose={() => setShowAdd(false)}>
          {formError && (
            <p className="mb-4 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
              {formError}
            </p>
          )}
          <RacketForm
            initial={EMPTY_FORM}
            onSubmit={handleAdd}
            onClose={() => setShowAdd(false)}
            saving={saving}
          />
        </Modal>
      )}

      {/* Edit modal */}
      {editing && (
        <Modal title="Edit Racket" onClose={() => setEditing(null)}>
          {formError && (
            <p className="mb-4 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
              {formError}
            </p>
          )}
          <RacketForm
            initial={{
              name: editing.name,
              brand: editing.brand ?? '',
              model: editing.model ?? '',
              weight_class: editing.weight_class ?? '',
              notes: editing.notes ?? '',
              status: editing.status,
            }}
            onSubmit={handleEdit}
            onClose={() => setEditing(null)}
            saving={saving}
          />
        </Modal>
      )}

      {/* Delete confirm */}
      {deleting && (
        <Modal title="Delete Racket" onClose={() => setDeleting(null)}>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">{deleting.name}</span>?{' '}
            All string jobs linked to this racket will also be deleted. This cannot be undone.
          </p>
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setDeleting(null)}
              className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
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
