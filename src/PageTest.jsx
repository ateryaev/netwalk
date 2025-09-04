import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { cn } from './utils/cn'

import { GameCell } from './components/GameCell';
import { rnd, bymod } from './utils/helpers';
import { createGame } from './utils/gameplay';
import { GameCellBg } from './components/GameCellBg';
import { GameCellSource } from './components/GameCellSource';
import { SIZE } from "./utils/cfg";
import { GameHeader } from './components/GameHeader';
import { PanZoomView } from './components/PanZoomView';
import { addXY, divXY, minmax, mulXY, printXY, subXY, XY } from './utils/vectors';

export function PageTest({ onBack }) {

    const [scroll, setScroll] = useState({ x: 100, y: 100 });
    const [zoom, setZoom] = useState(1.0);
    const [fieldSize, setFieldSize] = useState({ w: 100, h: 100 });



    function handleScrollerChange(newScroll, newZoom) {
        //console.log("SCROLL", newScroll, newZoom)
        setScroll(newScroll);
        setZoom(newZoom);
    }
    function handlePress(xy, button) {
        console.log("PRESS", xy, button)
    }
    function handleRelease(xy, button, isJustClick) {
        console.log("RELEASE", xy, button, isJustClick ? "CLICK" : "MOOVE")
    }

    // useEffect(() => {
    //     let dz = 0;
    //     if (zoom < 0.75) {
    //         dz = 0.75 - zoom;
    //         requestAnimationFrame(() => {
    //             setZoom(zoom + dz / 100);
    //         })
    //     }
    // }, [zoom])

    return (
        <div className="flex flex-1 flex-col p-0 gap-2 bg-black">


            <PanZoomView
                className={cn("flex-1 bg-white")}

                onScroll={(scrollDelta) => {
                    setScroll((prev) => addXY(prev, divXY(scrollDelta, zoom)));
                }}

                onZoom={(zoomDelta, coors) => {
                    const scrollDelta = mulXY(coors, (1 - zoomDelta) / (zoomDelta * zoom));
                    setScroll((prev) => addXY(prev, scrollDelta));
                    setZoom((prev) => prev * zoomDelta);
                }}

                onPress={(coords) => {
                    printXY("PRESS", coords);
                    printXY("SCROLL/ZOOM", scroll, zoom);
                    printXY("PRESS_IN", subXY(divXY(coords, zoom), scroll));
                }}
                onRelease={(coords, buttons, noClick) => {
                    printXY("RELEASE", coords, buttons, noClick);
                }}

                onResize={(size) => {
                    printXY("RESIZE", size);
                }}
            >

                <div
                    style={{
                        translate: `${scroll.x * zoom}px ${scroll.y * zoom}px`, transformOrigin: '0 0',
                        //scale: `${zoom}`,
                        width: `${fieldSize.w * zoom}px`,
                        height: `${fieldSize.h * zoom}px`,
                        borderWidth: `${25 * zoom}px`
                    }}
                    className='bg-red-500 absolute grid content-center justify-center border-white/60'>
                    123
                </div>

            </PanZoomView>

            <div className='p-4 text-lg flex items-center font-mono bg-gray-200 overflow-hidden'>
                <div className='flex-1'>
                    SCROLL: {scroll.x.toFixed(2)}:{scroll.y.toFixed(2)}
                    <br />
                    ZOOM: {zoom.toFixed(2)}
                </div>
                <button className='p-2 bg-black text-white' onClick={onBack}>back</button>
            </div>


        </div >
    )
}
