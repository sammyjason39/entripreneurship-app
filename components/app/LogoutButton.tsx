'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export function LogoutButton({
  className,
  size = 'sm',
  variant = 'outline',
}: {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'outline' | 'destructive' | 'ghost';
}) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <Button type="button" variant={variant} size={size} className={className} onClick={logout}>
      LOGOUT
    </Button>
  );
}
