import { use, useEffect, useMemo, useState } from "react";
import { BaseButton, CheckBox, DetailedButton, MenuButton, PinkButton, RoundButton, SvgBell, SvgRestart } from "./components/Button";
import Modal, { ModalContent, SubHeader, SubContent } from "./components/Modal";
import { Blink, Inv, LabelNew, LabelPlay, Titled } from "./components/UI";
import { cn } from "./utils/cn";
import { GAME_MODE_BORDERED, GAME_MODE_EMPTIES, GAME_MODE_SCORE, GAME_MODE_TO_UNLOCK, GAME_MODES } from "./game/gameconstants";
import { useGame } from "./GameContext";
import { SvgCheck, SvgClose, SvgLoad, SvgRates, SvgUnCheck } from "./components/Svg";
import { useOnline } from "./OnlineContext";

export function PageMenu({ onModeSelect, onLeaderboard }) {
    const online = useOnline();
    const { settings, getLevelsSolved, totalScore, updateSettings, current } = useGame();

    function ModeButton({ mode, points, emptyFrom, emptyTo, toUnlock, bordered, ...props }) {
        let subtitle = null;
        if (toUnlock > 100) subtitle = "play more to unlock"
        else if (toUnlock > 0) subtitle = <>solve <Inv>{toUnlock}</Inv> more to unlock</>
        else subtitle = <>{(bordered ? "bordered" : "looped")} <Inv>{emptyFrom}-{emptyTo}%</Inv> empty</>;

        return (<DetailedButton
            special={mode === current.mode}
            disabled={toUnlock > 0}
            subtitle={subtitle}
            value={points > 0 && points.toLocaleString('en-US')}
            subvalue={points === 0 ? (toUnlock <= 0 ? <Blink><Inv>new</Inv></Blink> : "locked") : "points"}
            {...props}>
            {GAME_MODES[mode]}
        </DetailedButton >)
    }

    return (
        <ModalContent>
            <SubHeader>game modes</SubHeader>

            <SubContent>
                {GAME_MODES.map((modeName, index) => (
                    <ModeButton key={index}
                        toUnlock={GAME_MODE_TO_UNLOCK(index, getLevelsSolved(index - 1))}
                        mode={index}
                        points={GAME_MODE_SCORE(index, getLevelsSolved(index))}
                        emptyFrom={GAME_MODE_EMPTIES[index][0]}
                        emptyTo={GAME_MODE_EMPTIES[index][1]}
                        bordered={GAME_MODE_BORDERED[index]}
                        onClick={() => onModeSelect?.(index)}
                    />
                ))}
                {/* <SubHeader>online player rank</SubHeader> */}
                {/* <DetailedButton onClick={() => { onLeaderboard(); }}
                    className={"bg-puzzle xhue-rotate-90 text-white"}
                    subtitle={"check your global rank"}
                    value={totalScore.toLocaleString("us")}
                    subvalue={"total"} >
                    Leaderboard</DetailedButton> */}

                <MenuButton
                    className={cn("bg-puzzle-50 border-4 rounded-lg m-4 my-2 border-puzzle hue-rotate-180 p-2 text-darkpuzzle",
                        ""
                    )}
                    disabled={!online.isOnline}
                    onClick={() => { onLeaderboard(); }} >
                    <Titled title={"Leaderboard"}>
                        {online.isOnline && "check your global rank"}
                        {!online.isOnline && <SvgLoad />}
                    </Titled>
                </MenuButton>

                {/* <DetailedButton onClick={() => { onLeaderboard(); }}
                    className={"bg-puzzle xhue-rotate-90 text-white"}
                    subtitle={"check your global rank"}
                >
                    Leaderboard</DetailedButton> */}

            </SubContent>

            {/* 
            <SubContent>
                <DetailedButton onClick={() => updateSettings({ sound: !settings.sound })}
                    subtitle={"Your public leaderboard name"}
                    icon={<CheckBox checked={settings.sound} />}
                >SuperMan</DetailedButton>
                <DetailedButton onClick={() => { onLeaderboard(); }}
                    subtitle={"compete global rankings"}
                    value={"#21"}
                    subvalue={""} >
                    Leaderboard</DetailedButton>
            </SubContent> */}
            <SubHeader>settings</SubHeader>

            <SubContent>

                <DetailedButton onClick={() => updateSettings({ sound: !settings.sound })}
                    subtitle={"responsive cues"}
                    icon={<CheckBox checked={settings.sound} />}
                >SOUND</DetailedButton>

                <DetailedButton onClick={() => updateSettings({ music: !settings.music })}
                    icon={<CheckBox checked={settings.music} />}
                    subvalue={""}
                    subtitle={"mood-enhancing background"}
                > music</DetailedButton>

                <DetailedButton onClick={() => updateSettings({ vibro: !settings.vibro })}
                    icon={<CheckBox checked={settings.vibro} />}
                    subvalue={""}
                    subtitle={"tactile feedback"}
                >vibrations</DetailedButton>

                {/* <DetailedButton onClick={() => updateSettings({ vibro: !settings.vibro })}
                    value={"BlackShark"}
                    subvalue={""}
                    subtitle={"visible in leaderboard"}
                >nickname</DetailedButton> */}
            </SubContent>

            <SubHeader>about</SubHeader>

            <SubContent>
                <p className="p-4 text-[90%] uppercase text-gray-700">
                    Rotate the tiles to connect each core with paths of the same color.
                    All links must form complete networks — no open ends.
                    When every core is connected, the puzzle is solved.
                    <br /><br />
                    Use simple logic, stay focused, and find the flow.
                    <br />
                </p>
            </SubContent>
            <SubHeader className="">
                <div className="flex-1">Anton Teryaev</div> 2025
            </SubHeader>
        </ModalContent >

    );
}
