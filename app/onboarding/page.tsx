'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PINInput } from '@/components/app/PINInput';
import { OnboardingShell } from '@/components/app/OnboardingShell';
import { TransactionPinHelp } from '@/components/app/TransactionPinHelp';
import { TEAM_ROLES } from '@/lib/types';
import { profileNameFromJoin, teamNameFromJoin } from '@/lib/supabase-helpers';

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [pinPhase, setPinPhase] = useState<'enter' | 'confirm'>('enter');
  const [firstPin, setFirstPin] = useState('');
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

  useEffect(() => {
    fetch('/api/onboarding/ensure-profile', { method: 'POST' }).catch(() => {});
  }, []);

  const savePin = async (entered: string) => {
    if (pinPhase === 'enter') {
      setFirstPin(entered);
      setPinPhase('confirm');
      setPinError('');
      return;
    }

    if (entered !== firstPin) {
      setPinError('PINs do not match. Please enter your PIN again.');
      setPinPhase('enter');
      setFirstPin('');
      return;
    }

    setLoading(true);
    setPinError('');

    await fetch('/api/onboarding/ensure-profile', { method: 'POST' });

    const res = await fetch('/api/onboarding/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: entered }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setPinError((data as { error?: string }).error ?? 'Could not save PIN. Try again.');
      setPinPhase('enter');
      setFirstPin('');
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
    <OnboardingShell step={step}>
      {step === 1 && (
        <>
          <TransactionPinHelp />
          <p className="font-display text-[10px] text-text-secondary">
            {pinPhase === 'enter' ? 'CREATE YOUR 6-DIGIT PIN' : 'ENTER THE SAME PIN AGAIN'}
          </p>
          <PINInput
            key={pinPhase}
            resetKey={pinPhase}
            onComplete={savePin}
            error={pinError}
            disabled={loading}
          />
          {loading && (
            <p className="animate-blink text-center font-display text-xs text-accent-green">
              SAVING PIN...
            </p>
          )}
          {pinPhase === 'confirm' && !loading && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setPinPhase('enter');
                setFirstPin('');
                setPinError('');
              }}
            >
              START OVER
            </Button>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <p className="font-body text-sm text-text-secondary leading-relaxed">
            Setiap tim 4 orang: CEO, CTO, CFO, CMO. CEO buat tim & share join code; anggota lain join
            dan pilih role yang masih kosong.
          </p>

          {!mode && (
            <div className="flex flex-col gap-3">
              <Button className="w-full" onClick={() => setMode('create')}>
                CREATE A TEAM (I AM CEO)
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setMode('join')}>
                JOIN A TEAM
              </Button>
            </div>
          )}

          {mode === 'create' && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="font-display text-[10px] text-text-secondary">TEAM NAME</label>
                <Input
                  placeholder="e.g. Pixel Ventures"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={createTeam}
                disabled={loading || !teamName.trim()}
              >
                {loading ? 'CREATING...' : 'CREATE TEAM'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setMode(null)}>
                BACK
              </Button>
            </div>
          )}

          {mode === 'join' && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="font-display text-[10px] text-text-secondary">JOIN CODE</label>
                <Input
                  placeholder="6 characters"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>
              <Button variant="outline" className="w-full" onClick={lookupJoinCode}>
                FIND TEAM
              </Button>
              {teamPreview && (
                <p className="font-body text-sm text-accent-green">
                  Team: <span className="text-text-primary">{teamPreview.name}</span>
                </p>
              )}
              {availableRoles.length > 0 && (
                <div>
                  <p className="mb-2 font-display text-[10px] text-text-secondary">PICK YOUR ROLE</p>
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
                </div>
              )}
              <Button className="w-full" onClick={joinTeam} disabled={!selectedRole || loading}>
                {loading ? 'JOINING...' : 'JOIN TEAM'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setMode(null)}>
                BACK
              </Button>
            </div>
          )}

          {error && <p className="text-sm text-accent-red">{error}</p>}
        </>
      )}

      {step === 3 && (
        <>
          {joinCodeResult && (
            <div className="rounded-card border border-accent-yellow/40 bg-bg-tertiary/50 p-3">
              <p className="font-display text-[10px] text-accent-yellow">SHARE WITH YOUR TEAM</p>
              <p className="mt-1 font-display text-lg tracking-widest text-text-primary">
                {joinCodeResult}
              </p>
            </div>
          )}
          {teamPreview && (
            <>
              <p className="font-display text-lg text-accent-green">{teamPreview.name}</p>
              <ul className="space-y-1 font-body text-sm">
                {teamPreview.members.map((m, i) => (
                  <li key={i} className="text-text-secondary">
                    {m}
                  </li>
                ))}
              </ul>
            </>
          )}
          <Button className="w-full" onClick={finish} disabled={loading}>
            {loading ? 'LOADING...' : "LET'S GO!"}
          </Button>
        </>
      )}
    </OnboardingShell>
  );
}
