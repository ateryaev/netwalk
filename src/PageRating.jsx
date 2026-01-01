import { DetailedButton } from "./components/Button";
import Modal, { SubContent, SubHeader } from "./components/Modal";
import { Frame, Inv, Titled } from "./components/UI";
import { cn } from "./utils/cn";
import { useOnline } from "./OnlineContext";
import { useState, useMemo } from "react";
import { Ago } from "./components/Ago";
import { SvgLoad } from "./components/Svg";
import { Hash } from "./components/Hash";
import { Flag } from "./components/Flag";

function RankRecord({ rank, name, uid, country, special, at, score, ...props }) {
    return (
        <div className={cn("p-3 gap-2 bg-white red-200 text-gray-600 darkpuzzle flex items-start",
            special && "bg-gray-200 puzzle/20 xtext-puzzle rounded-sm "
        )} {...props}>


            <Flag code={country} />
            <div className="flex-1 overflow-hidden ">
                <div className="flex gap-2 uppercase">
                    <div className="flex gap-2 items-center flex-1 overflow-hidden select-text">
                        <div className="text-ellipsis overflow-hidden">{name}<Hash uid={uid} /></div>
                    </div>
                    <Inv>{rank.toString().padStart(1, 0)}</Inv>
                </div>

                <div className="flex gap-2 text-[85%] xuppercase opacity-60">
                    <div className="flex-1 text-ellipsis overflow-hidden whitespace-nowrap uppercase">
                        <Inv>{score.toLocaleString('en-US')}</Inv> points&nbsp;
                        {/* {!special && <Ago at={at} />} */}
                        {/* {special && <>THIS IS <Inv>YOU</Inv></>} */}
                    </div>
                    {special ? <div className="animate-pulse">RANK OF YOU</div> : "RANK"}
                </div>
            </div>
        </div >
    )
}

export function PageRating({ shown, onBack, onClose }) {
    const online = useOnline();
    const [show, setShow] = useState(false);

    const me = useMemo(() => {
        // return online.scores item online.uid === record.uid
        // also add .rank to the item
        const myIndex = online.scores?.findIndex(record => record.uid === online.uid) ?? -1;
        return myIndex !== -1 ? {
            ...online.scores[myIndex],
            rank: myIndex + 1
        } : null;

    }, [online.scores, online.uid])

    if (!online.isOnline) {
        return (<div className="flex-1 grid items-center justify-center p-4 text-gray-600">
            <div className="flex h-fit gap-2 uppercase text-[85%] animate-pulse items-center">
                Loading <SvgLoad />
            </div>
        </div>)
    }
    return (
        <>
            <SubHeader>TOP Players</SubHeader>
            <SubContent>
                <Frame className={"ring-gray-200 puzzle/40 "}>
                    {online.scores?.map((record, index) => (
                        <RankRecord
                            key={record.uid}
                            special={online.uid === record.uid}
                            rank={index + 1} name={record.name}
                            score={record.score}
                            uid={record.uid}
                            at={record.at}
                            country={record.country} />
                    ))}
                </Frame>

            </SubContent>
            <SubHeader>Recent Events</SubHeader>
            <SubContent >
                <Frame className={"ring-gray-200 puzzle/40 "}>
                    {online.events?.map((record, index) => (
                        <div key={index} className={cn("p-3 gap-2 text-gray-600 flex items-start ")}>
                            <Flag className="" code={record.country} />
                            <div className="flex-1 overflow-hidden">
                                <div className="flex gap-2 uppercase items-center">
                                    <div className="flex-1 text-ellipsis overflow-hidden select-text">
                                        {record.name}<Hash uid={record.player} /></div>
                                    <Inv>{record.msg}</Inv>
                                </div>
                                <div className="flex gap-2 text-[85%] xuppercase opacity-60">
                                    <div className="flex-1 text-ellipsis overflow-hidden whitespace-nowrap uppercase">
                                        <Inv><Ago at={record.at} /></Inv>
                                    </div>
                                    POINTS
                                </div>
                            </div>

                        </div >
                    ))}
                </Frame>
            </SubContent>

            <SubHeader className={""}>Own stats</SubHeader>
            <SubContent className={"uppercase text-gray-600 p-4 gap-2"}>
                <Frame className={"ring-gray-200 gap-4 p-4"}>


                    {!me && <div className="text-gray-600 px-4 py-2 uppercase text-center">No data yet</div>}
                    {me && <>

                        <div className="flex xflex-col items-center gap-2  overflow-hidden text-ellipsis justify-center">
                            <div className="">Rank</div>
                            <Inv>{me.rank}</Inv>
                        </div>

                        <div className="flex items-center gap-2 overflow-hidden text-ellipsis justify-center">
                            <div className="">Name</div>
                            <Inv>{me.name}</Inv>
                        </div>

                        <div className="flex items-center gap-2 overflow-hidden text-ellipsis justify-center">
                            <div>Hash</div>
                            <Inv><Hash className="opacity-100" uid={me.uid} /></Inv>
                        </div>

                        <div className="flex items-center gap-2 overflow-hidden text-ellipsis justify-center">
                            <div>Country</div>
                            <div className="flex gap-2 items-center">
                                <Flag code={me.country} />
                                <Inv>{me.country}</Inv>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 overflow-hidden text-ellipsis justify-center">
                            <div>Points</div>
                            <Inv>{me.score}</Inv>
                        </div>
                    </>}
                </Frame>
            </SubContent>
        </>);
}
