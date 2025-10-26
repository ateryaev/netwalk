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

            <div className="bg-puzzle text-white xpl-3 p-6 flex gap-0 items-center  z-10" style={{ paddingTop: "calc(24px + env(safe-area-inset-top))" }}>
                <RoundButton onClick={onBack} className="ring-0 text-2xl bg-white text-puzzle"><SvgMenu /></RoundButton>
                <BigTitled className={"text-right flex-1"} title={title}>{!!subtitle ? subtitle : <>&nbsp;</>}</BigTitled>
                {/* <Titled className={"text-right flex-1"} title={<span className="text-[120%] font-bold">{title}</span>}>{!!subtitle ? subtitle : <>&nbsp;</>}</Titled> */}
            </div>

            {!!subheader && <div className={cn('bg-white z-10 overflow-hidden')}>
                <div className={cn('transition-all duration-500 bg-white p-2 flex gap-2 ',
                    erased && "scale-y-0 opacity-0  duration-200",
                )}>
                    {subheader}
                </div>
            </div>}

            <div className={cn("transition-all duration-500 flex flex-col flex-1 bg-[#33f] overflow-y-auto overflow-hidden",
                erased && "opacity-0 duration-200")}>

                <div className="h-0 z-10">
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
                <div className={cn('duration-500 transition-all flex items-center justify-center p-2 gap-2 ps-3 pe-2',
                    erased && "opacity-0 scale-y-0  duration-200"
                )}>{footer}</div>
            </div>}
        </div>
    )
}