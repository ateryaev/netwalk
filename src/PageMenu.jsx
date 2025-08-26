export function PageMenu({ onNewGame, onSettings, onAbout }) {
    return (
        <div className="w-full h-full flex gap-2 flex-col justify-center items-center text-2xl font-bold select-none">
            <div>NETWALK</div>
            <button className="p-2 bg-white/10" onClick={() => onNewGame(4, 4)}>new game 4x4</button>
            <button className="p-2 bg-white/10" onClick={() => onNewGame(20, 20)}>new game 20x20</button>
            <button className="p-2 bg-white/10" onClick={() => onNewGame(40, 40)}>new game 40x40</button>
            <button className="p-2 bg-white/10">settings</button>
            <button className="p-2 bg-white/10">about</button>
        </div>
    );
}