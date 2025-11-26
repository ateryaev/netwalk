import { DetailedButton } from "./components/Button";
import Modal, { ModalContent, SubContent, SubHeader } from "./components/Modal";
import * as FlagIcons from 'country-flag-icons/react/3x2';
import { Inv, Titled } from "./components/UI";
import { cn } from "./utils/cn";
import { useOnline } from "./OnlineContext";
import { useState, ViewTransition, startTransition } from "react";


{/* <BaseButton className={cn("items-center uppercase p-6 flex gap-2 justify-center",
    "text-darkpuzzle whitespace-nowrap",
    "focus:opacity-75 disabled:opacity-50",
    "active:opacity-75",
    className)}
    {...props}>
    {children}
</BaseButton> */}

function RankRecord({ rank, name, hash, country, special, score, ...props }) {
    const FlagComponent = FlagIcons[country];

    return (
        <div className={cn("p-0 flex gap-1 items-centerx xjustify-between")} {...props}>
            <div className={cn("text-ipuzzle p-2 bg-white flex flex-col items-center justify-center",
                special && "bg-white/50"
            )}>
                <div>{rank.toString().padStart(1, 0)}</div>
                <div className="h-0 invisible">000</div>
            </div>

            {/* <Titled className={"text-darkpuzzlex text-whitex xbg-black"}
                title={<>&nbsp;</>}>
                <div className="text-xl">{rank.toString().padStart(3, 0)}</div>
            </Titled> */}

            <Titled className={"flex-1 bg-white p-2 text-darkpuzzle"} title={<div className="flex gap-1 items-center">
                <FlagComponent className="inline border border-black/10 w-[1.25em] xring-2 ring-black/20" />
                {name}
                <span className="opacity-40 text-xs lowercase italic">#{hash}</span></div>}>
                {special && <>this is <Inv>your</Inv> record</>}
                {!special && <>2 days ago</>}

            </Titled>
            <Titled className={"text-right -ml-1 bg-white p-2 text-puzzle"} title={<Inv>{score.toLocaleString('en-US')}</Inv>}>
                points
            </Titled>
            {/* <Titled className={""} title={<FlagComponent className="x-hue-rotate-90 border-2 border-black/20 w-[1.5em] xring-2 ring-black/20" />}>
                &nbsp;
            </Titled> */}

        </div >
    )
}

export function PageRating({ shown, onBack, onClose }) {
    const online = useOnline();
    const [show, setShow] = useState(false);

    return (
        <ModalContent>

            <SubContent className={"m-3 p-1 gap-1 bg-puzzle/20"}>
                <RankRecord special={true} rank={56} name={"GreenHouse"} hash={"def5"} country={"RU"} score={123456}
                    onClick={() => startTransition(() => setShow(!show))} />
            </SubContent>

            <SubHeader>TOP Players</SubHeader>
            <SubContent className={"m-3 p-1 gap-1 bg-puzzle/20"}>
                {online.scores?.map((record, index) => (
                    <RankRecord
                        special={online.uid === record.uid}
                        rank={index + 1} name={record.name}
                        score={record.score}
                        hash={record.uid.substr(0, 4)}
                        country={record.country} />
                ))}
                {online.scores?.map((record, index) => (
                    <RankRecord
                        special={online.uid === record.uid}
                        rank={index + 3} name={record.name}
                        score={record.score}
                        hash={record.uid.substr(0, 4)}
                        country={record.country} />
                ))}

                {online.scores?.map((record, index) => (
                    <RankRecord
                        special={online.uid === record.uid}
                        rank={index + 1} name={record.name}
                        score={record.score}
                        hash={record.uid.substr(0, 4)}
                        country={record.country} />
                ))}
                {online.scores?.map((record, index) => (
                    <RankRecord
                        special={online.uid === record.uid}
                        rank={index + 3} name={record.name}
                        score={record.score}
                        hash={record.uid.substr(0, 4)}
                        country={record.country} />
                ))}
                {online.scores?.map((record, index) => (
                    <RankRecord
                        special={online.uid === record.uid}
                        rank={index + 1} name={record.name}
                        score={record.score}
                        hash={record.uid.substr(0, 4)}
                        country={record.country} />
                ))}
                {online.scores?.map((record, index) => (
                    <RankRecord
                        special={online.uid === record.uid}
                        rank={index + 3} name={record.name}
                        score={record.score}
                        hash={record.uid.substr(0, 4)}
                        country={record.country} />
                ))}

            </SubContent>
        </ModalContent>);
}