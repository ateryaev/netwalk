import { useRef, useState, useEffect, Children, useCallback, useMemo, Fragment, use } from "react";
import { cn } from "../utils/cn";





export function EndlessScrollView({ ref, className, onDown, onDownCancel, onUp, scrollTop, scrollLeft, onScrollChange, children, ...props }) {
    //const [dragging, setDragging] = useState(false);

    const dragging = useRef(false);

    const startScroll = useRef({ x: scrollLeft, y: scrollTop });
    const currentScroll = useRef({ x: scrollLeft, y: scrollTop });
    const targetScroll = useRef({ x: scrollLeft, y: scrollTop });
    const currentSpeed = useRef({ dx: scrollLeft, dy: scrollTop });
    const scrollUpdatedOn = useRef(0);
    const currentPos = useRef({ x: 0, y: 0 });
    const targetDuration = useRef(0);

    //const currentPointerPos = useRef({ x: 0, y: 0 });
    // const lastMoveTime = useRef(0);
    // const lastMoveSpeed = useRef({ x: 0, y: 0 });





    const handlePointerDown = (event) => {
        dragging.current = true;
        //event.preventDefault();

        const rect = event.currentTarget.getBoundingClientRect();
        const relX = event.clientX - rect.left + scrollLeft;
        const relY = event.clientY - rect.top + scrollTop;

        onDown && onDown(relX, relY);

        //console.log(`DOWN: (${relX}, ${relY})`);
        //setCurrentPointerPos({ x: event.clientX, y: event.clientY });
        startScroll.current = { x: scrollLeft, y: scrollTop };
        currentScroll.current = { x: scrollLeft, y: scrollTop };
        targetScroll.current = { x: scrollLeft, y: scrollTop };
        targetDuration.current = 0;
        currentSpeed.current = { dx: 0, dy: 0 };
        scrollUpdatedOn.current = performance.now();

        currentPos.current = { x: event.clientX, y: event.clientY }
    };

    const handlePointerMove = (event) => {
        if (!dragging.current) return;
        event.preventDefault();
        const dx = event.clientX - currentPos.current.x;
        const dy = event.clientY - currentPos.current.y;
        onScrollChange(-dx, -dy);
        currentPos.current = { x: event.clientX, y: event.clientY }

        return;

        const now = performance.now();
        const dt = now - scrollUpdatedOn.current;




        const nextTargetScroll = {
            x: startScroll.current.x - dx,
            y: startScroll.current.y - dy
        };

        targetScroll.current = nextTargetScroll;
        currentSpeed.current = { dx: dx / dt, dy: dy / dt };
        //console.log(`MOVE: (${currentScroll.current.x}, ${currentPos.current.x})`);
        //requestAnimationFrame(() => {
        onScrollChange(targetScroll.current.x, targetScroll.current.y);
        //});

        //currentPos.current = { x: event.clientX, y: event.clientY }
    }

    const handlePointerUp = (event) => {
        if (!dragging.current) return;
        console.log(`UP: (${event.clientX}, ${event.clientY})`);
        dragging.current = false;
        onUp && onUp();
    }

    useEffect(() => {
        if (dragging.current) return;

        const handler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.shiftKey) onScrollChange(e.deltaY, e.deltaX);
            else onScrollChange(e.deltaX, e.deltaY);
        };

        ref?.current.addEventListener('wheel', handler, { passive: false });
        return () => {
            ref?.current?.removeEventListener('wheel', handler);
        }
    }, [dragging.current]);

    return (
        <div
            ref={ref}
            {...props}

            className={cn("cursor-default overflow-hidden select-none", className)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
            //onWheel={handleWheel}
            onContextMenu={(event => {
                event.preventDefault();
            })}
            style={{ overscrollBehavior: "contain", touchAction: "none" }}
        >
            {children}
        </div>
    );
}

export function TorusScrollView({ className, scrollTop, scrollLeft, contentWidth, contentHeight, onScrollChange, children, ...props }) {
    function handleScrollChange(newLeft, newTop) {

        const contentLeftIndex = Math.floor(newLeft / contentWidth);
        const contentTopIndex = Math.floor(newTop / contentHeight);

        newLeft = (newLeft % contentWidth + contentWidth) % contentWidth;
        newTop = (newTop % contentHeight + contentHeight) % contentHeight;


        if (onScrollChange) {
            onScrollChange(newLeft, newTop, contentLeftIndex, contentTopIndex);
        }
    }

    return (
        <EndlessScrollView {...{ className, scrollTop, scrollLeft, children }}
            {...props}
            onScrollChange={handleScrollChange}>
            {children}test
        </EndlessScrollView>
    );
}
