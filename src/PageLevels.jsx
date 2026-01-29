import React, { use, useEffect, useMemo, useState, ViewTransition } from "react";
import { DetailedButton, MenuButton, SvgPlay } from "./components/Button";
import { SubContent, SubHeader } from "./components/Modal";
import { Blink, Frame, Inv, LabelNew, LabelPlay, LabeNow } from "./components/UI";
import { cn } from "./utils/cn";
import { GAME_LEVEL_COLORS, GAME_LEVEL_EMPTY, GAME_LEVEL_RANDOM, GAME_LEVEL_SIZE, GAME_MODE_BORDERED, GAME_MODE_SCORE, GAME_MODE_TO_UNLOCK, GAME_MODE_TUTORIALS, GAME_MODES } from "./game/gameconstants";
import { rnd } from "./utils/numbers";
import { useGame } from "./GameContext";
import { usePageHistory } from "./components/PageHistory";
import { SvgLoad } from "./components/Svg";

function LevelButton({ level, disabled, className, size, colors, empties, times, isRandom, selected, isNewest, now, ...props }) {
    const { currentData } = usePageHistory();
    const mode = currentData ? currentData.mode : 0;
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
            special={now && !selected}
            className={cn("bg-gray-50 disabled:bg-white",
                selected && "bg-ipuzzle/20 text-ipuzzle scroll-m-2 active:bg-ipuzzle/10 focus:bg-ipuzzle/10",
                "active:bg-ipuzzle/10 focus:bg-ipuzzle/10", className)}
            subtitle={subtitle}
            value={isRandom && times > 0 && times}
            subvalue={subvalue}
            disabled={disabled}
            {...props}>
            {levelName}
            {now && <LabeNow className={selected && "xxtext-white"} />}
        </DetailedButton>
    )
}

export function PageLevels({ onLevelSelect }) {
    const { getLevelsSolved, getLevelStats, current } = useGame();
    const { currentData } = usePageHistory();


    const mode = currentData ? currentData.mode : 0;
    const solved = getLevelsSolved(mode);
    const levelPlaying = mode === current.mode ? current.level : solved;



    const [selectedIndex, setSelectedIndex] = useState(levelPlaying);
    const [limit, setLimit] = useState(20);

    function increaseLimit() {
        setLimit((prev) => prev + 10);
    }

    function handleLevelSelect(level) {
        if (level === selectedIndex && level >= 0) {
            onLevelSelect?.(mode, level);
            return;
        }
        setSelectedIndex(level);
    }

    useEffect(() => {
        if (levelPlaying === solved) {
            const modalscroller = document.querySelector(".modalscroller");
            if (modalscroller) modalscroller.scrollTop = modalscroller.scrollHeight;
        } else {
            const element = document.querySelector(".scrolltoitem");
            if (element) element.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
        }
    }, []);

    return (<>
        <SubHeader className={""}>{GAME_MODES[mode]}</SubHeader>
        <SubContent key="LevelsKey" className={""}>
            <Frame>

                {limit < solved && <MenuButton
                    className={cn("bg-ipuzzle/20 text-ipuzzle",
                        "active:bg-ipuzzle/10 focus:bg-ipuzzle/10"
                    )}
                    onClick={increaseLimit} >
                    show more
                </MenuButton>}
                {Array.from({ length: Math.min(solved, limit) + 1 }, (_, index) => {
                    const level = Math.max(0, solved - limit) + index;
                    return (
                        <LevelButton key={level} level={level}
                            now={level === levelPlaying && mode === current.mode}
                            selected={level === selectedIndex}
                            size={GAME_LEVEL_SIZE(mode, level)}
                            colors={GAME_LEVEL_COLORS(mode, level)}
                            empties={GAME_LEVEL_EMPTY(mode, level)}
                            times={getLevelStats(mode, level).playedTimes}
                            isRandom={GAME_LEVEL_RANDOM(mode, level)}
                            onClick={() => handleLevelSelect(level)}
                            isNewest={level === solved}
                            className={(selectedIndex === level || (level == solved && selectedIndex < 0)) && "scrolltoitem scroll-m-[calc(var(--safe-area-bottom,0px)+1rem)]"}
                        />
                    )
                })}
                <LevelButton disabled level={solved + 1} />
            </Frame>
        </SubContent>
    </>
    );
}
