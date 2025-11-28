import { useEffect, useState } from 'react';

export function Ago({ at }: { at: Date | number | string }) {
    const [ago, setAgo] = useState('');

    useEffect(() => {
        const updateAgo = () => {
            const now = Date.now();
            const then = typeof at === 'number' ? at : new Date(at).getTime();
            const diff = now - then;

            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 0) {
                setAgo(`${days}d ago`);
            } else if (hours > 0) {
                setAgo(`${hours}h ago`);
            } else if (minutes > 0) {
                setAgo(`${minutes}m ago`);
            } else {
                setAgo(`${seconds}s ago`);
            }
        };

        updateAgo();
        const interval = setInterval(updateAgo, 1000);

        return () => clearInterval(interval);
    }, [at]);

    return <>{ago}</>;
}