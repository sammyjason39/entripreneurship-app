'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PINInput } from '@/components/app/PINInput';
import { TEAM_ROLES } from '@/lib/types';
import { profileNameFromJoin, teamFromJoin } from '@/lib/supabase-helpers';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ full_name: string; email?: string } | null>(null);
  const [team, setTeam] = useState<{
    name: string;
    join_code: string;
    role: string;
    members: { name: string; role: string }[];
  } | null>(null);
  const [showPinChange, setShowPinChange] = useState(false);
  const [pinStep, setPinStep] = useState<'enter' | 'confirm'>('enter');
  const [firstPin, setFirstPin] = useState('');

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile({ full_name: p?.full_name ?? '', email: user.email });
      const { data: m } = await supabase
        .from('team_members')
        .select('team_role, team_id, teams(name, join_code)')
        .eq('user_id', user.id)
        .single();
      const t = teamFromJoin(m?.teams);
      if (m && t) {
        const { data: members } = await supabase
          .from('team_members')
          .select('team_role, profiles(full_name)')
          .eq('team_id', m.team_id);
        setTeam({
          name: t.name,
          join_code: t.join_code,
          role: m.team_role,
          members:
            members?.map((mem) => ({
              name: profileNameFromJoin(mem.profiles),
              role: mem.team_role,
            })) ?? [],
        });
      }
    };
    load();
  }, []);

  const changePin = async (pin: string) => {
    if (pinStep === 'enter') {
      setFirstPin(pin);
      setPinStep('confirm');
      return;
    }
    if (pin !== firstPin) return;
    await fetch('/api/onboarding/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    setShowPinChange(false);
    setPinStep('enter');
  };

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <main className="p-4 space-y-6">
      <div>
        <h1 className="font-display text-2xl">{team?.name ?? '—'}</h1>
        {team?.role === 'CEO' && (
          <p className="font-display text-xs text-accent-yellow mt-2">
            TEAM CODE: {team.join_code}
          </p>
        )}
      </div>

      <Card>
        <p className="font-display text-[10px] text-text-secondary mb-3">MEMBERS</p>
        <div className="space-y-2">
          {team?.members.map((m) => (
            <div key={m.role} className="flex justify-between font-body text-sm">
              <span>{m.name}</span>
              <span className="text-accent-green font-display text-[9px]">{m.role}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-1">
          {TEAM_ROLES.map((r) => {
            const filled = team?.members.some((m) => m.role === r);
            return (
              <span
                key={r}
                className={`rounded px-1.5 py-0.5 font-display text-[8px] border ${
                  filled ? 'border-accent-green text-accent-green' : 'border-border text-text-secondary'
                }`}
              >
                {r}
              </span>
            );
          })}
        </div>
      </Card>

      <Card>
        <p className="font-body text-sm">{profile?.full_name}</p>
        <p className="font-body text-xs text-text-secondary">{profile?.email}</p>
        <p className="font-display text-[10px] text-accent-green mt-2">YOUR ROLE: {team?.role}</p>
      </Card>

      <div className="grid gap-2">
        <Link href="/map"><Button variant="outline" className="w-full">MAP</Button></Link>
        <Link href="/learn"><Button variant="outline" className="w-full">CASE STUDIES</Button></Link>
        <Link href="/prizes"><Button variant="outline" className="w-full">PRIZES</Button></Link>
        <Link href="/leaderboard"><Button variant="outline" className="w-full">LEADERBOARD</Button></Link>
      </div>

      {showPinChange ? (
        <Card>
          <PINInput onComplete={changePin} />
        </Card>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setShowPinChange(true)}>
          CHANGE PIN
        </Button>
      )}
      <Button variant="destructive" className="w-full" onClick={logout}>
        LOGOUT
      </Button>
    </main>
  );
}
