import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { cn } from './utils/cn'

import { EndlessScrollView } from './components/EndlessScrollView';
import { GameCell } from './components/GameCell';
import { rnd, bymod } from './utils/helpers';
import { createGame } from './utils/gameplay';
import { GameCellBg } from './components/GameCellBg';
import { GameCellSource } from './components/GameCellSource';
import { SIZE } from "./utils/cfg";
import { countEnds, countEndsOn } from './utils/game';
import { GameHeader } from './components/GameHeader';

export function PagePlay({ game, onGameChange, onBack }) {

    const viewRef = useRef(null);

    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

    //const [game, setGame] = useState(GAME_1);
    const [selected, setSelected] = useState({ col: -1, row: -1, leftIndex: -1, topIndex: -1, scrollLeft: 0, scrollTop: 0 });

    //const [contentLeftIndex, setContentLeftIndex] = useState(0);
    //const [contentTopIndex, setContentTopIndex] = useState(0);
    // const [gameCols, setGameCols] = useState(game.cols);
    // const [gameRows, setGameRows] = useState(game.rows);


    const [cellSize, setCellSize] = useState(SIZE);
    const [viewWidth, setViewWidth] = useState(null);
    const [viewHeight, setViewHeight] = useState(null);

    const contentWidth = useMemo(() => (cellSize * game.cols), [game.cols, cellSize]);
    const contentHeight = useMemo(() => (cellSize * game.rows), [game.rows, cellSize]);

    const viewCols = useMemo(() => Math.ceil(viewWidth / cellSize) + 1, [viewWidth, cellSize]);
    const viewRows = useMemo(() => Math.ceil(viewHeight / cellSize) + 1, [viewHeight, cellSize]);

    //   newLeft = (scrollLeft % contentWidth + contentWidth) % contentWidth;
    // newTop = (scrollTop % contentHeight + contentHeight) % contentHeight;

    // const fragments = cellSize / 1;
    // const scrollLeft10 = useMemo(() => (Math.round(scrollLeft / (cellSize / fragments)) * cellSize / fragments), [scrollLeft, cellSize]);
    // const scrollTop10 = useMemo(() => (Math.round(scrollTop / (cellSize / fragments)) * cellSize / fragments), [scrollTop, cellSize]);

    // setContentLeftIndex(Math.floor(newScrollLeft / contentWidth));
    //   setContentTopIndex(Math.floor(newScrollTop / contentHeight));

    const contentLeftIndex = useMemo(() => Math.floor(scrollLeft / contentWidth), [scrollLeft, contentWidth]);
    const contentTopIndex = useMemo(() => Math.floor(scrollTop / contentHeight), [scrollTop, contentHeight]);

    const scrollLeftAbs = useMemo(() => (scrollLeft % contentWidth + contentWidth) % contentWidth, [scrollLeft, contentHeight]);
    const scrollTopAbs = useMemo(() => (scrollTop % contentHeight + contentHeight) % contentHeight, [scrollTop, contentHeight]);
    // Calculate the starting column and row based on the scroll position
    const startCol = useMemo(() => Math.floor(scrollLeftAbs / cellSize), [scrollLeftAbs, cellSize]);
    const startRow = useMemo(() => Math.floor(scrollTopAbs / cellSize), [scrollTopAbs, cellSize]);

    // Calculate the starting column and row offsets within the cell
    const startColOffset = useMemo(() => (scrollLeftAbs % cellSize) / cellSize, [scrollLeftAbs, cellSize]);
    const startRowOffset = useMemo(() => (scrollTopAbs % cellSize) / cellSize, [scrollTopAbs, cellSize]);

    function handleCellClick(col, row) {
        // console.log(`Clicked on cell at col: ${col}, row: ${row}`, game);
        //game.atXY(col, row).value += 1;
        game.rotateAtXY(col, row);
        // game.atXY(col, row).pos += 1;
        // game.atXY(col, row).pos %= 4; // Wrap around the position
        game.updateOnStates();
        console.log("ENDS ON 2", game.endsOn);
        onGameChange({ ...game }); // Trigger a re-render by creating a new array
    }


    const viewCells = useMemo(() => {
        // console.log("CALCULATING VIEW CELLS", viewCols, viewRows, startCol, startRow, gameCols, gameRows);
        const items = [];

        const extra = 0;
        for (let row = 0 - extra; row < viewRows + extra; row++) {
            for (let col = 0 - extra; col < viewCols + extra; col++) {

                const gameCol = bymod(startCol + col, game.cols);
                const gameRow = bymod(startRow + row, game.rows);

                const currentLeftIndex = contentLeftIndex + Math.floor((startCol + col) / game.cols)
                const currentTopIndex = contentTopIndex + Math.floor((startRow + row) / game.rows)

                const style = {
                    translate: `${-startColOffset * cellSize + col * cellSize}px ${-startRowOffset * cellSize + row * cellSize}px`,
                }
                //const gameIndex = colRowToIndex(gameCol, gameRows, gameCols);


                const cell = game.atXY(gameCol, gameRow);
                //if (!cell) continue; // Skip if the cell is not defined
                if (cell.source && game.atXY(gameCol, gameRow - 1).source) continue;

                items.push(<GameCellBg key={`bg_${gameCol}:${gameRow}:${currentLeftIndex}:${currentTopIndex}`}
                    selected={selected.col === gameCol && selected.row === gameRow && selected.leftIndex === currentLeftIndex && selected.topIndex === currentTopIndex}
                    col={gameCol} row={gameRow} style={style}
                    cols={game.cols} rows={game.rows}
                    source={!!cell.source}
                    movable={cell.source || (cell.figure !== 0 && cell.figure !== 15)}
                    empty={cell.figure === 0}
                />);
                //if (cell.source && game.atXY(gameCol - 1, gameRow).source) continue;

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
                    style={style} />);

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
                    style={style} />);

            }
            //console.log(`Row ${row}: ${str}`);
        }
        return items;//.map((child, index) => (<Fragment key={`${index}`}>{child}</Fragment>));
    }, [contentTopIndex, selected, game, contentLeftIndex, viewCols, viewRows, game.cols, game.rows, startRow, startCol, startRowOffset, startColOffset, cellSize]);

    const handleScroll = (newScrollLeft, newScrollTop) => {
        setScrollLeft((prev) => prev + newScrollLeft);
        setScrollTop((prev) => prev + newScrollTop);
    }

    const oldViewSize = useRef(null);

    useEffect(() => {
        const resizeObserver = new ResizeObserver((e) => {
            console.log("RESIZE OBSERVER", e);
            if (!viewRef.current) return;
            const rect = viewRef.current.getBoundingClientRect();
            setViewHeight(rect.height);
            setViewWidth(rect.width);
        });
        resizeObserver.observe(viewRef.current);
        return () => { viewRef.current && resizeObserver.unobserve(viewRef.current) };
    }, [])

    useEffect(() => {
        //console.log("MOUNTED", mounted.current, viewWidth);
        if (!viewWidth || !viewHeight) return;

        if (oldViewSize.current === null) {
            //first show, just scroll to center
            oldViewSize.current = { width: viewWidth, height: viewHeight };
            scrollCenter(true);
            return;
        }

        // if (!mounted.current) return;
        //scrollCenter(true);
        const deltaX = oldViewSize.current.width - viewWidth;
        const deltaY = oldViewSize.current.height - viewHeight;
        setScrollLeft((prev) => { return prev + deltaX / 2 });
        setScrollTop((prev) => { return prev + deltaY / 2 });
        oldViewSize.current = { width: viewWidth, height: viewHeight };
    }, [viewHeight, viewWidth]);

    function handleDown(x, y) {
        const selectedCol = Math.floor(bymod(x / cellSize, game.cols));
        const selectedRow = Math.floor(bymod(y / cellSize, game.rows));
        const selectedLeftIndex = Math.floor(x / contentWidth);
        const selectedTopIndex = Math.floor(y / contentHeight);

        setSelected({
            col: selectedCol, row: selectedRow,
            leftIndex: selectedLeftIndex, topIndex: selectedTopIndex,
            scrollLeft: scrollLeft, scrollTop: scrollTop
        });
        console.log(`DOWN: (${selectedCol}, ${selectedRow}) / (${selectedLeftIndex}, ${selectedTopIndex})`);
    }

    const handleUp = useCallback(() => {

        if (selected.col === -1 || selected.row === -1) return; // No cell was selected

        const deltaScrollLeft = scrollLeft - selected.scrollLeft;
        const deltaScrollTop = scrollTop - selected.scrollTop;
        if (deltaScrollLeft === 0 && deltaScrollTop === 0) {
            // handleCellClick(selected.col, selected.row);
            game.rotateAtXY(selected.col, selected.row);
            // game.atXY(col, row).pos += 1;
            // game.atXY(col, row).pos %= 4; // Wrap around the position
            game.updateOnStates();
            game.endsOn = countEndsOn(game);
            game.ends = countEnds(game);
            console.log("ENDS ON 2", game.endsOn);
            onGameChange({ ...game }); // Trig
        }
        setSelected({ col: -1, row: -1, leftIndex: -1, topIndex: -1, scrollLeft: 0, scrollTop: 0 });

    }, [scrollLeft, scrollTop, selected, game]);

    function restart(cols, rows) {

        let newGame = createGame(cols, rows);
        newGame.shufle();
        newGame.updateOnStates();
        onGameChange(newGame);
        scrollCenter();
    }

    function shufle() {
        game.shufle();
        game.updateOnStates();
        onGameChange({ ...game })
    }

    function scrollClamp() {
        let newScrollLeft = bymod(scrollLeft, contentWidth);
        if (newScrollLeft > contentWidth / 2) newScrollLeft -= contentWidth;
        let newScrollTop = bymod(scrollTop, contentHeight);
        if (newScrollTop > contentHeight / 2) newScrollTop -= contentHeight;

        setScrollLeft(newScrollLeft);
        setScrollTop(newScrollTop);
        // setScrollLeft(bymod(scrollLeft, contentWidth));
        // setScrollTop(bymod(scrollTop, contentHeight));
        //viewWidth
        //console.log()
    }

    function scrollCenter(smoothly) {
        scrollTo(contentWidth / 2, contentHeight / 2, smoothly);
        return;
    }

    const [smoothScrollTo, setSmoothScrollTo] = useState(null);

    function scrollTo(contentX, contentY, smoothly) {
        let centerScrollLeft = bymod(contentX - viewWidth / 2, contentWidth);
        let centerScrollTop = bymod(contentY - viewHeight / 2, contentHeight);

        console.log(smoothly ? "smoothly" : "not smoothly", smoothly)
        if (!smoothly) {
            setScrollLeft(centerScrollLeft);
            setScrollTop(centerScrollTop);
            return;
        }

        const dy1 = bymod(scrollTop - centerScrollTop, contentHeight);
        const dy2 = dy1 - contentHeight;
        const dy = Math.abs(dy1) < Math.abs(dy2) ? dy1 : dy2;

        const dx1 = bymod(scrollLeft - centerScrollLeft, contentWidth);
        const dx2 = dx1 - contentWidth;
        const dx = Math.abs(dx1) < Math.abs(dx2) ? dx1 : dx2;

        centerScrollTop = scrollTop - dy;
        centerScrollLeft = scrollLeft - dx;

        setSmoothScrollTo({ x: centerScrollLeft, y: centerScrollTop });
    }



    useEffect(() => {
        if (!smoothScrollTo) return;

        requestAnimationFrame(() => {
            const dx = smoothScrollTo.x - scrollLeft;
            const dy = smoothScrollTo.y - scrollTop;
            if (Math.abs(dx) + Math.abs(dy) <= 1) {
                setScrollLeft(smoothScrollTo.x);
                setScrollTop(smoothScrollTo.y);
                setSmoothScrollTo(null);
            } else {
                setScrollLeft(scrollLeft + dx / 2);
                setScrollTop(scrollTop + dy / 2);
            }
        });
    }, [smoothScrollTo, scrollLeft, scrollTop])

    return (
        <div className="flex flex-col">

            <GameHeader game={game} onBack={onBack} onLevelClick={() => { scrollCenter(true) }} />

            <EndlessScrollView ref={viewRef}
                onDown={handleDown}
                onUp={handleUp}
                className={cn("relative bg-black flex-1 opacity-0 transition-all delay-75 duration-500", oldViewSize.current && "opacity-100")}
                scrollLeft={scrollLeft} scrollTop={scrollTop}
                onScrollChange={handleScroll}>
                {/* {viewBg} */}
                {viewCells}
            </EndlessScrollView>

        </div>
    )
}
