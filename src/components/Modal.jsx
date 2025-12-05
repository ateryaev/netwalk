import { useEffect, useRef, useState, ViewTransition } from 'react';
import { BaseButton, MainButton, MenuButton, PinkButton, RoundButton, TabButton } from './Button';
import { cn } from '../utils/cn';
import { preBeepButton } from '../utils/beep';
import { BigTitled, Inv, Titled } from './UI';
import { SvgClose, SvgBack } from './Svg';

//starting:text-gray-600/5 transition-all duration-1000
export function SubHeader({ className, children }) {
    return (<div
        className={cn('uppercase text-gray-600 mx-0 px-4 py-2.5 sticky top-0 z-10 flex',
            //'starting:text-gray-600/20  starting:translate-x-2 transition-all',
            ' bg-gray-100 hue-rotate-180', className)}>
        {children}
    </div>)
}

export function SubContent({ className, children }) {
    return (<div className={cn('flex flex-col bg-white mx-0 p-0',
        //'starting:translate-x-2 starting:opacity-20  transition-all',
        className)}>
        {children}
    </div>)
}

export function ModalContent({ className, children }) {
    return (<div
        className={cn('flex-1 overflow-y-auto overflow-x-hidden w-full flex items-stretch flex-col')}>
        {children}
    </div>)
}


const Modal = ({ shown, onBack, onClose, title, subtitle, children, reversed }) => {
    const dialogRef = useRef(null);

    const [dialogState, setDialogState] = useState(0); //0-hidden, 1-showing, 2-hidding

    useEffect(() => {
        if (shown) {
            dialogRef.current?.showModal();
            setDialogState(1);
        } else {
            setDialogState(2);
            window.setTimeout(() => { dialogRef.current?.close(); }, 300);
            //console.log("dialogRef.current", dialogRef.current.open)
        }
    }, [shown]);

    function handleCancel(e) {
        e.preventDefault();
        (onClose && onClose());
        (!onClose && onBack && onBack());
    }

    function handleBackdropClick(e) {
        if (e.target === dialogRef.current) {
            handleCancel(e)
        }
    }
    //if (!reallyShown && !shown) return null;
    //if (!shown && !dialogRef.current?.open) return null;
    return (
        <dialog ref={dialogRef} onCancel={handleCancel}
            onClick={handleBackdropClick}
            onPointerDown={(e) => e.target === dialogRef.current && preBeepButton()}
            className={cn("starting:backdrop:bg-black/0 backdrop:bg-black/50 z-10 bg-white/0 min-w-svw  min-h-svh max-h-svh",
                !shown && "backdrop:bg-black/0",
                "grid justify-center items-center overflow-hidden not-open:hidden"
            )}>

            <div className={cn("h-[90svh] max-w-[90svw]  w-xl  transition-all outline-none bg-white flex flex-col",
                "rounded-xs overflow-hidden border-b-8 border-gray-100 ring-4 ring-black/10 origin-center",
                !shown && "opacity-0 scale-y-75 xxscale-95",
                "starting:opacity-0 starting:scale-y-75  xxxstarting:scale-110",
                shown && "opacity-100 translate-0 scale-100"
            )}
                tabIndex={0}>
                <div className="flex items-center gap-2 text-white z-10 bg-puzzle
                justify-center p-4  pt-5 text-left ">

                    <BigTitled title={title}
                        className={cn("flex-1 text-left")}>
                        <div key={subtitle}
                            className={cn("transition-all",
                                "starting:opacity-50 starting:scale-y-0 ",
                                //subtitle.includes("Welcome") && "starting:-translate-x-2"
                            )}>
                            {subtitle}
                        </div>
                    </BigTitled>

                    {onBack && <RoundButton className={cn("bg-white/10 text-white", "starting:text-white/50 starting:-rotate-180 transition-all")} onClick={onBack}><SvgBack /></RoundButton>}
                    {onClose && <RoundButton className={cn("bg-white/10 text-white", "starting:text-white/50 starting:rotate-180 transition-all")} onClick={onClose}><SvgClose /></RoundButton>}

                </div>

                <div
                    key={subtitle}
                    className={cn('origin-right flex-1 flex flex-col overflow-x-hidden w-full overflow-y-auto items-stretch',
                        // 'starting:scale-x-95 starting:opacity-20 xduration-1000 transition-all',
                        // subtitle.includes("Welcome") && "starting:scale-x-100 starting:-translate-x-10"
                        'starting:translate-x-10 starting:opacity-20 xduration-1000 transition-all',
                        subtitle.includes("Welcome") && "starting:scale-x-100 starting:-translate-x-10"
                    )}>
                    {children}
                </div>
                {/* <div className='h-2 bg-puzzle'>
                </div> */}
            </div>
        </dialog >
    );
};

export default Modal;