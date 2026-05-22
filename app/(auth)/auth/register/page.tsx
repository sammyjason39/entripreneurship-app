'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { studentIdToEmail, phoneToPassword } from '@/lib/participant-credentials';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: '',
    student_id: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/participant/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoading(false);
      setError((data as { error?: string }).error ?? 'Registration failed');
      return;
    }

    try {
      const email = studentIdToEmail(form.student_id);
      const password = phoneToPassword(form.phone);
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (authError) {
        setError('Account created. Please log in manually.');
        router.push('/auth/login');
        return;
      }
      router.push('/onboarding');
      router.refresh();
    } catch {
      setLoading(false);
      router.push('/auth/login');
    }
  };

  return (
    <main className="flex min-h-dvh flex-col justify-center p-6">
      <div className="win98-dialog">
        <div className="win98-titlebar">
          <span>REGISTER</span>
          <span>×</span>
        </div>
        <Card className="border-0 rounded-none space-y-4">
          <p className="font-body text-xs text-text-secondary">
            Create your account once. You will log in with student ID + WhatsApp number.
          </p>
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
              <label className="font-display text-[10px] text-text-secondary">STUDENT ID *</label>
              <Input
                value={form.student_id}
                onChange={(e) => set('student_id', e.target.value)}
                required
                placeholder="Your BINUS student ID"
              />
            </div>
            <div>
              <label className="font-display text-[10px] text-text-secondary">
                WHATSAPP NUMBER *
              </label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                required
                placeholder="08xxxxxxxxxx"
              />
              <p className="mt-1 font-body text-[10px] text-text-secondary">
                This number becomes your login password.
              </p>
            </div>
            {error && <p className="text-sm text-accent-red">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
            </Button>
          </form>
          <p className="text-center font-body text-xs text-text-secondary">
            Already registered?{' '}
            <Link href="/auth/login" className="text-accent-green underline">
              Login
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
