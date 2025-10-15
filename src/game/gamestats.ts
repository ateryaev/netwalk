import { GAME_MODE_AVAILABLE, GAME_MODE_SCORE } from "./gameconstants";

//const STORAGE_KEY = "netwalker_gamestats";
const DATA = {
    solved: [20, 30, 0, 0, 0],
    current: { mode: 0, level: 70, moves: 0, cells: [] as number[] }
};

export function GetLevelsSolved(mode: number): number {
    return DATA.solved[mode] || 0;
}

export function GetAvailableModes(): number {
    let modes = 1;
    for (let m = 1; m < 5; m++) {
        GAME_MODE_AVAILABLE(m, DATA.solved[m - 1]) && modes++;
    }
    return modes;
}
//GAME_MODE_SCORE
export function GetTotalScores() {
    let total = 0;
    DATA.solved.forEach((value, index) => {
        total += GAME_MODE_SCORE(index, value);
    });
    return total;
}

export function GetSolved(): number[] {
    return DATA.solved;
}

export function SetLevelSolved(mode: number, level: number) {
    DATA.solved[mode] = Math.max(DATA.solved[mode] || 0, level);
}