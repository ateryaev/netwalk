export function PageMenu({ onNewGame, onSettings, onAbout, onTest }) {
    return (
        <div className="w-full h-full flex gap-2 flex-col justify-center items-center text-2xl font-bold select-none">
            <div>NETWALK</div>
            <button className="p-2 bg-white/10" onClick={() => onNewGame(6, 6, true)}>new game 6x6</button>
            <button className="p-2 bg-white/10" onClick={() => onNewGame(7, 7, false)}>new game 7x7</button>
            <button className="p-2 bg-white/10" onClick={() => onNewGame(8, 8, true)}>new game 8x8</button>
            <button className="p-2 bg-white/10" onClick={() => onTest()}>test</button>
            <button className="p-2 bg-white/10">about</button>
        </div>
    );
}