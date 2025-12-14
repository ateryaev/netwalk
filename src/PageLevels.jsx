import { use, useEffect, useMemo, useState, ViewTransition } from "react";
import { DetailedButton, SvgPlay } from "./components/Button";
import { SubContent, SubHeader } from "./components/Modal";
import { Blink, Inv, LabelNew, LabelPlay } from "./components/UI";
import { cn } from "./utils/cn";
import { GAME_LEVEL_COLORS, GAME_LEVEL_EMPTY, GAME_LEVEL_RANDOM, GAME_LEVEL_SIZE, GAME_MODE_BORDERED, GAME_MODE_SCORE, GAME_MODE_TO_UNLOCK, GAME_MODE_TUTORIALS, GAME_MODES } from "./game/gameconstants";
import { rnd } from "./utils/numbers";
import { useGame } from "./GameContext";
import { usePageHistory } from "./components/PageHistory";

export function PageLevels({ onLevelSelect }) {
    const { getLevelsSolved, getLevelStats, current } = useGame();
    const { currentData } = usePageHistory();

    const mode = currentData ? currentData.mode : 0;
    const levelPlaying = mode === current.mode ? current.level : -1;

    function LevelButton({ level, disabled, className, size, colors, empties, times, isRandom, selected, isNewest, ...props }) {
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
        //else if (selected && levelPlaying === level) subtitle = <Blink>tap again to continue</Blink>;
        else if (selected) subtitle = <Blink>tap again to play</Blink>;
        else if (isRandom) subtitle = <>size:{size.x}<Inv>&times;</Inv>{size.y},&nbsp;<Inv>every time new</Inv></>;
        else subtitle = <>
            size: {size.x}<Inv>&times;</Inv>{size.y},&nbsp;
            colors: <Inv>{colors}</Inv>,
            empty: <Inv>{empties}</Inv>
        </>;

        if (!selected && level === 0) subtitle = GAME_MODE_TUTORIALS[mode];

        let levelName = "";
        if (level === 0) levelName = "Begin";
        else if (isRandom) levelName = "Random " + level;
        else if (level > 0) levelName = "Level " + level;

        return (
            <DetailedButton
                special={level === levelPlaying && !selected}
                className={cn("",
                    selected && "bg-ipuzzle text-white scroll-m-2", className)}
                subtitle={subtitle}
                value={isRandom && times > 0 && times}
                subvalue={subvalue}
                disabled={disabled}
                {...props}>
                {levelName}
            </DetailedButton>
        )
    }

    const solved = getLevelsSolved(mode);
    //const defaultIndex = levelPlaying;// < 0 ? solved : levelPlaying;

    const [selectedIndex, setSelectedIndex] = useState(levelPlaying);


    function handleLevelSelect(level) {
        if (level === selectedIndex && level >= 0) {
            onLevelSelect?.(mode, level);
            return;
        }
        setSelectedIndex(level);
    }

    useEffect(() => {
        const element = document.querySelector(".scrolltoitem");
        if (!element) return;
        element.parentNode.scrollTop = element.offsetTop;
        element?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
    }, [selectedIndex]);

    return (<>
        <SubHeader className={""}>{GAME_MODES[mode]}</SubHeader>

        <SubContent key="LevelsKey" className={""}>
            {Array.from({ length: solved + 1 }, (_, level) => (
                <LevelButton key={level} level={level}
                    selected={level === selectedIndex}
                    size={GAME_LEVEL_SIZE(mode, level)}
                    colors={GAME_LEVEL_COLORS(mode, level)}
                    empties={GAME_LEVEL_EMPTY(mode, level)}
                    times={getLevelStats(mode, level).playedTimes}
                    isRandom={GAME_LEVEL_RANDOM(mode, level)}
                    onClick={() => handleLevelSelect(level)}
                    isNewest={level === solved}
                    className={(selectedIndex === level || (level == solved && selectedIndex < 0)) && "scrolltoitem"}
                />
            ))}
            <LevelButton disabled level={solved + 1} />
        </SubContent>

    </>
    );
}
