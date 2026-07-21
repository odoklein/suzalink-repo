"use client";

import { useMemo } from "react";
import { Diamond } from "lucide-react";
import { toLocalDateKey, getDaysInRange, STATUS_LABELS } from "../_lib/calendar-utils";
import type { CalendarTask, CalendarMilestone, CalendarProject } from "../_lib/types";

interface TimelineViewProps {
  calendarDate: Date;
  tasks: CalendarTask[];
  milestones: CalendarMilestone[];
  projects: CalendarProject[];
  dateRange: { from: Date; to: Date };
}

export function TimelineView({ calendarDate, tasks, milestones, projects, dateRange }: TimelineViewProps) {
  const days = useMemo(() => getDaysInRange(dateRange.from, dateRange.to), [dateRange]);
  const todayKey = toLocalDateKey(new Date());
  const month = calendarDate.getMonth();

  const grouped = useMemo(() => {
    const map = new Map<string, { project: CalendarProject; tasks: CalendarTask[]; milestones: CalendarMilestone[] }>();
    for (const p of projects) {
      map.set(p.id, { project: p, tasks: [], milestones: [] });
    }
    for (const t of tasks) {
      const group = map.get(t.project.id);
      if (group) group.tasks.push(t);
    }
    for (const m of milestones) {
      const group = map.get(m.project.id);
      if (group) group.milestones.push(m);
    }
    return Array.from(map.values()).filter((g) => g.tasks.length > 0 || g.milestones.length > 0);
  }, [tasks, milestones, projects]);

  const dayWidth = 36;
  const labelWidth = 220;
  const totalWidth = labelWidth + days.length * dayWidth;

  const dateToCol = (dateStr: string): number => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    const fromNorm = new Date(dateRange.from);
    fromNorm.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - fromNorm.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(days.length - 1, diff));
  };

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{ minWidth: totalWidth }}>
        {/* Day headers */}
        <div style={{ display: "flex", position: "sticky", top: 0, zIndex: 10, background: "var(--elan-surface)", borderBottom: "1px solid var(--elan-line)" }}>
          <div style={{ width: labelWidth, flexShrink: 0, padding: "8px 12px", fontSize: 11, fontWeight: 600, color: "var(--elan-slate)", fontFamily: "var(--font-elan-sans)", borderRight: "1px solid var(--elan-line)" }}>
            Projet / Tâche
          </div>
          <div style={{ display: "flex" }}>
            {days.map((d, i) => {
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

        {/* Project groups */}
        {grouped.map(({ project, tasks: pTasks, milestones: pMilestones }) => (
          <div key={project.id}>
            {/* Project header row */}
            <div style={{
              display: "flex", borderBottom: "1px solid var(--elan-line)",
              background: "var(--elan-paper)", position: "relative",
            }}>
              <div style={{
                width: labelWidth, flexShrink: 0, padding: "8px 12px",
                display: "flex", alignItems: "center", gap: 8,
                borderRight: "1px solid var(--elan-line)", position: "sticky", left: 0,
                background: "var(--elan-paper)", zIndex: 5,
              }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: project.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-elan-display)", color: "var(--elan-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {project.name}
                </span>
                <span style={{ fontSize: 11, color: "var(--elan-slate)", fontFamily: "var(--font-elan-sans)", flexShrink: 0 }}>
                  {pTasks.length}
                </span>
              </div>
              <div style={{ display: "flex", position: "relative", height: 36 }}>
                {days.map((d) => {
                  const key = toLocalDateKey(d);
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <div key={key} style={{
                      width: dayWidth, height: "100%",
                      background: isWeekend ? "rgba(0,0,0,0.02)" : "transparent",
                      borderRight: d.getDay() === 0 ? "1px solid var(--elan-line)" : "none",
                    }} />
                  );
                })}
                {/* Project span bar */}
                {project.startDate && project.endDate && (() => {
                  const startCol = dateToCol(project.startDate);
                  const endCol = dateToCol(project.endDate);
                  return (
                    <div style={{
                      position: "absolute", top: 14, height: 8, borderRadius: 4,
                      background: `${project.color}30`,
                      left: startCol * dayWidth, width: (endCol - startCol + 1) * dayWidth,
                    }} />
                  );
                })()}
              </div>
            </div>

            {/* Task rows */}
            {pTasks.map((t) => {
              const startStr = t.startDate || t.dueDate;
              const endStr = t.dueDate || t.startDate;
              return (
                <div key={t.id} style={{ display: "flex", borderBottom: "1px solid var(--elan-line)" }}>
                  <div style={{
                    width: labelWidth, flexShrink: 0, padding: "6px 12px 6px 28px",
                    display: "flex", alignItems: "center", gap: 6,
                    borderRight: "1px solid var(--elan-line)", position: "sticky", left: 0,
                    background: "var(--elan-surface)", zIndex: 5,
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                      background: t.status === "DONE" ? "var(--elan-success)" : t.status === "IN_PROGRESS" ? "var(--elan-amber)" : "var(--elan-paper-3)",
                    }} />
                    <span style={{ fontSize: 12, fontFamily: "var(--font-elan-sans)", color: "var(--elan-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      {t.title}
                    </span>
                    {t.assignee && (
                      <span style={{
                        width: 20, height: 20, borderRadius: "50%", background: project.color,
                        color: "#fff", fontSize: 10, fontWeight: 600, display: "flex",
                        alignItems: "center", justifyContent: "center", flexShrink: 0,
                        fontFamily: "var(--font-elan-sans)",
                      }}>
                        {t.assignee.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", position: "relative", height: 32 }}>
                    {days.map((d) => {
                      const key = toLocalDateKey(d);
                      const isToday = key === todayKey;
                      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                      return (
                        <div key={key} style={{
                          width: dayWidth, height: "100%",
                          background: isToday ? "rgba(12, 59, 56, 0.04)" : isWeekend ? "rgba(0,0,0,0.02)" : "transparent",
                          borderRight: d.getDay() === 0 ? "1px solid var(--elan-line)" : "none",
                        }} />
                      );
                    })}
                    {/* Task bar */}
                    {startStr && endStr && (() => {
                      const startCol = dateToCol(startStr);
                      const endCol = dateToCol(endStr);
                      const w = Math.max((endCol - startCol + 1) * dayWidth, dayWidth);
                      return (
                        <div style={{
                          position: "absolute", top: 8, height: 16, borderRadius: 8,
                          background: project.color, opacity: t.status === "DONE" ? 0.5 : 0.85,
                          left: startCol * dayWidth + 2, width: w - 4,
                          display: "flex", alignItems: "center", paddingLeft: 6,
                          fontSize: 10, color: "#fff", fontWeight: 500, fontFamily: "var(--font-elan-sans)",
                          overflow: "hidden", whiteSpace: "nowrap",
                        }}>
                          {w > 80 ? t.title : ""}
                        </div>
                      );
                    })()}
                    {/* Single-date task (dot) */}
                    {startStr && !endStr && (() => {
                      const col = dateToCol(startStr);
                      return (
                        <div style={{
                          position: "absolute", top: 10, left: col * dayWidth + dayWidth / 2 - 5,
                          width: 10, height: 10, borderRadius: "50%", background: project.color,
                        }} />
                      );
                    })()}
                  </div>
                </div>
              );
            })}

            {/* Milestone rows */}
            {pMilestones.map((m) => (
              <div key={m.id} style={{ display: "flex", borderBottom: "1px solid var(--elan-line)" }}>
                <div style={{
                  width: labelWidth, flexShrink: 0, padding: "6px 12px 6px 28px",
                  display: "flex", alignItems: "center", gap: 6,
                  borderRight: "1px solid var(--elan-line)", position: "sticky", left: 0,
                  background: "var(--elan-surface)", zIndex: 5,
                }}>
                  <Diamond size={10} style={{ color: project.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "var(--font-elan-sans)", color: project.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.title}
                  </span>
                </div>
                <div style={{ display: "flex", position: "relative", height: 32 }}>
                  {days.map((d) => {
                    const key = toLocalDateKey(d);
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    return <div key={key} style={{ width: dayWidth, background: isWeekend ? "rgba(0,0,0,0.02)" : "transparent", borderRight: d.getDay() === 0 ? "1px solid var(--elan-line)" : "none" }} />;
                  })}
                  {m.dueDate && (() => {
                    const col = dateToCol(m.dueDate);
                    return (
                      <div style={{
                        position: "absolute", top: 8, left: col * dayWidth + dayWidth / 2 - 8,
                        width: 16, height: 16, transform: "rotate(45deg)",
                        background: m.completedAt ? "var(--elan-success)" : project.color,
                        borderRadius: 2,
                      }} />
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        ))}

        {grouped.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: "var(--elan-slate)", fontSize: 14, fontFamily: "var(--font-elan-sans)" }}>
            Aucune tâche à afficher pour cette période
          </div>
        )}
      </div>
    </div>
  );
}
