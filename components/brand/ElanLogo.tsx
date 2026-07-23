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
    const asset = compact
        ? "/brand/prospecto-icon.svg"
        : "/brand/prospecto-logo.svg";
    const dimensions = compact
        ? { width: 157, height: 164 }
        : { width: 237, height: 29 };

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
        </span>
    );
}

export default ElanLogo;
