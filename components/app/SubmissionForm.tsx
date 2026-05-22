'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { FormField, Station } from '@/lib/types';

interface SubmissionFormProps {
  station: Station;
  teamId: string;
  userId: string;
  existingId?: string;
}

export function SubmissionForm({ station, teamId, userId, existingId }: SubmissionFormProps) {
  const router = useRouter();
  const [summary, setSummary] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const needsImage = station.activity_type === 'image' || station.activity_type === 'both';
  const needsForm = station.activity_type === 'form' || station.activity_type === 'both';
  const fields = (station.form_schema ?? []) as FormField[];

  const submit = async () => {
    setLoading(true);
    setError('');
    const supabase = createClient();
    let image_url: string | null = null;

    if (file && needsImage) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image max 5MB');
        setLoading(false);
        return;
      }
      const path = `${teamId}/${station.id}/${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from('submissions').upload(path, file);
      if (upErr) {
        setError(upErr.message);
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('submissions').getPublicUrl(path);
      image_url = urlData.publicUrl;
    }

    const form_data: Record<string, string> = { summary };
    fields.forEach((f) => {
      if (f.name !== 'summary' && f.name in { summary }) return;
    });

    const payload = {
      team_id: teamId,
      station_id: station.id,
      submitted_by: userId,
      form_data,
      image_url,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    };

    let errMsg = '';
    if (existingId) {
      const { error: updErr } = await supabase
        .from('submissions')
        .update({ ...payload, rejection_note: null })
        .eq('id', existingId);
      if (updErr) errMsg = updErr.message;
    } else {
      const { error: insErr } = await supabase.from('submissions').insert(payload);
      if (insErr) errMsg = insErr.message;
    }

    setLoading(false);
    if (errMsg) {
      setError(errMsg);
      return;
    }
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {needsForm && (
        <div>
          <label className="font-display text-[10px] text-text-secondary">
            {fields[0]?.label ?? 'Describe your work'}
          </label>
          <textarea
            className="mt-2 w-full rounded-card border border-border bg-bg-secondary p-3 font-body text-sm min-h-[120px]"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
          />
        </div>
      )}
      {needsImage && (
        <div>
          <label className="font-display text-[10px] text-text-secondary">PHOTO</label>
          <Input
            type="file"
            accept="image/*"
            className="mt-2"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
      )}
      {error && <p className="text-accent-red text-sm">{error}</p>}
      <Button className="w-full" onClick={submit} disabled={loading}>
        {loading ? 'SUBMITTING...' : 'SUBMIT'}
      </Button>
    </div>
  );
}
