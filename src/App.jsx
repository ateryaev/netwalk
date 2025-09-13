import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { cn } from './utils/cn.ts'
import { PagePlay } from './PagePlay';
import { PageMenu } from './PageMenu';
import { PageTest } from './PageTest';
import { createGame } from './utils/gamecreate';
import { usePageHistory } from './components/PageHistory.tsx';

function App() {

  const PAGE_START = "/";
  const PAGE_PLAY = "/play";
  const PAGE_TEST = "/test";
  const PAGE_PLAY_LEVEL = "/play/128";


  const { currentPage, pushPage, replacePage, goBack } = usePageHistory();


  function handleNewGame(cols, rows, bordered) {
    let newGame = createGame(cols, rows, bordered);
    setGame(newGame);
    pushPage(PAGE_PLAY);
  }

  function handleBack() {
    goBack()
  }

  const [game, setGame] = useState(createGame(5, 5)); //load from localStorage or create new

  switch (currentPage) {
    case PAGE_START:
      //  return <PagePlay game={game} onGameChange={(newGame) => setGame(newGame)} onBack={handleBack} />
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
