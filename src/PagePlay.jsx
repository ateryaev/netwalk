import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { cn } from './utils/cn'
import { rnd, bymod, progress } from './utils/helpers';
import { BOTTOM, COLORS, LEFT, RIGHT, SIZE, TOP, TRANS_DURATION } from "./utils/cfg";
import { countProgress, extractDirs, getRtConnections } from './utils/game';
import { GameHeader } from './components/GameHeader';
import { PanZoomView } from './components/PanZoomView';
import { addXY, distXY, divXY, minmax, mulXY, printXY, subXY, XY } from './utils/vectors';
import { getBgImage, getFigureImage, getSourceBgImage } from './utils/canvas';

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
        return { min: 0.65, max: 1.25 };
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
        if (smoothScrollTo) return;

        const centerScroll = XY(
            bymod(contentXY.x - viewSize.x / 2, contentWidth) / zoom,
            bymod(contentXY.y - viewSize.y / 2, contentHeight) / zoom
        )

        if (!smoothly) {
            setScroll(centerScroll);
            return;
        }

        function normalizeScroll(scrolXY, contentXY) {
            const newScroll = XY(
                bymod(scrolXY.x, contentXY.x),
                bymod(scrolXY.y, contentXY.y)
            );

            if (newScroll.x > contentXY.x / 2) newScroll.x -= contentXY.x;
            if (newScroll.y > contentXY.y / 2) newScroll.y -= contentXY.y;
            return newScroll;
        }

        let delta = subXY(centerScroll, scroll);
        delta = normalizeScroll(delta, divXY(contentSize, zoom));
        setSmoothScrollTo(addXY(scroll, delta));
        return;
    }

    useEffect(() => {
        // return;
        if (!smoothScrollTo) return;

        requestAnimationFrame(() => {
            const delta = subXY(smoothScrollTo, scroll);
            if (distXY(delta, XY(0, 0)) <= 5) {
                setScroll({ ...smoothScrollTo });
                setSmoothScrollTo(null);
            } else {
                setScroll((prev) => addXY(prev, mulXY(delta, 0.5)));
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


            const extra = 1; //to see big servers

            //draw bg, selection
            for (let row = 0 - extra; row < viewRows + extra * 0; row++) {
                for (let col = 0 - extra; col < viewCols + extra * 0; col++) {
                    const x = col * SIZE;
                    const y = row * SIZE;
                    const gameCol = bymod(startCol + col, game.cols);
                    const gameRow = bymod(startRow + row, game.rows);
                    ctx.save();
                    ctx.translate(x, y);

                    const cell = game.atXY(gameCol, gameRow);
                    const cell_l = game.atXY(gameCol - 1, gameRow);
                    const cell_t = game.atXY(gameCol, gameRow - 1);
                    const cell_b = game.atXY(gameCol, gameRow + 1);

                    const isOdd = (gameCol + gameRow) % 2 === 0;



                    const gap = 4;
                    let insideW = SIZE - gap * 2;
                    let insideH = cell.source ? SIZE * 2 - gap * 2 : SIZE - gap * 2;


                    const skipRenderInside = (cell.source && cell_t.source === cell.source);//has rendered before

                    // ctx.fillStyle = "#333"
                    // ctx.fillRect(-4, -4, 8, 8);
                    // if (!cell_l.source || cell_l.source !== cell.source) ctx.fillRect(- 4, 6, 8, SIZE - 12);
                    // if (!cell_t.source || cell_t.source !== cell.source) ctx.fillRect(6, - 4, SIZE - 12, 8);

                    if (!skipRenderInside) {
                        if (cell.source) ctx.fillStyle = "#111";
                        else ctx.fillStyle = isOdd ? "#222" : "#333";
                        ctx.fillRect(gap, gap, insideW, insideH);
                        const currentLeftIndex = contentLeftIndex + Math.floor((startCol + col) / game.cols)
                        const currentTopIndex = contentTopIndex + Math.floor((startRow + row) / game.rows)
                        let isSelected = selected.col === gameCol && selected.row === gameRow && selected.leftIndex === currentLeftIndex && selected.topIndex === currentTopIndex;
                        const selectChangeDelta = 1 - minmax((now - selected.changedOn), 0, TRANS_DURATION) / TRANS_DURATION;
                        if (!isSelected && cell.source && cell_b.source === cell.source) {
                            isSelected = selected.col === gameCol && selected.row === gameRow + 1 && selected.leftIndex === currentLeftIndex && selected.topIndex === currentTopIndex;
                        }
                        ctx.fillStyle = "#555";
                        if (isSelected && selectChangeDelta < 1 && !selected.active) {
                            ctx.globalAlpha = selected.active ? 1 - selectChangeDelta : selectChangeDelta;
                            ctx.fillRect(gap, gap, insideW, insideH);
                            ctx.globalAlpha = 1;
                        } else if (isSelected && selected.active) {
                            ctx.fillRect(gap, gap, insideW, insideH);
                        }
                    }

                    ctx.restore();
                }
            }


            // ctx.strokeStyle = "#202020";
            // ctx.lineWidth = 8;

            // ctx.beginPath()
            // for (let row = 0 - extra; row < viewRows + extra * 0; row++) {
            //     const y = row * SIZE;
            //     const gameRow = bymod(startRow + row, game.rows);
            //     if (gameRow !== 0) {
            //         ctx.moveTo(0, y);
            //         ctx.lineTo(viewRows * game.cols * SIZE, y);
            //     }
            // }

            // for (let col = 0 - extra; col < viewCols + extra * 0; col++) {
            //     const x = col * SIZE;
            //     const gameCol = bymod(startCol + col, game.cols);
            //     if (gameCol !== 0) {
            //         ctx.moveTo(x, 0);
            //         ctx.lineTo(x, viewRows * game.rows * SIZE);
            //     }
            //     //ctx.fillRect(x - 2, 0, 4, viewRows * game.cols * SIZE);
            // }
            // ctx.closePath()
            // ctx.stroke();

            //draw frame around 0,0
            ctx.globalAlpha = 1
            ctx.strokeStyle = "#111";
            ctx.lineWidth = 8;

            ctx.beginPath()
            for (let row = 0 - extra; row < viewRows + extra * 0; row++) {
                const y = row * SIZE;
                const gameRow = bymod(startRow + row, game.rows);
                if (gameRow === 0) {
                    ctx.moveTo(0, y);
                    ctx.lineTo(viewRows * game.cols * SIZE, y);
                }
            }

            for (let col = 0 - extra; col < viewCols + extra * 0; col++) {
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

            // for (let row = 0 - extra; row < viewRows + extra * 0; row++) {
            //     for (let col = 0 - extra; col < viewCols + extra * 0; col++) {
            //         const x = col * SIZE;
            //         const y = row * SIZE;
            //         const gameCol = bymod(startCol + col, game.cols);
            //         const gameRow = bymod(startRow + row, game.rows);
            //         // ctx.save();
            //         // ctx.translate(x, y);
            //         if (gameCol === 0 && gameRow === 0) {
            //             ctx.beginPath();
            //             ctx.fillStyle = "#000"
            //             ctx.arc(x, y, 15, 0, 2 * Math.PI);
            //             ctx.closePath()
            //             ctx.fill();

            //             ctx.beginPath();
            //             ctx.fillStyle = "#2a2a2a"
            //             ctx.arc(x, y, 5, 0, 2 * Math.PI);
            //             ctx.closePath()
            //             ctx.fill();
            //         }
            //     }
            // }

            // ctx.strokeStyle = "#181818";
            // ctx.lineWidth = 0;

            // ctx.beginPath()
            // for (let row = 0 - extra; row < viewRows + extra * 0; row++) {
            //     const y = row * SIZE;
            //     const gameRow = bymod(startRow + row, game.rows);
            //     if (gameRow === 0) {
            //         ctx.moveTo(0, y);
            //         ctx.lineTo(viewRows * game.cols * SIZE, y);
            //     }
            // }

            // for (let col = 0 - extra; col < viewCols + extra * 0; col++) {
            //     const x = col * SIZE;
            //     const gameCol = bymod(startCol + col, game.cols);
            //     if (gameCol === 0) {
            //         ctx.moveTo(x, 0);
            //         ctx.lineTo(x, viewRows * game.rows * SIZE);
            //     }
            //     //ctx.fillRect(x - 2, 0, 4, viewRows * game.cols * SIZE);
            // }
            // ctx.closePath()
            // ctx.stroke();


            ctx.globalAlpha = 1;

            //draw cells
            for (let row = 0 - extra; row < viewRows + extra * 0; row++) {
                for (let col = 0 - extra; col < viewCols + extra * 0; col++) {

                    let x = col * SIZE;
                    let y = row * SIZE;
                    ctx.save();
                    ctx.translate(x, y);
                    x = y = 0;
                    const gameCol = bymod(startCol + col, game.cols);
                    const gameRow = bymod(startRow + row, game.rows);

                    const cell = game.atXY(gameCol, gameRow);
                    const isEnd = (cell.figure === 0b1000 || cell.figure === 0b0100 || cell.figure === 0b0010 || cell.figure === 0b0001);




                    const conns = getRtConnections(game, now, gameCol, gameRow);

                    if (cell.source) {
                        const rotateProgress = (progress(cell.rotatedOn, TRANS_DURATION * 1) - 1);
                        const cellTop = game.atXY(gameCol, gameRow - 1);
                        const cellBottom = game.atXY(gameCol, gameRow + 1);

                        if (cellTop.source === cell.source) {
                            const figure2rotate = cell.figure & (BOTTOM | LEFT);
                            const figure2down = cell.figure & (RIGHT);
                            const img2rotate = getFigureImage(figure2rotate, COLORS[cell.source], true, conns);
                            const img2down = getFigureImage(figure2down, COLORS[cell.source], true, conns);
                            ctx.save();
                            ctx.translate(SIZE / 2, SIZE / 2);       // move origin
                            ctx.rotate(rotateProgress * Math.PI / 2);         // rotate (radians)
                            img2rotate && ctx.drawImage(img2rotate, -SIZE / 2 - 1, -SIZE / 2 - 1, SIZE + 2, SIZE + 2);
                            ctx.restore();
                            img2down && ctx.drawImage(img2down, -1, SIZE * (rotateProgress) - 1, SIZE + 2, SIZE + 2);
                        } else if (cellBottom.source === cell.source) {
                            const figure2rotate = cell.figure & (TOP | RIGHT);
                            const figure2up = cell.figure & (LEFT);
                            const img2rotate = getFigureImage(figure2rotate, COLORS[cell.source], true, conns);
                            const img2up = getFigureImage(figure2up, COLORS[cell.source], true, conns);
                            ctx.save();
                            ctx.translate(SIZE / 2, SIZE / 2);       // move origin
                            ctx.rotate(rotateProgress * Math.PI / 2);         // rotate (radians)
                            img2rotate && ctx.drawImage(img2rotate, -SIZE / 2 - 1, -SIZE / 2 - 1, SIZE + 2, SIZE + 2);
                            ctx.restore();
                            img2up && ctx.drawImage(img2up, -1, -SIZE * (rotateProgress) - 1, SIZE + 2, SIZE + 2);
                        }

                    } else if (!cell.source) {
                        const angle = (progress(cell.rotatedOn, TRANS_DURATION * 1) - 1) * Math.PI / 2;
                        const switchingDelta = progress(cell.switchedOn, TRANS_DURATION * 2);
                        ctx.save();
                        ctx.translate(SIZE / 2, SIZE / 2);       // move origin
                        ctx.rotate(angle);         // rotate (radians)

                        if (switchingDelta < 1) {
                            const imgBefore = getFigureImage(cell.figure, COLORS[cell.onBefore], cell.onBefore === 1 || cell.onBefore === 2, conns);
                            if (imgBefore) {
                                ctx.drawImage(imgBefore, -SIZE / 2 - 1, -SIZE / 2 - 1, SIZE + 2, SIZE + 2);
                            }
                        }

                        const img = getFigureImage(cell.figure, COLORS[cell.on], cell.on === 1 || cell.on === 2, conns);
                        if (img) {
                            ctx.globalAlpha = switchingDelta
                            ctx.drawImage(img, -SIZE / 2 - 1, -SIZE / 2 - 1, SIZE + 2, SIZE + 2);
                        }
                        ctx.restore();



                        const showing = minmax(switchingDelta * 2, 1, 2) - 1;
                        const hiding = minmax(switchingDelta * 2, 0, 1);

                        if (isEnd && cell.on) {
                            ctx.globalAlpha = showing;
                            ctx.beginPath();
                            ctx.moveTo(SIZE / 2, SIZE / 2);
                            ctx.lineTo(SIZE / 2, SIZE / 2)
                            ctx.lineWidth = 20 * showing;
                            ctx.lineJoin = "round";
                            ctx.lineCap = "round";
                            ctx.strokeStyle = "#fff"
                            ctx.stroke();

                            ctx.beginPath();
                            ctx.moveTo(SIZE / 2, SIZE / 2);
                            ctx.lineTo(SIZE / 2, SIZE / 2)
                            ctx.lineWidth = 5 * showing;
                            ctx.lineJoin = "round";
                            ctx.lineCap = "round";
                            ctx.strokeStyle = "#111"
                            ctx.stroke();
                        }
                        if (isEnd && cell.onBefore) {
                            ctx.globalAlpha = (1 - hiding);
                            ctx.beginPath();
                            ctx.moveTo(SIZE / 2, SIZE / 2);
                            ctx.lineTo(SIZE / 2, SIZE / 2)
                            ctx.lineWidth = 20 * (1 - hiding);
                            ctx.lineJoin = "round";
                            ctx.lineCap = "round";
                            ctx.strokeStyle = "#fff"
                            ctx.stroke();

                            ctx.beginPath();
                            ctx.moveTo(SIZE / 2, SIZE / 2);
                            ctx.lineTo(SIZE / 2, SIZE / 2)
                            ctx.lineWidth = 5 * (1 - hiding);
                            ctx.lineJoin = "round";
                            ctx.lineCap = "round";
                            ctx.strokeStyle = "#111"
                            ctx.stroke();
                        }

                        if (isEnd && !cell.on) {
                            ctx.globalAlpha = 0.5
                            const d = 5 * showing;
                            ctx.beginPath();
                            ctx.moveTo(SIZE / 2 - d, SIZE / 2 - d);
                            ctx.lineTo(SIZE / 2 + d, SIZE / 2 + d)
                            ctx.moveTo(SIZE / 2 + d, SIZE / 2 - d);
                            ctx.lineTo(SIZE / 2 - d, SIZE / 2 + d)
                            ctx.lineWidth = 2.5;
                            ctx.lineJoin = "round";
                            ctx.lineCap = "round";
                            ctx.strokeStyle = "#111"
                            ctx.stroke();
                        }
                        if (isEnd && !cell.onBefore) {
                            ctx.globalAlpha = (1 - hiding)
                            const d = 5 * (1 - hiding);
                            ctx.beginPath();
                            ctx.moveTo(SIZE / 2 - d, SIZE / 2 - d);
                            ctx.lineTo(SIZE / 2 + d, SIZE / 2 + d)
                            ctx.moveTo(SIZE / 2 + d, SIZE / 2 - d);
                            ctx.lineTo(SIZE / 2 - d, SIZE / 2 + d)
                            ctx.lineWidth = 2.5;
                            ctx.lineJoin = "round";
                            ctx.lineCap = "round";
                            ctx.strokeStyle = "#111"
                            ctx.stroke();
                        }
                    }

                    ctx.globalAlpha = 1

                    if (cell.source && game.atXY(gameCol, gameRow - 1).source) {
                        const sourceImg = getSourceBgImage(COLORS[cell.on]);
                        if (sourceImg) {
                            ctx.drawImage(sourceImg, 0, -SIZE, SIZE, SIZE * 2);
                        }
                    }
                    ctx.restore(); //translate(x,y)
                }
            }

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
    //}, [contentTopIndex, selected, game, contentLeftIndex, viewCols, viewRows, startRow, startCol]);
    return (
        <div className="flex flex-col flex-1 bg-black">

            <GameHeader game={game} onBack={onBack} onLevelClick={() => { scrollCenter(true) }} >
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
                <div
                    className='absolute bg-red-200/50x origin-top-left'
                    style={{
                        xtranslate: `${-startColOffset * SIZE * zoom}px ${-startRowOffset * SIZE * zoom}px`,
                        width: `${viewSize.x / zoom}px`,
                        height: `${viewSize.y / zoom}px`,
                        scale: `${zoom}`
                    }}
                >

                    {/* {viewCells} */}

                </div>
                {/* <div className='absolute z-50 border-8 border-black/30 m-auto top-0 left-0 right-0 bottom-0 pointer-events-none
                ring-[1000px] ring-neutral-300 /90'
                    style={{
                        width: `${game.cols * cellSize + cellSize}px`,
                        height: `${game.rows * cellSize + cellSize}px`,
                    }}
                ></div> */}

            </PanZoomView >
            <div className='p-1 text-[10px] font-bold text-center ring-8 ring-black/20 z-40 text-[#aaa] bg-[#eee] font-mono uppercase text-ellipsis whitespace-nowrap overflow-hidden'>
                Netwalk v0.1 by Anton Teryaev, 2025

            </div>

        </div >
    )
}
