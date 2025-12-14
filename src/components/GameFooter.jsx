import { useEffect, useMemo, useState } from "react";
import { useOnline } from "../OnlineContext";
import { Ago } from "./Ago";
import { Flag } from "./Flag";
import { Inv } from "./UI";
import { Hash } from "./Hash";

export function Removing({ children, className, ...props }) {
    const [] = useState(false);
    return (<div className={cn("opacity-100", className)}>{children}</div>);
}

// 0 - Event ready to be loaded
// 1 - Event loaded and shown (for 3s)
// 2 - Event hidden to show regular status (for 1s)

let LAST_EVENT = null;

export function GameFooter({ taps, bordered, random, solved, tutorial, size, ...props }) {
    const online = useOnline();

    const [event, setEvent] = useState(LAST_EVENT);
    const [shownEvent, setShownEvent] = useState(false); //0 - no event, 1- shown, 2
    //const [lastEvent, setLastEvent] = useState(null);
    const [eventState, setEventState] = useState(2); //0 - waiting, 1- shown, 2 - hidden

    const eventReady = useMemo(() => event && eventState === 1, [event, eventState]);



    // set curent visible event
    useEffect(() => {
        if (tutorial) return;
        if (!online.events?.[0]) return;
        if (eventState !== 0) return;
        const newEvent = online.events?.[0];

        if (LAST_EVENT?.at === newEvent.at) return;
        LAST_EVENT = newEvent;

        setEvent(newEvent);
        setEventState(1);
    }, [online.events, eventState, tutorial, event]);

    useEffect(() => {
        if (eventState === 1) {
            const to = setTimeout(() => { setEventState(2) }, 2000);
            return () => clearTimeout(to);
        } else if (eventState === 2) {
            const to = setTimeout(() => { setEventState(0) }, 2000);
            return () => clearTimeout(to);
        }
    }, [eventState]);

    function handleShowEvent() {
        if (eventState === 1) {
            setEventState(2);
        } else {
            setEvent(null);
            LAST_EVENT = null;
            setEventState(0);
        }
    }

    if (tutorial) return (
        <>
            {tutorial}
        </>
    );

    return (<>

        {/* <ViewTransition enter='slide-in' exit='slide-out' xxupdate={eventVisible ? "slide-in" : "slide-out"}> */}
        <div className="flex flex-1 items-center justify-center overflow-hidden gap-2 w-full"
            onClick={handleShowEvent} key={123}>

            <div key={eventReady} className="flex gap-2 items-center flex-1 
                overflow-hidden text-ellipsis
                starting:translate-y-1 starting:opacity-0 transition-all xduration-700">
                {!eventReady && <>
                    <div>
                        {bordered ? "bordered" : "looped"}
                    </div>

                    <div className='flex items-center lowercasex'>
                        {size.x}<Inv>x</Inv>{size.y}</div>
                    <div>
                        {!solved && <Inv>NEW</Inv>}
                        {solved && !random && <Inv>SOLVED</Inv>}
                        {solved && random && <Inv>RANDOM</Inv>}
                    </div>
                </>}
                {eventReady && <>
                    <Flag code={event.country} />
                    {event.name}
                    <Inv>{event.msg}</Inv>
                    <Ago at={event.at} />
                </>}
            </div>

            <div key={taps} className="min-w-[55px] rounded-lg text-ipuzzle/80 bg-ipuzzle/20 px-2 py-0.5 -my-0.5 text-center
            starting:scale-105 starting:text-ipuzzle transition-all xduration-1000">
                {taps}
            </div>
            <div className=" text-ipuzzle opacity-45x text-xs py-1 -my-1 lowercase">
                taps
            </div>
        </div>
        {/* </ViewTransition> */}
    </>
    )
}