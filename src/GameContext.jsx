// SettingsContext.js
import { createContext, use, useContext, useEffect, useState } from 'react';
import { GetSettings } from './game/gamestats';
import { BEEP } from './utils/beep';
import { loadFromLocalStorage, saveToLocalStorage } from './utils/storage';
import { MUSIC } from './utils/bgmusic';
import { createGameTutorial0 } from './game/gametutorials';

// Create the context
const GameContext = createContext();

const SETTINGS_STORAGE_KEY = "netwalk_game_settings";
const PROGRESS_STORAGE_KEY = "netwalk_game_progress";
const CURRENT_STORAGE_KEY = "netwalk_game_current";

// Create a provider component
export function GameProvider({ children }) {

    const [settings, setSettings] = useState({});
    const [progress, setProgress] = useState([]);
    const [current, setCurrent] = useState({});



    useEffect(() => {
        const savedProgress = loadFromLocalStorage(PROGRESS_STORAGE_KEY, []);
        const savedSettings = loadFromLocalStorage(SETTINGS_STORAGE_KEY, {});

        setSettings({
            sound: savedSettings.sound ?? true,
            music: savedSettings.music ?? false,
            vibro: savedSettings.vibro ?? true,
            lang: savedSettings.lang ?? "en",
            name: savedSettings.name ?? "SimplePlayer"
        });

        if (Array.isArray(savedProgress)) {
            setProgress(savedProgress);
        }
    }, []);

    // const reset = () => {
    //     setProgress([]);
    //     saveToLocalStorage(PROGRESS_STORAGE_KEY, []);
    //     setSettings({});
    //     saveToLocalStorage(SETTINGS_STORAGE_KEY, {});
    //     setCurrent({});
    //     saveToLocalStorage(CURRENT_STORAGE_KEY, {});
    // }

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
            levelProgress.bestSolvedWhen = Date.now();
            levelProgress.bestTaps = taps;
        }
        levelProgress.playedTimes += 1;
        levelProgress.lastSolvedWhen = Date.now();

        progress[mode] = modeProgress;
        progress[mode][level] = levelProgress;
        saveToLocalStorage(PROGRESS_STORAGE_KEY, progress);
        setProgress([...progress]);
    }

    const getLevelsSolved = (mode) => {
        //return 25; //hardcoded for now
        const modeProgress = progress[mode] || [];
        return modeProgress.filter(level => level && level.bestTaps < Infinity).length;
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

    const getModeProgress = (mode) => {
        return progress[mode] || [];
    }


    const updateProgress = (newProgress) => {
        //saveToLocalStorage(PROGRESS_STORAGE_KEY, { ...progress, ...newProgress });
        //setProgress((prev) => ({ ...prev, ...newProgress }));
    };

    const updateSettings = (newSettings) => {
        if (newSettings.name === "!!!") {
            //reset all data on secret name, need to restart/refresh to apply
            saveToLocalStorage(PROGRESS_STORAGE_KEY, []);
            saveToLocalStorage(SETTINGS_STORAGE_KEY, {});
            saveToLocalStorage(CURRENT_STORAGE_KEY, {});
        } else {
            saveToLocalStorage(SETTINGS_STORAGE_KEY, { ...settings, ...newSettings });
            saveToLocalStorage(CURRENT_STORAGE_KEY, current);
            saveToLocalStorage(PROGRESS_STORAGE_KEY, progress);
        }
        setSettings((prev) => ({ ...prev, ...newSettings }));
    };

    useEffect(() => {
        console.log("Settings changed:", settings);
        BEEP.sound = settings.sound;
        BEEP.vibro = settings.vibro;
        MUSIC.off = !settings.music;
    }, [settings.sound, settings.vibro, settings.music]);

    return (
        <GameContext.Provider value={{ settings, getLevelsSolved, getLevelStats, markLevelSolved, updateSettings }}>
            {children}
        </GameContext.Provider>
    );
}

// Custom hook for easy access
export function useGame() {
    return useContext(GameContext);
}
