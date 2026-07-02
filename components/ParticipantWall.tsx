"use client";

import { Runner } from "@/types";
import { ACCENT_GOLD } from "@/lib/constants";

interface ParticipantCardProps {
  runner: Runner;
  size: number;
}

function ParticipantCard({ runner, size }: ParticipantCardProps) {
  const eliminated = runner.status === "dnf";
  const winner = runner.status === "winner";
  const nameSize = Math.max(12, Math.round(size * 0.16));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        width: size + 12,
      }}
    >
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          border: winner
            ? `3px solid ${ACCENT_GOLD}`
            : eliminated
              ? "3px solid #441111"
              : `3px solid ${ACCENT_GOLD}55`,
          background: "#1a1a2e",
          boxShadow: winner ? `0 0 20px rgba(226,197,67,0.5)` : "none",
        }}
      >
        {runner.photo ? (
          <img
            src={runner.photo}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: eliminated ? "grayscale(100%) brightness(0.6)" : "none",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: size * 0.35,
              filter: eliminated ? "grayscale(100%) brightness(0.6)" : "none",
            }}
          >
            {eliminated ? "💀" : "🏃"}
          </div>
        )}
        {eliminated && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "140%",
              height: 4,
              background: "#ff2222",
              transform: "translate(-50%, -50%) rotate(-45deg)",
              boxShadow: "0 0 8px rgba(255,0,0,0.6)",
            }}
          />
        )}
        {winner && (
          <div
            style={{
              position: "absolute",
              top: -10,
              right: -4,
              fontSize: size * 0.25,
            }}
          >
            👑
          </div>
        )}
      </div>
      <div
        style={{
          fontFamily: "'Oswald', sans-serif",
          fontSize: nameSize,
          color: winner ? ACCENT_GOLD : eliminated ? "#664444" : "#ddd",
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: size + 12,
        }}
      >
        {runner.name}
      </div>
    </div>
  );
}

interface ParticipantWallProps {
  runners: Runner[];
  size?: number;
  title?: string;
}

export function ParticipantWall({
  runners,
  size = 72,
  title = "🦑 Mur des participants",
}: ParticipantWallProps) {
  if (runners.length === 0) return null;

  return (
    <div>
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: Math.max(16, Math.round(size * 0.28)),
          color: ACCENT_GOLD,
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: 18,
          textShadow: "0 0 16px rgba(226,197,67,0.25)",
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: size * 0.3,
        }}
      >
        {runners.map((r) => (
          <ParticipantCard key={r.id} runner={r} size={size} />
        ))}
      </div>
    </div>
  );
}
