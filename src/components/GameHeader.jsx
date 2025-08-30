import { cn } from "../utils/cn"

export function GameHeader({ game, onBack, onLevelClick, children }) {
    return (
        <>
            <div className='flex p-2 pb-1 gap-1 bg-[#eee] z-20
       justify-center items-stretch xborder-b-4 border-black
      text-sm select-none cursor-default'>

                <div className='text-xl p-2 w-[80px] aspect-square 
        grid place-items-center text-black 
         
        font-bold ' onClick={() => { onBack() }}>

                    <svg viewBox={"0 0 80 80"}
                        stroke="currentColor" strokeWidth="18"
                        strokeLinecap="round" strokeLinejoin="round"
                    >
                        <path strokeWidth="80" stroke='#666' d="M40 40 l0 0" />
                        <path strokeWidth="66" stroke='#eee' d="M40 40 l0 0" />
                        <path strokeWidth="4" stroke='#666' d="M30 40 l20 0 M30 40 l10 -10 M30 40 l10 10" />
                    </svg>

                </div>

                <div className='text-nowrap overflow-hidden text-ellipsis  text-sm uppercasxe text-[#666] grid font-bold text-left p-2 xbg-amber-50 items-end'>

                    {children}

                </div>
                <div className=' flex-1 text-sm uppercasxe text-nowrap overflow-hidden text-ellipsis text-[#666] grid font-bold text-right p-2 xbg-amber-50 items-end'>

                    {/* {(game.endsOn * 100 / game.ends).toFixed(2)} % */}

                    2 sources,
                    <br />
                    size:
                    {/* size {game.cols}&times;{game.rows} */}


                </div>
                <div className='xp-2 gap-2 place-items-center flex flex-col'>

                    <div onClick={onLevelClick} className='w-full text-[#666] text-7xl xfont-bold text-right gap-2 ps-1 flex-1 flex justify-end items-end'>
                        <span className='text-[#bbb]'></span>{game.cols}&times;{game.rows}
                    </div>
                </div>
            </div>

            <div className='p-2 pt-0x bg-[#fff] flex gap-2 items-stretch ring-8 ring-black/20 z-10'>
                <div className='bg-[#fff] flex flex-row-reverse  gap-1 flex-1 p-1x xborder-4 border-[#bbb]'>
                    {Object.keys(game.counts.colors).map((color) => (

                        <div key={color}
                            className={cn('min-w-4 h-4 transition-all rounded-full flex items-center p-1',
                                ["bg-[#ddd]", "bg-blue-400", "bg-amber-400", "bg-red-400"].at(color),
                                (game.counts.colors[color] === 0 && color * 1 === 3) && "min-w-0 -ms-3 opacity-0",
                                (game.counts.colors[color] === 0 && color * 1 === 0) && "min-w-0 -me-3 opacity-0"
                            )}
                            style={{ flex: game.counts.colors[color] }}
                        >
                            {(color * 1 === 1 || color * 1 === 2) &&
                                <div className="w-2 bg-white aspect-square rounded-full "></div>}
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