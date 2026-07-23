import Image from "next/image";
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
    const asset = "/brand/elan-mark.svg";
    const dimensions = { width: 208, height: 214 };

    return (
        <span
            className={cn("elan-logo", `elan-logo-${tone}`, compact && "elan-logo-compact", className)}
            role="img"
            aria-label="Prospecto"
        >
            <Image
                aria-hidden="true"
                alt=""
                className="elan-logo-image"
                height={dimensions.height}
                src={asset}
                unoptimized
                width={dimensions.width}
            />
            {!compact && <span className="elan-logo-wordmark">prospecto</span>}
        </span>
    );
}

export default ElanLogo;
