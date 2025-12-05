import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from './utils/cn.ts'
import { PagePlay } from './PagePlay';
import { PageMenu } from './PageMenu';
import { createGame } from './game/gamecreate.ts';
import { usePageHistory } from './components/PageHistory.tsx';
import { Window } from './components/Window.jsx';
import Modal from './components/Modal.jsx';
import { MenuButton } from './components/Button.jsx';
import { GAME_LEVEL_SIZE, GAME_MODE_BORDERED, GAME_MODES } from './game/gameconstants.ts';
import { PageLevels } from './PageLevels.jsx';
import { PageRating } from './PageRating.jsx';
import { useGame } from './GameContext.jsx';
import { useGameMusic } from './GameMusic.jsx';
import { useOnline } from './OnlineContext.jsx';
import { Hash } from './components/Hash.tsx';

const PAGE_START = "/";
const PAGE_MENU = "Menu";
const PAGE_LEVELS = "Levels";
const PAGE_LEADERBOARD = "Leaderboard";

const MENU_MAIN = "MENU_MAIN";
const MENU_MODES = "MENU_MODES";
const MENU_LEVELS = "MENU_LEVELS";
const MENU_SETTINGS = "MENU_SETTINGS";
const MENU_RATING = "MENU_RATING";
const MENU_ABOUT = "MENU_ABOUT";

function App() {
  const { settings, current, updateCurrent } = useGame();
  const online = useOnline();
  const { currentPage, currentData, pushPage, goBack } = usePageHistory();
  const music = useGameMusic();

  const isPaused = useMemo(() => currentPage !== PAGE_START, [currentPage]);

  const [menuPage, setMenuPage] = useState(MENU_MAIN);
  //const [menuPlayMode, setMenuPlayMode] = useState(current.mode);
  const [menuPlayLevel, setMenuPlayLevel] = useState(current.level);

  const menuPlayMode = useMemo(() => { return currentData ? currentData.mode : current.mode }, [currentData, current]);

  useEffect(() => {
    music.setModeLevel(current);
    //console.log("ONLINE:", online.scores)
  }, [current.mode, current.level]);

  function handleMenu() {
    pushPage(PAGE_MENU);
  }

  function handleModeSelect(mode) {
    //setMenuPlayMode(mode);
    pushPage(PAGE_LEVELS, { mode });

    // setMenuPlayLevel(level);
    // updateCurrent({ mode, level });
    // goBack(2); //close levels
  }

  function handleLevelSelect(mode, level) {
    setMenuPlayLevel(level);
    updateCurrent({ mode, level });
    goBack(2); //close levels
  }

  function handleLeaderboard() {
    pushPage(PAGE_LEADERBOARD);
  }

  function handleNext() {
    updateCurrent({ mode: current.mode, level: current.level + 1 });
  }

  let subtitle = `Welcome ${settings.name}`;
  if (currentPage === PAGE_LEVELS) {
    subtitle = "choose level to play";
  } else if (currentPage === PAGE_LEADERBOARD) {
    subtitle = "global player rank";
  }

  return (
    <>
      <div className='w-lg aspect-square bg-red-500/50 fixed top-0 z-40' popover></div>
      <PagePlay
        mode={current.mode}
        level={current.level}
        onNext={handleNext}
        className={cn("transition-all", (false && isPaused) && "brightness-50 contrast-75 grayscale-50")}
        onMenu={handleMenu} />

      <Modal shown={currentPage != PAGE_START}
        title={"Netwalk"}
        subtitle={subtitle}
        onClose={currentPage === PAGE_MENU || currentPage === PAGE_START ? goBack : undefined}
        //onBack={() => setMenuPage(MENU_MAIN)}>
        onBack={currentPage !== PAGE_MENU && currentPage !== PAGE_START && goBack}>

        {(currentPage === PAGE_MENU || currentPage === PAGE_START) && <PageMenu onModeSelect={handleModeSelect} onLeaderboard={handleLeaderboard} />}

        {currentPage === PAGE_LEADERBOARD && <PageRating />}

        {currentPage === PAGE_LEVELS && <PageLevels
          //mode={menuPlayMode}
          mode={currentData?.mode || 0}
          selectedLevel={menuPlayLevel}
          levelPlaying={menuPlayMode === current.mode ? current.level : -1}
          //onClose={goBack}
          onLevelSelect={handleLevelSelect}
        //onBack={() => setMenuPage(MENU_MAIN)}
        />}
      </Modal>
    </>
  );
}

export default App
