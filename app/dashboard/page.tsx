'use client';

import { useRaceState } from '@/hooks/useRaceState';
import { DashboardView } from '@/components/DashboardView';

export default function DashboardPage() {
  const { state, loaded } = useRaceState();

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

  return <DashboardView state={state} />;
}
