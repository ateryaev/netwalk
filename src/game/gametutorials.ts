import { createArray2d } from "../utils/array2d";
import { toXY } from "../utils/xy";
import { rotateFigure, type GameData } from "./gamedata";

export function createGameTutorial0() {
    const game: GameData = {
        bordered: true,
        taps: 0,
        mode: 0,
        level: 0,
        hintXY: [toXY(1, 2), toXY(3, 3), toXY(3, 1), toXY(2, 2)],
        ...createArray2d(toXY(5, 5))
    };
    game.forEach((_, index) => { game.set(index, { figure: 0, source: 0 }) })

    game.get(toXY(0, 2)).source = 2;
    game.get(toXY(0, 2)).figure = 0b0100;
    game.get(toXY(1, 2)).figure = rotateFigure(0b0101);
    game.get(toXY(2, 2)).figure = rotateFigure(0b1011, 3);

    game.get(toXY(2, 1)).figure = 0b0110;
    game.get(toXY(3, 1)).figure = rotateFigure(0b0101);
    game.get(toXY(4, 1)).figure = 0b0001;

    game.get(toXY(2, 3)).figure = 0b1100;
    game.get(toXY(3, 3)).figure = rotateFigure(0b0101);
    game.get(toXY(4, 3)).figure = 0b0001;

    return game;
}

export function createGameTutorial1() {
    const game: GameData = {
        bordered: true,
        taps: 0,
        mode: 1,
        level: 0,
        hintXY: [toXY(1, 1), toXY(3, 2)],
        ...createArray2d(toXY(5, 5))
    };
    game.forEach((_, index) => { game.set(index, { figure: 0, source: 0 }) })

    game.get(toXY(0, 2))!.source = 2;
    game.get(toXY(0, 1))!.source = 2;
    game.get(toXY(0, 1))!.figure = 0b0100;
    game.get(toXY(1, 1))!.figure = rotateFigure(0b0101);
    game.get(toXY(2, 1))!.figure = 0b0001;


    game.get(toXY(4, 1))!.source = 1;
    game.get(toXY(4, 2))!.source = 1;
    game.get(toXY(4, 2))!.figure = 0b0001;
    game.get(toXY(3, 2))!.figure = rotateFigure(0b0101);
    game.get(toXY(2, 2))!.figure = 0b0100;

    return game;
}

export function createGameTutorial2() {
    const game: GameData = {
        bordered: false,
        taps: 0,
        mode: 2,
        level: 0,
        hintXY: [toXY(0, 3), toXY(4, 3), toXY(3, 2), toXY(1, 4), toXY(1, 0)],
        ...createArray2d(toXY(5, 5))
    };
    game.forEach((_, index) => { game.set(index, { figure: 0, source: 0 }) })

    game.get(toXY(1, 3))!.source = 4;
    game.get(toXY(1, 3))!.figure = 0b0011;

    game.get(toXY(0, 3))!.figure = rotateFigure(0b0101);
    game.get(toXY(3, 3))!.figure = 0b1100;
    game.get(toXY(4, 3))!.figure = rotateFigure(0b0101);
    game.get(toXY(3, 3))!.figure = 0b1100;
    game.get(toXY(3, 2))!.figure = rotateFigure(0b1010);
    game.get(toXY(3, 1))!.figure = 0b0010;


    game.get(toXY(1, 4))!.figure = rotateFigure(0b1010);
    game.get(toXY(1, 0))!.figure = rotateFigure(0b1010);
    game.get(toXY(1, 1))!.figure = 0b1000;


    return game;
}

export function createGameTutorial3() {
    const game: GameData = {
        bordered: false,
        taps: 0,
        mode: 3,
        level: 0,
        hintXY: [toXY(1, 2), toXY(2, 3), toXY(3, 2), toXY(2, 1)],
        ...createArray2d(toXY(5, 5))
    };
    game.forEach((_, index) => { game.set(index, { figure: 0, source: 0 }) })

    game.get(toXY(0, 0))!.source = 1;
    game.get(toXY(1, 0))!.source = 1;
    game.get(toXY(1, 0))!.figure = 0b0010;

    game.get(toXY(1, 1))!.figure = 0b1010;
    game.get(toXY(1, 2))!.figure = rotateFigure(0b1000, 3);


    game.get(toXY(0, 3))!.source = 2;
    game.get(toXY(0, 4))!.source = 2;
    game.get(toXY(0, 3))!.figure = 0b0100;
    game.get(toXY(1, 3))!.figure = 0b0101;
    game.get(toXY(2, 3))!.figure = rotateFigure(0b0001, 3);


    game.get(toXY(3, 3))!.source = 4;
    game.get(toXY(3, 4))!.source = 4;
    game.get(toXY(4, 4))!.source = 4;
    game.get(toXY(4, 3))!.source = 4;
    game.get(toXY(3, 3))!.figure = 0b1000;

    game.get(toXY(3, 2))!.figure = rotateFigure(0b0010, 3);


    game.get(toXY(4, 0))!.source = 8;
    game.get(toXY(4, 0))!.figure = 0b0001;

    game.get(toXY(3, 0))!.figure = 0b0101;
    game.get(toXY(2, 0))!.figure = 0b0110;
    game.get(toXY(2, 1))!.figure = rotateFigure(0b1000, 3);


    return game;
}

export function createGameTutorial4() {
    const game: GameData = {
        bordered: false,
        taps: 0,
        mode: 4,
        level: 0,
        hintXY: undefined,
        ...createArray2d(toXY(5, 5))
    };
    game.forEach((_, index) => { game.set(index, { figure: 0, source: 0 }) })

    game.get(toXY(0, 1))!.source = 1;
    game.get(toXY(0, 2))!.source = 1;
    game.get(toXY(0, 3))!.source = 1;
    game.get(toXY(0, 2))!.figure = 0b0100;


    game.get(toXY(3, 2))!.figure = 0b1111;
    game.get(toXY(3, 3))!.figure = 0b1001;
    game.get(toXY(3, 1))!.figure = 0b0011;

    game.get(toXY(2, 1))!.figure = 0b1101;
    game.get(toXY(2, 2))!.figure = 0b1010;
    game.get(toXY(2, 3))!.figure = 0b0111;

    game.get(toXY(1, 1))!.figure = 0b0101;
    game.get(toXY(1, 2))!.figure = 0b0101;
    game.get(toXY(1, 3))!.figure = 0b0101;


    game.get(toXY(4, 2))!.figure = 0b0001;





    return game;
}