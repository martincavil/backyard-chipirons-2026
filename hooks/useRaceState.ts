'use client';

import { useState, useEffect, useRef } from 'react';
import { RaceState } from '@/types';
import { DEFAULT_STATE, SYNC_KEY } from '@/lib/constants';
import { loadState, loadFromStorage, saveState, persistToStorage } from '@/lib/storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export function useRaceState() {
  const [state, setState] = useState<RaceState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const raceIdRef = useRef<string | null>(null);
  const isUpdatingRef = useRef(false);

  // Load initial state
  useEffect(() => {
    (async () => {
      if (isSupabaseConfigured && supabase) {
        // Load from Supabase
        try {
          const { data, error } = await supabase
            .from('races')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

          if (error) {
            console.error('Error loading from Supabase:', error);
            // Fallback to localStorage
            const saved = loadState();
            if (saved && saved.runners) {
              setState(saved);
            }
          } else if (data) {
            raceIdRef.current = data.id;
            setState(data.state as RaceState);
            // Also save to localStorage as backup
            saveState(data.state as RaceState);
          }
        } catch (err) {
          console.error('Supabase error:', err);
          // Fallback to localStorage
          const saved = loadState();
          if (saved && saved.runners) {
            setState(saved);
          }
        }
      } else {
        // Use localStorage (existing behavior)
        let saved = loadState();
        if (!saved) {
          saved = await loadFromStorage();
        }
        if (saved && saved.runners) {
          setState(saved);
        }
      }
      setLoaded(true);
    })();
  }, []);

  // Subscribe to Supabase realtime changes
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !loaded) return;

    const channel = supabase
      .channel('race-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'races',
        },
        (payload) => {
          // Don't update if we're the ones who triggered the change
          if (isUpdatingRef.current) {
            isUpdatingRef.current = false;
            return;
          }

          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newState = (payload.new as any).state as RaceState;
            setState(newState);
            // Also save to localStorage as backup
            saveState(newState);
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [loaded]);

  // Listen for cross-tab sync (fallback when not using Supabase)
  useEffect(() => {
    if (isSupabaseConfigured) return; // Skip if using Supabase

    const handler = (e: StorageEvent) => {
      if (e.key === SYNC_KEY && e.newValue) {
        try {
          const synced = JSON.parse(e.newValue);
          if (synced && synced.runners) {
            setState(synced);
          }
        } catch {
          // Ignore parse errors
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Helper to update state with persistence
  const updateState = async (newState: RaceState) => {
    setState(newState);

    if (isSupabaseConfigured && supabase && raceIdRef.current) {
      // Update Supabase
      isUpdatingRef.current = true;
      try {
        const { error } = await supabase
          .from('races')
          .update({ state: newState })
          .eq('id', raceIdRef.current);

        if (error) {
          console.error('Error updating Supabase:', error);
          // Fallback to localStorage
          saveState(newState);
          persistToStorage(newState);
        } else {
          // Also save to localStorage as backup
          saveState(newState);
        }
      } catch (err) {
        console.error('Supabase update error:', err);
        // Fallback to localStorage
        saveState(newState);
        persistToStorage(newState);
      }
    } else {
      // Use localStorage (existing behavior)
      saveState(newState);
      persistToStorage(newState);
    }
  };

  return { state, setState: updateState, loaded };
}
