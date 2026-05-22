'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ReviewActions({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const review = async (action: 'approve' | 'reject') => {
    setLoading(true);
    await fetch('/api/submissions/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submission_id: submissionId,
        action,
        rejection_note: note,
      }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      <Input
        placeholder="Rejection note (if rejecting)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex gap-2">
        <Button className="flex-1" onClick={() => review('approve')} disabled={loading}>
          APPROVE
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={() => review('reject')}
          disabled={loading}
        >
          REJECT
        </Button>
      </div>
    </div>
  );
}
