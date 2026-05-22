'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const empty = {
  full_name: '',
  whatsapp: '',
  student_id: '',
  study_program: '',
  email: '',
  commit_attendance: '',
};

export function ParticipantCreateForm() {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof empty, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const res = await fetch('/api/admin/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: form.full_name,
        whatsapp: form.whatsapp,
        student_id: form.student_id || null,
        study_program: form.study_program || null,
        email: form.email || null,
        commit_attendance: form.commit_attendance || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError((data as { error?: string }).error ?? 'Could not add participant');
      return;
    }
    setSuccess(`${form.full_name} added — they can log in with WhatsApp.`);
    setForm(empty);
    router.refresh();
  };

  return (
    <Card>
      <p className="mb-4 font-display text-xs font-bold text-text-on-surface">
        ADD PARTICIPANT (FORM REGISTRATION)
      </p>
      <p className="mb-4 font-body text-xs text-text-secondary">
        Same list used for WhatsApp login. Use the number they submitted on the registration site.
      </p>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="font-display text-[10px] text-text-secondary">FULL NAME *</label>
          <Input
            value={form.full_name}
            onChange={(e) => set('full_name', e.target.value)}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="font-display text-[10px] text-text-secondary">WHATSAPP *</label>
          <Input
            type="tel"
            placeholder="08xxxxxxxxxx"
            value={form.whatsapp}
            onChange={(e) => set('whatsapp', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="font-display text-[10px] text-text-secondary">STUDENT ID</label>
          <Input value={form.student_id} onChange={(e) => set('student_id', e.target.value)} />
        </div>
        <div>
          <label className="font-display text-[10px] text-text-secondary">STUDY PROGRAM</label>
          <Input
            value={form.study_program}
            onChange={(e) => set('study_program', e.target.value)}
          />
        </div>
        <div>
          <label className="font-display text-[10px] text-text-secondary">EMAIL</label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </div>
        <div>
          <label className="font-display text-[10px] text-text-secondary">COMMIT ATTENDANCE</label>
          <Input
            value={form.commit_attendance}
            onChange={(e) => set('commit_attendance', e.target.value)}
            placeholder="yes, with my pleasure!"
          />
        </div>
        {error && (
          <p className="sm:col-span-2 text-sm font-semibold text-accent-red">{error}</p>
        )}
        {success && (
          <p className="sm:col-span-2 text-sm font-semibold text-accent-green">{success}</p>
        )}
        <div className="sm:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'SAVING…' : 'ADD PARTICIPANT'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
