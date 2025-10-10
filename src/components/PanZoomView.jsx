import { useRef, useState, useEffect, Children, useCallback, useMemo, Fragment, use } from "react";
//import { beepButton, beepSwipe, beepSwipeComplete, preBeepButton } from "../utils/beep";
import { toXY, mulXY, subXY, divXY, distXY, addXY, eventToXY, distXYArray, midXYArray, toRectXY, printXY, isSameXY, fromtoXY } from "../utils/xy";
import { cn } from "../utils/cn.ts";
import { minmax } from "../utils/numbers.ts";
import { SIZE } from "../game/cfg.jsx";

const CLICK_TOLERNCE = 20;

export function clampPanZoomCenter(center, contentSize, viewSize, zoom) {


    if (!contentSize || !viewSize) return center;

    const border = SIZE;
    const clamp = {
        x: minmax(center.x, border + (contentSize.x) - (viewSize.x) / zoom / 2, -border + viewSize.x / zoom / 2),
        y: minmax(center.y, contentSize.y - viewSize.y / zoom / 2 + border, viewSize.y / zoom / 2 - border),
    }
    if (-border * 2 + viewSize.x / zoom >= contentSize.x) clamp.x = contentSize.x / 2;
    if (-border * 2 + viewSize.y / zoom >= contentSize.y) clamp.y = contentSize.y / 2;
    return clamp;
}


export function PanZoomView({ ref, className,
    panZoom,  // {center, zoom }
    zoomRange,
    contentSize,
    onPanZoomChange,
    onPress, //XY in content coors
    onRelease,
    onClick,
    onResize,
    children, ...props }) {

    const [viewSize, setViewSize] = useState(toXY(0, 0));
    //const [panZoomNow, setPanZoomNow] = useState(panZoom);
    //const [interacted, setInteracted] = useState(false);

    const contentRect = useMemo(() => {
        const size = divXY(viewSize, panZoom.zoom);
        const at = subXY(panZoom.center, divXY(size, 2));
        //console.log("RECT:", toRectXY(at, size));
        //setPanZoomNow(panZoom)
        return toRectXY(at, size);
    }, [viewSize, panZoom]);

    function clampPanZoom(panZoom) {
        const clamp = {
            zoom: panZoom.zoom,
            center: clampCenter(panZoom.center)
        }
        return clamp;
    }

    function clampCenter(center) {
        return clampPanZoomCenter(center, contentSize, viewSize, panZoom.zoom);
    }


    // useEffect(() => {
    //     setPanZoomNow(panZoom)
    // }, [panZoom]);

    // useEffect(() => {
    //console.log("interacted", interacted)
    //if (isSameXY(panZoomNow.center, panZoom.center) && panZoomNow.zoom === panZoom.zoom) return;
    //onPanZoomChange(panZoomNow);


    // if (interacted) {
    //onPanZoomChange(panZoomNow);
    //return;
    //}
    // requestAnimationFrame(() => {
    //     if (interacted) return;

    //     const newCenter = { ...panZoomNow.center }
    //     const clamp = clampPanZoom(panZoomNow);

    //     setPanZoomNow({ ...panZoomNow, center: fromtoXY(panZoomNow.center, clamp.center, 0.25) })
    //     onPanZoomChange(panZoomNow);
    // });
    // }, [panZoomNow, interacted]);

    const viewRef = useRef(null);
    const pointersRef = useRef(new Map());
    const pointers = pointersRef.current;

    function handlePointerDown(event) {
        console.log("ZOOM:", panZoom.zoom)
        event.preventDefault();
        const eventXY = eventToXY(event);//XY(event.clientX, event.clientY);
        pointers.set(event.pointerId, { last: eventXY, start: eventXY });

        pointers.noClick = false;
        // const pointerPositions = Array.from(pointers.values()).map(pointer => pointer.last);
        // const midPoint = midXYArray(pointerPositions);
        const containerXY = addXY(divXY(eventXY, panZoom.zoom), contentRect.at);
        onPress && onPress(containerXY, event.pointerId, event.button);

    };

    const handlePointerMove = (event) => {

        //setInteracted(true);
        event.preventDefault();
        if (!pointers.has(event.pointerId)) return;
        //const test = { ...event, clientX: event.clientX + "" }
        const eventXY = eventToXY(event);
        const pointerData = pointers.get(event.pointerId);
        if (!pointerData) return;

        const testXY = subXY(eventXY, pointerData.last);

        const lastPointerPositions = Array.from(pointers.values()).map(pointer => pointer.last);
        const lastMidPoint = midXYArray(lastPointerPositions);
        const lastDist = distXYArray(lastPointerPositions);
        pointerData.last = eventXY;
        const nowPointerPositions = Array.from(pointers.values()).map(pointer => pointer.last);

        const nowDist = distXYArray(nowPointerPositions);


        //printXY("lastMidPoint", lastMidPoint, lastPointerPositions.length)
        //console.log("ZOOM:", panZoom.zoom)
        const nowMidPoint = mulXY(midXYArray(nowPointerPositions), 1);

        // console.log("MID POINT MOVE:", lastMidPoint.x.toFixed(2), nowMidPoint.x.toFixed(2));
        // console.log("MID POINT ZOOM:", lastDist.toFixed(2), nowDist.toFixed(2));

        if (!pointers.noClick && distXY(pointerData.start, pointerData.last) > CLICK_TOLERNCE) {
            //on real phone sometimes triggered after second touch without move...
            pointers.noClick = true;
        }

        let deltaXY = subXY(nowMidPoint, lastMidPoint);

        const deltaZoom = (lastDist > 0 && nowDist > 0) ? nowDist / lastDist : 1;
        //const newZoom = 

        // setPanZoomNow((prev) => {
        //     let newZoom = prev.zoom * deltaZoom;

        //     if (newZoom < zoomRange.min) newZoom = zoomRange.min;
        //     if (newZoom > zoomRange.max) newZoom = zoomRange.max;

        //     const midView = mulXY(viewSize, 0.5);
        //     const zoomXY = nowMidPoint;
        //     const dxy1 = divXY(subXY(zoomXY, midView), prev.zoom);
        //     const dxy2 = divXY(subXY(zoomXY, midView), newZoom);
        //     const dScrollZoom = subXY(dxy1, dxy2);

        //     const dScrollPanZoom = subXY(dScrollZoom, divXY(deltaXY, prev.zoom));
        //     const newCenter1 = addXY(prev.center, dScrollPanZoom);
        //     const newCenter2 = clampCenter(newCenter1);
        //     const dist = distXY(newCenter2, newCenter1);
        //     const dFactor = 1 + dist / 50;// //0 => 1, 100=> 2, 200=> 4

        //     const dScrollPanZoom2 = divXY(dScrollPanZoom, dFactor);
        //     const newCenter = addXY(prev.center, dScrollPanZoom2);


        //     // printXY("MOVE: ", deltaXY, divXY(deltaXY, prev.zoom))

        //     // printXY("DEL: ", zoomXY, dxy1, dxy2)
        //     // printXY("DELDELDEL: ", dScroll)
        //     return {
        //         center: newCenter,
        //         zoom: newZoom
        //     }
        // });

        const test = (prev) => {
            let newZoom = prev.zoom * deltaZoom;

            if (newZoom < zoomRange.min) newZoom = zoomRange.min;
            if (newZoom > zoomRange.max) newZoom = zoomRange.max;

            const midView = mulXY(viewSize, 0.5);
            const zoomXY = nowMidPoint;
            const dxy1 = divXY(subXY(zoomXY, midView), prev.zoom);
            const dxy2 = divXY(subXY(zoomXY, midView), newZoom);
            const dScrollZoom = subXY(dxy1, dxy2);

            const dScrollPanZoom = subXY(dScrollZoom, divXY(deltaXY, prev.zoom));
            const newCenter1 = addXY(prev.center, dScrollPanZoom);
            const newCenter2 = clampCenter(newCenter1);
            const dist = distXY(newCenter2, newCenter1);
            const dFactor = 1 + dist / 50;// //0 => 1, 100=> 2, 200=> 4

            const dScrollPanZoom2 = divXY(dScrollPanZoom, dFactor);
            const newCenter = addXY(prev.center, dScrollPanZoom2);


            // printXY("MOVE: ", deltaXY, divXY(deltaXY, prev.zoom))

            // printXY("DEL: ", zoomXY, dxy1, dxy2)
            // printXY("DELDELDEL: ", dScroll)
            return {
                center: newCenter,
                zoom: newZoom
            }
        };

        const newPanZoom = test(panZoom);
        //printXY("contentSize", contentSize);
        onPanZoomChange(newPanZoom)

        return;
    }

    const handlePointerUp = (event) => {
        event.preventDefault();
        const pointerData = pointers.get(event.pointerId);
        if (!pointerData) return;
        const eventXY = eventToXY(event);
        //pointers.noClick || beepButton();
        const containerXY = addXY(divXY(eventXY, panZoom.zoom), contentRect.at);
        const isLastTouch = (pointers.size === 1);
        onRelease?.(containerXY, event.pointerId, isLastTouch);
        if (!pointers.noClick) onClick?.(containerXY);
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
            const deltaZoom = 1 - e.deltaY * 0.005;
            // setPanZoomNow((prev) => {
            //     const midView = mulXY(viewSize, 0.5);
            //     e.currentTarget = viewRef.current
            //     const zoomXY = eventToXY(e);
            //     const dxy1 = divXY(subXY(zoomXY, midView), prev.zoom);
            //     const dxy2 = divXY(subXY(zoomXY, midView), prev.zoom * deltaZoom);
            //     const dScrollZoom = subXY(dxy1, dxy2);
            //     return {
            //         center: addXY(prev.center, dScrollZoom),
            //         zoom: prev.zoom * deltaZoom
            //     }
            // });
        } else if (e.shiftKey) {
            // setPanZoomNow((prev) => {
            //     return {
            //         center: addXY(prev.center, toXY(e.deltaY, e.deltaX)),
            //         zoom: prev.zoom
            //     }
            // });
        } else {
            // setPanZoomNow((prev) => {
            //     return {
            //         center: addXY(prev.center, toXY(e.deltaX, e.deltaY)),
            //         zoom: prev.zoom
            //     }
            // });
        }
    }

    return (
        <div
            ref={viewRef}
            {...props}

            className={cn("cursor-default overflow-hidden select-none", className)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            onContextMenu={(event => {
                event.preventDefault();
            })}
            style={{ overscrollBehavior: "none", touchAction: "none", background: "#000", ...(props.style) }}
        >

            {viewSize.x > 0 && children}
        </div>
    );
}
