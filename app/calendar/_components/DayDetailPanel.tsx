"use client";

import { X, Diamond, Flag } from "lucide-react";
import type { CalendarTask, CalendarMilestone } from "../_lib/types";
import { STATUS_LABELS, PRIORITY_LABELS, PRIORITY_COLORS } from "../_lib/calendar-utils";

interface DayDetailPanelProps {
  date: Date;
  tasks: CalendarTask[];
  milestones: CalendarMilestone[];
  onClose: () => void;
}

export function DayDetailPanel({ date, tasks, milestones, onClose }: DayDetailPanelProps) {
  const dateLabel = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{
      width: 380, borderLeft: "1px solid var(--elan-line)", background: "var(--elan-surface)",
      display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px", borderBottom: "1px solid var(--elan-line)",
      }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, fontFamily: "var(--font-elan-display)", color: "var(--elan-ink)", textTransform: "capitalize" }}>
            {dateLabel}
          </h3>
          <p style={{ fontSize: 12, color: "var(--elan-slate)", margin: "2px 0 0", fontFamily: "var(--font-elan-sans)" }}>
            {tasks.length} tâche{tasks.length !== 1 ? "s" : ""} · {milestones.length} jalon{milestones.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button type="button" onClick={onClose} style={{
          width: 28, height: 28, borderRadius: 6, border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--elan-paper)", color: "var(--elan-ink-soft)",
        }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
        {milestones.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "var(--elan-slate)", marginBottom: 8, letterSpacing: "0.05em", fontFamily: "var(--font-elan-sans)" }}>
              Jalons
            </div>
            {milestones.map((m) => (
              <div key={m.id} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: 8, background: "var(--elan-paper)", marginBottom: 6,
              }}>
                <Diamond size={14} style={{ color: m.project.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--elan-ink)", fontFamily: "var(--font-elan-sans)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--elan-slate)", fontFamily: "var(--font-elan-sans)" }}>
                    {m.project.name}
                  </div>
                </div>
                {m.completedAt && (
                  <span style={{ fontSize: 11, color: "var(--elan-success)", fontWeight: 600 }}>✓</span>
                )}
              </div>
            ))}
          </div>
        )}

        {tasks.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "var(--elan-slate)", marginBottom: 8, letterSpacing: "0.05em", fontFamily: "var(--font-elan-sans)" }}>
              Tâches
            </div>
            {tasks.map((t) => (
              <div key={t.id} style={{
                padding: "10px 12px", borderRadius: 8, background: "var(--elan-paper)",
                marginBottom: 6, borderLeft: `3px solid ${t.project.color}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--elan-ink)", fontFamily: "var(--font-elan-sans)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.title}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "var(--elan-slate)", fontFamily: "var(--font-elan-sans)" }}>
                    {t.project.name}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4,
                    background: "var(--elan-paper-2)", color: "var(--elan-ink-soft)",
                    fontFamily: "var(--font-elan-sans)",
                  }}>
                    {STATUS_LABELS[t.status] || t.status}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 10, color: PRIORITY_COLORS[t.priority] }}>
                    <Flag size={10} /> {PRIORITY_LABELS[t.priority]}
                  </span>
                  {t.assignee && (
                    <span style={{ fontSize: 11, color: "var(--elan-slate)", fontFamily: "var(--font-elan-sans)" }}>
                      → {t.assignee.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tasks.length === 0 && milestones.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: "var(--elan-slate)", fontSize: 13, fontFamily: "var(--font-elan-sans)" }}>
            Aucun élément pour cette journée
          </div>
        )}
      </div>
    </div>
  );
}
