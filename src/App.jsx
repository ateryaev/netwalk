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
import { GetSettings, SetLevelSolved } from './game/gamestats.ts';
import { useGame } from './GameContext.jsx';
import { useGameMusic } from './GameMusic.jsx';

const PAGE_START = "/";
const PAGE_MENU = "Menu";
const PAGE_LEVELS = "Levels";

const MENU_MAIN = "MENU_MAIN";
const MENU_MODES = "MENU_MODES";
const MENU_LEVELS = "MENU_LEVELS";
const MENU_SETTINGS = "MENU_SETTINGS";
const MENU_RATING = "MENU_RATING";
const MENU_ABOUT = "MENU_ABOUT";

function App() {
  const { settings, current, updateCurrent } = useGame();
  const { currentPage, currentData, pushPage, goBack } = usePageHistory();
  const music = useGameMusic();

  const isPaused = useMemo(() => currentPage !== PAGE_START, [currentPage]);

  const [menuPage, setMenuPage] = useState(MENU_MAIN);
  //const [menuPlayMode, setMenuPlayMode] = useState(current.mode);
  const [menuPlayLevel, setMenuPlayLevel] = useState(current.level);

  const menuPlayMode = useMemo(() => { return currentData ? currentData.mode : current.mode }, [currentData, current]);

  useEffect(() => {
    music.setModeLevel(current);
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

  function handleNext() {
    updateCurrent({ mode: current.mode, level: current.level + 1 });
  }
  // + "(" + currentData?.mode + ") (" + current.mode + ") (" + menuPlayMode + ")"
  return (
    <>
      <PagePlay
        mode={current.mode}
        level={current.level}
        onNext={handleNext}
        className={cn("transition-all", (isPaused) && "brightness-50 contrast-75 grayscale-50")}
        onMenu={handleMenu} />

      <Modal shown={currentPage != PAGE_START}
        title={"Netwalk"}
        subtitle={currentPage !== PAGE_LEVELS ? "relax no stress" : GAME_MODES[menuPlayMode]}
        onClose={currentPage === PAGE_MENU || currentPage === PAGE_START ? goBack : undefined}
        //onBack={() => setMenuPage(MENU_MAIN)}>
        onBack={currentPage !== PAGE_MENU && currentPage !== PAGE_START && goBack}>

        {currentPage === PAGE_MENU && <PageMenu onModeSelect={handleModeSelect} />}

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
