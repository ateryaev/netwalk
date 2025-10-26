import { use, useEffect, useMemo, useState } from "react";
import { BaseButton, CheckBox, DetailedButton, PinkButton, RoundButton, SvgBell, SvgRestart } from "./components/Button";
import Modal, { SubContent, SubHeader } from "./components/Modal";
import { Blink, Inv, LabelNew, LabelPlay } from "./components/UI";
import { cn } from "./utils/cn";
import { GAME_MODE_BORDERED, GAME_MODE_EMPTIES, GAME_MODE_SCORE, GAME_MODE_TO_UNLOCK, GAME_MODES } from "./game/gameconstants";
import { GetAvailableModes, GetLevelsSolved, GetTotalScores } from "./game/gamestats";
import { useGame } from "./GameContext";
import { SvgCheck, SvgClose, SvgRates, SvgUnCheck } from "./components/Svg";

export function PageMenu({ shown, modePlaying, onBack, onAbout, onSettings, onModes, onModeSelect, onRating }) {
    const { settings, getLevelsSolved, updateSettings } = useGame();

    const totalScore = useMemo(() => {
        return GAME_MODES.reduce((total, _, mode) =>
            total + GAME_MODE_SCORE(mode, getLevelsSolved(mode)), 0);
    }, [getLevelsSolved]);

    //use: GAME_MODE_AVAILABLE, getLevelsSolved, implement: availableModes
    const availableModes = useMemo(() => {
        let modes = 1;
        for (let mode = 1; mode < GAME_MODES.length; mode++) {
            if (GAME_MODE_TO_UNLOCK(mode, getLevelsSolved(mode - 1)) === 0) modes++;
            else break;
        }
        return modes;
    }, [getLevelsSolved]);


    const selected = -1;
    function ModeButton({ mode, points, emptyFrom, emptyTo, toUnlock, bordered, ...props }) {
        let subtitle = null;
        if (toUnlock > 100) subtitle = "play more to unlock"
        else if (toUnlock > 0) subtitle = <>solve <Inv>{toUnlock}</Inv> more to unlock</>
        else subtitle = <>{(bordered ? "bordered" : "looped")} <Inv>{emptyFrom}-{emptyTo}%</Inv> empty</>;

        return (<DetailedButton
            special={mode === modePlaying}
            className={cn(selected === mode && "bg-puzzle/100 xring-2 ring-puzzle rounded-xs"
            )}
            disabled={toUnlock > 0}
            subtitle={subtitle}
            //value={points > 0 && points.toLocaleString('en-US') || toUnlock <= 0 && <LabelNew />}
            value={points > 0 && points.toLocaleString('en-US')}
            subvalue={points === 0 ? (toUnlock <= 0 ? <Blink><Inv>new</Inv></Blink> : "locked") : "points"}
            //subvalue={points === 0 ? (toUnlock <= 0 ? "" : "locked") : "points"}
            {...props}>
            {GAME_MODES[mode]}
        </DetailedButton>)
    }

    return (
        <Modal shown={shown} title={"Netwalk"} subtitle={"relax no stress"} onClose={onBack}>
            {/* <div className='uppercase bg-puzzle flex items-center gap-4 justify-between   text-white p-6 py-4 text-rightx'>
                NETWALK
                <RoundButton onClick={null}><SvgClose /></RoundButton>
            </div> */}

            <SubHeader>game modes</SubHeader>
            <SubContent>
                {/* <SubHeader>choose game mode to play</SubHeader> */}
                {GAME_MODES.map((modeName, index) => (
                    <ModeButton key={index}
                        toUnlock={GAME_MODE_TO_UNLOCK(index, getLevelsSolved(index - 1))}
                        mode={index}
                        //points={GAME_MODE_SCORE(index, GetLevelsSolved(index))}
                        points={GAME_MODE_SCORE(index, getLevelsSolved(index))}
                        emptyFrom={GAME_MODE_EMPTIES[index][0]}
                        emptyTo={GAME_MODE_EMPTIES[index][1]}
                        bordered={GAME_MODE_BORDERED[index]}
                        onClick={() => onModeSelect?.(index)}
                    />


                ))}

            </SubContent>



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

                <DetailedButton onClick={() => updateSettings({ vibro: !settings.vibro })}
                    value={"BlackShark"}
                    subvalue={""}
                    subtitle={"visible in leaderboard"}
                >nickname</DetailedButton>
            </SubContent>


            <SubHeader>
                about
            </SubHeader>
            <SubContent>


                <p className="p-6">

                    Test modal content about the game.
                    <br />
                    <br />
                    More text to test scrolling behavior. More text to test scrolling behavior. More text to test scrolling behavior. More text to test scrolling behavior. More text to test scrolling behavior. More text to test scrolling behavior. More text to test scrolling behavior. More text to test scrolling behavior.
                    <br /><br />
                </p>
                <hr className="text-puzzle-200" />
                <p className="p-6 ">
                    Created by Anton in 2025.
                </p>

            </SubContent>

        </Modal>
    );
}



// export function PageModes({ shown, onModeSelect, onBack, onClose, selected, playingMode, ...props }) {
//     const { getLevelsSolved } = useGame();

//     function ModeButton({ mode, points, emptyFrom, emptyTo, toUnlock, bordered, ...props }) {
//         let subtitle = null;
//         if (toUnlock > 100) subtitle = "play more to unlock"
//         else if (toUnlock > 0) subtitle = <>solve <Inv>{toUnlock}</Inv> more to unlock</>
//         else subtitle = <>{(bordered ? "bordered" : "looped")} <Inv>{emptyFrom}-{emptyTo}%</Inv> empty</>;

//         return (<DetailedButton
//             className={cn(selected === mode && "bg-puzzle/10 xring-2 ring-puzzle rounded-xs",
//                 mode === playingMode && "border-l-8 -ml-2 border-puzzle/30"
//             )}
//             disabled={toUnlock > 0}
//             subtitle={subtitle}
//             //value={points > 0 && points.toLocaleString('en-US') || toUnlock <= 0 && <LabelNew />}
//             value={points > 0 && points.toLocaleString('en-US')}
//             subvalue={points === 0 ? (toUnlock <= 0 ? <Blink><Inv>new</Inv></Blink> : "locked") : "points"}
//             //subvalue={points === 0 ? (toUnlock <= 0 ? "" : "locked") : "points"}
//             {...props}>
//             {GAME_MODES[mode]}
//         </DetailedButton>)
//     }

//     return (
//         <Modal shown={shown} title={"Netwalk"} subtitle={"choose game mode"} onBack={onBack} onClose={onClose}>
//             <div className='p-2 flex flex-col gap-0 items-stretch'>
//                 {GAME_MODES.map((modeName, index) => (
//                     <ModeButton key={index}
//                         toUnlock={GAME_MODE_TO_UNLOCK(index, getLevelsSolved(index - 1))}
//                         mode={index}
//                         //points={GAME_MODE_SCORE(index, GetLevelsSolved(index))}
//                         points={GAME_MODE_SCORE(index, getLevelsSolved(index))}
//                         emptyFrom={GAME_MODE_EMPTIES[index][0]}
//                         emptyTo={GAME_MODE_EMPTIES[index][1]}
//                         bordered={GAME_MODE_BORDERED[index]}
//                         onClick={() => onModeSelect?.(index)}
//                     />))}

//             </div>
//         </Modal >
//     );
// }

