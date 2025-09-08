import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { cn } from './utils/cn'
import { createGame } from './utils/gameplay';
import { PagePlay } from './PagePlay';
import { PageMenu } from './PageMenu';
import { PageTest } from './PageTest';
import { countProgress } from './utils/game';


// function restart(cols, rows) {

//     let newGame = createGame(cols, rows);
//     newGame.shufle();
//     newGame.updateOnStates();
//     onGameChange(newGame);
//     scrollCenter();
// }

// function shufle() {
//     game.shufle();
//     game.updateOnStates();
//     onGameChange({ ...game })
// }

// function scrollClamp() {
//     let newScrollLeft = bymod(scrollLeft, contentWidth);
//     if (newScrollLeft > contentWidth / 2) newScrollLeft -= contentWidth;
//     let newScrollTop = bymod(scrollTop, contentHeight);
//     if (newScrollTop > contentHeight / 2) newScrollTop -= contentHeight;

//     setScrollLeft(newScrollLeft);
//     setScrollTop(newScrollTop);
// }

function App() {

  //const GAME_1 = createGame(8, 8);


  function handleNewGame(cols, rows) {
    let newGame = createGame(cols, rows);
    newGame.shufle();
    newGame.updateOnStates();
    newGame.counts = countProgress(newGame);

    setGame(newGame);
    setPage("play");
  }

  const [page, setPage] = useState("play");
  const [game, setGame] = useState(createGame(7, 7)); //load from localStorage or create new

  if (page === "menu") return (
    <PageMenu onNewGame={handleNewGame} onTest={() => setPage("test")} />
  )
  if (page === "test") return (
    <PageTest onBack={() => setPage("menu")} />
  )
  if (page === "play")
    return (
      <PagePlay game={game} onGameChange={(newGame) => setGame(newGame)} onBack={() => { setPage("menu") }} />
    )
}

export default App
