import { useEffect, useState } from "react"
import { cn } from "../utils/cn"
import { BackButton, MenuButton, ShowMenuButton } from "./Button"
import { Blink } from "./UI";

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

            <div className="bg-puzzle pl-3 p-4 flex gap-4 items-center  z-10" style={{ paddingTop: "calc(16px + env(safe-area-inset-top))" }}>
                <ShowMenuButton onClick={onBack} />
                <div className={cn("transition-all overflow-hidden flex-1 text-right xtext-sm text-white flex flex-col",
                    erased && "opacity-0 scale-y-0",
                )}>
                    <div className="">&nbsp;</div>
                    <div className={cn("-my-1 text-[200%]")}>{title}</div>
                    <div dir="rtl" className="uppercase h-0x opacity-50 whitespace-nowrap text-ellipsis overflow-hidden">
                        {!!subtitle ? subtitle : <>&nbsp;</>}
                    </div>
                </div>
            </div>

            {!!subheader && <div className={cn('bg-white z-10 overflow-hidden')}>
                <div className={cn('transition-all bg-white p-2 flex gap-2 ',
                    erased && "scale-y-0 opacity-0",
                )}>
                    {subheader}
                </div>
            </div>}

            <div className={cn("transition-all flex flex-col flex-1 bg-[#33f] overflow-y-auto overflow-hidden",
                erased && "opacity-0")}>

                <div className="h-0">
                    <div className={cn("transition-all p-3 pr-2 flex gap-3 justify-between items-center hue-rotate-180 bg-[#181818]/80",
                        !erased && infoOn ? "translate-y-0 opacity-100" : "opacity-0 -translate-y-full"
                    )}>
                        {infoCurrent}
                    </div>
                </div>

                {children}

                <div className="h-0">
                    <div className={cn(" transition-all bg-[#181818]/80 text-center hue-rotate-180 text-white p-4 select-none",
                        !erased && infoOn ? "-translate-y-full opacity-100" : "opacity-0 -translate-y-0"
                    )}>
                        <span className="animate-pulse">CONGRATULATION</span>
                    </div>
                </div>
            </div>

            {!!footer && <div className='text-puzzle  font-semibold  bg-white uppercase whitespace-nowrap'>
                <div className={cn('transition-all flex items-center justify-center p-2 gap-2 ps-3 pe-2',
                    erased && "opacity-0 scale-y-0 "
                )}>{footer}</div>
            </div>}
        </div>
    )
}