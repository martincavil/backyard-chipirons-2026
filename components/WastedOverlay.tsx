"use client";

import { useEffect } from "react";

interface WastedOverlayProps {
  name: string;
  onDone: () => void;
}

export function WastedOverlay({ name, onDone }: WastedOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1500);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDone();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(60px, 12vw, 140px)",
            color: "#cc0000",
            textShadow: "0 0 60px rgba(255,0,0,0.6), 0 4px 0 #440000",
            letterSpacing: "12px",
            animation: "wastedZoom 0.3s cubic-bezier(0.2, 0, 0.2, 1)",
            filter: "grayscale(30%)",
          }}
        >
          ÉLIMINÉ
        </div>
        <div
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: "clamp(18px, 3vw, 32px)",
            color: "#aa4444",
            marginTop: 12,
            letterSpacing: "3px",
          }}
        >
          {name}
        </div>
      </div>
    </div>
  );
}
