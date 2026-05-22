import Link from 'next/link';
import {
  QrCode,
  ScanLine,
  Target,
  Map,
  MapPin,
  BookOpen,
  Trophy,
  BarChart3,
  Users,
} from 'lucide-react';

const actions = [
  { href: '/bank/qr', label: 'My QR', icon: QrCode },
  { href: '/bank/scan', label: 'Scan', icon: ScanLine },
  { href: '/missions', label: 'Missions', icon: Target },
  { href: '/missions/scan', label: 'Scan station', icon: MapPin },
  { href: '/map', label: 'Map', icon: Map },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/prizes', label: 'Prizes', icon: Trophy },
  { href: '/leaderboard', label: 'Board', icon: BarChart3 },
  { href: '/profile', label: 'Team', icon: Users },
];

export function QuickActionGrid() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col items-center gap-2 rounded-card border border-border bg-bg-secondary p-3 transition-colors hover:bg-bg-tertiary btn-press"
        >
          <Icon className="text-accent-green" size={24} />
          <span className="font-display text-[8px] uppercase text-text-primary">{label}</span>
        </Link>
      ))}
    </div>
  );
}
