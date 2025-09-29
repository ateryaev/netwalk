import { createArray2d } from "../utils/array2d";
import { toXY } from "../utils/xy";
import { rotateFigure, type GameData } from "./gamedata";

export function createGameTutorial() {
    const game: GameData = {
        bordered: true,
        taps: 0,
        mode: 0,
        level: 0,
        hintText: "Tap the pieces to rotate them and connect the network",
        hintXY: [toXY(1, 2), toXY(3, 2)],
        ...createArray2d(toXY(5, 5))
    };
    game.forEach((_, index) => { game.set(index, { figure: 0, source: 0 }) })

    game.get(toXY(0, 2))!.source = 2;
    game.get(toXY(0, 2))!.figure = 0b0100;
    game.get(toXY(1, 2))!.figure = rotateFigure(0b0101);
    game.get(toXY(2, 2))!.figure = 0b0101;
    game.get(toXY(3, 2))!.figure = rotateFigure(0b0101);
    game.get(toXY(4, 2))!.figure = 0b0001;

    return game;
}