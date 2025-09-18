import { use, useEffect, useState } from "react";
import { cn } from "../utils/cn"
import { COLOR } from "../utils/cfg";
import { isMix, isOff, isOn } from "../utils/gamedata";


export function GameHeader({ counter, onBack, onLevelClick, onScrollTo, children }) {
    const [shown, setShown] = useState(false);
    useEffect(() => {
        setShown(true);
    }, []);

    function handleColorClick(color) {
        console.log("Color click", color, color + 1);
        onScrollTo && onScrollTo(color);
    }

    return (
        <>
            <div className='flex flex-col xbg-[#296]
       justify-center items-stretch
      select-none cursor-default'>
                <div className="flex gap-2 p-6 px-3">
                    <div className={
                        cn(' grid place-items-center text-black translate-x-3 opacity-0 transition-all duration-200',
                            shown && "translate-0 opacity-100")}
                        onClick={() => { onBack() }}>

                        <svg viewBox={"0 0 80 80"}
                            className="w-[68px] aspect-square rounded-full border-8 border-white text-white"
                            stroke="currentColor" strokeWidth="18"
                            strokeLinecap="round" strokeLinejoin="round"
                        >
                            <path strokeWidth="6" stroke='currentColor' d="M30 40 l20 0 M30 40 l10 -10 M30 40 l10 10" />
                        </svg>

                    </div>

                    <div className='px-0 flex-1 flex justify-end items-center'>
                        <div
                            onClick={onLevelClick}
                            className={cn("text-white flex flex-col items-end  font-semibold")}
                        >
                            <div className="text-[40px]">12</div>
                            <div className="text-sm uppercase h-0 opacity-50 -translate-y-3 whitespace-nowrap text-ellipsis">hurt me plenty</div>
                        </div>
                        {/* <div onClick={onLevelClick} className='xw-full text-[#666] text-4xl font-semibold text-right gap-2 ps-1 flex-1 flex justify-end items-center'>
                         <span className='text-[#bbb]'></span>{game.cols}&times;{game.rows}                       
                    </div> */}
                    </div>
                </div>

                <div className={cn('p-2 px-4x bg-[#eff] xbg-[#296]x/100 flex gap-1 items-stretch xxring-8 ring-black/20')}>
                    <div className={cn('flex flex-row-reverse gap-2 flex-1 opacity-0 transition-all duration-200 delay-[100ms] translate-x-3 origin-left', shown && "translate-x-0 opacity-100")}>
                        {Object.keys(counter).map((color) => (
                            <div key={color}
                                onClick={() => handleColorClick(color * 1)}
                                className={
                                    cn('min-w-6 p-2 saturate-150 transition-all rounded-full flex items-center',
                                        (counter[color] === 0 && isMix(color)) && "min-w-0 -ms-6 opacity-10",
                                        (counter[color] === 0 && isOff(color)) && "min-w-0 -me-6 opacity-10"
                                    )}
                                style={{ flex: counter[color], background: COLOR(color * 1), xbackground: "#fff" }}
                            >
                                {isOn(color) &&
                                    <div className="w-2 rounded-full aspect-square bg-[#fff]/90"></div>}



                            </div>
                        ))}
                        {/* <div className='bg-blue-400 rounded-fullx h-3 flex-[10]'></div>
                    <div className='bg-amber-400 rounded-fullx h-3 flex-[70]'></div> */}

                        {/* <div className='bg-red-300x text-right px-1 -my-1 rounded-fullx flex-[20] h-3x text-sm text-[#666] grid items-center font-bold'>
                        {game.ends - game.endsOn}&nbsp;eyes</div> */}
                    </div>

                </div >
            </div >

        </>
    )
}