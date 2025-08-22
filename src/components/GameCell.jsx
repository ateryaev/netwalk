import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { bymod, rnd } from "../utils/helpers";
import { SIZE } from "../utils/cfg";

export function GameCell({ className, conectedTo, on, data, figure, style, selected, ...props }) {

    const isEnd = useMemo(() => (figure === 0b1000 || figure === 0b0100 || figure === 0b0010 || figure === 0b0001), [figure])
    const actives = useMemo(() => (on === 1 || on === 2), [on]);
    const rotorRef = useRef(null)
    const init = useRef(false);

    const [phase, setPhase] = useState(0);
    useEffect(() => {
        if (!isEnd || !on) return;

        const duration = rnd(1000) + 500;
        setPhase(rnd(19));
        //increase phase every 1s
        const interval = setInterval(() => {
            setPhase((prev) => bymod(prev + (on === 1 ? 1 : -1), 20));
        }, duration);
        return () => clearInterval(interval);
    }, [isEnd, on]);

    useEffect(() => {
        if (init.current)
            requestAnimationFrame(() => {
                rotorRef.current.style.rotate = "-90deg";
                rotorRef.current.style.transition = "none";

                requestAnimationFrame(() => {
                    if (!rotorRef.current) return;
                    rotorRef.current.style.rotate = "0deg";
                    rotorRef.current.style.transition = "all 0.2s";
                });

            });
        init.current = true;
        //rotorRef.current.style.transition = "1s";

        // if (Math.abs(renderPos - pos) < 0.05) {
        //     setRenderPos(pos);
        //     clearInterval(interval.current);
        // }
    }, [figure]);

    const endSizes = useMemo(() => {
        if (actives) return [54, 36, phase < 1 ? 21 : 18];
        return [42, 9, 0];
    }, [actives, phase]);

    const eyeBallDx = useMemo(() => {
        if (actives && phase === 8) return 5;
        if (actives && phase === 9) return -5;
        return 0;
    }, [actives, phase]);

    return (
        <div
            className={cn('bg-none text-neutral-300 absolute ',
                className,
                (on === 1) && 'text-blue-400 ',
                (on === 2) && 'text-amber-400',
                (on === 3) && 'text-red-200 saturate-50 '
            )}
            title={data.figure.toString(2).padStart(4, '0') + ":" + data.on}
            style={{ width: `${SIZE}px`, height: `${SIZE}px`, ...style }
            }
            {...props}
        >

            <svg viewBox={"0 0 100 100"}
                fill="none"
                shapeRendering="optimizeSpeed"
                stroke="currentColor" strokeWidth="18"
                strokeLinecap="round" strokeLinejoin="round"
                className={cn("absolute transition-all")}

                style={{ color: "currentcolor" }}
                ref={rotorRef}>




                {figure & 0b1000 && <path d={`M50 50 l0 -${conectedTo.top ? 50 : 36}`} />}
                {figure & 0b0010 && <path d={`M50 50 l0 ${conectedTo.bottom ? 50 : 36}`} />}
                {figure & 0b0100 && <path d={`M50 50 l${conectedTo.right ? 50 : 36} 0`} />}
                {figure & 0b0001 && <path d={`M50 50 l-${conectedTo.left ? 50 : 36} 0`} />}


                {isEnd &&
                    // <path strokeWidth={on === 1 || on === 2 ? "48" : "60"} opacity={on === 1 || on === 2 ? 0.9 : 0.1} d="M50 50 l0 0" stroke="white" />
                    <>
                        <path strokeWidth={endSizes[0]} opacity={1} d="M50 50 l0 0" stroke="currentColor" />

                    </>
                }

                {/* <g strokeWidth={6} opacity={actives ? 0.2 : 0.4} stroke={["white", "black", "black", "red"].at(on)}>
                    {figure & 0b1000 && <path d={`M50 50 l0 -${conectedTo.top ? 50 : 36}`} />}
                    {figure & 0b0010 && <path d={`M50 50 l0 ${conectedTo.bottom ? 50 : 36}`} />}
                    {figure & 0b0100 && <path d={`M50 50 l${conectedTo.right ? 50 : 36} 0`} />}
                    {figure & 0b0001 && <path d={`M50 50 l-${conectedTo.left ? 50 : 36} 0`} />}
                </g> */}

                {isEnd &&
                    // <path strokeWidth={on === 1 || on === 2 ? "48" : "60"} opacity={on === 1 || on === 2 ? 0.9 : 0.1} d="M50 50 l0 0" stroke="white" />
                    <>

                        <path strokeWidth={endSizes[0]} opacity={1} d="M50 50 l0 0" stroke="currentColor" />
                        <path strokeWidth={endSizes[1]} opacity={0.0} d="M50 50 l0 0" stroke="white" />
                        <path strokeWidth={endSizes[1]} opacity={1} style={{ scale: eyeBallDx !== 0 ? "0.9" : "1", transformOrigin: "50px 50px" }} d="M50 50 l0 0" stroke="white" />
                        <path strokeWidth={endSizes[2]} opacity={actives ? 1 : 0} d={`M${50 + eyeBallDx} 50 l0 0`} stroke="#333" />
                    </>
                }

            </svg>



        </div >
    );
}