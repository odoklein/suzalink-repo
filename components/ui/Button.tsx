"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "success" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

const BUTTON_BASE_STYLES =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold rounded-[10px] transition-all duration-150 cursor-pointer border disabled:opacity-45 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9E1B]/35 focus-visible:ring-offset-2 active:translate-y-px";

const BUTTON_VARIANTS: Record<string, string> = {
    primary:
        "bg-[#FF9E1B] text-[#15201E] border-[#E07C00] hover:bg-[#F09212] hover:shadow-[0_7px_20px_rgba(224,124,0,.16)]",
    secondary:
        "bg-[#F4F0E8] text-[#15201E] border-[#CFC5B5] hover:bg-[#ECE5D8] hover:border-[#BEB19F]",
    outline:
        "bg-transparent text-[#0C3B38] border-[#AAB8B2] hover:bg-[#DBE4DF] hover:border-[#0C3B38]",
    success:
        "bg-[#25745F] text-white border-[#1E604F] hover:bg-[#1E604F]",
    danger:
        "bg-[#B9433E] text-white border-[#963632] hover:bg-[#963632]",
    ghost: "bg-transparent text-[#5C6E69] border-transparent hover:text-[#15201E] hover:bg-[#E4DBCA]",
};

const BUTTON_SIZES: Record<string, string> = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "primary",
            size = "md",
            isLoading = false,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                className={cn(BUTTON_BASE_STYLES, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;
