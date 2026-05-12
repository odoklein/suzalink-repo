"use client";

import { memo, useState } from "react";
import type { Meeting } from "../_types";
import type { MeetingFiltersState } from "../_hooks/useMeetingFilters";
import type { ViewMode, DatePreset } from "../_types";
import { SearchInput } from "./shared/SearchInput";
import { downloadCSV } from "../_lib/csv-export";
import { List, CalendarDays, Download, Plus, Upload, Mic, SortAsc, SortDesc, X } from "lucide-react";
import { AddRdvModal } from "./modals/AddRdvModal";
import { ImportRdvModal } from "./modals/ImportRdvModal";

const SORT_LABELS: Record<string, string> = {
  createdAt: "Créé le",
  callbackDate: "Date RDV",
  duration: "Durée",
  contactName: "Contact",
  companyName: "Entreprise",
  sdrName: "SDR",
};

interface CommandBarProps {
  view: ViewMode;
  setView: (v: ViewMode) => void;
  filters: MeetingFiltersState;
  meetings: Meeting[];
  onRefresh?: () => void;
  onOpenSyncAudios?: () => void;
}

export const CommandBar = memo(function CommandBar({ view, setView, filters, meetings, onRefresh, onOpenSyncAudios }: CommandBarProps) {
  const { search, setSearch, datePreset, setDatePreset, filterSummary, sortBy, sortDir, toggleSort, activeFilterCount, hasAudio, setHasAudio, hasFeedback, setHasFeedback } = filters;
  const [addRdvOpen, setAddRdvOpen] = useState(false);
  const [importRdvOpen, setImportRdvOpen] = useState(false);

  return (
    <div style={{ flexShrink: 0, zIndex: 30, background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
    <div
      style={{
        height: 64,
        display: "flex", alignItems: "center", padding: "0 32px", gap: 20,
      }}
    >
      <h1 className="rdv-serif" style={{ fontSize: 26, color: "var(--ink)", margin: 0, whiteSpace: "nowrap" }}>
        SAS RDV
      </h1>

      <SearchInput initialSearch={search} onDebouncedSearch={setSearch} />

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* View toggle */}
        <div style={{ display: "flex", background: "var(--surface2)", borderRadius: 10, overflow: "hidden", padding: 2 }}>
          {([["list", List], ["calendar", CalendarDays]] as const).map(([v, Icon]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                background: view === v ? "var(--surface)" : "transparent",
                color: view === v ? "var(--accent)" : "var(--ink3)",
                border: "none", padding: "7px 11px", cursor: "pointer",
                display: "flex", alignItems: "center", transition: "all 0.15s",
                borderRadius: 8, boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        {/* Date presets */}
        <div style={{ display: "flex", gap: 4 }}>
          {([["today", "Aujourd'hui"], ["7days", "7j"], ["30days", "30j"], ["3months", "3m"]] as [DatePreset, string][]).map(([key, label]) => (
            <button
              key={key}
              className="rdv-btn"
              style={{
                padding: "6px 12px", fontSize: 12, borderRadius: 8,
                background: datePreset === key ? "var(--accentLight)" : "transparent",
                color: datePreset === key ? "var(--accent)" : "var(--ink3)",
                border: "none",
                fontWeight: datePreset === key ? 600 : 400,
              }}
              onClick={() => setDatePreset(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <button className="rdv-btn rdv-btn-ghost" onClick={() => setAddRdvOpen(true)}>
          <Plus size={14} /> Ajouter un RDV
        </button>
        <button className="rdv-btn rdv-btn-ghost" onClick={() => setImportRdvOpen(true)}>
          <Upload size={14} /> Importer des RDV
        </button>
        <button className="rdv-btn rdv-btn-ghost" onClick={() => onOpenSyncAudios?.()}>
          <Mic size={14} /> Sync audios
        </button>
        {/* Sort indicator pill */}
        <button
          onClick={() => toggleSort(sortBy)}
          className="rdv-btn rdv-btn-ghost"
          title="Changer la direction du tri"
          style={{
            display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600,
            color: sortBy !== "createdAt" ? "var(--accent)" : "var(--ink3)",
            background: sortBy !== "createdAt" ? "var(--accentLight)" : "transparent",
            border: sortBy !== "createdAt" ? "1px solid var(--accent)" : "1px solid transparent",
          }}
        >
          {sortDir === "asc" ? <SortAsc size={13} /> : <SortDesc size={13} />}
          {SORT_LABELS[sortBy] ?? sortBy}
        </button>

        <button className="rdv-btn rdv-btn-ghost" onClick={() => downloadCSV(meetings, filterSummary)}>
          <Download size={14} /> Exporter
        </button>
      </div>
    </div>

    {/* ─── Active filter chips bar ─── */}
    {activeFilterCount > 0 && (
      <div style={{
        display: "flex", alignItems: "center", gap: 6, padding: "6px 32px 8px",
        flexWrap: "wrap", borderTop: "1px solid var(--border)",
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--ink3)", whiteSpace: "nowrap" }}>
          Filtres :
        </span>
        {hasAudio !== null && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600,
            background: "var(--accentLight)", color: "var(--accent)", borderRadius: 20,
            padding: "2px 8px 2px 10px", border: "1px solid var(--accent)",
          }}>
            🎙 {hasAudio ? "Avec audio" : "Sans audio"}
            <button onClick={() => setHasAudio(null)} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", display: "flex", padding: 0 }}>
              <X size={11} />
            </button>
          </span>
        )}
        {hasFeedback !== null && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600,
            background: "var(--accentLight)", color: "var(--accent)", borderRadius: 20,
            padding: "2px 8px 2px 10px", border: "1px solid var(--accent)",
          }}>
            💬 {hasFeedback ? "Avec feedback" : "Sans feedback"}
            <button onClick={() => setHasFeedback(null)} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", display: "flex", padding: 0 }}>
              <X size={11} />
            </button>
          </span>
        )}
        {search && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600,
            background: "var(--accentLight)", color: "var(--accent)", borderRadius: 20,
            padding: "2px 8px 2px 10px", border: "1px solid var(--accent)",
          }}>
            🔍 &ldquo;{search}&rdquo;
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", display: "flex", padding: 0 }}>
              <X size={11} />
            </button>
          </span>
        )}
        <span style={{ fontSize: 10, color: "var(--ink3)", marginLeft: "auto" }}>
          {activeFilterCount} filtre{activeFilterCount > 1 ? "s" : ""} actif{activeFilterCount > 1 ? "s" : ""} · ouvrez le panneau pour gérer
        </span>
      </div>
    )}

      <AddRdvModal
        isOpen={addRdvOpen}
        onClose={() => setAddRdvOpen(false)}
        onSuccess={() => onRefresh?.()}
      />
      <ImportRdvModal
        isOpen={importRdvOpen}
        onClose={() => setImportRdvOpen(false)}
        onSuccess={() => onRefresh?.()}
      />
    </div>
  );
});

