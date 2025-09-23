import { COLOR } from "../utils/cfg";
import { cn } from "../utils/cn";
import { isMix, isOff, isOn } from "../utils/gamedata";

export function GameSubHeader({ counters, onClickColor, ...props }) {
    return (


        <>
            {Object.keys(counters).reverse().map((color) => (
                <div key={color}
                    onClick={() => { onClickColor(color * 1) }}
                    className={
                        cn('min-w-6 p-2 saturate-150 transition-all rounded-full flex items-center',
                            (counters[color] === 0 && isMix(color)) && "min-w-0 -ms-6 opacity-10",
                            (counters[color] === 0 && isOff(color)) && "min-w-0 -me-6 opacity-10"
                        )}
                    style={{ flex: counters[color], background: COLOR(color * 1) }}
                >
                    {isOn(color) &&
                        <div className="w-2 rounded-full aspect-square bg-[#fff]/90"></div>}

                </div>
            ))}

        </>
    )
}