"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Shared sub-navigation primitive — Phase 2 of manager refactor.
// Replaces the per-feature sub-nav components (BillingSubNav, EmailHubTabs,
// future SettingsSubNav, ProspectsSubNav) with one tested pattern.
// Pass label + href + icon. `exact` controls active-state matching: use it
// for the landing item so its prefix-match doesn't swallow sibling routes.

export interface SubNavItem {
    href: string;
    label: string;
    icon: LucideIcon;
    /** Match only the exact href (use for landing items). Defaults to false. */
    exact?: boolean;
    /** Optional permission code; item is hidden if user lacks it. */
    permission?: string;
}

interface SubNavProps {
    items: SubNavItem[];
    /** Small uppercase label rendered above the nav (e.g. "Facturation"). */
    eyebrow?: string;
    className?: string;
    "aria-label"?: string;
}

function isItemActive(pathname: string, item: SubNavItem): boolean {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
}

export function SubNav({
    items,
    eyebrow,
    className,
    "aria-label": ariaLabel,
}: SubNavProps) {
    const pathname = usePathname();

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            {eyebrow && (
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {eyebrow}
                </p>
            )}
            <nav
                className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 overflow-x-auto"
                aria-label={ariaLabel ?? eyebrow ?? "Sub-navigation"}
            >
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = isItemActive(pathname, item);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                                isActive
                                    ? "bg-white text-indigo-700 shadow-sm border border-slate-200/80"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                            )}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

export default SubNav;
