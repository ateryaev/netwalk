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


const GAME_1 = createGame(8, 8);



function App() {

  const viewRef = useRef(null);

  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const [game, setGame] = useState(GAME_1);
  const [selected, setSelected] = useState({ col: -1, row: -1, leftIndex: -1, topIndex: -1, scrollLeft: 0, scrollTop: 0 });

  //const [contentLeftIndex, setContentLeftIndex] = useState(0);
  //const [contentTopIndex, setContentTopIndex] = useState(0);
  // const [gameCols, setGameCols] = useState(game.cols);
  // const [gameRows, setGameRows] = useState(game.rows);


  const [cellSize, setCellSize] = useState(SIZE);
  const [viewWidth, setViewWidth] = useState(2 * SIZE);
  const [viewHeight, setViewHeight] = useState(2 * SIZE);

  const contentWidth = useMemo(() => (cellSize * game.cols), [game.cols, cellSize]);
  const contentHeight = useMemo(() => (cellSize * game.rows), [game.rows, cellSize]);

  const viewCols = useMemo(() => Math.ceil(viewWidth / cellSize) + 1, [viewWidth, cellSize]);
  const viewRows = useMemo(() => Math.ceil(viewHeight / cellSize) + 1, [viewHeight, cellSize]);

  //   newLeft = (scrollLeft % contentWidth + contentWidth) % contentWidth;
  // newTop = (scrollTop % contentHeight + contentHeight) % contentHeight;

  const fragments = cellSize / 1;
  const scrollLeft10 = useMemo(() => (Math.round(scrollLeft / (cellSize / fragments)) * cellSize / fragments), [scrollLeft, cellSize]);
  const scrollTop10 = useMemo(() => (Math.round(scrollTop / (cellSize / fragments)) * cellSize / fragments), [scrollTop, cellSize]);

  // setContentLeftIndex(Math.floor(newScrollLeft / contentWidth));
  //   setContentTopIndex(Math.floor(newScrollTop / contentHeight));

  const contentLeftIndex = useMemo(() => Math.floor(scrollLeft10 / contentWidth), [scrollLeft10, contentWidth]);
  const contentTopIndex = useMemo(() => Math.floor(scrollTop10 / contentHeight), [scrollTop10, contentHeight]);

  const scrollLeftAbs = useMemo(() => (scrollLeft10 % contentWidth + contentWidth) % contentWidth, [scrollLeft10, contentHeight]);
  const scrollTopAbs = useMemo(() => (scrollTop10 % contentHeight + contentHeight) % contentHeight, [scrollTop10, contentHeight]);
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
    setGame({ ...game }); // Trigger a re-render by creating a new array
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
        items.push(<GameCellBg key={`bg_${gameCol}:${gameRow}:${currentLeftIndex}:${currentTopIndex}`}
          selected={selected.col === gameCol && selected.row === gameRow && selected.leftIndex === currentLeftIndex && selected.topIndex === currentTopIndex}
          col={gameCol} row={gameRow} style={style} />);

        const cell = game.atXY(gameCol, gameRow);
        if (!cell) continue; // Skip if the cell is not defined

        if (cell.source && game.atXY(gameCol, gameRow - 1).source) continue;
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


    // setContentLeftIndex(Math.floor(newScrollLeft / contentWidth));
    // setContentTopIndex(Math.floor(newScrollTop / contentHeight));
    //console.log(`Scroll position: ${pos.x}, ${pos.y}`);
    // console.log(`View size: ${viewSize.width}x${viewSize.height}`);
    // console.log(`Content size: ${contentSize.width}x${contentSize.height}`);
    // setScrollXY(pos);
    // setViewSize(viewSize);
    //setContentSize(contentSize);
  }

  const oldViewSize = useRef({ width: 2 * SIZE, height: 2 * SIZE });

  useEffect(() => {
    //console.log(children)
    const resizeObserver = new ResizeObserver(() => {
      const rect = viewRef.current.getBoundingClientRect();
      setViewHeight(rect.height);
      setViewWidth(rect.width);
    });
    resizeObserver.observe(viewRef.current);
    return () => { resizeObserver.unobserve(viewRef.current) };
  }, [])

  useEffect(() => {
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
      col: selectedCol, row: selectedRow, leftIndex: selectedLeftIndex, topIndex: selectedTopIndex,
      scrollLeft: scrollLeft10, scrollTop: scrollTop10
    });
    console.log(`DOWN: (${selectedCol}, ${selectedRow}) / (${selectedLeftIndex}, ${selectedTopIndex})`);
  }

  function handleUp() {
    setScrollLeft(scrollLeft10);
    setScrollTop(scrollTop10);

    if (selected.col === -1 || selected.row === -1) return; // No cell was selected

    const deltaScrollLeft = scrollLeft10 - selected.scrollLeft;
    const deltaScrollTop = scrollTop10 - selected.scrollTop;
    if (deltaScrollLeft === 0 && deltaScrollTop === 0) {
      handleCellClick(selected.col, selected.row);
    }
    setSelected({ col: -1, row: -1, leftIndex: -1, topIndex: -1, scrollLeft: 0, scrollTop: 0 });

  }

  function restart(cols, rows) {

    setGame(createGame(cols, rows));
    //setScrollTop(0);
    //setScrollLeft(0);
    //setTimeout(() => { scrollCenter() }, 1000)
    //requestAnimationFrame(scrollCenter);
    scrollCenter();
  }

  function shufle() {
    game.shufle();
    game.updateOnStates();
    setGame({ ...game })
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
    <>
      <div className='fixed p-2 h-[120px] flex gap-2 bg-white ring-8 ring-black/20 z-50 right-0 left-0 text-sm select-none cursor-default'>
        <button className='p-2 bg-blue-300' onClick={() => restart(4, 4)}>
          restart<br />4x4
        </button>
        <button className='p-2 bg-blue-300' onClick={() => restart(20, 20)}>
          restart<br />20x20
        </button>
        <button className='p-2 bg-blue-300' onClick={shufle}>
          shufle<br />all
        </button>
        <button className='p-2 bg-blue-300' onClick={scrollClamp}>
          scroll<br />clamp
        </button>
        <button className='p-2 bg-blue-300' onClick={() => { scrollCenter(true) }}>
          center<br />view
        </button>
        Scroll: {scrollLeft10.toFixed(1)} : {scrollTop10.toFixed(1)}
        &nbsp;&nbsp;&nbsp;{contentLeftIndex} : {contentTopIndex}
        &nbsp;&nbsp;&nbsp;{game.cols} : {game.rows}
        &nbsp;&nbsp;&nbsp;{contentWidth} : {contentHeight}
      </div >
      <EndlessScrollView ref={viewRef}
        onDown={handleDown}
        onUp={handleUp}
        className="fixed inset-0 top-[120px] bg-neutral-500"
        scrollLeft={scrollLeft} scrollTop={scrollTop}
        // contentWidth={cellSize * gameCols} contentHeight={cellSize * gameRows}
        onScrollChange={handleScroll}>
        {/* {viewBg} */}
        {viewCells}
      </EndlessScrollView>
      {/* <TorusScrollGrid scrollLeft={scrollLeft} scrollTop={scrollTop} cols={GAME_1.cols} rows={GAME_1.rows} cellSize={80}
        onScrollChange={handleScroll} gameCellFactory={gameCellFactory} CellTemplate={ItemElement}>
        {Array.from({ length: GAME_1.length }, (_, index) => (
          <ItemElement key={`${index}`} data={GAME_1[index]} col={GAME_1[index].col} row={GAME_1[index].row} value={GAME_1[index].value}
            onClick={handleClick}></ItemElement>
        ))}
      </TorusScrollGrid> */}

    </>
  )


}

export default App
