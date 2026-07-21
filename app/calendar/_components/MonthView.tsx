"use client";

import { useMemo } from "react";
import { Diamond } from "lucide-react";
import { buildCalendarDays, toLocalDateKey, groupTasksByDate, groupMilestonesByDate } from "../_lib/calendar-utils";
import type { CalendarTask, CalendarMilestone } from "../_lib/types";

interface MonthViewProps {
  calendarDate: Date;
  tasks: CalendarTask[];
  milestones: CalendarMilestone[];
  onDayClick: (date: Date) => void;
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function MonthView({ calendarDate, tasks, milestones, onDayClick }: MonthViewProps) {
  const calendarDays = useMemo(() => buildCalendarDays(calendarDate), [calendarDate]);
  const tasksByDate = useMemo(() => groupTasksByDate(tasks), [tasks]);
  const milestonesByDate = useMemo(() => groupMilestonesByDate(milestones), [milestones]);
  const todayKey = toLocalDateKey(new Date());

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
        borderBottom: "1px solid var(--elan-line)", flexShrink: 0,
      }}>
        {WEEKDAYS.map((d) => (
          <div key={d} style={{
            padding: "8px 0", textAlign: "center", fontSize: 11, fontWeight: 600,
            textTransform: "uppercase", color: "var(--elan-slate)", letterSpacing: "0.05em",
            fontFamily: "var(--font-elan-sans)",
          }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
        flex: 1, gridAutoRows: "1fr", overflow: "auto",
      }}>
        {calendarDays.map(({ date, inMonth }) => {
          const key = toLocalDateKey(date);
          const dayTasks = tasksByDate.get(key) || [];
          const dayMilestones = milestonesByDate.get(key) || [];
          const isToday = key === todayKey;
          const hasItems = dayTasks.length > 0 || dayMilestones.length > 0;

          return (
            <div
              key={key}
              onClick={() => onDayClick(date)}
              style={{
                borderRight: "1px solid var(--elan-line)", borderBottom: "1px solid var(--elan-line)",
                padding: "6px 8px", minHeight: 90, cursor: hasItems ? "pointer" : "default",
                background: isToday ? "rgba(12, 59, 56, 0.04)" : "transparent",
                opacity: inMonth ? 1 : 0.4,
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { if (hasItems) (e.currentTarget.style.background = "var(--elan-paper)") }}
              onMouseLeave={(e) => { e.currentTarget.style.background = isToday ? "rgba(12, 59, 56, 0.04)" : "transparent" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{
                  fontSize: 13, fontWeight: isToday ? 700 : 400,
                  fontFamily: "var(--font-elan-sans)",
                  color: isToday ? "var(--elan-petrol)" : "var(--elan-ink-soft)",
                  ...(isToday ? {
                    background: "var(--elan-petrol)", color: "#fff", width: 24, height: 24,
                    borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12,
                  } : {}),
                }}>
                  {date.getDate()}
                </span>
                {(dayTasks.length + dayMilestones.length) > 3 && (
                  <span style={{ fontSize: 10, color: "var(--elan-slate)", fontFamily: "var(--font-elan-sans)" }}>
                    {dayTasks.length + dayMilestones.length}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {dayMilestones.slice(0, 1).map((m) => (
                  <div key={m.id} style={{
                    display: "flex", alignItems: "center", gap: 4, padding: "2px 6px",
                    borderRadius: 4, background: `${m.project.color}18`, fontSize: 11,
                    fontFamily: "var(--font-elan-sans)", color: m.project.color, fontWeight: 600,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    <Diamond size={10} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</span>
                  </div>
                ))}
                {dayTasks.slice(0, 3 - Math.min(dayMilestones.length, 1)).map((t) => (
                  <div key={t.id} style={{
                    display: "flex", alignItems: "center", gap: 4, padding: "2px 6px",
                    borderRadius: 4, fontSize: 11, fontFamily: "var(--font-elan-sans)",
                    color: "var(--elan-ink)", overflow: "hidden",
                    borderLeft: `2px solid ${t.project.color}`,
                    background: "var(--elan-paper)",
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                      background: t.status === "DONE" ? "var(--elan-success)" : t.status === "IN_PROGRESS" ? "var(--elan-amber)" : "var(--elan-paper-3)",
                    }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                  </div>
                ))}
                {(dayTasks.length + dayMilestones.length) > 3 && (
                  <div style={{ fontSize: 10, color: "var(--elan-slate)", paddingLeft: 6, fontFamily: "var(--font-elan-sans)" }}>
                    + {dayTasks.length + dayMilestones.length - 3} autre{dayTasks.length + dayMilestones.length - 3 > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
