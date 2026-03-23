'use client';

import { useState, useEffect } from 'react';
import { RaceState, EliminationReason } from '@/types';
import { computeLoopInfo, formatTime, getParisNow } from '@/lib/utils';
import { DEFAULT_STATE, MAX_LOOP_DURATION_MS } from '@/lib/constants';
import { PhotoUpload } from './PhotoUpload';
import { useUndoAction } from '@/hooks/useUndoAction';
import { UndoToast } from './UndoToast';
import { Soundboard } from './Soundboard';
import { SoundType } from '@/lib/sounds';

interface AdminViewProps {
  state: RaceState;
  setState: (state: RaceState) => void;
}

export function AdminView({ state, setState }: AdminViewProps) {
  const [newName, setNewName] = useState('');
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const { undoActions, addUndoAction, undoAction, dismissAction } =
    useUndoAction(state, setState);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { currentLoop, msRemaining, preRace } = computeLoopInfo(
    state.raceStartTime,
  );
  const activeRunners = state.runners.filter((r) => r.status === 'active');
  const eliminatedRunners = state.runners.filter((r) => r.status === 'dnf');

  const addRunner = () => {
    if (!newName.trim()) return;
    const runner = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: newName.trim(),
      photo: newPhoto,
      status: 'active' as const,
      loops: [],
      eliminatedAt: null,
    };
    setState({ ...state, runners: [...state.runners, runner] });
    setNewName('');
    setNewPhoto(null);
  };

  const removeRunner = (id: string) => {
    if (!state.raceStarted) {
      setState({ ...state, runners: state.runners.filter((r) => r.id !== id) });
    }
  };

  const startRace = () => {
    // Set race start to the next noon Paris time (or now if it IS noon)
    const paris = getParisNow();
    const startTime = new Date(paris);
    startTime.setHours(12, 0, 0, 0);
    setState({
      ...state,
      raceStarted: true,
      raceStartTime: startTime.toISOString(),
    });
  };

  const startRaceNow = () => {
    // Start at the next upcoming hour boundary for testing or flexible start
    const paris = getParisNow();
    const startTime = new Date(paris);
    startTime.setMinutes(0, 0, 0);
    setState({
      ...state,
      raceStarted: true,
      raceStartTime: startTime.toISOString(),
    });
  };

  const recordArrival = (runnerId: string) => {
    const runner = state.runners.find((r) => r.id === runnerId);
    if (!runner) return;

    const previousState = { ...state };

    const paris = getParisNow();
    const loopInfo = computeLoopInfo(state.raceStartTime);
    const raceStart = new Date(state.raceStartTime!);
    const loopStart = new Date(
      raceStart.getTime() + (loopInfo.currentLoop - 1) * MAX_LOOP_DURATION_MS,
    );
    const timeMs = paris.getTime() - loopStart.getTime();

    const newRunners = state.runners.map((r) => {
      if (r.id !== runnerId) return r;
      // Don't record same loop twice
      if (r.loops.some((l) => l.loop === loopInfo.currentLoop)) return r;
      return {
        ...r,
        loops: [
          ...r.loops,
          {
            loop: loopInfo.currentLoop,
            timeMs,
            finishTime: paris.toISOString(),
          },
        ],
      };
    });

    const newState = {
      ...state,
      runners: newRunners,
      lastArrival: { runnerId, _ts: Date.now() },
    };

    setState(newState);
    addUndoAction(
      `Arrivée enregistrée pour ${runner.name}`,
      previousState,
    );
  };

  const eliminateRunner = (runnerId: string, reason: EliminationReason = 'timeout') => {
    const elimName = state.runners.find((r) => r.id === runnerId)?.name || '?';
    const previousState = { ...state };

    const paris = getParisNow();
    const loopInfo = computeLoopInfo(state.raceStartTime);
    const newRunners = state.runners.map((r) => {
      if (r.id !== runnerId) return r;
      return {
        ...r,
        status: 'dnf' as const,
        eliminatedAt: {
          loop: loopInfo.currentLoop,
          time: paris.toISOString(),
          reason,
        },
      };
    });

    const newState = {
      ...state,
      runners: newRunners,
      lastElimination: { name: elimName, _ts: Date.now() },
    };

    setState(newState);
    addUndoAction(
      `${elimName} éliminé(e) (${reason === 'timeout' ? 'Hors délai' : 'Abandon'})`,
      previousState,
    );
  };

  const declareWinner = (runnerId: string) => {
    const winnerName = state.runners.find((r) => r.id === runnerId)?.name || '?';
    const previousState = { ...state };

    const newRunners = state.runners.map((r) => {
      if (r.id !== runnerId) return r;
      return { ...r, status: 'winner' as const };
    });

    const newState = { ...state, runners: newRunners, raceFinished: true };

    setState(newState);
    addUndoAction(`${winnerName} déclaré(e) vainqueur`, previousState);
  };

  const resetRace = () => {
    if (
      window.confirm(
        '⚠️ Remettre à zéro toute la course ? Cette action est irréversible.',
      )
    ) {
      const fresh = { ...DEFAULT_STATE };
      setState(fresh);
    }
  };

  const playSoundOnDashboard = (sound: SoundType) => {
    setState({
      ...state,
      soundToPlay: { sound, _ts: Date.now() },
    });
  };

  const parisTimeStr = getParisNow().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f0f1a',
        color: '#ddd',
        fontFamily: "'Oswald', sans-serif",
        padding: 20,
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            borderBottom: '1px solid #222',
            paddingBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 24,
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: 3,
              }}
            >
              🦑 Admin — Chipirons 2026
            </div>
            <div style={{ fontSize: 13, color: '#666' }}>
              Heure Paris : {parisTimeStr}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#555' }}>
              {activeRunners.length} en course · {eliminatedRunners.length}{' '}
              éliminés
            </span>
            <button
              onClick={resetRace}
              style={{
                background: '#331111',
                color: '#aa4444',
                border: '1px solid #442222',
                borderRadius: 6,
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Timer info */}
        {state.raceStarted && (
          <div
            style={{
              background: 'rgba(0,255,136,0.05)',
              border: '1px solid rgba(0,255,136,0.15)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: '#666',
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              Boucle {currentLoop} — Temps restant
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 48,
                color: msRemaining < 5 * 60 * 1000 ? '#ff4444' : '#00ff88',
              }}
            >
              {formatTime(msRemaining)}
            </div>
          </div>
        )}

        {/* Pre-race: add runners + start */}
        {!state.raceStarted && (
          <>
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid #222',
                borderRadius: 12,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 16, fontWeight: 500 }}>
                Ajouter un coureur
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <PhotoUpload
                  photo={newPhoto}
                  onChange={setNewPhoto}
                  size={50}
                />
                <input
                  type="text"
                  placeholder="Prénom / Pseudo"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addRunner()}
                  style={{
                    flex: 1,
                    background: '#1a1a2e',
                    border: '1px solid #333',
                    borderRadius: 8,
                    padding: '10px 14px',
                    color: '#eee',
                    fontSize: 16,
                    outline: 'none',
                  }}
                />
                <button
                  onClick={addRunner}
                  style={{
                    background: '#00cc66',
                    color: '#000',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  Ajouter
                </button>
              </div>
            </div>

            {/* Runner list */}
            {state.runners.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 14,
                    color: '#555',
                    letterSpacing: 2,
                    marginBottom: 8,
                    textTransform: 'uppercase',
                  }}
                >
                  {state.runners.length} coureur
                  {state.runners.length > 1 ? 's' : ''} inscrits
                </div>
                {state.runners.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 12px',
                      borderRadius: 8,
                      marginBottom: 4,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid #1a1a2e',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '1px solid #333',
                        flexShrink: 0,
                        background: '#1a1a2e',
                      }}
                    >
                      {r.photo ? (
                        <img
                          src={r.photo}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#555',
                          }}
                        >
                          🏃
                        </div>
                      )}
                    </div>
                    <span style={{ flex: 1, fontSize: 16 }}>{r.name}</span>
                    <button
                      onClick={() => removeRunner(r.id)}
                      style={{
                        background: 'none',
                        border: '1px solid #333',
                        borderRadius: 6,
                        color: '#aa4444',
                        padding: '4px 10px',
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Start buttons */}
            {state.runners.length >= 2 && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={startRace}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #00cc66, #00aa55)',
                    color: '#000',
                    border: 'none',
                    borderRadius: 12,
                    padding: '16px',
                    cursor: 'pointer',
                    fontSize: 20,
                    fontFamily: "'Bebas Neue', sans-serif",
                    letterSpacing: 3,
                  }}
                >
                  🏁 Départ à Midi
                </button>
                <button
                  onClick={startRaceNow}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #4488ff, #2266dd)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '16px',
                    cursor: 'pointer',
                    fontSize: 20,
                    fontFamily: "'Bebas Neue', sans-serif",
                    letterSpacing: 3,
                  }}
                >
                  ⚡ Départ Maintenant
                </button>
              </div>
            )}
          </>
        )}

        {/* During race: runner management */}
        {state.raceStarted && (
          <div>
            <div
              style={{
                fontSize: 14,
                color: '#555',
                letterSpacing: 2,
                marginBottom: 12,
                textTransform: 'uppercase',
              }}
            >
              Gestion des coureurs — Boucle {currentLoop}
            </div>
            {activeRunners.map((r) => {
              const hasFinishedThisLoop = r.loops.some(
                (l) => l.loop === currentLoop,
              );
              return (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 10,
                    marginBottom: 6,
                    background: hasFinishedThisLoop
                      ? 'rgba(0,255,136,0.06)'
                      : 'rgba(255,255,255,0.03)',
                    border: hasFinishedThisLoop
                      ? '1px solid rgba(0,255,136,0.2)'
                      : '1px solid #1a1a2e',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid #333',
                      flexShrink: 0,
                      background: '#1a1a2e',
                    }}
                  >
                    {r.photo ? (
                      <img
                        src={r.photo}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#555',
                          fontSize: 16,
                        }}
                      >
                        🏃
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 500 }}>
                      {r.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {r.loops.length} boucle{r.loops.length !== 1 ? 's' : ''}
                      {hasFinishedThisLoop && ' · ✅ Boucle validée'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {!hasFinishedThisLoop && (
                      <button
                        onClick={() => recordArrival(r.id)}
                        style={{
                          background: '#00cc66',
                          color: '#000',
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 16px',
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        ✅ Arrivée
                      </button>
                    )}
                    <button
                      onClick={() => eliminateRunner(r.id, 'abandon')}
                      style={{
                        background: 'none',
                        border: '1px solid #442222',
                        borderRadius: 8,
                        color: '#aa4444',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: 14,
                      }}
                    >
                      🏳️ Abandon
                    </button>
                    <button
                      onClick={() => eliminateRunner(r.id, 'timeout')}
                      style={{
                        background: '#331111',
                        border: '1px solid #442222',
                        borderRadius: 8,
                        color: '#cc4444',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: 14,
                      }}
                    >
                      ⏰ Hors délai
                    </button>
                  </div>
                </div>
              );
            })}

            {activeRunners.length === 1 && (
              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <button
                  onClick={() => declareWinner(activeRunners[0].id)}
                  style={{
                    background: 'linear-gradient(135deg, gold, #cc9900)',
                    color: '#000',
                    border: 'none',
                    borderRadius: 12,
                    padding: '16px 40px',
                    cursor: 'pointer',
                    fontSize: 22,
                    fontFamily: "'Bebas Neue', sans-serif",
                    letterSpacing: 3,
                  }}
                >
                  🏆 Déclarer {activeRunners[0].name} Vainqueur
                </button>
              </div>
            )}

            {/* Runner history */}
            {state.runners.some((r) => r.loops.length > 0) && (
              <div style={{ marginTop: 30 }}>
                <div
                  style={{
                    fontSize: 14,
                    color: '#555',
                    letterSpacing: 2,
                    marginBottom: 12,
                    textTransform: 'uppercase',
                  }}
                >
                  📊 Historique des boucles
                </div>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 12,
                    border: '1px solid #1a1a2e',
                    overflow: 'hidden',
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #222' }}>
                        <th
                          style={{
                            padding: '10px 14px',
                            textAlign: 'left',
                            color: '#555',
                            fontSize: 12,
                            letterSpacing: 1,
                          }}
                        >
                          COUREUR
                        </th>
                        <th
                          style={{
                            padding: '10px 14px',
                            textAlign: 'center',
                            color: '#555',
                            fontSize: 12,
                            letterSpacing: 1,
                          }}
                        >
                          BOUCLES
                        </th>
                        <th
                          style={{
                            padding: '10px 14px',
                            textAlign: 'right',
                            color: '#555',
                            fontSize: 12,
                            letterSpacing: 1,
                          }}
                        >
                          DÉTAIL
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.runners
                        .filter((r) => r.loops.length > 0)
                        .map((r) => (
                          <tr
                            key={r.id}
                            style={{
                              borderBottom: '1px solid rgba(255,255,255,0.03)',
                            }}
                          >
                            <td
                              style={{
                                padding: '10px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  color:
                                    r.status === 'dnf' ? '#664444' : '#eee',
                                }}
                              >
                                {r.status === 'dnf' && '💀 '}
                                {r.name}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: '10px 14px',
                                textAlign: 'center',
                                color: '#888',
                              }}
                            >
                              {r.loops.length}
                            </td>
                            <td
                              style={{
                                padding: '10px 14px',
                                textAlign: 'right',
                                color: '#666',
                                fontSize: 13,
                              }}
                            >
                              {r.loops
                                .map((l) => formatTime(l.timeMs))
                                .join(' · ')}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Soundboard */}
        {state.raceStarted && (
          <Soundboard onPlaySound={playSoundOnDashboard} />
        )}

        {/* Instructions */}
        <div
          style={{
            marginTop: 30,
            padding: 16,
            background: 'rgba(68,136,255,0.05)',
            border: '1px solid rgba(68,136,255,0.1)',
            borderRadius: 10,
            fontSize: 13,
            color: '#556',
            lineHeight: 1.6,
          }}
        >
          💡 <strong>Mode d&apos;emploi :</strong> Ouvre un 2e onglet avec{' '}
          <code>/dashboard</code> dans l&apos;URL pour afficher le dashboard TV.
          Cet onglet est l&apos;admin. Les deux se synchronisent automatiquement.
        </div>
      </div>

      {/* Undo toasts */}
      <UndoToast
        actions={undoActions}
        onUndo={undoAction}
        onDismiss={dismissAction}
      />
    </div>
  );
}
