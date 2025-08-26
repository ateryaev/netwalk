export function GameHeader({ game, onBack, onLevelClick }) {
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

                <div className=' flex-1 text-sm uppercasxe text-[#666] grid font-bold text-right p-2 xbg-amber-50 items-end'>

                    {/* {(game.endsOn * 100 / game.ends).toFixed(2)} % */}
                    remains {game.ends - game.endsOn} eyes
                    <br />
                    size {game.cols}&times;{game.rows}

                </div>
                <div className='xp-2 gap-2 place-items-center flex flex-col'>

                    <div onClick={onLevelClick} className='w-full text-[#666] text-7xl xfont-bold text-right gap-2 ps-1 flex-1 flex justify-end items-end'>
                        <span className='text-[#bbb]'></span>143
                    </div>
                </div>
            </div>

            <div className='p-1 pt-0x bg-[#fff] flex gap-2 items-stretch ring-8 ring-black/20 z-10'>
                <div className='bg-[#fff] flex gap-1 flex-1 p-1x xborder-4 border-[#bbb]'>
                    <div className='bg-blue-400 rounded-fullx h-3 flex-[10]'></div>
                    <div className='bg-amber-400 rounded-fullx h-3 flex-[70]'></div>
                    <div className='bg-red-300x text-right px-1 -my-1 rounded-fullx flex-[20] h-3x text-sm text-[#666] grid items-center font-bold'>
                        {game.ends - game.endsOn}&nbsp;eyes</div>
                </div>

            </div>
        </>
    )
}