import {
  EVENT_NAME,
  EVENT_LOCATION,
  LOOP_DISTANCE_KM,
  LOOP_ELEVATION_M,
  MAX_LOOPS,
  FIRST_START_HOUR,
  LAST_START_HOUR,
  ACCENT_GOLD,
} from "@/lib/constants";

import Link from "next/link";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        marginBottom: 32,
        background: "rgba(226,197,67,0.05)",
        border: "1px solid rgba(226,197,67,0.18)",
        borderRadius: 12,
        padding: 24,
      }}
    >
      <h2
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 24,
          letterSpacing: 2,
          color: ACCENT_GOLD,
          marginBottom: 12,
        }}
      >
        {title}
      </h2>
      <div style={{ fontFamily: "'Oswald', sans-serif", lineHeight: 1.7 }}>
        {children}
      </div>
    </section>
  );
}

export default function InfosPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050a14",
        color: "#ddd",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(32px, 6vw, 52px)",
            letterSpacing: 3,
            color: "#fff",
            textAlign: "center",
            marginBottom: 4,
          }}
        >
          🦑 {EVENT_NAME}
        </h1>
        <p
          style={{
            fontFamily: "'Oswald', sans-serif",
            textAlign: "center",
            color: "#666",
            marginBottom: 40,
          }}
        >
          Samedi 4 juillet 2026 · {EVENT_LOCATION}
        </p>

        <Section title="Le concept">
          <p>
            Une course inspirée du format <strong>Backyard Ultra</strong>. Une
            boucle de <strong>{LOOP_DISTANCE_KM} km</strong> ({LOOP_ELEVATION_M}{" "}
            m D+), majoritairement en forêt. Départ toutes les heures : il faut
            terminer sa boucle avant le départ suivant, sinon c&apos;est
            l&apos;élimination. Un seul vainqueur : le dernier capable de
            repartir.
          </p>
          <p style={{ marginTop: 8, color: "#999" }}>
            Pas de chrono officiel, pas de podium, pas de top 3.
          </p>
        </Section>

        <Section title="Le format Chipiron(e)s">
          <p>
            Premier départ à <strong>{FIRST_START_HOUR}h00 pile</strong>{" "}
            (rendez-vous coureurs 9h30 max). Dernier départ possible à{" "}
            {LAST_START_HOUR}h00, fin de course max 20h00.
          </p>
          <p style={{ marginTop: 8 }}>
            Soit un maximum de <strong>{MAX_LOOPS} boucles</strong>, environ{" "}
            {(MAX_LOOPS * LOOP_DISTANCE_KM).toFixed(0)} km et{" "}
            {MAX_LOOPS * LOOP_ELEVATION_M} m D+.
          </p>
        </Section>

        <Section title="Le jour J">
          <ul style={{ paddingLeft: 20 }}>
            <li>Rendez-vous coureurs : 9h30 maximum</li>
            <li>Premier départ : 10h00 pile</li>
            <li>Lieu : {EVENT_LOCATION}</li>
            <li>
              BBQ, bières (offertes par notre sponsor officiel 🍺), ambiance
              backyard
            </li>
          </ul>
        </Section>

        <p
          style={{
            fontFamily: "'Oswald', sans-serif",
            textAlign: "center",
            color: "#555",
            fontSize: 13,
            marginTop: 40,
          }}
        >
          Règlement complet :{" "}
          <Link
            href="https://drive.google.com/file/d/1w4FU98OfHkGJ2Xt7_QiZ0wwz2mpbl3eX/view?usp=sharing"
            target="_blank"
            style={{ color: ACCENT_GOLD }}
          >
            ici
          </Link>
        </p>
      </div>
    </main>
  );
}
