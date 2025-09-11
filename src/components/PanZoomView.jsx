import { useRef, useState, useEffect, Children, useCallback, useMemo, Fragment, use } from "react";
import { beepButton, beepSwipe, beepSwipeComplete, preBeepButton } from "../utils/beep";
import { toXY, mulXY, subXY, divXY, distXY, addXY, eventToXY, distXYArray, midXYArray } from "../utils/xy";
import { cn } from "../utils/cn.ts";

const CLICK_TOLERNCE = 20;

export function PanZoomView({ ref, className,
    onPress, onRelease,
    onResize, onScroll, onZoom,
    children, ...props }) {

    const [viewSize, setViewSize] = useState(null)
    const viewRef = useRef(null);

    const pointersRef = useRef(new Map());
    const pointers = pointersRef.current;

    function handlePointerDown(event) {
        event.preventDefault();
        const eventXY = eventToXY(event);//XY(event.clientX, event.clientY);
        pointers.set(event.pointerId, { last: eventXY, start: eventXY });

        pointers.noClick = false;
        // const pointerPositions = Array.from(pointers.values()).map(pointer => pointer.last);
        // const midPoint = midXYArray(pointerPositions);
        onPress && onPress(eventXY, event.pointerId, event.button);
        beepSwipe(1)
    };

    const handlePointerMove = (event) => {
        event.preventDefault();
        if (!pointers.has(event.pointerId)) return;
        const test = { ...event, clientX: event.clientX + "" }
        const eventXY = eventToXY(test);
        const pointerData = pointers.get(event.pointerId);
        if (!pointerData) return;

        const lastPointerPositions = Array.from(pointers.values()).map(pointer => pointer.last);
        const lastMidPoint = midXYArray(lastPointerPositions);
        const lastDist = distXYArray(lastPointerPositions) * 2;
        pointerData.last = eventXY;
        const nowPointerPositions = Array.from(pointers.values()).map(pointer => pointer.last);
        const nowDist = distXYArray(nowPointerPositions) * 2;
        const deltaZoom = lastDist > 0 && nowDist > 0 ? nowDist / lastDist : 1;

        const nowMidPoint = mulXY(midXYArray(nowPointerPositions), 1);

        // console.log("MID POINT MOVE:", lastMidPoint.x.toFixed(2), nowMidPoint.x.toFixed(2));
        // console.log("MID POINT ZOOM:", lastDist.toFixed(2), nowDist.toFixed(2));

        if (!pointers.noClick && distXY(pointerData.start, pointerData.last) > CLICK_TOLERNCE) {
            //on real phone sometimes triggered after second touch without move...
            pointers.noClick = true;
        }

        let deltaXY = subXY(nowMidPoint, lastMidPoint);
        onScroll(deltaXY);
        onZoom(deltaZoom, nowMidPoint);
        return;
    }

    const handlePointerUp = (event) => {
        event.preventDefault();
        const pointerData = pointers.get(event.pointerId);
        if (!pointerData) return;
        const eventXY = eventToXY(event);
        pointers.noClick || beepButton();
        onRelease?.(eventXY, event.pointerId, pointers.noClick);
        pointers.delete(event.pointerId);
        return;
    }

    useEffect(() => {
        const handler = (e) => { e.preventDefault() };
        viewRef.current.addEventListener('wheel', handler, { passive: false });
        return () => { viewRef.current?.removeEventListener('wheel', handler); }
    }, []);

    useEffect(() => {
        const handler = (e) => { e.preventDefault(); e.stopPropagation(); };
        viewRef.current.addEventListener('touchstart', handler, { passive: false });
        return () => { viewRef.current?.removeEventListener('touchstart', handler); }
    }, []);

    const oldViewSize = useRef(null);

    useEffect(() => {
        if (!viewSize) return;
        if (!oldViewSize.current) {
            oldViewSize.current = { ...viewSize };
            return;
        }
        let delta = subXY(viewSize, oldViewSize.current);
        delta = divXY(delta, 2);

        onScroll(delta)
        oldViewSize.current = { ...viewSize };
    }, [viewSize]);

    useEffect(() => {
        const resizeObserver = new ResizeObserver((e) => {
            if (!viewRef.current) return;
            //console.log("RESIZE", e)
            const rect = viewRef.current.getBoundingClientRect();
            setViewSize(toXY(rect.width, rect.height));
            onResize && onResize(toXY(rect.width, rect.height));
        });
        resizeObserver.observe(viewRef.current);
        return () => { viewRef.current && resizeObserver.unobserve(viewRef.current) };
    }, []);

    function handleWheel(e) {
        if (e.ctrlKey) {
            const zoomDelta = 1 - e.deltaY * 0.005;
            onZoom(zoomDelta, eventToXY(e))
        } else if (e.shiftKey) {
            onScroll(toXY(-e.deltaY, -e.deltaX));
        } else {
            onScroll(toXY(-e.deltaX, -e.deltaY));
        }
    }

    return (
        <div
            ref={viewRef}
            {...props}

            className={cn("relative cursor-default overflow-hidden select-none", className)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            onContextMenu={(event => {
                event.preventDefault();
            })}
            style={{ overscrollBehavior: "contain", touchAction: "none", background: "red", ...(props.style) }}
        >
            {children}
        </div>
    );
}
