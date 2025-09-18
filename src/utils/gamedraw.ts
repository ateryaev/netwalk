import { getFigureImage, getSourceBgImage } from "./canvas";
import { SIZE } from "./cfg";
import { bymod } from "./numbers";
import type { XY } from "./xy";

export function drawBG(ctx: any, gameGridSize: XY, viewGridSize: XY, startCell: XY) {
    const startCol = startCell.x;
    const startRow = startCell.y;

    ctx.fillStyle = "#181818";
    //ctx.fillRect(0, 0, viewGridSize.x * SIZE, viewGridSize.y * SIZE);

    ctx.globalAlpha = 1
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 8;

    ctx.beginPath()
    for (let row = 0; row < viewGridSize.y; row++) {
        const y = row * SIZE;
        const gameRow = bymod(startRow + row, gameGridSize.y);
        if (gameRow === 0) {
            ctx.moveTo(0, y);
            ctx.lineTo(viewGridSize.y * gameGridSize.x * SIZE, y);
        }
    }

    for (let col = 0; col < viewGridSize.x; col++) {
        const x = col * SIZE;
        const gameCol = bymod(startCol + col, gameGridSize.x);
        if (gameCol === 0) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, viewGridSize.y * gameGridSize.y * SIZE);
            //ctx.arc(100, 75, 50, 0, 2 * Math.PI)
        }

    }
    ctx.closePath();
    ctx.stroke();
}

export function drawBgCell(ctx: any, isOdd: boolean, isSource: boolean, isEmpty: boolean, cellSize: XY) {
    const gap = 0;
    //const cellRect = manager.getCellRect(gameCol, gameRow);
    const insideW = SIZE * cellSize.x - gap * 2;
    const insideH = SIZE * cellSize.y - gap * 2;

    if (isSource) {
        ctx.fillStyle = "#111";
        ctx.fillRect(gap, gap, insideW, insideH);
    } else {
        ctx.fillStyle = isOdd ? "#222" : "#333";
        ctx.fillRect(gap, gap, insideW, insideH);
    }
    if (isEmpty) drawEmptyCell(ctx, isOdd)
}

export function drawEmptyCell(ctx: any, isOdd: boolean) {
    const alpha = ctx.globalAlpha;
    ctx.globalAlpha = 0.5

    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, 30, 0, Math.PI * 2);
    ctx.moveTo(SIZE / 2 - 20, SIZE / 2 - 20);
    ctx.lineTo(SIZE / 2 + 20, SIZE / 2 + 20);
    ctx.moveTo(SIZE / 2 + 20, SIZE / 2 - 20);
    ctx.lineTo(SIZE / 2 - 20, SIZE / 2 + 20);
    ctx.lineWidth = 6;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = !isOdd ? "#222" : "#333";
    ctx.stroke();

    ctx.globalAlpha = alpha
}

export function drawSelection(ctx: any, progress: number, cellSize: XY) {
    const gap = 0;
    const insideW = SIZE * cellSize.x - gap * 2;
    const insideH = SIZE * cellSize.y - gap * 2;
    const size = 8;
    const phase = (performance.now() % 300);
    ctx.globalAlpha = (phase > 150 ? 0.75 : 0.5) * progress
    ctx.beginPath();
    ctx.moveTo(gap, gap + size);
    ctx.lineTo(gap, gap);
    ctx.lineTo(gap + size, gap);

    ctx.moveTo(insideW + gap, gap + size);
    ctx.lineTo(insideW + gap, gap);
    ctx.lineTo(insideW + gap - size, gap);
    ctx.moveTo(gap, insideH + gap - size);
    ctx.lineTo(gap, insideH + gap);
    ctx.lineTo(gap + size, insideH + gap);
    ctx.moveTo(insideW + gap, insideH + gap - size);
    ctx.lineTo(insideW + gap, insideH + gap);
    ctx.lineTo(insideW + gap - size, insideH + gap);

    ctx.lineWidth = 6;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "#fff";
    ctx.stroke();
}

export function drawActiveEnd(ctx: any, progress: number) {
    ctx.globalAlpha = progress;
    ctx.beginPath();
    ctx.moveTo(SIZE / 2, SIZE / 2);
    ctx.lineTo(SIZE / 2, SIZE / 2)
    ctx.lineWidth = 30 - 10 * progress;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "#fff";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(SIZE / 2, SIZE / 2);
    ctx.lineTo(SIZE / 2, SIZE / 2)
    ctx.lineWidth = 5 + 3 * (1 - progress);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";
    ctx.stroke();
}

export function drawOffEnd(ctx: any, progress: number, hiding: boolean) {
    hiding = true;
    ctx.globalAlpha = progress
    const d = hiding ? 5 * progress : 10 - 5 * progress;
    ctx.beginPath();
    ctx.moveTo(SIZE / 2 - d, SIZE / 2 - d);
    ctx.lineTo(SIZE / 2 + d, SIZE / 2 + d)
    ctx.moveTo(SIZE / 2 + d, SIZE / 2 - d);
    ctx.lineTo(SIZE / 2 - d, SIZE / 2 + d)
    ctx.lineWidth = hiding ? 2.5 : 5 - 2.5 * progress;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "#666"
    ctx.stroke();
}

export function drawMixEnd(ctx: any, progress: number) {
    ctx.globalAlpha = progress;
    ctx.beginPath();
    ctx.moveTo(SIZE / 2, SIZE / 2);
    ctx.lineTo(SIZE / 2, SIZE / 2)
    ctx.lineWidth = 30 - 10 * progress;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "#666";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(SIZE / 2, SIZE / 2);
    ctx.lineTo(SIZE / 2, SIZE / 2)
    ctx.lineWidth = 5 + 10 * progress;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "#aaa";
    ctx.stroke();
}

export function drawFigure(ctx: any, figure: number, color: number, conns: number, opacity: number = 1) {
    if (opacity < 0.01) return;
    if (figure === 0) return;
    ctx.globalAlpha = opacity;
    const img = getFigureImage(figure, color, false, conns);
    //img && ctx.drawImage(img, -SIZE / 2 - 1, -SIZE / 2 - 1, SIZE + 2, SIZE + 2);
    img && ctx.drawImage(img, -1, -1, SIZE + 2, SIZE + 2);
}

export function drawSourceFg(ctx: any, color: number, size: XY) {
    const sourceImg = getSourceBgImage(color, size.x, size.y);
    sourceImg && ctx.drawImage(sourceImg, 0, 0, SIZE * size.x, SIZE * size.y);

}

export function drawTransform(ctx: any, xy: XY, draw: () => void) {
    ctx.save();
    ctx.translate(xy.x, xy.y);
    draw();
    ctx.restore();
}

export function drawRotated(ctx: any, angel: number, draw: () => void) {
    if (Math.abs(angel) < 0.01) {
        draw();
        return;
    }
    ctx.save();
    ctx.translate(SIZE / 2, SIZE / 2);       // move origin
    ctx.rotate(angel);         // rotate (radians)
    ctx.translate(-SIZE / 2, -SIZE / 2);
    draw();
    ctx.restore();
}