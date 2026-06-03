"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui";
import {
    Loader2,
    PhoneCall,
    Search,
    X,
    Clock,
    ChevronDown,
    RefreshCw,
    CalendarCheck2,
    Activity,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CallItem {
    id: string;
    createdAt: string;
    callbackDate?: string | null;
    result: string;
    note?: string | null;
    duration?: number | null;
    company?: {
        name: string;
        industry?: string | null;
        country?: string | null;
    } | null;
    contact?: {
        firstName?: string | null;
        lastName?: string | null;
        title?: string | null;
        email?: string | null;
        phone?: string | null;
        company?: {
            name: string;
            industry?: string | null;
            country?: string | null;
        } | null;
    } | null;
    campaign?: {
        name?: string | null;
        mission?: { name?: string | null } | null;
    } | null;
}

const RESULT_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    MEETING_BOOKED:      { label: "RDV pris",          color: "text-emerald-700", bg: "bg-emerald-50 border border-emerald-200", dot: "bg-emerald-500" },
    CALLBACK_REQUESTED:  { label: "Rappel demandé",     color: "text-amber-700",   bg: "bg-amber-50 border border-amber-200",     dot: "bg-amber-500" },
    INTERESTED:          { label: "Intéressé",          color: "text-teal-700",    bg: "bg-teal-50 border border-teal-200",       dot: "bg-teal-500" },
    NO_RESPONSE:         { label: "Pas de réponse",     color: "text-slate-600",   bg: "bg-slate-50 border border-slate-200",     dot: "bg-slate-400" },
    DISQUALIFIED:        { label: "Non qualifié",       color: "text-rose-700",    bg: "bg-rose-50 border border-rose-200",       dot: "bg-rose-400" },
    VOICEMAIL:           { label: "Messagerie",         color: "text-sky-700",     bg: "bg-sky-50 border border-sky-200",         dot: "bg-sky-400" },
    NOT_INTERESTED:      { label: "Non intéressé",      color: "text-slate-600",   bg: "bg-slate-50 border border-slate-200",     dot: "bg-slate-400" },
    MEETING_CANCELLED:   { label: "RDV annulé",         color: "text-rose-700",    bg: "bg-rose-50 border border-rose-200",       dot: "bg-rose-400" },
};

function getResultConfig(result: string) {
    return RESULT_CONFIG[result] ?? { label: result, color: "text-slate-600", bg: "bg-slate-50 border border-slate-200", dot: "bg-slate-400" };
}

// Quick filter pills → result keys. `null` = show everything.
const FILTER_PILLS: { id: string; label: string; result: string | null }[] = [
    { id: "all",      label: "Tous",          result: null },
    { id: "rdv",      label: "RDV pris",      result: "MEETING_BOOKED" },
    { id: "rappels",  label: "Rappels",       result: "CALLBACK_REQUESTED" },
    { id: "interets", label: "Intéressés",    result: "INTERESTED" },
    { id: "noreply",  label: "Pas de réponse", result: "NO_RESPONSE" },
];

function formatDateTime(date: string) {
    const d = new Date(date);
    return d.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatMonthYear(date: string) {
    return new Date(date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

// Derive a human period label from the spread of call dates.
function getPeriodLabel(calls: CallItem[]): string {
    if (calls.length === 0) return "—";
    const times = calls.map((c) => new Date(c.createdAt).getTime()).sort((a, b) => a - b);
    const first = formatMonthYear(new Date(times[0]).toISOString());
    const last = formatMonthYear(new Date(times[times.length - 1]).toISOString());
    return first === last ? first : `${first} – ${last}`;
}

// Most frequently occurring campaign / mission name across the dataset.
function getCampaignName(calls: CallItem[]): string {
    const counts = new Map<string, number>();
    for (const c of calls) {
        const name = c.campaign?.mission?.name || c.campaign?.name;
        if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    let best = "";
    let bestCount = 0;
    for (const [name, count] of counts) {
        if (count > bestCount) {
            best = name;
            bestCount = count;
        }
    }
    return best || "Campagne de prospection";
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Deterministic soft tint per contact so avatars stay calm but distinguishable.
const AVATAR_TINTS = [
    "bg-violet-100 text-violet-700",
    "bg-indigo-100 text-indigo-700",
    "bg-sky-100 text-sky-700",
    "bg-teal-100 text-teal-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
];
function getAvatarTint(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % AVATAR_TINTS.length;
    return AVATAR_TINTS[hash];
}

export default function ClientPortalCallsPage() {
    const { error: showError } = useToast();
    const [calls, setCalls] = useState<CallItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [resultFilter, setResultFilter] = useState<string>("all");
    const [activePill, setActivePill] = useState<string>("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const loadCalls = useCallback(
        async (mode: "initial" | "refresh" = "initial") => {
            if (mode === "refresh") setIsRefreshing(true);
            else setIsLoading(true);
            try {
                const res = await fetch("/api/client/calls");
                const json = await res.json();
                if (json.success) {
                    const maybeItems = json?.data?.items;
                    const maybeData = json?.data;
                    if (Array.isArray(maybeItems)) {
                        setCalls(maybeItems);
                    } else if (Array.isArray(maybeData)) {
                        setCalls(maybeData);
                    } else {
                        setCalls([]);
                    }
                } else {
                    showError("Erreur", json.error || "Impossible de charger l'historique d'appels");
                }
            } catch {
                showError("Erreur", "Impossible de charger l'historique d'appels");
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        [showError]
    );

    useEffect(() => {
        loadCalls("initial");
    }, [loadCalls]);

    // Keep the quick pills and the dropdown in sync — selecting one resets the other.
    const handlePill = (pill: { id: string; result: string | null }) => {
        setActivePill(pill.id);
        setResultFilter(pill.result ?? "all");
    };
    const handleDropdown = (value: string) => {
        setResultFilter(value);
        const match = FILTER_PILLS.find((p) => (p.result ?? "all") === value);
        setActivePill(match ? match.id : "");
    };

    const filtered = calls.filter((c) => {
        if (resultFilter !== "all" && c.result !== resultFilter) return false;
        if (!search.trim()) return true;
        const haystack = [
            c.contact?.firstName,
            c.contact?.lastName,
            c.contact?.title,
            c.contact?.email,
            c.contact?.phone,
            c.company?.name || c.contact?.company?.name,
            c.campaign?.mission?.name,
            c.campaign?.name,
            c.note,
        ].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(search.toLowerCase());
    });

    const uniqueResults = useMemo(() => Array.from(new Set(calls.map((c) => c.result))), [calls]);

    // Campaign-level KPIs reflect the whole dataset, not the filtered view.
    const totalCalls = calls.length;
    const displayedCalls = filtered.length;
    const meetingsGenerated = useMemo(() => calls.filter((c) => c.result === "MEETING_BOOKED").length, [calls]);
    const campaignName = useMemo(() => getCampaignName(calls), [calls]);
    const periodLabel = useMemo(() => getPeriodLabel(calls), [calls]);
    const hasFilters = search.trim() !== "" || resultFilter !== "all";

    const resetFilters = () => {
        setSearch("");
        setResultFilter("all");
        setActivePill("all");
    };

    return (
        <div className="min-h-full bg-[#F5F7FB] p-3 md:p-6">
            <div className="max-w-[1040px] mx-auto space-y-4">
                {/* 1. Header card */}
                <div
                    className="relative overflow-hidden bg-white border border-[#E7EAF2] rounded-3xl px-5 py-5 md:px-7 md:py-6 shadow-sm"
                    style={{ animation: "callsFadeUp 0.35s ease both" }}
                >
                    <div className="absolute -top-16 -right-12 w-64 h-64 rounded-full bg-gradient-to-br from-violet-200/50 to-indigo-200/30 blur-3xl pointer-events-none" />
                    <div className="relative flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-300/50 shrink-0">
                                <PhoneCall className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-xl md:text-2xl font-bold text-[#12122A] tracking-tight">
                                    Suivi de votre prospection
                                </h1>
                                <p className="text-sm text-[#6B7194] mt-1 max-w-xl">
                                    Consultez les actions réalisées et les résultats obtenus pour votre campagne.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => loadCalls("refresh")}
                            disabled={isRefreshing || isLoading}
                            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-[#E4E2FB] bg-[#F6F4FF] text-sm font-semibold text-[#5B45D6] hover:bg-[#EEEAFF] transition-colors disabled:opacity-60"
                        >
                            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                            Actualiser
                        </button>
                    </div>

                    {/* Meta row */}
                    <div className="relative mt-5 flex flex-wrap items-center gap-2">
                        <MetaPill label="Campagne" value={campaignName} />
                        <MetaPill label="Période" value={periodLabel} />
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 pl-2.5 pr-3 py-1.5 text-xs font-medium text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Statut : En cours
                        </span>
                    </div>
                </div>

                {/* 2. KPI row — exactly 3 cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ animation: "callsFadeUp 0.35s ease both", animationDelay: "50ms" }}>
                    <KpiCard
                        icon={PhoneCall}
                        tint="from-violet-50 to-white"
                        iconBg="bg-violet-100"
                        iconColor="text-violet-600"
                        label="Appels effectués"
                        value={totalCalls}
                        helper="Total des appels journalisés"
                    />
                    <KpiCard
                        icon={CalendarCheck2}
                        tint="from-emerald-50 to-white"
                        iconBg="bg-emerald-100"
                        iconColor="text-emerald-600"
                        label="Rendez-vous générés"
                        value={meetingsGenerated}
                        helper="Prospects qualifiés en RDV"
                    />
                    <KpiCard
                        icon={Activity}
                        tint="from-indigo-50 to-white"
                        iconBg="bg-indigo-100"
                        iconColor="text-indigo-600"
                        label="Statut de campagne"
                        value="En cours"
                        valueClassName="text-xl"
                        helper="Prospection active"
                    />
                </div>

                {/* 3. Campaign summary */}
                <div
                    className="bg-white border border-[#E7EAF2] rounded-2xl px-5 py-4 shadow-sm flex items-start gap-4"
                    style={{ animation: "callsFadeUp 0.35s ease both", animationDelay: "90ms" }}
                >
                    <div className="w-10 h-10 rounded-xl bg-[#F4F1FF] flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5 text-[#7C5CFC]" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-sm font-bold text-[#12122A]">Résumé de la campagne</h2>
                        <p className="text-[13px] text-[#5E6482] leading-relaxed mt-1">
                            Notre équipe poursuit les actions de prospection et le suivi des prospects qualifiés.
                            Chaque appel est journalisé afin de vous offrir une vision claire de l&apos;avancement
                            de la campagne.
                        </p>
                    </div>
                </div>

                {/* 4. Search + filters */}
                <div
                    className="bg-white border border-[#E7EAF2] rounded-2xl p-3.5 shadow-sm space-y-3"
                    style={{ animation: "callsFadeUp 0.35s ease both", animationDelay: "120ms" }}
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 min-w-[220px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A3BD]" />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher un contact ou une entreprise..."
                                className="w-full h-10 pl-9 pr-8 rounded-xl border border-[#E8EBF0] bg-white text-sm text-[#12122A] placeholder:text-[#A0A3BD] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/25 focus:border-[#7C5CFC]/40"
                            />
                            {search && (
                                <button type="button" onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A0A3BD] hover:text-[#6B7194]">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <select
                                value={resultFilter}
                                onChange={(e) => handleDropdown(e.target.value)}
                                className="h-10 pl-3.5 pr-9 rounded-xl border border-[#E8EBF0] bg-white text-sm text-[#12122A] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/25 appearance-none"
                            >
                                <option value="all">Tous les résultats</option>
                                {uniqueResults.map((r) => (
                                    <option key={r} value={r}>{getResultConfig(r).label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A3BD] pointer-events-none" />
                        </div>
                    </div>

                    {/* Quick filter pills */}
                    <div className="flex flex-wrap items-center gap-2">
                        {FILTER_PILLS.map((pill) => {
                            const isActive = activePill === pill.id;
                            return (
                                <button
                                    key={pill.id}
                                    type="button"
                                    onClick={() => handlePill(pill)}
                                    className={cn(
                                        "h-8 px-3.5 rounded-full text-xs font-semibold transition-colors border",
                                        isActive
                                            ? "bg-[#7C5CFC] border-[#7C5CFC] text-white shadow-sm shadow-violet-200"
                                            : "bg-white border-[#E8EBF0] text-[#475072] hover:bg-[#F7F9FF]"
                                    )}
                                >
                                    {pill.label}
                                </button>
                            );
                        })}
                        {hasFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium text-[#6B7194] hover:text-[#475072]"
                            >
                                <X className="w-3.5 h-3.5" />
                                Réinitialiser
                            </button>
                        )}
                    </div>
                </div>

                {/* 5. History section */}
                <div style={{ animation: "callsFadeUp 0.35s ease both", animationDelay: "150ms" }}>
                    <div className="flex items-center justify-between px-1 mb-2.5">
                        <h2 className="text-sm font-bold text-[#12122A]">Historique des actions commerciales</h2>
                        <span className="text-xs text-[#8E93AE]">{displayedCalls} sur {totalCalls}</span>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-7 h-7 animate-spin text-[#7C5CFC]" />
                                <span className="text-sm text-[#6B7194]">Chargement de l&apos;historique…</span>
                            </div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-[#E8EBF0] rounded-2xl py-16 px-6 text-center">
                            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-[#F4F5FA] flex items-center justify-center">
                                <PhoneCall className="w-6 h-6 text-[#A0A3BD]" />
                            </div>
                            <p className="text-sm font-semibold text-[#12122A]">Aucune action trouvée</p>
                            <p className="mt-1 text-xs text-[#6B7194]">Ajustez vos filtres ou réessayez plus tard.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-[#E8EBF0] shadow-sm divide-y divide-[#F1F2F8] overflow-hidden">
                            {filtered.map((call, idx) => {
                                const contactName = [call.contact?.firstName, call.contact?.lastName].filter(Boolean).join(" ") || "Contact inconnu";
                                const companyName = call.contact?.company?.name || call.company?.name || "—";
                                const rc = getResultConfig(call.result);
                                const isExpanded = expandedId === call.id;
                                const hasNote = Boolean(call.note);
                                return (
                                    <div
                                        key={call.id}
                                        style={{ animation: "callsFadeUp 0.3s ease both", animationDelay: `${150 + Math.min(idx, 12) * 20}ms` }}
                                    >
                                        <div
                                            className={cn(
                                                "px-4 py-3.5 transition-colors",
                                                hasNote ? "cursor-pointer hover:bg-[#FAFAFE]" : "cursor-default",
                                                isExpanded && "bg-[#FAFAFE]"
                                            )}
                                            onClick={() => hasNote && setExpandedId(isExpanded ? null : call.id)}
                                        >
                                            <div className="flex items-start gap-3.5">
                                                {/* Avatar */}
                                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0", getAvatarTint(contactName))}>
                                                    {getInitials(contactName)}
                                                </div>

                                                {/* Identity + note */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                                                        <span className="text-sm font-semibold text-[#12122A] truncate">{contactName}</span>
                                                        <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full", rc.color, rc.bg)}>
                                                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", rc.dot)} />
                                                            {rc.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-[#8089A8] uppercase tracking-wide mt-0.5 truncate">{companyName}</p>
                                                    {hasNote && (
                                                        <p className={cn("text-[13px] text-[#5E6482] leading-relaxed mt-1.5", !isExpanded && "line-clamp-1")}>
                                                            {call.note}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Date + chevron */}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <div className="text-right">
                                                        <div className="inline-flex items-center gap-1.5 text-[11px] text-[#8E93AE] whitespace-nowrap">
                                                            <Clock className="w-3 h-3" />
                                                            {formatDateTime(call.callbackDate || call.createdAt)}
                                                        </div>
                                                    </div>
                                                    {hasNote && (
                                                        <ChevronDown className={cn("w-4 h-4 text-[#C2C6DA] transition-transform duration-200", isExpanded && "rotate-180")} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes callsFadeUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: none; }
                }
            `}</style>
        </div>
    );
}

function MetaPill({ label, value }: { label: string; value: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F6F8FE] border border-[#E8EBF4] pl-3 pr-3.5 py-1.5 text-xs text-[#475072] max-w-full">
            <span className="text-[#9097B8] font-medium">{label} :</span>
            <span className="font-semibold text-[#2C3257] truncate max-w-[220px]">{value}</span>
        </span>
    );
}

function KpiCard({
    icon: Icon,
    tint,
    iconBg,
    iconColor,
    label,
    value,
    helper,
    valueClassName,
}: {
    icon: typeof PhoneCall;
    tint: string;
    iconBg: string;
    iconColor: string;
    label: string;
    value: string | number;
    helper?: string;
    valueClassName?: string;
}) {
    return (
        <div className={cn("rounded-2xl border border-[#E7EAF2] bg-gradient-to-b shadow-sm p-4 md:p-5", tint)}>
            <div className="flex items-center justify-between">
                <p className="text-[13px] font-medium text-[#6B7194]">{label}</p>
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", iconBg)}>
                    <Icon className={cn("w-[18px] h-[18px]", iconColor)} />
                </div>
            </div>
            <p className={cn("mt-3 text-3xl font-bold text-[#12122A] tabular-nums tracking-tight", valueClassName)}>{value}</p>
            {helper && <p className="mt-1 text-xs text-[#8E93AE]">{helper}</p>}
        </div>
    );
}
