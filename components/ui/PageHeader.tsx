"use client";

import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    actions?: ReactNode;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    className?: string;
    variant?: "default" | "hero";
}

export function PageHeader({
    title,
    subtitle,
    icon,
    actions,
    onRefresh,
    isRefreshing = false,
    className,
    variant = "default",
}: PageHeaderProps) {
    if (variant === "hero") {
        return (
            <div
                className={cn(
                    "relative overflow-hidden rounded-[16px] bg-[#0C3B38] p-8 text-[#F4F0E8]",
                    "after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-[#FF9E1B]",
                    className
                )}
            >
                <div className="relative z-10">
                    {icon && (
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#FF9E1B]">
                            {icon}
                        </div>
                    )}
                    <h1 className="font-display mb-2 text-3xl font-bold tracking-[-0.025em]">
                        {title}
                    </h1>
                    {subtitle && <p className="max-w-xl text-[#C0CCC7]">{subtitle}</p>}
                    {actions && <div className="mt-6 flex items-center gap-3">{actions}</div>}
                </div>
            </div>
        );
    }

    return (
        <div className={cn("flex items-center justify-between gap-5", className)}>
            <div>
                <h1 className="font-display text-[28px] font-bold leading-tight tracking-[-0.025em] text-[#15201E]">
                    {title}
                </h1>
                {subtitle && <p className="mt-1 text-sm text-[#5C6E69]">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        className="rounded-[9px] border border-[rgba(21,32,30,.16)] bg-[#F4F0E8] p-2.5 transition-colors hover:bg-[#ECE5D8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9E1B]/35"
                        aria-label="Rafraîchir"
                    >
                        <RefreshCw
                            className={cn("h-4 w-4 text-[#5C6E69]", isRefreshing && "animate-spin")}
                        />
                    </button>
                )}
                {actions}
            </div>
        </div>
    );
}

export default PageHeader;
