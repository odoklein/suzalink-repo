import { cn } from "@/lib/utils";

interface ElanLogoProps {
    className?: string;
    compact?: boolean;
    tone?: "paper" | "ink" | "petrol";
}

export function ElanLogo({
    className,
    compact = false,
    tone = "paper",
}: ElanLogoProps) {
    return (
        <span
            className={cn("elan-logo", `elan-logo-${tone}`, compact && "elan-logo-compact", className)}
            aria-label="élan"
        >
            <span aria-hidden="true" className="elan-logo-word">
                <span className="elan-logo-e">
                    e<span className="elan-logo-needle" />
                </span>
                {!compact && "lan"}
            </span>
        </span>
    );
}

export default ElanLogo;
