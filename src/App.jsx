import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { cn } from './utils/cn'
import { createGame } from './utils/gameplay';
import { PagePlay } from './PagePlay';
import { PageMenu } from './PageMenu';
import { PageTest } from './PageTest';
import { countProgress } from './utils/game';
import { usePageHistory } from './components/PageHistory';

function App() {



  const PAGE_START = "/";
  const PAGE_PLAY = "/play";
  const PAGE_TEST = "/test";
  const PAGE_PLAY_LEVEL = "/play/128";


  const { currentPage, pushPage, replacePage, goBack } = usePageHistory();
  //const GAME_1 = createGame(8, 8);


  function handleNewGame(cols, rows) {
    let newGame = createGame(cols, rows);
    newGame.shufle();
    newGame.updateOnStates();
    newGame.counts = countProgress(newGame);
    setGame(newGame);
    pushPage(PAGE_PLAY);

    //setPage("play");
  }

  function handleBack() {
    goBack()
  }

  const [game, setGame] = useState(createGame(7, 7)); //load from localStorage or create new

  switch (currentPage) {
    case PAGE_START:
      return <PageMenu onNewGame={handleNewGame} onTest={() => pushPage(PAGE_TEST)} />
    case PAGE_PLAY:
      return <PagePlay game={game} onGameChange={(newGame) => setGame(newGame)} onBack={handleBack} />
    case PAGE_TEST:
      return <PageTest onBack={handleBack} />
    default:
      return <>NO PATH HANDLER: ({currentPage})</>
  }
}
//   if (currentPage === PAGE_START) return (<PageMenu onNewGame={handleNewGame} onTest={() => setPage("test")} />
//   return (
//     { currentPage === PAGE_START && (<PageMenu onNewGame={handleNewGame} onTest={() => setPage("test")} />)}
//   )


// if (page === "menu") return (
//   <PageMenu onNewGame={handleNewGame} onTest={() => setPage("test")} />
// )
// if (page === "test") return (
//   <PageTest onBack={() => setPage("menu")} />
// )
// if (page === "play")
//   return (
//     <PagePlay game={game} onGameChange={(newGame) => setGame(newGame)} onBack={() => { setPage("menu") }} />
//   )
// }

export default App
