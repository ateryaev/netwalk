export function PageMenu({ onNewGame, onSettings, onAbout, onTest }) {
    return (
        <div className="w-full h-full flex gap-2 flex-col justify-center items-center text-2xl font-bold select-none">
            <div>NETWALK</div>
            <button className="p-2 bg-white/10" onClick={() => onNewGame(6, 6)}>new game 6x6</button>
            <button className="p-2 bg-white/10" onClick={() => onNewGame(10, 16)}>new game 10x16</button>
            <button className="p-2 bg-white/10" onClick={() => onNewGame(20, 30)}>new game 20x30</button>
            <button className="p-2 bg-white/10" onClick={() => onTest()}>test</button>
            <button className="p-2 bg-white/10">about</button>
        </div>
    );
}