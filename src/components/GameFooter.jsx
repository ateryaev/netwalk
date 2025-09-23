export function GameFooter({ manager, ...props }) {
    return (


        <>

            <div>{manager.bordered() ? "bordered" : "looped"}</div>
            <div className='flex items-center'> {manager.size().x}
                <svg className='hue-rotate-180 ' width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
                {manager.size().y}</div>
            <div><span className='hue-rotate-180'>UNSOLVED</span></div>

            <div className='flex-1'></div>
            <div className='lowercase flex gap-1 items-center bg-puzzle/80 hue-rotate-180 text-white p-2 -my-2 xhue-rotate-90'>
                123
            </div>
            <div className='lowercase flex gap-1 items-center text-puzzle/50 hue-rotate-180  xhue-rotate-90'>
                TAPS
            </div>
            {/* <div className='lowercase flex gap-1 text-lg items-center ps-2 hue-rotate-180'>
                <div className='bg-whitxe xtext-puzzle xtext-lg -xm-1 rounded-full xp-1'>
                     <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-pointer"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7.904 17.563a1.2 1.2 0 0 0 2.228 .308l2.09 -3.093l4.907 4.907a1.067 1.067 0 0 0 1.509 0l1.047 -1.047a1.067 1.067 0 0 0 0 -1.509l-4.907 -4.907l3.113 -2.09a1.2 1.2 0 0 0 -.309 -2.228l-13.582 -3.904l3.904 13.563z" /></svg> 
                    
                </div>
            </div> */}
        </>
    )
}