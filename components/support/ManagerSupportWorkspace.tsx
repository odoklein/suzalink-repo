"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { SUP_DARK, SupportStyles } from "./supportStyles";
import { AvatarRing, SupportBubble } from "./SupportBubble";
import type {
    SupportConversationDetailDTO,
    SupportConversationSummaryDTO,
    SupportMessageDTO,
} from "@/lib/support/types";

type TabFilter = "ACTIVE" | "RESOLVED" | "ALL" | "UNREAD";

const POLL_INTERVAL_MS = 20_000;
const T = SUP_DARK;

interface ManagerSupportWorkspaceProps {
    isOpen: boolean;
    onClose: () => void;
}

function formatRelative(value: string | null): string {
    if (!value) return "";
    const ts = new Date(value).getTime();
    const diff = Date.now() - ts;
    if (diff < 60_000) return "à l'instant";
    if (diff < 3_600_000) return `il y a ${Math.floor(diff / 60_000)} min`;
    if (diff < 86_400_000) return `il y a ${Math.floor(diff / 3_600_000)} h`;
    return new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function ManagerSupportWorkspace({ isOpen, onClose }: ManagerSupportWorkspaceProps) {
    const { data: session } = useSession();
    const [conversations, setConversations] = useState<SupportConversationSummaryDTO[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [detail, setDetail] = useState<SupportConversationDetailDTO | null>(null);
    const [tab, setTab] = useState<TabFilter>("ACTIVE");
    const [search, setSearch] = useState("");
    const [loadingList, setLoadingList] = useState(false);
    const [replyValue, setReplyValue] = useState("");
    const [sending, setSending] = useState(false);
    const [resolving, setResolving] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const fetchList = useCallback(async () => {
        try {
            setLoadingList(true);
            const params = new URLSearchParams();
            if (tab === "ACTIVE" || tab === "RESOLVED") params.set("status", tab);
            if (tab === "UNREAD") params.set("unreadOnly", "true");
            if (search.trim()) params.set("search", search.trim());
            const res = await fetch(`/api/support/manager/conversations?${params.toString()}`);
            const json = await res.json();
            if (!json?.success) return;
            setConversations(json.data as SupportConversationSummaryDTO[]);
        } finally {
            setLoadingList(false);
        }
    }, [tab, search]);

    const fetchDetail = useCallback(async (id: string) => {
        const res = await fetch(`/api/support/manager/conversations/${id}`);
        const json = await res.json();
        if (json?.success) {
            setDetail(json.data as SupportConversationDetailDTO);
        }
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        fetchList();
        const id = window.setInterval(fetchList, POLL_INTERVAL_MS);
        return () => window.clearInterval(id);
    }, [isOpen, fetchList]);

    useEffect(() => {
        if (!selectedId) {
            setDetail(null);
            return;
        }
        fetchDetail(selectedId);
        fetch(`/api/support/manager/conversations/${selectedId}/read`, { method: "POST" })
            .catch(() => undefined)
            .finally(() => fetchList());
    }, [selectedId, fetchDetail, fetchList]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [detail?.messages.length]);

    const filteredConversations = useMemo(() => {
        if (tab === "UNREAD") return conversations.filter((c) => c.unreadCount > 0);
        return conversations;
    }, [conversations, tab]);

    const handleReply = async () => {
        if (!selectedId || !replyValue.trim() || sending) return;
        const content = replyValue.trim();
        setSending(true);

        const optimistic: SupportMessageDTO = {
            id: `tmp-${Date.now()}`,
            conversationId: selectedId,
            role: "MANAGER",
            content,
            intent: null,
            context: null,
            author: session?.user
                ? {
                    id: session.user.id,
                    name: session.user.name ?? "Vous",
                    role: "MANAGER",
                }
                : null,
            createdAt: new Date().toISOString(),
        };
        setDetail((current) =>
            current ? { ...current, messages: [...current.messages, optimistic] } : current,
        );
        setReplyValue("");

        try {
            const res = await fetch(
                `/api/support/manager/conversations/${selectedId}/messages`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content }),
                },
            );
            const json = await res.json();
            if (!res.ok || !json?.success) throw new Error(json?.error ?? "Erreur");
            const saved = json.data as SupportMessageDTO;
            setDetail((current) =>
                current
                    ? {
                        ...current,
                        messages: current.messages
                            .filter((m) => m.id !== optimistic.id)
                            .concat(saved),
                        messageCount: current.messageCount + 1,
                        lastMessageAt: saved.createdAt,
                        status: "ACTIVE",
                        resolvedAt: null,
                        resolvedBy: null,
                    }
                    : current,
            );
            fetchList();
        } catch {
            setDetail((current) =>
                current
                    ? {
                        ...current,
                        messages: current.messages.filter((m) => m.id !== optimistic.id),
                    }
                    : current,
            );
        } finally {
            setSending(false);
        }
    };

    const handleResolveToggle = async () => {
        if (!detail || resolving) return;
        setResolving(true);
        const isResolved = detail.status === "RESOLVED";
        try {
            const res = await fetch(
                `/api/support/manager/conversations/${detail.id}/resolve`,
                { method: isResolved ? "DELETE" : "POST" },
            );
            if (!res.ok) return;
            await fetchDetail(detail.id);
            fetchList();
        } finally {
            setResolving(false);
        }
    };

    const handlePinToggle = async () => {
        if (!detail) return;
        const next = !detail.isPinned;
        try {
            await fetch(`/api/support/manager/conversations/${detail.id}/pin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pinned: next }),
            });
            setDetail({ ...detail, isPinned: next });
            fetchList();
        } catch {
            // ignore
        }
    };

    if (!isOpen) return null;

    const tabButtonStyle = (active: boolean): React.CSSProperties => ({
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        border: "none",
        background: active ? T.brandSoft : "transparent",
        color: active ? T.brand : T.ink3,
        transition: "all 150ms ease",
    });

    return (
        <>
            <SupportStyles />
            <div
                className="cp-support-root cp-support-root-dark"
                role="dialog"
                aria-label="Support — espace manager"
                aria-modal="true"
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 110,
                    background: "rgba(7,12,10,0.62)",
                    backdropFilter: "blur(6px)",
                    display: "flex",
                    justifyContent: "flex-end",
                    animation: "cpSupPanelIn 0.25s ease both",
                }}
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <aside
                    style={{
                        width: "min(1080px, 100%)",
                        height: "100%",
                        display: "flex",
                        background: T.surface,
                        borderLeft: `1px solid ${T.line}`,
                        boxShadow: "-32px 0 80px rgba(0,0,0,0.5)",
                        animation: "cpSupPanelIn 0.3s cubic-bezier(.34,1.4,.64,1) both",
                    }}
                >
                    {/* LIST column */}
                    <div
                        style={{
                            width: 340,
                            minWidth: 280,
                            borderRight: `1px solid ${T.line}`,
                            display: "flex",
                            flexDirection: "column",
                            background: T.surfaceSunken,
                        }}
                    >
                        <div
                            style={{
                                padding: "18px 18px 12px",
                                borderBottom: `1px solid ${T.lineSoft}`,
                                flexShrink: 0,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: 12,
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: T.ink4,
                                            fontWeight: 700,
                                            letterSpacing: "0.08em",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        Support
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 16,
                                            color: T.ink,
                                            fontWeight: 700,
                                            marginTop: 2,
                                            letterSpacing: "-0.01em",
                                        }}
                                    >
                                        Conversations clients
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Fermer"
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: T.radiusS,
                                        background: T.surfaceRaised,
                                        border: `1px solid ${T.line}`,
                                        color: T.ink3,
                                        cursor: "pointer",
                                        fontSize: 14,
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") fetchList();
                                }}
                                placeholder="Rechercher un client..."
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    borderRadius: T.radiusS,
                                    border: `1px solid ${T.line}`,
                                    background: T.surfaceRaised,
                                    color: T.ink,
                                    fontSize: 13,
                                    fontFamily: "inherit",
                                    outline: "none",
                                }}
                            />
                            <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
                                <button type="button" style={tabButtonStyle(tab === "ACTIVE")} onClick={() => setTab("ACTIVE")}>
                                    Actives
                                </button>
                                <button type="button" style={tabButtonStyle(tab === "UNREAD")} onClick={() => setTab("UNREAD")}>
                                    Non lus
                                </button>
                                <button type="button" style={tabButtonStyle(tab === "RESOLVED")} onClick={() => setTab("RESOLVED")}>
                                    Résolues
                                </button>
                                <button type="button" style={tabButtonStyle(tab === "ALL")} onClick={() => setTab("ALL")}>
                                    Toutes
                                </button>
                            </div>
                        </div>
                        <div
                            className="cp-sup-scroll-hidden"
                            style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}
                        >
                            {loadingList && conversations.length === 0 ? (
                                <div style={{ padding: 16, color: T.ink3, fontSize: 13 }}>
                                    Chargement…
                                </div>
                            ) : filteredConversations.length === 0 ? (
                                <div
                                    style={{
                                        padding: 24,
                                        textAlign: "center",
                                        color: T.ink3,
                                        fontSize: 13,
                                    }}
                                >
                                    Aucune conversation.
                                </div>
                            ) : (
                                filteredConversations.map((conv) => {
                                    const isActive = conv.id === selectedId;
                                    return (
                                        <button
                                            type="button"
                                            key={conv.id}
                                            onClick={() => setSelectedId(conv.id)}
                                            style={{
                                                width: "100%",
                                                textAlign: "left",
                                                background: isActive ? T.brandSoft : "transparent",
                                                borderLeft: isActive
                                                    ? `3px solid ${T.brand}`
                                                    : "3px solid transparent",
                                                padding: "12px 16px",
                                                cursor: "pointer",
                                                border: "none",
                                                borderBottom: `1px solid ${T.lineSoft}`,
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 4,
                                                transition: "background 150ms ease",
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <AvatarRing
                                                    name={conv.clientName}
                                                    size={28}
                                                    theme="dark"
                                                    status={conv.status === "ACTIVE" ? "online" : "offline"}
                                                />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "baseline",
                                                            gap: 6,
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontWeight: 700,
                                                                fontSize: 13,
                                                                color: T.ink,
                                                                whiteSpace: "nowrap",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                            }}
                                                        >
                                                            {conv.clientName}
                                                        </span>
                                                        <span
                                                            className="cp-support-root-mono"
                                                            style={{
                                                                fontSize: 10.5,
                                                                color: T.ink4,
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {formatRelative(conv.lastMessageAt)}
                                                        </span>
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 12,
                                                            color: T.ink3,
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                        }}
                                                    >
                                                        {conv.lastMessagePreview ?? "Aucun message"}
                                                    </div>
                                                </div>
                                                {conv.unreadCount > 0 && (
                                                    <span
                                                        style={{
                                                            minWidth: 18,
                                                            height: 18,
                                                            padding: "0 6px",
                                                            borderRadius: 9,
                                                            background: T.danger,
                                                            fontSize: 10,
                                                            fontWeight: 700,
                                                            color: "#fff",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: "flex", gap: 6, marginLeft: 36, alignItems: "center" }}>
                                                {conv.status === "RESOLVED" && (
                                                    <span
                                                        style={{
                                                            fontSize: 10,
                                                            padding: "1px 7px",
                                                            borderRadius: 6,
                                                            background: T.brandSoft,
                                                            color: T.brand,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        Résolu
                                                    </span>
                                                )}
                                                {conv.lastIntent && (
                                                    <span
                                                        style={{
                                                            fontSize: 10,
                                                            padding: "1px 7px",
                                                            borderRadius: 6,
                                                            background: T.accentAmberSoft,
                                                            color: T.accentAmber,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {conv.lastIntent}
                                                    </span>
                                                )}
                                                {conv.isPinned && (
                                                    <span style={{ fontSize: 10, color: T.accentAmber }}>📌</span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* DETAIL column */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                        {!detail ? (
                            <div
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: T.ink3,
                                    gap: 10,
                                    padding: 24,
                                    textAlign: "center",
                                }}
                            >
                                <span style={{ fontSize: 32 }}>🎧</span>
                                <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>
                                    Sélectionnez une conversation
                                </div>
                                <div style={{ fontSize: 13, maxWidth: 360 }}>
                                    Toutes les demandes de support clients sont visibles par l'équipe des managers.
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Detail header */}
                                <div
                                    style={{
                                        padding: "14px 20px",
                                        borderBottom: `1px solid ${T.line}`,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        flexShrink: 0,
                                        background: T.surfaceRaised,
                                    }}
                                >
                                    <AvatarRing
                                        name={detail.clientName}
                                        size={40}
                                        theme="dark"
                                        status={detail.status === "ACTIVE" ? "online" : "offline"}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontSize: 15,
                                                fontWeight: 700,
                                                color: T.ink,
                                                letterSpacing: "-0.01em",
                                            }}
                                        >
                                            {detail.clientName}
                                        </div>
                                        <div style={{ fontSize: 12, color: T.ink3, marginTop: 2 }}>
                                            {detail.messageCount} messages ·{" "}
                                            {detail.status === "ACTIVE"
                                                ? "Conversation active"
                                                : "Résolu"}
                                            {detail.resolvedBy && detail.status === "RESOLVED" && (
                                                <> · par {detail.resolvedBy.name}</>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handlePinToggle}
                                        aria-label={detail.isPinned ? "Détacher" : "Épingler"}
                                        style={{
                                            padding: "6px 10px",
                                            borderRadius: T.radiusS,
                                            background: detail.isPinned ? T.accentAmberSoft : T.surface,
                                            border: `1px solid ${detail.isPinned ? "rgba(244,181,96,0.3)" : T.line}`,
                                            color: detail.isPinned ? T.accentAmber : T.ink3,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                        }}
                                    >
                                        {detail.isPinned ? "📌 Épinglé" : "Épingler"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResolveToggle}
                                        disabled={resolving}
                                        style={{
                                            padding: "6px 12px",
                                            borderRadius: T.radiusS,
                                            background:
                                                detail.status === "RESOLVED" ? T.surface : T.brandSoft,
                                            border: `1px solid ${detail.status === "RESOLVED" ? T.line : "rgba(124,92,252,0.35)"}`,
                                            color: detail.status === "RESOLVED" ? T.ink2 : T.brand,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: resolving ? "not-allowed" : "pointer",
                                            opacity: resolving ? 0.5 : 1,
                                        }}
                                    >
                                        {detail.status === "RESOLVED" ? "Rouvrir" : "✓ Marquer résolu"}
                                    </button>
                                </div>

                                {/* Messages */}
                                <div
                                    className="cp-sup-scroll-hidden"
                                    style={{
                                        flex: 1,
                                        overflowY: "auto",
                                        padding: "18px 20px",
                                        background:
                                            detail.status === "RESOLVED"
                                                ? "rgba(124,92,252,0.06)"
                                                : T.surface,
                                        transition: "background 0.4s ease",
                                    }}
                                >
                                    {detail.messages.map((m, i) => (
                                        <SupportBubble
                                            key={m.id}
                                            message={m}
                                            viewpoint="manager"
                                            theme="dark"
                                            isLast={
                                                i === detail.messages.length - 1 && m.role === "MANAGER"
                                            }
                                            seen
                                        />
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Composer */}
                                {detail.status === "ACTIVE" ? (
                                    <div
                                        style={{
                                            borderTop: `1px solid ${T.line}`,
                                            padding: "12px 20px",
                                            background: T.surfaceRaised,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                                            <div
                                                style={{
                                                    flex: 1,
                                                    borderRadius: T.radiusS,
                                                    background: T.surface,
                                                    border: `1px solid ${T.line}`,
                                                    padding: "8px 12px",
                                                }}
                                            >
                                                <textarea
                                                    className="cp-sup-composer-input cp-sup-scroll-hidden"
                                                    value={replyValue}
                                                    onChange={(e) => setReplyValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleReply();
                                                        }
                                                    }}
                                                    placeholder={`Répondre à ${detail.clientName}...`}
                                                    rows={2}
                                                    aria-label="Répondre au client"
                                                    style={{
                                                        width: "100%",
                                                        background: "transparent",
                                                        border: "none",
                                                        resize: "none",
                                                        color: T.ink,
                                                        fontSize: 13.5,
                                                        fontFamily: "inherit",
                                                        lineHeight: 1.5,
                                                        maxHeight: 160,
                                                    }}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleReply}
                                                disabled={!replyValue.trim() || sending}
                                                aria-label="Envoyer"
                                                style={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: T.radiusS,
                                                    background: replyValue.trim()
                                                        ? `linear-gradient(135deg, ${T.brand}, ${T.brandStrong})`
                                                        : T.surface,
                                                    border: replyValue.trim() ? "none" : `1px solid ${T.line}`,
                                                    color: replyValue.trim() ? "#0F1812" : T.ink4,
                                                    cursor: replyValue.trim() && !sending ? "pointer" : "not-allowed",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    transition: "all 200ms cubic-bezier(.34,1.56,.64,1)",
                                                    boxShadow: replyValue.trim()
                                                        ? "0 6px 14px rgba(79,158,107,0.3)"
                                                        : "none",
                                                }}
                                            >
                                                <svg
                                                    width={18}
                                                    height={18}
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={2.5}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M22 2 11 13" />
                                                    <path d="M22 2 15 22 11 13 2 9l20-7z" />
                                                </svg>
                                            </button>
                                        </div>
                                        <p
                                            className="cp-support-root-mono"
                                            style={{
                                                fontSize: 10.5,
                                                color: T.ink4,
                                                textAlign: "center",
                                                marginTop: 6,
                                                letterSpacing: "0.02em",
                                            }}
                                        >
                                            Entrée pour envoyer · Maj+Entrée pour saut de ligne
                                        </p>
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            padding: "14px 20px",
                                            borderTop: `1px solid ${T.line}`,
                                            background: "rgba(124,92,252,0.08)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <div style={{ fontSize: 13, color: T.brand, fontWeight: 600 }}>
                                            ✓ Conversation résolue{" "}
                                            {detail.resolvedAt
                                                ? `le ${new Date(detail.resolvedAt).toLocaleString("fr-FR")}`
                                                : ""}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleResolveToggle}
                                            disabled={resolving}
                                            style={{
                                                padding: "6px 14px",
                                                borderRadius: T.radiusS,
                                                background: T.brandSoft,
                                                border: "1px solid rgba(124,92,252,0.35)",
                                                color: T.brand,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                cursor: "pointer",
                                            }}
                                        >
                                            Rouvrir
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </aside>
            </div>
        </>
    );
}
