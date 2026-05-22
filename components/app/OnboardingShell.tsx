import { Card } from '@/components/ui/card';
import { SponsorRow } from '@/components/app/SponsorRow';

type OnboardingStep = 1 | 2 | 3;

const STEP_TITLES: Record<OnboardingStep, string> = {
  1: 'TRANSACTION PIN',
  2: 'YOUR TEAM',
  3: 'READY TO GO',
};

export function OnboardingShell({
  step,
  children,
}: {
  step: OnboardingStep;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col justify-center p-6 pb-10">
      <p className="mb-3 font-display text-xs font-bold text-text-on-bg">
        ONBOARDING — STEP {step} OF 3
      </p>
      <div className="win98-dialog w-full">
        <div className="win98-titlebar">
          <span>{STEP_TITLES[step]}</span>
          <span className="font-bold">{step}/3</span>
        </div>
        <Card className="space-y-4 border-0 rounded-none bg-bg-secondary">{children}</Card>
      </div>
      <div className="mt-8">
        <SponsorRow />
      </div>
    </main>
  );
}
