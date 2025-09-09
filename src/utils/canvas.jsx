import { BOTTOM, COLOR, LEFT, RADS, RIGHT, SIZE, TOP, TRANS_DURATION } from "./cfg";
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
        ${isEnd && '<path stroke-width="5" stroke="#111" opacity="0.0" d="M90,90 l20,20 M110,90 l-20,20" ></path>'}

        
         
        ${isEnd && solved && '<path stroke-width="100" d="M100,100 l0,0"  opacity="1"></path>'}
        ${isEnd && solved && '<path stroke-width="40" stroke="#fff" d="M100,100 l0,0"  opacity="0"></path>'}
        ${isEnd && solved && '<path stroke-width="10" stroke="#111" d="M100,100 l0,0"  opacity="0"></path>'}
        </g>   
        </svg > `;

        figureImageCache[key] = { complete: false }
        rasterizeSVG(svgTxt, SIZE * 2, SIZE * 2).then((img) => {

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
        /*
                <path d="M100,100 l0,200"></path>
                <path d="M100,100 l0,200" stroke="#fff" stroke-width="60"></path>
                <g transform="translate(0 0)"  stroke-width="10"  stroke="#111">
                <path d="M100,100 l0,200"></path>
               
                </g>
                 <path stroke-width="20" stroke="#fff" fill="#111" d="M50,50 l0,0" ></path>
        <path stroke-width="5" stroke="#111" d="M50,50 l0,0" ></path>
        
        */
        const r = 50;
        let eyes = ""
        for (let c = 0; c < 4 * cols + (cols - 1) * 6; c++) {
            for (let r = 0; r < 4 * rows + (rows - 1) * 6; r++) {

                let cx = 35 + c * 10;
                let cy = 35 + r * 10;
                eyes += `<circle cx="${cx}" cy="${cy}" r="${2.5}" opacity="${1}" stroke="none" fill="#333"/>`;
                if (rnd(4) === 4) {
                    eyes += `<circle cx="${cx}" cy="${cy}" r="${3}" opacity="${1}" stroke="none" fill="${color}"/>`;
                }
            }

        }
        // for (let i = 0; i < 8; i++) {
        //     //cx =25..75
        //     //cy=25..175
        //     //opacity=0.2..0.8

        //     //rnd(4)

        //     rnd()

        //     let cx = 25 + Math.random() * 50; // Random x-coordinate between 25 and 75
        //     let cy = 25 + Math.random() * 50; // Random y-coordinate between 25 and 175

        //     cx = Math.round(cx / 10) * 10 + 6
        //     cy = Math.round(cy / 10) * 10 + 6

        //     const opacity = 0.1 + Math.random() * 0.9; // Random opacity between 0.2 and 0.8
        //     const scale = 1.1 - opacity;// Math.random(); // Random scale between 1 and 2
        //     //eyes += `<circle cx="${cx}" cy="${cy}" r="${5 * scale}" opacity="${opacity}" stroke="#fff" fill="#111" stroke-width="${7.5 * scale}"/>`;
        //     eyes += `<circle cx="${cx}" cy="${cy}" r="${3}" opacity="${1}" stroke="none" fill="#222"/>`;
        // }
        const svgTxt = `<svg xmlns="http://www.w3.org/2000/svg" version="1.2"
        stroke-linecap="round" 
        stroke-linejoin="round"
        stroke="${color}"
        fill="#fff"
        viewBox="0 0 ${cols * 100} ${rows * 100}">
        
        
        <rect x="20" y="20" width="${cols * 100 - 40}" stroke-width="10" height="${rows * 100 - 40}" rx="20" ry="20" fill="#222" stroke="${color}" />

        <rect x="35" y="35" width="${cols * 100 - 70}" stroke-width="15" height="${rows * 100 - 70}" rx="10" ry="10" opacity="0.4" fill="${color}" stroke="none" />
        
        

        <g opacity="0">
        ${eyes}
        </g>
        </svg > `;

        sourceFgCache[key] = { complete: false }
        rasterizeSVG(svgTxt, SIZE * 2, SIZE * 4).then((img) => {

            img.complete = true;
            sourceFgCache[key] = img;
            //sourceFgCache.loadedCount++;
            //console.log("RAST COUNT:", figureImageCache.loadedCount)
        });

        // imageObj = new Image();
        // const svgBlob = new Blob([svgTxt], { type: "image/svg+xml;charset=utf-8" });
        // const url = URL.createObjectURL(svgBlob);
        // imageObj.src = url;
        // sourceFgCache[key] = imageObj;
    }
}

export function getBgImage(odd) {
    return;
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
        width="50"
        height="50"
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

