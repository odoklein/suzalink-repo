"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    AlertCircle,
    ArrowRight,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail,
    ShieldCheck,
} from "lucide-react";
import { ElanLogo } from "@/components/brand/ElanLogo";
import { CadenceBars } from "@/components/brand/CadenceBars";
import { trackLogin } from "@/lib/analytics/umami";

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const errorCode = searchParams.get("error");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        if (errorCode) trackLogin(false);
    }, [errorCode]);

    const errorMessage = errorCode
        ? errorCode.includes("verrouillé") || errorCode.includes("Trop")
            ? errorCode
            : errorCode === "CredentialsSignin"
                ? "Adresse e-mail ou mot de passe incorrect."
                : "La connexion a échoué. Réessayez dans un instant."
        : "";

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            await signIn("credentials", { email, password, callbackUrl });
            trackLogin(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={`elan-login${mounted ? " is-ready" : ""}`}>
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

            <section className="elan-login-form-shell">
                <div className="elan-login-form-wrap">
                    <ElanLogo tone="petrol" className="elan-login-mobile-logo text-[38px]" />

                    <header className="elan-login-heading">
                        <p>Votre espace de travail</p>
                        <h2>Reprenez la main.</h2>
                        <span>Connectez-vous pour retrouver votre plateau.</span>
                    </header>

                    <form onSubmit={handleSubmit} className="elan-login-form" noValidate>
                        <div className="elan-login-field">
                            <label htmlFor="login-email">Adresse e-mail</label>
                            <div className="elan-login-input-wrap">
                                <Mail size={17} aria-hidden="true" />
                                <input
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

                    <p className="elan-login-copyright">
                        élan © {new Date().getFullYear()} · Produit par Suzali
                    </p>
                </div>
            </section>
        </main>
    );
}
