import { useEffect, useState } from "react"
import { cn } from "../utils/cn"
import { BackButton, MenuButton, ShowMenuButton } from "./Button"

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

            <div className="bg-puzzle pl-3 p-4 flex gap-4 items-center  z-10">
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

            <div className={cn("transition-all flex-1 bg-[#333] overflow-y-auto overflow-x-hidden grid",
                erased && "opacity-0")}>
                {infoCurrent && <div
                    className={cn('transition-all p-3 pr-2 flex gap-3 justify-between items-center hue-rotate-180 bg-black/80 absolute w-full',
                        infoOn ? "opacity-100 -translate-y-0" : "opacity-0 -translate-y-full",
                        erased && "scale-y-0 opacity-0"
                    )}>
                    {infoCurrent}</div>}
                {children}
            </div>

            {!!footer && <div className='text-puzzle  font-semibold  bg-white uppercase whitespace-nowrap'>
                <div className={cn('transition-all flex items-center justify-center p-2 gap-2 ps-3 pe-2',
                    erased && "opacity-0 scale-y-0 "
                )}>{footer}</div>
            </div>}
        </div>
    )
}