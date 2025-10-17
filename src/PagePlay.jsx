import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from './utils/cn'
import { COLOR, COLOR_BALL, COLOR_EYE, SIZE, TRANS_DURATION } from "./game/cfg";
import { BOTTOM, LEFT, RIGHT, TOP } from './game/gamedata';
import { isEnd, isMix, isOff, isOn } from './game/gamedata';
import { GameHeader } from './components/GameHeader';
import { clampPanZoomCenter, PanZoomView } from './components/PanZoomView';
import { addXY, bymodXY, distXY, divXY, fromtoXY, isSameXY, loopXY, mulXY, operXY, printXY, subXY, toRectXY, toXY, XY05, XY1 } from './utils/xy';
import { drawCircle, drawStar, midColor } from './utils/canvas';
import { minmax, progress, progressToCurve } from './utils/numbers';
import { GameManager } from './game/gamemanager';
import { createArray2d } from './utils/array2d';
import { drawRotated, drawTransform } from './utils/canvas';
import { renderGameBg, renderHint, renderSelect, renderSourceFgs, drawNewFigure, drawSelection } from './game/gamerender';
import { Window } from './components/Window';
import { GameFooter } from './components/GameFooter';
import { GameSubHeader } from './components/GameSubHeader';
import { GameOverBar } from './components/GameOverBar';
import { GAME_LEVEL_RANDOM, GAME_LEVEL_SIZE, GAME_MODE_TUTORIALS, GAME_MODES } from './game/gameconstants';
import { GetLevelsSolved } from './game/gamestats';
import { beepButton, beepLevelComplete, beepLevelStart, preBeepButton } from './utils/beep';
import { createEffect, playRotatedFx, produceEndingEffect } from './game/gameeffects';
import { useGame } from './GameContext';

export function PagePlay({ mode, level, onMenu, onNext, className, ...props }) {

    const gameCtx = useGame();
    const [restarting, setRestarting] = useState(true);
    const [progresFX, setProgressFX] = useState(null);
    const [solvedFX, setSolvedFX] = useState(null);

    const gamesize = useMemo(() => GAME_LEVEL_SIZE(mode, level), [mode, level]);
    const [manager, setManager] = useState(() => new GameManager(mode, level));

    //function 
    function handleRestart() {
        setRestarting(true);
        setTimeout(() => {
            const manager = new GameManager(mode, level);
            setManager(manager);
            setRestarting(false);
            setProgressFX(createEffect(1000));
        }, 500);
    }

    useEffect(() => {
        if (manager.mode() !== mode || manager.level() !== level) {
            setRestarting(true);
            setTimeout(() => {
                setManager(new GameManager(mode, level));
                setRestarting(false);
                setProgressFX(createEffect(1000));
            }, 500);
        }
    }, [mode, level]);

    useEffect(() => {
        setTimeout(() => {
            setRestarting(false);
            console.log("EFFF")
            setProgressFX(createEffect(1000));
        }, 500);
    }, []);

    useEffect(() => {
        if (manager.isSolved()) {
            setTimeout(() => setSolvedFX(createEffect()), 250);
        } else {
            setSolvedFX(null);
        }
    }, [manager.isSolved()]);


    const [panZoom, setPanZoom] = useState({ center: mulXY(gamesize, SIZE / 2), zoom: 1 });

    const center = panZoom.center;
    const zoom = panZoom.zoom;

    const [msg, setMsg] = useState("NA");
    const cellSize = useMemo(() => (SIZE * zoom), [zoom]);

    const [selected, setSelected] = useState(null);
    const [rotation, setRotation] = useState({ at: toXY(0, 0), when: 0 });

    const [viewSize, setViewSize] = useState(toXY(0, 0));

    const [isViewSizeReady, setIsViewSizeReady] = useState(false);

    const contentRect = useMemo(() => {
        const size = divXY(viewSize, panZoom.zoom);
        const at = subXY(panZoom.center, divXY(size, 2));
        return toRectXY(at, size);
    }, [viewSize, panZoom]);

    const contentSize = useMemo(() => mulXY(gamesize, SIZE), [manager, SIZE]);
    const viewGridSize = useMemo(() => operXY(Math.ceil, addXY(divXY(viewSize, cellSize), XY1)), [viewSize, cellSize]);

    const startViewCell2 = useMemo(() => divXY(contentRect.at, SIZE), [contentRect]);
    const startViewCell = useMemo(() => operXY(Math.floor, startViewCell2), [startViewCell2]);

    const startGameCell = useMemo(() => bymodXY(startViewCell, gamesize), [startViewCell, manager]);
    const startCellOffset = useMemo(() => subXY(startViewCell2, startViewCell), [startViewCell, contentRect]);

    const defaultZoomRef = useRef(0);

    const zoomRange = useMemo(() => {
        let defaultZoom = defaultZoomRef.current;
        if (defaultZoom < 0.1) {
            const defaultZoomX = viewSize.x / (6 * SIZE);
            const defaultZoomY = viewSize.y / (3 * SIZE);
            defaultZoom = Math.min(defaultZoomX, defaultZoomY);
            defaultZoomRef.current = defaultZoom;
        }

        defaultZoom = minmax(defaultZoom, 0.5, 1.0)

        setPanZoom((prev) => { return { ...prev, zoom: defaultZoom } });
        return { min: Math.max(defaultZoom / 1.5, 0.25), max: defaultZoom * 1.5 };
    }, [viewSize]);

    function handlePanZoomChange(newPanZoom) {
        setPanZoom(newPanZoom);
    }

    useEffect(() => {
        let to = null;
        if (rotation) {
            to = setTimeout(() => { setRotation(null); }, TRANS_DURATION);
        }
        return () => { to && clearTimeout(to); }
    }, [rotation])

    function calcRotateProgress() {
        if (!rotation) return 0;
        const rotateProgress2 = progress(rotation.when, TRANS_DURATION) - 1;
        const rotateProgress = progressToCurve(rotateProgress2 + 1, [0.0, 0.4, 1.2, 0.95, 1.0]) - 1;
        return rotateProgress;
    }

    function handleDown(xy) {
        preBeepButton();
        const cellXY = operXY(Math.floor, divXY(xy, SIZE));
        setSmoothScrollTo(null);
        setSelected({ at: cellXY });

        // if (!selected) setSelected({ at: cellXY });
        // else setSelected(null)
    }

    function handleUp(xy, _, isLast) {
        if (!selected) return;
        const cellXY = operXY(Math.floor, divXY(xy, SIZE));
        if (isLast) {
            const newSmoothScrollTo = clampPanZoomCenter(panZoom.center, contentSize, viewSize, zoom);
            setSmoothScrollTo(newSmoothScrollTo);
        }
        if (isSameXY(cellXY, selected.at) || isLast) {
            setSelected(null);
        }
    }

    function handleClick(xy) {
        const cellXY = operXY(Math.floor, divXY(xy, SIZE));
        if (manager.canRotateAt(cellXY) === false) return;
        manager.rotateAtXY(cellXY);
        setRotation({ at: cellXY, when: performance.now() });
        const figure = manager.figureAt(cellXY);
        const source = manager.sourceAt(cellXY);
        playRotatedFx(figure, source);
        //onGameChange({ ...game });
        gameCtx.updateProgress({ current: manager.game });
    }

    const [smoothScrollTo, setSmoothScrollTo] = useState(null);

    function calcDelta(xy1, xy2, size) {
        xy1 = bymodXY(xy1, size);
        xy2 = bymodXY(xy2, size);
        return subXY(xy2, xy1)
    }

    function scrollToCenter(smoothly) {
        const nowXY = getMiddleColRow();
        const needCellXY = mulXY(gamesize, 0.5);
        const deltaXY = calcDelta(nowXY, needCellXY, gamesize)
        const newXY = addXY(nowXY, deltaXY);
        scrollToCell(newXY, smoothly);
    }

    function scrollToCell(cellXY, smoothly) {
        let newSmoothScrollTo = mulXY(cellXY, SIZE);
        //if (manager.bordered()) {
        cellXY = bymodXY(cellXY, gamesize);
        newSmoothScrollTo = clampPanZoomCenter(newSmoothScrollTo, contentSize, viewSize, zoom);
        //}
        smoothly && setSmoothScrollTo(newSmoothScrollTo);
        smoothly || setPanZoom({ ...panZoom, zoom: minmax(defaultZoomRef.current, 0.5, 1.0), center: newSmoothScrollTo });
    }

    useEffect(() => {
        scrollToCenter(false);

    }, [level, mode, contentSize]);

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

            renderHint(ctx, manager.hint(), startViewCell);

            renderSelect(ctx, selected, manager, startViewCell);

            const globalRotateProgress = calcRotateProgress();
            //draw cells
            loopXY(viewGridSize, (viewXY) => {
                const viewCellXY = addXY(startViewCell, viewXY);
                const cellXY = bymodXY(viewCellXY, gamesize);

                const isOuter = (viewCellXY.x < 0 || viewCellXY.y < 0 || viewCellXY.x >= gamesize.x || viewCellXY.y >= gamesize.y)
                if (manager.bordered() && isOuter) {
                    return;
                }
                ctx.save();
                ctx.translate(viewXY.x * SIZE, viewXY.y * SIZE);


                const cell = manager.cellAt(cellXY);
                const color = manager.colorAt(cellXY);
                const preColor = manager.preColorAt(cellXY);// preColorsRef.current?.get(cellXY) || 0;
                const end = isEnd(cell.figure);

                const isRotating = rotation && manager.isSameCell(cellXY, rotation.at)
                const rotateProgress = isRotating ? globalRotateProgress : 0;
                const conns = manager.connectionAt(cellXY, rotation?.at || null);// connections.get(cellXY) || 0;

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
                    const switchingDelta = color !== preColor ? minmax(rotateProgress + 1, 0, 1) : 1;
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

    }, [viewSize, zoom, center, manager, selected, rotation, solvedFX, progresFX]);

    function getMiddleColRow() {
        const x = Math.floor(center.x / SIZE);
        const y = Math.floor(center.y / SIZE);
        return { x, y };
    }

    function scrollToColor(color) {
        const mid = getMiddleColRow();
        const closest = manager.findClosestXY(mid, color);
        scrollToCell(addXY(closest, XY05), true);
        setSelected({
            at: closest
        });
        return;
    }

    useEffect(() => {
        scrollToCenter(true);

    }, [mode, level])



    return (
        <Window title={manager.level() || "BEGIN"}
            subtitle={GAME_MODES[manager.mode()]}
            onBack={onMenu}
            className={className}
            footer={<GameFooter
                taps={manager.taps()}
                size={gamesize}
                tutorial={manager.level() === 0 ? GAME_MODE_TUTORIALS[manager.mode()] : null}
                solved={manager.level() < GetLevelsSolved(manager.mode())}
                random={GAME_LEVEL_RANDOM(manager.mode(), manager.level())}
            />}
            infobar={manager.isSolved() && <GameOverBar onNext={onNext} onRestart={handleRestart} />}
            subheader={<GameSubHeader counters={manager.endCounters()}
                onClickColor={scrollToColor} />}
            erased={restarting}
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
                <canvas ref={canvasRef} className={cn('contain-size rotate-0x scale-100 rotate-0 duration-500 transition-all', restarting && 'duration-200 rotate-3 scale-125')}></canvas>
            </PanZoomView >

        </Window >
    )
}
