import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { cn } from './utils/cn.ts'
import { PagePlay } from './PagePlay';
import { PageMenu, PageSettings, PageStory, PageStoryLevels } from './PageMenu';
import { PageTest } from './PageTest';
import { createGame } from './game/gamecreate.ts';
import { usePageHistory } from './components/PageHistory.tsx';
import { Window } from './components/Window.jsx';
import Modal from './components/Modal.jsx';
import { MenuButton } from './components/Button.jsx';
import { PageAbout } from './PageAbout.jsx';
import { GAME_LEVEL_SIZE, GAME_MODE_BORDERED } from './game/gameconstants.ts';
//import { createGameTutorial } from './game/gametutorials.ts';

function App() {

  const PAGE_START = "/";
  const PAGE_PLAY = "/play";
  const PAGE_MENU = "/menu";
  const PAGE_ABOUT = "/about";
  const PAGE_SETTINGS = "/settings";
  const PAGE_STORY = "/story";
  const PAGE_STORY_LEVELS = "/story/levels";
  const PAGE_CUSTOM = "/custom";
  const PAGE_TEST = "/test";
  const PAGE_PLAY_LEVEL = "/play/128";


  const { currentPage, currentData, pushPage, replacePage, goBack } = usePageHistory();


  function handleNewGame(cols, rows, bordered) {
    let newGame = createGame(cols, rows, bordered);
    setGame(newGame);
    pushPage(PAGE_PLAY);
  }

  function handleRestart() {
    setRestarting(true);
    setTimeout(() => {
      const g = createGame(game.mode, game.level);
      setGame(g);
      setRestarting(false);
    }, 500);

    // shufleGame(game);
    // onGameChange({ ...game });
  }

  function handleBack() {
    //goBack()
    pushPage(PAGE_MENU);
  }

  //const [game, setGame] = useState(createGame(1, 6)); //load from localStorage or create new
  const [game, setGame] = useState(createGame(4, 0)); //load from localStorage or create new

  function handleLevelSelect(mode, level) {
    console.log("handleLevelSelect", mode, level);
    goBack(3); //close levels
    setRestarting(true);
    setTimeout(() => {
      const g = createGame(mode, level);
      setGame(g);
      setRestarting(false);
    }, 500);
    //TODO: pushPage with new level, so we could back to prev
  }

  const [restarting, setRestarting] = useState(false);
  function handleNext() {
    setRestarting(true);
    setTimeout(() => {
      const g = createGame(game.mode, game.level + 11);
      setGame(g);
      setRestarting(false);
    }, 500);
  }

  return (
    <>
      <PagePlay game={game} onGameChange={(newGame) => setGame(newGame)}
        erased={restarting}
        onNext={handleNext}
        onRestart={handleRestart}
        className={cn("transition-all", (currentPage !== PAGE_START) && "brightness-50 contrast-75 grayscale-50")} onBack={handleBack} />

      {/* <div className='fixed inset-0 bg-black/50 z-50'></div> */}
      {/* <Modal shown={(currentPage === PAGE_MENU)} title={"Netwalk"} xonBack={goBack} onClose={goBack}>

        <div className='flex flex-col gap-2 items-stretch p-4 m-auto '>
          <MenuButton >New Game</MenuButton>
          <MenuButton>Settings</MenuButton>
          <MenuButton onClick={() => pushPage(PAGE_ABOUT)}>About</MenuButton>
        </div>
      </Modal> */}

      <PageMenu shown={(currentPage === PAGE_MENU)}
        onBack={goBack}
        onSettings={() => pushPage(PAGE_SETTINGS)}
        onAbout={() => pushPage(PAGE_ABOUT)}
        onStory={() => pushPage(PAGE_STORY)}
      />

      <PageAbout shown={(currentPage === PAGE_ABOUT)} onBack={goBack} />
      <PageSettings shown={(currentPage === PAGE_SETTINGS)} onBack={goBack} />
      <PageStory shown={(currentPage === PAGE_STORY)}
        onStorySelect={(idx) => pushPage(PAGE_STORY_LEVELS, { mode: idx })} onBack={goBack} onClose={() => { goBack(2) }} />
      <PageStoryLevels shown={(currentPage === PAGE_STORY_LEVELS)} mode={currentData?.mode || 0}
        onClose={() => { goBack(3) }}
        onLevelSelect={handleLevelSelect}
        onBack={goBack} />
      {/* 
      <Modal shown={(currentPage === PAGE_ABOUT)} title={"about"} onBack={goBack} xonClose={goBack}>
        <div className='flex flex-col gap-2 items-stretch p-4 m-auto'>
          ABOUT
          <br /><br />
          Test modal content about the game.
          <br />
          More text to test scrolling behavior. More text to test scrolling behavior. More text to test scrolling behavior. More text to test scrolling behavior. More text to test scrolling behavior. More text to test scrolling behavior. More text to test scrolling behavior. More text to test scrolling behavior.
          <br />
          Even more text to see how it looks when there is a lot of content in the modal window. Even more text to see how it looks when there is a lot of content in the modal window. Even more text to see how it looks when there is a lot of content in the modal window.
        </div>
      </Modal> */}




    </>
  );
  switch (currentPage) {
    case PAGE_START:
      //  return <PagePlay game={game} onGameChange={(newGame) => setGame(newGame)} onBack={handleBack} />
      return <PagePlay game={game} onGameChange={(newGame) => setGame(newGame)} onBack={handleBack} />
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
