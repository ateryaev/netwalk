import { DetailedButton, MenuButton, PinkButton, RoundButton } from "./components/Button";
import Modal, { SubContent, SubHeader } from "./components/Modal";
import { Frame, Inv, Titled } from "./components/UI";
import { cn } from "./utils/cn";
import { useOnline } from "./OnlineContext";
import { useState, useMemo } from "react";
import { Ago } from "./components/Ago";
import { SvgBack, SvgLoad } from "./components/Svg";
import { Hash } from "./components/Hash";
import { Flag } from "./components/Flag";
import { useGame } from "./GameContext";
import { GAME_MODE_SCORE, GAME_MODES } from "./game/gameconstants";

function RankRecord({ rank, name, uid, country, special, at, score, ...props }) {
    return (
        <div className={cn("p-3 gap-2 rounded-md text-gray-600 flex items-start bg-gray-50",
            special && "bg-puzzle/10"
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

    const [recortCount, setRecordCount] = useState(5);

    function handleMore() {
        setRecordCount((prev) => prev + 10);
    }

    const { settings, getLevelsSolved } = useGame();

    //    const country = await fetchCountry();
    const totalScore = GAME_MODES.reduce((total, _, mode) =>
        total + GAME_MODE_SCORE(mode, getLevelsSolved(mode)), 0);

    const me = useMemo(() => {
        const myIndex = online.scores?.findIndex(record => record.uid === online.uid) ?? -1;
        return myIndex !== -1 ? {
            ...online.scores[myIndex],
            rank: myIndex + 1
        } : {
            name: settings?.name || "NONAME",
            country: online.country,
            uid: online.uid,
            score: totalScore,
            rank: "LOW"
        };

    }, [online.scores, online.uid, online.country, settings?.name, totalScore]);


    if (!online.isOnline) return (
        <SubContent>
            <Frame className={"ring-gray-100 bg-gray-100 flex flex-row justify-center text-puzzle-400 h-fit gap-2 uppercase text-sm p-4 items-center"}>

                connecting <SvgLoad className="animate-spin inline-block" />
            </Frame>
        </SubContent>
    )

    return (
        <>
            <SubHeader>TOP Players</SubHeader>
            <SubContent>
                <Frame className={"ring-gray-200"}>
                    {online.scores?.slice(0, recortCount).map((record, index) => (
                        <RankRecord
                            key={record.uid}
                            special={online.uid === record.uid}
                            rank={index + 1}
                            name={record.name}
                            score={record.score}
                            uid={record.uid}
                            at={record.at}
                            country={record.country} />
                    ))}

                    {recortCount < (online.scores?.length || 0) && <MenuButton
                        className={cn("bg-puzzle/20 text-puzzle",
                            "active:bg-puzzle/10 focus:bg-puzzle/10"
                        )}
                        onClick={handleMore} >show more</MenuButton>}
                </Frame>
            </SubContent>

            <SubHeader>Recent Events</SubHeader>
            <SubContent >
                <Frame className={"ring-gray-200  "}>
                    {online.events?.slice(0, 5).map((record, index) => (
                        <div key={index} className={cn("p-3 gap-2 text-gray-600 flex items-start bg-gray-50",
                            (record.uid === online.uid) && "bg-puzzle/10 rounded-md "

                        )}>
                            <Flag className="" code={record.country} />
                            <div className="flex-1 overflow-hidden">
                                <div className="flex gap-2 uppercase items-center">
                                    <div className="flex-1 text-ellipsis overflow-hidden select-text">
                                        {record.name}<Hash uid={record.uid} /></div>
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
                <Frame className={"ring-gray-200 gap-4 p-4 grid grid-cols-2 bg-gray-50"}>
                    {!me && <div className="text-gray-600 uppercase text-center col-span-2">No data yet</div>}
                    {me && <>

                        <div className="text-right">Rank</div>
                        <Inv>{me.rank}</Inv>

                        <div className="text-right">Name</div>
                        <Inv>{me.name}</Inv>

                        <div className="text-right">Hash</div>
                        <Inv><Hash className="opacity-100" uid={me.uid} /></Inv>


                        <div className="text-right">Country</div>

                        <div className="flex gap-2 items-center">
                            <Flag code={online.country} />
                            <Inv>{online.country}</Inv>
                        </div>

                        <div className="text-right">Points</div>
                        <Inv>{me.score.toLocaleString('en-US')}</Inv>
                    </>}
                </Frame>
            </SubContent>
        </>);
}
