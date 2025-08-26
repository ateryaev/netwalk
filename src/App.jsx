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
import { PagePlay } from './PagePlay';
import { PageMenu } from './PageMenu';


function App() {

  //const GAME_1 = createGame(8, 8);


  function handleNewGame(cols, rows) {
    let newGame = createGame(cols, rows);
    newGame.shufle();
    newGame.updateOnStates();

    setGame(newGame);
    setPage("play");
  }

  const [page, setPage] = useState("play");
  const [game, setGame] = useState(createGame(8, 8)); //load from localStorage or create new

  if (page === "menu") return (
    <PageMenu onNewGame={handleNewGame} />
  )
  if (page === "play")
    return (
      <PagePlay game={game} onGameChange={(newGame) => setGame(newGame)} onBack={() => { setPage("menu") }} />
    )
}

export default App
