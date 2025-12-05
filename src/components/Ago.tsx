import { useEffect, useState } from 'react';

export function formatAgo(at: Date | number | string): string {
    const then = typeof at === 'number' ? at : new Date(at).getTime();
    if (Number.isNaN(then)) return '';
    const diff = Date.now() - then;
    if (diff < 1000) return 'just now';

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
}

export function Ago({ at }: { at: Date | number | string }) {
    const [ago, setAgo] = useState(formatAgo(at));
    useEffect(() => {
        setAgo(formatAgo(at));
        const interval = setInterval(() => setAgo(formatAgo(at)), 1000);
        return () => clearInterval(interval);
    }, [at]);
    return <>{ago}</>;
}