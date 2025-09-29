
//const STORAGE_KEY = "netwalker_gamestats";
const DATA = {
    solved: [70, 22, 2, 0, 0],
    current: { mode: 0, level: 70, moves: 0, cells: [] as number[] }
};

export function GetLevelsSolved(mode: number): number {
    return DATA.solved[mode] || 0;
}

export function GetSolved(): number[] {
    return DATA.solved;
}

export function SetLevelSolved(mode: number, level: number) {
    DATA.solved[mode] = Math.max(DATA.solved[mode] || 0, level);
}