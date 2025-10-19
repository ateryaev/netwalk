import { use, useEffect, useMemo, useState } from "react";
import { DetailedButton } from "./components/Button";
import Modal from "./components/Modal";
import { Blink, Inv, LabelNew, LabelPlay } from "./components/UI";
import { cn } from "./utils/cn";
import { GAME_MODE_BORDERED, GAME_MODE_EMPTIES, GAME_MODE_SCORE, GAME_MODE_TO_UNLOCK, GAME_MODES } from "./game/gameconstants";
import { GetAvailableModes, GetLevelsSolved, GetTotalScores } from "./game/gamestats";
import { useGame } from "./GameContext";

export function PageMenu({ shown, onBack, onAbout, onSettings, onStory, onRating }) {
    const { settings, getLevelsSolved } = useGame();

    const totalScore = useMemo(() => {
        return GAME_MODES.reduce((total, _, mode) =>
            total + GAME_MODE_SCORE(mode, getLevelsSolved(mode)), 0);
    }, [getLevelsSolved]);

    //use: GAME_MODE_AVAILABLE, getLevelsSolved, implement: availableModes
    const availableModes = useMemo(() => {
        let modes = 1;
        for (let mode = 1; mode < GAME_MODES.length; mode++) {
            if (GAME_MODE_TO_UNLOCK(mode, getLevelsSolved(mode - 1)) === 0) modes++;
            else break;
        }
        return modes;
    }, [getLevelsSolved]);

    return (
        <Modal shown={shown} title={"Netwalk"} onClose={onBack}>
            <div className='flex flex-col gap-0 items-stretch p-2'>
                <DetailedButton onClick={onStory}
                    value={getLevelsSolved(availableModes - 1) === 0 && <LabelNew />}
                    subvalue={""}
                    subtitle={"modes available: " + availableModes}
                >game levels</DetailedButton>
                <DetailedButton
                    onClick={onRating}
                    value={totalScore.toLocaleString('en-US')}
                    subvalue={"points"}
                    subtitle={"global rank: ??"}

                >leaderboard</DetailedButton>
                <DetailedButton
                    onClick={onSettings}
                    value={<div className="normal-case">{settings.name}</div>}
                    subtitle={`sound: ${settings.sound ? "ON" : "OFF"} music: ${settings.music ? "ON" : "OFF"}`}
                    subvalue={"name"}
                >Settings</DetailedButton>
                <DetailedButton
                    onClick={onAbout}
                    value={"by"}
                    subtitle={"version 1.0.0"}
                    subvalue={"anton teryaev"}
                >About</DetailedButton>
            </div>
        </Modal>
    );
}



export function PageModes({ shown, onModeSelect, onBack, onClose, ...props }) {
    const { getLevelsSolved } = useGame();

    function ModeButton({ mode, points, emptyFrom, emptyTo, toUnlock, bordered, ...props }) {
        let subtitle = null;
        if (toUnlock > 100) subtitle = "play more to unlock"
        else if (toUnlock > 0) subtitle = <>solve <Inv>{toUnlock}</Inv> more to unlock</>
        else subtitle = <>{(bordered ? "bordered" : "looped")} <Inv>{emptyFrom}-{emptyTo}%</Inv> empty</>;

        return (<DetailedButton
            disabled={toUnlock > 0}
            subtitle={subtitle}
            value={points > 0 && points.toLocaleString('en-US') || toUnlock <= 0 && <LabelNew />}
            //subvalue={points === 0 ? (toUnlock <= 0 ? <LabelNew /> : "locked") : "points"}
            subvalue={points === 0 ? (toUnlock <= 0 ? "" : "locked") : "points"}
            {...props}>
            {mode}
        </DetailedButton>)
    }

    return (
        <Modal shown={shown} title={"game modes"} onBack={onBack} onClose={onClose}>
            <div className='p-2 flex flex-col gap-0 items-stretch'>
                {GAME_MODES.map((modeName, index) => (
                    <ModeButton key={index}
                        toUnlock={GAME_MODE_TO_UNLOCK(index, getLevelsSolved(index - 1))}
                        mode={modeName}
                        //points={GAME_MODE_SCORE(index, GetLevelsSolved(index))}
                        points={GAME_MODE_SCORE(index, getLevelsSolved(index))}
                        emptyFrom={GAME_MODE_EMPTIES[index][0]}
                        emptyTo={GAME_MODE_EMPTIES[index][1]}
                        bordered={GAME_MODE_BORDERED[index]}
                        onClick={() => onModeSelect?.(index)}
                    />))}

            </div>
        </Modal >
    );
}

