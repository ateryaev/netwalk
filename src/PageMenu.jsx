import { use, useEffect, useMemo, useState } from "react";
import { BaseButton, CheckBox, DetailedButton, MenuButton, PinkButton, RoundButton, SvgBell, SvgRestart } from "./components/Button";
import Modal, { SubHeader, SubContent } from "./components/Modal";
import { Blink, Frame, Inv, LabelNew, LabelPlay, LabeNow, Titled } from "./components/UI";
import { cn } from "./utils/cn";
import { GAME_MODE_BORDERED, GAME_MODE_EMPTIES, GAME_MODE_EMPTIES_NAMES, GAME_MODE_SCORE, GAME_MODE_TO_UNLOCK, GAME_MODES } from "./game/gameconstants";
import { useGame } from "./GameContext";
import { SvgCheck, SvgClose, SvgLoad, SvgRates, SvgUnCheck } from "./components/Svg";
import { useOnline } from "./OnlineContext";
import { usePageHistory } from "./components/PageHistory";

function ModeButton({ mode, points, emptyTo, toUnlock, bordered, ...props }) {
    const { current } = useGame();
    let subtitle = null;
    if (toUnlock > 100) subtitle = "play more to unlock"
    else if (toUnlock > 0) subtitle = <>solve <Inv>{toUnlock}</Inv> more to unlock</>
    else subtitle = <>{(bordered ? "bordered" : "looped")} <Inv>{GAME_MODE_EMPTIES_NAMES[mode]}</Inv> empties</>;

    return (<DetailedButton
        className={cn("bg-gray-50 disabled:bg-white active:bg-ipuzzle/10 focus:bg-ipuzzle/10",)}
        special={mode === current.mode + 100}
        disabled={toUnlock > 0}
        subtitle={subtitle}
        value={points > 0 && points.toLocaleString('en-US')}
        subvalue={points === 0 ? (toUnlock <= 0 ? <Blink><Inv>new</Inv></Blink> : "locked") : "points"}
        {...props}>
        {GAME_MODES[mode]}
        {mode === current.mode && <LabeNow />}
    </DetailedButton >)
}

export function PageMenu({ onModeSelect, onLeaderboard }) {
    const online = useOnline();
    const { settings, getLevelsSolved, updateSettings, current } = useGame();
    const { currentPage } = usePageHistory();

    useEffect(() => {
        const PAGE_MENU = "Menu";
        if (currentPage !== PAGE_MENU) return;
        const to = setTimeout(() => {
            const modalscroller = document.querySelector(".modalscroller");
            if (modalscroller) modalscroller.scrollTop = 0;
        }, 100);
        return () => clearTimeout(to);

    }, [currentPage]);
    return (
        <>
            <SubHeader>game modes</SubHeader>
            <SubContent className={"bg-gray-50"}>
                <Frame>
                    {GAME_MODES.map((modeName, index) => (
                        <ModeButton key={index}
                            toUnlock={GAME_MODE_TO_UNLOCK(index, getLevelsSolved(index - 1))}
                            mode={index}
                            points={GAME_MODE_SCORE(index, getLevelsSolved(index))}
                            emptyTo={GAME_MODE_EMPTIES[index]}
                            bordered={GAME_MODE_BORDERED[index]}
                            onClick={() => onModeSelect?.(index)}
                        />
                    ))}
                </Frame>

                <Frame className={!online.isOnline ? "animate-pulse" : ""}>
                    <MenuButton
                        className={cn("bg-ipuzzle/20 text-ipuzzle active:bg-ipuzzle/10 focus:bg-ipuzzle/10")}
                        disabled={!online.isOnline}
                        onClick={() => { onLeaderboard(); }} >
                        <Titled title={"Leaderboard"}>
                            {online.isOnline && "check your global rank"}
                            {!online.isOnline && "connecting"}
                        </Titled>
                    </MenuButton>
                </Frame>
            </SubContent>

            <SubHeader>settings</SubHeader>

            <SubContent>

                <Frame className={"ring-puzzle/40"}>

                    <DetailedButton onClick={() => updateSettings({ sound: !settings.sound })}
                        subtitle={"responsive cues"}
                        icon={<CheckBox checked={settings.sound} />}
                    >SOUND</DetailedButton>

                    <DetailedButton
                        className={cn(!settings.music && "opacity-80")}
                        onClick={() => updateSettings({ music: !settings.music })}
                        icon={<CheckBox checked={settings.music} />}
                        subvalue={""}
                        subtitle={"mood-enhancing background"}
                    > music</DetailedButton>

                    <DetailedButton onClick={() => updateSettings({ vibro: !settings.vibro })}
                        icon={<CheckBox checked={settings.vibro} />}
                        subvalue={""}
                        subtitle={"tactile feedback"}
                    >vibrations</DetailedButton>
                </Frame>
            </SubContent>

            <SubHeader>about</SubHeader>

            <SubContent>
                <Frame className="ring-gray-200 p-3">
                    <p className="p-1 text-[90%] uppercase text-gray-700">
                        Rotate the tiles to connect each core with paths of the same color.
                        All links must form complete networks — no open ends.
                        When every core is connected, the puzzle is solved.
                        <br /><br />
                        Use simple logic, stay focused, and find the flow.
                    </p>

                </Frame>
                <Frame className="ring-gray-200 p-3 bg-gray-50">
                    <p className="  text-gray-700 text-center">
                        Android App Version: {window.androidVersionName || "NA"}
                        <br />
                        <a target="_blank" href="https://github.com/ateryaev/netwalk" className="text-blue-600 underline">
                            https://github.com/ateryaev/netwalk
                        </a>
                    </p>
                </Frame>
            </SubContent>
            <SubHeader className="">
                <div className="flex-1">Anton Teryaev</div> 2025
            </SubHeader>
        </ >

    );
}
