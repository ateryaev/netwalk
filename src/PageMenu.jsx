import { use, useEffect, useState } from "react";
import { DetailedButton, MenuButton, PinkButton, SvgNext, SvgPlay, SvgRestart } from "./components/Button";
import Modal from "./components/Modal";
import { Inv } from "./components/UI";
import { cn } from "./utils/cn";
import { GAME_LEVEL_COLORS, GAME_LEVEL_EMPTY, GAME_LEVEL_SIZE, GAME_MODE_AVAILABLE, GAME_MODE_BORDERED, GAME_MODE_EMPTIES, GAME_MODE_SCORE, GAME_MODE_TO_UNLOCK, GAME_MODE_TUTORIALS, GAME_MODES } from "./utils/gameconstants";
import { GetLevelsSolved } from "./utils/gamestats";
import { rnd } from "./utils/numbers";

function LabelNew() {
    return <div className="bg-puzzle text-[#fff] px-1 ring-puzzle rounded-xs lowercase hue-rotate-180">new</div>
}
export function PageMenu({ shown, onBack, onAbout, onSettings, onStory, onCustom }) {
    return (
        <Modal shown={shown} title={"Netwalk"} onClose={onBack}>
            <div className='flex flex-col gap-0 items-stretch p-2'>
                <DetailedButton onClick={onStory}
                    value={""}
                    subvalue={<LabelNew />}
                    subtitle={"modes available: 3"}
                >game levels</DetailedButton>
                <DetailedButton
                    value={"140'440"}
                    subvalue={"points"}
                    subtitle={"global rank: 42"}

                >leaderboard</DetailedButton>
                <DetailedButton
                    value={"Player123"}
                    subtitle={"sounds: OFF, music: OFF"}
                    subvalue={"name"}
                >Settings</DetailedButton>
                <DetailedButton
                    value={"by"}
                    subtitle={"version 1.0.0"}
                    subvalue={"anton teryaev"}
                >About</DetailedButton>
            </div>
        </Modal>
    );
}

export function PageSettings({ shown, onBack }) {
    return (
        <Modal shown={shown} title={"Settings"} onBack={onBack}>
            <div className='flex flex-col gap-4 items-stretch p-2 m-auto '>
                Settings
                <div>Music ON</div>
                <div>Sounds ON</div>
                <div>Vibro ON</div>
                <div>Rotate CLOCKWISE</div>
                <div>Theme LIGHT</div>
            </div>
        </Modal>
    );
}

export function PageStory({ shown, onStorySelect, onBack, ...props }) {
    function ModeButton({ mode, points, emptyFrom, emptyTo, toUnlock, bordered, ...props }) {
        let subtitle = null;
        if (toUnlock > 100) subtitle = "play more to unlock"
        else if (toUnlock > 0) subtitle = <>solve <Inv>{toUnlock}</Inv> more to unlock</>
        else subtitle = <>{(bordered ? "bordered" : "looped")} <Inv>{emptyFrom}-{emptyTo}%</Inv> empty</>;

        return (<DetailedButton
            disabled={toUnlock > 0}
            subtitle={subtitle}
            value={points > 0 && points.toLocaleString('en-US')}
            subvalue={points === 0 ? (toUnlock <= 0 ? <LabelNew /> : "locked") : "points"}
            {...props}>
            {mode}
        </DetailedButton>)
    }

    return (
        <Modal shown={shown} title={"game modes"} onBack={onBack}>
            <div className='p-2 flex flex-col gap-0 items-stretch'>
                {GAME_MODES.map((mode, index) => (
                    <ModeButton key={index}
                        toUnlock={GAME_MODE_TO_UNLOCK(index, GetLevelsSolved(index - 1))}
                        mode={mode}
                        points={GAME_MODE_SCORE(index, GetLevelsSolved(index))}
                        emptyFrom={GAME_MODE_EMPTIES[index][0]}
                        emptyTo={GAME_MODE_EMPTIES[index][1]}
                        bordered={GAME_MODE_BORDERED[index]}
                        onClick={() => onStorySelect && onStorySelect(index)}
                    />))}

            </div>
        </Modal >
    );
}

export function PageStoryLevels({ shown, onLevelSelect, onBack, mode = 0 }) {


    const [currentMode, setCurrentMode] = useState(mode);
    useEffect(() => {
        if (!shown) return;
        setCurrentMode(mode);
    }, [mode, shown]);
    function LevelButton({ level, disabled, size, colors, empties, times, isRandom, ...props }) {
        //<svg className='hue-rotate-180 -mx-1' width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
        let subvalue;
        if (times === 0 && !disabled) subvalue = <LabelNew />
        else if (isRandom) subvalue = "times";
        else if (disabled) subvalue = "locked";
        else subvalue = "solved";

        if (level === 0 && times > 0) subvalue = "completed";

        let subtitle;
        if (disabled) subtitle = "solve previous to unlock";
        else if (isRandom) subtitle = <>size:{size.x}<Inv className={"-m-1 lowercase"}>x</Inv>{size.y},&nbsp;every time new</>;
        else subtitle = <>
            size:{size.x}<Inv className={"-m-1 lowercase"}>x</Inv>{size.y},&nbsp;
            colors: <Inv>{colors}</Inv>,
            empty: <Inv>{empties}</Inv>
        </>;

        if (level === 0) subtitle = GAME_MODE_TUTORIALS[currentMode];

        //let subtitle="solve previous to unlock";
        return (
            <DetailedButton className={cn("xpy-0.5", isRandom && "ring-puzzle/30 ring-2 bg-puzzle/10")}
                subtitle={subtitle}
                value={isRandom && times > 0 && times}
                subvalue={subvalue}
                disabled={disabled}
                {...props}>
                {level === 0 && "Tutorial"}
                {isRandom && "Random " + level}
                {!isRandom && level > 0 && "Level " + level}

            </DetailedButton>
        )
    }
    const solved = GetLevelsSolved(currentMode);
    return (
        <Modal shown={shown} title={GAME_MODES[currentMode]} isbottom={true} onBack={onBack}>


            <div className='flex p-2 flex-col'>

                {Array.from({ length: solved + 1 }, (_, index) => (

                    <LevelButton key={index} level={index}
                        size={GAME_LEVEL_SIZE(currentMode, index)}
                        colors={GAME_LEVEL_COLORS(0, index)}
                        empties={GAME_LEVEL_EMPTY(0, index)}
                        times={index === solved ? 0 : 1}
                        isRandom={index % 5 === 0 && index > 0}
                        onClick={() => onLevelSelect && onLevelSelect(currentMode, index)}
                    />
                ))}

                <LevelButton disabled level={solved + 1}
                    isRandom={false}
                />

                {/* <DetailedButton
                    subtitle={"size: 15x16, colors: 4, empty: 9"}

                    subvalue={<LabelNew />}>
                    level 11
                </DetailedButton>

                <DetailedButton disabled
                    subtitle={"solve previous to unlock"}
                    subvalue={"locked"}>
                    level 12
                </DetailedButton> */}
                {/* <div className="p-2 pb-4 text-center opacity-50 text-[10px] xhue-rotate-180 uppercase text-puzzle xbg-black/20 z-10 xsticky xtop-0  ">
                    solve new to unlock next
                </div> */}

            </div>

        </Modal >);
}