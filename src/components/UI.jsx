import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { SvgBell, SvgPlay } from "./Button";

export function Inv({ children, className, ...props }) {
    return (
        <span className={cn("hue-rotate-180 text-darkpuzzle ", className)} {...props}>
            {children}
        </span>
    )
}
export function Titled({ children, title, className, ...props }) {
    return (<div className={cn("uppercase overflow-hidden", className)}>
        <div className="text-[100%] overflow-hidden ">{title}</div>
        <div className="opacity-60 text-[85%] lowercasex -mt-1 overflow-hidden text-ellipsis">{children}</div>
    </div>)
}

export function BigTitled({ children, title, subtitle, className, ...props }) {
    return (<div className={cn("uppercase overflow-hidden", className)} {...props}>
        <div key={title} className="transition-all text-[125%] font-bold scale-100 starting:scale-y-5 starting:opacity-30">{title}</div>
        <div key={subtitle}
            className="whitespace-nowrap overflow-hidden text-ellipsis uppercase text-[90%] -mt-1
            transition-all delay-150 opacity-60 scale-100 starting:opacity-20 starting:scale-y-5">
            {subtitle}</div>
    </div>)
}

export function Blink({ children, className, ...props }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible((prev) => !prev);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={cn("", className, { "opacity-20": !isVisible })}>
            {children}
        </div>
    );
}
export function LabelNew() {
    return (<Blink><SvgBell /></Blink>)
}

export function LabelPlay() {
    return (<Blink><SvgPlay /></Blink>)
}

export function LabeNow({ className, ...props }) {
    return (<sup
        className={cn("animate-pulse uppercase text-ipuzzle inline opacity-60x mx-1 text-[9px]", className)}
        {...props}>
        now</sup>);
}

export function Frame({ className, children, ...props }) {
    return (
        <div
            className={cn("overflow-hidden bg-white xtext-ipuzzle ring-4 xxring-gray-200 ring-ipuzzle/50 rounded-lg",
                "border-4 border-white flex flex-col gap-1", className
            )}>{children}</div>
    );
}
