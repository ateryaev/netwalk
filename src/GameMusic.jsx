import { useCallback, useEffect, useState } from "react";
import { useGame } from "./GameContext";
import { usePageHistory } from "./components/PageHistory.tsx";
import MusicPlayer from "./utils/bgmusic.jsx";

const PAGE_START = "/";
const MUSIC_DEFAULT_1 = 'music/ethereal_whispers.mp3';
const MUSIC_DEFAULT_2 = 'music/dreaming_in_pixels.mp3'

const player = new MusicPlayer();

export const useGameMusic = () => {
    const { settings } = useGame();
    const [modeLevel, setModeLevel] = useState({ mode: 0, level: 0 });
    const [documentHidden, setDocumentHidden] = useState(false);
    const { currentPage } = usePageHistory();

    useEffect(() => {
        if (currentPage === PAGE_START && !documentHidden && settings.music) {
            player.resume(modeLevel.level === 1 ? MUSIC_DEFAULT_1 : MUSIC_DEFAULT_2)
        } else {
            player.pause();
        }
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