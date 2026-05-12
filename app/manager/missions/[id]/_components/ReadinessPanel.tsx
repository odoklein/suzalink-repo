"use client";

import { CheckCircle2, AlertCircle, Circle } from "lucide-react";

interface ReadinessPanelProps {
    readiness?: {
        activeLists: number;
        readyLists: number;
        missingStrategy: number;
        missingIcp: number;
        missingPitch: number;
        missingScript: number;
    };
    onConfigureClick?: () => void;
}

export function ReadinessPanel({ readiness, onConfigureClick }: ReadinessPanelProps) {
    if (!readiness) return null;
    const { activeLists, readyLists, missingStrategy, missingIcp, missingPitch, missingScript } = readiness;

    if (activeLists === 0) return null;

    const incomplete = activeLists - readyLists;
    const allReady = incomplete === 0;
    const totalGaps = missingStrategy + missingIcp + missingPitch + missingScript;

    const wrapperCls = allReady
        ? "bg-emerald-50 border-emerald-200"
        : missingStrategy > 0
            ? "bg-amber-50 border-amber-200"
            : "bg-sky-50 border-sky-200";

    return (
        <div className={`mt-4 flex items-center justify-between gap-4 rounded-2xl border p-4 ${wrapperCls}`}>
            <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-semibold">{readyLists}</span>
                    <span className="text-slate-600">prêtes</span>
                </div>
                {incomplete > 0 && missingStrategy < incomplete && (
                    <div className="flex items-center gap-2 text-sky-700">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-semibold">{incomplete - missingStrategy}</span>
                        <span className="text-slate-600">à compléter</span>
                    </div>
                )}
                {missingStrategy > 0 && (
                    <div className="flex items-center gap-2 text-amber-700">
                        <Circle className="w-4 h-4" />
                        <span className="font-semibold">{missingStrategy}</span>
                        <span className="text-slate-600">sans stratégie</span>
                    </div>
                )}
                <div className="text-slate-500">
                    <span className="font-medium text-slate-700">{activeLists}</span> liste{activeLists > 1 ? "s" : ""} active{activeLists > 1 ? "s" : ""}
                </div>
            </div>
            {!allReady && (
                <button
                    type="button"
                    onClick={onConfigureClick}
                    className="text-sm font-medium text-indigo-700 hover:text-indigo-800 hover:underline"
                >
                    Tout configurer ({totalGaps} manque{totalGaps > 1 ? "s" : ""})
                </button>
            )}
            {allReady && (
                <span className="text-xs font-medium text-emerald-700">
                    Toutes les listes actives sont prêtes pour les SDR.
                </span>
            )}
        </div>
    );
}
