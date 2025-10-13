import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from './utils/cn'


import { rnd, bymod } from './utils/numbers';
import { SIZE } from "./game/cfg";
import { GameHeader } from './components/GameHeader';
import { PanZoomView } from './components/PanZoomView';
import { addXY, distXY, divXY, mulXY, printXY, subXY, toXY } from './utils/xy';

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



    const [centerXY, setCenterXY] = useState({ x: 0, y: 0 });
    //const [centerXYto, setCenterXYto] = useState({ x: 0, y: 0 });
    const [zooom, setZooom] = useState(2);

    const [panZoom, setPanZoom] = useState({ center: toXY(200, 200), zoom: 1 });
    const [panZoomTo, setPanZoomTo] = useState({ center: toXY(0, 0), zoom: 1 });

    useEffect(() => {
        if (!panZoomTo) return;
        requestAnimationFrame(() => {
            let delta = mulXY(subXY(panZoomTo.center, panZoom.center), 0.25);
            //printXY("DELTa", panZoomTo.center, panZoom.center)
            const dist = distXY(toXY(0, 0), delta);
            setPanZoom({ zoom: panZoom.zoom + (panZoomTo.zoom - panZoom.zoom) * 0.25, center: addXY(panZoom.center, delta) })
        });
    }, [panZoomTo, panZoom]);

    function test() {
        // setPanZoomTo({ center: toXY(50, 50), zoom: 1 });
    }

    return (
        <div className="flex flex-1 flex-col p-0 gap-2 bg-black">


            <PanZoomView
                panZoom={panZoom}
                onPanZoomChange={({ center, zoom }) => {
                    //printXY("DELTa", panZoomTo.center, panZoom)
                    setPanZoom({ center, zoom });
                }}

                className={cn("flex-1 bg-white")}

                onPress={(coords) => {
                    setPanZoomTo(null)
                    printXY("PRESS2", coords);
                    // printXY("SCROLL/ZOOM", scroll, zoom);
                    // printXY("PRESS_IN", subXY(divXY(coords, zoom), scroll));
                }}
                onRelease={(coords, buttons, noClick) => {
                    printXY("RELEASE", coords, buttons, noClick);
                }}
                onClick={(coords) => {
                    printXY("CLICK", coords);
                }}

                onResize={(size) => {
                    printXY("RESIZE", size);
                }}
            >

                {/* {viewSize.x > 0 &&
                <div
                    style={{
                        //translate: `${scroll.x * zoom}px ${scroll.y * zoom}px`, transformOrigin: '0 0',
                        translate: `${-contentRect.at.x * panZoom.zoom}px ${-contentRect.at.y * panZoom.zoom}px`, transformOrigin: '0 0',
                        //scale: `${zoom}`,
                        width: `${100 * panZoom.zoom}px`,
                        height: `${100 * panZoom.zoom}px`,
                        borderWidth: `${25 * panZoom.zoom}px`
                    }}
                    className='bg-red-500 absolute grid content-center justify-center border-white/60'>
                    <span style={{ scale: panZoom.zoom }}>OPP=</span>
                </div>
            } */}

            </PanZoomView>


            <div className='p-4 text-lg flex gap-4 items-center font-mono bg-gray-200 overflow-hidden'>
                <button className='p-2 bg-black text-white' onClick={test}>test</button>
                <div className='flex-1'>
                    SCROLL: {panZoom.center.x.toFixed(2)}:{panZoom.center.y.toFixed(2)}
                    <br />
                    ZOOM: {panZoom.zoom.toFixed(2)}
                </div>
                <button className='p-2 bg-black text-white' onClick={onBack}>back</button>
            </div>


        </div >
    )
}
