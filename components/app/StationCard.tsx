import Link from 'next/link';
import { Card } from '@/components/ui/card';
import type { SubmissionStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  locked: 'bg-text-secondary/20 text-text-secondary',
  in_progress: 'bg-accent-yellow/20 text-accent-yellow',
  pending: 'bg-accent-blue/20 text-accent-blue',
  approved: 'bg-accent-green/20 text-accent-green',
  rejected: 'bg-accent-red/20 text-accent-red',
};

interface StationCardProps {
  id: string;
  number: number;
  name: string;
  activityType: string;
  status: SubmissionStatus | 'in_progress' | 'locked';
}

export function StationCard({ id, number, name, activityType, status }: StationCardProps) {
  const label = status.replace('_', ' ').toUpperCase();
  return (
    <Link href={`/missions/${id}`}>
      <Card className="flex items-center justify-between gap-3 hover:border-border-active btn-press">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-card border border-border font-display text-sm text-accent-green">
            {number}
          </span>
          <div>
            <p className="font-display text-xs">{name}</p>
            <p className="font-body text-[10px] text-text-secondary">{activityType}</p>
          </div>
        </div>
        <span className={cn('rounded px-2 py-0.5 font-display text-[8px]', statusStyles[status])}>
          {label}
        </span>
      </Card>
    </Link>
  );
}
