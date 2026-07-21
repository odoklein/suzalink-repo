"use client";

import { useMemo } from "react";
import { toLocalDateKey, getDaysInRange, getLoadLevel, LOAD_COLORS } from "../_lib/calendar-utils";
import type { CalendarMember } from "../_lib/types";

interface AvailabilityViewProps {
  calendarDate: Date;
  members: CalendarMember[];
  dateRange: { from: Date; to: Date };
}

export function AvailabilityView({ calendarDate, members, dateRange }: AvailabilityViewProps) {
  const days = useMemo(() => getDaysInRange(dateRange.from, dateRange.to), [dateRange]);
  const todayKey = toLocalDateKey(new Date());
  const month = calendarDate.getMonth();

  const dayWidth = 36;
  const labelWidth = 180;
  const totalWidth = labelWidth + days.length * dayWidth;

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{ minWidth: totalWidth }}>
        {/* Day headers */}
        <div style={{ display: "flex", position: "sticky", top: 0, zIndex: 10, background: "var(--elan-surface)", borderBottom: "1px solid var(--elan-line)" }}>
          <div style={{
            width: labelWidth, flexShrink: 0, padding: "8px 12px", fontSize: 11, fontWeight: 600,
            color: "var(--elan-slate)", fontFamily: "var(--font-elan-sans)",
            borderRight: "1px solid var(--elan-line)",
          }}>
            Membre
          </div>
          <div style={{ display: "flex" }}>
            {days.map((d) => {
              const key = toLocalDateKey(d);
              const isToday = key === todayKey;
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              const isInMonth = d.getMonth() === month;
              return (
                <div key={key} style={{
                  width: dayWidth, textAlign: "center", padding: "6px 0", fontSize: 10,
                  fontFamily: "var(--font-elan-sans)",
                  fontWeight: isToday ? 700 : 400,
                  color: isToday ? "var(--elan-petrol)" : isWeekend ? "var(--elan-slate)" : "var(--elan-ink-soft)",
                  opacity: isInMonth ? 1 : 0.4,
                  borderRight: d.getDay() === 0 ? "1px solid var(--elan-line)" : "none",
                }}>
                  <div>{d.toLocaleDateString("fr-FR", { weekday: "narrow" })}</div>
                  <div style={{ fontWeight: isToday ? 700 : 500 }}>{d.getDate()}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16, padding: "6px 12px",
          borderBottom: "1px solid var(--elan-line)", background: "var(--elan-paper)",
        }}>
          <span style={{ fontSize: 11, color: "var(--elan-slate)", fontFamily: "var(--font-elan-sans)" }}>Charge :</span>
          {(["available", "moderate", "full", "overloaded"] as const).map((level) => (
            <div key={level} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: LOAD_COLORS[level] }} />
              <span style={{ fontSize: 11, fontFamily: "var(--font-elan-sans)", color: "var(--elan-ink-soft)" }}>
                {level === "available" ? "Libre" : level === "moderate" ? "< 6h" : level === "full" ? "6-8h" : "> 8h"}
              </span>
            </div>
          ))}
        </div>

        {/* Member rows */}
        {members.map((member) => (
          <div key={member.id} style={{ display: "flex", borderBottom: "1px solid var(--elan-line)" }}>
            <div style={{
              width: labelWidth, flexShrink: 0, padding: "8px 12px",
              display: "flex", alignItems: "center", gap: 8,
              borderRight: "1px solid var(--elan-line)", position: "sticky", left: 0,
              background: "var(--elan-surface)", zIndex: 5,
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: "50%", background: "var(--elan-petrol)",
                color: "#fff", fontSize: 12, fontWeight: 600, display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
                fontFamily: "var(--font-elan-sans)",
              }}>
                {member.name.charAt(0).toUpperCase()}
              </span>
              <span style={{ fontSize: 13, fontFamily: "var(--font-elan-sans)", color: "var(--elan-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {member.name}
              </span>
            </div>
            <div style={{ display: "flex" }}>
              {days.map((d) => {
                const key = toLocalDateKey(d);
                const isToday = key === todayKey;
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                const load = member.dailyLoad[key];
                const hours = load?.hours || 0;
                const taskCount = load?.taskCount || 0;
                const level = isWeekend ? "available" : getLoadLevel(hours);

                return (
                  <div
                    key={key}
                    title={isWeekend ? "Week-end" : `${member.name}\n${hours.toFixed(1)}h · ${taskCount} tâche${taskCount !== 1 ? "s" : ""}`}
                    style={{
                      width: dayWidth, height: 44,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isWeekend ? "rgba(0,0,0,0.03)" : LOAD_COLORS[level],
                      opacity: isWeekend ? 0.5 : (level === "available" ? 0.4 : 0.7),
                      borderRight: d.getDay() === 0 ? "1px solid var(--elan-line)" : "none",
                      borderLeft: isToday ? "2px solid var(--elan-petrol)" : "none",
                      fontSize: 10, fontWeight: 600, fontFamily: "var(--font-elan-mono)",
                      color: level === "overloaded" ? "#fff" : "var(--elan-ink-soft)",
                      cursor: "default",
                      transition: "opacity 0.1s",
                    }}
                    onMouseEnter={(e) => { if (!isWeekend) e.currentTarget.style.opacity = "1" }}
                    onMouseLeave={(e) => { if (!isWeekend) e.currentTarget.style.opacity = level === "available" ? "0.4" : "0.7" }}
                  >
                    {!isWeekend && hours > 0 ? hours.toFixed(0) : ""}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: "var(--elan-slate)", fontSize: 14, fontFamily: "var(--font-elan-sans)" }}>
            Aucun membre trouvé dans vos projets
          </div>
        )}
      </div>
    </div>
  );
}
