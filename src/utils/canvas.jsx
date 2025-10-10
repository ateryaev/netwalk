import { COLOR, SIZE } from "../game/cfg";
import { BOTTOM, LEFT, RIGHT, TOP } from "../game/gamedata";
import { rnd } from "./numbers";

export function drawRoundRect(ctx, x, y, w, h, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    ctx.fill();
}

export function midColor6(from, to, v) {
    // from and to are in format "#RRGGBB"
    const r1 = parseInt(from.slice(1, 3), 16);
    const g1 = parseInt(from.slice(3, 5), 16);
    const b1 = parseInt(from.slice(5, 7), 16);

    const r2 = parseInt(to.slice(1, 3), 16);
    const g2 = parseInt(to.slice(3, 5), 16);
    const b2 = parseInt(to.slice(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * v);
    const g = Math.round(g1 + (g2 - g1) * v);
    const b = Math.round(b1 + (b2 - b1) * v);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function midColor(from, to, v) {
    // from and to are in format "#RGB"
    const r1 = parseInt(from[1] + from[1], 16);
    const g1 = parseInt(from[2] + from[2], 16);
    const b1 = parseInt(from[3] + from[3], 16);
    const r2 = parseInt(to[1] + to[1], 16);
    const g2 = parseInt(to[2] + to[2], 16);
    const b2 = parseInt(to[3] + to[3], 16);
    const r = Math.round(r1 + (r2 - r1) * v);
    const g = Math.round(g1 + (g2 - g1) * v);
    const b = Math.round(b1 + (b2 - b1) * v);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function drawCircle(ctx, x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

export function strokeCircle(ctx, x, y, r, width, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.stroke();
}

export function strokeLine(ctx, x1, y1, x2, y2, width, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.stroke();
}

export function drawStar(ctx, x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        ctx.lineTo(
            x + r * Math.cos((18 + i * 72) * (Math.PI / 180)),
            y - r * Math.sin((18 + i * 72) * (Math.PI / 180))
        );
        ctx.lineTo(
            x + (r / 2) * Math.cos((54 + i * 72) * (Math.PI / 180)),
            y - (r / 2) * Math.sin((54 + i * 72) * (Math.PI / 180))
        );
    }
    ctx.closePath();
    ctx.fill();
}

export function drawTransform(ctx, xy, draw) {
    ctx.save();
    ctx.translate(xy.x, xy.y);
    draw();
    ctx.restore();
}

//export function drawRotated(ctx: any, angel: number, draw: () => void) {
export function drawRotated(ctx, angel, draw) {
    ctx.save();
    ctx.translate(SIZE / 2, SIZE / 2);       // move origin
    ctx.rotate(angel);         // rotate (radians)
    ctx.translate(-SIZE / 2, -SIZE / 2);
    draw();
    ctx.restore();
}
