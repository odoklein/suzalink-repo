"use client";

import { PlanningMonthProvider } from "./PlanningMonthContext";
import { StickyHeader } from "./StickyHeader";
import { MonthCalendar } from "./MonthCalendar";

export default function PlanningPage() {
    return (
        <PlanningMonthProvider>
            <div className="flex h-full min-h-0 flex-col">
                <StickyHeader />
                <div className="min-h-0 flex-1 overflow-hidden">
                    <MonthCalendar />
                </div>
            </div>
        </PlanningMonthProvider>
    );
}
