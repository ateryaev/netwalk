import { useCallback, useEffect, useState } from "react";
import { useGame } from "./GameContext";
import { usePageHistory } from "./components/PageHistory.tsx";
import MusicPlayer from "./utils/bgmusic.jsx";
import { GAME_LEVEL_RANDOM } from "./game/gameconstants.ts";

const PAGE_START = "/";
const MUSIC_DEFAULT_1 = 'music/mode_1.mp3';
const MUSIC_DEFAULT_2 = 'music/mode_2.mp3';

const MUSIC_WITH_WORDS_1 = [
    'music/too_young_to_lose_1.mp3',
    'music/hey_not_too_rough_1.mp3',
    'music/hurt_me_plenty_1.mp3',
    'music/ultra_violence_1.mp3',
    'music/nightmare_1.mp3'
]
const MUSIC_WITH_WORDS_2 = [
    'music/too_young_to_lose_2.mp3',
    'music/hey_not_too_rough_2.mp3',
    'music/hurt_me_plenty_2.mp3',
    'music/ultra_violence_2.mp3',
    'music/nightmare_2.mp3'
]
const MUSIC_FOR_MODES = [
    'music/mode_0.mp3',
    'music/mode_1.mp3',
    'music/mode_2.mp3',
    'music/mode_3.mp3',
    'music/mode_4.mp3'
]

const MUSIC_DEFAULT = [
    'music/netwalk_1.mp3',
    'music/netwalk_2.mp3'
]

const player = new MusicPlayer();

export const useGameMusic = () => {
    const { settings } = useGame();
    const [modeLevel, setModeLevel] = useState({ mode: 0, level: 0 });
    const [documentHidden, setDocumentHidden] = useState(false);
    const { currentPage } = usePageHistory();

    useEffect(() => {
        const { level, mode } = modeLevel;
        if (level === 0 || currentPage !== PAGE_START || documentHidden || !settings.music) {
            player.pause();
            return;
        }

        if (GAME_LEVEL_RANDOM(mode, level)) {
            player.resume(level % 2 === 0 ? MUSIC_WITH_WORDS_1[mode] : MUSIC_WITH_WORDS_2[mode]);
            return;
        }

        if (level > 8 && level % 10 < 2) {
            player.resume(MUSIC_FOR_MODES[mode]);
            return;
        }

        player.resume(MUSIC_DEFAULT[mode % MUSIC_DEFAULT.length]);

    }, [currentPage, documentHidden, modeLevel, settings.music]);

    useEffect(() => {
        const handleVisibilityChange = () => setDocumentHidden(document.hidden);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);
    return { setModeLevel };
};