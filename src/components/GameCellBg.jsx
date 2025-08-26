import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { SIZE } from "../utils/cfg";

export function GameCellBg({ col, row, cols, rows, selected, style, movable, empty, source, props }) {


    const odd = useMemo(() => (col + row) % 2 === 0, [col, row]);

    return (
        <div
            className={cn('bg-neutral-500 absolute  border-neutral-700x border-[#222]',
                odd && "bg-neutral-600 xxborder-neutral-700",
                source && 'bg-neutral-700  ',
                col === 0 && 'border-l-2',
                row === 0 && 'border-t-2 ',
                col === cols - 1 && 'border-r-2',
                row === rows - 1 && 'border-b-2',

                col === 1110 && row === 0 && 'rounded-tl-sm',

            )}
            style={{ width: `${SIZE}px`, height: `${source ? SIZE * 2 : SIZE}px`, ...style }}
            {...props}
        >
            {/* {movable &&
                <svg viewBox={"0 0 100 100"}
                    opacity={1}
                    strokeLinecap="round" strokeLinejoin="round"
                    className={cn("stroke-neutral-600", odd && "stroke-neutral-500"
                    )}
                    strokeWidth={6}
                >
                    <path d="M12 12 l0 0" />
                    <path d="M88 12 l0 0" />
                    <path d="M88 88 l0 0" />
                    <path d="M12 88 l0 0" />

                </svg>} */}


            <svg viewBox={"0 0 100 100"}
                opacity={0.9}
                strokeLinecap="round" strokeLinejoin="round"
                className={cn("stroke-neutral-600 ", odd && "stroke-neutral-500"
                )}
                strokeWidth={3}
            >
                {empty && <path opacity={0.5} strokeWidth="1" d="M50 50 l20 20 M50 50 l-20 20 M50 50 l-20 -20 M50 50 l20 -20" />}
                {selected && <path strokeWidth={6} stroke="white"
                    d=" M12 18 l0 -6 l6 0
                        M88 18 l0 -6 l-6 0
                        M88 82 l0 6 l-6 0
                        M12 82 l0 6 l6 0" />}

            </svg>
        </div>
    );
}