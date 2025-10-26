import { use, useEffect, useState } from "react";
import { DetailedButton, SvgPlay } from "./components/Button";
import Modal, { SubContent, SubHeader } from "./components/Modal";
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

export function PageLevels({ shown, onLevelSelect, onBack, onClose, levelPlaying, mode }) {
    const [currentMode, setCurrentMode] = useState(mode);
    const { getLevelsSolved, getLevelStats } = useGame();

    useEffect(() => {
        if (!shown) return;
        setCurrentMode(mode);
    }, [mode, shown]);

    function LevelButton({ level, disabled, size, colors, empties, times, isRandom, selected, isNewest, ...props }) {
        let subvalue;
        const isNew = isNewest;//times === 0 && !disabled;

        if (isNewest && !selected) subvalue = <Blink><Inv>new</Inv></Blink>;
        else if (times === 0 && selected) subvalue = "new";
        else if (times === 0) subvalue = <Inv>new</Inv>;
        else if (isRandom) subvalue = "times";
        else if (disabled) subvalue = "locked";
        else subvalue = times === 0 ? "" : "solved";

        if (level === 0 && times > 0) subvalue = "completed";

        let subtitle;
        if (disabled) subtitle = "solve previous to unlock";
        else if (selected && levelPlaying === level) subtitle = <Blink>tap again to continue</Blink>;
        else if (selected) subtitle = <Blink>tap again to play</Blink>;
        else if (isRandom) subtitle = <>size:{size.x}<Inv>&times;</Inv>{size.y},&nbsp;<Inv>every time new</Inv></>;
        else subtitle = <>
            size:{size.x}<Inv>&times;</Inv>{size.y},&nbsp;
            colors: <Inv>{colors}</Inv>,
            empty: <Inv>{empties}</Inv>
        </>;

        if (!selected && level === 0) subtitle = GAME_MODE_TUTORIALS[currentMode];

        let levelName = "";
        if (level === 0) levelName = "Begin";
        else if (isRandom) levelName = "Random " + level;
        else if (level > 0) levelName = "Level " + level;


        return (
            <DetailedButton
                special={level === levelPlaying}
                className={cn(selected && "bg-[#D65F92] puzzle-400 text-white puzzle-100 scroll-m-2 z-10 scrolltoitem xsticky top-0 bottom-0"
                )}
                subtitle={subtitle}
                value={isRandom && times > 0 && times}
                subvalue={subvalue}
                disabled={disabled}
                {...props}>
                {levelName}
                {/* {level === playingLevel && <Blink className="lowercasex inline-block bg-puzzle/20 ">{levelName}</Blink>} */}
                {/* {level === playingLevel && <div className="lowercasex inline-block underline decoration-2 ">{levelName}</div>} */}
                {/* {level === playingLevel && <Blink className="lowercase inline-block px-1 text-xs -translate-y-1.5"><Inv>now</Inv></Blink>} */}

            </DetailedButton>
        )
    }

    const solved = getLevelsSolved(currentMode) + 10;
    const [selectedIndex, setSelectedIndex] = useState(-1);
    useEffect(() => {
        const solved = getLevelsSolved(currentMode) + 10;
        setSelectedIndex(levelPlaying < 0 ? solved : levelPlaying);

    }, [levelPlaying, currentMode])

    function handleLevelSelect(level) {
        if (level === selectedIndex && level >= 0) {
            onLevelSelect?.(mode, level);
            return;
        }
        setSelectedIndex(level);
    }
    const emptyFrom = GAME_MODE_EMPTIES[mode][0]
    const emptyTo = GAME_MODE_EMPTIES[mode][1]
    const bordered = GAME_MODE_BORDERED[mode];
    const subtitle = <>{(bordered ? "bordered" : "looped")} <Inv>{emptyFrom}-{emptyTo}%</Inv> empty</>;
    return (
        <Modal xreversed={true} shown={shown} title="Netwalk" subtitle={GAME_MODES[currentMode]} isbottom={true} onBack={onBack} onClose={onClose}>
            {/* <SubHeader className={"flex justify-betweenx gap-1"}>
                {subtitle}
            </SubHeader> */}
            <SubContent>
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

            </SubContent>
        </Modal >);
}
