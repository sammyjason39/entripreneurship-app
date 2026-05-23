import { TeamTrackingBoard } from '@/components/crew/TeamTrackingBoard';

export default async function CrewTrackingPage() {
  return (
    <main className="space-y-4 p-4 text-on-bg-readable">
      <h1 className="font-display text-lg">TEAM MOVEMENT</h1>
      <p className="font-body text-xs text-text-on-bg-muted">
        Live view from station QR check-ins — who is where, and when they left the last post.
      </p>
      <TeamTrackingBoard />
    </main>
  );
}
