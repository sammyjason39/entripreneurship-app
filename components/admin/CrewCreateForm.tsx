'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CREW_ASSIGNMENT_KINDS } from '@/lib/admin';
import type { CrewAssignmentKind, Station } from '@/lib/types';

export function CrewCreateForm({ stations }: { stations: Station[] }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [appRole, setAppRole] = useState<'crew' | 'admin'>('crew');
  const [assignmentKind, setAssignmentKind] = useState<CrewAssignmentKind>('jury');
  const [stationId, setStationId] = useState('');
  const [assignmentLabel, setAssignmentLabel] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const res = await fetch('/api/admin/crew', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        app_role: appRole,
        assignment_kind: assignmentKind,
        station_id: assignmentKind === 'station' && stationId ? stationId : null,
        assignment_label: assignmentLabel || undefined,
        notes: notes || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError((data as { error?: string }).error ?? 'Could not create account');
      return;
    }
    setSuccess(`Created ${email} — they can log in immediately.`);
    setEmail('');
    setPassword('');
    setFullName('');
    setAssignmentLabel('');
    setNotes('');
    router.refresh();
  };

  return (
    <Card>
      <p className="mb-4 font-display text-xs font-bold text-text-on-surface">
        CREATE CREW / JURY LOGIN
      </p>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="font-display text-[10px] text-text-secondary">FULL NAME</label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <label className="font-display text-[10px] text-text-secondary">EMAIL</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        <div>
          <label className="font-display text-[10px] text-text-secondary">PASSWORD (8+)</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="font-display text-[10px] text-text-secondary">SYSTEM ROLE</label>
          <select
            className="flex h-11 w-full rounded-card border border-border bg-bg-secondary px-3 font-body text-sm text-text-on-surface"
            value={appRole}
            onChange={(e) => setAppRole(e.target.value as 'crew' | 'admin')}
          >
            <option value="crew">Crew / jury</option>
            <option value="admin">Super admin</option>
          </select>
        </div>
        <div>
          <label className="font-display text-[10px] text-text-secondary">ASSIGNMENT</label>
          <select
            className="flex h-11 w-full rounded-card border border-border bg-bg-secondary px-3 font-body text-sm text-text-on-surface"
            value={assignmentKind}
            onChange={(e) => setAssignmentKind(e.target.value as CrewAssignmentKind)}
          >
            {CREW_ASSIGNMENT_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
        {assignmentKind === 'station' && (
          <div className="sm:col-span-2">
            <label className="font-display text-[10px] text-text-secondary">STATION</label>
            <select
              className="flex h-11 w-full rounded-card border border-border bg-bg-secondary px-3 font-body text-sm text-text-on-surface"
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
              required
            >
              <option value="">Select station…</option>
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  Pos {s.number} — {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="font-display text-[10px] text-text-secondary">
            CUSTOM LABEL (OPTIONAL)
          </label>
          <Input
            value={assignmentLabel}
            onChange={(e) => setAssignmentLabel(e.target.value)}
            placeholder="e.g. Jury — Finals round"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="font-display text-[10px] text-text-secondary">NOTES</label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Shift, partner, etc." />
        </div>
        {error && (
          <p className="sm:col-span-2 text-sm font-semibold text-accent-red">{error}</p>
        )}
        {success && (
          <p className="sm:col-span-2 text-sm font-semibold text-accent-green">{success}</p>
        )}
        <div className="sm:col-span-2">
          <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
            {loading ? 'CREATING…' : 'CREATE ACCOUNT'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
