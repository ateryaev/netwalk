import { DetailedButton } from "./components/Button";
import Modal, { ModalContent, SubContent, SubHeader } from "./components/Modal";
import { Inv, Titled } from "./components/UI";
import { cn } from "./utils/cn";
import { useOnline } from "./OnlineContext";
import { useState, ViewTransition, startTransition, useMemo } from "react";
import { Ago } from "./components/Ago";
import { SvgLoad } from "./components/Svg";
import { Hash } from "./components/Hash";
import { Flag } from "./components/Flag";

// function RankRecord({ rank, name, uid, country, special, at, score, ...props }) {
//     return (
//         <div className={cn("p-0 flex gap-1 ")} {...props}>
//             <div className={cn("text-puzzle p-2 bg-white flex flex-col items-center justify-center",
//                 special && "bg-puzzle-50 text-darkpuzzle"
//             )}>
//                 <div>{rank.toString().padStart(1, 0)}</div>
//                 <div className="h-0 invisible">0000</div>
//             </div>

//             <div className={cn("bg-whitex p-2 overflow-hidden text-darkpuzzle bg-white flex-1", special && "bg-puzzle-50 text-darkpuzzle")}>
//                 <div className="flex gap-2 uppercase">
//                     <div className="flex gap-0 items-center flex-1 overflow-hidden">
//                         <Flag code={country} />
//                         <div className="text-ellipsis overflow-hidden">{name}<Hash uid={uid} /></div>
//                     </div>
//                     <Inv>{score.toLocaleString('en-US')}</Inv>
//                 </div>
//                 <div className="flex gap-2 text-[85%] xuppercase opacity-60 -mt-1">
//                     <div className="flex-1 text-ellipsis overflow-hidden whitespace-nowrap">
//                         {special && <>THIS IS <Inv>YOUR</Inv> RECORD</>}
//                         {!special && <Ago at={at} />}
//                     </div>
//                     POINTS
//                 </div>
//             </div>

//         </div >
//     )
// }

function RankRecord({ rank, name, uid, country, special, at, score, ...props }) {
    return (
        <div className={cn("p-2 px-4 gap-2 bg-white red-200 text-gray-600 darkpuzzle flex items-start",
            special && "border-l-6 pl-2.5 border-ipuzzle"
        )} {...props}>


            <Flag code={country} />
            <div className="flex-1">
                <div className="flex gap-2 uppercase">
                    <div className="flex gap-2 items-center flex-1 overflow-hidden">

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
                    {special ? "RANK OF YOU" : "RANK"}
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
        <ModalContent>

            {/* {me && <SubContent className={"xm-3 xp-1 gap-1 xbg-puzzle-100"}>
                <RankRecord special={true} {...me} />
            </SubContent>} */}


            <SubHeader>TOP Players</SubHeader>
            <SubContent className={"xm-3 p-0 gap-0 py-2"}>

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

            </SubContent>
            <SubHeader>Recent Events</SubHeader>
            <SubContent className={"py-2"}>
                {online.events?.map((record, index) => (
                    <div key={index} className={cn("p-2 px-4 gap-2 text-gray-600 flex items-start ")}>
                        <Flag className="" code={record.country} />
                        <div className="flex-1">
                            <div className="flex gap-2 uppercase items-center">
                                <div className="flex-1 text-ellipsis overflow-hidden">{record.name}<Hash uid={record.uid} /></div>
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
                    // <div className="px-4 py-2 flex items-center gap-2 text-darkpuzzle overflow-hidden text-ellipsis"
                    //     key={record.uid}
                    // >
                    //     <Flag code={record.country} />

                    //     <div className="flex-1 flex gap-1 items-center overflow-hidden text-ellipsis whitespace-nowrap uppercase">{record.name}
                    //         <div className="opacity-50 overflow-hidden text-ellipsis"><Ago at={record.at} /></div></div>

                    //     <Inv> {record.msg}</Inv>
                    // </div>
                ))}
            </SubContent>

            <SubHeader className={""}>Own stats</SubHeader>
            {!me && <SubContent className={""}>
                <div className="text-gray-600 px-4 py-2 uppercase text-center">No data yet</div>
            </SubContent>}
            {me && <SubContent className={"uppercase text-gray-600 p-4 gap-2"}>

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
            </SubContent>}

            {/* <SubHeader className="xopacity-50 saturate-50xx xxhue-rotate-180 bg-ipuzzle/10">
                <div className="flex-1">

                    <div className={cn("bg-whitex p-0 overflow-hidden text-ipuzzle xbg-white flex-1")}>
                        <div className="flex gap-2 uppercase">
                            <div className="flex gap-2 items-center flex-1 overflow-hidden">
                                <Flag code={me.country} />
                                <div className="text-ellipsis overflow-hidden">{me.name}<Hash uid={me.uid} /></div>
                            </div>
                            {me.rank.toString().padStart(1, 0)}
                        </div>

                    </div>

                </div>

            </SubHeader> */}
        </ModalContent>);
}