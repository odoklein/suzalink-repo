"use client";

import { useState, useRef, useEffect } from "react";
import { Filter, X } from "lucide-react";
import type { CalendarProject, CalendarMember, CalendarFilters } from "../_lib/types";
import { STATUS_LABELS } from "../_lib/calendar-utils";

interface FilterBarProps {
  projects: CalendarProject[];
  members: CalendarMember[];
  filters: CalendarFilters;
  onChange: (filters: CalendarFilters) => void;
}

export function FilterBar({ projects, members, filters, onChange }: FilterBarProps) {
  const activeCount = filters.projectIds.length + filters.memberIds.length + filters.statuses.length;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
      <MultiSelect
        label="Projets"
        options={projects.map((p) => ({ value: p.id, label: p.name, color: p.color }))}
        selected={filters.projectIds}
        onSelectedChange={(v) => onChange({ ...filters, projectIds: v })}
      />
      <MultiSelect
        label="Membres"
        options={members.map((m) => ({ value: m.id, label: m.name }))}
        selected={filters.memberIds}
        onSelectedChange={(v) => onChange({ ...filters, memberIds: v })}
      />
      <MultiSelect
        label="Statut"
        options={Object.entries(STATUS_LABELS).map(([k, v]) => ({ value: k, label: v }))}
        selected={filters.statuses}
        onSelectedChange={(v) => onChange({ ...filters, statuses: v })}
      />
      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => onChange({ projectIds: [], memberIds: [], statuses: [] })}
          style={{
            display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--elan-danger)",
            background: "none", border: "none", cursor: "pointer", padding: "4px 8px",
            fontFamily: "var(--font-elan-sans)",
          }}
        >
          <X size={14} /> Effacer ({activeCount})
        </button>
      )}
    </div>
  );
}

interface MultiSelectProps {
  label: string;
  options: { value: string; label: string; color?: string }[];
  selected: string[];
  onSelectedChange: (selected: string[]) => void;
}

function MultiSelect({ label, options, selected, onSelectedChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (value: string) => {
    onSelectedChange(
      selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
    );
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", fontSize: 13,
          borderRadius: 6, border: "1px solid var(--elan-line)", cursor: "pointer",
          fontFamily: "var(--font-elan-sans)", fontWeight: 500,
          background: selected.length > 0 ? "var(--elan-petrol)" : "var(--elan-surface)",
          color: selected.length > 0 ? "#fff" : "var(--elan-ink-soft)",
          transition: "all 0.15s",
        }}
      >
        <Filter size={13} />
        {label}
        {selected.length > 0 && (
          <span style={{
            background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "0 6px",
            fontSize: 11, fontWeight: 600,
          }}>
            {selected.length}
          </span>
        )}
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, marginTop: 4, zIndex: 50,
          background: "var(--elan-surface)", border: "1px solid var(--elan-line)",
          borderRadius: 8, boxShadow: "var(--elan-shadow-md)", minWidth: 200,
          maxHeight: 280, overflowY: "auto", padding: 4,
        }}>
          {options.map((opt) => (
            <label
              key={opt.value}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                borderRadius: 6, cursor: "pointer", fontSize: 13,
                fontFamily: "var(--font-elan-sans)", color: "var(--elan-ink)",
                background: selected.includes(opt.value) ? "var(--elan-eucalyptus)" : "transparent",
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                style={{ accentColor: "var(--elan-petrol)" }}
              />
              {opt.color && (
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: opt.color, flexShrink: 0 }} />
              )}
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt.label}</span>
            </label>
          ))}
          {options.length === 0 && (
            <div style={{ padding: "12px 10px", fontSize: 13, color: "var(--elan-slate)" }}>Aucun élément</div>
          )}
        </div>
      )}
    </div>
  );
}
