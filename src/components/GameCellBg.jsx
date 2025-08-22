import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { SIZE } from "../utils/cfg";

export function GameCellBg({ col, row, selected, style, props }) {



    return (
        <div
            className={cn('bg-neutral-600/80 absolute border border-black/5',
                ((col + row) % 2 === 0) && "bg-neutral-600",
                selected && 'bg-black/30 xborder-4 xborder-white/10',
            )}
            style={{ width: `${SIZE}px`, height: `${SIZE}px`, ...style }}
            {...props}
        ></div>
    );
}