import { Inv } from "./UI";

export function GameFooter({ taps, bordered, random, solved, tutorial, size, ...props }) {
    if (tutorial) return (
        <>
            {tutorial}
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

            <div className="
            
            min-w-[55px] rounded-lg text-ipuzzle bg-ipuzzle/20 px-2 py-0.5 -my-0.5 text-center">
                {taps}</div>
            <div className=" text-ipuzzle opacity-45x text-xs py-1 -my-1 lowercase">
                taps
                {/* <svg width="1em" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-pointer"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3.039 4.277l3.904 13.563c.185 .837 .92 1.516 1.831 1.642l.17 .016a2.2 2.2 0 0 0 1.982 -1.006l.045 -.078l1.4 -2.072l4.05 4.05a2.067 2.067 0 0 0 2.924 0l1.047 -1.047c.388 -.388 .606 -.913 .606 -1.461l-.008 -.182a2.067 2.067 0 0 0 -.598 -1.28l-4.047 -4.048l2.103 -1.412c.726 -.385 1.18 -1.278 1.053 -2.189a2.2 2.2 0 0 0 -1.701 -1.845l-13.524 -3.89a1 1 0 0 0 -1.236 1.24z" /></svg> */}
            </div>

            {/* 
            <div className=" text-ipuzzle/30 px-0">taps</div> */}

        </>
    )
}