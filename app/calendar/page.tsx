"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { CalendarHeader } from "./_components/CalendarHeader";
import { FilterBar } from "./_components/FilterBar";
import { MonthView } from "./_components/MonthView";
import { WeekView } from "./_components/WeekView";
import { TimelineView } from "./_components/TimelineView";
import { AvailabilityView } from "./_components/AvailabilityView";
import { DayDetailPanel } from "./_components/DayDetailPanel";
import { getDateRange, toLocalDateKey, groupTasksByDate, groupMilestonesByDate } from "./_lib/calendar-utils";
import type { ViewType, CalendarData, CalendarFilters } from "./_lib/types";

const ROLE_PATHS: Record<string, string> = {
  MANAGER: "/manager",
  SDR: "/sdr",
  DEVELOPER: "/developer",
  BUSINESS_DEVELOPER: "/bd",
  CLIENT: "/client",
  COMMERCIAL: "/commercial",
  BOOKER: "/sdr",
};

export default function CalendarPage() {
  const { data: session } = useSession();
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("month");
  const [filters, setFilters] = useState<CalendarFilters>({ projectIds: [], memberIds: [], statuses: [] });
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const backHref = ROLE_PATHS[session?.user?.role || ""] || "/dashboard";
  const dateRange = useMemo(() => getDateRange(calendarDate, view), [calendarDate, view]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      });
      if (filters.projectIds.length) params.set("projectIds", filters.projectIds.join(","));
      if (filters.memberIds.length) params.set("memberIds", filters.memberIds.join(","));
      if (filters.statuses.length) params.set("statuses", filters.statuses.join(","));

      const res = await fetch(`/api/calendar/events?${params}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error("Calendar fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [dateRange, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const navigate = (direction: -1 | 0 | 1) => {
    if (direction === 0) {
      setCalendarDate(new Date());
      return;
    }
    setCalendarDate((current) => {
      const next = new Date(current);
      if (view === "week") next.setDate(next.getDate() + direction * 7);
      else next.setMonth(next.getMonth() + direction);
      return next;
    });
  };

  const handleDayClick = (date: Date) => setSelectedDay(date);

  const selectedDayKey = selectedDay ? toLocalDateKey(selectedDay) : null;
  const tasksByDate = useMemo(() => data ? groupTasksByDate(data.tasks) : new Map(), [data]);
  const milestonesByDate = useMemo(() => data ? groupMilestonesByDate(data.milestones) : new Map(), [data]);
  const selectedDayTasks = selectedDayKey ? tasksByDate.get(selectedDayKey) || [] : [];
  const selectedDayMilestones = selectedDayKey ? milestonesByDate.get(selectedDayKey) || [] : [];

  return (
    <>
      <CalendarHeader
        calendarDate={calendarDate}
        view={view}
        onViewChange={setView}
        onNavigate={navigate}
        backHref={backHref}
      >
        <FilterBar
          projects={data?.projects || []}
          members={data?.members || []}
          filters={filters}
          onChange={setFilters}
        />
      </CalendarHeader>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {loading && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 20,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(244, 240, 232, 0.6)", backdropFilter: "blur(2px)",
          }}>
            <div style={{
              width: 32, height: 32, border: "3px solid var(--elan-line)",
              borderTopColor: "var(--elan-petrol)", borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {view === "month" && data && (
            <MonthView
              calendarDate={calendarDate}
              tasks={data.tasks}
              milestones={data.milestones}
              onDayClick={handleDayClick}
            />
          )}
          {view === "week" && data && (
            <WeekView
              calendarDate={calendarDate}
              tasks={data.tasks}
              milestones={data.milestones}
              onDayClick={handleDayClick}
            />
          )}
          {view === "timeline" && data && (
            <TimelineView
              calendarDate={calendarDate}
              tasks={data.tasks}
              milestones={data.milestones}
              projects={data.projects}
              dateRange={dateRange}
            />
          )}
          {view === "availability" && data && (
            <AvailabilityView
              calendarDate={calendarDate}
              members={data.members}
              dateRange={dateRange}
            />
          )}
        </div>

        {selectedDay && (
          <DayDetailPanel
            date={selectedDay}
            tasks={selectedDayTasks}
            milestones={selectedDayMilestones}
            onClose={() => setSelectedDay(null)}
          />
        )}
      </div>
    </>
  );
}
