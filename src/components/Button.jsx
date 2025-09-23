import { cn } from "../utils/cn"

export function Button({ onClick, children }) {
    return (
        <button onClick={onClick} className='rounded-full
        outline-none 
        focus:ring-4 focus:ring-blue-300/50 select-none
        text-puzzle xhue-rotate-180 uppercase
        px-6 py-1 bg-[#fff] tcursor-pointer border-puzzle border-8 '>
            {children}
        </button>
    )
}

export function ShowMenuButton({ onClick, ...props }) {
    function handleClick(e) {
        e.currentTarget.blur();
        onClick && onClick();
    }
    return (
        <button className="rounded-full  text-puzzle bg-white
                    p-3.5 text-2xl cursor-pointer select-none
                     focus:ring-6 focus:ring-white/40 outline-none
                     active:ring-6 active:ring-white/40 active:transition-none
                     transition-all duration-300"
            {...props} onClick={handleClick}>
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-menu-2"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 6l16 0" /><path d="M4 12l16 0" /><path d="M4 18l16 0" /></svg>
            {/* <SvgBack /> */}
        </button>
    )
}
export function BackButton({ onClick, ...props }) {
    function handleClick(e) {
        e.currentTarget.blur();
        onClick && onClick();
    }
    return (
        <button className="rounded-full border-none border-white text-white xbg-white/10
                    p-3 cursor-pointer select-none text-2xl
                    disabled:invisible disabled:pointer-events-none
                     focus:bg-white/20 outline-none
                     active:bg-white/20 transition-all"
            {...props} onClick={handleClick}>
            <SvgBack />
        </button>
    )
}

export function CloseButton({ onClick, ...props }) {
    function handleClick(e) {
        e.currentTarget.blur();
        onClick && onClick();
    }
    return (
        <button className="rounded-full border-none border-white text-white xbg-white/10
                    p-3 text-2xl cursor-pointer select-none
                    disabled:invisible disabled:pointer-events-none
                     focus:bg-white/20 outline-none
                     active:bg-white/20 transition-all"
            {...props} onClick={handleClick}>
            <svg className='' width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
        </button>
    )
}

export function PinkButton({ Svg, className, children, ...props }) {
    return (
        <button className={cn("flex items-center uppercase text-sm font-semibold  p-1.5 gap-0  rounded-full",
            "bg-white text-puzzle whitespace-nowrap cursor-pointer select-none",
            "focus:ring-6 focus:ring-puzzle/40 outline-none",
            "active:bg-puzzle active:text-white active:transition-none",
            "transition-colors duration-300",
            !children && "xbg-red-100 xpx-4 xpe-0",
            className)}
            {...props}>

            {Svg && <div className="bg-puzzle text-white rounded-full p-1.5"><Svg /></div>}
            {children && <div className="flex justify-between gap-1.5 text-ellipsis px-2 py-0.5 overflow-hidden text-center flex-1">
                {children}
            </div>}
        </button>
    )
}


export function MenuButton({ Svg, children, className, ...props }) {
    return (
        <button className={cn("items-center uppercase p-6 flex gap-2 justify-center xcapitalize",
            "text-darkpuzzle whitespace-nowrap cursor-pointer select-none outline-none",
            "active:bg-puzzle/10",
            "focus:bg-puzzle/10 xfocus:hue-rotate-180 disabled:cursor-default disabled:opacity-50",
            className)} {...props}>
            {children}
        </button>
    )
}

export function DetailedButton({ children, className, subtitle, value, subvalue, ...props }) {
    return (
        <MenuButton onClick={null} className={cn("p-4 flex-col gap-0 items-stretch", className)} {...props} >

            <div className="flex items-center justify-between">
                <div className="text-ellipsis overflow-hidden">
                    {children}
                </div>

                <div className="hue-rotate-180 lowercase">
                    {value}
                </div>
            </div>

            <div className="flex items-center justify-between opacity-80 text-[10px] gap-2">
                <div className="text-ellipsis overflow-hidden gap-1 flex items-center">
                    {subtitle}
                </div>
                <div dir="rtl" className="overflow-hiddenx xtext-ellipsis">
                    {subvalue}
                </div>
            </div>

        </MenuButton>
    )
}

export function SvgNext({ className, ...props }) {
    return (
        <svg
            className={cn(' ', className)}
            width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 5v14l8 -7z" /><path d="M14 5v14l8 -7z" />
        </svg>
    )
}

export function SvgRestart({ className, ...props }) {
    return (
        <svg
            className={cn('', className)}
            width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
            <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
        </svg>
    )
}

export function SvgBack({ className, ...props }) {
    return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        className={cn('', className)}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 12l14 0" /><path d="M5 12l6 6" /><path d="M5 12l6 -6" /></svg>)
}



export function SvgPlay({ ...props }) {
    return (
        <svg {...props} width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 4v16l13 -8z" /></svg>
    )
}