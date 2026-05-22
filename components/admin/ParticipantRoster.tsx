'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPhoneDisplay } from '@/lib/phone';
import type { EventRegistration } from '@/lib/types';

function whatsappForEdit(normalized: string) {
  if (normalized.startsWith('62')) return `0${normalized.slice(2)}`;
  return normalized;
}

export function ParticipantRoster({
  rows,
  setRows,
  onReload,
}: {
  rows: EventRegistration[];
  setRows: React.Dispatch<React.SetStateAction<EventRegistration[]>>;
  onReload: () => Promise<void>;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.full_name.toLowerCase().includes(q) ||
        r.whatsapp_normalized.includes(q.replace(/\D/g, '')) ||
        (r.student_id ?? '').toLowerCase().includes(q) ||
        (r.email ?? '').toLowerCase().includes(q)
    );
  }, [rows, search]);

  const runSearch = async () => {
    setLoadingSearch(true);
    setError('');
    const res = await fetch(
      `/api/admin/registrations?search=${encodeURIComponent(search.trim())}`
    );
    const data = await res.json().catch(() => ({}));
    setLoadingSearch(false);
    if (!res.ok) {
      setError((data as { error?: string }).error ?? 'Search failed');
      return;
    }
    if (data.registrations) setRows(data.registrations);
  };

  const saveEdit = async (id: string, form: FormData) => {
    setError('');
    const res = await fetch(`/api/admin/registrations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: form.get('full_name'),
        whatsapp: form.get('whatsapp'),
        student_id: form.get('student_id') || null,
        study_program: form.get('study_program') || null,
        email: form.get('email') || null,
        commit_attendance: form.get('commit_attendance') || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError((data as { error?: string }).error ?? 'Update failed');
      return;
    }
    const updated = (data as { registration?: EventRegistration }).registration;
    if (updated) {
      setRows((prev) => prev.map((x) => (x.id === id ? updated : x)));
    }
    setEditingId(null);
    router.refresh();
    await onReload();
  };

  const remove = async (r: EventRegistration) => {
    if (
      !confirm(
        `Remove ${r.full_name} from the registration list? They will not be able to WhatsApp-login until re-added.`
      )
    ) {
      return;
    }
    setError('');
    const res = await fetch(`/api/admin/registrations/${r.id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError((data as { error?: string }).error ?? 'Delete failed');
      return;
    }
    setRows((prev) => prev.filter((x) => x.id !== r.id));
    router.refresh();
    await onReload();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="font-display text-[10px] text-text-secondary">SEARCH</label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, phone, student ID, email"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), runSearch())}
          />
        </div>
        <Button type="button" variant="outline" onClick={runSearch} disabled={loadingSearch}>
          {loadingSearch ? '…' : 'SEARCH DB'}
        </Button>
      </div>

      {error && <p className="font-semibold text-accent-red">{error}</p>}

      <p className="font-body text-xs text-text-on-bg-muted">
        Showing {filtered.length} of {rows.length} (max 500 per load)
      </p>

      {filtered.length === 0 ? (
        <Card>
          <p className="font-body text-sm text-text-on-surface">No participants match.</p>
        </Card>
      ) : (
        <div className="space-y-2 max-h-[32rem] overflow-y-auto pr-1">
          {filtered.map((r) => (
            <Card key={r.id}>
              {editingId === r.id ? (
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveEdit(r.id, new FormData(e.currentTarget));
                  }}
                >
                  <div>
                    <label className="font-display text-[10px] text-text-secondary">NAME</label>
                    <Input name="full_name" defaultValue={r.full_name} required />
                  </div>
                  <div>
                    <label className="font-display text-[10px] text-text-secondary">WHATSAPP</label>
                    <Input
                      name="whatsapp"
                      defaultValue={whatsappForEdit(r.whatsapp_normalized)}
                      required
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <label className="font-display text-[10px] text-text-secondary">
                        STUDENT ID
                      </label>
                      <Input name="student_id" defaultValue={r.student_id ?? ''} />
                    </div>
                    <div>
                      <label className="font-display text-[10px] text-text-secondary">
                        PROGRAM
                      </label>
                      <Input name="study_program" defaultValue={r.study_program ?? ''} />
                    </div>
                  </div>
                  <div>
                    <label className="font-display text-[10px] text-text-secondary">EMAIL</label>
                    <Input name="email" type="email" defaultValue={r.email ?? ''} />
                  </div>
                  <div>
                    <label className="font-display text-[10px] text-text-secondary">COMMIT</label>
                    <Input name="commit_attendance" defaultValue={r.commit_attendance ?? ''} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      SAVE
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      CANCEL
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                  <div>
                    <p className="font-display text-sm font-bold text-text-on-surface">
                      {r.full_name}
                    </p>
                    <p className="font-body text-xs text-text-secondary">
                      {formatPhoneDisplay(r.whatsapp_normalized)}
                      {r.student_id ? ` · ${r.student_id}` : ''}
                    </p>
                    {r.study_program && (
                      <p className="font-body text-xs text-text-secondary">{r.study_program}</p>
                    )}
                    <p className="mt-1 font-display text-[9px]">
                      {r.user_id ? (
                        <span className="text-accent-green">APP LINKED</span>
                      ) : (
                        <span className="text-accent-yellow">NOT LOGGED IN YET</span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(r.id)}>
                      EDIT
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => remove(r)}>
                      DELETE
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
