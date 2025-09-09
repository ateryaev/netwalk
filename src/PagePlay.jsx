import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { cn } from './utils/cn'
import { BOTTOM, COLOR, LEFT, RIGHT, SIZE, TOP, TRANS_DURATION } from "./utils/cfg";
import { atXYD, countProgress, getCellRect, getRtConnections, isEnd, isMix, isOff, isOn } from './utils/game';
import { GameHeader } from './components/GameHeader';
import { PanZoomView } from './components/PanZoomView';
import { addXY, distXY, divXY, mulXY, subXY, XY } from './utils/xy';
import { getBgImage, getFigureImage, getSourceBgImage } from './utils/canvas';
import { minmax, rnd, bymod, progress } from './utils/numbers';

export function PagePlay({ game, onGameChange, onBack }) {

    //const viewRef = useRef(null);

    // const [scrollLeft, setScrollLeft] = useState(0);
    // const [scrollTop, setScrollTop] = useState(0);
    const [scroll, setScroll] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [msg, setMsg] = useState("NA");

    // const scrollLeft = useMemo(() => (scroll.x * zoom), [scroll, zoom])
    // const scrollTop = useMemo(() => (scroll.y * zoom), [scroll, zoom])


    const cellSize = useMemo(() => (SIZE * zoom), [zoom]);
    const [selected, setSelected] = useState({
        col: -1, row: -1, leftIndex: -1, topIndex: -1,
        active: false,
        changedOn: 0
    });

    const [viewSize, setViewSize] = useState(XY(0, 0));

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


    const contentSize = useMemo(() => (XY(cellSize * game.cols, cellSize * game.rows)), [game.cols, game.rows, cellSize]);

    const contentWidth = useMemo(() => (cellSize * game.cols), [game.cols, cellSize]);
    const contentHeight = useMemo(() => (cellSize * game.rows), [game.rows, cellSize]);

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
        const selectedCol = Math.floor(bymod(x / cellSize, game.cols));
        const selectedRow = Math.floor(bymod(y / cellSize, game.rows));
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

        setMsg("UUPP:" + pointerId + "/" + selected.pointerId + ":" + noClick)
        if (selected.pointerId !== pointerId) return;

        setSelected({
            ...selected,
            active: false,
            changedOn: performance.now()
        })
        if (noClick) return;
        x += scroll.x * zoom;
        y += scroll.y * zoom;
        const selectedCol = Math.floor(bymod(x / cellSize, game.cols));
        const selectedRow = Math.floor(bymod(y / cellSize, game.rows));
        console.log("UP:", selectedCol, selectedRow);

        game.rotateAtXY(selectedCol, selectedRow);
        game.updateOnStates();
        // game.endsOn = countEndsOn(game);
        // game.ends = countEnds(game);
        game.counts = countProgress(game);
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
            const newScroll = XY(
                bymod(scrolXY.x, contentXY.x),
                bymod(scrolXY.y, contentXY.y)
            );

            if (newScroll.x > contentXY.x / 2) newScroll.x -= contentXY.x;
            if (newScroll.y > contentXY.y / 2) newScroll.y -= contentXY.y;
            return newScroll;
        }

        const centerScroll = XY(
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
            const dist = distXY(XY(0, 0), delta);

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
                const gameRow = bymod(startRow + row, game.rows);
                if (gameRow === 0) {
                    ctx.moveTo(0, y);
                    ctx.lineTo(viewRows * game.cols * SIZE, y);
                }
            }

            for (let col = 0; col < viewCols; col++) {
                const x = col * SIZE;
                const gameCol = bymod(startCol + col, game.cols);
                if (gameCol === 0) {
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, viewRows * game.rows * SIZE);
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
                    const gameCol = bymod(startCol + col, game.cols);
                    const gameRow = bymod(startRow + row, game.rows);
                    ctx.save();
                    ctx.translate(x, y);

                    const cell = game.atXY(gameCol, gameRow);

                    const gap = 4;
                    const cellRect = getCellRect(game, gameCol, gameRow);
                    const insideW = SIZE * cellRect.cols - gap * 2;
                    const insideH = SIZE * cellRect.rows - gap * 2;

                    const skipRenderInside = (gameCol !== cellRect.x || gameRow !== cellRect.y);//has rendered before

                    if (!skipRenderInside) {
                        const currentLeftIndex = contentLeftIndex + Math.floor((startCol + col) / game.cols)
                        const currentTopIndex = contentTopIndex + Math.floor((startRow + row) / game.rows);

                        const isOdd = (gameCol + gameRow + currentLeftIndex * game.cols + currentTopIndex * game.rows) % 2 === 0;
                        if (cell.source) ctx.fillStyle = "#111";
                        else ctx.fillStyle = isOdd ? "#222" : "#333";
                        ctx.fillRect(gap, gap, insideW, insideH);

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
                            const selectedRect = getCellRect(game, selected.col, selected.row);
                            if (selectedRect.x === cellRect.x && selectedRect.y === cellRect.y) {
                                const selectProgress = 1 - progress(selected.changedOn, TRANS_DURATION * 1);
                                //const selectChangeDelta = 1 - minmax((now - selected.changedOn), 0, TRANS_DURATION) / TRANS_DURATION;

                                const phase = performance.now() % 300;
                                ctx.globalAlpha = phase > 150 ? 0.75 : 0.5
                                if (!selected.active) ctx.globalAlpha *= selectProgress;

                                const size = gap * 2;
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
                    const gameCol = bymod(startCol + col, game.cols);
                    const gameRow = bymod(startRow + row, game.rows);

                    const cell = game.atXY(gameCol, gameRow);
                    const isEnd = (cell.figure === 0b1000 || cell.figure === 0b0100 || cell.figure === 0b0010 || cell.figure === 0b0001);

                    const conns = getRtConnections(game, now, gameCol, gameRow);

                    if (cell.source) {

                        const rotateProgress = (progress(cell.rotatedOn, TRANS_DURATION * 1) - 1);

                        const cell_l = atXYD(game, gameCol, gameRow, LEFT);
                        const cell_t = atXYD(game, gameCol, gameRow, TOP);
                        const cell_r = atXYD(game, gameCol, gameRow, RIGHT);
                        const cell_b = atXYD(game, gameCol, gameRow, BOTTOM);

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

                    } else if (!cell.source) {
                        const angle = (progress(cell.rotatedOn, TRANS_DURATION * 1) - 1) * Math.PI / 2;
                        const switchingDelta = progress(cell.switchedOn, TRANS_DURATION * 1.5);
                        ctx.save();
                        ctx.translate(SIZE / 2, SIZE / 2);       // move origin
                        ctx.rotate(angle);         // rotate (radians)

                        if (switchingDelta < 1) {
                            const imgBefore = getFigureImage(cell.figure, cell.onBefore, cell.onBefore === 1 || cell.onBefore === 2, conns);
                            if (imgBefore) {
                                ctx.drawImage(imgBefore, -SIZE / 2 - 1, -SIZE / 2 - 1, SIZE + 2, SIZE + 2);
                            }
                        }

                        const img = getFigureImage(cell.figure, cell.on, cell.on === 1 || cell.on === 2, conns);
                        if (img) {
                            ctx.globalAlpha = switchingDelta
                            ctx.drawImage(img, -SIZE / 2 - 1, -SIZE / 2 - 1, SIZE + 2, SIZE + 2);
                        }
                        ctx.restore();



                        const showing = minmax(switchingDelta * 2, 1, 2) - 1;
                        const hiding = minmax(switchingDelta * 2, 0, 1);

                        if (isEnd && !isOff(cell.on)) {
                            ctx.globalAlpha = showing;
                            ctx.beginPath();
                            ctx.moveTo(SIZE / 2, SIZE / 2);
                            ctx.lineTo(SIZE / 2, SIZE / 2)
                            ctx.lineWidth = 20 * showing;
                            ctx.lineJoin = "round";
                            ctx.lineCap = "round";
                            ctx.strokeStyle = isMix(cell.on) ? "#666" : "#fff"
                            ctx.stroke();

                            //ctx.globalAlpha = 1;
                            ctx.beginPath();
                            ctx.moveTo(SIZE / 2, SIZE / 2);
                            ctx.lineTo(SIZE / 2, SIZE / 2)
                            ctx.lineWidth = isMix(cell.on) ? 15 * showing : 5;// * showing;
                            ctx.lineJoin = "round";
                            ctx.lineCap = "round";
                            ctx.strokeStyle = isMix(cell.on) ? COLOR(cell.on) : "#111"
                            ctx.stroke();
                        }

                        if (isEnd && !isOff(cell.onBefore)) {
                            ctx.globalAlpha = (1 - hiding);
                            ctx.beginPath();
                            ctx.moveTo(SIZE / 2, SIZE / 2);
                            ctx.lineTo(SIZE / 2, SIZE / 2)
                            ctx.lineWidth = 20 * (1 - hiding);
                            ctx.lineJoin = "round";
                            ctx.lineCap = "round";
                            ctx.strokeStyle = isMix(cell.onBefore) ? "#666" : "#fff"
                            ctx.stroke();
                            //ctx.globalAlpha = hiding < 1 ? 1 : 0;
                            ctx.beginPath();
                            ctx.moveTo(SIZE / 2, SIZE / 2);
                            ctx.lineTo(SIZE / 2, SIZE / 2)
                            ctx.lineWidth = isMix(cell.onBefore) ? 15 * (1 - hiding) : 5;
                            ctx.lineJoin = "round";
                            ctx.lineCap = "round";
                            ctx.strokeStyle = isMix(cell.onBefore) ? COLOR(cell.onBefore) : "#111"
                            ctx.stroke();
                        }

                        if (isEnd && isOff(cell.on)) {
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
                        if (isEnd && isOff(cell.onBefore)) {
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
                        const rect = getCellRect(game, gameCol, gameRow);
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
                const sourceImg = getSourceBgImage(game.atXY(rect.x, rect.y).on, rect.cols, rect.rows);
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
    }, [viewSize, zoom, scroll, game, selected]);

    function getMiddleColRow() {
        //what is coor in the middle of scroll view now
        //return {col, row}
        const middleCol = Math.floor(scroll.x * zoom / cellSize + viewSize.x / (2 * cellSize));
        const middleRow = Math.floor(scroll.y * zoom / cellSize + viewSize.y / (2 * cellSize));
        return { col: bymod(middleCol, game.cols), row: bymod(middleRow, game.rows) };
    }

    function findClosestColRow(fromCol, fromRow, color) {
        const visited = new Set();
        visited.add(`${fromCol},${fromRow}`);
        const queue = [
            { col: bymod(fromCol - 1, game.cols), row: fromRow, dist: 1 },
            { col: bymod(fromCol + 1, game.cols), row: fromRow, dist: 1 },
            { col: fromCol, row: bymod(fromRow - 1, game.rows), dist: 1 },
            { col: fromCol, row: bymod(fromRow + 1, game.rows), dist: 1 }
        ]
        function isThat(cell) {
            if (!isOn(cell.on) && !isOn(color) && isEnd(cell.figure)) {
                return true;
            }
            if (cell.on * 1 === color * 1 && isOn(color) && cell.source > 0) {
                return true;
            }
        }

        while (queue.length > 0) {
            const { col, row, dist } = queue.shift();
            const key = `${col},${row}`;

            if (visited.has(key)) continue;
            visited.add(key);

            const cell = game.atXY(col, row);
            if (isThat(cell)) {
                return { col, row, dist };
            }

            const neighbors = [
                { col: bymod(col - 1, game.cols), row },
                { col: bymod(col + 1, game.cols), row },
                { col, row: bymod(row - 1, game.rows) },
                { col, row: bymod(row + 1, game.rows) }
            ];

            for (const neighbor of neighbors) {
                queue.push({ ...neighbor, dist: dist + 1 });
            }
        }
        if (isThat(game.atXY(fromCol, fromRow))) {
            return { col: fromCol, row: fromRow, dist: 0 };
        }
        return null;
    }

    function scrollToColor(color) {
        console.log("MID: ", getMiddleColRow())
        const mid = getMiddleColRow();

        const closest = findClosestColRow(mid.col, mid.row, color);
        console.log("FIND: ", mid, closest, color)
        if (!closest) return;
        const newScroll = scrollTo({ x: closest.col * cellSize + cellSize / 2, y: closest.row * cellSize + cellSize / 2 }, true);
        const selectedLeftIndex = Math.floor((zoom * newScroll.x + viewSize.x / 2) / contentSize.x);
        const selectedTopIndex = Math.floor((zoom * newScroll.y + viewSize.y / 2) / contentSize.y);

        setSelected({
            pointerId: 0,
            col: closest.col,
            row: closest.row,
            leftIndex: selectedLeftIndex,
            topIndex: selectedTopIndex,
            active: true,
            changedOn: performance.now()
        });
    }

    return (
        <div className="flex flex-col flex-1 bg-black">

            <GameHeader game={game} onBack={onBack} onLevelClick={() => { scrollCenter(true) }}
                onScrollTo={(color) => {
                    scrollToColor(color);
                }}
            >
                {/* S: {msg}
                <br />
                Z:{zoom.toFixed(2)} */}
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
