"use client";

import { useEffect, useState, useCallback } from "react";
import { Drawer, useToast } from "@/components/ui";
import { Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react";

interface ListSummary {
    id: string;
    name: string;
    isActive?: boolean;
    campaignId?: string | null;
}

interface StrategyEditorDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    /** Existing campaign to edit. Null = create mode. */
    campaignId: string | null;
    /** Mission context — used for create mode and the linked-lists selector. */
    missionId: string;
    /** All lists in the mission (for the linked-lists checkbox group). */
    lists: ListSummary[];
    /** When in create mode, pre-select this list so the new strategy is auto-assigned. */
    initialAssignToListId?: string | null;
    /** Called after a successful save/create/delete. Parent should refetch mission. */
    onSaved?: () => void;
}

interface CampaignDetail {
    id: string;
    name: string;
    icp: string;
    pitch: string;
    script?: string | null;
    isActive: boolean;
}

export function StrategyEditorDrawer({
    isOpen,
    onClose,
    campaignId,
    missionId,
    lists,
    initialAssignToListId,
    onSaved,
}: StrategyEditorDrawerProps) {
    const { success, error: showError } = useToast();
    const isCreate = !campaignId;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState("");
    const [icp, setIcp] = useState("");
    const [pitch, setPitch] = useState("");
    const [script, setScript] = useState("");
    const [linkedListIds, setLinkedListIds] = useState<Set<string>>(new Set());

    // Load existing campaign or initialize create form
    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;

        if (isCreate) {
            setName("");
            setIcp("");
            setPitch("");
            setScript("");
            setLinkedListIds(new Set(initialAssignToListId ? [initialAssignToListId] : []));
            return;
        }

        setLoading(true);
        (async () => {
            try {
                const res = await fetch(`/api/campaigns/${campaignId}`);
                const json = await res.json();
                if (cancelled) return;
                if (json.success) {
                    const c: CampaignDetail = json.data;
                    setName(c.name || "");
                    setIcp(c.icp || "");
                    setPitch(c.pitch || "");
                    setScript(c.script || "");
                    const linked = lists.filter((l) => l.campaignId === campaignId).map((l) => l.id);
                    setLinkedListIds(new Set(linked));
                } else {
                    showError("Erreur", json.error || "Stratégie introuvable");
                }
            } catch {
                if (!cancelled) showError("Erreur", "Impossible de charger la stratégie");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, campaignId]);

    const toggleListLink = useCallback((listId: string) => {
        setLinkedListIds((prev) => {
            const next = new Set(prev);
            if (next.has(listId)) next.delete(listId);
            else next.add(listId);
            return next;
        });
    }, []);

    const handleSave = async () => {
        if (!name.trim()) {
            showError("Nom requis", "Donnez un nom à cette stratégie");
            return;
        }
        setSaving(true);
        try {
            let targetCampaignId = campaignId;

            if (isCreate) {
                const res = await fetch("/api/campaigns", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: name.trim(),
                        missionId,
                        icp,
                        pitch,
                        script,
                        assignToListIds: Array.from(linkedListIds),
                    }),
                });
                const json = await res.json();
                if (!json.success) {
                    showError("Erreur", json.error || "Création échouée");
                    setSaving(false);
                    return;
                }
                targetCampaignId = json.data.id;
            } else {
                const res = await fetch(`/api/campaigns/${campaignId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: name.trim(),
                        icp,
                        pitch,
                        script,
                    }),
                });
                const json = await res.json();
                if (!json.success) {
                    showError("Erreur", json.error || "Sauvegarde échouée");
                    setSaving(false);
                    return;
                }

                // Sync linked-list memberships: connect newly checked, disconnect newly unchecked
                const previouslyLinked = new Set(
                    lists.filter((l) => l.campaignId === campaignId).map((l) => l.id)
                );
                const toConnect = Array.from(linkedListIds).filter((id) => !previouslyLinked.has(id));
                const toDisconnect = Array.from(previouslyLinked).filter((id) => !linkedListIds.has(id));

                await Promise.all([
                    ...toConnect.map((id) =>
                        fetch(`/api/lists/${id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ campaignId: targetCampaignId }),
                        })
                    ),
                    ...toDisconnect.map((id) =>
                        fetch(`/api/lists/${id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ campaignId: null }),
                        })
                    ),
                ]);
            }

            success(isCreate ? "Stratégie créée" : "Stratégie sauvegardée", name.trim());
            onSaved?.();
            onClose();
        } catch {
            showError("Erreur", "Une erreur est survenue");
        } finally {
            setSaving(false);
        }
    };

    const readinessRow = (label: string, ok: boolean) => (
        <div className="flex items-center gap-2 text-xs">
            {ok ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span className={ok ? "text-emerald-700" : "text-amber-700"}>{label}</span>
        </div>
    );

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            title={isCreate ? "Créer une stratégie" : "Modifier la stratégie"}
            description={isCreate
                ? "Définissez ICP, pitch et script pour la ou les listes ciblées."
                : "Modifiez la stratégie et ses listes liées."}
            footer={
                <div className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 px-4 text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg disabled:opacity-60"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isCreate ? "Créer" : "Sauvegarder"}
                    </button>
                </div>
            }
        >
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la stratégie</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="ex: SaaS SMB France"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Linked lists */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Listes liées</label>
                        {lists.length === 0 ? (
                            <p className="text-xs text-slate-500">Aucune liste dans cette mission.</p>
                        ) : (
                            <div className="space-y-1 rounded-lg border border-slate-200 p-2 max-h-44 overflow-y-auto">
                                {lists.map((l) => {
                                    const checked = linkedListIds.has(l.id);
                                    const linkedElsewhere = !!l.campaignId && l.campaignId !== campaignId && !checked;
                                    return (
                                        <label
                                            key={l.id}
                                            className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-slate-50 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleListLink(l.id)}
                                                className="rounded border-slate-300"
                                            />
                                            <span className="flex-1 text-slate-700">{l.name}</span>
                                            {linkedElsewhere && (
                                                <span className="text-[10px] uppercase tracking-wide font-medium text-amber-600">
                                                    déjà liée
                                                </span>
                                            )}
                                            {l.isActive === false && (
                                                <span className="text-[10px] uppercase tracking-wide text-slate-400">
                                                    inactive
                                                </span>
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                        <p className="mt-1 text-xs text-slate-500">
                            Cocher transfère la liste vers cette stratégie au moment de la sauvegarde.
                        </p>
                    </div>

                    {/* ICP */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ICP — profil cible</label>
                        <textarea
                            value={icp}
                            onChange={(e) => setIcp(e.target.value)}
                            rows={4}
                            placeholder="Qui appelez-vous ? Industrie, taille, fonction, signaux…"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Pitch */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Pitch</label>
                        <textarea
                            value={pitch}
                            onChange={(e) => setPitch(e.target.value)}
                            rows={5}
                            placeholder="Message à porter — valeur, preuve, accroche."
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Base script */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Script de base</label>
                        <textarea
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            rows={10}
                            placeholder="Script utilisé par les SDR sur cette liste."
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            Pour les scripts additionnels ou améliorés par IA, utilisez l’onglet « Stratégie & Scripts ».
                        </p>
                    </div>

                    {/* Readiness summary */}
                    <div className="rounded-lg border border-slate-200 p-3 space-y-1.5 bg-slate-50">
                        <p className="text-xs font-medium text-slate-600 mb-1">État de préparation</p>
                        {readinessRow("ICP renseigné", !!icp.trim())}
                        {readinessRow("Pitch renseigné", !!pitch.trim())}
                        {readinessRow("Script renseigné", !!script.trim())}
                        {readinessRow(
                            `${linkedListIds.size} liste${linkedListIds.size > 1 ? "s" : ""} liée${linkedListIds.size > 1 ? "s" : ""}`,
                            linkedListIds.size > 0
                        )}
                    </div>
                </div>
            )}
        </Drawer>
    );
}
