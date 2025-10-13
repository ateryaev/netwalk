import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn"
import { Blink } from "./UI";
import { preBeepButton } from "../utils/beep";

function BaseButton({ children, className, onClick, ...props }) {
    const viewRef = useRef(null);
    return (
        <button
            ref={viewRef}
            className={cn(
                "outline-none cursor-pointer select-none disabled:pointer-events-none disabled:cursor-default",
                "transition-all focus:transition-none active:transition-none",
                className
            )}
            onClick={(e) => {
                e.preventDefault();
                e.currentTarget.blur();
                onClick?.(e);
            }}
            onPointerDown={(e) => {
                e.preventDefault();
                e.currentTarget.focus();
                preBeepButton();
            }}
            onPointerCancel={(e) => {
                e.preventDefault();
                e.currentTarget.blur();
            }}

            onContextMenu={(e) => { e.currentTarget.blur(); e.preventDefault() }}
            {...props}
        >
            {children}
        </button>
    );
}

export function ShowMenuButton({ onClick, ...props }) {
    function handleClick(e) {
        onClick?.();
    }
    return (
        <BaseButton className="rounded-full  text-puzzle bg-white
                    p-3.5 text-2xl 
                    focus:active:ring-6 focus:active:ring-white/40
                    focus:ring-6 focus:ring-white/40"
            {...props} onClick={handleClick}>
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-menu-2"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 6l16 0" /><path d="M4 12l16 0" /><path d="M4 18l16 0" /></svg>
        </BaseButton>
    )
}
export function BackButton({ onClick, ...props }) {
    function handleClick(e) {
        e.currentTarget.blur();
        onClick && onClick();
    }
    return (
        <BaseButton className="rounded-full border-none border-white text-white opacity-60 xbg-white/5
                    p-3 cursor-pointer select-none text-2xl
                    disabled:invisible disabled:pointer-events-none
                     active:bg-white/20 focus:bg-white/20"
            {...props} onClick={handleClick}>
            <SvgBack />
        </BaseButton>
    )
}

export function CloseButton({ onClick, ...props }) {
    function handleClick(e) {
        e.currentTarget.blur();
        onClick && onClick();
    }
    return (
        <BaseButton className="rounded-full border-none border-white text-white opacity-60 xbg-white/5
                    p-3 text-2xl 
                    disabled:invisible 
                     active:bg-white/20 focus:bg-white/20"
            {...props} onClick={handleClick}>
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
        </BaseButton>
    )
}

export function PinkButton({ Svg, className, blink, children, ...props }) {
    const [off, setOff] = useState(false);

    useEffect(() => {
        if (!blink) return;
        const interval = setInterval(() => {
            setOff((prev) => !prev);
        }, 500);
        return () => clearInterval(interval);
    }, [blink]);
    return (
        <BaseButton className={cn("flex items-center uppercase font-semibold  p-1.5 gap-0  rounded-full",
            "bg-white text-puzzle whitespace-nowrap",
            "focus:ring-6 focus:ring-puzzle/40 focus:bg-puzzle focus:text-white",
            "active:ring-6 active:ring-puzzle/40 active:bg-puzzle active:text-white",
            "transition-colors duration-300", className)}
            {...props}>

            {Svg && <div className={cn("bg-puzzle text-white rounded-full p-1.5", off && "text-white/20")}><Svg /></div>}
            {children && <div className="flex justify-between gap-1.5 text-ellipsis px-2 py-0.5 overflow-hidden text-center flex-1">
                {children}
            </div>}
        </BaseButton>
    )
}


export function MenuButton({ Svg, children, className, ...props }) {
    return (
        <BaseButton className={cn("items-center uppercase p-6 flex gap-2 justify-center",
            "text-darkpuzzle whitespace-nowrap",
            "focus:ring-2 ring-puzzle/20 focus:bg-puzzle/10 disabled:opacity-50",
            "active:ring-2 active:bg-puzzle/10",
            className)}
            {...props}>
            {children}
        </BaseButton>
    )
}

export function ConfirmButton({ Svg, children, className, ...props }) {
    const [isFocused, setIsFocused] = useState(false);
    const buttonRef = useRef(null);
    const handleBlur = () => {
        setIsFocused(false);
    };
    function handleClick(e) {

        if (isFocused) {
            //props.onClick && props.onClick();
            console.log("FOCUS! MenuButton clicked!");
        } else {
            console.log("BLUR! MenuButton clicked!");
        }
        setIsFocused(true);
    }
    return (
        <MenuButton className={cn("", className)}
            {...props}
            onBlur={handleBlur}
            onClick={handleClick} >
            {children}
        </MenuButton>
    )
}

export function DetailedButton({ children, safe, className, subtitle, value, subvalue, ...props }) {
    const [isFocused, setIsFocused] = useState(false);
    const buttonRef = useRef(null);
    const handleBlur = () => {
        setIsFocused(false);
    };
    function handleClick(e) {
        if (isFocused || !safe) {
            props.onClick && props.onClick();
        }
        setIsFocused(true);
    }
    return (
        <MenuButton className={cn("p-4 flex-col gap-0 items-stretch", className)}
            {...props}
            onBlur={handleBlur}
            onClick={handleClick}  >
            <div className="flex items-center justify-between text-[120%] xfont-extrabold">
                <div className="text-ellipsis overflow-hidden">
                    {children}
                </div>

                <div className="hue-rotate-180 lowercase">
                    {value}
                </div>
            </div>
            <div className="flex items-center text-puzzle justify-between -mt-1 font-semibold xlowercase text-[90%] gap-2 opacity-80">
                <div className="text-ellipsis  overflow-hidden gap-1 flex items-center">
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