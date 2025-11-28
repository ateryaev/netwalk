import { clsx } from 'clsx';
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Array<string | null | undefined>): string {
    return twMerge(clsx(...inputs));
}
