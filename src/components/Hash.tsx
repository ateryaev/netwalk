import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

interface HashProps extends HTMLAttributes<HTMLSpanElement> {
    className?: string;
    uid?: string | number | null;
}

export function Hash({ className, uid, ...props }: HashProps) {
    if (uid == null) return null;
    const id = String(uid);
    return (<span className={cn("opacity-50", className)} {...props}>#{id.slice(-4)}</span>);
}