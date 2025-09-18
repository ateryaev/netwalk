export function PageMenu({ onNewGame, onSettings, onAbout, onTest }) {
    return (
        <>
            <div className="p-8 text-center text-2xl font-bold text-white  ">
                NETWALK<br />PUZZLE
            </div>
            <div className="w-full pb-16 bg-white/90 h-full flex gap-2 flex-col justify-center items-center text-2xl font-bold select-none">
                <button className="p-2 bg-white/10" onClick={() => onNewGame(6, 6, true)}>new game 6x6</button>
                <button className="p-2 bg-white/10" onClick={() => onNewGame(7, 7, false)}>new game 7x7</button>
                <button className="p-2 bg-white/10" onClick={() => onNewGame(8, 8, true)}>new game 8x8</button>
                <button className="p-2 bg-white/10" onClick={() => onNewGame(5, 14, true)}>new game 5x13</button>
                <button className="p-2 bg-white/10" onClick={() => onTest()}>test</button>
                <button className="p-2 bg-white/10">about</button>
            </div>
            {/* <div className="p-8 text-center text-2xl font-bold text-white  ">
                NETWALK<br />PUZZLE
            </div> */}
        </>
    );
}