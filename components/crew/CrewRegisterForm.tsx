'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export function CrewRegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: '',
    whatsapp: '',
    student_id: '',
    study_program: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const res = await fetch('/api/crew/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: form.full_name,
        whatsapp: form.whatsapp,
        student_id: form.student_id || null,
        study_program: form.study_program || null,
        email: form.email || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError((data as { error?: string }).error ?? 'Could not register');
      return;
    }
    setSuccess(`${form.full_name} added — they can WhatsApp-login on the app.`);
    setForm({ full_name: '', whatsapp: '', student_id: '', study_program: '', email: '' });
    router.refresh();
  };

  return (
    <Card>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="font-display text-[10px] text-text-secondary">FULL NAME *</label>
          <Input
            value={form.full_name}
            onChange={(e) => set('full_name', e.target.value)}
            required
          />
        </div>
        <div>
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
          <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        {error && <p className="text-sm text-accent-red">{error}</p>}
        {success && <p className="text-sm text-accent-green">{success}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'SAVING…' : 'REGISTER PARTICIPANT'}
        </Button>
      </form>
    </Card>
  );
}
