import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { cn } from './utils/cn'
import { COLOR, SIZE, TRANS_DURATION } from "./utils/cfg";
import { BOTTOM, LEFT, RIGHT, TOP } from './utils/gamedata';
import { isEnd, isMix, isOff, isOn } from './utils/gamedata';
import { GameHeader } from './components/GameHeader';
import { PanZoomView } from './components/PanZoomView';
import { addXY, distXY, divXY, mulXY, subXY, toXY } from './utils/xy';
import { getBgImage, getFigureImage, getSourceBgImage } from './utils/canvas';
import { minmax, rnd, bymod, progress, xyToIndex } from './utils/numbers';
import { GameManager } from './utils/gamemanager';
import { invertFigure, moveXY, toDirs } from './utils/gamedata';
import { createArray2d } from './utils/array2d';

export function PagePlay({ game, onGameChange, onBack }) {

    const [scroll, setScroll] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(0.8);
    const [msg, setMsg] = useState("NA");

    const cellSize = useMemo(() => (SIZE * zoom), [zoom]);

    const [selected, setSelected] = useState({
        col: -1, row: -1, leftIndex: -1, topIndex: -1,
        active: false,
        changedOn: 0
    });

    const [rotation, setRotation] = useState({ at: { x: -1, y: -1 }, when: 0 });

    const [viewSize, setViewSize] = useState(toXY(0, 0));

    const zoomRange = useMemo(() => {
        const longestSize = Math.max(viewSize.x, viewSize.y);
        const shortestSize = Math.min(viewSize.x, viewSize.y);
        //max 12 cells for longest size
        //min 6 cells  for longest size
        const minZoom = longestSize / (12 * SIZE);
        const maxZoom = longestSize / (6 * SIZE);
        //return { min: minZoom, max: maxZoom };
        return { min: 0.55, max: 1.25 };
    }, [viewSize]);

    const manager = useMemo(() => new GameManager(game), [game]);

    //const [preColors, setPreColors] = useState(createArray2d(game.size));

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
                    const cell2 = manager.cellAtDir(xy, dir);
                    const isConnected = (cell2.figure & invertFigure(dir));
                    const xy2 = moveXY(xy, dir);
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
            //console.log(xy, color)
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

    function findConnections(manager, colors, xy) {
        let conns = 0b0000;
        toDirs(manager.cellAt(xy).figure).forEach((dir) => {
            const cell2 = manager.cellAtDir(xy, dir);
            conns |= (invertFigure(cell2.figure) & dir);
        });
        return conns;
    }

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

    const contentSize = useMemo(() => (toXY(cellSize * game.size.x, cellSize * game.size.y)), [game.size.x, game.size.y, cellSize]);

    const contentWidth = useMemo(() => (cellSize * game.size.x), [game.size.x, cellSize]);
    const contentHeight = useMemo(() => (cellSize * game.size.y), [game.size.y, cellSize]);

    const viewCols = useMemo(() => Math.ceil(viewSize.x / cellSize) + 1, [viewSize, cellSize]);
    const viewRows = useMemo(() => Math.ceil(viewSize.y / cellSize) + 1, [viewSize, cellSize]);

    const contentLeftIndex = useMemo(() => Math.floor(zoom * scroll.x / contentSize.x), [scroll, contentSize, zoom]);
    const contentTopIndex = useMemo(() => Math.floor(zoom * scroll.y / contentSize.y), [scroll, contentSize, zoom]);

    const scrollLeftAbs = useMemo(() => (zoom * scroll.x % contentSize.x + contentSize.x) % contentSize.x, [scroll, contentSize, zoom]);
    const scrollTopAbs = useMemo(() => (zoom * scroll.y % contentSize.y + contentSize.y) % contentSize.y, [scroll, contentSize, zoom]);

    // Calculate the starting column and row based on the scroll position
    const startCol = useMemo(() => Math.floor(scrollLeftAbs / cellSize), [scrollLeftAbs, cellSize]);
    const startRow = useMemo(() => Math.floor(scrollTopAbs / cellSize), [scrollTopAbs, cellSize]);
    // Calculate the starting column and row offsets within the cell
    const startColOffset = useMemo(() => (scrollLeftAbs % cellSize) / cellSize, [scrollLeftAbs, cellSize]);
    const startRowOffset = useMemo(() => (scrollTopAbs % cellSize) / cellSize, [scrollTopAbs, cellSize]);


    useEffect(() => {
        // console.log("PRELOADING SPRITES");
        // let cnt = 1;
        // for (let figure = 0; figure < 16; figure++) {
        //     for (let conns = 1; conns < 16; conns++) {
        //         for (let on = 1; on < 4; on++) {
        //             console.log("PRELOADING SPRITES", cnt++, figure, conns, on);
        //             getFigureImage(figure, COLORS[on], on === 1 || on === 2, conns);
        //         }
        //     }
        // }
        //const img = getFigureImage(cell.figure, COLORS[cell.on], cell.on === 1 || cell.on === 2, conns);
    }, [])


    const [isViewSizeReady, setIsViewSizeReady] = useState(false);

    useEffect(() => {
        setIsViewSizeReady(!!(viewSize?.x && viewSize?.y));
    }, [viewSize]);

    useEffect(() => {
        if (isViewSizeReady) {
            scrollCenter(true);
            console.log("VIEW SIZE READY!", viewSize);
        }
    }, [isViewSizeReady]);

    function handleDown({ x, y }, pointerId) {
        x += scroll.x * zoom;
        y += scroll.y * zoom;
        const selectedCol = Math.floor(bymod(x / cellSize, game.size.x));
        const selectedRow = Math.floor(bymod(y / cellSize, game.size.y));
        const selectedLeftIndex = Math.floor(x / contentWidth);
        const selectedTopIndex = Math.floor(y / contentHeight);

        setSelected({
            pointerId: pointerId,
            col: selectedCol,
            row: selectedRow,
            leftIndex: selectedLeftIndex,
            topIndex: selectedTopIndex,
            active: true,
            changedOn: performance.now()
            //scrollLeft: scrollLeft, scrollTop: scrollTop
        });
        setMsg("DOWN:" + pointerId)
        console.log(`DOWN: (${selectedCol}, ${selectedRow}) / (${selectedLeftIndex}, ${selectedTopIndex})`);
    }

    function handleUp({ x, y }, pointerId, noClick) {
        if (selected.pointerId !== pointerId) return;

        setSelected({
            ...selected,
            active: false,
            changedOn: performance.now()
        })

        if (noClick) return;
        x += scroll.x * zoom;
        y += scroll.y * zoom;
        const selectedCol = Math.floor(bymod(x / cellSize, game.size.x));
        const selectedRow = Math.floor(bymod(y / cellSize, game.size.y));
        console.log("UP:", selectedCol, selectedRow);

        preColorsRef.current = colors;

        manager.rotateAtXY(selectedCol, selectedRow);
        setRotation({ at: { x: selectedCol, y: selectedRow }, when: performance.now() });
        onGameChange({ ...game });
    }

    function scrollCenter(smoothly) {
        scrollTo(mulXY(contentSize, 0.5), smoothly);
        return;
    }

    const [smoothScrollTo, setSmoothScrollTo] = useState(null);

    function scrollTo(contentXY, smoothly) {
        //if (smoothScrollTo) return;

        function normalizeScroll(scrolXY, contentXY) {
            const newScroll = toXY(
                bymod(scrolXY.x, contentXY.x),
                bymod(scrolXY.y, contentXY.y)
            );

            if (newScroll.x > contentXY.x / 2) newScroll.x -= contentXY.x;
            if (newScroll.y > contentXY.y / 2) newScroll.y -= contentXY.y;
            return newScroll;
        }

        const centerScroll = toXY(
            bymod(contentXY.x - viewSize.x / 2, contentWidth) / zoom,
            bymod(contentXY.y - viewSize.y / 2, contentHeight) / zoom
        )

        if (!smoothly) {
            setScroll(centerScroll);
            return centerScroll;
        }

        let delta = subXY(centerScroll, scroll);
        delta = normalizeScroll(delta, divXY(contentSize, zoom));
        const newSmoothScrollTo = addXY(scroll, delta);
        setSmoothScrollTo(newSmoothScrollTo);
        return { ...newSmoothScrollTo };
    }

    useEffect(() => {
        // return;
        if (!smoothScrollTo) return;

        requestAnimationFrame(() => {
            let delta = mulXY(subXY(smoothScrollTo, scroll), 0.15);
            const dist = distXY(toXY(0, 0), delta);

            if (dist > cellSize) {
                //  delta = mulXY(subXY(smoothScrollTo, scroll), 0.15 / (dist / cellSize));
            }

            if (dist <= 0.25) {
                setScroll({ ...smoothScrollTo });
                setSmoothScrollTo(null);
            } else {
                setScroll((prev) => addXY(prev, delta));
            }
        });
    }, [smoothScrollTo, scroll]);


    function handleScroll(scrollDelta) {
        setScroll((prev) => addXY(prev, divXY(scrollDelta, -zoom)));
    }

    function handleZoom(zoomDelta, coors) {
        let newZoom = minmax(zoomDelta * zoom, zoomRange.min, zoomRange.max);
        zoomDelta = newZoom / zoom;
        const scrollDelta = mulXY(coors, -(1 - zoomDelta) / (zoomDelta * zoom));
        setScroll((prev) => addXY(prev, scrollDelta));
        setZoom((prev) => minmax(prev * zoomDelta, zoomRange.min, zoomRange.max));
    }

    function handleResize(newSize) {
        setViewSize({ ...newSize });
    }

    const canvasRef = useRef(null);


    useEffect(() => {
        if (!canvasRef.current) return;
        //requestAnimationFrame(() => {
        canvasRef.current.width = viewSize.x;
        canvasRef.current.height = viewSize.y;
        //width={`${viewSize.x / 2 / zoom}`} height={`${viewSize.y / 2 / zoom}`}
        const ctx = canvasRef.current.getContext('2d');
        //ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.fillStyle = "#fff"
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        let animationFrame = null;

        function render() {
            // console.log("RT:", game.atXY(0, 0), getRtConnections(game, performance.now(), 0, 0))
            // a.b.c
            //console.time('RENDER');
            const now = performance.now();
            ctx.save();
            ctx.fillStyle = "#202020";
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            // const offsetX = startColOffset - startColOffset % 10;
            // const offsetY = startRowOffset - startRowOffset % 10;
            let dx = -startColOffset * SIZE;
            let dy = -startRowOffset * SIZE;
            // dx = Math.round(dx / 5) * 5;
            // dy = Math.round(dy / 5) * 5;


            ctx.scale(zoom, zoom);

            ctx.translate(dx, dy)

            //draw frame around 0,0
            ctx.globalAlpha = 1
            ctx.strokeStyle = "#111";
            ctx.lineWidth = 8;

            ctx.beginPath()
            for (let row = 0; row < viewRows; row++) {
                const y = row * SIZE;
                const gameRow = bymod(startRow + row, game.size.y);
                if (gameRow === 0) {
                    ctx.moveTo(0, y);
                    ctx.lineTo(viewRows * game.size.x * SIZE, y);
                }
            }

            for (let col = 0; col < viewCols; col++) {
                const x = col * SIZE;
                const gameCol = bymod(startCol + col, game.size.x);
                if (gameCol === 0) {
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, viewRows * game.size.y * SIZE);
                    //ctx.arc(100, 75, 50, 0, 2 * Math.PI)
                }

            }
            ctx.closePath();
            ctx.stroke();

            //draw bg, selection
            for (let row = 0; row < viewRows; row++) {
                for (let col = 0; col < viewCols; col++) {
                    const x = col * SIZE;
                    const y = row * SIZE;
                    const gameCol = bymod(startCol + col, game.size.x);
                    const gameRow = bymod(startRow + row, game.size.y);
                    ctx.save();
                    ctx.translate(x, y);

                    const cell = manager.cellAt(gameCol, gameRow);

                    const gap = 4;
                    const cellRect = manager.getCellRect(gameCol, gameRow);
                    const insideW = SIZE * cellRect.cols - gap * 2;
                    const insideH = SIZE * cellRect.rows - gap * 2;

                    const skipRenderInside = (gameCol !== cellRect.x || gameRow !== cellRect.y);//has rendered before

                    if (!skipRenderInside) {
                        const currentLeftIndex = contentLeftIndex + Math.floor((startCol + col) / game.size.x)
                        const currentTopIndex = contentTopIndex + Math.floor((startRow + row) / game.size.y);

                        const isOdd = (gameCol + gameRow + currentLeftIndex * game.size.x + currentTopIndex * game.size.y) % 2 === 0;
                        if (cell.source) {
                            ctx.fillStyle = "#111";
                            ctx.fillRect(gap, gap, insideW, insideH);
                        } else if (!isOdd) {
                            ctx.fillStyle = isOdd ? "#222" : "#333";
                            ctx.fillRect(gap, gap, insideW, insideH);
                        }

                        if (cell.figure === 0) {
                            ctx.globalAlpha = 0.75

                            ctx.beginPath();


                            ctx.arc(SIZE / 2, SIZE / 2, 30, 0, Math.PI * 2);
                            ctx.moveTo(SIZE / 2 - 20, SIZE / 2 - 20);
                            ctx.lineTo(SIZE / 2 + 20, SIZE / 2 + 20);
                            ctx.moveTo(SIZE / 2 + 20, SIZE / 2 - 20);
                            ctx.lineTo(SIZE / 2 - 20, SIZE / 2 + 20);
                            ctx.lineWidth = 4;
                            ctx.lineJoin = "round";
                            ctx.lineCap = "round";
                            ctx.strokeStyle = !isOdd ? "#222" : "#333";
                            ctx.stroke();
                            ctx.globalAlpha = 1

                            //ctx.fillRect(gap, gap, insideW, insideH);
                        }

                        if (selected.leftIndex === currentLeftIndex && selected.topIndex === currentTopIndex) {
                            const selectedRect = manager.getCellRect(selected.col, selected.row);
                            if (selectedRect.x === cellRect.x && selectedRect.y === cellRect.y) {
                                const selectProgress = 1 - progress(selected.changedOn, TRANS_DURATION * 1);
                                //const selectChangeDelta = 1 - minmax((now - selected.changedOn), 0, TRANS_DURATION) / TRANS_DURATION;

                                const phase = performance.now() % 300;
                                ctx.globalAlpha = phase > 150 ? 0.75 : 0.5
                                if (!selected.active) ctx.globalAlpha *= selectProgress;

                                const gap = 0;
                                const insideW = SIZE * cellRect.cols - gap * 2;
                                const insideH = SIZE * cellRect.rows - gap * 2;
                                const size = 8;
                                ctx.beginPath();
                                ctx.moveTo(gap, gap + size);
                                ctx.lineTo(gap, gap);
                                ctx.lineTo(gap + size, gap);

                                ctx.moveTo(insideW + gap, gap + size);
                                ctx.lineTo(insideW + gap, gap);
                                ctx.lineTo(insideW + gap - size, gap);
                                ctx.moveTo(gap, insideH + gap - size);
                                ctx.lineTo(gap, insideH + gap);
                                ctx.lineTo(gap + size, insideH + gap);
                                ctx.moveTo(insideW + gap, insideH + gap - size);
                                ctx.lineTo(insideW + gap, insideH + gap);
                                ctx.lineTo(insideW + gap - size, insideH + gap);

                                ctx.lineWidth = 6;
                                ctx.lineJoin = "round";
                                ctx.lineCap = "round";
                                ctx.strokeStyle = "#fff";
                                ctx.stroke();



                                //}
                            }
                        }
                    }

                    ctx.restore();
                }
            }



            ctx.globalAlpha = 1;

            const sourcesToDraw = new Map();
            //draw cells
            for (let row = 0; row < viewRows; row++) {
                for (let col = 0; col < viewCols; col++) {

                    let x = col * SIZE;
                    let y = row * SIZE;
                    ctx.save();
                    ctx.translate(x, y);
                    //x = y = 0;
                    const gameCol = bymod(startCol + col, game.size.x);
                    const gameRow = bymod(startRow + row, game.size.y);

                    const cell = manager.cellAt(gameCol, gameRow);
                    const end = isEnd(cell.figure);

                    const isRotating = manager.isSameCell(toXY(gameCol, gameRow), rotation.at);
                    const rotateProgress = isRotating ? progress(rotation.when, TRANS_DURATION) - 1 : 0;

                    const conns = findRtConnections(manager, colors, toXY(gameCol, gameRow), progress(rotation.when, TRANS_DURATION) < 1 ? rotation.at : null);// 0b1111;

                    if (cell.source) {
                        const cell_l = manager.cellAtDir(toXY(gameCol, gameRow), LEFT);
                        const cell_t = manager.cellAtDir(toXY(gameCol, gameRow), TOP);
                        const cell_r = manager.cellAtDir(toXY(gameCol, gameRow), RIGHT);
                        const cell_b = manager.cellAtDir(toXY(gameCol, gameRow), BOTTOM);

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
                        figure2rotate &= (~figure2move);

                        const img2rotate = getFigureImage(figure2rotate, cell.source, true, conns);
                        const img2down = getFigureImage(cell.figure & figure2move & RIGHT, cell.source, true, conns);
                        const img2up = getFigureImage(cell.figure & figure2move & LEFT, cell.source, true, conns);
                        const img2right = getFigureImage(cell.figure & figure2move & TOP, cell.source, true, conns);
                        const img2left = getFigureImage(cell.figure & figure2move & BOTTOM, cell.source, true, conns);

                        img2down && ctx.drawImage(img2down, -1, SIZE * (rotateProgress) - 1, SIZE + 2, SIZE + 2);
                        img2up && ctx.drawImage(img2up, -1, -SIZE * (rotateProgress) - 1, SIZE + 2, SIZE + 2);
                        img2left && ctx.drawImage(img2left, -SIZE * (rotateProgress) - 1, -1, SIZE + 2, SIZE + 2);
                        img2right && ctx.drawImage(img2right, SIZE * (rotateProgress) - 1, -1, SIZE + 2, SIZE + 2);

                        ctx.save();
                        ctx.translate(SIZE / 2, SIZE / 2);       // move origin
                        ctx.rotate(rotateProgress * Math.PI / 2);         // rotate (radians)
                        img2rotate && ctx.drawImage(img2rotate, -SIZE / 2 - 1, -SIZE / 2 - 1, SIZE + 2, SIZE + 2);
                        ctx.restore();

                    } else {

                        const color = colors.get(toXY(gameCol, gameRow)) || 0;
                        const preColor = preColorsRef.current?.get(toXY(gameCol, gameRow)) || 0;

                        const switchingDelta = color !== preColor ? progress(rotation.when, TRANS_DURATION * 1.5) : 1;
                        ctx.save();
                        ctx.translate(SIZE / 2, SIZE / 2);       // move origin
                        ctx.rotate(rotateProgress * Math.PI / 2);         // rotate (radians)

                        if (switchingDelta < 1) {
                            const imgBefore = getFigureImage(cell.figure, preColor, false, conns);
                            if (imgBefore) {
                                ctx.drawImage(imgBefore, -SIZE / 2 - 1, -SIZE / 2 - 1, SIZE + 2, SIZE + 2);
                            }
                        }

                        const img = getFigureImage(cell.figure, color, false, conns);
                        if (img) {
                            ctx.globalAlpha = switchingDelta
                            ctx.drawImage(img, -SIZE / 2 - 1, -SIZE / 2 - 1, SIZE + 2, SIZE + 2);
                        }
                        ctx.restore();


                        const showing = minmax(switchingDelta * 2, 1, 2) - 1;
                        const hiding = minmax(switchingDelta * 2, 0, 1);

                        if (end && !isOff(color)) {
                            //if (end && color === 0) {
                            ctx.globalAlpha = showing;
                            ctx.beginPath();
                            ctx.moveTo(SIZE / 2, SIZE / 2);
                            ctx.lineTo(SIZE / 2, SIZE / 2)
                            ctx.lineWidth = 40 - 20 * showing;
                            ctx.lineJoin = "round";
                            ctx.lineCap = "round";
                            ctx.strokeStyle = isMix(color) ? "#666" : "#fff"
                            ctx.stroke();

                            //ctx.globalAlpha = 1;
                            ctx.beginPath();
                            ctx.moveTo(SIZE / 2, SIZE / 2);
                            ctx.lineTo(SIZE / 2, SIZE / 2)
                            ctx.lineWidth = isMix(color) ? 15 * showing : 5;// * showing;
                            ctx.lineJoin = "round";
                            ctx.lineCap = "round";
                            ctx.strokeStyle = isMix(color) ? COLOR(color) : "#111"
                            ctx.stroke();
                        }

                        if (end && !isOff(preColor)) {
                            ctx.globalAlpha = (1 - hiding);
                            ctx.beginPath();
                            ctx.moveTo(SIZE / 2, SIZE / 2);
                            ctx.lineTo(SIZE / 2, SIZE / 2)
                            ctx.lineWidth = 20 * (1 - hiding);
                            ctx.lineJoin = "round";
                            ctx.lineCap = "round";
                            ctx.strokeStyle = isMix(preColor) ? "#666" : "#fff"
                            ctx.stroke();
                            //ctx.globalAlpha = hiding < 1 ? 1 : 0;
                            ctx.beginPath();
                            ctx.moveTo(SIZE / 2, SIZE / 2);
                            ctx.lineTo(SIZE / 2, SIZE / 2)
                            ctx.lineWidth = isMix(preColor) ? 15 * (1 - hiding) : 5;
                            ctx.lineJoin = "round";
                            ctx.lineCap = "round";
                            ctx.strokeStyle = isMix(preColor) ? COLOR(preColor) : "#111"
                            ctx.stroke();
                        }

                        if (end && isOff(color)) {
                            ctx.globalAlpha = 1 * showing
                            const d = 5 * showing;
                            ctx.beginPath();
                            ctx.moveTo(SIZE / 2 - d, SIZE / 2 - d);
                            ctx.lineTo(SIZE / 2 + d, SIZE / 2 + d)
                            ctx.moveTo(SIZE / 2 + d, SIZE / 2 - d);
                            ctx.lineTo(SIZE / 2 - d, SIZE / 2 + d)
                            ctx.lineWidth = 2.5;
                            ctx.lineJoin = "round";
                            ctx.lineCap = "round";
                            ctx.strokeStyle = "#666"
                            ctx.stroke();
                        }
                        if (end && isOff(preColor)) {
                            ctx.globalAlpha = 1 - hiding;
                            const d = 5 * (1 - hiding);
                            ctx.beginPath();
                            ctx.moveTo(SIZE / 2 - d, SIZE / 2 - d);
                            ctx.lineTo(SIZE / 2 + d, SIZE / 2 + d)
                            ctx.moveTo(SIZE / 2 + d, SIZE / 2 - d);
                            ctx.lineTo(SIZE / 2 - d, SIZE / 2 + d)
                            ctx.lineWidth = 2.5;
                            ctx.lineJoin = "round";
                            ctx.lineCap = "round";
                            ctx.strokeStyle = "#666"
                            ctx.stroke();
                        }
                    }

                    ctx.globalAlpha = 1
                    if (cell.source) {
                        const rect = manager.getCellRect(gameCol, gameRow);
                        const sourceX = x - (gameCol - rect.x) * SIZE;
                        const sourceY = y - (gameRow - rect.y) * SIZE;
                        sourcesToDraw.set(sourceX + "_" + sourceY, { sourceX, sourceY, rect })
                    }
                    // if (cell.source && !game.atXY(gameCol, gameRow - 1).source && !game.atXY(gameCol - 1, gameRow).source) {
                    //     const rect = getCellRect(game, gameCol, gameRow);
                    //     sourcesToDraw.push()

                    //     const sourceImg = getSourceBgImage(COLORS[cell.on], rect.cols, rect.rows);
                    //     if (sourceImg) {
                    //         ctx.drawImage(sourceImg, 0, 0, SIZE * rect.cols, SIZE * rect.rows);
                    //     }
                    // }
                    ctx.restore();
                }
            }

            // Draw all sources
            //console.log("SIZE of sourcesToDraw:", sourcesToDraw.size)
            sourcesToDraw.forEach(({ sourceX, sourceY, rect }) => {
                //TODO: const sourceImg = getSourceBgImage(manager.cellAt(rect.x, rect.y).on, rect.cols, rect.rows);
                const sourceImg = getSourceBgImage(manager.cellAt(rect.x, rect.y).source, rect.cols, rect.rows);
                if (sourceImg) {
                    ctx.drawImage(sourceImg, sourceX, sourceY, SIZE * rect.cols, SIZE * rect.rows);
                }
            });



            ctx.restore();
            animationFrame = requestAnimationFrame(render)
            //console.timeEnd('RENDER')
        }

        console.log("ReNDER RESTARTED")
        render();

        return () => {
            cancelAnimationFrame(animationFrame);
        }



        //}, []); 
    }, [viewSize, zoom, scroll, game, selected, colors, rotation]);

    function getMiddleColRow() {
        //what is coor in the middle of scroll view now
        //return {col, row}
        const middleCol = Math.floor(scroll.x * zoom / cellSize + viewSize.x / (2 * cellSize));
        const middleRow = Math.floor(scroll.y * zoom / cellSize + viewSize.y / (2 * cellSize));
        return { x: bymod(middleCol, game.size.x), y: bymod(middleRow, game.size.y) };
    }

    function findClosestColRow(fromCol, fromRow, color) {
        const visited = new Set();
        visited.add(`${fromCol},${fromRow}`);
        const queue = [
            { x: bymod(fromCol - 1, game.size.x), y: fromRow, dist: 1 },
            { x: bymod(fromCol + 1, game.size.x), y: fromRow, dist: 1 },
            { x: fromCol, y: bymod(fromRow - 1, game.size.y), dist: 1 },
            { x: fromCol, y: bymod(fromRow + 1, game.size.y), dist: 1 }
        ]
        function isThat(xy) {
            const cell = manager.cellAt(xy);
            const cellColor = colors.get(xy) || 0;
            console.log(xy, cellColor, color, isOn(color), isOn(cellColor))
            if (!isOn(cellColor) && !isOn(color) && isEnd(cell.figure)) {
                return true;
            } else if (cell.source === color && isOn(color)) {
                return true;
            }
        }

        while (queue.length > 0) {
            const { x, y, dist } = queue.shift();
            const key = `${x},${y}`;

            if (visited.has(key)) continue;
            visited.add(key);

            const cell = manager.cellAt({ x, y });
            if (isThat({ x, y })) {
                return { x, y, dist };
            }

            const neighbors = [
                { x: bymod(x - 1, game.size.x), y },
                { x: bymod(x + 1, game.size.x), y },
                { x, y: bymod(y - 1, game.size.y) },
                { x, y: bymod(y + 1, game.size.y) }
            ];

            for (const neighbor of neighbors) {
                queue.push({ ...neighbor, dist: dist + 1 });
            }
        }
        if (isThat(toXY(fromCol, fromRow))) {
            return { x: fromCol, y: fromRow, dist: 0 };
        }
        return null;
    }

    function scrollToColor(color) {
        console.log("MID: ", getMiddleColRow())
        const mid = getMiddleColRow();

        const closest = findClosestColRow(mid.x, mid.y, color);
        console.log("FIND: ", mid, closest, color)
        if (!closest) return;
        const newScroll = scrollTo({ x: closest.x * cellSize + cellSize / 2, y: closest.y * cellSize + cellSize / 2 }, true);
        const selectedLeftIndex = Math.floor((zoom * newScroll.x + viewSize.x / 2) / contentSize.x);
        const selectedTopIndex = Math.floor((zoom * newScroll.y + viewSize.y / 2) / contentSize.y);

        setSelected({
            pointerId: 0,
            col: closest.x,
            row: closest.y,
            leftIndex: selectedLeftIndex,
            topIndex: selectedTopIndex,
            active: true,
            changedOn: performance.now()
        });
    }

    return (
        <div className="flex flex-col flex-1 bg-black">

            <GameHeader counter={counters} onBack={onBack} onLevelClick={() => { scrollCenter(true) }}
                onScrollTo={(color) => {
                    scrollToColor(color);
                }}
            >
            </GameHeader>
            {/* <div className='p-4' onClick={handleTest}>test</div> */}
            <PanZoomView
                className={cn("relative bg-black flex-1 opacity-0 transition-opacity delay-75 duration-500", isViewSizeReady && "opacity-100")}
                onPress={handleDown}
                onRelease={handleUp}
                onResize={handleResize}
                onScroll={handleScroll}
                onZoom={handleZoom}
            >
                {/* {viewCells} */}
                {/* <svg viewBox={`${startColOffset * SIZE} ${startRowOffset * SIZE} ${viewSize.x / zoom} ${viewSize.y / zoom}`}
                    //className="bg-blue-100/50"
                    //className="absolute top-0 left-0 w-full h-full"
                    style={{ pointerEvents: "none" }}
                >
                    {viewCells}

                </svg> */}
                <canvas ref={canvasRef}
                    //width={`${viewSize.x / 2 / zoom}`} height={`${viewSize.y / 2 / zoom}`}
                    //width="500" height="500"
                    style={{
                        // xtranslate: `${-startColOffset * SIZE * zoom}px ${-startRowOffset * SIZE * zoom}px`,
                        // width: `${viewSize.x / zoom}px`,
                        // height: `${viewSize.y / zoom}px`,
                        //scale: `${zoom}`
                    }}
                    className='absolute z-20 xbg-green-500 origin-top-left'></canvas>

            </PanZoomView >
            <div className='p-1 text-[10px] font-bold text-center ring-8 ring-black/20 z-40 text-[#aaa] bg-[#eee] font-mono uppercase text-ellipsis whitespace-nowrap overflow-hidden'>
                Netwalk v0.1 by Anton Teryaev, 2025
            </div>

        </div >
    )
}
