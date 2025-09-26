import { Inv } from "./UI";

export function GameFooter({ manager, taps, bordered, random, solved, tutorial, size, ...props }) {
    if (tutorial) return (
        <>
            <Inv>
                {tutorial}
            </Inv>
            {/* <Inv className="flex-1 text-right">
                {tutorial}
            </Inv> */}
        </>
    );

    return (


        <>

            <div>
                {bordered ? "bordered" : "looped"}
            </div>

            <div className='flex items-center lowercasex'>
                {size.x}<Inv>x</Inv>{size.y}</div>
            <div>
                {!solved && <Inv>NEW</Inv>}
                {solved && !random && <Inv>SOLVED</Inv>}
                {solved && random && <Inv>RANDOM</Inv>}
            </div>

            <div className='flex-1'></div>
            <div className='lowercase gap-1 flex flex-col items-center bg-puzzle hue-rotate-180 opacity-80 text-[#fff] p-2 -my-2'>
                <span className="opacity-0">0000</span>
                <span className="absolute relativex -xtranslate-x-full">{taps}</span>
            </div>
            <div className='lowercase flex gap-1 items-center text-puzzle/75 hue-rotate-180'>
                TAPS
            </div>

        </>
    )
}