'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { EventRegistration } from '@/lib/types';
import { ParticipantCreateForm } from '@/components/admin/ParticipantCreateForm';
import { ParticipantRoster } from '@/components/admin/ParticipantRoster';

export function AdminParticipantsSection({ initial }: { initial: EventRegistration[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);

  useEffect(() => {
    setRows(initial);
  }, [initial]);

  const reloadFromServer = useCallback(async () => {
    const res = await fetch('/api/admin/registrations');
    const data = await res.json().catch(() => ({}));
    if (res.ok && Array.isArray((data as { registrations?: EventRegistration[] }).registrations)) {
      setRows((data as { registrations: EventRegistration[] }).registrations);
    }
    router.refresh();
  }, [router]);

  return (
    <>
      <ParticipantCreateForm
        onCreated={(registration) => {
          setRows((prev) => {
            if (prev.some((r) => r.id === registration.id)) {
              return prev.map((r) => (r.id === registration.id ? registration : r));
            }
            return [...prev, registration].sort((a, b) =>
              a.full_name.localeCompare(b.full_name)
            );
          });
          router.refresh();
        }}
      />
      <ParticipantRoster rows={rows} setRows={setRows} onReload={reloadFromServer} />
    </>
  );
}
