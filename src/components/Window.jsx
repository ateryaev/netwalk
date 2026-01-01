import { useEffect, useState } from "react"
import { cn } from "../utils/cn"
import { MenuButton, RoundButton, ShowMenuButton } from "./Button"
import { BigTitled, Blink, Inv, Titled } from "./UI";
import { SvgMenu } from "./Svg";
import { useGame } from "../GameContext";
import { GAME_MODE_SCORE, GAME_MODE_TO_UNLOCK, GAME_MODES } from "../game/gameconstants";

export function WindowHeader({ children, ...props }) {
    return (
        <div>
            {children}
        </div>
    )
}

export function Window({ onBack, title, subtitle, footer, subheader, className, infobar, erased, children, ...props }) {

    const { settings, getLevelsSolved, updateSettings, current } = useGame();
    //GAME_MODES.map((modeName, index) => (
    // const points=GAME_MODE_SCORE(index, getLevelsSolved(index));
    // const toUnlock= GAME_MODE_TO_UNLOCK(index, getLevelsSolved(index - 1));
    // const isNewMode =  points === 0  && toUnlock <= 0;
    // detect new game modes
    const hasNewMode = Array.isArray(GAME_MODES) && GAME_MODES.some((modeName, index) => {
        if (index === current.mode) return false;
        const solvedForThis = getLevelsSolved(index);
        const solvedForPrev = getLevelsSolved(index - 1);
        const points = GAME_MODE_SCORE(index, solvedForThis);
        const toUnlock = GAME_MODE_TO_UNLOCK(index, solvedForPrev);
        return points === 0 && toUnlock <= 0;
    });


    const [infoCurrent, setInfoCurrent] = useState(infobar);
    const [infoOn, setInfoOn] = useState(!!infobar);
    useEffect(() => {
        setInfoOn(!!infobar);
        if (!!infobar) setInfoCurrent(infobar);
    }, [infobar]);

    return (
        <div className={cn("flex flex-col bg-[#333] size-full", className)}>

            <div className="bg-puzzle text-white p-4 pt-[calc(20px+var(--safe-area-top,0px))] pl-2xx flex items-center z-10 gap-2">
                <RoundButton onClick={onBack}>
                    <SvgMenu />
                    {hasNewMode && <Blink className="w-1 bg-puzzle/50 h-1 rounded-full absolute ml-6 mb-6"></Blink>}
                </RoundButton>
                <BigTitled className={cn("text-right flex-1")} title={title} subtitle={subtitle} />
            </div>

            <div className={cn('bg-white z-10 overflow-hidden')}>
                <div
                    key={title + subtitle}
                    className={cn('transition-all delay-300 scale-100 opacity-100 bg-white p-2 flex gap-2 starting:scale-y-5 starting:opacity-30'
                    )}>
                    {subheader}
                </div>
            </div>

            <div className={cn("transition-all duration-500 flex flex-col flex-1 bg-[#33f] overflow-y-auto overflow-hidden",
                erased && "opacity-0 duration-200")}>

                <div className="h-0 z-10">
                    <div className={cn("transition-all p-3 xpr-2 flex gap-2 justify-between items-center hue-rotate-180 bg-[#181818]/80",
                        infoOn ? "translate-y-0 opacity-100" : "opacity-0 -translate-y-full"
                    )}>
                        {infoCurrent}
                    </div>
                </div>

                {children}

                <div className="h-0">
                    <div className={cn(" transition-all bg-[#181818]/80 text-center hue-rotate-180 text-white p-2 select-none",
                        infoOn ? "-translate-y-full opacity-100" : "opacity-0 translate-y-0"
                    )}>
                        <span className="animate-pulse">CONGRATULATION</span>
                    </div>
                </div>
            </div>

            <div className='text-puzzle  font-semibold  bg-white uppercase whitespace-nowrap pb-[calc(var(--safe-area-bottom,0px))]'>
                <div key={title + subtitle}
                    className={cn('delay-300 transition-all flex flex-col items-center justify-center p-2 gap-2 ps-3 pe-2',
                        'scale-100 opacity-100 starting:scale-y-0 starting:opacity-30'
                    )}>{footer}</div>
            </div>
        </div>
    )
}