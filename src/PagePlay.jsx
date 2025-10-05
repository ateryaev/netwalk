import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { cn } from './utils/cn'
import { COLOR, SIZE, TRANS_DURATION } from "./utils/cfg";
import { BOTTOM, LEFT, RIGHT, TOP } from './game/gamedata';
import { isEnd, isMix, isOff, isOn } from './game/gamedata';
import { GameHeader } from './components/GameHeader';
import { clampPanZoomCenter, PanZoomView } from './components/PanZoomView';
import { addXY, bymodXY, distXY, divXY, fromtoXY, isSameXY, loopXY, mulXY, operXY, printXY, subXY, toRectXY, toXY, XY05, XY1 } from './utils/xy';
import { drawCircle, drawStar, getFigureImage, getSourceBgImage } from './utils/canvas';
import { minmax, rnd, bymod, progress, xyToIndex, progressToCurve } from './utils/numbers';
import { GameManager } from './game/gamemanager';
import { invertFigure, moveXY, toDirs } from './game/gamedata';
import { createArray2d } from './utils/array2d';
import { drawActiveEnd, drawBG, drawBgCell, drawEmptyCell, drawFigure, drawMixEnd, drawOffEnd, drawRotated, drawSelection, drawSourceFg, drawTransform } from './game/gamedraw';
import { renderGameBg, renderHint, renderSelect, renderSourceFgs } from './game/gamerender';
import { Button, MenuButton, PinkButton, SvgNext, SvgRestart } from './components/Button';
import { shufleGame } from './game/gamecreate';
import { Window } from './components/Window';
import { GameFooter } from './components/GameFooter';
import { GameSubHeader } from './components/GameSubHeader';
import { GameOverBar } from './components/GameOverBar';
import Modal from './components/Modal';
import { GAME_LEVEL_RANDOM, GAME_MODE_TUTORIALS, GAME_MODES } from './game/gameconstants';
import { GetLevelsSolved } from './game/gamestats';
import { beepButton, beepLevelComplete, beepLevelStart, preBeepButton } from './utils/beep';

export function PagePlay({ game, onGameChange, onBack, onNext, onRestart, className, ...props }) {

    function createStar() {
        return {
            xy: toXY(Math.random(), Math.random() + 1),
            size: Math.random(),
            color: rnd(3),
            createdOn: 0,
            updatedOn: 0,
        }
    }
    const stars = useRef([
        createStar(), createStar(), createStar(), createStar(), createStar(),
        createStar(), createStar(), createStar(), createStar(), createStar(),
        createStar(), createStar(), createStar(), createStar(), createStar(),
        createStar(), createStar(), createStar(), createStar(), createStar(),
        createStar(), createStar(), createStar(), createStar(), createStar()
    ]);
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

    const [celebrating, setCelebrating] = useState(0);
    useEffect(() => {
        if (counters[0] === 0) {
            beepLevelComplete();
            setCelebrating(performance.now());
        }
    }, [counters[0]]);


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
        //sfx("spin");

        const figure = manager.cellAt(cellXY).figure;
        const source = manager.cellAt(cellXY).source;
        if (figure === 0) {
            return;
        }
        if (figure === 0b1111 && !source) {
            beepButton(0.5);
            return;
        }
        if (source) {
            beepButton(1);
        } else if (figure === 0b1010 || figure === 0b0101) {
            beepButton(1.2);
        } else if (figure === 0b1100 || figure === 0b0011 || figure === 0b0110 || figure === 0b1001) {
            beepButton(1.4);
        } else if (isEnd(figure)) {
            beepButton(1.8);
        } else {
            beepButton(1.6);
        }

        game.taps++;
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
        beepLevelStart();
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
            ctx.save();

            let dx = -startCellOffset.x * SIZE;
            let dy = -startCellOffset.y * SIZE;

            ctx.scale(zoom, zoom);

            let start = contentRect.at;
            let size = contentRect.size;




            ctx.translate(dx, dy);

            renderGameBg(ctx, manager, viewGridSize, startViewCell)

            game.hintXY?.[0] && renderHint(ctx, game.hintXY[0], startViewCell);
            if (!manager.bordered() || isSameXY(selected.at, bymodXY(selected.at, manager.size()))) {
                renderSelect(ctx, selected, manager, startViewCell);
                //             }
                // if ( game.hintXY[0]|| isSameXY(game.hintXY[0], bymodXY(selected.at, manager.size()))) {
                //                 renderSelect(ctx, selected, manager, startViewCell);
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
                const rotateProgress = isRotating ? progress(rotation.when, TRANS_DURATION) - 1 : 0;

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

                    drawTransform(ctx, toXY(0, moveDist), () => drawFigure(ctx, figure2move & RIGHT, color, conns));
                    drawTransform(ctx, toXY(0, -moveDist), () => drawFigure(ctx, figure2move & LEFT, color, conns));
                    drawTransform(ctx, toXY(moveDist, 0), () => drawFigure(ctx, figure2move & TOP, color, conns));
                    drawTransform(ctx, toXY(-moveDist, 0), () => drawFigure(ctx, figure2move & BOTTOM, color, conns));
                    drawRotated(ctx, rotateProgress * Math.PI / 2, () => drawFigure(ctx, figure2rotate, color + (isOuter ? 100 : 0), conns));
                } else {
                    const switchingDelta = color !== preColor ? progress(rotation.when, TRANS_DURATION * 1.5) : 1;
                    drawRotated(ctx, rotateProgress * Math.PI / 2, () => {
                        switchingDelta < 1 && drawFigure(ctx, cell.figure, preColor + (isOuter ? 100 : 0), conns, 1);
                        drawFigure(ctx, cell.figure, color + (isOuter ? 100 : 0), conns, (switchingDelta));
                    });

                    if (end && !isOuter) {
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

            //renderGameBg2(ctx, manager, viewGridSize, startViewCell)

            ctx.restore();

            if (counters[0] === 0) {
                stars.current.slice(0, 10).forEach((star) => {
                    star.updatedOn = star.updatedOn || now;
                    const dt = now - star.updatedOn;
                    star.updatedOn = now;

                    const speed = (1 + star.size * 0.5);
                    star.xy.y -= speed * dt / 2000;

                    if (star.xy.y < -0.1) {
                        star.xy.y += 1.2;
                        star.color = rnd(3);
                        star.size = Math.random();
                        star.xy = toXY(Math.random(), Math.random());
                        star.createdOn = now;
                    }
                    const lifetime = now - star.createdOn;

                    const alpha = minmax(lifetime / speed / 500, 0, 1);
                    const starting = minmax((now - celebrating) / 500, 0, 1);

                    const dx = 0// Math.sin(star.size + lifetime / 200) * (20 - star.size * 10) * speed;
                    const ds = 0//Math.sin(star.size + lifetime / 50) * 5;


                    const starXY = toXY(star.xy.x * viewSize.x + dx - 50, star.xy.y * viewSize.y);


                    const radius = 2 * ((0.5 + star.size) * 10 + 10);
                    const angle = 0//Math.sin(star.size + lifetime / 500) * 2; //(progress * 10 + 0.5 * progress * Math.PI * (1.5 - star.size)) * (star.size > 0.5 ? 1 : -1);
                    //starXY.x -= SIZE / 2;

                    // if (progress > 0.99) {
                    //     star.xy = toXY(Math.random(), Math.random());
                    //     star.size = Math.random();
                    //     star.createdOn = now;// + duration * progress * Math.random();
                    //     star.color = rnd(3);
                    // }

                    //((now - star.createdOn) / 1000) * star.size * 50;

                    //const starAlpha = minmax((now - star.createdOn) / 2000, 1, 0);
                    ctx.globalAlpha = starting * alpha * 0.2;//alpha;// * (0.45 - star.size * 0.25);
                    ctx.save();
                    ctx.translate(starXY.x, starXY.y);
                    //drawStar(ctx, 10, 0, 2 * ((0.5 + star.size) * 10 + 10), `${COLOR(0b0001 << star.color)}`);
                    drawRotated(ctx, angle, () =>
                        drawStar(ctx, 75, 50, (radius + ds) * progressToCurve(alpha, [0.2, 1.5, 0.75, 1.1, 1]), `${COLOR(0b0001 << star.color)}`));
                    ctx.restore();

                    //drawStar(ctx, 100, 100, `${COLOR(0b0001 << star.color)}`);
                    // drawStar(ctx, starXY.x, starXY.y, 2 * ((0.5 + star.size) * 10 + 10),
                    //     `${COLOR(0b0001 << star.color)}`);

                    // drawCircle(ctx, starXY.x, starXY.y, 2 * ((0.5 + star.size) * progress * 10 + 10),
                    //     `${COLOR(0b0001 << star.color)}`);
                    // drawCircle(ctx, starXY.x, starXY.y, 0.5 * (10 + (0.2 + star.size) * progress * 10),
                    //     `rgba(255,255,255,${alpha * 0.2})`);
                    //addXY(mulXY(star.xy, viewSize), mulXY(toXY(1, 1), star.size * 20));
                    //const starAlpha = minmax((now - star.createdOn) / 2000, 0, 1);
                    //ctx.globalAlpha = starAlpha;//starAlpha * star.size * 0.5;
                    //ctx.fillStyle = "#fa6";
                    //ctx.fillRect(starXY.x, starXY.y, star.size * 100, star.size * 100);
                    // drawTransform(ctx, starXY, () => drawActiveEnd(ctx, alpha * (star.size)));
                });
            }

            // ctx.globalAlpha = 0.3;
            // ctx.fillStyle = "#fff";
            // ctx.fillRect(0, 0, viewSize.x, viewSize.y);
            // drawTransform(ctx, toXY(200, 200), () => drawActiveEnd(ctx, 1));
            ctx.globalAlpha = 1;

            animationFrame = requestAnimationFrame(render);
        }

        render();

        return () => { cancelAnimationFrame(animationFrame); }

    }, [viewSize, zoom, center, game, selected, colors, rotation, celebrating]);

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
    const [menu, setMenu] = useState(false);
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
                //contentSize={manager.bordered() ? contentSize : null}
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
