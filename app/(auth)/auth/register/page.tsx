'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';

/** Public self-registration is disabled — roster comes from the event form CSV. */
export default function RegisterPage() {
  return (
    <main className="flex min-h-dvh flex-col justify-center p-6">
      <div className="win98-dialog">
        <div className="win98-titlebar">
          <span>REGISTRATION</span>
          <span>×</span>
        </div>
        <Card className="border-0 rounded-none space-y-4">
          <p className="font-display text-sm text-accent-green">ALREADY REGISTERED</p>
          <p className="font-body text-sm text-text-secondary">
            Participant registration was collected on the EnTripreneurship Vol. 2 form. You do not
            create a new account here.
          </p>
          <p className="font-body text-sm text-text-secondary">
            To enter the app, go to <strong className="text-text-primary">Login</strong> and sign in
            with the <strong className="text-text-primary">same WhatsApp number</strong> you used on
            that form. We will send you a one-time code to confirm via WhatsApp.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex h-10 w-full items-center justify-center rounded border-2 border-border-primary bg-accent-green px-4 font-display text-xs text-bg-primary shadow-win98"
          >
            GO TO WHATSAPP LOGIN
          </Link>
        </Card>
      </div>
    </main>
  );
}
