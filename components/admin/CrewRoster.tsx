'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CREW_ASSIGNMENT_KINDS } from '@/lib/admin';
import type { AdminCrewMember, CrewAssignmentKind, Station } from '@/lib/types';

export function CrewRoster({
  members: initial,
  stations,
}: {
  members: AdminCrewMember[];
  stations: Station[];
}) {
  const router = useRouter();
  const [members, setMembers] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const startEdit = (m: AdminCrewMember) => {
    setEditingId(m.id);
    setError('');
  };

  const saveEdit = async (userId: string, form: FormData) => {
    setError('');
    const assignmentKind = form.get('assignment_kind') as CrewAssignmentKind;
    const stationId = form.get('station_id') as string;
    const res = await fetch(`/api/admin/crew/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: form.get('full_name'),
        app_role: form.get('app_role'),
        assignment_kind: assignmentKind,
        station_id: assignmentKind === 'station' && stationId ? stationId : null,
        assignment_label: form.get('assignment_label') || undefined,
        notes: form.get('notes') || null,
        password: (form.get('password') as string) || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError((data as { error?: string }).error ?? 'Update failed');
      return;
    }
    setEditingId(null);
    router.refresh();
    const listRes = await fetch('/api/admin/crew');
    const listData = await listRes.json();
    if (listRes.ok && listData.members) {
      setMembers(listData.members);
    }
  };

  if (members.length === 0) {
    return (
      <Card>
        <p className="font-body text-sm text-text-on-surface">No crew accounts yet. Create one above.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="font-semibold text-accent-red">{error}</p>}
      {members.map((m) => (
        <Card key={m.id}>
          {editingId === m.id ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveEdit(m.id, new FormData(e.currentTarget));
              }}
              className="space-y-3"
            >
              <p className="font-display text-[10px] text-text-secondary">{m.email}</p>
              <div>
                <label className="font-display text-[10px] text-text-secondary">NAME</label>
                <Input name="full_name" defaultValue={m.full_name} required />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-display text-[10px] text-text-secondary">ROLE</label>
                  <select
                    name="app_role"
                    defaultValue={m.app_role}
                    className="flex h-11 w-full rounded-card border border-border bg-bg-tertiary px-3 font-body text-sm"
                  >
                    <option value="crew">Crew / jury</option>
                    <option value="admin">Super admin</option>
                  </select>
                </div>
                <div>
                  <label className="font-display text-[10px] text-text-secondary">ASSIGNMENT</label>
                  <select
                    name="assignment_kind"
                    defaultValue={m.assignment?.assignment_kind ?? 'general'}
                    className="flex h-11 w-full rounded-card border border-border bg-bg-tertiary px-3 font-body text-sm"
                  >
                    {CREW_ASSIGNMENT_KINDS.map((k) => (
                      <option key={k.value} value={k.value}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="font-display text-[10px] text-text-secondary">STATION (if station judge)</label>
                <select
                  name="station_id"
                  defaultValue={m.assignment?.station_id ?? ''}
                  className="flex h-11 w-full rounded-card border border-border bg-bg-tertiary px-3 font-body text-sm"
                >
                  <option value="">—</option>
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      Pos {s.number} — {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-display text-[10px] text-text-secondary">LABEL</label>
                <Input
                  name="assignment_label"
                  defaultValue={m.assignment?.assignment_label ?? ''}
                />
              </div>
              <div>
                <label className="font-display text-[10px] text-text-secondary">NOTES</label>
                <Input name="notes" defaultValue={m.assignment?.notes ?? ''} />
              </div>
              <div>
                <label className="font-display text-[10px] text-text-secondary">
                  NEW PASSWORD (OPTIONAL)
                </label>
                <Input name="password" type="password" minLength={8} autoComplete="new-password" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  SAVE
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)}>
                  CANCEL
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-display text-sm font-bold text-text-on-surface">{m.full_name}</p>
                <p className="font-body text-xs text-text-secondary">{m.email}</p>
                <p className="mt-1 font-display text-[10px] text-accent-blue">
                  {m.app_role.toUpperCase()}
                </p>
                <p className="mt-2 font-body text-sm font-semibold text-accent-green">
                  {m.assignment?.assignment_label ?? 'No assignment'}
                </p>
                {m.assignment?.notes && (
                  <p className="font-body text-xs text-text-secondary">{m.assignment.notes}</p>
                )}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => startEdit(m)}>
                EDIT
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
