import { BOTTOM, COLORS, LEFT, RADS, RIGHT, SIZE, TOP, TRANS_DURATION } from "./cfg";

export function createSourceSprite(figure1, figure2, dirs1, dirs2, color) {
    const sprite = document.createElement("canvas");
    sprite.width = 200;
    sprite.height = 400;

    const ctx = sprite.getContext("2d");

    ctx.strokeStyle = COLORS.at(color)

    let d1 = 70;
    let d2 = 80;
    ctx.beginPath();

    ctx.rect(d1, d1, SIZE * 2 - d1 * 2, SIZE * 4 - d1 * 2);
    // makes line ends and corners rounded
    ctx.lineWidth = 50;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();



    ctx.beginPath();
    ctx.rect(d2, d2, SIZE * 2 - d2 * 2, SIZE * 4 - d2 * 2);
    // makes line ends and corners rounded
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = "#333"
    ctx.strokeStyle = "#333"
    ctx.stroke(); ctx.fill();
    return sprite;
}

export function createTopDirSprite2(color) {
    const sprite = document.createElement("canvas");
    sprite.width = 200;
    sprite.height = 200;
    const ctx = sprite.getContext("2d");
    //00000
    //10000
    //01100
    //00000
    //00000
    drawPixels(ctx, 0, 0, 0b0000010000011000000000000)
    return sprite;
}

export function createTopDirSprite3(color) {
    const sprite = document.createElement("canvas");
    sprite.width = 200;
    sprite.height = 200;
    const ctx = sprite.getContext("2d");
    //01000
    //00100
    //00100
    //00000
    //00000
    //awPixels(ctx, 0, 0, 0b1111100000111110000000000)
    drawPixels(ctx, 0, 0, 0b0100000100001000000000000)
    return sprite;
}
export function createTopDirSprite(color) {
    const sprite = document.createElement("canvas");
    sprite.width = 200;
    sprite.height = 200;
    const ctx = sprite.getContext("2d");

    // ctx.fillStyle = "#fff";
    // ctx.fillRect(80 + 5, 0 + 5, 40 - 10, 40 - 10);
    // ctx.fillRect(80 + 5, 40 + 5, 40 - 10, 40 - 10);

    drawPixels(ctx, 0, 0, 0b0010000100001000000000000)
    // ctx.beginPath();
    // ctx.moveTo(100, 100);
    // ctx.lineTo(100, 10);
    // ctx.lineWidth = 20;
    // ctx.lineCap = "round";
    // ctx.lineJoin = "round";
    // ctx.strokeStyle = "#fff";
    // ctx.stroke();
    return sprite;
}
// export function drawPixels(ctx, x, y, mask, color = "#fff", size = 40, gap = 4) {
//     //mask for 5x5 = 0b1111100000111110000011111
//     //const size = 40;
//     //const gap = 10;
//     ctx.fillStyle = color;
//     //e.g. to draw at (x:3,y:0) ctx.fillRect(80 + 5, 0 + 5, 40 - 10, 40 - 10);
//     for (let i = 0; i < 25; i++) {
//         if (mask & (1 << (24 - i))) {
//             const px = x + (i % 5) * (size) + gap;
//             const py = y + Math.floor(i / 5) * (size) + gap;
//             ctx.fillRect(px, py, size - gap * 2, size - gap * 2);
//         }
//     }
// }

export function drawPixels(ctx, x, y, coors, color = "#fff", size = 40, gap = 1) {
    //mask for 5x5 = 0b1111100000111110000011111
    //const size = 40;
    //const gap = 10;
    ctx.fillStyle = color;
    //e.g. to draw at (x:3,y:0) ctx.fillRect(80 + 5, 0 + 5, 40 - 10, 40 - 10);
    coors.forEach(([cx, cy]) => {
        gap = 3
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const px = x + (cx) * (size) + gap;
        const py = y + (cy) * (size) + gap;

        //ctx.fillRect(px, py, size - gap * 2, size - gap * 2);
        ctx.strokeStyle = color;//"#fff"
        ctx.strokeWidth = 5

        ctx.strokeRect(px, py, size - gap * 2, size - gap * 2);
        ctx.fillRect(px, py, size - gap * 2, size - gap * 2);
    })
    return;
}

//export function drawDir


// const topSprite = createTopDirSprite();
// const topSprite2 = createTopDirSprite2();
// const topSprite3 = createTopDirSprite3();


const dirPixels_0 = {
    [TOP]: [[2, 0], [2, 1]],
    [RIGHT]: [[4, 2], [3, 2]],
    [BOTTOM]: [[2, 4], [2, 3]],
    [LEFT]: [[0, 2], [1, 2]],
}

const dirPixels_1 = {
    [TOP]: [[0, 1], [1, 2]],
    [RIGHT]: [[3, 0], [2, 1]],
    [BOTTOM]: [[4, 3], [3, 2]],
    [LEFT]: [[1, 4], [2, 3]],
}

const dirPixels_2 = {
    [TOP]: [[1, 0], [2, 1]],
    [RIGHT]: [[4, 1], [3, 2]],
    [BOTTOM]: [[3, 4], [2, 3]],
    [LEFT]: [[0, 3], [1, 2]],
}

export function drawDir(ctx, x, y, dir, dAngle = 0, color) {
    dAngle = Math.floor(-dAngle * 3); //0,1,2
    const sets = [dirPixels_0, dirPixels_2, dirPixels_1];
    const pixels = sets[dAngle];
    drawPixels(ctx, x, y, pixels[dir], COLORS[color], 20, 1)
    return;
}

export function createFigureSprite(figure, dirs, color) {
    const sprite = document.createElement("canvas");
    sprite.width = 200;
    sprite.height = 200;

    const ctx = sprite.getContext("2d");
    //ctx.scale(0.5, 0.5);
    ctx.strokeStyle = COLORS.at(color)
    ctx.beginPath();
    const short = 90;
    const long = 100;
    const length = {
        [TOP]: (dirs & TOP) ? long : short,
        [RIGHT]: (dirs & RIGHT) ? long : short,
        [BOTTOM]: (dirs & BOTTOM) ? long : short,
        [LEFT]: (dirs & LEFT) ? long : short,
    }

    const center = 100;

    if (figure & TOP) {
        ctx.moveTo(center, center);
        ctx.lineTo(center, center - length[TOP]);
    }
    if (figure & BOTTOM) {
        ctx.moveTo(center, center);
        ctx.lineTo(center, center + length[BOTTOM]);
    }
    if (figure & RIGHT) {
        ctx.moveTo(center, center);
        ctx.lineTo(center + length[RIGHT], center);
    }
    if (figure & LEFT) {
        ctx.moveTo(center, center);
        ctx.lineTo(center - length[LEFT], center);
    }

    // makes line ends and corners rounded
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    const isEnd = (figure === 0b1000 || figure === 0b0100 || figure === 0b0010 || figure === 0b0001);
    if (isEnd) {
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.lineTo(center, center);
        ctx.lineWidth = 50;
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = "#333"
        ctx.moveTo(center, center);
        ctx.lineTo(center, center);
        ctx.lineWidth = 12.5;
        ctx.stroke();
    }

    // drawDir(ctx, 0, 0, TOP)
    // drawDir(ctx, 0, 0, RIGHT)
    // drawDir(ctx, 0, 0, BOTTOM)
    return sprite;
}
const figureSprites = {};
export function getFigureSprite(figure, dirs, on) {
    dirs = dirs & 0b1111;
    figure = figure & 0b1111;
    on = on & 0b1111;
    const key = ((figure) | (dirs << 4) | (on << 8));
    if (!figureSprites[key]) {
        figureSprites[key] = createFigureSprite(figure, dirs, on);
    }
    return figureSprites[key];
}

const sourceSprites = {};
export function getSourceSprite(figure1, figure2, dir1, dir2, source) {
    const key = `${figure1}_${figure2}_${dir1}_${dir2}_${source}`;
    if (!sourceSprites[key]) {
        sourceSprites[key] = createSourceSprite(figure1, figure2, dir1, dir2, source);
    }
    return sourceSprites[key];

}
export function getGameFieldSprite(game) {
    for (let col = 0; col < game.cols; row++) {
        for (let row = 0; row < game.rows; row++) {
            const x = col * SIZE;
            const y = row * SIZE;
            const cell = game.atXY(col, row);
            let angle = 0;
            const timeMs = now - cell.rotatedOn;
            //console.log("MS", timeMs.toFixed(0))
            if (timeMs < TRANS_DURATION) {
                angle = -(1 - timeMs / TRANS_DURATION) * Math.PI / 2;
                //setUpdate((prev) => prev + 1);
            }
            ctx.save();
            ctx.translate(x + SIZE / 2, y + SIZE / 2);       // move origin
            ctx.rotate(angle);         // rotate (radians)
            ctx.drawImage(image, -SIZE / 2, -SIZE / 2, SIZE, SIZE);
            ctx.restore();
        }
    }
}

//let imageObj = null;
const figureImageCache = {};
const sourceFgCache = {};
const bgCache = {};

export function getFigureImage(figure, color, solved, conns) {
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
        <svg xmlns="http://www.w3.org/2000/svg" version="1.2" 
        stroke-width="${solved ? 30 : 30}"
        width="200"
        height="200"
        stroke-linecap="round" stroke-linejoin="round"
        stroke="${color}"
        fill="none"
        viewBox="0 0 200 200">
<g opacity="1">
        ${figure & TOP && `<path d="M100,50 l0,-${lenTop}" ></path>`}
        ${figure & RIGHT && `<path d="M150,100 l${lenRight},0"></path>`}
        ${figure & BOTTOM && `<path d="M100,150 l0,${lenBot}"></path>`}
        ${figure & LEFT && `<path d="M50,100 l-${lenLeft},0" ></path>`}
   </g>     
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
        
        <g opacity="1">
        ${isEnd && '<path stroke-width="115" d="M100,100 l0,0" stroke="#000" opacity="0.0" ></path>'}        
        
        ${isEnd && !solved && '<path stroke-width="100" d="M100,100 l0 0 " ></path>'}
        ${isEnd && '<path stroke-width="5" stroke="#111" opacity="0.5" d="M90,90 l20,20 M110,90 l-20,20" ></path>'}

        
         
        ${isEnd && solved && '<path stroke-width="100" d="M100,100 l0,0" ></path>'}
        ${isEnd && solved && '<path stroke-width="40" stroke="#fff" d="M100,100 l0,0" ></path>'}
        ${isEnd && solved && '<path stroke-width="10" stroke="#111" d="M100,100 l0,0" ></path>'}
        </g>   
        </svg > `;
        imageObj = new Image();
        const svgBlob = new Blob([svgTxt], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        imageObj.src = url;
        figureImageCache[key] = imageObj;
    }
}

export function getSourceBgImage(color) {
    const key = `${color} `;
    let imageObj = sourceFgCache[key];

    //extractDirs(figure)
    if (imageObj && imageObj.complete && imageObj.naturalHeight !== 0) {
        return imageObj;
    }
    if (!imageObj) {
        /*
                <path d="M100,100 l0,200"></path>
                <path d="M100,100 l0,200" stroke="#fff" stroke-width="60"></path>
                <g transform="translate(0 0)"  stroke-width="10"  stroke="#111">
                <path d="M100,100 l0,200"></path>
               
                </g>
        
        */
        const r = 50;
        const svgTxt = `<svg xmlns="http://www.w3.org/2000/svg" version="1.2"
        width="200"
        height="400"
        stroke-linecap="round" stroke-linejoin="round"
        stroke="${color}"
        fill="#fff"
        viewBox="0 0 200 400">
        <rect x="50" y="50" width="100" stroke-width="0" height="300" rx="25" ry="25" fill="#222" stroke="none" />
        <rect x="50" y="50" width="100" stroke-width="45" height="300" rx="25" ry="25" fill="none" stroke="#000" opacity="0.0" />
        
        
        <rect x="40" y="40" width="120" stroke-width="30" height="320" rx="30" ry="30" fill="none" stroke="${color}" />
            
        </svg > `;
        imageObj = new Image();
        const svgBlob = new Blob([svgTxt], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        imageObj.src = url;
        sourceFgCache[key] = imageObj;
    }
}

export function getBgImage(odd) {
    const key = `${odd}`;
    let imageObj = bgCache[key];

    //extractDirs(figure)
    if (imageObj && imageObj.complete && imageObj.naturalHeight !== 0) {
        return imageObj;
    }
    if (!imageObj) {
        const svgTxt = `
        <svg xmlns="http://www.w3.org/2000/svg" version="1.2" 
        stroke-width="4"
        stroke-linecap="round" stroke-linejoin="round"
        stroke="none"
        width="200"
        height="200"
        viewBox="0 0 200 200">
       <rect opacity="0" x="20" y="20" width="160" height="160" rx="20" ry="20" fill="#333"  stroke="#444" />
       ${odd && '<rect x="4" y="4" width="192" height="192" rx="4" ry="4" fill="#111" stroke="none" />'}
       ${!odd && '<rect x="4" y="4" width="192" height="192" rx="4" ry="4" fill="#222" stroke="none" />'}

       ${odd && '<rect x="0" y="0" width="200" height="200" fill="#111" stroke="none" />'}
       ${!odd && '<rect x="0" y="0" width="200" height="200" fill="#222" stroke="none" />'}
       
       
        </svg > `;
        imageObj = new Image();
        const svgBlob = new Blob([svgTxt], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        imageObj.src = url;
        bgCache[key] = imageObj;
    }
}