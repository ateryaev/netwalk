import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { bymod } from "../utils/helpers";
import { SIZE } from "../utils/cfg";

export function GameCellSource({ className, conectedTo1, conectedTo2, on, data, figure1, figure2, pos, style, ...props }) {

    //const [renderValue, setRenderValue] = useState(0);
    const [phase, setPhase] = useState(0);


    const rotor1Ref = useRef(null)
    const move1Ref = useRef(null)
    const rotor2Ref = useRef(null)
    const move2Ref = useRef(null)
    const init = useRef(false);


    useEffect(() => {
        //increase phase every 1s
        const interval = setInterval(() => {
            setPhase((prev) => bymod(prev + (on === 1 ? 1 : -1), 12));
        }, 200);
        return () => clearInterval(interval);
    }, []);



    useEffect(() => {
        if (init.current)
            requestAnimationFrame(() => {
                rotor1Ref.current.style.rotate = "-90deg";
                rotor1Ref.current.style.transition = "none";
                move1Ref.current.style.translate = "0 100px";
                move1Ref.current.style.transition = "none";

                rotor2Ref.current.style.rotate = "-90deg";
                rotor2Ref.current.style.transition = "none";
                move2Ref.current.style.translate = "0 -100px";
                move2Ref.current.style.transition = "none";

                requestAnimationFrame(() => {
                    if (!rotor1Ref.current) return;
                    const transition = "all 0.25s"
                    rotor1Ref.current.style.rotate = "0deg";
                    rotor1Ref.current.style.transition = transition;
                    move1Ref.current.style.translate = "0 0px";
                    move1Ref.current.style.transition = transition;

                    rotor2Ref.current.style.rotate = "0deg";
                    rotor2Ref.current.style.transition = transition;
                    move2Ref.current.style.translate = "0 0px";
                    move2Ref.current.style.transition = transition;
                });

            });
        init.current = true;

    }, [figure1, figure2]);


    return (
        <div
            className={cn('bg-neutral-600 text-neutral-300 absolute z-50',
                className,
                (on === 1) && 'text-blue-400 ',
                (on === 2) && 'text-amber-400'
            )}
            title={figure1.toString(2).padStart(4, '0') + ":" + figure2.toString(2).padStart(4, '0') + ":" + data.on}
            style={{ width: `${SIZE}px`, height: `${SIZE * 2}px`, ...style }
            }
            {...props}
        >

            <svg viewBox={"0 0 100 200"}
                shapeRendering="optimizeSpeed"
                fill="none"
                stroke="currentColor" strokeWidth="18"
                strokeLinecap="round" strokeLinejoin="round"
                className={cn("absolute transition-all")}

                style={{ color: "currentcolor" }}
            >




                {/* <path strokeWidth={96} opacity="0.1" d="M50 50 l0 100" stroke="white" /> */}

                <g ref={rotor1Ref} style={{ rotatex: "-45deg", transformOrigin: "50px 50px" }}>
                    {figure1 & 0b1000 && <path d={`M50 50 l0 -${conectedTo1.top ? 50 : 36}`} />}
                    {figure1 & 0b0100 && <path d={`M50 50 l${conectedTo1.right ? 50 : 36} 0`} />}

                </g>
                <g ref={move1Ref}>
                    {figure1 & 0b0001 && <path d={`M50 50 l-${conectedTo1.left ? 50 : 36} 0`} />}

                </g>

                <g ref={move2Ref}>
                    {figure2 & 0b0100 && <path d={`M50 150 l${conectedTo2.right ? 50 : 36} 0`} />}

                </g>
                <g ref={rotor2Ref} style={{ rotatex: "0deg", transformOrigin: "50px 150px" }}>
                    {figure2 & 0b0010 && <path d={`M50 150 l0 ${conectedTo2.bottom ? 50 : 36}`} />}
                    {figure2 & 0b0001 && <path d={`M50 150 l-${conectedTo2.left ? 50 : 36} 0`} />}

                </g>




                <rect x="24" y="24" width="52" height="152" rx="20" fill="#fff" />
                <path strokeWidth={0} stroke="black" fill="#333"
                    d1={phase % 2 == 0 ? "M30 100 q10 10 20 0 q10 -10 20 0 l0 70 l-40 0 z" :
                        "M30 100 q10 -10 20 0 q10 10 20 0 l0 70 l-40 0 z"
                    }
                    d2={phase % 2 == 0 ? "M30 100 q1 -1 1 0 q10 10 20 0 q10 -10 20 0 l0 70 l-40 0 z" :
                        "M30 100 q10 -10 20 0 q10 10 20 0 q1 -1 1 0 l0 70 l-40 0 z"
                    }
                    d={`M30 ${on === 1 ? 100 : 50}` +
                        [
                            "q10 10 20 0 q10 -10 20 0 ",
                            "q10 -10 20 0 q10 10 20 0",
                            "q10 0 20 0 q10 0 20 0",
                        ].at(phase % 2) +
                        `l0 ${on === 1 ? 70 : 120} l-40 0 z `
                    } />

                {/* <rect x="24" y="24" width="52" height="152" rx="20" strokeWidth={18 + 9} stroke="black" opacity={0.1} /> */}
                <rect x="24" y="24" width="52" height="152" rx="20" strokeWidth={18} fill="none" />
                {/* <path strokeWidth={78} opacity="0.1" d="M50 50 l0 100" stroke="black" />

                

                <path strokeWidth={72} d="M50 50 l0 100" stroke="currentColor" />
                <path strokeWidth={42} d="M50 50 l0 100" stroke="white" />

                <path strokeWidth={phase == 0 ? 21 : 18} d="M50 50 l0 0" stroke="black" />
                <path strokeWidth={phase == 1 ? 21 : 18} d="M50 83 l0 0" stroke="black" />
                <path strokeWidth={phase == 2 ? 21 : 18} d="M50 117 l0 0" stroke="black" />
                <path strokeWidth={phase == 3 ? 21 : 18} d="M50 150 l0 0" stroke="black" /> */}


            </svg>
            {/* <div className="absolutex z-50 border-8 border-current rounded-full m-4 bg-white"
                style={{ xwidth: `${SIZE}px`, xheight: `${SIZE * 2}px` }} >
                a
            </div> */}


        </div >
    );
}