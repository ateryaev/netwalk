import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from './utils/cn'
import { COLOR, COLOR_BALL, COLOR_EYE, SIZE, TRANS_DURATION } from "./game/cfg";
import { BOTTOM, LEFT, RIGHT, TOP } from './game/gamedata';
import { isEnd, isMix, isOff, isOn } from './game/gamedata';
import { GameHeader } from './components/GameHeader';
import { clampPanZoomCenter, PanZoomView } from './components/PanZoomView';
import { addXY, bymodXY, distXY, divXY, fromtoXY, isSameXY, loopXY, mulXY, operXY, printXY, subXY, toRectXY, toXY, XY05, XY1 } from './utils/xy';
import { drawCircle, drawStar, midColor } from './utils/canvas';
import { minmax, rnd, bymod, progress, xyToIndex, progressToCurve } from './utils/numbers';
import { GameManager } from './game/gamemanager';
import { invertFigure, moveXY, toDirs } from './game/gamedata';
import { createArray2d } from './utils/array2d';
import { drawRotated, drawTransform } from './utils/canvas';
import { renderGameBg, renderHint, renderSelect, renderSourceFgs, drawNewFigure, drawSelection } from './game/gamerender';
import { MenuButton, PinkButton, SvgNext, SvgRestart } from './components/Button';
import { shufleGame } from './game/gamecreate';
import { Window } from './components/Window';
import { GameFooter } from './components/GameFooter';
import { GameSubHeader } from './components/GameSubHeader';
import { GameOverBar } from './components/GameOverBar';
import Modal from './components/Modal';
import { GAME_LEVEL_RANDOM, GAME_MODE_TUTORIALS, GAME_MODES } from './game/gameconstants';
import { GetLevelsSolved } from './game/gamestats';
import { beepButton, beepLevelComplete, beepLevelStart, preBeepButton } from './utils/beep';
import { createEffect, produceEndingEffect } from './game/gameeffects';

export function PagePlay({ game, onGameChange, onSolved, onBack, onNext, onRestart, className, ...props }) {


    const manager = useMemo(() => new GameManager(game), [game]);

    const bygmodXY = (xy) => bymodXY(xy, manager.size());
    const [panZoom, setPanZoom] = useState({ center: mulXY(manager.size(), SIZE / 2), zoom: 1 });

    const center = panZoom.center;
    const zoom = panZoom.zoom;

    const [msg, setMsg] = useState("NA");
    const cellSize = useMemo(() => (SIZE * zoom), [zoom]);

    const [selected, setSelected] = useState({ at: toXY(0, 0), pointerId: 0, active: false, when: 0 });
    const [rotation, setRotation] = useState({ at: toXY(0, 0), when: 0 });

    const [viewSize, setViewSize] = useState(toXY(0, 0));

    const [isViewSizeReady, setIsViewSizeReady] = useState(false);

    const contentRect = useMemo(() => {
        const size = divXY(viewSize, panZoom.zoom);
        const at = subXY(panZoom.center, divXY(size, 2));
        //console.log("RECT:", toRectXY(at, size));
        //setPanZoomNow(panZoom)
        return toRectXY(at, size);
    }, [viewSize, panZoom]);

    const contentSize = useMemo(() => mulXY(game.size, SIZE), [game.size, SIZE]);
    const viewGridSize = useMemo(() => operXY(Math.ceil, addXY(divXY(viewSize, cellSize), XY1)), [viewSize, cellSize]);

    const startViewCell2 = useMemo(() => divXY(contentRect.at, SIZE), [contentRect]);
    const startViewCell = useMemo(() => operXY(Math.floor, startViewCell2), [startViewCell2]);

    const startGameCell = useMemo(() => bymodXY(startViewCell, game.size), [startViewCell, game]);
    const startCellOffset = useMemo(() => subXY(startViewCell2, startViewCell), [startViewCell, contentRect]);



    const defaultZoomRef = useRef(0);

    const zoomRange = useMemo(() => {
        //to see at leas 6x3 field!
        let defaultZoom = defaultZoomRef.current;
        if (defaultZoom < 0.1) {
            const defaultZoomX = viewSize.x / (6 * SIZE);
            const defaultZoomY = viewSize.y / (3 * SIZE);
            defaultZoom = Math.min(defaultZoomX, defaultZoomY);
            defaultZoomRef.current = defaultZoom;
            //  console.log("defaultZoom", defaultZoom, viewSize.x);
        }

        defaultZoom = minmax(defaultZoom, 0.5, 1.0)

        setPanZoom((prev) => { return { ...prev, zoom: defaultZoom } });
        return { min: Math.max(defaultZoom / 1.5, 0.25), max: defaultZoom * 1.5 };
    }, [viewSize]);

    function handlePanZoomChange(newPanZoom) {
        // if (newPanZoom.zoom < zoomRange.min) newPanZoom.zoom = zoomRange.min
        // if (newPanZoom.zoom > zoomRange.max) newPanZoom.zoom = zoomRange.max
        setPanZoom(newPanZoom);
    }

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
        //console.log("COLORS UPDATED!", newColors)
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



    const [progresFX, setProgressFX] = useState(null);
    const [solvedFX, setSolvedFX] = useState(null);

    useEffect(() => {
        if (counters[0] === 0) {
            setSolvedFX(createEffect());
            onSolved?.();
        } else {
            setSolvedFX(null);
        }
    }, [counters[0]]);

    useEffect(() => {
        if (game.taps === 0) {
            setProgressFX(createEffect(1000));
        }
    }, [game.taps, game.level, game.mode]);

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

    function handleDown(xy, pointerId) {
        preBeepButton();
        console.log("DOWN AT:", xy, pointerId);
        const cellXY = operXY(Math.floor, divXY(xy, SIZE));

        setSmoothScrollTo(null);

        setSelected({
            pointerId: pointerId,
            at: cellXY,
            active: true,
            when: performance.now()
        })

        setMsg("DOWN:" + pointerId);
    }

    function handleUp(_, pointerId, isLast) {
        console.log("UP:" + isLast);
        //if (isLast && manager.bordered()) {
        if (isLast) {
            const newSmoothScrollTo = clampPanZoomCenter(panZoom.center, contentSize, viewSize, zoom);
            setSmoothScrollTo(newSmoothScrollTo);
        }
        if (selected.pointerId !== pointerId) return;
        setSelected({ ...selected, active: false, when: performance.now() })
    }

    function handleClick(xy) {
        const cellXY = operXY(Math.floor, divXY(xy, SIZE));
        setMsg("CLICK:" + cellXY.x + ":" + cellXY.y + ":" + manager.bordered());
        if (manager.bordered() && !isSameXY(cellXY, bygmodXY(cellXY))) return;

        if (counters[0] === 0) return; //blocked if solved
        if (game.hintXY && !game.hintXY.find((hxy) => isSameXY(hxy, cellXY))) {
            return;
        }
        if (game.hintXY) {
            //remove first occurance of cellXY from hints
            game.hintXY = game.hintXY.filter((hxy) => !isSameXY(hxy, cellXY));
        }

        preColorsRef.current = colors;
        manager.rotateAtXY(cellXY);
        setRotation({ at: cellXY, when: performance.now() });

        const figure = manager.cellAt(cellXY).figure;
        const source = manager.cellAt(cellXY).source;

        if (figure === 0) {
            return;
        } else if (figure === 0b1111 && !source) {
            beepButton(0.5);
        } else if (source) {
            beepButton(0.7);
        } else if (figure === 0b1010 || figure === 0b0101) {
            beepButton(0.9);
        } else if (figure === 0b1100 || figure === 0b0011 || figure === 0b0110 || figure === 0b1001) {
            beepButton(1.1);
        } else if (isEnd(figure)) {
            beepButton(1.5);
        } else {
            beepButton(1.3);
        }

        if (figure !== 0b1111) game.taps++;
        onGameChange({ ...game });
    }

    const [smoothScrollTo, setSmoothScrollTo] = useState(null);

    function calcDelta(xy1, xy2, size) {
        xy1 = bymodXY(xy1, size);
        xy2 = bymodXY(xy2, size);
        return subXY(xy2, xy1)
    }

    function scrollToCenter(smoothly) {
        const nowXY = getMiddleColRow();
        const needCellXY = mulXY(manager.size(), 0.5);
        const deltaXY = calcDelta(nowXY, needCellXY, manager.size())
        const newXY = addXY(nowXY, deltaXY);
        scrollToCell(newXY, smoothly);
    }

    function scrollToCell(cellXY, smoothly) {
        let newSmoothScrollTo = mulXY(cellXY, SIZE);
        //if (manager.bordered()) {
        cellXY = bymodXY(cellXY, manager.size());
        newSmoothScrollTo = clampPanZoomCenter(newSmoothScrollTo, contentSize, viewSize, zoom);
        //}
        smoothly && setSmoothScrollTo(newSmoothScrollTo);
        smoothly || setPanZoom({ ...panZoom, zoom: minmax(defaultZoomRef.current, 0.5, 1.0), center: newSmoothScrollTo });
    }

    useEffect(() => {
        scrollToCenter(false);

    }, [game.level, game.mode, contentSize]);

    useEffect(() => {
        //scroll graduadly to smoothScroll position
        if (!smoothScrollTo) return;
        if (isSameXY(panZoom.center, smoothScrollTo)) {
            setSmoothScrollTo(null);
            return;
        }
        requestAnimationFrame(() => {
            setPanZoom({ ...panZoom, center: fromtoXY(panZoom.center, smoothScrollTo, 0.25) })
        });
    }, [smoothScrollTo, panZoom, selected]);

    function handleResize(newSize) {
        setSmoothScrollTo(null);
        //if (manager.bordered()) {
        const newCenter = clampPanZoomCenter(panZoom.center, contentSize, newSize, zoom);
        setPanZoom({ zoom, center: newCenter })
        //}
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

            const solvedFXdata = solvedFX?.update();
            const progressFXdata = progresFX?.update();

            ctx.save();

            let dx = -startCellOffset.x * SIZE;
            let dy = -startCellOffset.y * SIZE;

            ctx.scale(zoom, zoom);

            let start = contentRect.at;
            let size = contentRect.size;

            ctx.translate(dx, dy);

            renderGameBg(ctx, manager, viewGridSize, startViewCell, progressFXdata);



            game.hintXY?.[0] && renderHint(ctx, game.hintXY[0], startViewCell);

            if (!manager.bordered() || isSameXY(selected.at, bymodXY(selected.at, manager.size()))) {
                renderSelect(ctx, selected, manager, startViewCell);
            }

            //draw cells
            loopXY(viewGridSize, (viewXY) => {
                const viewCellXY = addXY(startViewCell, viewXY);
                const cellXY = bymodXY(viewCellXY, game.size);

                const isOuter = (viewCellXY.x < 0 || viewCellXY.y < 0 || viewCellXY.x >= game.size.x || viewCellXY.y >= game.size.y)
                if (manager.bordered() && isOuter) {
                    return;
                }
                ctx.save();
                ctx.translate(viewXY.x * SIZE, viewXY.y * SIZE);


                const cell = manager.cellAt(cellXY);
                const color = colors.get(cellXY) || 0;
                const preColor = preColorsRef.current?.get(cellXY) || 0;
                const end = isEnd(cell.figure);

                const isRotating = manager.isSameCell(cellXY, rotation.at);
                const rotateProgress2 = isRotating ? progress(rotation.when, TRANS_DURATION) - 1 : 0;
                const rotateProgress = progressToCurve(rotateProgress2 + 1, [0.0, 0.4, 1.2, 0.95, 1.0]) - 1;
                const conns = findRtConnections(manager, colors, cellXY, progress(rotation.when, TRANS_DURATION) < 1 ? rotation.at : null);// 0b1111;

                const alpha = isOuter ? 0.3 : 1;
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

                    const currentColor = COLOR(color + (isOuter ? 100 : 0));
                    drawTransform(ctx, toXY(0, moveDist), () => drawNewFigure(ctx, figure2move & RIGHT, conns, currentColor));
                    drawTransform(ctx, toXY(0, -moveDist), () => drawNewFigure(ctx, figure2move & LEFT, conns, currentColor));
                    drawTransform(ctx, toXY(moveDist, 0), () => drawNewFigure(ctx, figure2move & TOP, conns, currentColor));
                    drawTransform(ctx, toXY(-moveDist, 0), () => drawNewFigure(ctx, figure2move & BOTTOM, conns, currentColor));

                    drawRotated(ctx, rotateProgress * Math.PI / 2, () => drawNewFigure(ctx, figure2rotate, conns, currentColor));
                } else {
                    const switchingDelta = color !== preColor ? progress(rotation.when, TRANS_DURATION * 1.5) : 1;

                    let currentColor = COLOR(color);
                    if (isOuter) currentColor = COLOR(color + (isOuter ? 100 : 0));
                    else currentColor = midColor(COLOR(preColor), COLOR(color), switchingDelta);

                    drawRotated(ctx, rotateProgress * Math.PI / 2, () => {
                        drawNewFigure(ctx, cell.figure, conns, currentColor);
                    });
                    if (end) {
                        drawCircle(ctx, SIZE / 2, SIZE / 2, 25, currentColor);
                        if (!isOuter) {

                            const toColor = COLOR_EYE(color);
                            const fromColor = COLOR_EYE(color);
                            const toColor2 = COLOR_BALL(color);
                            const fromColor2 = COLOR_BALL(color);
                            const rFrom = isMix(preColor) ? 7 : 4;
                            const rTo = isMix(color) ? 7 : 4;
                            const r = rFrom + (rTo - rFrom) * switchingDelta;

                            let dx = 0;

                            if (isMix(color)) {
                                if (performance.now() % 1000 < 500) {
                                    dx = performance.now() / 28 % 4 - 2;
                                }
                            }

                            const mod = (5000 + (cellXY.x * 300 + cellXY.y * 100) % 2000);
                            const mod2 = (10000 - (cellXY.x * 300 + cellXY.y * 100) % 3000);
                            const phase = performance.now() % mod;
                            const phase2 = performance.now() % mod2;
                            if (isOn(color)) {
                                if (phase < 500) {
                                    dx = 2;
                                } else if ((phase > 200 && phase < 1000)) {
                                    dx = -2;
                                }
                                dx *= (cellXY.x + cellXY.y) % 2 === 0 ? 1 : -1;
                            }

                            dx = solvedFXdata?.shake || dx;

                            if (phase2 > 150 || !isOn(color)) {
                                drawCircle(ctx, SIZE / 2, SIZE / 2, 12, midColor(fromColor, toColor, switchingDelta));
                                drawCircle(ctx, SIZE / 2 + dx, SIZE / 2, r, midColor(fromColor2, toColor2, switchingDelta));
                            }

                        }
                    }

                }

                ctx.restore();
            });

            renderSourceFgs(ctx, manager, viewGridSize, startViewCell, progressFXdata, solvedFXdata);

            ctx.restore();
            produceEndingEffect(ctx, viewSize, solvedFXdata);


            ctx.globalAlpha = 1;

            animationFrame = requestAnimationFrame(render);
        }

        render();

        return () => { cancelAnimationFrame(animationFrame); }

    }, [viewSize, zoom, center, game, selected, colors, rotation, solvedFX]);

    function getMiddleColRow() {
        const x = Math.floor(center.x / SIZE);
        const y = Math.floor(center.y / SIZE);
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

        console.log("SCROLLTOCOLOR:", closest)
        scrollToCell(addXY(closest, XY05), true);
        setSelected({
            pointerId: 0,
            at: manager.bordered() ? bymodXY(closest, manager.size()) : closest,
            active: true,
            when: performance.now()
        });
        return;
    }

    useEffect(() => {
        if (game.taps === 0) {
            // scrollToCenter(true);
        }
    }, [game.taps])

    return (
        <Window title={game.level > 0 ? game.level : "BEGIN"}
            subtitle={GAME_MODES[game.mode]}
            onBack={onBack}
            className={className}
            footer={<GameFooter
                size={manager.size()}
                tutorial={game.level === 0 ? GAME_MODE_TUTORIALS[game.mode] : null}
                solved={game.level < GetLevelsSolved(game.mode)}
                random={GAME_LEVEL_RANDOM(game.mode, game.level)}
                taps={game.taps}
                manager={manager} />}
            infobar={counters[0] === 0 && <GameOverBar onNext={onNext} onRestart={onRestart} />}
            subheader={< GameSubHeader counters={counters}
                onClickColor={scrollToColor} />}
            {...props}>

            <PanZoomView
                className={cn("grid justify-stretch items-stretch size-full")}
                panZoom={panZoom}
                zoomRange={zoomRange}
                contentSize={contentSize}
                onPress={handleDown}
                onRelease={handleUp}
                onClick={handleClick}
                onResize={handleResize}
                onPanZoomChange={handlePanZoomChange}
            >
                <canvas ref={canvasRef} className='contain-size'></canvas>
            </PanZoomView >

        </Window >
    )
}
