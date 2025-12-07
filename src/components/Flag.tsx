import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

interface HashProps extends HTMLAttributes<HTMLImageElement> {
    className?: string;
    code?: string | number | null;
}

export function Flag({ className, code, ...props }: HashProps) {
    const ncode = String(code).toUpperCase();
    return (
        <div className="flex items-center">
            <img className={cn("h-[1em] min-w-[1.5em] min-h-[1em] aspect-[3/2] ring-1 ring-black/10", className)}
                src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${ncode}.svg`}
                {...props} /><div className="w-0">&nbsp;</div></div>
    )

}