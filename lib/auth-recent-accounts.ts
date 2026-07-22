/**
 * auth-recent-accounts.ts
 *
 * Manages "Comptes récents" (recent accounts) persisted in localStorage.
 * Passwords are XOR-obfuscated with a fixed site key so they are never
 * stored as plain text in the browser storage (not a security guarantee,
 * just a deterrent against casual inspection).
 */

const LS_KEY = "elan_recent_accounts";
const MAX_ACCOUNTS = 5;

// Lightweight, deterministic obfuscation — NOT cryptographic.
const OBFUSCATION_KEY = "elan-2024-xor-key";

function xorObfuscate(text: string): string {
    const key = OBFUSCATION_KEY;
    let result = "";
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    // Encode as base64 so it's URL-safe and readable-looking
    try {
        return btoa(result);
    } catch {
        return btoa(encodeURIComponent(result));
    }
}

function xorDeobfuscate(encoded: string): string {
    try {
        const key = OBFUSCATION_KEY;
        let raw: string;
        try {
            raw = atob(encoded);
        } catch {
            raw = decodeURIComponent(atob(encoded));
        }
        let result = "";
        for (let i = 0; i < raw.length; i++) {
            result += String.fromCharCode(raw.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return result;
    } catch {
        return "";
    }
}

export interface RecentAccount {
    /** User's email address (primary key) */
    email: string;
    /** User's display name */
    name: string;
    /** Obfuscated password for 1-click re-login */
    _pw: string;
    /** Optional avatar URL (profile picture) */
    avatarUrl?: string;
    /** ISO timestamp of last successful login */
    lastLoginAt: number;
}

/** Internal shape stored in localStorage (password is obfuscated) */
type StoredAccount = Omit<RecentAccount, "_pw"> & { _pw: string };

function isClient(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readFromStorage(): StoredAccount[] {
    if (!isClient()) return [];
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed as StoredAccount[];
    } catch {
        return [];
    }
}

function writeToStorage(accounts: StoredAccount[]): void {
    if (!isClient()) return;
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(accounts));
    } catch {
        // localStorage unavailable (private mode, quota exceeded, etc.)
    }
}

// ──────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────

/**
 * Persists a successfully authenticated account to localStorage.
 * Existing entry for the same email is updated; old entries beyond
 * MAX_ACCOUNTS are pruned.
 */
export function saveRecentAccount(params: {
    email: string;
    name: string;
    password: string;
    avatarUrl?: string;
}): void {
    const existing = readFromStorage().filter((a) => a.email !== params.email);
    const updated: StoredAccount = {
        email: params.email,
        name: params.name,
        _pw: xorObfuscate(params.password),
        avatarUrl: params.avatarUrl,
        lastLoginAt: Date.now(),
    };
    const next = [updated, ...existing].slice(0, MAX_ACCOUNTS);
    writeToStorage(next);
}

/**
 * Returns the stored recent accounts sorted by lastLoginAt (newest first),
 * with plain-text passwords restored from the obfuscated value.
 */
export function getRecentAccounts(): RecentAccount[] {
    return readFromStorage()
        .sort((a, b) => b.lastLoginAt - a.lastLoginAt)
        .map((a) => ({ ...a, _pw: xorDeobfuscate(a._pw) }));
}

/**
 * Removes an account from localStorage by email.
 */
export function removeRecentAccount(email: string): void {
    const filtered = readFromStorage().filter((a) => a.email !== email);
    writeToStorage(filtered);
}

/**
 * Clears ALL stored recent accounts.
 */
export function clearRecentAccounts(): void {
    if (!isClient()) return;
    localStorage.removeItem(LS_KEY);
}
