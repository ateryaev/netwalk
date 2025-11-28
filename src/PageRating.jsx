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

function RankRecord({ rank, name, uid, country, special, at, score, ...props }) {
    //const FlagComponent = FlagIcons[country];
    return (
        <div className={cn("p-0 flex gap-1 ")} {...props}>
            <div className={cn("text-puzzle p-2 bg-white flex flex-col items-center justify-center",
                special && "bg-puzzle-50 text-darkpuzzle"
            )}>
                <div>{rank.toString().padStart(1, 0)}</div>
                <div className="h-0 invisible">0000</div>
            </div>

            <div className={cn("bg-whitex p-2 text-darkpuzzle bg-white flex-1", special && "bg-puzzle-50 text-darkpuzzle")}>
                <div className="flex gap-2 uppercase">
                    <div className="flex gap-0 items-center flex-1">
                        <Flag code={country} />
                        {name}
                        <Hash uid={uid} />
                    </div>
                    <Inv>{score.toLocaleString('en-US')}</Inv>
                </div>
                <div className="flex gap-2 text-[85%] xuppercase opacity-60 -mt-1">
                    <div className="flex-1">
                        {special && <Inv>THIS IS YOUR RECORD</Inv>}
                        {!special && <Ago at={at} />}
                    </div>
                    POINTS
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

    return (
        <ModalContent>

            {me && <SubContent className={"m-3 p-1 gap-1 bg-puzzle-100"}>
                <RankRecord special={true} {...me} />
            </SubContent>}

            <SubHeader>TOP Players</SubHeader>
            <SubContent className={"m-3 p-1 gap-1 bg-puzzle-100"}>
                {!online.isOnline && <div className="bg-white p-4 text-ipuzzle text-center ring-4 ring-white/50">
                    <SvgLoad />
                </div>}

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
        </ModalContent>);
}