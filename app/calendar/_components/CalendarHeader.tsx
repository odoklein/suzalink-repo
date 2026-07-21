"use client";

import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import type { ViewType } from "../_lib/types";

interface CalendarHeaderProps {
  calendarDate: Date;
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  onNavigate: (direction: -1 | 0 | 1) => void;
  backHref: string;
  children?: React.ReactNode;
}

const VIEW_TABS: { value: ViewType; label: string }[] = [
  { value: "month", label: "Mois" },
  { value: "week", label: "Semaine" },
  { value: "timeline", label: "Timeline" },
  { value: "availability", label: "Disponibilité" },
];

export function CalendarHeader({ calendarDate, view, onViewChange, onNavigate, backHref, children }: CalendarHeaderProps) {
  const title = view === "week"
    ? `Semaine du ${calendarDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`
    : calendarDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <header style={{
      display: "flex", alignItems: "center", gap: 16, padding: "12px 24px",
      borderBottom: "1px solid var(--elan-line)", background: "var(--elan-surface)",
      flexShrink: 0, minHeight: 56,
    }}>
      <a href={backHref} style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 36, height: 36, borderRadius: 8, color: "var(--elan-ink-soft)",
        textDecoration: "none", flexShrink: 0,
      }}
        title="Retour"
      >
        <ArrowLeft size={18} />
      </a>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button type="button" onClick={() => onNavigate(-1)} style={navBtnStyle} aria-label="Précédent">
          <ChevronLeft size={16} />
        </button>
        <button type="button" onClick={() => onNavigate(0)} style={{
          ...navBtnStyle, padding: "4px 12px", fontSize: 13, fontWeight: 500,
          fontFamily: "var(--font-elan-sans)",
        }}>
          Aujourd'hui
        </button>
        <button type="button" onClick={() => onNavigate(1)} style={navBtnStyle} aria-label="Suivant">
          <ChevronRight size={16} />
        </button>
      </div>

      <h1 style={{
        fontSize: 16, fontWeight: 600, fontFamily: "var(--font-elan-display)",
        color: "var(--elan-ink)", textTransform: "capitalize", margin: 0, whiteSpace: "nowrap",
      }}>
        {title}
      </h1>

      <div style={{ flex: 1 }} />

      <div style={{
        display: "flex", borderRadius: 8, overflow: "hidden",
        border: "1px solid var(--elan-line)", background: "var(--elan-paper)",
      }}>
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onViewChange(tab.value)}
            style={{
              padding: "6px 14px", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer",
              fontFamily: "var(--font-elan-sans)",
              background: view === tab.value ? "var(--elan-petrol)" : "transparent",
              color: view === tab.value ? "#fff" : "var(--elan-ink-soft)",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {children}
    </header>
  );
}

const navBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 32, height: 32, borderRadius: 6, border: "1px solid var(--elan-line)",
  background: "var(--elan-surface)", cursor: "pointer", color: "var(--elan-ink-soft)",
};
