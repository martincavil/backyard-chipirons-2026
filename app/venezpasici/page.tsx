'use client';

import { useRaceState } from '@/hooks/useRaceState';
import { AdminView } from '@/components/AdminView';

export default function Home() {
  const { state, setState, loaded, supabaseStatus } = useRaceState();

  if (!loaded) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#050a14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-bebas-neue)',
          fontSize: 36,
          color: '#333',
        }}
      >
        Chargement...
      </div>
    );
  }

  return <AdminView state={state} setState={setState} supabaseStatus={supabaseStatus} />;
}
