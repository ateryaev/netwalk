import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn"
import { Blink, Inv, Titled } from "./UI";
import { preBeepButton } from "../utils/beep";
import { SvgBack, SvgCheck, SvgClose, SvgUnCheck } from "./Svg";

export function CheckBox({ checked, className, ...props }) {
    return (
        checked ? <SvgCheck className={"text-2xl text-puzzle/60"} /> : <SvgUnCheck className={"text-2xl opacity-70"} />
    )
}
export function BaseButton({ children, className, onClick, ...props }) {
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

export function MainButton({ onClick, children, selected, ...props }) {
    return (
        <BaseButton className={cn("rounded-full  text-puzzle bg-white p-3 text-2xl",
            "focus:active:ring-6 focus:active:ring-white/40",
            "focus:ring-6 focus:ring-white/40 stroke-3",
            "border-4 border-puzzle",
            selected && "bg-puzzle text-white"
        )}
            {...props} onClick={null}>
            {children}
        </BaseButton>
    )
}

export function TabButton({ onClick, className, children, selected, ...props }) {
    return (
        <BaseButton className={cn("rounded-sm text-puzzle bg-white/50 p-3 border-0",
            "focus:active:ring-6 focus:active:ring-white/40",
            "focus:ring-6 focus:ring-white/40 stroke-3",
            "border-puzzle uppercase text-[90%]",
            "whitespace-nowrap text-ellipsis overflow-hidden ",
            className,
            selected && "bg-puzzle/90 text-white ",
        )}
            {...props} onClick={null}>{children}
        </BaseButton>
    )
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

export function RoundButton({ onClick, className, children, ...props }) {
    function handleClick(e) {
        e.currentTarget.blur();
        onClick && onClick();

    }
    //className={cn("-my-4 delay-0 duration-200 text-puzzle bg-white/50 text-lg")}
    return (
        <BaseButton className={cn("rounded-full text-white p-4 bg-white/10",
            "starting:text-puzzle/0 starting:-rotate-180 transition-all",
            " disabled:invisible stroke-3 active:bg-white/20 focus:bg-white/20 flex justify-center items-center gap-3",
            "text-puzzle bg-white/50 text-lg",
            className)}
            {...props} onClick={handleClick}>
            {children}
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
        <BaseButton className={cn("items-center uppercase p-3 flex gap-2 justify-center",
            "text-gray-700 darkpuzzle whitespace-nowrap",
            "focus:opacity-75 disabled:opacity-50",
            "active:opacity-75",
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

export function DetailedButton({ children, special, safe, className, subtitle, value, subvalue, icon, ...props }) {
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
        <MenuButton className={cn("p-3 flex gap-2 items-center justify-between",
            false && special && "border-l-6 pl-2.5 border-ipuzzle", className)}
            {...props}
            onBlur={handleBlur}
            onClick={handleClick}>
            <Titled className={"text-left flex-1"} title={children}>{subtitle}</Titled>
            <Titled className={"text-right"} title={<Inv className={"normal-case"}>{value || <>&nbsp;</>}</Inv>}>{subvalue || <>&nbsp;</>}</Titled>
            {icon}
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




export function SvgPlay({ ...props }) {
    return (
        <svg {...props} width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 4v16l13 -8z" /></svg>
    )
}

export function SvgBell({ ...props }) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" /><path d="M9 17v1a3 3 0 0 0 6 0v-1" /></svg>
    )
}