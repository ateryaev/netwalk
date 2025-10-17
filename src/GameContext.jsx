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

// Create a provider component
export function GameProvider({ children }) {

    const [settings, setSettings] = useState(loadFromLocalStorage(SETTINGS_STORAGE_KEY, {
        sound: true,
        music: false,
        vibro: true,
        lang: "en",
        name: "SimplePlayer"
    }));

    // bordered: boolean,
    // mode: number,
    // level: number,
    // taps: number,
    // hintXY: XY[] | undefined

    const [progress, setProgress] = useState(loadFromLocalStorage(PROGRESS_STORAGE_KEY, {
        solved: [10, 0, 0, 0, 0],
        current: createGameTutorial0()
    }));

    const updateProgress = (newProgress) => {
        saveToLocalStorage(PROGRESS_STORAGE_KEY, { ...progress, ...newProgress });
        setProgress((prev) => ({ ...prev, ...newProgress }));
    };

    const updateSettings = (newSettings) => {
        saveToLocalStorage(SETTINGS_STORAGE_KEY, { ...settings, ...newSettings });
        setSettings((prev) => ({ ...prev, ...newSettings }));
    };

    useEffect(() => {
        console.log("Settings changed:", settings);
        BEEP.sound = settings.sound;
        BEEP.vibro = settings.vibro;
        MUSIC.off = !settings.music;
    }, [settings.sound, settings.vibro, settings.music]);

    return (
        <GameContext.Provider value={{ settings, updateSettings, progress, updateProgress }}>
            {children}
        </GameContext.Provider>
    );
}

// Custom hook for easy access
export function useGame() {
    return useContext(GameContext);
}
