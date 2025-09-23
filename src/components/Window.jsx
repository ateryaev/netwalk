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

export function Window({ onBack, title, subtitle, footer, subheader, className, infobar, children, ...props }) {

    const [infoCurrent, setInfoCurrent] = useState(infobar);
    const [infoOn, setInfoOn] = useState(!!infobar);
    useEffect(() => {
        setInfoOn(!!infobar);
        if (!!infobar) setInfoCurrent(infobar);
    }, [infobar]);

    return (
        <div className={cn("flex flex-col bg-amber-600 size-full", className)}>

            <div className="bg-puzzle pl-3 p-4 flex gap-4 items-center  z-10">
                <ShowMenuButton onClick={onBack} />
                <div className={cn("overflow-hidden flex-1 text-right text-sm text-white flex flex-col")}>
                    <div className="">&nbsp;</div>
                    <div className={cn("-my-1 text-3xl")}>{title}</div>
                    <div dir="rtl" className="uppercase h-0x opacity-50 whitespace-nowrap text-ellipsis overflow-hidden">
                        {!!subtitle ? subtitle : <>&nbsp;</>}
                    </div>
                </div>
            </div>

            {!!subheader && <div className={cn('bg-white p-2 flex gap-2 z-10')}>
                {subheader}
            </div>}

            <div className="flex-1 bg-[#333] overflow-y-auto overflow-x-hidden grid">
                {infoCurrent && <div
                    className={cn('transition-all p-3 pr-2 flex gap-3 justify-between items-center hue-rotate-180 bg-black/80 absolute w-full',
                        infoOn ? "opacity-100 -translate-y-0" : "opacity-0 -translate-y-1/2"
                    )}>
                    {infoCurrent}</div>}
                {children}
            </div>

            {!!footer && <div className='text-sm p-2 gap-2 text-puzzle/80
                flex font-semibold ps-3 pe-2 bg-white items-center justify-center
               uppercase whitespace-nowrap'>
                {footer}
            </div>}
        </div>
    )
}