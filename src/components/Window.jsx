import { useEffect, useState } from "react"
import { cn } from "../utils/cn"
import { MenuButton, RoundButton, ShowMenuButton } from "./Button"
import { BigTitled, Blink, Titled } from "./UI";
import { SvgMenu } from "./Svg";

export function WindowHeader({ children, ...props }) {
    return (
        <div>
            {children}
        </div>
    )
}

export function Window({ onBack, title, subtitle, footer, subheader, className, infobar, erased, children, ...props }) {

    const [infoCurrent, setInfoCurrent] = useState(infobar);
    const [infoOn, setInfoOn] = useState(!!infobar);
    useEffect(() => {
        setInfoOn(!!infobar);
        if (!!infobar) setInfoCurrent(infobar);
    }, [infobar]);

    return (
        <div className={cn("flex flex-col bg-[#333] size-full duration-500", className)}>

            <div className="bg-puzzle text-white p-4 pt-6 flex items-center z-10">
                <RoundButton onClick={onBack} className={cn("-my-2 delay-0 duration-200 text-whitex")}><SvgMenu /></RoundButton>
                <BigTitled className={cn("text-right flex-1")}
                    title={title} subtitle={subtitle} />
            </div>

            <div className={cn('bg-white z-10 overflow-hidden')}>
                <div
                    key={title + subtitle}
                    className={cn('transition-all  delay-300 xduration-200 bg-white p-2 flex gap-2 ',
                        'starting:scale-y-0 starting:opacity-30',
                        // erased && "translate-y-4 opacity-0  xduration-200",
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

            <div className='text-puzzle  font-semibold  bg-white uppercase whitespace-nowrap'>
                <div key={title + subtitle}
                    className={cn('delay-300 transition-all flex flex-col items-center justify-center p-2 gap-2 ps-3 pe-2',
                        'starting:scale-y-0 starting:opacity-30'
                    )}>{footer}</div>
            </div>
        </div>
    )
}