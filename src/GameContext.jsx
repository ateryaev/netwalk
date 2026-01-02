import { createContext, use, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BEEP } from './utils/beep';
import { loadFromLocalStorage, saveToLocalStorage } from './utils/storage';
import { createGameTutorial0 } from './game/gametutorials';
import { normalizeNickname } from './utils/nickname';
import { GAME_MODE_SCORE, GAME_MODES } from './game/gameconstants';
import { useOnline } from './OnlineContext';

// Create the context
const GameContext = createContext();

const STORAGE_KEY = "netwalk_data";
const STORAGE_VERSION = "2026-01-02";

const DEFAULT_DATA = {
    settings: {
        sound: true,
        music: true,
        vibro: true,
        lang: "en",
        name: null,
    },
    progress: [],
    current: { mode: 0, level: 0 },
};

function loadGameData() {
    const savedData = loadFromLocalStorage(STORAGE_KEY, {});
    const data = savedData?.[STORAGE_VERSION] || DEFAULT_DATA;

    data.settings = data.settings || DEFAULT_DATA.settings;
    data.progress = data.progress || DEFAULT_DATA.progress;
    data.current = data.current || DEFAULT_DATA.current;

    data.settings.sound = data.settings.sound ?? true;
    data.settings.music = data.settings.music ?? false;
    data.settings.vibro = data.settings.vibro ?? true;
    data.settings.lang = data.settings.lang ?? "en";
    data.settings.name = normalizeNickname(data.settings.name); //check/generate/trim
    data.current.mode = data.current.mode || 0;
    data.current.level = data.current.level || 0;
    if (!Array.isArray(data.progress)) {
        data.progress = [];
    }
    return data;
}

function saveGameData(data) {
    saveToLocalStorage(STORAGE_KEY, { [STORAGE_VERSION]: data });
}

// Create a provider component
export function GameProvider({ children }) {
    const online = useOnline();
    const [gameData, setGameData] = useState(loadGameData);
    //const [gameData, setGameData] = useState(DEFAULT_DATA);

    const settings = gameData.settings || DEFAULT_DATA.settings;
    const progress = gameData.progress || DEFAULT_DATA.progress;
    const current = gameData.current || DEFAULT_DATA.current;

    useEffect(() => {
        saveGameData(gameData);
    }, [gameData]);

    const getLevelsSolved = useCallback((mode) => {
        //return 20; //for now, unlock all levels
        const modeProgress = gameData.progress[mode] || [];
        return modeProgress.filter(level => level && level.bestTaps < Infinity).length;
    }, [gameData.progress]);

    useEffect(() => {
        const totalScore = GAME_MODES.reduce((total, _, mode) =>
            total + GAME_MODE_SCORE(mode, getLevelsSolved(mode)), 0);
        online.submitScore(gameData.settings.name, totalScore);
    }, [gameData.progress])

    const markLevelSolved = (mode, level, taps) => {
        const modeProgress = progress[mode] || [];
        let levelProgress = modeProgress[level] || {};
        levelProgress = {
            bestTaps: Infinity,
            playedTimes: 0,
            lastSolvedWhen: 0,
            bestSolvedWhen: 0,
            ...levelProgress,
        }

        const isNewBest = taps < levelProgress.bestTaps;

        if (isNewBest) {
            //online.submitTaps(gameData.settings.name, mode, level, taps);
            levelProgress.bestSolvedWhen = Date.now();
            levelProgress.bestTaps = taps;
        }
        levelProgress.playedTimes += 1;
        levelProgress.lastSolvedWhen = Date.now();

        progress[mode] = modeProgress;
        progress[mode][level] = levelProgress;

        setGameData({ ...gameData, progress: [...progress] });
    }

    const getLevelStats = (mode, level) => {
        const modeProgress = progress[mode] || [];
        const levelProgress = modeProgress[level] || {};
        return {
            bestTaps: Infinity,
            playedTimes: 0,
            lastSolvedWhen: 0,
            bestSolvedWhen: 0,
            ...levelProgress,
        };
    }

    const updateCurrent = (currentGame) => {
        console.log("Updating current game:", currentGame);
        setGameData({ ...gameData, current: { ...current, ...currentGame } });
    }
    const updateSettings = (newSettings) => {

        console.log("Updating settings:", newSettings);
        setGameData({ ...gameData, settings: { ...settings, ...newSettings } });

        // if (newSettings.name === "!!!") {
        //     //reset all data on secret name, need to restart/refresh to apply
        //     saveToLocalStorage(PROGRESS_STORAGE_KEY, []);
        //     saveToLocalStorage(SETTINGS_STORAGE_KEY, {});
        //     saveToLocalStorage(CURRENT_STORAGE_KEY, {});
        // } else {
        //     saveToLocalStorage(SETTINGS_STORAGE_KEY, { ...settings, ...newSettings });
        //     saveToLocalStorage(CURRENT_STORAGE_KEY, current);
        //     saveToLocalStorage(PROGRESS_STORAGE_KEY, progress);
        // }
        // setSettings((prev) => ({ ...prev, ...newSettings }));
    };

    useEffect(() => {
        console.log("Settings changed:", settings);
        BEEP.sound = settings.sound;
        BEEP.vibro = settings.vibro;
        // MUSIC.off = !settings.music;
    }, [settings.sound, settings.vibro, settings.music]);



    return (
        <GameContext.Provider value={{ settings, current, getLevelsSolved, getLevelStats, markLevelSolved, updateSettings, updateCurrent }}>
            {children}
        </GameContext.Provider>
    );
}

// Custom hook for easy access
export function useGame() {
    return useContext(GameContext);
}
