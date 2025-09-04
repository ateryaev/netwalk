import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { cn } from './utils/cn'

import { GameCell } from './components/GameCell';
import { rnd, bymod } from './utils/helpers';
import { GameCellBg } from './components/GameCellBg';
import { GameCellSource } from './components/GameCellSource';
import { BOTTOM, COLORS, RIGHT, SIZE, TOP, TRANS_DURATION } from "./utils/cfg";
import { countProgress, extractDirs, getRtConnections } from './utils/game';
import { GameHeader } from './components/GameHeader';
import { PanZoomView } from './components/PanZoomView';
import { addXY, distXY, divXY, minmax, mulXY, printXY, subXY, XY } from './utils/vectors';
import { createFigureSprite, drawDir, drawPixels, getBgImage, getFigureImage, getFigureSprite, getSourceBgImage, getSourceSprite } from './utils/canvas';

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
    const [selected, setSelected] = useState({ col: -1, row: -1, leftIndex: -1, topIndex: -1, scrollLeft: 0, scrollTop: 0 });

    const [viewSize, setViewSize] = useState(XY(0, 0));

    const zoomRange = useMemo(() => {
        const longestSize = Math.max(viewSize.x, viewSize.y);
        const shortestSize = Math.min(viewSize.x, viewSize.y);
        //max 12 cells for longest size
        //min 6 cells  for longest size
        const minZoom = longestSize / (12 * SIZE);
        const maxZoom = longestSize / (6 * SIZE);
        //return { min: minZoom, max: maxZoom };
        return { min: 0.5, max: 2 };
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


    const viewCells = useMemo(() => {
        // console.log("CALCULATING VIEW CELLS", viewCols, viewRows, startCol, startRow, gameCols, gameRows);
        const items = [];

        const extra = 1; //to see big servers

        for (let row = 0 - extra; row < viewRows + extra * 0; row++) {
            for (let col = 0 - extra; col < viewCols + extra * 0; col++) {

                const gameCol = bymod(startCol + col, game.cols);
                const gameRow = bymod(startRow + row, game.rows);

                const currentLeftIndex = contentLeftIndex + Math.floor((startCol + col) / game.cols)
                const currentTopIndex = contentTopIndex + Math.floor((startRow + row) / game.rows)

                const cell = game.atXY(gameCol, gameRow);

                // const style = {
                //     translate: `${-startColOffset * cellSize + col * cellSize}px ${-startRowOffset * cellSize + row * cellSize}px`,
                //     width: `${cellSize}px`, height: `${cell.source ? cellSize * 2 : cellSize}px`,
                // }
                const style = {
                    translate: `${col * SIZE}px ${row * SIZE}px`,
                    width: `${SIZE}px`,
                    height: `${cell.source ? SIZE * 2 : SIZE}px`,
                }

                if (cell.source && game.atXY(gameCol, gameRow - 1).source) continue;

                let isSelected = selected.col === gameCol && selected.row === gameRow && selected.leftIndex === currentLeftIndex && selected.topIndex === currentTopIndex;
                if (cell.source && selected.col === gameCol && selected.row === gameRow + 1 && selected.leftIndex === currentLeftIndex && selected.topIndex === currentTopIndex) {
                    isSelected = true;
                }

                //if (cell.source && game.atXY(gameCol - 1, gameRow).source) continue;

                //continue;
                !cell.source && items.push(<GameCell key={`${gameCol}:${gameRow}:${currentLeftIndex}:${currentTopIndex}`}
                    figure={cell.figure}
                    conectedTo={{
                        top: game.isConnected(gameCol, gameRow, 0b1000),
                        right: game.isConnected(gameCol, gameRow, 0b0100),
                        bottom: game.isConnected(gameCol, gameRow, 0b0010),
                        left: game.isConnected(gameCol, gameRow, 0b0001),
                    }}
                    on={cell.on || false}
                    data={cell}
                    style={style}
                    size={SIZE} />);

                cell.source && items.push(<GameCellSource key={`source_${gameCol}:${gameRow}:${currentLeftIndex}:${currentTopIndex}`}
                    //figure1={posedFigure(cell.figure, cell.pos)}
                    figure1={cell.figure}
                    figure2={game.atXY(gameCol, gameRow + 1).figure}
                    conectedTo1={{
                        top: game.isConnected(gameCol, gameRow, 0b1000),
                        right: game.isConnected(gameCol, gameRow, 0b0100),
                        bottom: game.isConnected(gameCol, gameRow, 0b0010),
                        left: game.isConnected(gameCol, gameRow, 0b0001),
                    }}
                    conectedTo2={{
                        top: game.isConnected(gameCol, gameRow + 1, 0b1000),
                        right: game.isConnected(gameCol, gameRow + 1, 0b0100),
                        bottom: game.isConnected(gameCol, gameRow + 1, 0b0010),
                        left: game.isConnected(gameCol, gameRow + 1, 0b0001),
                    }}
                    on={cell.on || false}
                    data={cell}
                    style={style}
                    size={SIZE} />);

            }
            //console.log(`Row ${row}: ${str}`);
        }
        return items;//.map((child, index) => (<Fragment key={`${index}`}>{child}</Fragment>));
    }, [contentTopIndex, selected, game, contentLeftIndex, viewCols, viewRows, startRow, startCol]);




    const oldViewSize = useRef(null);

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
            col: selectedCol, row: selectedRow,
            leftIndex: selectedLeftIndex, topIndex: selectedTopIndex,
            //scrollLeft: scrollLeft, scrollTop: scrollTop
        });
        setMsg("DOWN:" + pointerId)
        console.log(`DOWN: (${selectedCol}, ${selectedRow}) / (${selectedLeftIndex}, ${selectedTopIndex})`);
    }

    function handleUp({ x, y }, pointerId, noClick) {

        setMsg("UUPP:" + pointerId + "/" + selected.pointerId + ":" + noClick)
        if (selected.pointerId !== pointerId) return;

        setSelected({
            ...selected, col: -1, row: -1
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


    function drawSourceRect(ctx, x, y, w, h) {

        // ctx.beginPath();
        // ctx.rect(x + 24, y + 24, w - 24 * 2, h - 24 * 2);
        // ctx.fillStyle = "#333";
        // ctx.fill();

        ctx.beginPath();
        ctx.rect(x + 50, y + 50, w - 50 * 2, h - 50 * 2);
        // makes line ends and corners rounded
        ctx.lineWidth = 60;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        ctx.beginPath();
        ctx.rect(x + 50, y + 50, w - 50 * 2, h - 50 * 2);
        // makes line ends and corners rounded
        ctx.lineWidth = 30;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.fillStyle = "#333"
        ctx.strokeStyle = "#333"
        ctx.stroke(); ctx.fill();

    }
    //draw on canvas

    const [update, setUpdate] = useState(0);
    useEffect(() => {
        if (!canvasRef.current) return;
        //requestAnimationFrame(() => {
        canvasRef.current.width = viewSize.x;
        canvasRef.current.height = viewSize.y;
        //width={`${viewSize.x / 2 / zoom}`} height={`${viewSize.y / 2 / zoom}`}
        const ctx = canvasRef.current.getContext('2d');
        //ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        let animationFrame = null;

        function render() {
            // console.log("RT:", game.atXY(0, 0), getRtConnections(game, performance.now(), 0, 0))
            // a.b.c
            //console.time('RENDER');
            const now = performance.now();
            ctx.save();
            ctx.fillStyle = "#000";
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

            for (let row = 0 - extra; row < viewRows + extra * 0; row++) {
                for (let col = 0 - extra; col < viewCols + extra * 0; col++) {

                    const x = col * SIZE;
                    const y = row * SIZE;
                    const gameCol = bymod(startCol + col, game.cols);
                    const gameRow = bymod(startRow + row, game.rows);

                    const currentLeftIndex = contentLeftIndex + Math.floor((startCol + col) / game.cols)
                    const currentTopIndex = contentTopIndex + Math.floor((startRow + row) / game.rows)

                    const cell = game.atXY(gameCol, gameRow);

                    // if ((!cell.source || !game.atXY(gameCol, gameRow - 1).source) && (gameCol + gameRow) % 2) {
                    //     ctx.fillStyle = cell.source ? "#222" : "#333";
                    //     ctx.fillRect(x, y, SIZE, cell.source ? SIZE * 2 : SIZE);
                    // }

                    let isSelected = selected.col === gameCol && selected.row === gameRow && selected.leftIndex === currentLeftIndex && selected.topIndex === currentTopIndex;
                    // if (cell.source && selected.col === gameCol && selected.row === gameRow + 1 && selected.leftIndex === currentLeftIndex && selected.topIndex === currentTopIndex) {
                    //     isSelected = true;
                    // }
                    if (isSelected) {
                        ctx.fillStyle = "#666";
                        //ctx.fillRect(x, y, SIZE, cell.source > 0 ? SIZE * 2 : SIZE);
                    }



                    let angle = 0;
                    const timeMs = now - cell.rotatedOn;
                    //console.log("MS", timeMs.toFixed(0))
                    if (timeMs < TRANS_DURATION && !cell.source) {
                        angle = -(1 - timeMs / TRANS_DURATION);//* Math.PI / 2;
                        //setUpdate((prev) => prev + 1);
                    }

                    // extractDirs(cell.figure).forEach((dir) => {
                    //drawDir(ctx, x, y, dir, angle, cell.on)
                    // ctx.save()
                    // ctx.translate(x, y);



                    // //console.log(getFigureImage())
                    // const img = getFigureImage(cell.figure, COLORS[cell.on]);

                    // img && ctx.drawImage(img, 0, 0, SIZE, SIZE);

                    // ctx.restore()


                    const bgImg = getBgImage(1 === (gameCol + gameRow) % 2);
                    if (bgImg) {
                        ctx.save();
                        ctx.translate(x, y);       // move origin
                        ctx.drawImage(bgImg, -1, -1, SIZE + 2, SIZE + 2);
                        ctx.restore();
                    }



                    const conns = getRtConnections(game, now, gameCol, gameRow);
                    const img = getFigureImage(cell.figure, COLORS[cell.on], cell.on === 1 || cell.on === 2, conns);
                    if (img) {
                        ctx.save();
                        ctx.translate(x + SIZE / 2, y + SIZE / 2);       // move origin
                        ctx.rotate(angle);         // rotate (radians)
                        ctx.drawImage(img, -SIZE / 2 - 2, -SIZE / 2 - 2, SIZE + 4, SIZE + 4);
                        ctx.restore();
                    }

                    // if (cell.source && game.atXY(gameCol, gameRow + 1).source) {
                    //     const sourceImg = getSourceBgImage(COLORS[cell.on]);
                    //     if (sourceImg) {
                    //         ctx.save();
                    //         ctx.translate(x, y);       // move origin
                    //         ctx.drawImage(sourceImg, 0, 0, SIZE, SIZE * 2);
                    //         ctx.restore();
                    //     }
                    // }
                    if (cell.source && game.atXY(gameCol, gameRow - 1).source) {
                        const sourceImg = getSourceBgImage(COLORS[cell.on]);
                        if (sourceImg) {
                            ctx.save();
                            ctx.translate(x, y);       // move origin
                            ctx.drawImage(sourceImg, 0, -SIZE, SIZE, SIZE * 2);
                            ctx.restore();
                        }
                    }


                    // })


                    // const conns = getRtConnections(game, now, gameCol, gameRow);
                    // if (conns & RIGHT)
                    //     drawPixels(ctx, x, y, [[5, 2]], COLORS[cell.on], 20, 1)
                    // if (conns & BOTTOM)
                    //     drawPixels(ctx, x, y, [[2, 5]], COLORS[cell.on], 20, 1)

                    // const isEnd = (cell.figure === 0b1000 || cell.figure === 0b0100 || cell.figure === 0b0010 || cell.figure === 0b0001);
                    // if (!isEnd)
                    //     drawPixels(ctx, x, y, [[2, 2]], COLORS[cell.on], 20, 1)
                    // if (isEnd) {
                    //     if (cell.on) drawPixels(ctx, x, y, [[2, 2]], "#fff", 20, 1)
                    //     if (!cell.on) drawPixels(ctx, x, y, [[2, 2]], COLORS[cell.on], 20, 1)
                    //     drawPixels(ctx, x, y, [[2, 1], [2, 3], [1, 2], [3, 2]], COLORS[cell.on], 20, 1)
                    // }


                    // if (cell.source && !game.atXY(gameCol, gameRow - 1).source) {
                    //     drawPixels(ctx, x, y, [
                    //         [1, 1], [2, 1], [3, 1],
                    //         [1, 2], [3, 2],
                    //         [1, 3], [3, 3],
                    //         [1, 4], [3, 4],
                    //         [1, 5], [3, 5],], COLORS[cell.on], 20, 1)
                    //     drawPixels(ctx, x, y, [[2, 2], [2, 3], [2, 4], [2, 5]], "#fff", 20, 1)
                    // }

                    // if (cell.source && !game.atXY(gameCol, gameRow + 1).source) {
                    //     drawPixels(ctx, x, y, [
                    //         [1, 0], [3, 0],
                    //         [1, 1], [3, 1],
                    //         [1, 2], [3, 2],
                    //         [1, 3], [2, 3], [3, 3],], COLORS[cell.on], 20, 1)
                    //     drawPixels(ctx, x, y, [[2, 0], [2, 1], [2, 2]], "#fff", 20, 1)
                    // }

                    //const image = getFigureSprite(cell.figure, getRtConnections(game, now, gameCol, gameRow), cell.on)
                    // //const image = getFigureSprite(cell.figure, cell.connections, cell.on)

                    //ctx.drawImage(image, x, y, SIZE, SIZE);
                    // ctx.save();
                    // ctx.translate(x + SIZE / 2, y + SIZE / 2);       // move origin
                    // ctx.rotate(angle);         // rotate (radians)
                    // ctx.drawImage(image, -SIZE / 2, -SIZE / 2, SIZE, SIZE);
                    // ctx.restore();

                    // if (cell.source && !game.atXY(gameCol, gameRow - 1).source) {
                    //     const sourceImage = getSourceSprite(0, 0, 0, 0, cell.source);
                    // }

                    // if (cell.source && !game.atXY(gameCol, gameRow + 1).source) {
                    //     const sourceImage = getSourceSprite(0, 0, 0, 0, cell.source);
                    //     //ctx.drawImage(sourceImage, x, y, SIZE, SIZE * 2);
                    //     ctx.drawImage(sourceImage, 0, SIZE * 2, SIZE * 2, SIZE * 2, x, y, SIZE, SIZE);
                    //     // ctx.strokeStyle = COLORS.at(cell.on)
                    //     // drawSourceRect(ctx, x, y, SIZE, cell.source ? SIZE * 2 : SIZE);
                    // }

                    // const sourceImage = getSourceSprite(0, 0, 0, 0, cell.source);

                }
            }
            ctx.globalAlpha = 0.0;
            ctx.fillStyle = "#fff";
            for (let row = 0 - extra; row < viewRows + extra * 0; row++) {
                const y = row * SIZE;

                ctx.fillRect(0, y - 2, viewCols * game.cols * SIZE, 4);
            }
            for (let col = 0 - extra; col < viewCols + extra * 0; col++) {
                const x = col * SIZE;

                ctx.fillRect(x - 2, 0, 4, viewRows * game.cols * SIZE);
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
        <div className="flex flex-col flex-1">

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
                xstyle={{ background: "#222", backgroundImage: 'url(/chess.bg.svg)', backgroundSize: `${cellSize * 2}px ${cellSize * 2}px`, backgroundPosition: `-${scrollLeftAbs}px -${scrollTopAbs}px` }}
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
            <div className='p-1 text-xs text-center ring-8 ring-black/10 z-10 text-black'>
                Netwalk v1.0, by Anton Ateryaev, 2025

            </div>

        </div >
    )
}
