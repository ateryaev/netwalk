import { use, useEffect, useState } from "react";
import { cn } from "../utils/cn"

export function GameHeader({ game, onBack, onLevelClick, children }) {
    const [shown, setShown] = useState(false);
    useEffect(() => {
        setShown(true);
    }, []);

    return (
        <>
            <div className='flex p-0 pb-0 gap-1 bg-[#ddd] z-50
       justify-center items-stretch xborder-b-4 border-black
      text-sm select-none cursor-default'>

                <div className={cn('text-xl p-2 w-[80px] aspect-square grid place-items-center text-black translate-x-3 opacity-0 transition-all duration-200', shown && "translate-0 opacity-100")}
                    onClick={() => { onBack() }}>

                    <svg viewBox={"0 0 80 80"}
                        stroke="currentColor" strokeWidth="18"
                        strokeLinecap="round" strokeLinejoin="round"
                    >
                        <path strokeWidth="80" stroke='#aaa' d="M40 40 l0 0" />
                        <path strokeWidth="55" opacity="0" stroke='#fff' d="M40 40 l0 0" />
                        <path strokeWidth="12" opacity="0.0" stroke='#000' d="M30 40 l20 0 M30 40 l10 -10 M30 40 l10 10" />
                        <path strokeWidth="5" stroke='#ddd' d="M30 40 l20 0 M30 40 l10 -10 M30 40 l10 10" />
                    </svg>

                </div>

                <div className='text-nowrap overflow-hidden text-ellipsis  text-sm uppercasxe text-[#666] grid font-bold text-left p-2 xbg-amber-50 items-end'>

                    {children}

                </div>
                <div className=' flex-1 text-sm uppercasxe text-nowrap overflow-hidden text-ellipsis text-[#666] grid font-bold text-right p-2 items-center'>

                    {/* {(game.endsOn * 100 / game.ends).toFixed(2)} % */}

                    {/* size {game.cols}&times;{game.rows} */}
                </div>
                <div className='p-0 overflow-hidden grid h-[80px] xaspect-square xbg-red-50 items-center justify-center
                 '>
                    <div className={cn("text-[#aaa] text-[140px] -mt-15 -me-2 rotate-5 font-semibold translate-y-3 opacity-0 transition-all duration-200 delay-200", shown && "translate-y-0 opacity-100")}>129</div>
                    {/* <div onClick={onLevelClick} className='xw-full text-[#666] text-4xl font-semibold text-right gap-2 ps-1 flex-1 flex justify-end items-center'>
                         <span className='text-[#bbb]'></span>{game.cols}&times;{game.rows}                       
                    </div> */}
                </div>
            </div>

            <div className={cn('p-2 bg-[#fff]/100 flex gap-1 items-stretch ring-8 ring-black/20 z-40')}>
                <div className={cn('flex flex-row-reverse  gap-2 flex-1 opacity-0 transition-all duration-200 delay-[100ms] translate-x-3 origin-left', shown && "translate-x-0 opacity-100")}>
                    {Object.keys(game.counts.colors).map((color) => (
                        <div key={color}
                            className={cn('min-w-6 p-2 transition-all rounded-full flex items-center',
                                ["bg-[#ddd]", "bg-blue-400", "bg-amber-400", "bg-red-400"].at(color),
                                (game.counts.colors[color] === 0 && color * 1 === 3) && "min-w-0 -ms-6 opacity-10",
                                (game.counts.colors[color] === 0 && color * 1 === 0) && "min-w-0 -me-6 opacity-10"
                            )}
                            style={{ flex: game.counts.colors[color] }}
                        >
                            {(color * 1 === 1 || color * 1 === 2) &&
                                <div className="w-2 rounded-full aspect-square bg-[#fff]"></div>}


                        </div>
                    ))}
                    {/* <div className='bg-blue-400 rounded-fullx h-3 flex-[10]'></div>
                    <div className='bg-amber-400 rounded-fullx h-3 flex-[70]'></div> */}

                    {/* <div className='bg-red-300x text-right px-1 -my-1 rounded-fullx flex-[20] h-3x text-sm text-[#666] grid items-center font-bold'>
                        {game.ends - game.endsOn}&nbsp;eyes</div> */}
                </div>

            </div>
        </>
    )
}