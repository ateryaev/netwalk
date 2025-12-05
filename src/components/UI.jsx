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
        <div className="text-[100%] overflow-hidden  text-ellipsis">{title}</div>
        <div className="opacity-60 text-[85%] lowercasex -mt-1 overflow-hidden text-ellipsis">{children}</div>
    </div>)
}

export function BigTitled({ children, title, className, ...props }) {
    return (<div className={cn("uppercase", className)}>
        <div className="text-[125%] font-bold">{title}</div>
        <div className="opacity-60 uppercase text-[90%] -mt-1">{children}</div>
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
