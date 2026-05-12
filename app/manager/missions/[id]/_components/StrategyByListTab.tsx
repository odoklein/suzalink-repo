"use client";

import { useState, useMemo } from "react";
import { useToast } from "@/components/ui";
import {
    Target,
    Plus,
    Copy,
    Link2,
    Link2Off,
    Pencil,
    ChevronDown,
    Loader2,
    CheckCircle2,
    Circle,
} from "lucide-react";
import { StrategyEditorDrawer } from "./StrategyEditorDrawer";

interface ListItem {
    id: string;
    name: string;
    type: string;
    isActive?: boolean;
    campaignId?: string | null;
    campaign?: {
        id: string;
        name: string;
        icp: string | null;
        pitch: string | null;
        script: string | null;
        isActive: boolean;
    } | null;
    readiness?: {
        hasStrategy: boolean;
        hasIcp: boolean;
        hasPitch: boolean;
        hasScript: boolean;
        isReady: boolean;
    };
    _count?: { companies: number };
}

interface CampaignItem {
    id: string;
    name: string;
    isActive: boolean;
}

interface StrategyByListTabProps {
    missionId: string;
    lists: ListItem[];
    campaigns: CampaignItem[];
    onChange: () => void;
}

function StatusDot({ ok }: { ok: boolean }) {
    return ok ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
    ) : (
        <Circle className="w-4 h-4 text-slate-300" />
    );
}

export function StrategyByListTab({ missionId, lists, campaigns, onChange }: StrategyByListTabProps) {
    const { success, error: showError } = useToast();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
    const [initialAssignToListId, setInitialAssignToListId] = useState<string | null>(null);

    const [menuOpenForList, setMenuOpenForList] = useState<string | null>(null);
    const [busyListId, setBusyListId] = useState<string | null>(null);
    const [assignSubmenuForList, setAssignSubmenuForList] = useState<string | null>(null);

    const sortedLists = useMemo(() => {
        return [...lists].sort((a, b) => {
            const aReady = a.readiness?.isReady ? 1 : 0;
            const bReady = b.readiness?.isReady ? 1 : 0;
            if (aReady !== bReady) return aReady - bReady;
            return a.name.localeCompare(b.name);
        });
    }, [lists]);

    const openEdit = (campaignId: string) => {
        setEditingCampaignId(campaignId);
        setInitialAssignToListId(null);
        setDrawerOpen(true);
    };
    const openCreateForList = (listId: string) => {
        setEditingCampaignId(null);
        setInitialAssignToListId(listId);
        setDrawerOpen(true);
    };

    const handleDuplicate = async (sourceCampaignId: string, list: ListItem) => {
        setBusyListId(list.id);
        setMenuOpenForList(null);
        try {
            const res = await fetch(`/api/campaigns/${sourceCampaignId}/duplicate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: `Stratégie — ${list.name}`,
                    assignToListId: list.id,
                }),
            });
            const json = await res.json();
            if (!json.success) {
                showError("Erreur", json.error || "Duplication échouée");
                return;
            }
            success("Stratégie dupliquée", `Liée à la liste « ${list.name} »`);
            onChange();
            setEditingCampaignId(json.data.id);
            setInitialAssignToListId(null);
            setDrawerOpen(true);
        } catch {
            showError("Erreur", "Duplication échouée");
        } finally {
            setBusyListId(null);
        }
    };

    const handleAssign = async (list: ListItem, campaignId: string | null) => {
        setBusyListId(list.id);
        setMenuOpenForList(null);
        setAssignSubmenuForList(null);
        try {
            const res = await fetch(`/api/lists/${list.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ campaignId }),
            });
            const json = await res.json();
            if (!json.success) {
                showError("Erreur", json.error || "Mise à jour échouée");
                return;
            }
            success(
                campaignId ? "Stratégie liée" : "Stratégie détachée",
                campaignId
                    ? `Liste « ${list.name} » mise à jour`
                    : `Liste « ${list.name} » sans stratégie`
            );
            onChange();
        } catch {
            showError("Erreur", "Mise à jour échouée");
        } finally {
            setBusyListId(null);
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <Target className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Stratégies par liste</h2>
                        <p className="text-sm text-slate-500">
                            Une stratégie (ICP, pitch, script) par segment. Les SDR reçoivent automatiquement le script de la liste sélectionnée.
                        </p>
                    </div>
                </div>
            </div>

            {sortedLists.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
                    Aucune liste dans cette mission — créez ou importez une liste pour commencer.
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Liste</th>
                                <th className="px-3 py-3 text-center font-medium">Sociétés</th>
                                <th className="px-3 py-3 text-center font-medium">ICP</th>
                                <th className="px-3 py-3 text-center font-medium">Pitch</th>
                                <th className="px-3 py-3 text-center font-medium">Script</th>
                                <th className="px-4 py-3 text-left font-medium">Stratégie liée</th>
                                <th className="px-4 py-3 text-right font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sortedLists.map((list) => {
                                const r = list.readiness;
                                const hasStrategy = !!list.campaign;
                                const inactive = list.isActive === false;
                                const isBusy = busyListId === list.id;
                                const menuOpen = menuOpenForList === list.id;
                                const submenu = assignSubmenuForList === list.id;
                                const availableCampaignsForAssign = campaigns.filter(
                                    (c) => c.isActive && c.id !== list.campaignId
                                );
                                return (
                                    <tr key={list.id} className={inactive ? "bg-slate-50/50" : ""}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-medium ${inactive ? "text-slate-500" : "text-slate-900"}`}>
                                                    {list.name}
                                                </span>
                                                {inactive && (
                                                    <span className="text-[10px] uppercase tracking-wide text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        inactive
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500">{list.type}</div>
                                        </td>
                                        <td className="px-3 py-3 text-center text-slate-700">
                                            {list._count?.companies ?? 0}
                                        </td>
                                        <td className="px-3 py-3"><div className="flex justify-center"><StatusDot ok={!!r?.hasIcp} /></div></td>
                                        <td className="px-3 py-3"><div className="flex justify-center"><StatusDot ok={!!r?.hasPitch} /></div></td>
                                        <td className="px-3 py-3"><div className="flex justify-center"><StatusDot ok={!!r?.hasScript} /></div></td>
                                        <td className="px-4 py-3">
                                            {hasStrategy ? (
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(list.campaign!.id)}
                                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-700 hover:text-indigo-800 hover:underline"
                                                >
                                                    <Target className="w-3.5 h-3.5" />
                                                    {list.campaign!.name}
                                                </button>
                                            ) : (
                                                <span className="text-sm text-amber-600">Aucune</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    type="button"
                                                    disabled={isBusy}
                                                    onClick={() => {
                                                        setMenuOpenForList(menuOpen ? null : list.id);
                                                        setAssignSubmenuForList(null);
                                                    }}
                                                    className="inline-flex items-center gap-1 h-8 px-3 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                                                >
                                                    {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                                                    {hasStrategy ? "Gérer" : "Configurer"}
                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                </button>
                                                {menuOpen && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => {
                                                                setMenuOpenForList(null);
                                                                setAssignSubmenuForList(null);
                                                            }}
                                                        />
                                                        <div className="absolute right-0 top-9 z-20 min-w-[240px] rounded-lg border border-slate-200 bg-white shadow-lg py-1 text-sm">
                                                            {hasStrategy && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setMenuOpenForList(null);
                                                                        openEdit(list.campaign!.id);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                    Modifier la stratégie
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setMenuOpenForList(null);
                                                                    openCreateForList(list.id);
                                                                }}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                                Créer une stratégie vierge
                                                            </button>
                                                            {campaigns.length > 0 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDuplicate(campaigns[0].id, list)}
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                                                                >
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                    Dupliquer la stratégie par défaut
                                                                </button>
                                                            )}
                                                            {availableCampaignsForAssign.length > 0 && (
                                                                <div
                                                                    onMouseEnter={() => setAssignSubmenuForList(list.id)}
                                                                    onMouseLeave={() => setAssignSubmenuForList(null)}
                                                                    className="relative"
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                                                                    >
                                                                        <Link2 className="w-3.5 h-3.5" />
                                                                        Assigner une stratégie existante
                                                                        <ChevronDown className="w-3.5 h-3.5 -rotate-90 ml-auto" />
                                                                    </button>
                                                                    {submenu && (
                                                                        <div className="absolute right-full top-0 mr-1 min-w-[220px] max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg py-1">
                                                                            {availableCampaignsForAssign.map((c) => (
                                                                                <button
                                                                                    key={c.id}
                                                                                    type="button"
                                                                                    onClick={() => handleAssign(list, c.id)}
                                                                                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 truncate"
                                                                                >
                                                                                    {c.name}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {hasStrategy && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAssign(list, null)}
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-amber-700 hover:bg-amber-50 border-t border-slate-100 mt-1"
                                                                >
                                                                    <Link2Off className="w-3.5 h-3.5" />
                                                                    Détacher la stratégie
                                                                </button>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <StrategyEditorDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                campaignId={editingCampaignId}
                missionId={missionId}
                lists={lists}
                initialAssignToListId={initialAssignToListId}
                onSaved={onChange}
            />
        </div>
    );
}
