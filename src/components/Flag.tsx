import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

interface HashProps extends HTMLAttributes<HTMLImageElement> {
    className?: string;
    code?: string | number | null;
}

export function Flag({ className, code, ...props }: HashProps) {
    const ncode = String(code).toUpperCase();
    return (
        <img className={cn("h-[0.8em] aspect-[3/2] mr-1 bg-black/5 ring-1 ring-black/10 border-none", className)}
            src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${ncode}.svg`}
            {...props} />
    )

}