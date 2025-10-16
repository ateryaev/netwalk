import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from './utils/cn.ts'
import { PagePlay } from './PagePlay';
import { PageMenu, PageModes } from './PageMenu';
import { PageTest } from './PageTest';
import { createGame } from './game/gamecreate.ts';
import { usePageHistory } from './components/PageHistory.tsx';
import { Window } from './components/Window.jsx';
import Modal from './components/Modal.jsx';
import { MenuButton } from './components/Button.jsx';
import { PageAbout } from './PageAbout.jsx';
import { GAME_LEVEL_SIZE, GAME_MODE_BORDERED } from './game/gameconstants.ts';
import { PageLevels } from './PageLevels.jsx';
import { PageSettings } from './PageSettings.jsx';
import { PageRating } from './PageRating.jsx';
import { SetLevelSolved } from './game/gamestats.ts';

function App() {

  const PAGE_START = "/";
  const PAGE_PLAY = "/play";
  const PAGE_MENU = "/menu";
  const PAGE_ABOUT = "/about";
  const PAGE_SETTINGS = "/settings";
  const PAGE_STORY = "/story";
  const PAGE_RATING = "/leaderboard";
  const PAGE_STORY_LEVELS = "/story/levels";
  const PAGE_CUSTOM = "/custom";
  const PAGE_TEST = "/test";
  const PAGE_PLAY_LEVEL = "/play/128";

  const { currentPage, currentData, pushPage, replacePage, goBack } = usePageHistory();

  function handleMenu() {
    pushPage(PAGE_MENU);
  }

  const [mode, setMode] = useState(0);
  const [level, setLevel] = useState(0);

  //const [solved, setSolved] = useState(false);
  function handleLevelSelect(mode, level) {
    setMode(mode);
    setLevel(level);
    console.log("handleLevelSelect", mode, level);
    goBack(3); //close levels
    // setRestarting(true);
    // setTimeout(() => {
    //   const g = createGame(mode, level);
    //   setGame(g);
    //   setRestarting(false);
    //   setSolved(false);
    // }, 500);
    //TODO: pushPage with new level, so we could back to prev?
  }

  //const [restarting, setRestarting] = useState(false);
  function handleNext() {
    setLevel(level + 1);
    // setRestarting(true);
    // setTimeout(() => {
    //   const g = createGame(game.mode, game.level + 11);
    //   setGame(g);
    //   setRestarting(false);
    //   setSolved(false);
    // }, 500);
  }

  // function handleGameChange(newGame) {
  //   if (solved) return; //block changes after solved
  //   setGame(newGame);
  // }

  // function handleSolved() {
  //   // pushPage(PAGE_MENU);
  //   console.log("handleSolved", game.mode, game.level);
  //   SetLevelSolved(game.mode, game.level);
  //   setSolved(true);
  // }

  return (
    <>
      <PagePlay
        //game={game} onGameChange={handleGameChange}
        mode={mode}
        level={level}
        //onSolved={handleSolved}
        //erased={restarting}
        onNext={handleNext}
        //onRestart={handleRestart}
        className={cn("transition-all", (currentPage !== PAGE_START) && "brightness-50 contrast-75 grayscale-50")}
        onMenu={handleMenu} />

      <PageMenu shown={(currentPage === PAGE_MENU)}
        onBack={goBack}
        onRating={() => pushPage(PAGE_RATING)}
        onSettings={() => pushPage(PAGE_SETTINGS)}
        onAbout={() => pushPage(PAGE_ABOUT)}
        onStory={() => pushPage(PAGE_STORY)}
      />

      <PageAbout shown={(currentPage === PAGE_ABOUT)} onBack={goBack} onClose={() => { goBack(2) }} />
      <PageSettings shown={(currentPage === PAGE_SETTINGS)} onBack={goBack} />
      <PageRating shown={(currentPage === PAGE_RATING)} onBack={goBack} />
      <PageModes shown={(currentPage === PAGE_STORY)}
        onModeSelect={(idx) => pushPage(PAGE_STORY_LEVELS, { mode: idx })}
        onBack={goBack} onClose={() => { goBack(2) }} />
      <PageLevels shown={(currentPage === PAGE_STORY_LEVELS)} mode={currentData?.mode || 0}
        onClose={() => { goBack(3) }}
        onLevelSelect={handleLevelSelect}
        onBack={goBack} />
    </>
  );
}

export default App
