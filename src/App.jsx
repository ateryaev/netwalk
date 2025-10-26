import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from './utils/cn.ts'
import { PagePlay } from './PagePlay';
import { PageMenu } from './PageMenu';
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
import { GetSettings, SetLevelSolved } from './game/gamestats.ts';
//import MusicPlayer from './utils/bgmusic.jsx';
import { useGame } from './GameContext.jsx';
//import { musicPause, musicResume } from './game/gamemusic.ts';
import { useGameMusic } from './GameMusic.jsx';

const PAGE_START = "/";
const PAGE_MENU = "Menu";

const MENU_MAIN = "MENU_MAIN";
const MENU_MODES = "MENU_MODES";
const MENU_LEVELS = "MENU_LEVELS";
const MENU_SETTINGS = "MENU_SETTINGS";
const MENU_RATING = "MENU_RATING";
const MENU_ABOUT = "MENU_ABOUT";

function App() {
  const { settings } = useGame();
  const { currentPage, pushPage, goBack } = usePageHistory();
  const music = useGameMusic();

  const isPaused = useMemo(() => currentPage === PAGE_MENU, [currentPage]);

  const [mode, setMode] = useState(0);
  const [level, setLevel] = useState(0);

  const [menuPage, setMenuPage] = useState(MENU_MAIN);
  const [menuPlayMode, setMenuPlayMode] = useState(mode);
  const [menuPlayLevel, setMenuPlayLevel] = useState(level);

  useEffect(() => {
    music.setModeLevel({ mode, level });
  }, [mode, level]);

  function handleMenu() {
    pushPage(PAGE_MENU);
  }


  function handleLevelSelect(mode, level) {
    setMenuPlayLevel(level);
    setMode(mode);
    setLevel(level);
    console.log("handleLevelSelect", mode, level);
    goBack(); //close levels
  }

  function handleNext() {
    setLevel(level + 1);
  }

  return (
    <>
      <PagePlay
        mode={mode}
        level={level}
        onNext={handleNext}
        className={cn("transition-all", (isPaused) && "brightness-50 contrast-75 grayscale-50")}
        onMenu={handleMenu} />

      <PageMenu shown={(isPaused && menuPage === MENU_MAIN)}
        modePlaying={mode}
        onBack={goBack}
        onRating={() => setMenuPage(MENU_RATING)}
        onSettings={() => setMenuPage(MENU_SETTINGS)}
        onAbout={() => setMenuPage(MENU_ABOUT)}
        onModes={() => setMenuPage(MENU_MODES)}
        onModeSelect={(idx) => { if (menuPlayMode !== idx) { setMenuPlayMode(idx); setMenuPlayLevel(-1); } setMenuPage(MENU_LEVELS); }}
      />

      {/* 
      <PageSettings shown={(isPaused && menuPage === MENU_SETTINGS)}
        onClose={goBack}
        onBack={() => setMenuPage(MENU_MAIN)}
      />

      <PageModes shown={(isPaused && menuPage === MENU_MODES)}
        selected={menuPlayMode}
        playingMode={mode}
        onModeSelect={(idx) => { if (menuPlayMode !== idx) { setMenuPlayMode(idx); setMenuPlayLevel(-1); } setMenuPage(MENU_LEVELS); }}
        onBack={() => setMenuPage(MENU_MAIN)}
        onClose={goBack} /> */}

      <PageLevels shown={(isPaused && menuPage === MENU_LEVELS)}
        mode={menuPlayMode}
        selectedLevel={menuPlayLevel}
        levelPlaying={menuPlayMode === mode ? level : -1}
        onClose={goBack}
        onLevelSelect={handleLevelSelect}
        onBack={() => setMenuPage(MENU_MAIN)} />

      {/*         
      <PageAbout shown={(currentPage === PAGE_ABOUT)} onBack={goBack} onClose={() => { goBack(2) }} />
      <PageRating shown={(currentPage === PAGE_RATING)} onBack={goBack} />
      */}
    </>
  );
}

export default App
