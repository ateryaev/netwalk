import { useEffect, useState } from "react";
import { cn } from "../utils/cn";

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


    return (
        <div className="bg-puzzle text-white xpuzzle px-1.5 -m-1.5 xring-puzzle rounded-xs lowercase hue-rotate-180">
            <Blink>
                new
            </Blink>
        </div>
    );
    //return <div className="bg-puzzle text-[#fff] px-1 ring-puzzle rounded-xs lowercase hue-rotate-180">new</div>
}
