import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { cn } from './utils/cn'
import { COLOR, SIZE, TRANS_DURATION } from "./utils/cfg";
import { BOTTOM, LEFT, RIGHT, TOP } from './utils/gamedata';
import { isEnd, isMix, isOff, isOn } from './utils/gamedata';
import { GameHeader } from './components/GameHeader';
import { PanZoomView } from './components/PanZoomView';
import { addXY, bymodXY, distXY, divXY, isSameXY, loopXY, mulXY, operXY, printXY, subXY, toXY } from './utils/xy';
import { getBgImage, getFigureImage, getSourceBgImage } from './utils/canvas';
import { minmax, rnd, bymod, progress, xyToIndex } from './utils/numbers';
import { GameManager } from './utils/gamemanager';
import { invertFigure, moveXY, toDirs } from './utils/gamedata';
import { createArray2d } from './utils/array2d';
import { drawActiveEnd, drawBG, drawBgCell, drawEmptyCell, drawFigure, drawMixEnd, drawOffEnd, drawRotated, drawSelection, drawSourceFg, drawTransform } from './utils/gamedraw';
import { renderGameBg, renderSelect, renderSourceFgs } from './utils/gamerender';
//import { renderGame } from './utils/gamerender';

export function PagePlay({ game, onGameChange, onBack }) {

    const [scroll, setScroll] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [msg, setMsg] = useState("NA");
    const cellSize = useMemo(() => (SIZE * zoom), [zoom]);

    const [selected, setSelected] = useState({ at: toXY(0, 0), pointerId: 0, active: false, when: 0 });
    const [rotation, setRotation] = useState({ at: toXY(0, 0), when: 0 });

    const [viewSize, setViewSize] = useState(toXY(0, 0));

    const defaultZoom = useMemo(() => Math.max(Math.min(viewSize.x / (5 * SIZE), 1.25), 0.5), [viewSize])
    const zoomRange = useMemo(() => {
        // const longestSize = Math.max(viewSize.x, viewSize.y);
        // const shortestSize = Math.min(viewSize.x, viewSize.y);
        // //max 12 cells for longest size
        // //min 6 cells  for longest size
        // const minZoom = longestSize / (12 * SIZE);
        // // const maxZoom = longestSize / (6 * SIZE);
        // const maxZoom = viewSize.x / (5 * SIZE);
        // console.log("MAXZOOM:", maxZoom)
        //const defaultZoom = Math.max(Math.min(viewSize.x / (5 * SIZE), 1.25), 0.5);
        return { min: Math.max(defaultZoom - 0.5, 0.5), max: defaultZoom + 0.5 };
    }, [defaultZoom]);

    useEffect(() => {
        //if (viewSize.x < 10) return;

        //const newZoom = Math.max(Math.min(viewSize.x / (5 * SIZE), 1.25), 0.5);

        setZoom(defaultZoom)
        //console.log("MEW ZOOM:", newZoom)
    }, [defaultZoom])

    const manager = useMemo(() => new GameManager(game), [game]);

    const preColorsRef = useRef(null);

    const colors = useMemo(() => {
        const sources = manager.findAllSources();
        const newColors = createArray2d(game.size);
        sources.forEach((sxy) => {
            newColors.set(sxy, manager.cellAt(sxy).source);
            const actives = [sxy];
            const color = newColors.get(sxy);
            for (let i = 0; i < actives.length; i++) {
                const xy = actives[i];
                const cell = manager.cellAt(xy);
                toDirs(cell.figure).forEach((dir) => {
                    const xy2 = moveXY(xy, dir);

                    if (manager.bordered() && !isSameXY(xy2, bymodXY(xy2, manager.size()))) return;

                    const cell2 = manager.cellAtDir(xy, dir);
                    const isConnected = (cell2.figure & invertFigure(dir));

                    const color2 = newColors.get(xy2) || 0;
                    const includesColor = (color2 & color);
                    if (!cell2.source && isConnected && !includesColor) {
                        newColors.set(xy2, color2 | color);
                        actives.push(xy2);
                    }
                });
            }
        });
        console.log("COLORS UPDATED!", newColors)
        return newColors;
    }, [manager]);

    const counters = useMemo(() => {
        const newCounter = { 0: 0 };
        colors.forEach((color, xy) => {
            const cell = manager.cellAt(xy);
            if (cell.source) {
                newCounter[cell.source] = newCounter[cell.source] || 0;
            } else if (isEnd(cell.figure)) {
                color = color || 0;
                color = isMix(color) ? 0 : color;
                const oldCount = newCounter[color] || 0;
                newCounter[color] = oldCount + 1;
            }
        })
        return newCounter;
    }, [colors])

    function findRtConnections(manager, colors, xy, rotationXy) {

        let conns = 0b0000;

        if (rotationXy && manager.isSameCell(xy, rotationXy)) {
            return conns;
        }

        toDirs(manager.cellAt(xy).figure).forEach((dir) => {
            const xy2 = moveXY(xy, dir);
            const cell2 = manager.cellAtDir(xy, dir);
            conns |= (invertFigure(cell2.figure) & dir);
            const color1 = colors.get(xy);
            const color2 = colors.get(xy2);
            if (color1 !== color2) {
                conns &= ~dir; //remove connection
            } else if (rotationXy && manager.isSameCell(xy2, rotationXy)) {
                conns &= ~dir; //remove connection
            }
        });
        return conns;
    }

    const contentSize = useMemo(() => mulXY(game.size, cellSize), [game.size, cellSize]);
    const viewGridSize = useMemo(() => operXY(Math.ceil, addXY(divXY(viewSize, cellSize), toXY(1, 1))), [viewSize, cellSize]);
    const startViewCell = useMemo(() => toXY(Math.floor(scroll.x / SIZE), Math.floor(scroll.y / SIZE)), [scroll]);
    const startGameCell = useMemo(() => bymodXY(startViewCell, game.size), [startViewCell, game]);
    const startCellOffset = useMemo(() => subXY(divXY(scroll, SIZE), startViewCell), [startViewCell, scroll]);

    const [isViewSizeReady, setIsViewSizeReady] = useState(false);

    useEffect(() => {
        setIsViewSizeReady(!!(viewSize?.x && viewSize?.y));
    }, [viewSize]);

    useEffect(() => {
        if (isViewSizeReady) {
            scrollCenter(false);
            console.log("VIEW SIZE READY!", viewSize);
        }
    }, [isViewSizeReady]);

    function handleDown(xy, pointerId) {
        xy = addXY(xy, mulXY(scroll, zoom));
        const cellXY = operXY(Math.floor, divXY(xy, cellSize));
        console.log("DOWN AT:", xy, pointerId);

        setSmoothScrollTo(null);

        setSelected({
            pointerId: pointerId,
            at: cellXY,
            active: true,
            when: performance.now()
        })

        setMsg("DOWN:" + pointerId);
    }

    function handleUp(_, pointerId, noClick) {
        setMsg("UP:" + pointerId + ":" + noClick);
        if (selected.pointerId !== pointerId) return;

        setSelected({ ...selected, active: false, when: performance.now() })

        if (noClick) return;

        const cellXY = bymodXY(selected.at, game.size);
        if (manager.bordered() && !isSameXY(cellXY, selected.at)) return;

        preColorsRef.current = colors;
        manager.rotateAtXY(cellXY);
        setRotation({ at: cellXY, when: performance.now() });
        onGameChange({ ...game });
    }

    const [smoothScrollTo, setSmoothScrollTo] = useState(null);

    function scrollCenter(smoothly) {
        const cellXY = mulXY(manager.size(), 0.5);
        //setZoom(defaultZoom)
        scrollToCell(cellXY, smoothly);
    }

    function scrollToCell(cellXY, smoothly) {
        cellXY = bymodXY(cellXY, manager.size());

        const gamePos = mulXY(cellXY, cellSize);
        const viewPos = mulXY(viewSize, 0.5);
        const targerScroll = subXY(gamePos, viewPos);

        let targetCellXY = null;

        if (!smoothly) {
            setScroll(divXY(targerScroll, zoom));
        } else if (manager.bordered()) {
            const newScroll = clampScroll(divXY(targerScroll, zoom));
            setSmoothScrollTo(newScroll);
            targetCellXY = operXY(Math.floor, cellXY);
        } else {
            const mod = mulXY(manager.size(), cellSize);
            const modTargerScroll = bymodXY(targerScroll, mod);
            const modCurrentScroll = bymodXY(mulXY(scroll, zoom), mod);
            //let delta = operXY(Math.abs, subXY(modTargerScroll, modCurrentScroll));
            const delta = subXY(modTargerScroll, modCurrentScroll);
            if (delta.x > mod.x / 2) modTargerScroll.x -= mod.x;
            if (delta.y > mod.y / 2) modTargerScroll.y -= mod.y;
            if (delta.x < -mod.x / 2) modTargerScroll.x += mod.x;
            if (delta.y < -mod.y / 2) modTargerScroll.y += mod.y;

            setScroll(divXY(modCurrentScroll, zoom));
            setSmoothScrollTo(divXY(modTargerScroll, zoom));

            targetCellXY = addXY(mulXY(viewSize, 0.5), mulXY(divXY(modTargerScroll, zoom), zoom));
            targetCellXY = operXY(Math.floor, divXY(targetCellXY, cellSize));

        }
        return targetCellXY;
    }

    useEffect(() => {
        //scroll graduadly to smoothScroll position
        if (!smoothScrollTo) return;
        requestAnimationFrame(() => {
            let delta = mulXY(subXY(smoothScrollTo, scroll), 0.15);
            const dist = distXY(toXY(0, 0), delta);
            if (dist <= 0.1) {
                setScroll({ ...smoothScrollTo });
                setSmoothScrollTo(null);
            } else {
                setScroll((prev) => addXY(prev, delta));
            }
        });
    }, [smoothScrollTo, scroll, selected]);

    function clampScroll(targetScroll) {

        const borders = divXY(subXY(contentSize, viewSize), zoom);
        const bordersMin = operXY(Math.max, toXY(0, 0), borders);
        const bordersMax = operXY(Math.min, toXY(0, 0), borders);

        let newScroll = targetScroll;
        newScroll = operXY(Math.max, bordersMax, newScroll);
        newScroll = operXY(Math.min, bordersMin, newScroll);

        if (contentSize.x <= viewSize.x) {
            newScroll.x = (contentSize.x - viewSize.x) / 2 / zoom;
        }
        if (contentSize.y <= viewSize.y) {
            newScroll.y = (contentSize.y - viewSize.y) / 2 / zoom;
        }
        return newScroll;
    }

    useEffect(() => {
        //return
        //scroll content smoothly back to view
        if (!manager.bordered()) return;
        if (selected.active) return;
        //console.log("CLAMP")
        const newScroll = clampScroll(scroll);
        if (isSameXY(scroll, newScroll)) return;
        setSmoothScrollTo(clampScroll(scroll));

        // //scroll content smoothly back to view
        // const borders = divXY(subXY(contentSize, viewSize), zoom);
        // const bordersMin = operXY(Math.max, toXY(0, 0), borders);
        // const bordersMax = operXY(Math.min, toXY(0, 0), borders);


        // let newScroll = scroll;
        // newScroll = operXY(Math.max, bordersMax, newScroll);
        // newScroll = operXY(Math.min, bordersMin, newScroll);

        // if (contentSize.x <= viewSize.x) {
        //     newScroll.x = (contentSize.x - viewSize.x) / 2 / zoom;
        // }
        // if (contentSize.y <= viewSize.y) {
        //     newScroll.y = (contentSize.y - viewSize.y) / 2 / zoom;
        // }

        // if (isSameXY(scroll, newScroll)) return;
        // setSmoothScrollTo(newScroll);
    }, [scroll, manager, selected, zoom, viewSize, contentSize]);


    function handleScroll(scrollDelta) {

        setSmoothScrollTo(null);
        setScroll((prev) => addXY(prev, divXY(scrollDelta, -zoom)));
    }

    function handleZoom(zoomDelta, coors) {
        //console.log("ZOOM")
        setSmoothScrollTo(null);
        let newZoom = minmax(zoomDelta * zoom, zoomRange.min, zoomRange.max);
        zoomDelta = newZoom / zoom;
        const scrollDelta = mulXY(coors, -(1 - zoomDelta) / (zoomDelta * zoom));
        setScroll((prev) => addXY(prev, scrollDelta));
        setZoom((prev) => minmax(prev * zoomDelta, zoomRange.min, zoomRange.max));
    }

    function handleResize(newSize) {
        setSmoothScrollTo(null);
        setViewSize({ ...newSize });
    }

    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        canvasRef.current.width = viewSize.x;
        canvasRef.current.height = viewSize.y;
        const ctx = canvasRef.current.getContext('2d');

        let animationFrame = null;

        function render() {

            const now = performance.now();
            ctx.save();

            let dx = -startCellOffset.x * SIZE;
            let dy = -startCellOffset.y * SIZE;

            ctx.scale(zoom, zoom);
            ctx.translate(dx, dy)

            renderGameBg(ctx, manager, viewGridSize, startViewCell)

            if (!manager.bordered() || isSameXY(selected.at, bymodXY(selected.at, manager.size()))) {
                renderSelect(ctx, selected, manager, startViewCell);
            }

            //draw cells
            loopXY(viewGridSize, (viewXY) => {
                const viewCellXY = addXY(startViewCell, viewXY);
                const cellXY = bymodXY(viewCellXY, game.size);

                if (manager.bordered()) {
                    if (viewCellXY.x < 0 || viewCellXY.y < 0) return;
                    if (viewCellXY.x >= game.size.x || viewCellXY.y >= game.size.y) return;
                }
                ctx.save();
                ctx.translate(viewXY.x * SIZE, viewXY.y * SIZE);


                const cell = manager.cellAt(cellXY);
                const color = colors.get(cellXY) || 0;
                const preColor = preColorsRef.current?.get(cellXY) || 0;
                const end = isEnd(cell.figure);

                const isRotating = manager.isSameCell(cellXY, rotation.at);
                const rotateProgress = isRotating ? progress(rotation.when, TRANS_DURATION) - 1 : 0;

                const conns = findRtConnections(manager, colors, cellXY, progress(rotation.when, TRANS_DURATION) < 1 ? rotation.at : null);// 0b1111;

                if (cell.source) {
                    const cell_l = manager.cellAtDir(cellXY, LEFT);
                    const cell_t = manager.cellAtDir(cellXY, TOP);
                    const cell_r = manager.cellAtDir(cellXY, RIGHT);
                    const cell_b = manager.cellAtDir(cellXY, BOTTOM);

                    let figure2move = 0;
                    let figure2rotate = cell.figure;

                    if (cell_l.source === cell.source) {
                        figure2move |= TOP;
                        figure2rotate &= ~LEFT;
                    }
                    if (cell_r.source === cell.source) {
                        figure2move |= BOTTOM;
                        figure2rotate &= ~RIGHT;
                    }
                    if (cell_t.source === cell.source) {
                        figure2move |= RIGHT;
                        figure2rotate &= ~TOP;
                    }
                    if (cell_b.source === cell.source) {
                        figure2move |= LEFT;
                        figure2rotate &= ~BOTTOM;
                    }
                    figure2move &= cell.figure;
                    figure2rotate &= (~figure2move);

                    const moveDist = SIZE * rotateProgress;

                    drawTransform(ctx, toXY(0, moveDist), () => drawFigure(ctx, figure2move & RIGHT, color, conns));
                    drawTransform(ctx, toXY(0, -moveDist), () => drawFigure(ctx, figure2move & LEFT, color, conns));
                    drawTransform(ctx, toXY(moveDist, 0), () => drawFigure(ctx, figure2move & TOP, color, conns));
                    drawTransform(ctx, toXY(-moveDist, 0), () => drawFigure(ctx, figure2move & BOTTOM, color, conns));

                    drawRotated(ctx, rotateProgress * Math.PI / 2, () => drawFigure(ctx, figure2rotate, color, conns))
                } else {
                    const switchingDelta = color !== preColor ? progress(rotation.when, TRANS_DURATION * 1.5) : 1;
                    drawRotated(ctx, rotateProgress * Math.PI / 2, () => {
                        drawFigure(ctx, cell.figure, preColor, conns, switchingDelta < 1 ? 1 : 0);
                        drawFigure(ctx, cell.figure, color, conns, switchingDelta);
                    });

                    if (end) {
                        const showing = switchingDelta;// minmax(switchingDelta * 2, 1, 2) - 1;
                        const hiding = switchingDelta;//minmax(switchingDelta * 2, 0, 1);

                        isMix(color) && drawMixEnd(ctx, showing);
                        isOn(color) && drawActiveEnd(ctx, showing);
                        isOff(color) && drawOffEnd(ctx, showing);

                        isMix(preColor) && drawMixEnd(ctx, (1 - hiding));
                        isOn(preColor) && drawActiveEnd(ctx, (1 - hiding));
                        isOff(preColor) && drawOffEnd(ctx, 1 - hiding, true);
                    }
                }

                ctx.restore();
            });

            renderSourceFgs(ctx, manager, viewGridSize, startViewCell)

            ctx.restore();
            animationFrame = requestAnimationFrame(render);
        }

        render();

        return () => { cancelAnimationFrame(animationFrame); }

    }, [viewSize, zoom, scroll, game, selected, colors, rotation]);

    function getMiddleColRow() {
        const x = Math.floor(scroll.x * zoom / cellSize + viewSize.x / (2 * cellSize));
        const y = Math.floor(scroll.y * zoom / cellSize + viewSize.y / (2 * cellSize));
        return { x, y };
    }

    function findClosestColRow(fromXY, color) {

        const startXY = subXY(fromXY, divXY(game.size, 2));

        startXY.x = Math.round(startXY.x);
        startXY.y = Math.round(startXY.y);

        //console.log("START XY", startXY)

        //return;
        const MAX_DIST = 99999;
        let found = null;
        let dist = MAX_DIST;

        loopXY(game.size, (xy) => {
            const cellXY = addXY(startXY, xy); //can be outside of game for purpose!
            const cell = manager.cellAt(cellXY);
            const cellColor = colors.get(cellXY) || 0;

            // console.log("FIND:", bymodXY(cellXY, game.size), isEnd(cell.figure), distXY(fromXY, cellXY))

            if ((isOn(color) && cell.source === color) ||
                (isEnd(cell.figure) && !isOn(cellColor) && !isOn(color))) {
                const newDist = distXY(fromXY, cellXY);
                if ((newDist < dist && newDist > 0.01) || dist === MAX_DIST || (newDist === dist && rnd(1) == 1)) {
                    found = { ...cellXY, dist: newDist };
                    dist = newDist;
                }
            }
        });

        return found;
    }

    function scrollToColor(color) {
        console.log("MID: ", getMiddleColRow())
        const mid = getMiddleColRow();

        const closest = findClosestColRow(mid, color);

        //console.log("SCROLLTOCOLOR:", closest)
        const cellXY = scrollToCell(addXY(closest, toXY(0.5, 0.5)), true);
        setSelected({
            pointerId: 0,
            at: cellXY,
            active: true,
            when: performance.now()
        });
        return;
    }

    return (
        <div className="flex flex-col flex-1 bg-black">

            <GameHeader counter={counters} onBack={onBack} onLevelClick={() => { scrollCenter(true) }}
                onScrollTo={(color) => {
                    scrollToColor(color);
                }}
            >
            </GameHeader>
            <PanZoomView
                className={cn("relative bg-black flex-1 opacity-0 transition-opacity delay-75 duration-500", isViewSizeReady && "opacity-100")}
                onPress={handleDown}
                onRelease={handleUp}
                onResize={handleResize}
                onScroll={handleScroll}
                onZoom={handleZoom}
            >

                <canvas ref={canvasRef} className='absolute z-20 xbg-green-500 origin-top-left'></canvas>

            </PanZoomView >
            <div className='p-1 text-[10px] font-bold text-center ring-8 ring-black/20 z-40 text-[#aaa] bg-[#eee] font-mono uppercase text-ellipsis whitespace-nowrap overflow-hidden'>
                {/* Netwalk v0.1 by Anton Teryaev, 2025 */}
                {msg}
            </div>

        </div >
    )
}
