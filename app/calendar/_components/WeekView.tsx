"use client";

import { useMemo } from "react";
import { Diamond } from "lucide-react";
import { buildWeekDays, toLocalDateKey, groupTasksByDate, groupMilestonesByDate, PRIORITY_COLORS } from "../_lib/calendar-utils";
import type { CalendarTask, CalendarMilestone } from "../_lib/types";

interface WeekViewProps {
  calendarDate: Date;
  tasks: CalendarTask[];
  milestones: CalendarMilestone[];
  onDayClick: (date: Date) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

export function WeekView({ calendarDate, tasks, milestones, onDayClick }: WeekViewProps) {
  const days = useMemo(() => buildWeekDays(calendarDate), [calendarDate]);
  const tasksByDate = useMemo(() => groupTasksByDate(tasks), [tasks]);
  const milestonesByDate = useMemo(() => groupMilestonesByDate(milestones), [milestones]);
  const todayKey = toLocalDateKey(new Date());

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* All-day row */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--elan-line)", flexShrink: 0 }}>
        <div style={{ width: 56, flexShrink: 0, padding: "8px 0", textAlign: "right", paddingRight: 10, fontSize: 10, color: "var(--elan-slate)", fontFamily: "var(--font-elan-sans)" }}>
          Journée
        </div>
        {days.map((d) => {
          const key = toLocalDateKey(d);
          const dayTasks = (tasksByDate.get(key) || []).filter((t) => !hasTime(t));
          const dayMilestones = milestonesByDate.get(key) || [];
          const isToday = key === todayKey;
          return (
            <div
              key={key}
              onClick={() => onDayClick(d)}
              style={{
                flex: 1, minWidth: 110, borderLeft: "1px solid var(--elan-line)",
                padding: "4px 6px", minHeight: 32, cursor: "pointer",
                background: isToday ? "rgba(12, 59, 56, 0.04)" : "transparent",
              }}
            >
              {dayMilestones.map((m) => (
                <div key={m.id} style={{
                  display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 600,
                  color: m.project.color, marginBottom: 2, fontFamily: "var(--font-elan-sans)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  <Diamond size={9} style={{ flexShrink: 0 }} /> {m.title}
                </div>
              ))}
              {dayTasks.slice(0, 2).map((t) => (
                <div key={t.id} style={{
                  fontSize: 10, padding: "1px 4px", borderRadius: 3, marginBottom: 1,
                  borderLeft: `2px solid ${t.project.color}`, background: "var(--elan-paper)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  fontFamily: "var(--font-elan-sans)", color: "var(--elan-ink)",
                }}>
                  {t.title}
                </div>
              ))}
              {dayTasks.length > 2 && (
                <div style={{ fontSize: 9, color: "var(--elan-slate)" }}>+{dayTasks.length - 2}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Day headers */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--elan-line)", flexShrink: 0 }}>
        <div style={{ width: 56, flexShrink: 0 }} />
        {days.map((d) => {
          const key = toLocalDateKey(d);
          const isToday = key === todayKey;
          return (
            <div key={key} style={{
              flex: 1, minWidth: 110, borderLeft: "1px solid var(--elan-line)",
              height: 40, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: isToday ? 700 : 400, fontFamily: "var(--font-elan-sans)",
              color: isToday ? "var(--elan-petrol)" : "var(--elan-ink-soft)",
            }}>
              {d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })}
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div style={{ flex: 1, display: "flex", overflow: "auto" }}>
        <div style={{ width: 56, flexShrink: 0 }}>
          {HOURS.map((h) => (
            <div key={h} style={{
              height: 64, fontSize: 11, color: "var(--elan-slate)", textAlign: "right",
              paddingRight: 10, paddingTop: 2, fontWeight: 500, fontFamily: "var(--font-elan-sans)",
            }}>
              {h}:00
            </div>
          ))}
        </div>
        {days.map((d) => {
          const key = toLocalDateKey(d);
          const dayTasks = (tasksByDate.get(key) || []).filter((t) => hasTime(t));
          const isToday = key === todayKey;
          return (
            <div key={key} style={{
              flex: 1, minWidth: 110, borderLeft: "1px solid var(--elan-line)",
              position: "relative",
              background: isToday ? "rgba(12, 59, 56, 0.02)" : "transparent",
            }}>
              {HOURS.map((h) => (
                <div key={h} style={{ height: 64, borderTop: "1px solid var(--elan-line)" }} />
              ))}
              {dayTasks.map((t) => {
                const pos = getTaskPosition(t);
                if (!pos) return null;
                return (
                  <div
                    key={t.id}
                    onClick={() => onDayClick(d)}
                    style={{
                      position: "absolute", top: pos.top, left: 3, right: 3,
                      height: Math.max(pos.height, 28), borderRadius: 6,
                      background: `${t.project.color}18`,
                      borderLeft: `3px solid ${t.project.color}`,
                      padding: "4px 6px", cursor: "pointer", overflow: "hidden",
                      fontSize: 11, fontFamily: "var(--font-elan-sans)", color: "var(--elan-ink)",
                    }}
                  >
                    <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.title}
                    </div>
                    {t.assignee && (
                      <div style={{ fontSize: 10, color: "var(--elan-slate)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.assignee.name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function hasTime(task: CalendarTask): boolean {
  const d = task.startDate || task.dueDate;
  if (!d) return false;
  const date = new Date(d);
  return date.getHours() !== 0 || date.getMinutes() !== 0;
}

function getTaskPosition(task: CalendarTask): { top: number; height: number } | null {
  const startStr = task.startDate || task.dueDate;
  if (!startStr) return null;
  const start = new Date(startStr);
  const hour = start.getHours();
  const min = start.getMinutes();
  if (hour < 8 || hour >= 20) return null;
  const top = (hour - 8) * 64 + Math.round((min * 64) / 60);
  const duration = task.estimatedHours ? task.estimatedHours * 64 : 56;
  return { top, height: Math.min(duration, (20 - hour) * 64) };
}
