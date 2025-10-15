import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { SvgBell, SvgPlay } from "./Button";

export function Inv({ children, className, ...props }) {
    return (
        <span className={"hue-rotate-180 " + className} {...props}>
            {children}
        </span>
    )
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
