'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { PINInput } from '@/components/app/PINInput';
import { TEAM_ROLES } from '@/lib/types';
import { profileNameFromJoin, teamNameFromJoin } from '@/lib/supabase-helpers';

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [joinCodeResult, setJoinCodeResult] = useState('');
  const [teamPreview, setTeamPreview] = useState<{ name: string; members: string[] } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const savePin = async (entered: string) => {
    if (!confirmPin) {
      setConfirmPin(entered);
      setPinError('');
      return;
    }
    if (entered !== confirmPin) {
      setPinError('PINs do not match');
      setConfirmPin('');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/onboarding/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: entered }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setPinError(d.error ?? 'Failed');
      setConfirmPin('');
      return;
    }
    setStep(2);
  };

  const createTeam = async () => {
    setLoading(true);
    setError('');
    const res = await fetch('/api/onboarding/team/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: teamName }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setJoinCodeResult(data.join_code);
    setStep(3);
    loadTeamPreview();
  };

  const lookupJoinCode = async () => {
    const supabase = createClient();
    const { data: team } = await supabase
      .from('teams')
      .select('id, name, team_members(team_role)')
      .eq('join_code', joinCode.toUpperCase())
      .single();
    if (!team) {
      setError('Invalid join code');
      return;
    }
    const taken = (team.team_members as { team_role: string }[]).map((m) => m.team_role);
    setAvailableRoles(TEAM_ROLES.filter((r) => !taken.includes(r)));
    setTeamPreview({ name: team.name, members: taken });
  };

  const joinTeam = async () => {
    setLoading(true);
    setError('');
    const res = await fetch('/api/onboarding/team/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ join_code: joinCode, team_role: selectedRole }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setStep(3);
    loadTeamPreview();
  };

  const loadTeamPreview = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: member } = await supabase
      .from('team_members')
      .select('team_id, teams(name)')
      .eq('user_id', user.id)
      .single();
    if (member?.teams) {
      const name = teamNameFromJoin(member.teams);
      const { data: members } = await supabase
        .from('team_members')
        .select('team_role, profiles(full_name)')
        .eq('team_id', member.team_id);
      setTeamPreview({
        name,
        members:
          members?.map(
            (m) =>
              `${profileNameFromJoin(m.profiles)} (${m.team_role})`
          ) ?? [],
      });
    }
  };

  useEffect(() => {
    if (step === 3) loadTeamPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const finish = async () => {
    setLoading(true);
    const res = await fetch('/api/onboarding/complete', { method: 'POST' });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    router.push('/home');
    router.refresh();
  };

  return (
    <main className="min-h-dvh p-6 pb-12">
      <p className="font-display text-sm text-accent-green">ONBOARDING — STEP {step}/3</p>

      {step === 1 && (
        <Card className="mt-6 space-y-4">
          <p className="font-body text-sm text-text-secondary">
            Set your 6-digit transaction PIN. Don&apos;t share it.
          </p>
          <p className="font-display text-[10px]">
            {confirmPin ? 'CONFIRM PIN' : 'ENTER PIN'}
          </p>
          <PINInput onComplete={savePin} error={pinError} disabled={loading} />
        </Card>
      )}

      {step === 2 && (
        <Card className="mt-6 space-y-4">
          {!mode && (
            <>
              <Button className="w-full" onClick={() => setMode('create')}>
                CREATE A TEAM (I AM CEO)
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setMode('join')}>
                JOIN A TEAM
              </Button>
            </>
          )}
          {mode === 'create' && (
            <>
              <Input
                placeholder="Team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
              <Button className="w-full" onClick={createTeam} disabled={loading}>
                CREATE TEAM
              </Button>
            </>
          )}
          {mode === 'join' && (
            <>
              <Input
                placeholder="6-char join code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <Button variant="outline" onClick={lookupJoinCode}>
                FIND TEAM
              </Button>
              {availableRoles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {availableRoles.map((r) => (
                    <Button
                      key={r}
                      size="sm"
                      variant={selectedRole === r ? 'default' : 'outline'}
                      onClick={() => setSelectedRole(r)}
                    >
                      {r}
                    </Button>
                  ))}
                </div>
              )}
              <Button className="w-full" onClick={joinTeam} disabled={!selectedRole || loading}>
                JOIN TEAM
              </Button>
            </>
          )}
          {error && <p className="text-accent-red text-sm">{error}</p>}
        </Card>
      )}

      {step === 3 && (
        <Card className="mt-6 space-y-4">
          {joinCodeResult && (
            <p className="font-display text-xs text-accent-yellow">
              SHARE CODE: {joinCodeResult}
            </p>
          )}
          {teamPreview && (
            <>
              <p className="font-display text-lg">{teamPreview.name}</p>
              <ul className="font-body text-sm space-y-1">
                {teamPreview.members.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </>
          )}
          <Button className="w-full" onClick={finish} disabled={loading}>
            LET&apos;S GO!
          </Button>
        </Card>
      )}
    </main>
  );
}
