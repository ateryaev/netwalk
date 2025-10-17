import { DetailedButton } from "./components/Button";
import Modal from "./components/Modal";
import { useGame } from "./GameContext";
import { cn } from "./utils/cn";

export function PageSettings({ shown, onBack, onClose }) {
    const { settings, updateSettings } = useGame();

    return (
        <Modal shown={shown} title={"Settings"} onBack={onBack} onClose={onClose}>
            <div className='flex flex-col gap-0 items-stretch p-2'>
                <DetailedButton onClick={() => updateSettings({ sound: !settings.sound })}
                    value={settings.sound ? "ON" : "OFF"}
                    subvalue={""}
                    subtitle={"responsive cues"}
                >SOUND</DetailedButton>

                <DetailedButton onClick={() => updateSettings({ music: !settings.music })}
                    value={settings.music ? "ON" : "OFF"}
                    subvalue={""}
                    subtitle={"mood-enhancing background"}
                > music</DetailedButton>

                <DetailedButton onClick={() => updateSettings({ vibro: !settings.vibro })}
                    value={settings.vibro ? "ON" : "OFF"}
                    subvalue={""}
                    subtitle={"tactile feedback"}
                >vibrations</DetailedButton>
                <div className="p-4 gap-2 text-darkpuzzle uppercase items-stretch flex flex-col">
                    Player name
                    <input type="text"
                        spellCheck="false"
                        autoCorrect="false"
                        //onChange={(e) => console.log("CHNA", e.currentTarget.value)}
                        onChange={(e) => updateSettings({ name: e.currentTarget.value })}
                        placeholder="shown in leaderboard"
                        defaultValue={settings.name}
                        className={cn("p-2 outline-none bg-[#fff] rounded-sm border-4 -m-1 border-puzzle flex-col gap-0 items-stretch")} />
                </div>
            </div>
        </Modal >);
}