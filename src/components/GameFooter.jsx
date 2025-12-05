import { startTransition, useEffect, useMemo, useState, ViewTransition } from "react";
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



export function GameFooter({ taps, bordered, random, solved, tutorial, size, ...props }) {
    const online = useOnline();

    const [event, setEvent] = useState(null);
    const [shownEvent, setShownEvent] = useState(false); //0 - no event, 1- shown, 2
    const [lastEvent, setLastEvent] = useState(null);
    const [eventState, setEventState] = useState(0); //0 - waiting, 1- shown, 2 - hidden

    const eventReady = useMemo(() => event && eventState === 1, [event, eventState]);

    useEffect(() => {

        const interval = setInterval(() => {

        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // set curent visible event
    useEffect(() => {
        if (!online.events?.[0]) return;
        if (eventState !== 0) return;
        const newEvent = online.events?.[0];
        if (event?.at === newEvent.at) return;

        startTransition(() => {
            setEvent(newEvent);
            setEventState(1);
        });

    }, [online.events, eventState, event]);

    useEffect(() => {
        if (eventState === 1) {
            const to = setTimeout(() => { startTransition(() => setEventState(2)) }, 2000);
            return () => clearTimeout(to);
        } else if (eventState === 2) {
            const to = setTimeout(() => { startTransition(() => setEventState(0)) }, 2000);
            return () => clearTimeout(to);
        }
    }, [eventState]);

    function handleShowEvent() {
        if (eventState === 1) {
            setEventState(2);
        } else {
            setEvent(null);
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
        <div className="flex flex-1 items-center justify-center  gap-2 w-full"
            onClick={handleShowEvent} key={123}>

            <ViewTransition enter='slide-in' exit='slide-out'>
                <div className="flex gap-2 items-center flex-1">
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
            </ViewTransition>

            <div className="min-w-[55px] rounded-lg text-ipuzzle bg-ipuzzle/20 px-2 py-0.5 -my-0.5 text-center">
                <ViewTransition enter='slide-in' exit='slide-out'>{taps}</ViewTransition>
            </div>
            <div className=" text-ipuzzle opacity-45x text-xs py-1 -my-1 lowercase">
                taps
            </div>
        </div>
        {/* </ViewTransition> */}
    </>
    )
}