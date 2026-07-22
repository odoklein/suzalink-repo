"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    AlertCircle,
    ArrowRight,
    ChevronLeft,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail,
    ShieldCheck,
    Trash2,
    UserCircle2,
} from "lucide-react";
import { ElanLogo } from "@/components/brand/ElanLogo";
import { CadenceBars } from "@/components/brand/CadenceBars";
import { trackLogin } from "@/lib/analytics/umami";
import {
    getRecentAccounts,
    removeRecentAccount,
    saveRecentAccount,
    type RecentAccount,
} from "@/lib/auth-recent-accounts";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Derive two-letter initials from a display name */
function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Deterministic hue from a string — ensures each user gets a consistent color */
function getAvatarHue(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 360;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const errorCode = searchParams.get("error");

    // ── form state ──────────────────────────────────────────────────────────
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);

    // ── recent accounts ─────────────────────────────────────────────────────
    const [recentAccounts, setRecentAccounts] = useState<RecentAccount[]>([]);
    const [view, setView] = useState<"accounts" | "form">("accounts");

    const emailInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        if (errorCode) trackLogin(false);
    }, [errorCode]);

    // Load persisted accounts on mount
    useEffect(() => {
        const stored = getRecentAccounts();
        setRecentAccounts(stored);
        // If no saved accounts, show the form immediately
        if (stored.length === 0) setView("form");
    }, []);

    // When switching to manual form, auto-focus the email field
    useEffect(() => {
        if (view === "form") {
            requestAnimationFrame(() => emailInputRef.current?.focus());
        }
    }, [view]);

    // ── error messaging ─────────────────────────────────────────────────────
    const errorMessage = errorCode
        ? errorCode.includes("verrouillé") || errorCode.includes("Trop")
            ? errorCode
            : errorCode === "CredentialsSignin"
                ? "Adresse e-mail ou mot de passe incorrect."
                : "La connexion a échoué. Réessayez dans un instant."
        : "";

    // ── 1-click login from recent account ───────────────────────────────────
    const handleAccountClick = async (account: RecentAccount) => {
        setLoadingEmail(account.email);
        try {
            await signIn("credentials", {
                email: account.email,
                password: account._pw,
                callbackUrl,
            });
            // Save updated lastLoginAt (the page will redirect on success,
            // but if signIn resolves without redirect we still update storage)
            saveRecentAccount({
                email: account.email,
                name: account.name,
                password: account._pw,
                avatarUrl: account.avatarUrl,
            });
            trackLogin(true);
        } finally {
            setLoadingEmail(null);
        }
    };

    // ── forget account ───────────────────────────────────────────────────────
    const handleForgetAccount = (e: React.MouseEvent, email: string) => {
        e.stopPropagation();
        removeRecentAccount(email);
        const updated = getRecentAccounts();
        setRecentAccounts(updated);
        if (updated.length === 0) setView("form");
    };

    // ── manual form submit ───────────────────────────────────────────────────
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const result = await signIn("credentials", {
                email,
                password,
                callbackUrl,
                redirect: false,
            });

            if (result?.ok && !result?.error) {
                // Persist account before navigating away
                saveRecentAccount({ email, name: email, password });
                trackLogin(true);
                router.push(callbackUrl);
            } else {
                // Let NextAuth handle the redirect to /login?error=...
                await signIn("credentials", { email, password, callbackUrl });
                trackLogin(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ── avatar cell ──────────────────────────────────────────────────────────
    const AvatarCell = ({ account }: { account: RecentAccount }) => {
        const hue = getAvatarHue(account.email);
        if (account.avatarUrl) {
            return (
                <img
                    src={account.avatarUrl}
                    alt={account.name}
                    className="elan-account-avatar-img"
                />
            );
        }
        return (
            <div
                className="elan-account-avatar-initials"
                style={{
                    background: `hsl(${hue} 42% 88%)`,
                    color: `hsl(${hue} 60% 32%)`,
                }}
            >
                {getInitials(account.name)}
            </div>
        );
    };

    // ──────────────────────────────────────────────────────────────────────────
    // Render
    // ──────────────────────────────────────────────────────────────────────────
    return (
        <main className={`elan-login${mounted ? " is-ready" : ""}`}>
            {/* ── Brand panel (left) ── */}
            <aside className="elan-login-brand" aria-label="Présentation élan">
                <ElanLogo className="text-[52px]" />

                <div className="elan-login-message">
                    <p className="elan-login-kicker">Plateforme d&apos;exécution commerciale</p>
                    <h1>Le moteur de votre prospection.</h1>
                    <p>
                        Pilotez l&apos;activité, gardez le cap et transformez chaque action en résultat mesurable.
                    </p>
                </div>

                <div className="elan-login-signature">
                    <CadenceBars count={46} highlightFrom={0.74} dark />
                    <span>Terrain · Cadence · Résultats</span>
                </div>
            </aside>

            {/* ── Form panel (right) ── */}
            <section className="elan-login-form-shell">
                <div className="elan-login-form-wrap">
                    <ElanLogo tone="petrol" className="elan-login-mobile-logo text-[38px]" />

                    {view === "accounts" && recentAccounts.length > 0 ? (
                        /* ── Recent accounts view ── */
                        <>
                            <header className="elan-login-heading">
                                <p>Votre espace de travail</p>
                                <h2>Bon retour.</h2>
                                <span>Sélectionnez votre compte ou connectez-vous avec un autre.</span>
                            </header>

                            <div className="elan-recent-accounts" role="list" aria-label="Comptes récents">
                                <p className="elan-recent-accounts-label">Comptes récents</p>

                                {recentAccounts.map((account) => {
                                    const isThisLoading = loadingEmail === account.email;
                                    return (
                                        <button
                                            key={account.email}
                                            className={`elan-account-card${isThisLoading ? " is-loading" : ""}`}
                                            role="listitem"
                                            onClick={() => !loadingEmail && handleAccountClick(account)}
                                            disabled={!!loadingEmail}
                                            aria-label={`Se connecter en tant que ${account.name}`}
                                        >
                                            <div className="elan-account-avatar">
                                                {isThisLoading ? (
                                                    <Loader2 size={20} className="animate-spin elan-account-spinner" aria-hidden="true" />
                                                ) : (
                                                    <AvatarCell account={account} />
                                                )}
                                            </div>

                                            <div className="elan-account-info">
                                                <span className="elan-account-name">{account.name}</span>
                                                <span className="elan-account-email">{account.email}</span>
                                            </div>

                                            <div className="elan-account-actions">
                                                <button
                                                    type="button"
                                                    className="elan-account-remove"
                                                    onClick={(e) => handleForgetAccount(e, account.email)}
                                                    aria-label={`Oublier le compte ${account.email}`}
                                                    title="Oublier ce compte"
                                                >
                                                    <Trash2 size={15} aria-hidden="true" />
                                                </button>
                                            </div>
                                        </button>
                                    );
                                })}

                                <button
                                    type="button"
                                    className="elan-account-other"
                                    onClick={() => setView("form")}
                                >
                                    <UserCircle2 size={18} aria-hidden="true" />
                                    Utiliser un autre compte
                                </button>
                            </div>

                            <div className="elan-login-security">
                                <ShieldCheck size={18} aria-hidden="true" />
                                <div>
                                    <strong>Accès sécurisé</strong>
                                    <span>Vos données de connexion restent chiffrées.</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* ── Manual form view ── */
                        <>
                            <header className="elan-login-heading">
                                <p>Votre espace de travail</p>
                                <h2>Reprenez la main.</h2>
                                <span>Connectez-vous pour retrouver votre plateau.</span>
                            </header>

                            {recentAccounts.length > 0 && (
                                <button
                                    type="button"
                                    className="elan-login-back-accounts"
                                    onClick={() => setView("accounts")}
                                >
                                    <ChevronLeft size={15} aria-hidden="true" />
                                    Comptes récents
                                </button>
                            )}

                            <form onSubmit={handleSubmit} className="elan-login-form" noValidate>
                                <div className="elan-login-field">
                                    <label htmlFor="login-email">Adresse e-mail</label>
                                    <div className="elan-login-input-wrap">
                                        <Mail size={17} aria-hidden="true" />
                                        <input
                                            ref={emailInputRef}
                                            id="login-email"
                                            type="email"
                                            placeholder="vous@entreprise.fr"
                                            value={email}
                                            onChange={(event) => setEmail(event.target.value)}
                                            required
                                            autoComplete="email"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="elan-login-field">
                                    <div className="elan-login-label-row">
                                        <label htmlFor="login-password">Mot de passe</label>
                                        <button type="button" onClick={() => router.push("/forgot-password")}>
                                            Mot de passe oublié ?
                                        </button>
                                    </div>
                                    <div className="elan-login-input-wrap">
                                        <Lock size={17} aria-hidden="true" />
                                        <input
                                            id="login-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Votre mot de passe"
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            required
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            className="elan-login-eye"
                                            onClick={() => setShowPassword((visible) => !visible)}
                                            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                        >
                                            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                </div>

                                {errorMessage && (
                                    <div className="elan-login-error" role="alert">
                                        <AlertCircle size={17} aria-hidden="true" />
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                <button type="submit" className="elan-login-submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                                            Connexion en cours
                                        </>
                                    ) : (
                                        <>
                                            Entrer sur le terrain
                                            <ArrowRight size={18} aria-hidden="true" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="elan-login-security">
                                <ShieldCheck size={18} aria-hidden="true" />
                                <div>
                                    <strong>Accès sécurisé</strong>
                                    <span>Vos données de connexion restent chiffrées.</span>
                                </div>
                            </div>
                        </>
                    )}

                    <p className="elan-login-copyright">
                        élan © {new Date().getFullYear()} · Produit par Suzali
                    </p>
                </div>
            </section>
        </main>
    );
}
