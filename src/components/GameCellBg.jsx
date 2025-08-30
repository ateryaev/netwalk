import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { SIZE } from "../utils/cfg";
import { XY } from "../utils/vectors";

export function GameCellBg({ col, row, cols, rows, selected, movable, empty, source, ...props }) {


    const odd = useMemo(() => (col + row) % 2 === 0, [col, row]);
    const size = useMemo(() => (XY(100, source ? 200 : 100)), [source])

    const [key, setKey] = useState(0);
    useEffect(() => {
        selected && setKey((prev) => prev + 1)
    }, [selected]);

    return (
        <div
            className={cn('bg-neutral-500 absolute  border-[#222] border-none',
                odd && "bg-neutral-600 ",
                source && 'bg-neutral-700  ',
                // col === 0 && 'border-l-4',
                // row === 0 && 'border-t-4 ',
                // col === cols - 1 && 'border-r-4',
                // row === rows - 1 && 'border-b-4',

                col === 1110 && row === 0 && 'rounded-tl-sm',
            )}

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


            <svg viewBox={`0 0 ${size.x} ${size.y}`}
                opacity={0.9}
                strokeLinecap="round" strokeLinejoin="round"
                className={cn("stroke-neutral-600 ", odd && "stroke-neutral-500"
                )}
                strokeWidth={3}
            >
                {empty && <path opacity={0.5} strokeWidth="1" d="M50 50 l20 20 M50 50 l-20 20 M50 50 l-20 -20 M50 50 l20 -20" />}
                <path key={key} strokeWidth={5} opacity={selected ? 1 : 0} stroke={"#aaa"}
                    d={`M12 18 l0 -6 l6 0
                        M${size.x - 12} ${18} l0 -6 l-6 0
                        M${size.x - 12} ${size.y - 18} l0 6 l-6 0
                        M${12} ${size.y - 18} l0 6 l6 0`} />

                <g strokeWidth={4} opacity={1} stroke="#222">
                    {col === 0 && <path d={`M0 0 l0 ${size.y}`} />}
                    {col === cols - 1 && <path d={`M ${size.x} 0 l0 ${size.y}`} />}
                    {row === 0 && <path d={`M0 0 l${size.x} 0`} />}
                    {row === rows - 1 && <path d={`M0 ${size.y} l${size.x} 0`} />}
                </g>

                {/* <g strokeWidth={5} opacity={1} stroke="#222" strokeLinecap="square" strokeLinejoin="square">
                    {col === 0 && <path d={`M10 10 l0 ${size.y - 20}`} />}
                    {col === cols - 1 && <path d={`M ${size.x} 0 l0 ${size.y}`} />}
                    {row === 0 && <path d={`M0 0 l${size.x} 0`} />}
                    {row === rows - 1 && <path d={`M0 ${size.y} l${size.x} 0`} />}
                </g> */}
            </svg>
        </div >
    );
}