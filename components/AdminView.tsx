"use client";

import { useState, useEffect } from "react";
import { RaceState, EliminationReason } from "@/types";
import { computeLoopInfo, formatTime, getParisNow } from "@/lib/utils";
import {
  DEFAULT_STATE,
  MAX_LOOP_DURATION_MS,
  FIRST_START_HOUR,
  MAX_LOOPS,
} from "@/lib/constants";
import { PhotoUpload } from "./PhotoUpload";
import { useUndoAction } from "@/hooks/useUndoAction";
import { UndoToast } from "./UndoToast";
import { SupabaseStatus } from "@/hooks/useRaceState";

interface AdminViewProps {
  state: RaceState;
  setState: (state: RaceState) => void;
  supabaseStatus: SupabaseStatus;
}

export function AdminView({ state, setState, supabaseStatus }: AdminViewProps) {
  const [newName, setNewName] = useState("");
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [isMobile, setIsMobile] = useState(false);
  const [modalRunnerId, setModalRunnerId] = useState<string | null>(null);
  const [resetStep, setResetStep] = useState(0);

  const { undoActions, addUndoAction, undoAction, dismissAction } =
    useUndoAction(state, setState);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { currentLoop, msRemaining, preRace } = computeLoopInfo(
    state.raceStartTime,
  );
  const activeRunners = state.runners.filter((r) => r.status === "active");
  const eliminatedRunners = state.runners.filter((r) => r.status === "dnf");

  const addRunner = () => {
    if (!newName.trim()) return;
    const runner = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: newName.trim(),
      photo: newPhoto,
      status: "active" as const,
      loops: [],
      eliminatedAt: null,
    };
    setState({ ...state, runners: [...state.runners, runner] });
    setNewName("");
    setNewPhoto(null);
  };

  const removeRunner = (id: string) => {
    if (!state.raceStarted) {
      setState({ ...state, runners: state.runners.filter((r) => r.id !== id) });
    }
  };

  const updateRunnerPhoto = (id: string, photo: string) => {
    setState({
      ...state,
      runners: state.runners.map((r) => (r.id === id ? { ...r, photo } : r)),
    });
  };

  const startRace = () => {
    // Set race start to the official first start time (10h00 pile)
    const paris = getParisNow();
    const startTime = new Date(paris);
    startTime.setHours(FIRST_START_HOUR, 0, 0, 0);
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
    addUndoAction(`Arrivée enregistrée pour ${runner.name}`, previousState);
  };

  const eliminateRunner = (
    runnerId: string,
    reason: EliminationReason = "timeout",
  ) => {
    const elimName = state.runners.find((r) => r.id === runnerId)?.name || "?";
    const previousState = { ...state };

    const paris = getParisNow();
    const loopInfo = computeLoopInfo(state.raceStartTime);
    const newRunners = state.runners.map((r) => {
      if (r.id !== runnerId) return r;
      return {
        ...r,
        status: "dnf" as const,
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
      `${elimName} éliminé(e) (${reason === "timeout" ? "Hors délai" : "Abandon"})`,
      previousState,
    );
  };

  const declareWinner = (runnerId: string) => {
    const winnerName =
      state.runners.find((r) => r.id === runnerId)?.name || "?";
    const previousState = { ...state };

    const newRunners = state.runners.map((r) => {
      if (r.id !== runnerId) return r;
      return { ...r, status: "winner" as const };
    });

    const newState = { ...state, runners: newRunners, raceFinished: true };

    setState(newState);
    addUndoAction(`${winnerName} déclaré(e) vainqueur`, previousState);
  };

  const resetRace = () => setResetStep(1);

  const reinstateRunner = (runnerId: string) => {
    const runner = state.runners.find((r) => r.id === runnerId);
    if (!runner) return;
    const previousState = { ...state };
    setState({
      ...state,
      runners: state.runners.map((r) =>
        r.id === runnerId
          ? { ...r, status: "active" as const, eliminatedAt: null }
          : r,
      ),
    });
    addUndoAction(`${runner.name} réintégré(e) dans la course`, previousState);
  };

  // Resets the race to pre-start state but keeps all runners (useful for testing)
  const resetRaceKeepRunners = () => {
    if (
      window.confirm(
        "Remettre la course à zéro en gardant les coureurs inscrits ?",
      )
    ) {
      setState({
        ...DEFAULT_STATE,
        runners: state.runners.map((r) => ({
          ...r,
          status: "active" as const,
          loops: [],
          eliminatedAt: null,
        })),
      });
    }
  };

  const parisTimeStr = getParisNow().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f1a",
        color: "#ddd",
        fontFamily: "'Oswald', sans-serif",
        padding: 20,
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            borderBottom: "1px solid #222",
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
            <div style={{ fontSize: 13, color: "#666" }}>
              Heure Paris : {parisTimeStr}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {/* Supabase connection badge */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                padding: "4px 10px",
                borderRadius: 20,
                background:
                  supabaseStatus === "connected"
                    ? "rgba(0,255,136,0.08)"
                    : supabaseStatus === "error"
                      ? "rgba(255,68,68,0.1)"
                      : supabaseStatus === "loading"
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(255,255,255,0.04)",
                border:
                  supabaseStatus === "connected"
                    ? "1px solid rgba(0,255,136,0.25)"
                    : supabaseStatus === "error"
                      ? "1px solid rgba(255,68,68,0.3)"
                      : "1px solid #222",
                color:
                  supabaseStatus === "connected"
                    ? "#00ff88"
                    : supabaseStatus === "error"
                      ? "#ff6666"
                      : "#666",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background:
                    supabaseStatus === "connected"
                      ? "#00ff88"
                      : supabaseStatus === "error"
                        ? "#ff4444"
                        : supabaseStatus === "loading"
                          ? "#888"
                          : "#444",
                  flexShrink: 0,
                }}
              />
              {supabaseStatus === "connected"
                ? "Supabase OK"
                : supabaseStatus === "error"
                  ? "Supabase HS"
                  : supabaseStatus === "loading"
                    ? "Connexion…"
                    : "Local only"}
            </span>
            <span style={{ fontSize: 14, color: "#555" }}>
              {activeRunners.length} en course · {eliminatedRunners.length}{" "}
              éliminés
            </span>
            {state.raceStarted && (
              <button
                onClick={resetRaceKeepRunners}
                style={{
                  background: "#112233",
                  color: "#4488cc",
                  border: "1px solid #224466",
                  borderRadius: 6,
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Reset course
              </button>
            )}
            <button
              onClick={resetRace}
              style={{
                background: "#331111",
                color: "#aa4444",
                border: "1px solid #442222",
                borderRadius: 6,
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Reset tout
            </button>
          </div>
        </div>

        {/* Timer info */}
        {state.raceStarted && (
          <div
            style={{
              background: "rgba(0,255,136,0.05)",
              border: "1px solid rgba(0,255,136,0.15)",
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "#666",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Boucle {currentLoop} — Temps restant
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 48,
                color: msRemaining < 5 * 60 * 1000 ? "#ff4444" : "#00ff88",
              }}
            >
              {formatTime(msRemaining)}
            </div>
            {currentLoop >= MAX_LOOPS && (
              <div
                style={{
                  marginTop: 8,
                  color: "#ff4444",
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 14,
                  letterSpacing: 1,
                }}
              >
                ⚠️ Dernière boucle possible — fin de course prévue à 20h00
              </div>
            )}
          </div>
        )}

        {/* Pre-race: add runners + start */}
        {!state.raceStarted && (
          <>
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid #222",
                borderRadius: 12,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 16, fontWeight: 500 }}>
                Ajouter un coureur
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
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
                  onKeyDown={(e) => e.key === "Enter" && addRunner()}
                  style={{
                    flex: 1,
                    background: "#1a1a2e",
                    border: "1px solid #333",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#eee",
                    fontSize: 16,
                    outline: "none",
                  }}
                />
                <button
                  onClick={addRunner}
                  style={{
                    background: "#00cc66",
                    color: "#000",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 20px",
                    cursor: "pointer",
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
                    color: "#555",
                    letterSpacing: 2,
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  {state.runners.length} coureur
                  {state.runners.length > 1 ? "s" : ""} inscrits
                </div>
                {state.runners.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "8px 12px",
                      borderRadius: 8,
                      marginBottom: 4,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid #1a1a2e",
                    }}
                  >
                    <PhotoUpload
                      photo={r.photo}
                      onChange={(photo) => updateRunnerPhoto(r.id, photo)}
                      size={36}
                    />
                    <span style={{ flex: 1, fontSize: 16 }}>{r.name}</span>
                    <button
                      onClick={() => removeRunner(r.id)}
                      style={{
                        background: "none",
                        border: "1px solid #333",
                        borderRadius: 6,
                        color: "#aa4444",
                        padding: "4px 10px",
                        cursor: "pointer",
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
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={startRace}
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #00cc66, #00aa55)",
                    color: "#000",
                    border: "none",
                    borderRadius: 12,
                    padding: "16px",
                    cursor: "pointer",
                    fontSize: 20,
                    fontFamily: "'Bebas Neue', sans-serif",
                    letterSpacing: 3,
                  }}
                >
                  🏁 Départ à 10h00
                </button>
                <button
                  onClick={startRaceNow}
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #4488ff, #2266dd)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    padding: "16px",
                    cursor: "pointer",
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
                color: "#555",
                letterSpacing: 2,
                marginBottom: 12,
                textTransform: "uppercase",
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
                  onClick={() => isMobile && setModalRunnerId(r.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderRadius: 10,
                    marginBottom: 6,
                    background: hasFinishedThisLoop
                      ? "rgba(0,255,136,0.06)"
                      : "rgba(255,255,255,0.03)",
                    border: hasFinishedThisLoop
                      ? "1px solid rgba(0,255,136,0.2)"
                      : "1px solid #1a1a2e",
                    cursor: isMobile ? "pointer" : "default",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid #333",
                      flexShrink: 0,
                      background: "#1a1a2e",
                    }}
                  >
                    {r.photo ? (
                      <img
                        src={r.photo}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#555",
                          fontSize: 16,
                        }}
                      >
                        🏃
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 500 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {r.loops.length} boucle{r.loops.length !== 1 ? "s" : ""}
                      {hasFinishedThisLoop && " · ✅ Boucle validée"}
                    </div>
                  </div>
                  {/* Desktop: inline buttons */}
                  {!isMobile && (
                    <div style={{ display: "flex", gap: 8 }}>
                      {!hasFinishedThisLoop && (
                        <button
                          onClick={() => recordArrival(r.id)}
                          style={{
                            background: "#00cc66",
                            color: "#000",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 16px",
                            cursor: "pointer",
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          ✅ Arrivée
                        </button>
                      )}
                      <button
                        onClick={() => eliminateRunner(r.id, "abandon")}
                        style={{
                          background: "none",
                          border: "1px solid #442222",
                          borderRadius: 8,
                          color: "#aa4444",
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                      >
                        🏳️ Abandon
                      </button>
                      <button
                        onClick={() => eliminateRunner(r.id, "timeout")}
                        style={{
                          background: "#331111",
                          border: "1px solid #442222",
                          borderRadius: 8,
                          color: "#cc4444",
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                      >
                        ⏰ Hors délai
                      </button>
                    </div>
                  )}
                  {/* Mobile: tap hint */}
                  {isMobile && (
                    <div style={{ fontSize: 20, color: "#333" }}>›</div>
                  )}
                </div>
              );
            })}

            {activeRunners.length === 1 && (
              <div style={{ marginTop: 20, textAlign: "center" }}>
                <button
                  onClick={() => declareWinner(activeRunners[0].id)}
                  style={{
                    background: "linear-gradient(135deg, gold, #cc9900)",
                    color: "#000",
                    border: "none",
                    borderRadius: 12,
                    padding: "16px 40px",
                    cursor: "pointer",
                    fontSize: 22,
                    fontFamily: "'Bebas Neue', sans-serif",
                    letterSpacing: 3,
                  }}
                >
                  🏆 Déclarer {activeRunners[0].name} Vainqueur
                </button>
              </div>
            )}

            {/* Eliminated runners — with reinstate option */}
            {eliminatedRunners.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: "#555",
                    letterSpacing: 2,
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  🏳️ Éliminés ({eliminatedRunners.length})
                </div>
                {eliminatedRunners.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "8px 12px",
                      borderRadius: 8,
                      marginBottom: 4,
                      background: "rgba(255,0,0,0.04)",
                      border: "1px solid #331111",
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 15, color: "#664444" }}>
                      💀 {r.name}
                      <span style={{ fontSize: 12, color: "#444", marginLeft: 8 }}>
                        {r.eliminatedAt?.reason === "abandon" ? "abandon" : "hors délai"} · boucle {r.eliminatedAt?.loop}
                      </span>
                    </span>
                    <button
                      onClick={() => reinstateRunner(r.id)}
                      style={{
                        background: "none",
                        border: "1px solid #224422",
                        borderRadius: 6,
                        color: "#44aa44",
                        padding: "4px 12px",
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      ↩ Réintégrer
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Runner history */}
            {state.runners.some((r) => r.loops.length > 0) && (
              <div style={{ marginTop: 30 }}>
                <div
                  style={{
                    fontSize: 14,
                    color: "#555",
                    letterSpacing: 2,
                    marginBottom: 12,
                    textTransform: "uppercase",
                  }}
                >
                  📊 Historique des boucles
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: 12,
                    border: "1px solid #1a1a2e",
                    overflow: "hidden",
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #222" }}>
                        <th
                          style={{
                            padding: "10px 14px",
                            textAlign: "left",
                            color: "#555",
                            fontSize: 12,
                            letterSpacing: 1,
                          }}
                        >
                          COUREUR
                        </th>
                        <th
                          style={{
                            padding: "10px 14px",
                            textAlign: "center",
                            color: "#555",
                            fontSize: 12,
                            letterSpacing: 1,
                          }}
                        >
                          BOUCLES
                        </th>
                        <th
                          style={{
                            padding: "10px 14px",
                            textAlign: "right",
                            color: "#555",
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
                              borderBottom: "1px solid rgba(255,255,255,0.03)",
                            }}
                          >
                            <td
                              style={{
                                padding: "10px 14px",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  color:
                                    r.status === "dnf" ? "#664444" : "#eee",
                                }}
                              >
                                {r.status === "dnf" && "💀 "}
                                {r.name}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "10px 14px",
                                textAlign: "center",
                                color: "#888",
                              }}
                            >
                              {r.loops.length}
                            </td>
                            <td
                              style={{
                                padding: "10px 14px",
                                textAlign: "right",
                                color: "#666",
                                fontSize: 13,
                              }}
                            >
                              {r.loops
                                .map((l) => formatTime(l.timeMs))
                                .join(" · ")}
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

        {/* Instructions */}
        <div
          style={{
            marginTop: 30,
            padding: 16,
            background: "rgba(68,136,255,0.05)",
            border: "1px solid rgba(68,136,255,0.1)",
            borderRadius: 10,
            fontSize: 13,
            color: "#556",
            lineHeight: 1.6,
          }}
        >
          💡 <strong>Mode d&apos;emploi :</strong> Ouvre un 2e onglet avec{" "}
          <code>/ </code> dans l&apos;URL pour afficher le dashboard TV. Cet
          onglet est l&apos;admin. Les deux se synchronisent automatiquement.
        </div>
      </div>

      {/* Undo toasts */}
      <UndoToast
        actions={undoActions}
        onUndo={undoAction}
        onDismiss={dismissAction}
      />

      {/* Reset tout — triple confirmation modal */}
      {resetStep > 0 && (
        <div
          onClick={() => setResetStep(0)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1a0808",
              border: "1px solid #551111",
              borderRadius: 16,
              padding: "28px 24px",
              width: "100%",
              maxWidth: 400,
              textAlign: "center",
            }}
          >
            {resetStep === 1 && (
              <>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Reset total</div>
                <div style={{ fontSize: 14, color: "#888", marginBottom: 24 }}>
                  Tout sera effacé : coureurs, boucles, photos. Cette action est irréversible.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setResetStep(0)} style={{ flex: 1, background: "none", border: "1px solid #333", borderRadius: 10, padding: "12px", color: "#888", cursor: "pointer", fontSize: 15 }}>
                    Annuler
                  </button>
                  <button onClick={() => setResetStep(2)} style={{ flex: 1, background: "#cc2222", border: "none", borderRadius: 10, padding: "12px", color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
                    Continuer →
                  </button>
                </div>
              </>
            )}
            {resetStep === 2 && (
              <>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Tu es sûr ?</div>
                <div style={{ fontSize: 14, color: "#888", marginBottom: 24 }}>
                  {state.runners.length} coureur{state.runners.length !== 1 ? "s" : ""} et toutes les données de course seront perdus.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setResetStep(0)} style={{ flex: 1, background: "none", border: "1px solid #333", borderRadius: 10, padding: "12px", color: "#888", cursor: "pointer", fontSize: 15 }}>
                    Annuler
                  </button>
                  <button onClick={() => setResetStep(3)} style={{ flex: 1, background: "#cc2222", border: "none", borderRadius: 10, padding: "12px", color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
                    Oui, effacer →
                  </button>
                </div>
              </>
            )}
            {resetStep === 3 && (
              <>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💀</div>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Dernière chance</div>
                <div style={{ fontSize: 14, color: "#cc4444", marginBottom: 24 }}>
                  Après ça, il n'y a pas de retour en arrière. Vraiment.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setResetStep(0)} style={{ flex: 1, background: "none", border: "1px solid #333", borderRadius: 10, padding: "12px", color: "#888", cursor: "pointer", fontSize: 15 }}>
                    Annuler
                  </button>
                  <button
                    onClick={() => { setState({ ...DEFAULT_STATE }); setResetStep(0); }}
                    style={{ flex: 1, background: "#881111", border: "1px solid #cc2222", borderRadius: 10, padding: "12px", color: "#ff6666", cursor: "pointer", fontSize: 15, fontWeight: 700 }}
                  >
                    RESET DÉFINITIF
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile runner action modal */}
      {modalRunnerId && (() => {
        const r = state.runners.find((x) => x.id === modalRunnerId);
        if (!r) return null;
        const hasFinishedThisLoop = r.loops.some((l) => l.loop === currentLoop);
        return (
          <div
            onClick={() => setModalRunnerId(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              zIndex: 1000,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#151525",
                borderRadius: "20px 20px 0 0",
                padding: "24px 20px 40px",
                width: "100%",
                maxWidth: 480,
                border: "1px solid #222",
              }}
            >
              {/* Runner identity */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid #333",
                    background: "#1a1a2e",
                    flexShrink: 0,
                  }}
                >
                  {r.photo ? (
                    <img src={r.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏃</div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: 13, color: "#666" }}>
                    {r.loops.length} boucle{r.loops.length !== 1 ? "s" : ""}
                    {hasFinishedThisLoop && " · ✅ Boucle {currentLoop} validée"}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {!hasFinishedThisLoop && (
                  <button
                    onClick={() => { recordArrival(r.id); setModalRunnerId(null); }}
                    style={{
                      background: "#00cc66",
                      color: "#000",
                      border: "none",
                      borderRadius: 12,
                      padding: "16px",
                      cursor: "pointer",
                      fontSize: 18,
                      fontWeight: 700,
                      fontFamily: "'Oswald', sans-serif",
                      letterSpacing: 1,
                    }}
                  >
                    ✅ Arrivée boucle {currentLoop}
                  </button>
                )}
                {hasFinishedThisLoop && (
                  <div style={{ textAlign: "center", color: "#00ff88", fontSize: 15, padding: "12px 0" }}>
                    ✅ Boucle {currentLoop} déjà validée
                  </div>
                )}
                <button
                  onClick={() => { eliminateRunner(r.id, "abandon"); setModalRunnerId(null); }}
                  style={{
                    background: "rgba(170,68,68,0.15)",
                    color: "#cc6666",
                    border: "1px solid #442222",
                    borderRadius: 12,
                    padding: "14px",
                    cursor: "pointer",
                    fontSize: 16,
                    fontFamily: "'Oswald', sans-serif",
                    letterSpacing: 1,
                  }}
                >
                  🏳️ Abandon
                </button>
                <button
                  onClick={() => { eliminateRunner(r.id, "timeout"); setModalRunnerId(null); }}
                  style={{
                    background: "rgba(200,50,50,0.15)",
                    color: "#cc4444",
                    border: "1px solid #551111",
                    borderRadius: 12,
                    padding: "14px",
                    cursor: "pointer",
                    fontSize: 16,
                    fontFamily: "'Oswald', sans-serif",
                    letterSpacing: 1,
                  }}
                >
                  ⏰ Hors délai
                </button>
                <button
                  onClick={() => setModalRunnerId(null)}
                  style={{
                    background: "none",
                    color: "#555",
                    border: "1px solid #222",
                    borderRadius: 12,
                    padding: "12px",
                    cursor: "pointer",
                    fontSize: 15,
                    marginTop: 4,
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
