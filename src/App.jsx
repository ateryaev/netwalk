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
import { GetSettings, SetLevelSolved } from './game/gamestats.ts';
import MusicPlayer from './utils/bgmusic.jsx';
import { useGame } from './GameContext.jsx';

// const musicPlayer = new BackgroundMusic();
// musicPlayer.init();
// musicPlayer.load('music/ethereal_whispers.mp3');
let timeout = null;

function App() {

  const { settings } = useGame();
  const { currentPage, currentData, pushPage, replacePage, goBack } = usePageHistory();

  const PAGE_START = "/";
  const PAGE_MENU = "Menu";
  const PAGE_ABOUT = "About";
  const PAGE_SETTINGS = "Settings";
  const PAGE_STORY = "Modes";
  const PAGE_RATING = "Leaderboard";
  const PAGE_STORY_LEVELS = "Levels";
  const PAGE_CUSTOM = "Custom";
  const PAGE_TEST = "Test";

  const menuMusicRef = useRef(null);

  function stopMusic() {
    clearTimeout(timeout);
    menuMusicRef.current?.stop(2);
  }

  function startMusic() {
    clearTimeout(timeout);
    const file = 'music/ethereal_whispers.mp3';// 'music/dreaming_in_pixels.mp3';
    timeout = setTimeout(() => menuMusicRef.current?.play(file), 2000);
  }
  useEffect(() => {
    function handlePointer() {
      menuMusicRef.current = new MusicPlayer();
      if (currentPage !== PAGE_START) stopMusic(); else startMusic();
      console.log("pointerdown - start music");
    }
    document.addEventListener('pointerdown', handlePointer, { once: true });
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      menuMusicRef.current?.cleanup();
    };
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) stopMusic();
      else if (currentPage === PAGE_START) startMusic();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [settings.music, currentPage]);

  useEffect(() => {
    if (currentPage !== PAGE_START) stopMusic(); else startMusic();
  }, [currentPage !== PAGE_START]);


  function handleMenu() {
    pushPage(PAGE_MENU);
  }

  const [mode, setMode] = useState(4);
  const [level, setLevel] = useState(0);

  function handleLevelSelect(mode, level) {
    setMode(mode);
    setLevel(level);
    console.log("handleLevelSelect", mode, level);
    goBack(3); //close levels
  }

  //const [restarting, setRestarting] = useState(false);
  function handleNext() {
    setLevel(level + 1);
    //startMusic(currentPage);
  }

  return (
    <>
      <PagePlay
        mode={mode}
        level={level}
        onNext={handleNext}
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
