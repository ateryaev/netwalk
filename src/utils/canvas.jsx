import { COLOR, SIZE } from "./cfg";
import { BOTTOM, LEFT, RIGHT, TOP } from "../game/gamedata";
import { rnd } from "./numbers";

function rasterizeSVG(svgTxt, w, h) {
    return new Promise((resolve) => {
        const svgBlob = new Blob([svgTxt], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, w, h);
            URL.revokeObjectURL(url);
            resolve(canvas); // canvas is now a raster sprite
        };
        img.src = url;
    });
}


//let imageObj = null;
const figureImageCache = { loadedCount: 0 };
const sourceFgCache = {};
const bgCache = {};

export function getFigureImage(figure, color, solved, conns) {
    solved = color === 1 || color === 2 || color === 4;
    color = COLOR(color)
    //color = COLORS[color];
    const key = `${figure}-${color}-${solved}-${conns}`;
    let imageObj = figureImageCache[key];

    //extractDirs(figure)
    if (imageObj && imageObj.complete && imageObj.naturalHeight !== 0) {
        return imageObj;
    }

    if (!imageObj) {
        const isEnd = (figure === 0b1000 || figure === 0b0100 || figure === 0b0010 || figure === 0b0001);
        const len = solved ? 50 : 50;
        const gap = solved ? 0 : 0;
        const r = 50;
        const lenTop = conns & TOP ? len : len / 2;
        const lenBot = conns & BOTTOM ? len : len / 2;
        const lenLeft = conns & LEFT ? len : len / 2;
        const lenRight = conns & RIGHT ? len : len / 2;

        const svgTxt = `
        <svg xmlns="http://www.w3.org/2000/svg"
        stroke-width="${solved ? 30 : 30}"
        width="25"
        height="25"
        stroke-linecap="round" stroke-linejoin="round"
        stroke="${color}"
        fill="none"
        viewBox="0 0 200 200">

        <g opacity="${solved ? 0.05 : 0}" stroke-width="50" stroke="#000">
        
        ${figure & TOP && `<path d="M100,50 l0,-${lenTop}" ></path>`}
        ${figure & RIGHT && `<path d="M150,100 l${lenRight},0"></path>`}
        ${figure & BOTTOM && `<path d="M100,150 l0,${lenBot}"></path>`}
        ${figure & LEFT && `<path d="M50,100 l-${lenLeft},0" ></path>`}
        
        <path d="M100,${100 - r} 
        ${(figure & TOP && figure & RIGHT) ? `a${r},${r} 0 0 0 ${r},${r}` : `m${r} ${r}`}
        ${(figure & BOTTOM && figure & RIGHT) ? `a${r},${r} 0 0 0 -${r},${r}` : `m-${r} ${r}`}
        ${(figure & BOTTOM && figure & LEFT) ? `a${r},${r} 0 0 0 -${r},-${r}` : `m-${r} -${r}`}
        ${(figure & TOP && figure & LEFT) ? `a${r},${r} 0 0 0 ${r},-${r}` : ''}
        ${(figure & TOP && figure & BOTTOM) ? 'M100 50 l0 100' : ''}
        ${(figure & LEFT && figure & RIGHT) ? 'M50 100 l100 0' : ''}
        "></path>

        ${isEnd && '<path stroke-width="120" d="M100,100 l0,0"></path>'}

        </g>   
        
        <g opacity="1">
        ${figure & TOP && `<path d="M100,50 l0,-${lenTop}" ></path>`}
        ${figure & RIGHT && `<path d="M150,100 l${lenRight},0"></path>`}
        ${figure & BOTTOM && `<path d="M100,150 l0,${lenBot}"></path>`}
        ${figure & LEFT && `<path d="M50,100 l-${lenLeft},0" ></path>`}
        
        <path d="M100,${100 - r} 
        ${(figure & TOP && figure & RIGHT) ? `a${r},${r} 0 0 0 ${r},${r}` : `m${r} ${r}`}
        ${(figure & BOTTOM && figure & RIGHT) ? `a${r},${r} 0 0 0 -${r},${r}` : `m-${r} ${r}`}
        ${(figure & BOTTOM && figure & LEFT) ? `a${r},${r} 0 0 0 -${r},-${r}` : `m-${r} -${r}`}
        ${(figure & TOP && figure & LEFT) ? `a${r},${r} 0 0 0 ${r},-${r}` : ''}
        ${(figure & TOP && figure & BOTTOM) ? 'M100 50 l0 100' : ''}
        ${(figure & LEFT && figure & RIGHT) ? 'M50 100 l100 0' : ''}
        "></path>

        ${figure === 0b1111 && '<path stroke-width="0" stroke="#111" d="M100,100 l0,0" ></path>'}
        ${figure === 0b1111 && solved && '<path stroke-width="10" stroke="#111" opacity="1" d="M100,100 l0,0" ></path>'}
        
        ${isEnd && '<path stroke-width="100" d="M100,100 l0,0"  opacity="1"></path>'}
        </g> 

        </svg > `;

        figureImageCache[key] = { complete: false }
        rasterizeSVG(svgTxt, (SIZE) * 2, (SIZE) * 2).then((img) => {

            img.complete = true;
            figureImageCache[key] = img;
            figureImageCache.loadedCount++;
            //    console.log("RAST COUNT:", figureImageCache.loadedCount)
        });

        // imageObj = new Image();
        // const svgBlob = new Blob([svgTxt], { type: "image/svg+xml;charset=utf-8" });
        // const url = URL.createObjectURL(svgBlob);

        // imageObj.src = url;
        // figureImageCache[key] = imageObj;
    }
}

export function getSourceBgImage(color, cols, rows) {
    color = COLOR(color);
    const key = `${color} ${cols} ${rows} `;
    let imageObj = sourceFgCache[key];

    //extractDirs(figure)
    if (imageObj && imageObj.complete && imageObj.naturalHeight !== 0) {
        return imageObj;
    }
    if (!imageObj) {
        const svgTxt = `<svg xmlns="http://www.w3.org/2000/svg"
        stroke-linecap="round" stroke-linejoin="round"
        viewBox="0 0 ${cols * 100} ${rows * 100}">
        
        <rect x="20" y="20" width="${cols * 100 - 40}" stroke-width="10" height="${rows * 100 - 40}" rx="20" ry="20" 
        fill="#444" stroke="${color}" />
         <rect x="35" y="35" width="${cols * 100 - 70}" stroke-width="15" height="${rows * 100 - 70}" rx="10" ry="10" opacity="0" fill="#444" stroke="none" />
        
         <rect x="35" y="35" width="${cols * 100 - 70}" stroke-width="10" 
        height="${rows * 100 - 70}" rx="10" ry="10" opacity="1" 
        fill="#fff" stroke="none" />

        <rect x="45" y="45" width="${cols * 100 - 90}" stroke-width="10" 
        height="${rows * 100 - 90}" rx="3" ry="3" 
        fill="#444" xxfill="${color}" stroke="none" opacity="0.95"/>

        <circle cx="50" cy="50" r="5" fill="#444" opacity="0" stroke="none"/>
        

        
        </svg > `;

        sourceFgCache[key] = { complete: false }
        rasterizeSVG(svgTxt, SIZE * 3 * cols, SIZE * 3 * rows).then((img) => {

            img.complete = true;
            sourceFgCache[key] = img;
            //sourceFgCache.loadedCount++;
            //console.log("RAST COUNT:", figureImageCache.loadedCount)
        });
    }
}


// console.log("PRELOADING SPRITES");
// let cnt = 1;
// for (let figure = 1; figure < 16; figure++) {
//     for (let conns = 0; conns < 16; conns++) {
//         for (let on = 0; on < 4; on++) {
//             console.log("PRELOADING SPRITES", cnt++, figure, conns, on);
//             getFigureImage(figure, COLORS[on], on === 1 || on === 2, conns);
//         }
//     }
// }

export function drawCircle(ctx, x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
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
