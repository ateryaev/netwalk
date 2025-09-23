import { PinkButton, SvgNext, SvgRestart } from "./Button";

export function GameOverBar({ onNext, onRestart, ...props }) {
    return (
        <>
            <div className="flex-1 text-white uppercase text-ellipsis whitespace-nowrap overflow-hidden">level solved</div>
            <PinkButton Svg={SvgRestart} onClick={onRestart}>restart</PinkButton>
            <PinkButton Svg={SvgNext} onClick={onNext}>next</PinkButton>
        </>
    )
}