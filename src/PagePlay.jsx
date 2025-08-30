import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { cn } from './utils/cn'

import { GameCell } from './components/GameCell';
import { rnd, bymod } from './utils/helpers';
import { GameCellBg } from './components/GameCellBg';
import { GameCellSource } from './components/GameCellSource';
import { SIZE } from "./utils/cfg";
import { countEnds, countEndsOn, countProgress } from './utils/game';
import { GameHeader } from './components/GameHeader';
import { PanZoomView } from './components/PanZoomView';
import { addXY, distXY, divXY, minmax, mulXY, printXY, subXY, XY } from './utils/vectors';

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

                const style = {
                    translate: `${-startColOffset * cellSize + col * cellSize}px ${-startRowOffset * cellSize + row * cellSize}px`,
                    width: `${cellSize}px`, height: `${cell.source ? cellSize * 2 : cellSize}px`,
                }
                //const gameIndex = colRowToIndex(gameCol, gameRows, gameCols);



                //if (!cell) continue; // Skip if the cell is not defined
                if (cell.source && game.atXY(gameCol, gameRow - 1).source) continue;
                let isSelected = selected.col === gameCol && selected.row === gameRow && selected.leftIndex === currentLeftIndex && selected.topIndex === currentTopIndex;
                if (cell.source && selected.col === gameCol && selected.row === gameRow + 1 && selected.leftIndex === currentLeftIndex && selected.topIndex === currentTopIndex) {
                    isSelected = true;
                }

                items.push(<GameCellBg key={`bg_${gameCol}:${gameRow}:${currentLeftIndex}:${currentTopIndex}`}
                    selected={isSelected}
                    col={gameCol} row={gameRow}
                    style={style}
                    cols={game.cols} rows={game.rows}
                    source={!!cell.source}
                    movable={cell.source || (cell.figure !== 0 && cell.figure !== 15)}
                    empty={cell.figure === 0}
                //size={XY(cellSize, cell.source ? cellSize * 2 : cellSize)}
                />);
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
                    size={cellSize} />);

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
                    size={cellSize} />);

            }
            //console.log(`Row ${row}: ${str}`);
        }
        return items;//.map((child, index) => (<Fragment key={`${index}`}>{child}</Fragment>));
    }, [contentTopIndex, selected, game, contentLeftIndex, viewCols, viewRows, game.cols, game.rows, startRow, startCol, startRowOffset, startColOffset, cellSize]);




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
        game.endsOn = countEndsOn(game);
        game.ends = countEnds(game);
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
        let newZoom = minmax(zoomDelta * zoom, 0.75, 2);
        zoomDelta = newZoom / zoom;
        const scrollDelta = mulXY(coors, -(1 - zoomDelta) / (zoomDelta * zoom));
        setScroll((prev) => addXY(prev, scrollDelta));
        setZoom((prev) => minmax(prev * zoomDelta, 0.75, 2));
    }

    function handleResize(newSize) {
        setViewSize({ ...newSize });
    }

    return (
        <div className="flex flex-col flex-1">

            <GameHeader game={game} onBack={onBack} onLevelClick={() => { scrollCenter(true) }} >
                {/* S: {msg}
                <br />
                Z:{zoom.toFixed(2)} */}
            </GameHeader>
            {/* <div className='p-4' onClick={handleTest}>test</div> */}
            <PanZoomView
                className={cn("relative bg-black flex-1 opacity-0 transition-all delay-75 duration-500", isViewSizeReady && "opacity-100")}
                onPress={handleDown}
                onRelease={handleUp}
                onResize={handleResize}
                onScroll={handleScroll}
                onZoom={handleZoom}
            >
                {viewCells}
            </PanZoomView>
            <div className='p-1 text-xs text-center ring-8 ring-black/20 z-10'>
                Netwalk v1.0, by Anton Ateryaev, 2025
            </div>

        </div >
    )
}
