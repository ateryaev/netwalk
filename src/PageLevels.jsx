import { use, useEffect, useState } from "react";
import { DetailedButton, SvgPlay } from "./components/Button";
import Modal from "./components/Modal";
import { Blink, Inv, LabelNew, LabelPlay } from "./components/UI";
import { cn } from "./utils/cn";
import { GAME_LEVEL_COLORS, GAME_LEVEL_EMPTY, GAME_LEVEL_RANDOM, GAME_LEVEL_SIZE, GAME_MODE_BORDERED, GAME_MODE_EMPTIES, GAME_MODE_SCORE, GAME_MODE_TO_UNLOCK, GAME_MODE_TUTORIALS, GAME_MODES } from "./game/gameconstants";
import { GetLevelsSolved } from "./game/gamestats";
import { rnd } from "./utils/numbers";
import { useGame } from "./GameContext";

function SelectedButton({ levelName, isNew, ...props }) {
    return (
        <DetailedButton
            className={"bg-puzzle/20 ring-2 ring-puzzle rounded-xs"}
            subtitle={<Inv className="lowercase">tap again to play</Inv>}
            value={isNew ? <LabelNew /> : <LabelPlay />}
            {...props}>
            {levelName}
        </DetailedButton >
    )
}

export function PageLevels({ shown, onLevelSelect, onBack, onClose, mode }) {
    const [currentMode, setCurrentMode] = useState(mode);
    const { getLevelsSolved, getLevelStats } = useGame();

    useEffect(() => {
        if (!shown) return;
        setCurrentMode(mode);
    }, [mode, shown]);

    function LevelButton({ level, disabled, size, colors, empties, times, isRandom, selected, isNewest, ...props }) {
        let subvalue;
        const isNew = isNewest;//times === 0 && !disabled;

        if (isNew) subvalue = ""
        else if (isRandom) subvalue = "times";
        else if (disabled) subvalue = "locked";
        else subvalue = times === 0 ? "" : "solved";

        if (level === 0 && times > 0) subvalue = "completed";

        let subtitle;
        if (disabled) subtitle = "solve previous to unlock";
        else if (isRandom) subtitle = <>size:{size.x}<Inv className={"-m-1 lowercase"}>x</Inv>{size.y},&nbsp;<Inv>every time new</Inv></>;
        else subtitle = <>
            size:{size.x}<Inv className={"-m-1 lowercase"}>x</Inv>{size.y},&nbsp;
            colors: <Inv>{colors}</Inv>,
            empty: <Inv>{empties}</Inv>
        </>;

        if (level === 0) subtitle = GAME_MODE_TUTORIALS[currentMode];

        let levelName = "";
        if (level === 0) levelName = "Begin";
        else if (isRandom) levelName = "Random " + level;
        else if (level > 0) levelName = "Level " + level;

        if (selected) return (
            <SelectedButton levelName={levelName} isNew={times === 0} {...props} />
        )

        return (
            <DetailedButton
                subtitle={subtitle}
                value={isNew && <LabelNew /> || isRandom && times}
                subvalue={subvalue}
                disabled={disabled}
                {...props}>
                {levelName}
            </DetailedButton>
        )
    }

    const solved = getLevelsSolved(currentMode) + 10;
    const [selectedIndex, setSelectedIndex] = useState(-1);
    function handleLevelSelect(level) {
        if (level === selectedIndex && level >= 0) {
            onLevelSelect?.(mode, level);
            return;
        }
        setSelectedIndex(level);
    }
    useEffect(() => {
        if (shown) setSelectedIndex(-1);
    }, [shown])

    return (
        <Modal reversed={true} shown={shown} title={GAME_MODES[currentMode]} isbottom={true} onBack={onBack} onClose={onClose}>
            <div className='flex p-2 flex-col'>
                {Array.from({ length: solved + 1 }, (_, level) => (
                    <LevelButton key={level} level={level}
                        selected={level === selectedIndex}
                        size={GAME_LEVEL_SIZE(currentMode, level)}
                        colors={GAME_LEVEL_COLORS(mode, level)}
                        empties={GAME_LEVEL_EMPTY(mode, level)}
                        times={getLevelStats(mode, level).playedTimes}
                        isRandom={GAME_LEVEL_RANDOM(mode, level)}
                        onClick={() => handleLevelSelect(level)}
                        isNewest={level === solved}
                    />
                ))}
                <LevelButton disabled level={solved + 1} />
            </div>
        </Modal >);
}
